'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { Scheme } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { resolveDocumentDetail } from '@/lib/document-registry';

export default function SchemeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [scheme, setScheme] = useState<Scheme | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkedDocs, setCheckedDocs] = useState<string[]>([]);
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null);

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
      <div className="w-[90%] max-w-[1700px] mx-auto px-4">
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

            {/* Mandatory Statutory Documents with Proper Specifications */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <span className="text-blue-600">📑</span> Mandatory Statutory Documents & Verification Protocol
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Official issuing authorities, acceptable formats, validity periods, and desk verification criteria.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    {checkedDocs.length} of {scheme.required_documents?.length || 0} Prepared
                  </span>
                </div>
              </div>

              <div className="grid gap-3">
                {scheme.required_documents?.map((docStr, idx) => {
                  const doc = resolveDocumentDetail(docStr);
                  const isChecked = checkedDocs.includes(docStr);
                  const isExpanded = expandedDoc === docStr || (expandedDoc === null && idx === 0);

                  return (
                    <div
                      key={idx}
                      className={`rounded-2xl border transition-all ${
                        isChecked
                          ? 'border-emerald-300 bg-emerald-50/20'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      {/* Summary Header */}
                      <div className="p-4 flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1">
                          <button
                            type="button"
                            onClick={() => {
                              setCheckedDocs((prev) =>
                                prev.includes(docStr) ? prev.filter((d) => d !== docStr) : [...prev, docStr]
                              );
                            }}
                            className="mt-0.5 text-slate-400 hover:text-emerald-600 transition shrink-0"
                            title="Mark document as prepared"
                          >
                            {isChecked ? (
                              <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-emerald-600 text-white text-xs font-bold">
                                ✓
                              </span>
                            ) : (
                              <span className="inline-flex h-5 w-5 items-center justify-center rounded-md border-2 border-slate-300 bg-white text-xs"></span>
                            )}
                          </button>

                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className={`text-sm font-bold ${isChecked ? 'text-emerald-950 line-through' : 'text-slate-900'}`}>
                                {doc.name}
                              </h3>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 uppercase">
                                {doc.categoryLabel}
                              </span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                                Mandatory
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                              <strong>Issuing Authority:</strong> {doc.issuingAuthority}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setExpandedDoc(expandedDoc === docStr ? '' : docStr)}
                          className="px-2.5 py-1 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-lg transition shrink-0"
                        >
                          {isExpanded ? 'Hide Specs ↑' : 'View Specs ↓'}
                        </button>
                      </div>

                      {/* Expandable Proper Document Details */}
                      {isExpanded && (
                        <div className="px-4 pb-4 pt-3 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-50/70 rounded-b-2xl">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                              Statutory Purpose & Requirement
                            </span>
                            <p className="text-slate-700 leading-relaxed">{doc.statutoryPurpose}</p>
                          </div>

                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                              Acceptable Formats & Required Copies
                            </span>
                            <p className="text-slate-700">{doc.acceptableFormats}</p>
                            <p className="text-[11px] font-medium text-slate-500 mt-1">
                              <strong>Copies to carry:</strong> {doc.copiesRequired}
                            </p>
                          </div>

                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                              Validity & Recency
                            </span>
                            <p className="text-slate-700">{doc.validityPeriod}</p>
                          </div>

                          <div>
                            <span className="text-[10px] uppercase font-bold text-amber-700 block mb-0.5">
                              Common Rejection Pitfalls
                            </span>
                            <p className="text-slate-600">{doc.commonPitfalls}</p>
                          </div>

                          <div className="md:col-span-2 pt-2 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-2">
                            <span className="text-[11px] text-slate-500">
                              <strong>How to Obtain:</strong> {doc.howToObtain}
                            </span>
                            {doc.portalUrl && (
                              <a
                                href={doc.portalUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline"
                              >
                                <span>Official Portal / Apply Link</span>
                                <span>&rarr;</span>
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
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
