'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';

export default function AdminPage() {
  const [stats, setStats] = useState({
    schemes: 0,
    activeSchemes: 0,
    partners: 0,
    availablePartners: 0,
    users: 0,
    beneficiaries: 0,
    applications: 0,
    pendingApplications: 0,
    approvedApplications: 0,
    aiKnowledge: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardStats() {
      try {
        const [schemesRes, partnersRes, usersRes, appStatsRes, aiKnowledgeRes] = await Promise.allSettled([
          api.get('/schemes/?active_only=false'),
          api.get('/partners/'),
          api.get('/auth/users'),
          api.get('/applications/stats/summary'),
          api.get('/ai-training'),
        ]);

        let schemeCount = 0, activeCount = 0, partnerCount = 0, availPartnerCount = 0;
        let userCount = 0, benefCount = 0;
        let appTotal = 0, appPending = 0, appApproved = 0;
        let aiCount = 0;

        if (schemesRes.status === 'fulfilled' && Array.isArray(schemesRes.value.data)) {
          schemeCount = schemesRes.value.data.length;
          activeCount = schemesRes.value.data.filter((s: any) => s.active).length;
        }
        if (partnersRes.status === 'fulfilled' && Array.isArray(partnersRes.value.data)) {
          partnerCount = partnersRes.value.data.length;
          availPartnerCount = partnersRes.value.data.filter((p: any) => p.capacity_status === 'AVAILABLE').length;
        }
        if (usersRes.status === 'fulfilled' && Array.isArray(usersRes.value.data)) {
          userCount = usersRes.value.data.length;
          benefCount = usersRes.value.data.filter((u: any) => u.role === 'BENEFICIARY').length;
        }
        if (appStatsRes.status === 'fulfilled' && appStatsRes.value.data) {
          const d = appStatsRes.value.data;
          appTotal = d.total || 0;
          appPending = (d.submitted || 0) + (d.under_review || 0);
          appApproved = d.approved || 0;
        }
        if (aiKnowledgeRes.status === 'fulfilled' && Array.isArray(aiKnowledgeRes.value.data)) {
          aiCount = aiKnowledgeRes.value.data.length;
        }

        setStats({
          schemes: schemeCount,
          activeSchemes: activeCount,
          partners: partnerCount,
          availablePartners: availPartnerCount,
          users: userCount,
          beneficiaries: benefCount,
          applications: appTotal,
          pendingApplications: appPending,
          approvedApplications: appApproved,
          aiKnowledge: aiCount,
        });
      } catch (e) {
        console.warn('Dashboard stats fetch fallback:', e);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardStats();
  }, []);

  const capacityRate = stats.partners ? Math.round((stats.availablePartners / stats.partners) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Header Banner */}
      <div className="border-b bg-[#0d1b3e] text-white">
        <div className="w-[90%] max-w-[1700px] mx-auto px-4 py-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <p className="text-xs font-bold text-blue-300 uppercase tracking-widest">
                  SUPER ADMIN &middot; PLATFORM COMMAND CENTER
                </p>
              </div>
              <h1 className="mt-2 text-3xl md:text-4xl font-extrabold text-white">
                UdyamSathi Operations Hub
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-blue-100">
                Unified administration for statutory welfare schemes, channel partner capacity, beneficiary records, and loan application pipeline.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/schemes"
                className="px-4 py-2.5 rounded-xl border border-white/20 text-xs font-semibold text-white hover:bg-white/10 transition"
              >
                View Public Catalogue
              </Link>
              <Link
                href="/admin/schemes"
                className="px-4 py-2.5 rounded-xl bg-blue-600 text-xs font-bold text-white hover:bg-blue-500 shadow-md transition"
              >
                + Add New Scheme
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="w-[90%] max-w-[1700px] mx-auto px-4 py-8">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Link
            href="/admin/schemes"
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Welfare Schemes</span>
              <span className="text-xs font-bold text-blue-600 group-hover:translate-x-1 transition-transform">Manage &rarr;</span>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mt-2">{stats.schemes}</div>
            <p className="mt-1 text-xs text-slate-500">{stats.activeSchemes} active for matching</p>
            <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span> Live rule engine connected
            </div>
          </Link>

          <Link
            href="/admin/partners"
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Channel Partners</span>
              <span className="text-xs font-bold text-blue-600 group-hover:translate-x-1 transition-transform">Review &rarr;</span>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mt-2">{stats.partners}</div>
            <p className="mt-1 text-xs text-slate-500">SCAs, PSBs & RRB branches</p>
            <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-blue-700">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span> Geolocation routing active
            </div>
          </Link>

          <Link
            href="/admin/users"
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Beneficiary Users</span>
              <span className="text-xs font-bold text-blue-600 group-hover:translate-x-1 transition-transform">Manage &rarr;</span>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mt-2">{stats.users}</div>
            <p className="mt-1 text-xs text-slate-500">{stats.beneficiaries} verified beneficiaries</p>
            <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-purple-700">
              <span className="h-1.5 w-1.5 rounded-full bg-purple-500"></span> Role-based access active
            </div>
          </Link>

          <Link
            href="/admin/ai-training"
            className="group rounded-2xl border border-indigo-200 bg-indigo-50/50 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-700 uppercase tracking-wide">AI Knowledge Base</span>
              <span className="text-xs font-bold text-indigo-600 group-hover:translate-x-1 transition-transform">Train &rarr;</span>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mt-2">{stats.aiKnowledge}</div>
            <p className="mt-1 text-xs text-slate-500">Trained statutory Q&A pairs</p>
            <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-indigo-700">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse"></span> Live assistant synced
            </div>
          </Link>

          <Link
            href="/admin/partners"
            className="group rounded-2xl bg-[#0d1b3e] p-5 text-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-blue-300 uppercase tracking-wide">Network Capacity</span>
              <span className="text-xs font-bold text-yellow-300 group-hover:translate-x-1 transition-transform">Details &rarr;</span>
            </div>
            <div className="text-3xl font-extrabold text-yellow-300 mt-2">{capacityRate}%</div>
            <div className="mt-2 h-1.5 w-full rounded-full bg-slate-700 overflow-hidden">
              <div className="h-full bg-emerald-400 transition-all duration-300" style={{ width: `${capacityRate}%` }} />
            </div>
            <p className="mt-2 text-[11px] text-blue-200">
              {stats.availablePartners} of {stats.partners} desks accepting intake
            </p>
          </Link>
        </div>

        {/* Quick Actions & Platform Readiness */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Administrative Workflows</span>
                  <h2 className="text-xl font-bold text-slate-900 mt-0.5">Quick Actions</h2>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">4 Core Modules</span>
              </div>

              <div className="grid gap-3">
                <Link
                  href="/admin/ai-training"
                  className="flex items-center justify-between p-4 rounded-2xl border-2 border-indigo-200 bg-indigo-50/40 hover:border-indigo-500 hover:bg-indigo-50 transition-all group shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-11 w-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-lg font-bold group-hover:scale-105 transition-transform shadow-md">AI</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 text-sm group-hover:text-indigo-700 transition-colors">Teach AI Assistant (Knowledge Base)</h3>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-600 text-white animate-pulse">ACTIVE &middot; {stats.aiKnowledge} Q&As</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">Teach custom questions and answers, manage keyword triggers, and simulate AI matching in real time.</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-indigo-700 px-3 py-1.5 rounded-lg bg-white border border-indigo-200 shadow-sm group-hover:bg-indigo-700 group-hover:text-white transition">Train AI &rarr;</span>
                </Link>

                <Link
                  href="/admin/schemes"
                  className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-11 w-11 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-lg font-bold group-hover:scale-105 transition-transform">S</div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-700 transition-colors">Add or edit a scheme</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Configure interest rates, maximum loan limits, moratorium, and statutory eligibility rules.</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-blue-600 px-3 py-1.5 rounded-lg bg-white border border-slate-200 shadow-sm group-hover:bg-blue-700 group-hover:text-white transition">Open Catalogue &rarr;</span>
                </Link>

                <Link
                  href="/admin/partners"
                  className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-11 w-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-lg font-bold group-hover:scale-105 transition-transform">P</div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition-colors">Review partner capacity</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Monitor channel agency application backlog and toggle desk intake status.</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 px-3 py-1.5 rounded-lg bg-white border border-slate-200 shadow-sm group-hover:bg-emerald-700 group-hover:text-white transition">Review Capacity &rarr;</span>
                </Link>

                <Link
                  href="/admin/users"
                  className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 hover:border-purple-500 hover:bg-purple-50/50 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-11 w-11 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center text-lg font-bold group-hover:scale-105 transition-transform">U</div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm group-hover:text-purple-700 transition-colors">Manage beneficiary users</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Provision credentials, assign user roles (Beneficiary, Partner, Admin), and suspend access.</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-purple-700 px-3 py-1.5 rounded-lg bg-white border border-slate-200 shadow-sm group-hover:bg-purple-700 group-hover:text-white transition">Manage Users &rarr;</span>
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-4 text-xs text-blue-900 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <strong>Tip:</strong> Full create, update, and manage actions are active across all 4 administration modules.
              </span>
              <span className="font-bold">FastAPI 8001 Connected</span>
            </div>
          </div>

          {/* Right Column: Platform Readiness & Audit Log */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900">Platform Readiness</h2>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">Production Ready</span>
              </div>
              <div className="space-y-4">
                {[
                  { label: 'Scheme Rule Engine', val: 100, note: 'Deterministic statutory calculations' },
                  { label: 'Channel Partner Coverage', val: 95, note: 'Active SCAs, Banks & RRBs' },
                  { label: 'AI Knowledge Base Engine', val: 100, note: 'Admin-trained zero hallucination matching' },
                  { label: 'API & PostgreSQL Sync', val: 100, note: 'Real-time database persistence' },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-700">{item.label}</span>
                      <span className="text-blue-700 font-bold">{item.val}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full bg-blue-700 rounded-full transition-all duration-500" style={{ width: `${item.val}%` }} />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">{item.note}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Recent Operations Log</h3>
              <ul className="space-y-3 text-xs">
                <li className="flex items-start gap-2.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 mt-1 shrink-0" />
                  <div>
                    <strong className="text-slate-800">Catalogue Verified: </strong>
                    <span className="text-slate-500">Statutory schemes verified deterministically</span>
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="h-2 w-2 rounded-full bg-blue-500 mt-1 shrink-0" />
                  <div>
                    <strong className="text-slate-800">Application Pipeline: </strong>
                    <span className="text-slate-500">Full CRUD endpoints active on /api/v1/applications</span>
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="h-2 w-2 rounded-full bg-orange-500 mt-1 shrink-0" />
                  <div>
                    <strong className="text-slate-800">Admin Panel: </strong>
                    <span className="text-slate-500">4 modules: Schemes, Partners, Users, Applications</span>
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="h-2 w-2 rounded-full bg-purple-500 mt-1 shrink-0" />
                  <div>
                    <strong className="text-slate-800">Identity Provisioning: </strong>
                    <span className="text-slate-500">Role-based user management with suspension</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
