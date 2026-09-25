'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Scheme } from '@/types';
import { formatCurrency } from '@/lib/utils';

export default function SchemesPage() {
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedPurpose, setSelectedPurpose] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlPurpose = params.get('purpose');
      const urlSearch = params.get('search');
      if (urlPurpose) setSelectedPurpose(urlPurpose);
      if (urlSearch) setSearch(urlSearch);
    }
  }, []);

  useEffect(() => {
    async function fetchSchemes() {
      try {
        const res = await api.get<Scheme[]>('/schemes/');
        setSchemes(res.data);
      } catch (err) {
        console.error('Failed to load schemes:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchSchemes();
  }, []);

  const purposes = [
    { id: 'ALL', label: 'All Categories' },
    { id: 'business', label: '💼 Business & MSME' },
    { id: 'healthcare', label: '🏥 Healthcare' },
    { id: 'social_security', label: '🛡️ Social Security & Pension' },
    { id: 'housing', label: '🏠 Housing & Solar' },
    { id: 'agriculture', label: '🌾 Agriculture' },
    { id: 'education', label: '🎓 Education' },
  ];

  const categories = [
    { id: 'ALL', label: 'All Social Categories' },
    { id: 'SC', label: 'Scheduled Caste (SC)' },
    { id: 'ST', label: 'Scheduled Tribe (ST)' },
    { id: 'OBC', label: 'OBC' },
    { id: 'GENERAL', label: 'General / Open' },
  ];

  const filteredSchemes = schemes.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase());

    const matchesPurpose =
      selectedPurpose === 'ALL' ||
      (s.eligible_purposes &&
        s.eligible_purposes.some((p) => p.toLowerCase().includes(selectedPurpose.toLowerCase())));

    const matchesCategory =
      selectedCategory === 'ALL' ||
      (s.eligible_categories &&
        (s.eligible_categories.includes(selectedCategory) ||
          s.eligible_categories.includes('GENERAL')));

    return matchesSearch && matchesPurpose && matchesCategory;
  });

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-blue-600 font-semibold mb-2">
            <span>GOVERNMENT WELFARE DIRECTORY</span>
            <span>•</span>
            <span>VERIFIED PORTAL</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Central & State Financial Assistance Schemes
          </h1>
          <p className="text-gray-600 max-w-3xl">
            Browse verified welfare schemes from the Ministry of Social Justice and Empowerment,
            NSFDC, MSME, and Government of India. Filter by category, loan purpose, and benefit limits.
          </p>
        </div>

        {/* Sector Quick Filter Cards with AI Images */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: '🌾 Agriculture & Farming', img: '/images/agriculture.jpg', purpose: 'agriculture', search: '', desc: 'Farm equipment & dairy' },
            { label: '💼 Business & MSME', img: '/images/business.jpg', purpose: 'business', search: '', desc: 'Credit & term loans' },
            { label: '🛒 Street Vendors', img: '/images/vendors.jpg', purpose: 'ALL', search: 'SVANidhi', desc: 'Working capital micro-loans' },
            { label: '🏺 Artisans & Crafts', img: '/images/artisans.jpg', purpose: 'ALL', search: 'Vishwakarma', desc: 'Toolkit grants & training' },
          ].map((sec) => (
            <button
              key={sec.label}
              onClick={() => {
                setSelectedPurpose(sec.purpose);
                setSearch(sec.search);
              }}
              className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white text-left p-2.5 hover:shadow-lg transition-all hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <div className="relative aspect-[16/9] rounded-lg overflow-hidden mb-2 bg-gray-100">
                <img
                  src={sec.img}
                  alt={sec.label}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <span className="absolute bottom-1.5 left-2 text-[11px] font-bold text-white drop-shadow">
                  {sec.label}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 px-1 truncate">{sec.desc}</p>
            </button>
          ))}
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                🔍
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search scheme name, keyword, or purpose..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full md:w-auto px-3 py-2 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Purpose Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-t pt-4">
            {purposes.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPurpose(p.id)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition ${
                  selectedPurpose === p.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Schemes Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredSchemes.length === 0 ? (
          <div className="bg-white rounded-xl border p-12 text-center">
            <p className="text-gray-500 text-lg mb-4">No schemes matched your search criteria.</p>
            <button
              onClick={() => {
                setSearch('');
                setSelectedPurpose('ALL');
                setSelectedCategory('ALL');
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSchemes.map((scheme) => (
              <div
                key={scheme.id}
                className="bg-white rounded-xl border hover:shadow-md transition flex flex-col justify-between overflow-hidden"
              >
                <div className="p-6">
                  {/* Badge Row */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      {scheme.scheme_type.replace('_', ' ')}
                    </span>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded ${
                        scheme.data_status === 'VERIFIED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {scheme.data_status === 'VERIFIED' ? '✓ Verified Data' : 'Demo Data'}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-gray-900 mb-2 leading-snug">
                    <Link href={`/schemes/${scheme.id}`} className="hover:text-blue-600">
                      {scheme.name}
                    </Link>
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                    {scheme.description}
                  </p>

                  {/* Financial Highlights Box */}
                  <div className="bg-gray-50 rounded-lg p-3 grid grid-cols-2 gap-2 text-xs mb-4">
                    <div>
                      <span className="text-gray-500 block">Max Benefit / Loan</span>
                      <span className="font-bold text-gray-900 text-sm">
                        {scheme.max_loan > 0 ? formatCurrency(scheme.max_loan) : 'Grant / Subsidy'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Interest Rate</span>
                      <span className="font-bold text-emerald-600 text-sm">
                        {scheme.interest_rate === 0
                          ? '0% (Subsidy)'
                          : `${scheme.interest_rate}% p.a.`}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Max Tenure</span>
                      <span className="font-medium text-gray-800">
                        {scheme.max_tenure > 0
                          ? `${Math.round(scheme.max_tenure / 12)} Years (${scheme.max_tenure}m)`
                          : 'One-time'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Family Income Cap</span>
                      <span className="font-medium text-gray-800">
                        {scheme.max_income ? `≤ ₹${scheme.max_income / 100000} Lakh` : 'No Cap'}
                      </span>
                    </div>
                  </div>

                  {/* Categories */}
                  <div className="flex flex-wrap gap-1 mb-2">
                    {scheme.eligible_categories?.map((cat) => (
                      <span
                        key={cat}
                        className="text-[11px] font-medium bg-gray-100 text-gray-700 px-2 py-0.5 rounded"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="border-t bg-gray-50/50 p-4 flex items-center justify-between gap-2">
                  <Link
                    href={`/schemes/${scheme.id}`}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                  >
                    View Details →
                  </Link>
                  <div className="flex items-center gap-2">
                    {scheme.interest_rate > 0 && scheme.max_tenure > 0 && (
                      <Link
                        href={`/calculator?principal=${Math.min(
                          scheme.max_loan,
                          500000
                        )}&rate=${scheme.interest_rate}&tenure=${scheme.max_tenure}&moratorium=${
                          scheme.moratorium || 0
                        }`}
                        className="text-xs px-2.5 py-1 bg-white border rounded text-gray-700 hover:bg-gray-100"
                      >
                        Calc EMI
                      </Link>
                    )}
                    <Link
                      href={`/eligibility`}
                      className="text-xs px-3 py-1 bg-blue-600 text-white rounded font-medium hover:bg-blue-700"
                    >
                      Check Eligibility
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
