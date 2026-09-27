'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { EligibilityInput, EligibilityResponse, SchemeRecommendation } from '@/types';
import { formatCurrency } from '@/lib/utils';

export default function EligibilityPage() {
  const [formData, setFormData] = useState<EligibilityInput>({
    purpose: 'business',
    annual_income: 300000,
    loan_amount: 200000,
    project_cost: 250000,
    age: 28,
    category: 'SC',
    gender: 'male',
    education_status: '12th_standard',
    state: 'Gujarat',
    district: 'Ahmedabad',
  });

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<EligibilityResponse | null>(null);
  const [showIneligible, setShowIneligible] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post<EligibilityResponse>('/eligibility/assess', formData);
      setResults(res.data);
    } catch (err) {
      console.error('Failed to assess eligibility:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Page Header */}
        <div className="text-center mb-8">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-100 text-blue-800">
            DETERMINISTIC RULE ENGINE • ZERO BLACK BOX
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-3 mb-2">
            Scheme Eligibility Assessment
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-sm md:text-base">
            Enter your requirements and applicant details. Our engine evaluates hard statutory rules
            against all central & state schemes to give you 100% explainable results.
          </p>
        </div>

        {/* Input Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border p-6 md:p-8 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Purpose & Sector */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                1. What do you need assistance for?
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: 'business', label: '💼 Small Business / MSME' },
                  { id: 'micro_enterprise', label: '🛠️ Micro Enterprise' },
                  { id: 'education', label: '🎓 Higher Education' },
                  { id: 'housing', label: '🏠 Housing & Solar' },
                  { id: 'agriculture', label: '🌾 Agriculture & Farming' },
                  { id: 'social_security', label: '🛡️ Pension / Social Security' },
                  { id: 'healthcare', label: '🏥 Healthcare Coverage' },
                  { id: 'self_employment', label: '🏪 Self-Employment' },
                ].map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => setFormData({ ...formData, purpose: item.id })}
                    className={`p-3 rounded-xl border text-xs font-medium text-left transition ${
                      formData.purpose === item.id
                        ? 'bg-blue-50 border-blue-600 text-blue-700 font-semibold shadow-sm'
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Financial Requirements */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-1">
                  2. Annual Family Income (₹)
                </label>
                <span className="text-xs text-gray-500 block mb-2">
                  Total annual income of all family members combined
                </span>
                <input
                  type="number"
                  min="0"
                  step="10000"
                  value={formData.annual_income}
                  onChange={(e) =>
                    setFormData({ ...formData, annual_income: Number(e.target.value) })
                  }
                  className="w-full px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  required
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>Selected: {formatCurrency(formData.annual_income)}</span>
                  <span>Cap for SC: ₹5 Lakh</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-1">
                  3. Total Project Cost (₹)
                </label>
                <span className="text-xs text-gray-500 block mb-2">
                  Total estimated capital requirement for your enterprise
                </span>
                <input
                  type="number"
                  min="0"
                  step="10000"
                  value={formData.project_cost || 0}
                  onChange={(e) =>
                    setFormData({ ...formData, project_cost: Number(e.target.value) })
                  }
                  className="w-full px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  required
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>Selected: {formatCurrency(formData.project_cost || 0)}</span>
                  <span>NSFDC Share: Up to 90%</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-1">
                  4. Requested Loan Amount (₹)
                </label>
                <span className="text-xs text-gray-500 block mb-2">
                  Portion of project cost to be funded via scheme loan
                </span>
                <input
                  type="number"
                  min="0"
                  step="10000"
                  value={formData.loan_amount}
                  onChange={(e) =>
                    setFormData({ ...formData, loan_amount: Number(e.target.value) })
                  }
                  className="w-full px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  required
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>Selected: {formatCurrency(formData.loan_amount)}</span>
                </div>
              </div>
            </div>

            {/* Step 3: Social Category, Gender & Demographics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 pt-4 border-t">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-1">
                  5. Social Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2.5 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="SC">Scheduled Caste (SC)</option>
                  <option value="ST">Scheduled Tribe (ST)</option>
                  <option value="OBC">Other Backward Class (OBC)</option>
                  <option value="GENERAL">General / Open</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-1">
                  6. Applicant Gender
                </label>
                <select
                  value={formData.gender || 'male'}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-4 py-2.5 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="male">Male</option>
                  <option value="female">Female (0.5% Interest Rebate)</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-1">
                  7. Age (Years)
                </label>
                <input
                  type="number"
                  min="18"
                  max="100"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-1">
                  8. Educational Status
                </label>
                <select
                  value={formData.education_status}
                  onChange={(e) =>
                    setFormData({ ...formData, education_status: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="none">Below 8th Standard</option>
                  <option value="8th_standard">8th Standard Pass</option>
                  <option value="10th_standard">10th Standard (SSC)</option>
                  <option value="12th_standard">12th Standard (HSC)</option>
                  <option value="diploma">Diploma / ITI</option>
                  <option value="graduate">Graduate & Above</option>
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold rounded-xl shadow-md hover:from-blue-700 hover:to-indigo-800 transition flex items-center justify-center gap-2 text-base"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Evaluating Rules...</span>
                  </>
                ) : (
                  <>
                    <span>Run Deterministic Matching Engine</span>
                    <span>→</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Results Section */}
        {results && (
          <div className="space-y-8 animate-fadeIn">
            {/* Summary Bar */}
            <div className="bg-blue-900 text-white rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs uppercase tracking-wider text-blue-200">
                  ASSESSMENT COMPLETED
                </span>
                <h2 className="text-xl md:text-2xl font-bold mt-1">
                  Found {results.eligible_schemes.length} Scheme(s) You Qualify For
                </h2>
                <p className="text-sm text-blue-100">
                  Total {results.total_schemes_checked} central and state schemes evaluated against your profile.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowIneligible(!showIneligible)}
                  className="text-xs font-semibold px-4 py-2 rounded-lg bg-blue-800 hover:bg-blue-700 text-white border border-blue-600"
                >
                  {showIneligible ? 'Hide Ineligible Schemes' : 'View Ineligible Schemes'}
                </button>
              </div>
            </div>

            {/* Eligible Schemes List */}
            {results.eligible_schemes.length > 0 ? (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <span className="text-emerald-600">✓</span> Highly Recommended Eligible Schemes
                </h3>
                {results.eligible_schemes.map((rec) => (
                  <div
                    key={rec.scheme_id}
                    className="bg-white rounded-xl border border-emerald-200 shadow-sm overflow-hidden"
                  >
                    <div className="p-6 md:p-8">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold px-2.5 py-1 rounded bg-emerald-100 text-emerald-800">
                            {rec.scheme_type.replace('_', ' ')}
                          </span>
                          {rec.female_rebate_applied && (
                            <span className="text-xs font-bold px-2.5 py-1 rounded bg-pink-100 text-pink-800 border border-pink-200 animate-pulse">
                              🌸 0.5% Female Entrepreneur Rebate
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                          Passed All {rec.total_checks} Hard Criteria
                        </span>
                      </div>

                      <h4 className="text-xl font-bold text-gray-900 mb-2">
                        <Link
                          href={`/schemes/${rec.scheme_id}`}
                          className="hover:text-blue-600"
                        >
                          {rec.scheme_name}
                        </Link>
                      </h4>
                      <p className="text-sm text-gray-600 mb-4">{rec.description}</p>

                      {/* Explainability Fit Factors Panel */}
                      <div className="bg-emerald-50/70 rounded-xl border border-emerald-100 p-4 mb-4">
                        <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-900 mb-2">
                          Why You Qualify (Explainable Fit Factors):
                        </h5>
                        <ul className="space-y-1.5 text-xs text-emerald-900">
                          {rec.checks.map((c, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-emerald-600 font-bold">✓</span>
                              <span>
                                <strong>{c.criterion}:</strong> {c.detail}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Statutory Operational Reasoning */}
                      {rec.reasoning && rec.reasoning.length > 0 && (
                        <div className="bg-blue-50/70 rounded-xl border border-blue-100 p-4 mb-6">
                          <h5 className="text-xs font-bold uppercase tracking-wider text-blue-900 mb-2">
                            Statutory NSFDC Operational Guidelines:
                          </h5>
                          <ul className="space-y-1 text-xs text-blue-900">
                            {rec.reasoning.map((r, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-blue-600 font-bold">ℹ️</span>
                                <span>{r}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Financial Metrics */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 rounded-lg p-3 text-xs mb-6">
                        <div>
                          <span className="text-gray-500 block">Max Available</span>
                          <span className="font-bold text-gray-900 text-sm">
                            {formatCurrency(rec.max_loan)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 block">Interest Rate</span>
                          {rec.female_rebate_applied && rec.effective_interest_rate ? (
                            <div className="flex items-baseline gap-1">
                              <span className="line-through text-gray-400 text-xs">{rec.interest_rate}%</span>
                              <span className="font-bold text-pink-600 text-sm">
                                {rec.effective_interest_rate}% p.a.
                              </span>
                            </div>
                          ) : (
                            <span className="font-bold text-emerald-600 text-sm">
                              {rec.interest_rate === 0 ? '0% (Grant)' : `${rec.interest_rate}% p.a.`}
                            </span>
                          )}
                        </div>
                        <div>
                          <span className="text-gray-500 block">Max Tenure</span>
                          <span className="font-medium text-gray-900">
                            {rec.max_tenure > 0 ? `${Math.round(rec.max_tenure / 12)} Years` : 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 block">Required Documents</span>
                          <span className="font-medium text-gray-900">
                            {rec.required_documents.length} Items Listed
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap items-center gap-3">
                        <Link
                          href={`/schemes/${rec.scheme_id}`}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700"
                        >
                          View Scheme Details
                        </Link>
                        {rec.interest_rate > 0 && rec.max_tenure > 0 && (
                          <Link
                            href={`/calculator?principal=${formData.loan_amount}&rate=${rec.effective_interest_rate || rec.interest_rate}&tenure=${rec.max_tenure}`}
                            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50"
                          >
                            Calculate My Monthly EMI
                          </Link>
                        )}
                        <Link
                          href={`/partners?scheme=${encodeURIComponent(rec.scheme_name)}`}
                          className="px-4 py-2 bg-emerald-50 border border-emerald-300 rounded-lg text-xs font-semibold text-emerald-800 hover:bg-emerald-100"
                        >
                          Locate Nearest Partner
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-8 text-center">
                <p className="text-amber-900 font-bold text-lg mb-2">
                  No Direct Match Found For Current Parameters
                </p>
                <p className="text-sm text-amber-800 max-w-xl mx-auto mb-4">
                  Try adjusting the loan amount or exploring general category schemes below.
                </p>
              </div>
            )}

            {/* Ineligible Schemes Section (Transparent Explainability) */}
            {showIneligible && results.ineligible_schemes.length > 0 && (
              <div className="space-y-4 pt-6 border-t">
                <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                  <span>❌</span> Why Other Schemes Were Not Recommended ({results.ineligible_schemes.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {results.ineligible_schemes.map((rec) => (
                    <div
                      key={rec.scheme_id}
                      className="bg-white rounded-lg border border-gray-200 p-4 text-xs"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <strong className="text-gray-900 text-sm">{rec.scheme_name}</strong>
                        <span className="text-[11px] text-red-600 bg-red-50 px-2 py-0.5 rounded font-medium">
                          Failed Criteria
                        </span>
                      </div>
                      <div className="space-y-1">
                        {rec.checks
                          .filter((c) => !c.passed)
                          .map((c, idx) => (
                            <div key={idx} className="text-red-700 bg-red-50/50 p-1.5 rounded">
                              <strong>✗ {c.criterion}:</strong> {c.detail}
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
