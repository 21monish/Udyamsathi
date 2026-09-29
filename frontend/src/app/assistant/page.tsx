'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { SchemeRecommendation } from '@/types';
import { formatCurrency } from '@/lib/utils';
import {
  Bot,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Calculator,
  Building2,
  FileText,
  User,
  BadgePercent,
  Clock,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  extracted?: Record<string, any>;
  eligibleSchemes?: SchemeRecommendation[];
  timestamp: string;
}

const SAMPLE_PROMPTS = [
  'I need a concessional education loan for my B.Tech engineering degree',
  'I want to set up a retail grocery store with 3 lakh loan under NSFDC',
  'I am a woman entrepreneur looking for 1.5 lakh loan for a tailoring enterprise',
  'Need loan for buying dairy cows and equipment with government subsidy',
  'I need a micro credit loan of 50,000 for a small vegetable vending business',
];

export default function AssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Hello! I am UdyamSathi, your statutory government credit counselor (SIH26092).\n\nTell me about your business goal, education plan, or required loan amount, and I will evaluate your profile against all verified NSFDC, MUDRA, and PMEGP schemes with zero hallucinations.',
      timestamp: 'Just now',
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  // Active cognitive HUD data from last AI interaction
  const [activeDossier, setActiveDossier] = useState<Record<string, any> | null>(null);
  const [activeSchemes, setActiveSchemes] = useState<SchemeRecommendation[]>([]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Voice Recognition (Speech-to-Text)
  const toggleListening = () => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-IN';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      console.warn('Speech error:', e);
      setIsListening(false);
    }
  };

  // Text-to-Speech (Audio Voice Readout)
  const speakText = (msgId: string, text: string, lang = 'en') => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (speakingId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.replace(/[*#•]/g, ''));
    utterance.rate = 0.95;

    if (lang === 'hi' || text.match(/[\u0900-\u097F]/)) {
      utterance.lang = 'hi-IN';
    } else if (lang === 'gu' || text.match(/[\u0A80-\u0AFF]/)) {
      utterance.lang = 'gu-IN';
    } else {
      utterance.lang = 'en-IN';
    }

    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    setSpeakingId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/assistant/chat', { message: textToSend });
      const { reply, extracted_parameters, assessment } = res.data;

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: reply,
        extracted: extracted_parameters,
        eligibleSchemes: assessment?.eligible_schemes || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
      if (extracted_parameters) setActiveDossier(extracted_parameters);
      if (assessment?.eligible_schemes) setActiveSchemes(assessment.eligible_schemes);
    } catch (err) {
      console.error('Assistant error:', err);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: 'I could not connect to the server right now. However, you can use our direct Scheme Explorer or Eligibility Form.',
        timestamp: 'Now',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome-new',
        sender: 'assistant',
        text: 'Conversation reset. How can I assist your enterprise loan discovery today?',
        timestamp: 'Just now',
      },
    ]);
    setActiveDossier(null);
    setActiveSchemes([]);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setSpeakingId(null);
  };

  return (
    <div className="bg-[#f8faf7] min-h-screen py-8">
      {/* 90% Expansive Container */}
      <div className="w-[90%] max-w-[1700px] mx-auto space-y-6">
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3.5 py-1 text-xs font-bold text-emerald-900 mb-2">
              <Bot className="h-4 w-4 text-[#0d5c4e]" />
              <span>AI STATUTORY COUNSELOR (SIH26092)</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              AI Scheme Matcher & Voice Guidance
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-3xl">
              Natural language understanding powered by Google Gemini, grounded strictly in verified NSFDC, MUDRA,
              and PMEGP statutory rules. English voice input and audio readout supported.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Voice Input Language Badge */}
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 font-semibold shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Voice & Audio: English</span>
            </div>

            <button
              onClick={handleClearChat}
              className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold transition"
              title="Reset conversation"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* 2-Column Split: Chat on Left (7 cols), Cognitive HUD on Right (5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Panel: Chat Interface (7 Cols on LG, 8 on XL) */}
          <div className="lg:col-span-7 xl:col-span-8 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col h-[700px] overflow-hidden">
            {/* Quick Sample Prompts Bar */}
            <div className="bg-slate-50/90 border-b border-slate-100 p-3.5 overflow-x-auto">
              <div className="flex items-center gap-2 min-w-max">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 shrink-0 flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-[#0d5c4e]" /> Suggested:
                </span>
                {SAMPLE_PROMPTS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSend(p)}
                    className="px-3 py-1 rounded-full bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-700 text-xs transition truncate max-w-[280px]"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Stream Area */}
            <div className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-5">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-1.5 mb-1 text-[11px] text-slate-400 font-medium px-1">
                    {msg.sender === 'user' ? (
                      <span>You &bull; {msg.timestamp}</span>
                    ) : (
                      <span className="flex items-center gap-1 text-[#0d5c4e] font-bold">
                        <Bot className="h-3 w-3" /> UdyamSathi Counselor &bull; {msg.timestamp}
                      </span>
                    )}
                  </div>

                  <div
                    className={`max-w-[88%] rounded-3xl p-4 sm:p-5 text-xs sm:text-sm leading-relaxed shadow-sm ${
                      msg.sender === 'user'
                        ? 'bg-[#0d5c4e] text-white rounded-tr-none'
                        : 'bg-slate-50 text-slate-900 rounded-tl-none border border-slate-200'
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.text}</p>

                    {/* Audio Speaker readout button for AI replies */}
                    {msg.sender === 'assistant' && (
                      <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
                        <span className="text-[11px] text-slate-400">Audio playback for low-literacy guidance</span>
                        <button
                          type="button"
                          onClick={() => speakText(msg.id, msg.text, msg.extracted?.language)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                            speakingId === msg.id
                              ? 'bg-emerald-600 text-white animate-pulse'
                              : 'bg-white hover:bg-emerald-50 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {speakingId === msg.id ? (
                            <>
                              <VolumeX className="h-3.5 w-3.5" /> Stop Voice
                            </>
                          ) : (
                            <>
                              <Volume2 className="h-3.5 w-3.5 text-[#0d5c4e]" /> Listen Audio
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Inline Matched Scheme Badges if present */}
                  {msg.eligibleSchemes && msg.eligibleSchemes.length > 0 && (
                    <div className="max-w-[88%] mt-2.5 space-y-2 w-full">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">
                        Verified Government Scheme Matches ({msg.eligibleSchemes.length}):
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {msg.eligibleSchemes.slice(0, 2).map((s) => (
                          <div
                            key={s.scheme_id}
                            className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-3 text-xs flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex items-center justify-between gap-1 mb-1">
                                <span className="font-bold text-slate-900 truncate">{s.scheme_name}</span>
                                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-200/60 px-1.5 py-0.5 rounded shrink-0">
                                  {s.interest_rate}% p.a.
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-600">
                                Max Loan: {formatCurrency(s.max_loan)}
                                {s.female_rebate_applied && ' • 0.5% Female rebate applied'}
                              </p>
                            </div>
                            <div className="mt-2.5 pt-2 border-t border-emerald-200/60 flex items-center justify-between">
                              <Link
                                href={`/calculator?principal=${s.max_loan}&rate=${s.interest_rate}&tenure=${s.max_tenure}`}
                                className="text-[11px] font-bold text-[#0d5c4e] hover:underline flex items-center gap-1"
                              >
                                <Calculator className="h-3 w-3" /> Calculate EMI
                              </Link>
                              <Link
                                href={`/schemes/${s.scheme_id}`}
                                className="text-[11px] font-bold text-slate-700 hover:text-black"
                              >
                                Details &rarr;
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex items-start gap-2">
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-none p-4 text-xs text-slate-600 flex items-center gap-2.5 shadow-sm">
                    <div className="h-4 w-4 rounded-full border-2 border-[#0d5c4e] border-t-transparent animate-spin" />
                    <span>Evaluating natural language intent against 27 statutory welfare rules...</span>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Input & Voice Controls Bar */}
            <div className="p-4 border-t border-slate-100 bg-white">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2 sm:gap-3"
              >
                {/* Voice Input Button */}
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`p-3 rounded-2xl border transition shadow-sm ${
                    isListening
                      ? 'bg-rose-600 border-rose-600 text-white animate-pulse'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                  title={isListening ? 'Listening... click to stop' : 'Click to speak (Voice Recognition)'}
                >
                  {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5 text-[#0d5c4e]" />}
                </button>

                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask your loan query in English (e.g. 'I need 2 lakh loan for garment shop')..."
                  className="flex-1 px-4 py-3 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0d5c4e] bg-slate-50 focus:bg-white transition"
                />

                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="px-5 py-3 bg-[#0d5c4e] hover:bg-[#094237] disabled:opacity-50 text-white font-bold rounded-2xl text-xs sm:text-sm transition flex items-center gap-1.5 shadow-md shrink-0"
                >
                  <span>Send</span>
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>

          {/* Right Panel: Cognitive HUD & Real-Time Dossier (5 Cols on LG, 4 on XL) */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-5">
            {/* Extracted Intent Dossier Card */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Extracted Applicant Dossier</h3>
                    <p className="text-[10px] text-slate-400">Parameters parsed from conversational input</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Live Sync
                </span>
              </div>

              {activeDossier && activeDossier.is_loan_query ? (
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Loan Purpose</span>
                    <strong className="text-slate-800 capitalize">
                      {activeDossier.purpose?.replace('_', ' ') || 'Micro Enterprise'}
                    </strong>
                  </div>

                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Requested Amount</span>
                    <strong className="text-[#0d5c4e] font-black text-sm">
                      {formatCurrency(activeDossier.loan_amount || 125000)}
                    </strong>
                  </div>

                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Social Category</span>
                    <strong className="text-slate-800">{activeDossier.category || 'SC (NSFDC Primary)'}</strong>
                  </div>

                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Beneficiary Gender</span>
                    <span className="inline-flex items-center gap-1 font-bold text-slate-800 capitalize">
                      {activeDossier.gender || 'Female'}
                      {activeDossier.gender === 'female' && (
                        <span className="text-[9px] bg-purple-100 text-purple-800 px-1.5 py-0.2 rounded">
                          0.5% Rebate
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Detected Language</span>
                    <strong className="text-slate-800 uppercase">{activeDossier.language || 'EN'}</strong>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-slate-400 space-y-1">
                  <p>No active session parameters yet.</p>
                  <p className="text-[11px]">Type or speak your loan need to populate the dossier.</p>
                </div>
              )}
            </div>

            {/* Top Matched Scheme Card */}
            {activeSchemes.length > 0 && (
              <div className="bg-gradient-to-br from-[#0c2f28] to-[#0d5c4e] text-white rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-wider text-[#f4cf70] font-black">
                    PRIMARY STATUTORY MATCH
                  </span>
                  <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full text-white font-semibold">
                    100% Deterministic
                  </span>
                </div>

                <div>
                  <h4 className="text-lg font-extrabold text-white">{activeSchemes[0].scheme_name}</h4>
                  <p className="text-xs text-emerald-100 mt-1 line-clamp-2">{activeSchemes[0].description}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs border-t border-white/20 pt-3">
                  <div>
                    <span className="text-emerald-200 text-[10px] block">Interest to Applicant</span>
                    <span className="text-base font-black text-[#f4cf70]">
                      {activeSchemes[0].interest_rate}% p.a.
                    </span>
                  </div>
                  <div>
                    <span className="text-emerald-200 text-[10px] block">Maximum Assistance</span>
                    <span className="text-base font-black text-white">
                      {formatCurrency(activeSchemes[0].max_loan)}
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <Link
                    href={`/calculator?principal=${activeDossier?.loan_amount || activeSchemes[0].max_loan}&rate=${activeSchemes[0].interest_rate}&tenure=${activeSchemes[0].max_tenure}&gender=${activeDossier?.gender || 'male'}`}
                    className="w-full py-2.5 rounded-xl bg-[#e8bd52] hover:bg-[#f5d57f] text-[#17372f] font-black text-xs text-center transition shadow-md"
                  >
                    Simulate EMI with Moratorium &rarr;
                  </Link>

                  <Link
                    href={`/partners?scheme_name=${encodeURIComponent(activeSchemes[0].scheme_name)}`}
                    className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs text-center border border-white/20 transition"
                  >
                    Locate Authorized Channel Partner
                  </Link>
                </div>
              </div>
            )}

            {/* Checklist Guide Card */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-[#0d5c4e]" />
                <span>Document Checklist for SCA Intake</span>
              </h3>
              <ul className="text-xs text-slate-600 space-y-2">
                {[
                  'Aadhaar / Voter ID (Proof of Identity)',
                  'Caste Certificate issued by Revenue Authority',
                  'Income Certificate (Family income ≤ ₹5.00 Lakh)',
                  'Project Quotation / Asset Pro-forma Invoice',
                  'Bank Account Passbook with IFSC',
                ].map((doc, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>{doc}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
