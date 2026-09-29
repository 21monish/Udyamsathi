'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';

interface ApplicationData {
  id: string;
  user_id: string;
  scheme_id: string;
  partner_id?: string;
  requested_amount: number;
  status: string;
  created_at: string;
  updated_at: string;
  user_name?: string;
  user_email?: string;
  scheme_name?: string;
  partner_name?: string;
}

interface ApplicationFormData {
  scheme_id: string;
  partner_id: string;
  requested_amount: number;
  status: string;
  user_id: string;
}

const STATUS_OPTIONS = ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'];

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-slate-100 text-slate-700',
  SUBMITTED: 'bg-blue-100 text-blue-800',
  UNDER_REVIEW: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-emerald-100 text-emerald-800',
  REJECTED: 'bg-red-100 text-red-800',
};

const defaultFormData: ApplicationFormData = {
  scheme_id: '',
  partner_id: '',
  requested_amount: 100000,
  status: 'DRAFT',
  user_id: '',
};

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<ApplicationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [stats, setStats] = useState({ total: 0, draft: 0, submitted: 0, under_review: 0, approved: 0, rejected: 0 });

  // Dropdown data
  const [schemes, setSchemes] = useState<{ id: string; name: string }[]>([]);
  const [partners, setPartners] = useState<{ id: string; name: string }[]>([]);
  const [users, setUsers] = useState<{ id: string; name: string; email: string }[]>([]);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<ApplicationData | null>(null);
  const [deletingApp, setDeletingApp] = useState<ApplicationData | null>(null);
  const [formData, setFormData] = useState<ApplicationFormData>(defaultFormData);
  const [formSaving, setFormSaving] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const showFeedback = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMsg({ type, text });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [appsRes, statsRes, schemesRes, partnersRes, usersRes] = await Promise.allSettled([
        api.get('/applications/'),
        api.get('/applications/stats/summary'),
        api.get('/schemes/?active_only=false'),
        api.get('/partners/'),
        api.get('/auth/users'),
      ]);

      if (appsRes.status === 'fulfilled') setApplications(appsRes.value.data);
      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
      if (schemesRes.status === 'fulfilled' && Array.isArray(schemesRes.value.data)) {
        setSchemes(schemesRes.value.data.map((s: any) => ({ id: s.id, name: s.name })));
      }
      if (partnersRes.status === 'fulfilled' && Array.isArray(partnersRes.value.data)) {
        setPartners(partnersRes.value.data.map((p: any) => ({ id: p.id, name: p.name })));
      }
      if (usersRes.status === 'fulfilled' && Array.isArray(usersRes.value.data)) {
        setUsers(usersRes.value.data.map((u: any) => ({ id: u.id, name: u.name, email: u.email })));
      }
    } catch (e) {
      console.warn('Error loading applications:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setFormData(defaultFormData);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (app: ApplicationData) => {
    setEditingApp(app);
    setFormData({
      scheme_id: app.scheme_id,
      partner_id: app.partner_id || '',
      requested_amount: app.requested_amount,
      status: app.status,
      user_id: app.user_id,
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSaving(true);
    try {
      if (editingApp) {
        const res = await api.put(`/applications/${editingApp.id}`, {
          status: formData.status,
          requested_amount: formData.requested_amount,
          partner_id: formData.partner_id || null,
        });
        setApplications((prev) => prev.map((a) => (a.id === editingApp.id ? res.data : a)));
        showFeedback('Application updated successfully!');
        setEditingApp(null);
      } else {
        const payload: any = {
          scheme_id: formData.scheme_id,
          partner_id: formData.partner_id || null,
          requested_amount: formData.requested_amount,
          status: formData.status,
        };
        const url = formData.user_id ? `/applications/?user_id=${formData.user_id}` : '/applications/';
        const res = await api.post(url, payload);
        setApplications((prev) => [res.data, ...prev]);
        showFeedback('New application created successfully!');
        setIsAddModalOpen(false);
      }
      // Refresh stats
      try {
        const statsRes = await api.get('/applications/stats/summary');
        setStats(statsRes.data);
      } catch {}
    } catch (err: any) {
      console.error('Save failed:', err);
      showFeedback(err.response?.data?.detail || 'Failed to save application.', 'error');
    } finally {
      setFormSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingApp) return;
    try {
      await api.delete(`/applications/${deletingApp.id}`);
      setApplications((prev) => prev.filter((a) => a.id !== deletingApp.id));
      showFeedback('Application deleted successfully.');
      // Refresh stats
      try {
        const statsRes = await api.get('/applications/stats/summary');
        setStats(statsRes.data);
      } catch {}
    } catch (err) {
      console.warn('Delete failed:', err);
      showFeedback('Failed to delete application.', 'error');
    } finally {
      setDeletingApp(null);
    }
  };

  const handleQuickStatus = async (app: ApplicationData, newStatus: string) => {
    try {
      const res = await api.put(`/applications/${app.id}`, { status: newStatus });
      setApplications((prev) => prev.map((a) => (a.id === app.id ? res.data : a)));
      showFeedback(`Application status changed to ${newStatus}.`);
      try {
        const statsRes = await api.get('/applications/stats/summary');
        setStats(statsRes.data);
      } catch {}
    } catch (err) {
      showFeedback('Failed to update status.', 'error');
    }
  };

  const filtered = applications.filter((a) => {
    const matchesQuery =
      (a.user_name || '').toLowerCase().includes(query.toLowerCase()) ||
      (a.user_email || '').toLowerCase().includes(query.toLowerCase()) ||
      (a.scheme_name || '').toLowerCase().includes(query.toLowerCase()) ||
      (a.partner_name || '').toLowerCase().includes(query.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || a.status === filterStatus;
    return matchesQuery && matchesStatus;
  });

  const formatCurrency = (n: number) => '₹' + n.toLocaleString('en-IN');
  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="w-[90%] max-w-[1700px] mx-auto px-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-4">
          <Link href="/admin" className="text-xs font-bold text-blue-700 hover:underline">
            ← SUPER ADMIN DASHBOARD
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-xs font-semibold text-slate-500">APPLICATIONS</span>
        </div>

        {/* Feedback Toast */}
        {feedbackMsg && (
          <div
            className={`mb-6 p-4 rounded-xl text-sm font-semibold flex items-center justify-between shadow-sm border ${
              feedbackMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'
            }`}
          >
            <span>{feedbackMsg.text}</span>
            <button onClick={() => setFeedbackMsg(null)} className="text-xs font-bold underline ml-4">Dismiss</button>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold px-2.5 py-1 rounded bg-orange-100 text-orange-800 uppercase tracking-wider">
              Application Pipeline Management
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-2">Loan Applications</h1>
            <p className="text-slate-600 text-sm mt-1 max-w-2xl">
              Track, review, and manage beneficiary loan applications across all welfare schemes and channel partners.
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-bold text-white shadow-md hover:bg-blue-800 transition"
          >
            <span>+</span> New Application
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          {[
            { label: 'Total', value: stats.total, color: 'text-slate-900', bg: 'bg-white' },
            { label: 'Draft', value: stats.draft, color: 'text-slate-600', bg: 'bg-white' },
            { label: 'Submitted', value: stats.submitted, color: 'text-blue-800', bg: 'bg-blue-50' },
            { label: 'Under Review', value: stats.under_review, color: 'text-yellow-800', bg: 'bg-yellow-50' },
            { label: 'Approved', value: stats.approved, color: 'text-emerald-800', bg: 'bg-emerald-50' },
            { label: 'Rejected', value: stats.rejected, color: 'text-red-800', bg: 'bg-red-50' },
          ].map((s) => (
            <div key={s.label} className={`rounded-2xl ${s.bg} p-4 border border-slate-200 shadow-sm`}>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">{s.label}</span>
              <div className={`text-2xl font-extrabold mt-1 ${s.color}`}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-8 relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by user name, email, scheme, or partner..."
                className="w-full pl-4 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div className="md:col-span-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full py-2.5 px-3 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="ALL">All Statuses</option>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-20 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mb-3" />
              <p className="text-slate-500 text-sm">Loading applications...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-lg font-bold text-slate-700">No applications found</p>
              <p className="text-sm text-slate-500 mt-1">Create a new application or adjust your filters.</p>
              <button
                onClick={() => { setQuery(''); setFilterStatus('ALL'); }}
                className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-semibold text-slate-700"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="py-4 px-5">Applicant</th>
                    <th className="py-4 px-4">Scheme</th>
                    <th className="py-4 px-4">Partner</th>
                    <th className="py-4 px-4">Amount</th>
                    <th className="py-4 px-4">Status</th>
                    <th className="py-4 px-4">Date</th>
                    <th className="py-4 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-5">
                        <div className="font-bold text-slate-900 text-sm">{a.user_name || 'Unknown'}</div>
                        <div className="text-xs text-slate-500">{a.user_email || a.user_id.slice(0, 8)}</div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-semibold text-slate-800 text-sm line-clamp-1">{a.scheme_name || 'N/A'}</span>
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-600">{a.partner_name || '—'}</td>
                      <td className="py-4 px-4 font-bold text-slate-800">{formatCurrency(a.requested_amount)}</td>
                      <td className="py-4 px-4">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${STATUS_COLORS[a.status] || 'bg-slate-100 text-slate-600'}`}>
                          {a.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-500">{formatDate(a.created_at)}</td>
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {a.status === 'SUBMITTED' && (
                            <button
                              onClick={() => handleQuickStatus(a, 'UNDER_REVIEW')}
                              className="text-[11px] font-bold text-yellow-700 px-2 py-1 rounded-lg border border-yellow-200 hover:bg-yellow-50 transition"
                            >
                              Review
                            </button>
                          )}
                          {a.status === 'UNDER_REVIEW' && (
                            <>
                              <button
                                onClick={() => handleQuickStatus(a, 'APPROVED')}
                                className="text-[11px] font-bold text-emerald-700 px-2 py-1 rounded-lg border border-emerald-200 hover:bg-emerald-50 transition"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleQuickStatus(a, 'REJECTED')}
                                className="text-[11px] font-bold text-red-600 px-2 py-1 rounded-lg border border-red-200 hover:bg-red-50 transition"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleOpenEdit(a)}
                            className="text-[11px] font-bold text-blue-700 px-2 py-1 rounded-lg border border-blue-200 hover:bg-blue-50 transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setDeletingApp(a)}
                            className="text-[11px] font-bold text-red-600 px-2 py-1 rounded-lg border border-red-200 hover:bg-red-50 transition"
                          >
                            Del
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Modal */}
      {(isAddModalOpen || editingApp) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 my-8 overflow-hidden">
            <div className="bg-[#0d1b3e] text-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-blue-300 uppercase tracking-wider">
                    {editingApp ? 'Update Application' : 'Create Application'}
                  </span>
                  <h3 className="text-xl font-bold mt-1">
                    {editingApp ? 'Edit Application' : 'New Loan Application'}
                  </h3>
                </div>
                <button
                  onClick={() => { setIsAddModalOpen(false); setEditingApp(null); }}
                  className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-lg"
                >
                  ✕
                </button>
              </div>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {!editingApp && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Beneficiary User *</label>
                  <select
                    required
                    value={formData.user_id}
                    onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="">Select User</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Scheme *</label>
                <select
                  required={!editingApp}
                  value={formData.scheme_id}
                  onChange={(e) => setFormData({ ...formData, scheme_id: e.target.value })}
                  disabled={!!editingApp}
                  className="w-full rounded-xl border border-slate-300 p-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50"
                >
                  <option value="">Select Scheme</option>
                  {schemes.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Channel Partner</label>
                <select
                  value={formData.partner_id}
                  onChange={(e) => setFormData({ ...formData, partner_id: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="">No Partner Selected</option>
                  {partners.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Requested Amount (INR) *</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={formData.requested_amount}
                  onChange={(e) => setFormData({ ...formData, requested_amount: Number(e.target.value) })}
                  className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => { setIsAddModalOpen(false); setEditingApp(null); }}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSaving}
                  className="px-6 py-2.5 rounded-xl bg-blue-700 text-sm font-bold text-white hover:bg-blue-800 shadow-md transition disabled:opacity-50"
                >
                  {formSaving ? 'Saving...' : editingApp ? 'Save Changes' : 'Create Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deletingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 border border-slate-200">
            <div className="h-12 w-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xl font-bold mb-4">!</div>
            <h3 className="text-xl font-bold text-slate-900">Delete Application?</h3>
            <p className="text-sm text-slate-600 mt-2">
              Are you sure you want to permanently delete the application from{' '}
              <strong className="text-slate-900">{deletingApp.user_name || 'Unknown'}</strong> for{' '}
              <strong className="text-slate-900">{deletingApp.scheme_name || 'Unknown scheme'}</strong>? This action cannot be undone.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setDeletingApp(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-5 py-2 rounded-xl bg-red-600 text-sm font-bold text-white hover:bg-red-700 shadow transition"
              >
                Delete Application
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
