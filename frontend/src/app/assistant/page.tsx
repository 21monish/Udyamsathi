'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { SchemeRecommendation } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  extracted?: Record<string, any>;
  eligibleSchemes?: SchemeRecommendation[];
  timestamp: string;
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Namaste! I am UdyamSathi, your AI welfare counselor. You can speak to me in English, हिन्दी, or ગુજરાતી. Tell me what kind of loan, subsidy, or financial assistance you are looking for!',
      timestamp: 'Just now',
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const samplePrompts = [
    { label: 'ગુજરાતી', text: 'મને નાના બિઝનેસ માટે ૨ લાખ રૂપિયાની લોન જોઈએ છે' },
    { label: 'हिन्दी', text: 'मुझे छोटे व्यवसाय के लिए 3 लाख का लोन चाहिए, मेरी जाति SC है' },
    { label: 'English', text: 'I need concessional education loan for my engineering degree' },
    { label: 'Solar Subsidy', text: 'I want rooftop solar subsidy under PM Surya Ghar Muft Bijli Yojana' },
    { label: 'Artisan Loan', text: 'I am a traditional carpenter looking for PM Vishwakarma toolkit grant and loan' },
  ];

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
    } catch (err) {
      console.error('Assistant error:', err);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: 'Sorry, I encountered an issue connecting to the verification engine. Please try again or browse the schemes directory directly.',
        timestamp: 'Now',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-6">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-100 text-blue-800">
            MULTILINGUAL AI COUNSELOR • NLP + STATUTORY RULE ENGINE
          </span>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">UdyamSathi</h1>
          <p className="text-gray-600 text-sm mt-1">
            Gemini extracts your intent in natural language; our deterministic engine calculates statutory eligibility.
          </p>
        </div>

        {/* Quick Sample Prompts */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
          <span className="text-xs text-gray-400 font-medium">Quick Examples:</span>
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p.text)}
              className="px-3 py-1 bg-white hover:bg-blue-50 border rounded-full text-xs text-gray-700 transition"
            >
              <strong className="text-blue-600 mr-1">{p.label}:</strong>
              <span>{p.text.length > 35 ? p.text.substring(0, 35) + '...' : p.text}</span>
            </button>
          ))}
        </div>

        {/* Chat Window Container */}
        <div className="bg-white rounded-2xl shadow-sm border flex flex-col h-[580px] overflow-hidden">
          {/* Messages Area */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div className="flex items-center gap-2 mb-1 text-[11px] text-gray-400">
                  <span>{msg.sender === 'user' ? 'You' : 'UdyamSathi'}</span>
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                </div>

                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none shadow-sm'
                      : 'bg-gray-100 text-gray-900 rounded-bl-none border border-gray-200'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                </div>

                {/* Extracted Parameters Box */}
                {msg.extracted && (
                  <div className="max-w-[85%] mt-3 bg-blue-50/70 border border-blue-200 rounded-xl p-3 text-xs">
                    <span className="font-bold text-blue-900 block mb-1">
                      🧠 AI Parsed Intent Parameters:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-gray-700">
                      <div>
                        <span className="text-gray-400 block text-[10px]">Purpose</span>
                        <strong className="text-blue-900">
                          {msg.extracted.purpose?.replace('_', ' ')}
                        </strong>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[10px]">Loan / Grant</span>
                        <strong className="text-blue-900">
                          {formatCurrency(msg.extracted.loan_amount || 0)}
                        </strong>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[10px]">Category</span>
                        <strong className="text-blue-900">{msg.extracted.category || 'SC'}</strong>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[10px]">Language</span>
                        <strong className="text-blue-900">{msg.extracted.language || 'en'}</strong>
                      </div>
                    </div>
                  </div>
                )}

                {/* Verified Matching Scheme Cards */}
                {msg.eligibleSchemes && msg.eligibleSchemes.length > 0 && (
                  <div className="max-w-[85%] mt-3 space-y-2 w-full">
                    <span className="text-xs font-bold text-gray-700 block">
                      Matched Verified Schemes:
                    </span>
                    {msg.eligibleSchemes.slice(0, 2).map((rec) => (
                      <div
                        key={rec.scheme_id}
                        className="bg-white border border-emerald-200 rounded-xl p-3.5 shadow-sm text-xs flex items-center justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="font-bold text-gray-900 text-sm">{rec.scheme_name}</span>
                            <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200 font-medium">
                              Passed Hard Rules
                            </span>
                          </div>
                          <div className="text-gray-500">
                            Max Loan: {formatCurrency(rec.max_loan)} • Rate: {rec.interest_rate}% p.a.
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/schemes/${rec.scheme_id}`}
                            className="px-2.5 py-1 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 whitespace-nowrap"
                          >
                            Details →
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-start gap-2">
                <div className="bg-gray-100 rounded-2xl rounded-bl-none p-4 text-xs text-gray-500 flex items-center gap-2">
                  <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-blue-600"></div>
                  <span>Parsing language & evaluating verified statutory schemes...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input Box */}
          <div className="p-4 border-t bg-gray-50">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-3"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask in English, हिन्दी, or ગુજરાતી (e.g. 'I need ₹3 lakh loan for shop')..."
                className="flex-1 px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
