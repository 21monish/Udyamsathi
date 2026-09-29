'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import {
  FileText,
  CheckCircle2,
  Building2,
  Calculator,
  Compass,
  Bot,
  User,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  CreditCard,
  MapPin,
  Calendar,
  Sparkles,
  RefreshCw,
  ExternalLink,
  Phone,
  CheckSquare,
  Square,
} from 'lucide-react';

interface SchemeItem {
  id: string;
  name: string;
  scheme_type: string;
  description?: string;
  min_loan: number;
  max_loan: number;
  interest_rate: number;
  max_tenure: number;
  moratorium: number;
  eligible_categories: string[];
  eligible_purposes: string[];
  max_income?: number;
  required_documents?: string[];
  subsidy_info?: string;
}

interface PartnerItem {
  id: string;
  name: string;
  type: string;
  address?: string;
  city?: string;
  district?: string;
  state?: string;
  phone?: string;
  capacity_status?: string;
}

interface UserProfile {
  name: string;
  email: string;
  mobile?: string;
  annual_income?: number;
  category?: string;
  gender?: string;
  occupation?: string;
  education_status?: string;
  state?: string;
  district?: string;
}

const DEFAULT_DOCUMENTS = [
  { id: 'aadhaar', name: 'Aadhaar Card / Government Identity Proof', desc: 'Proof of identity and address with date of birth' },
  { id: 'caste', name: 'Caste Certificate', desc: 'Issued by Tahsildar / SDM verifying SC / ST / OBC community status' },
  { id: 'income', name: 'Income Certificate', desc: 'Valid family income certificate showing annual income below ceiling' },
  { id: 'dpr', name: 'Project Proposal (DPR)', desc: 'Brief business activity plan, equipment estimate, and working capital needs' },
  { id: 'quotation', name: 'Supplier Quotations / Proforma Invoices', desc: 'Official vendor price quotes for machinery, raw material, or livestock' },
  { id: 'bank', name: 'Bank Passbook & 6 Months Statement', desc: 'Active savings account statement with clear IFSC code' },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [schemes, setSchemes] = useState<SchemeItem[]>([]);
  const [partners, setPartners] = useState<PartnerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [checkedDocs, setCheckedDocs] = useState<string[]>(['aadhaar', 'caste', 'income']);

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      const [profileRes, schemesRes, partnersRes] = await Promise.allSettled([
        api.get('/auth/profile'),
        api.get('/schemes/?active_only=true'),
        api.get('/partners/'),
      ]);

      if (profileRes.status === 'fulfilled' && profileRes.value.data) {
        setProfile(profileRes.value.data);
      }
      if (schemesRes.status === 'fulfilled' && Array.isArray(schemesRes.value.data)) {
        setSchemes(schemesRes.value.data);
      }
      if (partnersRes.status === 'fulfilled' && Array.isArray(partnersRes.value.data)) {
        setPartners(partnersRes.value.data);
      }
    } catch (err) {
      console.warn('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const toggleDoc = (id: string) => {
    setCheckedDocs((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  const userCategory = profile?.category || 'SC';
  const userIncome = profile?.annual_income || 250000;
  const isFemale = profile?.gender?.toLowerCase() === 'female';

  // Matched schemes based on user profile
  const matchedSchemes = schemes.filter((s) => {
    const catMatch = !s.eligible_categories || s.eligible_categories.includes(userCategory);
    const incMatch = !s.max_income || userIncome <= s.max_income;
    return catMatch && incMatch;
  });

  const displaySchemes = matchedSchemes.length > 0 ? matchedSchemes.slice(0, 6) : schemes.slice(0, 6);
  const activePartners = partners.slice(0, 4);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="w-[90%] max-w-[1700px] mx-auto space-y-6">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-[#0d5c4e] via-[#094237] to-[#164e63] rounded-3xl p-6 sm:p-8 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-2xl font-bold text-[#f4cf70] shrink-0">
              {profile?.name ? profile.name.charAt(0).toUpperCase() : user?.name ? user.name.charAt(0).toUpperCase() : 'B'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  Welcome, {profile?.name || user?.name || 'Entrepreneur'}
                </h1>
                <span className="rounded-full bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 px-2.5 py-0.5 text-xs font-semibold">
                  {userCategory} Beneficiary
                </span>
              </div>
              <p className="text-emerald-100 text-xs sm:text-sm mt-1 flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-[#f4cf70]" />
                <span>
                  {profile?.district || 'Ahmedabad'}, {profile?.state || 'Gujarat'}
                </span>
                <span>•</span>
                <span>{profile?.occupation || 'Micro Enterprise'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchDashboardData}
              disabled={refreshing}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition text-xs flex items-center gap-1.5"
              title="Refresh Dashboard"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <Link
              href="/profile"
              className="px-4 py-2.5 rounded-xl bg-white text-slate-900 font-bold text-xs hover:bg-emerald-50 transition shadow-sm"
            >
              Edit Profile
            </Link>
          </div>
        </div>

        {/* Top 4 Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pre-Qualified Schemes</span>
              <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                <FileText className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 mt-2">{matchedSchemes.length} Available</p>
            <p className="text-xs text-slate-500 mt-1">
              Matched for {userCategory} Category
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Partner Branches</span>
              <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Building2 className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-emerald-700 mt-2">{partners.length} Desks</p>
            <p className="text-xs text-slate-500 mt-1">
              SCAs, PSBs & RRBs in Gujarat
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Concessional Rates</span>
              <div className="h-8 w-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
                <CreditCard className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 mt-2">
              {isFemale ? '3.5% – 6.0% p.a.' : '4.0% – 6.5% p.a.'}
            </p>
            <p className="text-xs text-purple-700 font-medium mt-1">
              {isFemale ? '0.50% female rebate applied' : 'Standard statutory rate'}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Document Readiness</span>
              <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                <ShieldCheck className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 mt-2">
              {checkedDocs.length} of {DEFAULT_DOCUMENTS.length} Ready
            </p>
            <p className="text-xs text-emerald-600 font-medium mt-1">
              {checkedDocs.length >= 4 ? 'Ready for partner verification' : 'Prepare remaining documents'}
            </p>
          </div>
        </div>

        {/* Main Grid: Matched Schemes & Document Checklist (Left) & Partner Desks / Profile (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Matched Schemes & Checklist (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Pre-Qualified Schemes Section */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Your Recommended Schemes</h2>
                  <p className="text-xs text-slate-500">
                    Statutory welfare schemes matched to your socio-economic profile and location
                  </p>
                </div>
                <Link
                  href="/eligibility"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0d5c4e] text-white text-xs font-bold hover:bg-[#094237] transition shadow-xs self-start sm:self-auto"
                >
                  <Sparkles className="h-3.5 w-3.5 text-[#f4cf70]" />
                  <span>Custom Eligibility Check</span>
                </Link>
              </div>

              {loading ? (
                <div className="py-12 text-center text-sm text-slate-500">
                  <div className="h-6 w-6 rounded-full border-2 border-[#0d5c4e] border-t-transparent animate-spin mx-auto mb-2" />
                  Matching schemes to your profile...
                </div>
              ) : displaySchemes.length === 0 ? (
                <div className="py-10 text-center text-sm text-slate-500">
                  No schemes found matching your current parameters.
                </div>
              ) : (
                <div className="grid gap-3.5">
                  {displaySchemes.map((scheme) => (
                    <div
                      key={scheme.id}
                      className="p-4 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/20 transition-all bg-white"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-slate-900 text-sm">{scheme.name}</h3>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase">
                              {scheme.scheme_type.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2">{scheme.description}</p>
                        </div>
                      </div>

                      <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="flex flex-wrap items-center gap-4">
                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Max Assistance</span>
                            <span className="font-extrabold text-slate-900">{formatCurrency(scheme.max_loan)}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Interest Rate</span>
                            <span className="font-extrabold text-emerald-700">
                              {scheme.interest_rate > 0 ? `${scheme.interest_rate}% p.a.` : '0% (Grant / Subsidy)'}
                            </span>
                          </div>
                          {scheme.moratorium > 0 && (
                            <div>
                              <span className="text-slate-400 block text-[10px] uppercase font-bold">Moratorium</span>
                              <span className="font-extrabold text-blue-700">{scheme.moratorium} Months</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {scheme.interest_rate > 0 && scheme.max_tenure > 0 && (
                            <Link
                              href={`/calculator?principal=${Math.min(scheme.max_loan, 300000)}&rate=${scheme.interest_rate}&tenure=${scheme.max_tenure}&moratorium=${scheme.moratorium || 0}`}
                              className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold text-xs transition"
                            >
                              EMI
                            </Link>
                          )}
                          <Link
                            href={`/partners?scheme=${encodeURIComponent(scheme.name)}`}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 font-bold text-xs transition shadow-xs"
                          >
                            Find Partner &rarr;
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Mandatory Document Preparation Checklist */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-[#0d5c4e]" />
                    <span>Statutory Document Preparation Checklist</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Prepare and carry these mandatory physical copies when visiting your authorized channel partner desk.
                  </p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
                  {checkedDocs.length} / {DEFAULT_DOCUMENTS.length} Prepared
                </span>
              </div>

              <div className="grid gap-2.5">
                {DEFAULT_DOCUMENTS.map((doc) => {
                  const isReady = checkedDocs.includes(doc.id);
                  return (
                    <div
                      key={doc.id}
                      onClick={() => toggleDoc(doc.id)}
                      className={`flex items-start gap-3 p-3 rounded-2xl border transition cursor-pointer select-none ${
                        isReady
                          ? 'bg-emerald-50/50 border-emerald-300'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <button type="button" className="mt-0.5 text-emerald-700">
                        {isReady ? (
                          <CheckSquare className="h-5 w-5 text-emerald-600" />
                        ) : (
                          <Square className="h-5 w-5 text-slate-300" />
                        )}
                      </button>
                      <div className="flex-1">
                        <p className={`text-xs font-bold ${isReady ? 'text-slate-900' : 'text-slate-700'}`}>
                          {doc.name}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{doc.desc}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        isReady ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {isReady ? 'READY' : 'PENDING'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Quick Action Cards, Partner Desks & Profile Snapshot (4 Cols) */}
          <div className="lg:col-span-4 space-y-5">
            {/* Quick Portals */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Essential Portals</h3>

              <div className="space-y-2">
                <Link
                  href="/eligibility"
                  className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 hover:border-[#0d5c4e] hover:bg-emerald-50/50 transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-emerald-100 text-[#0d5c4e] flex items-center justify-center">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 group-hover:text-[#0d5c4e]">Scheme Matcher</p>
                      <p className="text-[10px] text-slate-500">Instant statutory assessment</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-[#0d5c4e] transition-transform group-hover:translate-x-0.5" />
                </Link>

                <Link
                  href="/calculator"
                  className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 hover:border-blue-600 hover:bg-blue-50/50 transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                      <Calculator className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 group-hover:text-blue-700">EMI & Moratorium</p>
                      <p className="text-[10px] text-slate-500">Reducing balance repayment</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-blue-700 transition-transform group-hover:translate-x-0.5" />
                </Link>

                <Link
                  href="/partners"
                  className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 hover:border-orange-600 hover:bg-orange-50/50 transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center">
                      <Building2 className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 group-hover:text-orange-700">Partner Locator</p>
                      <p className="text-[10px] text-slate-500">Find nearest SCA or bank</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-orange-700 transition-transform group-hover:translate-x-0.5" />
                </Link>

                <Link
                  href="/assistant"
                  className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 hover:border-purple-600 hover:bg-purple-50/50 transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 group-hover:text-purple-700">AI Counselor</p>
                      <p className="text-[10px] text-slate-500">Voice & text statutory assistant</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-purple-700 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>

            {/* Nearest Authorized Channel Partners */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Nearest Partner Desks</h3>
                <Link href="/partners" className="text-xs font-bold text-[#0d5c4e] hover:underline">
                  View All &rarr;
                </Link>
              </div>

              <div className="space-y-2.5">
                {activePartners.map((p) => (
                  <div key={p.id} className="p-3 rounded-2xl border border-slate-200 bg-slate-50/60 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 line-clamp-1">{p.name}</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                        {p.type}
                      </span>
                    </div>
                    {p.address && <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{p.address}</p>}
                    <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-200/60 text-[11px]">
                      <span className="flex items-center gap-1 text-slate-600">
                        <Phone className="h-3 w-3" />
                        <span>{p.phone || '079-2325-0000'}</span>
                      </span>
                      <span className="font-bold text-emerald-700">Active Intake</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Profile Snapshot Card */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Profile Snapshot</h3>
                <Link href="/profile" className="text-xs font-bold text-[#0d5c4e] hover:underline">
                  Edit
                </Link>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Annual Income</span>
                  <span className="font-bold text-slate-800">{formatCurrency(profile?.annual_income || 250000)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Social Category</span>
                  <span className="font-bold text-slate-800">{profile?.category || 'SC'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Gender</span>
                  <span className="font-bold text-slate-800 capitalize">{profile?.gender || 'Male'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">State / UT</span>
                  <span className="font-bold text-slate-800">{profile?.state || 'Gujarat'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">District</span>
                  <span className="font-bold text-slate-800">{profile?.district || 'Ahmedabad'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
