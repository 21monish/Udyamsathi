'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { Scheme } from '@/types';
import { formatCurrency } from '@/lib/utils';

export default function SchemeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [scheme, setScheme] = useState<Scheme | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchScheme() {
      try {
        const res = await api.get<Scheme>(`/schemes/${params.id}`);
        setScheme(res.data);
      } catch (err) {
        console.error('Failed to load scheme:', err);
      } finally {
        setLoading(false);
      }
    }
    if (params.id) {
      fetchScheme();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-28 min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!scheme) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Scheme Not Found</h1>
        <p className="text-gray-600 mb-6">The requested scheme ID does not exist.</p>
        <Link href="/schemes" className="px-4 py-2 bg-blue-600 text-white rounded-lg">
          Back to Scheme Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/schemes" className="hover:text-blue-600">
            ← Back to All Schemes
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium truncate">{scheme.name}</span>
        </div>

        {/* Hero Card */}
        <div className="bg-white rounded-xl shadow-sm border p-6 md:p-8 mb-8">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              {scheme.scheme_type.replace('_', ' ')}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                scheme.data_status === 'VERIFIED'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              {scheme.data_status === 'VERIFIED' ? '✓ Verified Government Source' : 'Demonstration Data'}
            </span>
            {scheme.source_url && (
              <a
                href={scheme.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline flex items-center gap-1 ml-auto"
              >
                Official Scheme Portal ↗
              </a>
            )}
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">{scheme.name}</h1>
          <p className="text-gray-700 text-base leading-relaxed mb-6">{scheme.description}</p>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
            <div>
              <span className="text-xs text-gray-600 block mb-1">Max Loan / Benefit</span>
              <span className="text-lg md:text-xl font-bold text-gray-900">
                {scheme.max_loan > 0 ? formatCurrency(scheme.max_loan) : 'Grant / Subsidy'}
              </span>
            </div>
            <div>
              <span className="text-xs text-gray-600 block mb-1">Interest Rate</span>
              <span className="text-lg md:text-xl font-bold text-emerald-600">
                {scheme.interest_rate === 0 ? '0% (Subsidy)' : `${scheme.interest_rate}% p.a.`}
              </span>
            </div>
            <div>
              <span className="text-xs text-gray-600 block mb-1">Max Tenure</span>
              <span className="text-lg md:text-xl font-bold text-gray-900">
                {scheme.max_tenure > 0 ? `${Math.round(scheme.max_tenure / 12)} Years` : 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-xs text-gray-600 block mb-1">Moratorium</span>
              <span className="text-lg md:text-xl font-bold text-gray-900">
                {scheme.moratorium ? `${scheme.moratorium} Months` : 'None'}
              </span>
            </div>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column: Eligibility & Documents */}
          <div className="md:col-span-2 space-y-6">
            {/* Eligibility Highlights */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>📋</span> Eligibility Criteria
              </h2>
              <ul className="space-y-3 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <div>
                    <strong className="text-gray-900">Eligible Categories:</strong>{' '}
                    {scheme.eligible_categories?.join(', ') || 'All categories'}
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <div>
                    <strong className="text-gray-900">Eligible Purposes:</strong>{' '}
                    {scheme.eligible_purposes?.map((p) => p.replace('_', ' ')).join(', ') || 'All purposes'}
                  </div>
                </li>
                {scheme.max_income && (
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <div>
                      <strong className="text-gray-900">Annual Family Income Ceiling:</strong>{' '}
                      Up to {formatCurrency(scheme.max_income)}
                    </div>
                  </li>
                )}
                {scheme.min_age && (
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <div>
                      <strong className="text-gray-900">Age Requirement:</strong> Minimum {scheme.min_age} years
                      {scheme.max_age ? ` (up to ${scheme.max_age} years)` : ''}
                    </div>
                  </li>
                )}
                {scheme.min_education && (
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <div>
                      <strong className="text-gray-900">Minimum Education:</strong>{' '}
                      {scheme.min_education.replace('_', ' ').toUpperCase()}
                    </div>
                  </li>
                )}
              </ul>
            </div>

            {/* Required Documents */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>📑</span> Mandatory Application Documents
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {scheme.required_documents?.map((doc, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-3 rounded-lg border bg-gray-50 text-xs font-medium text-gray-800"
                  >
                    <span className="text-blue-600 font-bold">📄</span>
                    <span>{doc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Subsidy Information */}
            {scheme.subsidy_info && (
              <div className="bg-amber-50 rounded-xl border border-amber-200 p-6">
                <h2 className="text-base font-bold text-amber-900 mb-2 flex items-center gap-2">
                  <span>💡</span> Government Subsidy & Concessions
                </h2>
                <p className="text-sm text-amber-800 leading-relaxed">{scheme.subsidy_info}</p>
              </div>
            )}
          </div>

          {/* Right Column: Actions & Partners */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
              <h3 className="font-bold text-gray-900 text-base">Next Steps</h3>
              <p className="text-xs text-gray-600">
                Confirm your eligibility against our deterministic engine or simulate monthly repayment.
              </p>
              <Link
                href="/eligibility"
                className="w-full inline-block text-center py-2.5 px-4 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 shadow-sm"
              >
                Assess My Eligibility
              </Link>
              {scheme.interest_rate > 0 && scheme.max_tenure > 0 && (
                <Link
                  href={`/calculator?principal=${Math.min(
                    scheme.max_loan,
                    500000
                  )}&rate=${scheme.interest_rate}&tenure=${scheme.max_tenure}&moratorium=${
                    scheme.moratorium || 0
                  }`}
                  className="w-full inline-block text-center py-2.5 px-4 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-50"
                >
                  Calculate Monthly EMI
                </Link>
              )}
              <Link
                href={`/partners?scheme=${encodeURIComponent(scheme.name)}`}
                className="w-full inline-block text-center py-2.5 px-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg font-medium text-sm hover:bg-emerald-100"
              >
                Find Authorised Partners
              </Link>
            </div>

            {/* Authorised Partner Channels */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="font-bold text-gray-900 text-sm mb-3">Disbursing Channel Types</h3>
              <div className="flex flex-wrap gap-2">
                {scheme.partner_types?.map((type) => (
                  <span
                    key={type}
                    className="px-2.5 py-1 bg-gray-100 text-gray-800 rounded text-xs font-semibold"
                  >
                    {type}
                  </span>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-3">
                SCA: State Channelizing Agency
                <br />
                PSB: Public Sector Bank
                <br />
                RRB: Regional Rural Bank
                <br />
                NBFC-MFI: Micro Finance Institution
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
