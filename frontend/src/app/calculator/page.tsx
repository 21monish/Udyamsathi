'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { EMIInput, EMIResponse, AmortizationEntry } from '@/types';
import { formatCurrency } from '@/lib/utils';

export default function CalculatorPage() {
  return (
    <Suspense fallback={<div className="container mx-auto p-12 text-center">Loading Calculator...</div>}>
      <CalculatorContent />
    </Suspense>
  );
}

function CalculatorContent() {
  const searchParams = useSearchParams();

  const [principal, setPrincipal] = useState<number>(200000);
  const [rate, setRate] = useState<number>(8.0);
  const [tenureYears, setTenureYears] = useState<number>(5);
  const [moratoriumMonths, setMoratoriumMonths] = useState<number>(0);

  const [result, setResult] = useState<EMIResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAmortization, setShowAmortization] = useState(false);

  // Sync from query parameters if pre-populated from scheme card
  useEffect(() => {
    const p = searchParams.get('principal');
    const r = searchParams.get('rate');
    const t = searchParams.get('tenure');
    const m = searchParams.get('moratorium');

    if (p) setPrincipal(Number(p));
    if (r) setRate(Number(r));
    if (t) setTenureYears(Math.max(1, Math.round(Number(t) / 12)));
    if (m) setMoratoriumMonths(Number(m));
  }, [searchParams]);

  useEffect(() => {
    async function calculate() {
      setLoading(true);
      try {
        const payload: EMIInput = {
          principal: Number(principal),
          annual_interest_rate: Number(rate),
          tenure_months: Number(tenureYears * 12),
          moratorium_months: Number(moratoriumMonths),
        };
        const res = await api.post<EMIResponse>('/calculator/emi', payload);
        setResult(res.data);
      } catch (err) {
        console.error('Calculation error:', err);
      } finally {
        setLoading(false);
      }
    }

    if (principal > 0 && tenureYears > 0) {
      calculate();
    }
  }, [principal, rate, tenureYears, moratoriumMonths]);

  const principalRatio =
    result && result.total_payment > 0
      ? Math.round((principal / result.total_payment) * 100)
      : 80;
  const interestRatio = 100 - principalRatio;

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Page Title */}
        <div className="text-center mb-8">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-100 text-blue-800">
            FINANCIAL SIMULATOR
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-2">
            Government Concessional Loan EMI Calculator
          </h1>
          <p className="text-gray-600 max-w-xl mx-auto text-sm md:text-base">
            Simulate your monthly installment, total interest expense, and moratorium relief for
            concessional loans (NSFDC, MUDRA, Stand-Up India, PMEGP).
          </p>
        </div>

        {/* Calculator Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          {/* Sliders Form (7 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl shadow-sm border p-6 md:p-8 space-y-6">
            <h2 className="text-lg font-bold text-gray-900 border-b pb-3">Loan Parameters</h2>

            {/* Principal */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-gray-800">Loan Amount (Principal)</label>
                <div className="flex items-center gap-1 border rounded-lg px-3 py-1 bg-gray-50">
                  <span className="text-gray-500 text-sm">₹</span>
                  <input
                    type="number"
                    value={principal}
                    min="10000"
                    max="10000000"
                    step="10000"
                    onChange={(e) => setPrincipal(Number(e.target.value))}
                    className="w-28 text-right font-bold text-gray-900 text-sm bg-transparent focus:outline-none"
                  />
                </div>
              </div>
              <input
                type="range"
                min="10000"
                max="5000000"
                step="10000"
                value={principal}
                onChange={(e) => setPrincipal(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-[11px] text-gray-400 mt-1">
                <span>₹10,000 (Micro)</span>
                <span>₹25 Lakh (PMEGP)</span>
                <span>₹50 Lakh (NSFDC Max)</span>
              </div>
            </div>

            {/* Interest Rate */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-gray-800">Annual Interest Rate (%)</label>
                <div className="flex items-center gap-1 border rounded-lg px-3 py-1 bg-gray-50">
                  <input
                    type="number"
                    value={rate}
                    min="0"
                    max="25"
                    step="0.25"
                    onChange={(e) => setRate(Number(e.target.value))}
                    className="w-16 text-right font-bold text-gray-900 text-sm bg-transparent focus:outline-none"
                  />
                  <span className="text-gray-500 text-sm">%</span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="18"
                step="0.25"
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-[11px] text-gray-400 mt-1">
                <span>5% (Vishwakarma)</span>
                <span>6.5% (NSFDC Micro)</span>
                <span>8% (NSFDC Term)</span>
                <span>12% (MUDRA)</span>
              </div>
            </div>

            {/* Tenure in Years */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-gray-800">Repayment Tenure</label>
                <div className="flex items-center gap-1 border rounded-lg px-3 py-1 bg-gray-50">
                  <input
                    type="number"
                    value={tenureYears}
                    min="1"
                    max="20"
                    onChange={(e) => setTenureYears(Number(e.target.value))}
                    className="w-12 text-right font-bold text-gray-900 text-sm bg-transparent focus:outline-none"
                  />
                  <span className="text-gray-500 text-sm">Years ({tenureYears * 12}m)</span>
                </div>
              </div>
              <input
                type="range"
                min="1"
                max="15"
                step="1"
                value={tenureYears}
                onChange={(e) => setTenureYears(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-[11px] text-gray-400 mt-1">
                <span>1 Year</span>
                <span>5 Years (Standard)</span>
                <span>10 Years (Term Loan)</span>
              </div>
            </div>

            {/* Moratorium Relief Period */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <div>
                  <label className="text-sm font-semibold text-gray-800 block">
                    Moratorium Period (Optional)
                  </label>
                  <span className="text-xs text-gray-500">
                    Repayment holiday granted during business gestation
                  </span>
                </div>
                <div className="flex items-center gap-1 border rounded-lg px-3 py-1 bg-gray-50">
                  <input
                    type="number"
                    value={moratoriumMonths}
                    min="0"
                    max="36"
                    onChange={(e) => setMoratoriumMonths(Number(e.target.value))}
                    className="w-12 text-right font-bold text-gray-900 text-sm bg-transparent focus:outline-none"
                  />
                  <span className="text-gray-500 text-sm">Months</span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="24"
                step="3"
                value={moratoriumMonths}
                onChange={(e) => setMoratoriumMonths(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-[11px] text-gray-400 mt-1">
                <span>0m</span>
                <span>3m (Micro Credit)</span>
                <span>6m (Term Loan)</span>
                <span>12m (Education)</span>
              </div>
            </div>
          </div>

          {/* Results Summary Card (5 Cols) */}
          <div className="lg:col-span-5 bg-gradient-to-br from-blue-900 to-indigo-950 text-white rounded-2xl shadow-md p-6 md:p-8 flex flex-col justify-between">
            <div>
              <span className="text-xs uppercase tracking-wider text-blue-200 font-semibold">
                MONTHLY REPAYMENT
              </span>
              <div className="mt-2 mb-6">
                <span className="text-3xl md:text-4xl font-extrabold text-white">
                  {result ? formatCurrency(result.emi) : '—'}
                </span>
                <span className="text-blue-200 text-sm ml-2">/ month</span>
              </div>

              {/* Breakdown List */}
              <div className="space-y-4 pt-4 border-t border-blue-800/60 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-blue-200">Principal Amount</span>
                  <span className="font-semibold text-white">{formatCurrency(principal)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-200">Total Interest Payable</span>
                  <span className="font-semibold text-emerald-400">
                    {result ? formatCurrency(result.total_interest) : '—'}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-blue-800/40">
                  <span className="text-blue-100 font-bold">Total Amount Payable</span>
                  <span className="font-bold text-white text-base">
                    {result ? formatCurrency(result.total_payment) : '—'}
                  </span>
                </div>
                {moratoriumMonths > 0 && (
                  <div className="flex justify-between items-center text-xs text-amber-300 bg-blue-950/60 p-2.5 rounded-lg border border-amber-400/20">
                    <span>Moratorium Applied:</span>
                    <span>{moratoriumMonths} months principal holiday</span>
                  </div>
                )}
              </div>

              {/* Visual Breakdown Bar */}
              <div className="mt-6 pt-4 border-t border-blue-800/60">
                <div className="flex justify-between text-xs mb-1.5 text-blue-200">
                  <span>Principal ({principalRatio}%)</span>
                  <span>Interest ({interestRatio}%)</span>
                </div>
                <div className="w-full h-3 bg-blue-800/60 rounded-full flex overflow-hidden">
                  <div
                    style={{ width: `${principalRatio}%` }}
                    className="h-full bg-blue-400 transition-all duration-300"
                  ></div>
                  <div
                    style={{ width: `${interestRatio}%` }}
                    className="h-full bg-emerald-400 transition-all duration-300"
                  ></div>
                </div>
              </div>
            </div>

            {/* Toggle Table Button */}
            <div className="mt-6 pt-4 border-t border-blue-800/60">
              <button
                onClick={() => setShowAmortization(!showAmortization)}
                className="w-full py-2.5 px-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs font-semibold transition"
              >
                {showAmortization ? 'Hide Amortization Table' : 'View Monthly Amortization Schedule ↓'}
              </button>
            </div>
          </div>
        </div>

        {/* Amortization Schedule Table */}
        {showAmortization && result && (
          <div className="bg-white rounded-2xl shadow-sm border p-6 md:p-8 animate-fadeIn">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                Month-by-Month Amortization Schedule
              </h3>
              <span className="text-xs text-gray-500">
                Showing full {result.amortization_schedule.length} months
              </span>
            </div>
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-gray-100 text-gray-700 sticky top-0">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold">Month</th>
                    <th className="py-2.5 px-3 font-semibold">EMI Installment</th>
                    <th className="py-2.5 px-3 font-semibold">Principal Component</th>
                    <th className="py-2.5 px-3 font-semibold">Interest Component</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Remaining Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {result.amortization_schedule.map((entry: AmortizationEntry) => (
                    <tr key={entry.month} className="hover:bg-gray-50">
                      <td className="py-2 px-3 font-medium text-gray-800">{entry.month}</td>
                      <td className="py-2 px-3 font-bold text-gray-900">{formatCurrency(entry.emi)}</td>
                      <td className="py-2 px-3 text-blue-700">{formatCurrency(entry.principal)}</td>
                      <td className="py-2 px-3 text-emerald-700">{formatCurrency(entry.interest)}</td>
                      <td className="py-2 px-3 font-medium text-gray-800 text-right">
                        {formatCurrency(entry.balance)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
