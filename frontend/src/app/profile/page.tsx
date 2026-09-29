'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';
import IndiaStateSelect from '@/components/forms/IndiaStateSelect';
import {
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Save,
  ArrowRight,
  Shield,
  Briefcase,
  MapPin,
  FileText,
  BadgePercent,
  Info,
} from 'lucide-react';

interface ProfileState {
  name: string;
  email: string;
  mobile: string;
  language: string;
  role: string;
  annual_income: number | string;
  category: string;
  gender: string;
  age: number | string;
  occupation: string;
  education_status: string;
  state: string;
  district: string;
  pincode: string;
}

const defaultProfile: ProfileState = {
  name: '',
  email: '',
  mobile: '',
  language: 'en',
  role: 'BENEFICIARY',
  annual_income: 250000,
  category: 'SC',
  gender: 'male',
  age: 30,
  occupation: 'Small Business Owner',
  education_status: '12th_standard',
  state: 'Gujarat',
  district: 'Ahmedabad',
  pincode: '380001',
};

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState<ProfileState>(defaultProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        const res = await api.get('/auth/profile');
        if (res.data) {
          setProfile({
            name: res.data.name || user?.name || '',
            email: res.data.email || user?.email || '',
            mobile: res.data.mobile || '',
            language: res.data.language || 'en',
            role: res.data.role || 'BENEFICIARY',
            annual_income: res.data.annual_income ?? 250000,
            category: res.data.category || 'SC',
            gender: res.data.gender || 'male',
            age: res.data.age ?? 30,
            occupation: res.data.occupation || 'Small Business Owner',
            education_status: res.data.education_status || '12th_standard',
            state: res.data.state || 'Gujarat',
            district: res.data.district || 'Ahmedabad',
            pincode: res.data.pincode || '380001',
          });
        }
      } catch (err) {
        console.warn('Could not load profile from API, using local values:', err);
        if (user) {
          setProfile((prev) => ({
            ...prev,
            name: user.name,
            email: user.email,
            role: user.role,
          }));
        }
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [user]);

  // Calculate profile completeness score
  const calculateCompleteness = () => {
    let score = 0;
    if (profile.name) score += 15;
    if (profile.email) score += 10;
    if (profile.mobile) score += 10;
    if (profile.annual_income) score += 15;
    if (profile.category) score += 10;
    if (profile.gender) score += 10;
    if (profile.age) score += 10;
    if (profile.occupation) score += 10;
    if (profile.state && profile.district) score += 10;
    return Math.min(score, 100);
  };

  const completeness = calculateCompleteness();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      const payload = {
        name: profile.name,
        mobile: profile.mobile || null,
        language: profile.language,
        annual_income: Number(profile.annual_income),
        category: profile.category,
        gender: profile.gender,
        age: Number(profile.age),
        occupation: profile.occupation,
        education_status: profile.education_status,
        state: profile.state,
        district: profile.district,
        pincode: profile.pincode,
      };

      const res = await api.put('/auth/profile', payload);
      if (res.data) {
        setFeedback({
          type: 'success',
          message: 'Your profile has been saved and synchronized with the statutory scheme matching engine.',
        });
        await refreshUser();
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.detail || 'Failed to save profile. Please check your network and try again.',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 rounded-full border-4 border-[#0d5c4e] border-t-transparent animate-spin" />
          <p className="text-sm font-medium text-slate-600">Loading your official beneficiary profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="w-[90%] max-w-[1700px] mx-auto space-y-6">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-[#0d5c4e] to-[#164e63] rounded-3xl p-6 sm:p-8 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-2xl font-bold text-[#f4cf70] shrink-0">
              {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  {profile.name || 'Beneficiary Profile'}
                </h1>
                <span className="rounded-full bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 px-2.5 py-0.5 text-xs font-semibold">
                  {profile.category} Verified
                </span>
              </div>
              <p className="text-emerald-100 text-xs sm:text-sm mt-1">
                Official Demographic & Socio-Economic Record for NSFDC & Statutory Loan Portals
              </p>
            </div>
          </div>

          {/* Completeness Card */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/15 p-4 min-w-[220px]">
            <div className="flex justify-between items-center text-xs font-medium mb-1.5">
              <span className="text-emerald-100">Profile Completeness</span>
              <span className="font-bold text-white">{completeness}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
              <div
                className="bg-[#f4cf70] h-full rounded-full transition-all duration-700"
                style={{ width: `${completeness}%` }}
              />
            </div>
            <p className="text-[11px] text-emerald-200 mt-2">
              {completeness === 100
                ? 'Ready for instant statutory matching'
                : 'Complete all fields for priority sanctioning'}
            </p>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`rounded-2xl p-4 text-sm flex items-start gap-3 border transition-all ${
              feedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                : 'bg-red-50 text-red-900 border-red-200'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p className="font-semibold">{feedback.type === 'success' ? 'Profile Synchronized' : 'Update Failed'}</p>
              <p className="text-xs mt-0.5">{feedback.message}</p>
            </div>
          </div>
        )}

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Personal & Contact Information */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                <UserCheck className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Personal & Contact Identification</h2>
                <p className="text-xs text-slate-500">Identity details verified against Aadhaar / state registry</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Full Legal Name *
                </label>
                <input
                  type="text"
                  required
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d5c4e]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Registered Email (Read-Only)
                </label>
                <input
                  type="email"
                  disabled
                  value={profile.email}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-100 bg-slate-50 text-slate-500 text-sm cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Mobile Number (SMS Updates)
                </label>
                <input
                  type="tel"
                  value={profile.mobile}
                  onChange={(e) => setProfile({ ...profile, mobile: e.target.value })}
                  placeholder="e.g. 9876543210"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d5c4e]"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Statutory Socio-Economic Data (For Scheme Matching) */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Statutory Eligibility Parameters</h2>
                <p className="text-xs text-slate-500">
                  Direct inputs utilized by the NSFDC deterministic matching engine
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Annual Income */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Annual Family Income (₹) *
                  </label>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    Cap: ₹5,00,000
                  </span>
                </div>
                <input
                  type="number"
                  required
                  min={0}
                  step={5000}
                  value={profile.annual_income}
                  onChange={(e) => setProfile({ ...profile, annual_income: e.target.value })}
                  placeholder="e.g. 250000"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d5c4e]"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Families earning up to ₹5.00 lakh qualify for all NSFDC concessional loans.
                </p>
              </div>

              {/* Social Category */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Social Category *
                </label>
                <select
                  value={profile.category}
                  onChange={(e) => setProfile({ ...profile, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d5c4e] bg-white"
                >
                  <option value="SC">Scheduled Caste (SC) — NSFDC Primary</option>
                  <option value="ST">Scheduled Tribe (ST)</option>
                  <option value="OBC">Other Backward Class (OBC)</option>
                  <option value="GENERAL">General / Other</option>
                </select>
              </div>

              {/* Gender */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Gender *
                  </label>
                  <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded flex items-center gap-1">
                    <BadgePercent className="h-3 w-3" /> 0.5% Rebate
                  </span>
                </div>
                <select
                  value={profile.gender}
                  onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d5c4e] bg-white"
                >
                  <option value="male">Male</option>
                  <option value="female">Female (Automatic 0.5% Interest Discount)</option>
                  <option value="other">Other</option>
                </select>
                <p className="text-[11px] text-purple-600 mt-1">
                  Women beneficiaries receive 0.5% p.a. rebate on Micro Finance and Educational Loans.
                </p>
              </div>

              {/* Age */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Applicant Age (Years) *
                </label>
                <input
                  type="number"
                  required
                  min={18}
                  max={75}
                  value={profile.age}
                  onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                  placeholder="e.g. 30"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d5c4e]"
                />
              </div>

              {/* Education Status */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Highest Education Level *
                </label>
                <select
                  value={profile.education_status}
                  onChange={(e) => setProfile({ ...profile, education_status: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d5c4e] bg-white"
                >
                  <option value="none">No Formal Schooling</option>
                  <option value="8th_standard">8th Standard Pass</option>
                  <option value="10th_standard">10th Standard (Matric)</option>
                  <option value="12th_standard">12th Standard (Higher Secondary)</option>
                  <option value="diploma">Vocational / Technical Diploma</option>
                  <option value="graduate">Graduate Degree</option>
                  <option value="post_graduate">Post Graduate / Professional</option>
                </select>
              </div>

              {/* Interface Language */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Preferred Portal Language
                </label>
                <select
                  value={profile.language}
                  onChange={(e) => setProfile({ ...profile, language: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d5c4e] bg-white"
                >
                  <option value="en">English</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Enterprise & Geographic Location */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="h-9 w-9 rounded-xl bg-orange-50 text-orange-700 flex items-center justify-center">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Enterprise & Geolocation Details</h2>
                <p className="text-xs text-slate-500">
                  Routes your file to the authorized State Channelizing Agency (SCA) or Bank Branch
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="lg:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Proposed Enterprise / Occupation *
                </label>
                <input
                  type="text"
                  required
                  value={profile.occupation}
                  onChange={(e) => setProfile({ ...profile, occupation: e.target.value })}
                  placeholder="e.g. Retail Grocery Store, Tailoring Unit, E-Rickshaw"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d5c4e]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  State / Union Territory *
                </label>
                <IndiaStateSelect
                  value={profile.state}
                  onChange={(val) => setProfile({ ...profile, state: val })}
                  className="border-slate-200 rounded-xl py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  District *
                </label>
                <input
                  type="text"
                  required
                  value={profile.district}
                  onChange={(e) => setProfile({ ...profile, district: e.target.value })}
                  placeholder="e.g. Ahmedabad"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d5c4e]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  PIN Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={profile.pincode}
                  onChange={(e) => setProfile({ ...profile, pincode: e.target.value })}
                  placeholder="e.g. 380001"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d5c4e]"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
            <div className="text-xs text-slate-500 flex items-center gap-2">
              <Info className="h-4 w-4 text-slate-400 shrink-0" />
              <span>Data is encrypted and stored in compliance with Indian Data Localization norms.</span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#0d5c4e] hover:bg-[#094237] text-white text-sm font-bold shadow-md transition disabled:opacity-60"
              >
                <Save className="h-4 w-4" />
                <span>{saving ? 'Saving to Database...' : 'Save Profile'}</span>
              </button>

              <Link
                href="/eligibility"
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-black text-white text-sm font-bold shadow-md transition"
              >
                <Sparkles className="h-4 w-4 text-[#f4cf70]" />
                <span>Check Eligibility &rarr;</span>
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
