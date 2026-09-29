'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import {
  Bot,
  Plus,
  Search,
  Sparkles,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RefreshCw,
  Tag,
  ArrowRight,
  Send,
  Zap,
  Check,
  Copy,
  BookOpen,
  Filter,
} from 'lucide-react';

interface AIKnowledgeItem {
  id: string;
  question: string;
  keywords: string[];
  answer: string;
  category: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface TestResult {
  matched: boolean;
  confidence: number;
  matched_question?: string;
  category?: string;
  answer: string;
}

const CATEGORIES = [
  { id: 'ALL', label: 'All Categories' },
  { id: 'SCHEMES', label: 'Welfare Schemes' },
  { id: 'ELIGIBILITY', label: 'Eligibility & Income' },
  { id: 'DOCUMENTS', label: 'Document Checklist' },
  { id: 'EMI_REPAYMENT', label: 'EMI & Moratorium' },
  { id: 'GENERAL', label: 'General & Channel Partners' },
];

const CATEGORY_COLORS: Record<string, string> = {
  SCHEMES: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  ELIGIBILITY: 'bg-purple-50 text-purple-800 border-purple-200',
  DOCUMENTS: 'bg-blue-50 text-blue-800 border-blue-200',
  EMI_REPAYMENT: 'bg-amber-50 text-amber-800 border-amber-200',
  GENERAL: 'bg-slate-100 text-slate-700 border-slate-200',
};

export default function AdminAITrainingPage() {
  const [items, setItems] = useState<AIKnowledgeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [activeOnly, setActiveOnly] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AIKnowledgeItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<AIKnowledgeItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form State
  const [formQuestion, setFormQuestion] = useState('');
  const [formKeywords, setFormKeywords] = useState('');
  const [formAnswer, setFormAnswer] = useState('');
  const [formCategory, setFormCategory] = useState('SCHEMES');
  const [formIsActive, setFormIsActive] = useState(true);

  // Live Simulator State
  const [simulatorInput, setSimulatorInput] = useState('What documents do I need to prepare?');
  const [simulatorResult, setSimulatorResult] = useState<TestResult | null>(null);
  const [simulatorLoading, setSimulatorLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const showFeedback = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await api.get('/ai-training');
      setItems(res.data);
    } catch (err) {
      console.error('Failed to fetch AI knowledge base:', err);
      showFeedback('Failed to load AI knowledge base items.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormQuestion('');
    setFormKeywords('');
    setFormAnswer('');
    setFormCategory('SCHEMES');
    setFormIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: AIKnowledgeItem) => {
    setEditingItem(item);
    setFormQuestion(item.question);
    setFormKeywords((item.keywords || []).join(', '));
    setFormAnswer(item.answer);
    setFormCategory(item.category || 'SCHEMES');
    setFormIsActive(item.is_active);
    setIsModalOpen(true);
  };

  const handleSaveItem = async (e: FormEvent) => {
    e.preventDefault();
    if (!formQuestion.trim() || !formAnswer.trim()) {
      showFeedback('Question and Answer are required fields.', 'error');
      return;
    }

    setSaving(true);
    try {
      const keywordsArray = formKeywords
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean);

      const payload = {
        question: formQuestion.trim(),
        keywords: keywordsArray,
        answer: formAnswer.trim(),
        category: formCategory,
        is_active: formIsActive,
      };

      if (editingItem) {
        const res = await api.put(`/ai-training/${editingItem.id}`, payload);
        setItems((prev) => prev.map((item) => (item.id === editingItem.id ? res.data : item)));
        showFeedback('Question & Answer successfully updated! The AI will now use this updated response.');
      } else {
        const res = await api.post('/ai-training', payload);
        setItems((prev) => [res.data, ...prev]);
        showFeedback('New Question & Answer successfully taught to the AI!');
      }

      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to save AI training item:', err);
      showFeedback('Failed to save knowledge item. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteItem = async () => {
    if (!deletingItem) return;
    try {
      await api.delete(`/ai-training/${deletingItem.id}`);
      setItems((prev) => prev.filter((item) => item.id !== deletingItem.id));
      showFeedback('Question & Answer removed from AI knowledge base.');
      setDeletingItem(null);
    } catch (err) {
      console.error('Delete failed:', err);
      showFeedback('Failed to delete item.', 'error');
    }
  };

  const handleToggleActive = async (item: AIKnowledgeItem) => {
    try {
      const res = await api.put(`/ai-training/${item.id}`, {
        is_active: !item.is_active,
      });
      setItems((prev) => prev.map((x) => (x.id === item.id ? res.data : x)));
      showFeedback(`Q&A item is now ${!item.is_active ? 'Active' : 'Disabled'}.`);
    } catch (err) {
      showFeedback('Failed to update status.', 'error');
    }
  };

  const handleRunSimulator = async () => {
    if (!simulatorInput.trim()) return;
    setSimulatorLoading(true);
    try {
      const res = await api.post('/ai-training/test', { question: simulatorInput });
      setSimulatorResult(res.data);
    } catch (err) {
      console.error('Simulator error:', err);
      setSimulatorResult({
        matched: false,
        confidence: 0,
        answer: 'Failed to connect to AI test simulator. Please ensure the backend server is running.',
      });
    } finally {
      setSimulatorLoading(false);
    }
  };

  const handleCopyAnswer = (text: string, id: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  // Filtered Items
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.keywords || []).some((kw) => kw.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
    const matchesActive = !activeOnly || item.is_active;

    return matchesSearch && matchesCategory && matchesActive;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="w-[90%] max-w-[1700px] mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2">
          <Link href="/admin" className="text-xs font-bold text-blue-700 hover:underline">
            &larr; SUPER ADMIN DASHBOARD
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            AI ASSISTANT TRAINING &amp; KNOWLEDGE BASE
          </span>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-4 rounded-2xl flex items-center justify-between text-sm font-semibold shadow-sm transition-all ${
              feedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {feedback.type === 'success' ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              ) : (
                <XCircle className="h-5 w-5 text-rose-600" />
              )}
              <span>{feedback.message}</span>
            </div>
            <button
              onClick={() => setFeedback(null)}
              className="text-xs underline hover:opacity-75"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Page Banner Header */}
        <div className="rounded-3xl bg-gradient-to-r from-[#0d1b3e] via-[#162a56] to-[#0f3a4b] p-6 sm:p-8 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-widest text-[#f4cf70]">
                ZERO-HALLUCINATION KNOWLEDGE ENGINE
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Teach the AI Assistant (Q&amp;A Hub)
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-blue-100 max-w-2xl leading-relaxed">
              Define the exact questions beneficiaries and field facilitators ask, configure authoritative statutory answers, and test AI matching in real time. Changes take effect instantly without restarting services.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={fetchItems}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-1.5"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <button
              onClick={handleOpenAddModal}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md"
            >
              <Plus className="h-4 w-4" />
              <span>+ Teach New Question</span>
            </button>
          </div>
        </div>

        {/* 2-Column Split: Knowledge Base on Left (8 Cols), Real-Time Simulator on Right (4 Cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Q&A Catalog & Filters (8 Cols) */}
          <div className="lg:col-span-8 space-y-5">
            {/* Search and Category Filters Bar */}
            <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="h-4 w-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search trained questions, keywords, or answers..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 bg-slate-50 focus:bg-white transition"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={activeOnly}
                      onChange={(e) => setActiveOnly(e.target.checked)}
                      className="accent-blue-600 h-4 w-4 rounded"
                    />
                    <span>Active Only</span>
                  </label>
                </div>
              </div>

              {/* Category Filter Pills */}
              <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-100">
                {CATEGORIES.map((cat) => {
                  const count =
                    cat.id === 'ALL'
                      ? items.length
                      : items.filter((x) => x.category === cat.id).length;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
                        selectedCategory === cat.id
                          ? 'bg-[#0d1b3e] text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <span>{cat.label}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                          selectedCategory === cat.id
                            ? 'bg-white/20 text-white'
                            : 'bg-white text-slate-700'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Q&A Cards List */}
            {loading ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500">
                <RefreshCw className="h-6 w-6 animate-spin mx-auto text-blue-600 mb-2" />
                <p className="text-xs">Loading AI knowledge base...</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500 space-y-3">
                <HelpCircle className="h-8 w-8 mx-auto text-slate-400" />
                <h3 className="text-base font-bold text-slate-800">No trained questions found</h3>
                <p className="text-xs max-w-md mx-auto text-slate-500">
                  {searchQuery
                    ? `No entries match "${searchQuery}". Try clearing search filters.`
                    : 'Teach the AI its first custom question by clicking the button above!'}
                </p>
                <button
                  onClick={handleOpenAddModal}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition"
                >
                  + Teach New Question
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className={`bg-white rounded-3xl border p-6 shadow-sm transition hover:shadow-md ${
                      item.is_active ? 'border-slate-200' : 'border-slate-200 opacity-60 bg-slate-50/50'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-3">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                              CATEGORY_COLORS[item.category] || CATEGORY_COLORS.GENERAL
                            }`}
                          >
                            {item.category?.replace('_', ' ')}
                          </span>

                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              item.is_active
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-slate-100 text-slate-500 border-slate-200'
                            }`}
                          >
                            {item.is_active ? 'Active & Live' : 'Disabled'}
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-slate-900 leading-snug">
                          {item.question}
                        </h3>
                      </div>

                      {/* Card Action Controls */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleToggleActive(item)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition border ${
                            item.is_active
                              ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                          }`}
                          title="Toggle active status"
                        >
                          {item.is_active ? 'Disable' : 'Enable'}
                        </button>

                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 transition"
                          title="Edit Question & Answer"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => setDeletingItem(item)}
                          className="p-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 transition"
                          title="Delete Q&A Item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Trigger Keywords Tags */}
                    {item.keywords && item.keywords.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 mb-3">
                        <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                          <Tag className="h-3 w-3" /> Triggers:
                        </span>
                        {item.keywords.map((kw, i) => (
                          <span
                            key={i}
                            className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md text-[11px] font-medium"
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Answer Preview Box */}
                    <div className="relative rounded-2xl bg-slate-50 border border-slate-100 p-4 text-xs sm:text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                      {item.answer}

                      <button
                        onClick={() => handleCopyAnswer(item.answer, item.id)}
                        className="absolute top-3 right-3 p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 transition"
                        title="Copy answer to clipboard"
                      >
                        {copiedId === item.id ? (
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Updated: {new Date(item.updated_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      <button
                        onClick={() => {
                          setSimulatorInput(item.question);
                          handleRunSimulator();
                        }}
                        className="text-blue-600 font-bold hover:underline flex items-center gap-1"
                      >
                        <Zap className="h-3 w-3" />
                        <span>Test in simulator</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Real-Time AI Simulator Panel (4 Cols) */}
          <div className="lg:col-span-4 space-y-5 sticky top-24">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                    <Zap className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">AI Response Simulator</h3>
                    <p className="text-[10px] text-slate-400">Test how AI matches any query</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  Live Test
                </span>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Type a Test Question
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={simulatorInput}
                    onChange={(e) => setSimulatorInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleRunSimulator()}
                    placeholder="e.g. What is the income limit for NSFDC?"
                    className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 bg-slate-50 focus:bg-white transition"
                  />
                  <button
                    onClick={handleRunSimulator}
                    disabled={simulatorLoading || !simulatorInput.trim()}
                    className="px-3 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold transition shadow-sm"
                  >
                    {simulatorLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Simulator Output Box */}
              {simulatorResult && (
                <div className="rounded-2xl border p-4 text-xs space-y-3 bg-slate-50/70 border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      {simulatorResult.matched ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          <span className="text-emerald-800">Knowledge Matched</span>
                        </>
                      ) : (
                        <>
                          <HelpCircle className="h-4 w-4 text-amber-600" />
                          <span className="text-amber-800">Rule/General Fallback</span>
                        </>
                      )}
                    </span>

                    {simulatorResult.matched && (
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                        {simulatorResult.confidence}% confidence
                      </span>
                    )}
                  </div>

                  {simulatorResult.matched_question && (
                    <div className="text-[11px] text-slate-500 border-b border-slate-200 pb-2">
                      <span className="font-semibold text-slate-700">Matched Question:</span>{' '}
                      {simulatorResult.matched_question}
                    </div>
                  )}

                  <div className="space-y-1">
                    <span className="font-semibold text-slate-700 block">AI Output to User:</span>
                    <div className="p-3 rounded-xl bg-white border border-slate-200 text-slate-800 whitespace-pre-line leading-relaxed max-h-[260px] overflow-y-auto">
                      {simulatorResult.answer}
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Prompt Test Chips */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Quick Test Queries
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'What is NSFDC?',
                    'What documents do I need?',
                    'How does moratorium work?',
                    'Mahila Samriddhi Yojana details',
                    'Where can I apply in Gujarat?',
                  ].map((chip) => (
                    <button
                      key={chip}
                      onClick={() => {
                        setSimulatorInput(chip);
                        setTimeout(handleRunSimulator, 50);
                      }}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 transition"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TEACH THE AI MODAL (ADD / EDIT) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {editingItem ? 'Edit Trained Q&A' : 'Teach the AI a New Q&A'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    The AI will deliver this exact authoritative answer whenever a matching question is asked.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4">
              {/* Question Field */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Question / User Query *
                </label>
                <input
                  type="text"
                  required
                  value={formQuestion}
                  onChange={(e) => setFormQuestion(e.target.value)}
                  placeholder="e.g. What is the subsidy percentage under Stand-Up India?"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* Category & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Category *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="SCHEMES">Welfare Schemes</option>
                    <option value="ELIGIBILITY">Eligibility &amp; Income</option>
                    <option value="DOCUMENTS">Document Checklist</option>
                    <option value="EMI_REPAYMENT">EMI &amp; Moratorium</option>
                    <option value="GENERAL">General &amp; Partners</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Active for Beneficiaries
                  </label>
                  <label className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsActive}
                      onChange={(e) => setFormIsActive(e.target.checked)}
                      className="h-4 w-4 accent-emerald-600 rounded"
                    />
                    <span className="text-xs font-semibold text-slate-700">
                      {formIsActive ? 'Active (Live in Chat)' : 'Disabled (Draft)'}
                    </span>
                  </label>
                </div>
              </div>

              {/* Trigger Keywords */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Trigger Keywords (Comma-separated)
                </label>
                <input
                  type="text"
                  value={formKeywords}
                  onChange={(e) => setFormKeywords(e.target.value)}
                  placeholder="e.g. stand-up india, subsidy percentage, greenfield loan, grant"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Words or phrases that help the AI match natural variations of this question.
                </p>
              </div>

              {/* Exact Answer Textarea */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Official Answer (Exact text AI will deliver) *
                </label>
                <textarea
                  required
                  rows={6}
                  value={formAnswer}
                  onChange={(e) => setFormAnswer(e.target.value)}
                  placeholder="Type the exact official response. You can use markdown bullet points and bold formatting."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 font-sans leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold transition shadow-md flex items-center gap-1.5"
                >
                  {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  <span>{editingItem ? 'Save Changes' : 'Teach AI'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Confirm Deletion</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to remove the question{' '}
              <strong className="text-slate-900">"{deletingItem.question}"</strong> from the AI knowledge base? The AI will revert to standard statutory logic for this topic.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeletingItem(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteItem}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-sm"
              >
                Delete Q&amp;A
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
