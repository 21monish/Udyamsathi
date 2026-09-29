'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { EMIInput, EMIResponse, AmortizationEntry } from '@/types';
import { formatCurrency } from '@/lib/utils';
import {
  Calculator,
  Calendar,
  Sparkles,
  Info,
  ArrowRight,
  ShieldCheck,
  TrendingDown,
  Building2,
  Download,
  Percent,
  CheckCircle2,
  Clock,
  Coins,
  RefreshCw,
} from 'lucide-react';

export default function CalculatorPage() {
  return (
    <Suspense
      fallback={
        <div className="w-[90%] max-w-[1700px] mx-auto p-12 text-center text-sm text-slate-500">
          <div className="h-8 w-8 rounded-full border-2 border-[#0d5c4e] border-t-transparent animate-spin mx-auto mb-3" />
          Loading Concessional Financial Simulator...
        </div>
      }
    >
      <CalculatorContent />
    </Suspense>
  );
}

const PRESETS = [
  {
    name: 'NSFDC Micro Finance (MFS)',
    principal: 125000,
    rate: 6.0,
    tenureYears: 3,
    moratorium: 3,
    badge: '6.0% Concessional',
  },
  {
    name: 'NSFDC Term Loan',
    principal: 500000,
    rate: 8.0,
    tenureYears: 5,
    moratorium: 6,
    badge: 'Standard Business',
  },
  {
    name: 'Pradhan Mantri MUDRA (Kishore)',
    principal: 100000,
    rate: 8.5,
    tenureYears: 3,
    moratorium: 0,
    badge: 'Micro Enterprise',
  },
  {
    name: 'Educational Loan (India)',
    principal: 750000,
    rate: 6.0,
    tenureYears: 7,
    moratorium: 12,
    badge: 'Course Duration + 1 Yr',
  },
  {
    name: 'PMEGP Prime Minister Loan',
    principal: 1000000,
    rate: 9.5,
    tenureYears: 5,
    moratorium: 6,
    badge: 'Up to 35% Subsidy',
  },
];

function CalculatorContent() {
  const searchParams = useSearchParams();

  const [principal, setPrincipal] = useState<number>(200000);
  const [rate, setRate] = useState<number>(8.0);
  const [tenureYears, setTenureYears] = useState<number>(5);
  const [moratoriumMonths, setMoratoriumMonths] = useState<number>(3);
  const [isFemale, setIsFemale] = useState<boolean>(false);

  const [result, setResult] = useState<EMIResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAmortization, setShowAmortization] = useState(false);

  // Sync from query parameters if pre-populated from scheme card
  useEffect(() => {
    const p = searchParams.get('principal');
    const r = searchParams.get('rate');
    const t = searchParams.get('tenure');
    const m = searchParams.get('moratorium');
    const g = searchParams.get('gender');

    if (p) setPrincipal(Number(p));
    if (r) setRate(Number(r));
    if (t) setTenureYears(Math.max(1, Math.round(Number(t) / 12)));
    if (m !== null && m !== undefined) setMoratoriumMonths(Number(m));
    if (g === 'female') setIsFemale(true);
  }, [searchParams]);

  // Apply or toggle female 0.5% rebate
  const handleToggleFemale = () => {
    if (!isFemale) {
      setIsFemale(true);
      setRate((prev) => Math.max(0, prev - 0.5));
    } else {
      setIsFemale(false);
      setRate((prev) => prev + 0.5);
    }
  };

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

  const applyPreset = (preset: (typeof PRESETS)[0]) => {
    setPrincipal(preset.principal);
    setRate(preset.rate);
    setTenureYears(preset.tenureYears);
    setMoratoriumMonths(preset.moratorium);
    setIsFemale(false);
  };

  const addPrincipal = (delta: number) => {
    setPrincipal((prev) => Math.min(5000000, Math.max(10000, prev + delta)));
  };

  const principalRatio =
    result && result.total_payment > 0
      ? Math.round((principal / result.total_payment) * 100)
      : 80;
  const interestRatio = Math.max(0, 100 - principalRatio);

  // Dynamic progress percentages for sliders
  const principalPct = Math.min(100, Math.max(0, ((principal - 10000) / (5000000 - 10000)) * 100));
  const ratePct = Math.min(100, Math.max(0, (rate / 18) * 100));
  const tenurePct = Math.min(100, Math.max(0, ((tenureYears - 1) / (15 - 1)) * 100));
  const moratoriumPct = Math.min(100, Math.max(0, (moratoriumMonths / 24) * 100));

  // Compute cashflow preserved during moratorium period
  const standardMonthlyWithoutMoratorium =
    result && tenureYears > 0 ? (principal * (1 + (rate * tenureYears) / 100)) / (tenureYears * 12) : 0;
  const moratoriumSavings =
    moratoriumMonths > 0 && result
      ? Math.round(standardMonthlyWithoutMoratorium * moratoriumMonths)
      : 0;

  return (
    <div className="bg-[#f8faf7] min-h-screen py-8">
      {/* 90% Expansive Responsive Container */}
      <div className="w-[90%] max-w-[1700px] mx-auto space-y-8">
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-900 mb-2">
              <Calculator className="h-3.5 w-3.5 text-[#0d5c4e]" />
              <span>STATUTORY REPAYMENT SIMULATOR (REDUCING BALANCE & MORATORIUM)</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Government Concessional Loan EMI Calculator
            </h1>
            <p className="text-slate-600 text-sm mt-1 max-w-3xl">
              Model your exact monthly repayments with official NSFDC interest rates (6.0% to 15%), tenure up to
              15 years, and statutory moratorium holidays where principal repayments are deferred.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/eligibility"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#0d5c4e] hover:bg-[#094237] text-white text-xs font-bold shadow-md transition"
            >
              <Sparkles className="h-4 w-4 text-[#f4cf70]" />
              <span>Match Schemes for this Loan &rarr;</span>
            </Link>
          </div>
        </div>

        {/* Quick Scheme Presets Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-[#0d5c4e]" />
            <span>Fast Presets from Verified Statutory Guidelines</span>
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {PRESETS.map((preset) => {
              const active =
                principal === preset.principal &&
                rate === preset.rate &&
                tenureYears === preset.tenureYears &&
                moratoriumMonths === preset.moratorium;
              return (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className={`text-left p-3 rounded-xl border text-xs transition-all ${
                    active
                      ? 'border-[#0d5c4e] bg-emerald-50/80 shadow-sm ring-1 ring-[#0d5c4e]'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <p className="font-bold text-slate-900 truncate">{preset.name}</p>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                    <span>{formatCurrency(preset.principal)}</span>
                    <span className="font-bold text-[#0d5c4e]">{preset.badge}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main 2-Column Grid (90% Width Balanced Layout) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Form: Sliders & Controls (7 Cols on LG, 8 on XL) */}
          <div className="lg:col-span-7 xl:col-span-8 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-7">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Loan Simulation Parameters</h2>
                <p className="text-xs text-slate-500">
                  Adjust principal, tenure, and moratorium relief using sliders or precise inputs
                </p>
              </div>

              {/* Female 0.5% Rebate Toggle */}
              <button
                type="button"
                onClick={handleToggleFemale}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition ${
                  isFemale
                    ? 'bg-purple-100 border-purple-300 text-purple-900 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
                title="Statutory 0.5% interest rate discount for female entrepreneurs"
              >
                <Percent className="h-3.5 w-3.5 text-purple-600" />
                <span>Female Beneficiary (0.5% Rebate {isFemale ? 'Active' : 'Off'})</span>
              </button>
            </div>

            {/* Parameter 1: Loan Amount (Principal) */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <label className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <span>Loan Amount (Principal)</span>
                    <span className="text-[11px] font-normal text-slate-400">• Up to 90% of Project Cost</span>
                  </label>
                  <p className="text-xs text-slate-500">NSFDC Term Loan cap: ₹50.00 Lakh &bull; Micro Finance cap: ₹1.25 Lakh</p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center border border-slate-300 rounded-xl px-3 py-1.5 bg-slate-50 focus-within:ring-2 focus-within:ring-[#0d5c4e] focus-within:bg-white transition">
                    <span className="text-slate-500 font-bold text-sm mr-1">₹</span>
                    <input
                      type="number"
                      value={principal}
                      min="10000"
                      max="5000000"
                      step="10000"
                      onChange={(e) => setPrincipal(Number(e.target.value))}
                      className="w-32 text-right font-black text-slate-900 text-base bg-transparent focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Progress Slider with Visible Gradient Track */}
              <input
                type="range"
                min="10000"
                max="5000000"
                step="10000"
                value={principal}
                onChange={(e) => setPrincipal(Number(e.target.value))}
                style={{
                  background: `linear-gradient(to right, #0d5c4e 0%, #0d5c4e ${principalPct}%, #e2e8f0 ${principalPct}%, #e2e8f0 100%)`,
                }}
                className="w-full h-3 rounded-full cursor-pointer accent-[#0d5c4e] block shadow-inner my-2"
              />

              <div className="flex justify-between items-center text-[11px] text-slate-400 font-medium">
                <span>₹10,000 (Micro Credit)</span>
                <span>₹25 Lakh (PMEGP Ceiling)</span>
                <span className="font-bold text-slate-600">₹50 Lakh (NSFDC Term Cap)</span>
              </div>

              {/* Quick Stepper Pills */}
              <div className="flex flex-wrap gap-2 pt-1">
                {[
                  { label: '+₹25K', val: 25000 },
                  { label: '+₹50K', val: 50000 },
                  { label: '+₹1 Lakh', val: 100000 },
                  { label: '+₹5 Lakh', val: 500000 },
                  { label: 'Set ₹1.25L (MFS)', set: 125000 },
                  { label: 'Set ₹5.00L (UNY)', set: 500000 },
                ].map((chip) => (
                  <button
                    key={chip.label}
                    type="button"
                    onClick={() => (chip.set ? setPrincipal(chip.set) : addPrincipal(chip.val!))}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-[#0d5c4e] text-slate-600 text-xs font-semibold transition border border-slate-200"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Parameter 2: Annual Interest Rate */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <label className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <span>Annual Interest Rate (%)</span>
                    {isFemale && (
                      <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                        0.5% Female Rebate Deducted
                      </span>
                    )}
                  </label>
                  <p className="text-xs text-slate-500">Government schemes range between 5.0% and 15.0% per annum</p>
                </div>

                <div className="flex items-center border border-slate-300 rounded-xl px-3 py-1.5 bg-slate-50 focus-within:ring-2 focus-within:ring-[#0d5c4e] focus-within:bg-white transition">
                  <input
                    type="number"
                    value={rate}
                    min="0"
                    max="20"
                    step="0.25"
                    onChange={(e) => setRate(Number(e.target.value))}
                    className="w-20 text-right font-black text-slate-900 text-base bg-transparent focus:outline-none"
                  />
                  <span className="text-slate-500 font-bold text-sm ml-1">% p.a.</span>
                </div>
              </div>

              <input
                type="range"
                min="4"
                max="18"
                step="0.25"
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
                style={{
                  background: `linear-gradient(to right, #0d5c4e 0%, #0d5c4e ${ratePct}%, #e2e8f0 ${ratePct}%, #e2e8f0 100%)`,
                }}
                className="w-full h-3 rounded-full cursor-pointer accent-[#0d5c4e] block shadow-inner my-2"
              />

              <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                <span>5% (Vishwakarma)</span>
                <span className="font-bold text-[#0d5c4e]">6.0% / 6.5% (NSFDC Micro)</span>
                <span>8% (NSFDC Term)</span>
                <span>12%–15% (SFB / UNY)</span>
              </div>
            </div>

            {/* Parameter 3: Repayment Tenure */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <label className="text-sm font-bold text-slate-800">Repayment Tenure</label>
                  <p className="text-xs text-slate-500">Total amortization duration: {tenureYears * 12} monthly installments</p>
                </div>

                <div className="flex items-center border border-slate-300 rounded-xl px-3 py-1.5 bg-slate-50 focus-within:ring-2 focus-within:ring-[#0d5c4e] focus-within:bg-white transition">
                  <input
                    type="number"
                    value={tenureYears}
                    min="1"
                    max="15"
                    onChange={(e) => setTenureYears(Number(e.target.value))}
                    className="w-16 text-right font-black text-slate-900 text-base bg-transparent focus:outline-none"
                  />
                  <span className="text-slate-500 font-bold text-sm ml-1">Years</span>
                </div>
              </div>

              <input
                type="range"
                min="1"
                max="15"
                step="1"
                value={tenureYears}
                onChange={(e) => setTenureYears(Number(e.target.value))}
                style={{
                  background: `linear-gradient(to right, #0d5c4e 0%, #0d5c4e ${tenurePct}%, #e2e8f0 ${tenurePct}%, #e2e8f0 100%)`,
                }}
                className="w-full h-3 rounded-full cursor-pointer accent-[#0d5c4e] block shadow-inner my-2"
              />

              <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                <span>1 Year (Short)</span>
                <span>3 Years (Micro Loan)</span>
                <span className="font-bold text-slate-700">5–7 Years (Term Loan)</span>
                <span>10–12 Years (Education)</span>
              </div>
            </div>

            {/* Parameter 4: Moratorium Grace Period */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-bold text-slate-800">
                      Moratorium Period (Repayment Holiday)
                    </label>
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                      Zero Principal Paid
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Statutory business setup gestation period (3 to 12 months for NSFDC loans)
                  </p>
                </div>

                <div className="flex items-center border border-slate-300 rounded-xl px-3 py-1.5 bg-slate-50 focus-within:ring-2 focus-within:ring-[#0d5c4e] focus-within:bg-white transition">
                  <input
                    type="number"
                    value={moratoriumMonths}
                    min="0"
                    max="24"
                    step="3"
                    onChange={(e) => setMoratoriumMonths(Number(e.target.value))}
                    className="w-16 text-right font-black text-slate-900 text-base bg-transparent focus:outline-none"
                  />
                  <span className="text-slate-500 font-bold text-sm ml-1">Months</span>
                </div>
              </div>

              <input
                type="range"
                min="0"
                max="24"
                step="3"
                value={moratoriumMonths}
                onChange={(e) => setMoratoriumMonths(Number(e.target.value))}
                style={{
                  background: `linear-gradient(to right, #d97706 0%, #d97706 ${moratoriumPct}%, #e2e8f0 ${moratoriumPct}%, #e2e8f0 100%)`,
                }}
                className="w-full h-3 rounded-full cursor-pointer accent-amber-600 block shadow-inner my-2"
              />

              <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                <span>0m (None)</span>
                <span className="font-bold text-amber-700">3m (NSFDC Micro)</span>
                <span className="font-bold text-amber-700">6m (Plantation/Term)</span>
                <span>12m (Educational)</span>
              </div>
            </div>
          </div>

          {/* Right Card: High-Impact Repayment Intelligence (5 Cols on LG, 4 on XL) */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-5">
            <div className="bg-gradient-to-br from-[#0c2f28] via-[#0d5c4e] to-[#164e63] text-white rounded-3xl shadow-xl p-6 sm:p-8 space-y-6 border border-emerald-800/40">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-widest text-[#f4cf70] font-bold">
                    MONTHLY INSTALLMENT
                  </span>
                  <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full border border-white/20 text-emerald-100">
                    Reducing Balance
                  </span>
                </div>

                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                    {result ? formatCurrency(result.emi) : '—'}
                  </span>
                  <span className="text-emerald-200 text-sm font-semibold">/ month</span>
                </div>
                <p className="text-xs text-emerald-100/80 mt-1">
                  After {moratoriumMonths > 0 ? `${moratoriumMonths} months holiday` : 'immediate start'}
                </p>
              </div>

              {/* Financial Breakdown List */}
              <div className="space-y-3.5 pt-5 border-t border-white/15 text-xs sm:text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-emerald-100/80">Requested Principal</span>
                  <span className="font-bold text-white text-base">{formatCurrency(principal)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-emerald-100/80">Total Interest Payable</span>
                  <span className="font-bold text-[#f4cf70] text-base">
                    {result ? formatCurrency(result.total_interest) : '—'}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-white/15">
                  <span className="text-white font-bold">Total Disbursal & Repayment</span>
                  <span className="font-black text-white text-lg">
                    {result ? formatCurrency(result.total_payment) : '—'}
                  </span>
                </div>

                {/* Moratorium Savings Callout */}
                {moratoriumMonths > 0 && (
                  <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-3.5 border border-[#f4cf70]/30 text-xs space-y-1">
                    <p className="font-bold text-[#f4cf70] flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{moratoriumMonths}-Month Gestation Relief</span>
                    </p>
                    <p className="text-emerald-100 text-[11px] leading-relaxed">
                      Saves approximately <strong>{formatCurrency(moratoriumSavings)}</strong> in initial cashflow
                      so you can invest in inventory before installments begin.
                    </p>
                  </div>
                )}
              </div>

              {/* Visual Breakdown Bar */}
              <div className="pt-2">
                <div className="flex justify-between text-xs mb-2 text-emerald-100 font-semibold">
                  <span>Principal ({principalRatio}%)</span>
                  <span>Interest ({interestRatio}%)</span>
                </div>
                <div className="w-full h-3.5 bg-black/30 rounded-full flex overflow-hidden p-0.5 border border-white/20">
                  <div
                    style={{ width: `${principalRatio}%` }}
                    className="h-full bg-[#f4cf70] rounded-full transition-all duration-500"
                  />
                  <div
                    style={{ width: `${interestRatio}%` }}
                    className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAmortization(!showAmortization)}
                  className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
                >
                  <Calendar className="h-4 w-4 text-[#f4cf70]" />
                  <span>{showAmortization ? 'Hide Repayment Table' : 'View Full Monthly Amortization Table ↓'}</span>
                </button>

                <Link
                  href={`/eligibility?loan_amount=${principal}&purpose=business`}
                  className="w-full py-3 px-4 bg-[#e8bd52] hover:bg-[#f5d57f] text-[#17372f] rounded-xl text-xs font-black transition flex items-center justify-center gap-2 shadow-lg"
                >
                  <span>Find Matching Schemes & Partners &rarr;</span>
                </Link>
              </div>
            </div>

            {/* Statutory Guideline Card */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-[#0d5c4e]" />
                <span>Statutory Lending Rules (NSFDC)</span>
              </h3>
              <ul className="text-xs text-slate-600 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#0d5c4e] mt-1.5 shrink-0" />
                  <span>Loans up to 90% sanctioned for eligible Scheduled Caste beneficiaries.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#0d5c4e] mt-1.5 shrink-0" />
                  <span>Annual family income must not exceed ₹5.00 Lakh.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#0d5c4e] mt-1.5 shrink-0" />
                  <span>Women applicants automatically receive a 0.5% interest rate rebate.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Amortization Schedule Table (Full 90% Width) */}
        {showAmortization && result && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  Month-by-Month Statutory Amortization Schedule
                </h3>
                <p className="text-xs text-slate-500">
                  Complete {result.amortization_schedule.length}-month repayment projection showing principal and interest split
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-3 py-1.5 bg-slate-100 rounded-lg text-slate-700">
                  {moratoriumMonths > 0 ? `${moratoriumMonths}m Gestation Applied` : 'Immediate Repayment'}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto max-h-[500px] border border-slate-100 rounded-2xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider sticky top-0 z-10">
                  <tr>
                    <th className="py-3 px-4">Month</th>
                    <th className="py-3 px-4">Status / Phase</th>
                    <th className="py-3 px-4">Total Installment</th>
                    <th className="py-3 px-4">Principal Component</th>
                    <th className="py-3 px-4">Interest Component</th>
                    <th className="py-3 px-4 text-right">Remaining Loan Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {result.amortization_schedule.map((entry: AmortizationEntry) => {
                    const isMora = moratoriumMonths > 0 && entry.month <= moratoriumMonths;
                    return (
                      <tr key={entry.month} className={isMora ? 'bg-amber-50/50 hover:bg-amber-50' : 'hover:bg-slate-50'}>
                        <td className="py-2.5 px-4 font-bold text-slate-900">Month {entry.month}</td>
                        <td className="py-2.5 px-4">
                          {isMora ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                              <Clock className="h-3 w-3" /> Holiday
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                              <CheckCircle2 className="h-3 w-3" /> Active EMI
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-4 font-black text-slate-900">{formatCurrency(entry.emi)}</td>
                        <td className="py-2.5 px-4 font-semibold text-blue-700">
                          {formatCurrency(entry.principal)}
                        </td>
                        <td className="py-2.5 px-4 font-semibold text-emerald-700">
                          {formatCurrency(entry.interest)}
                        </td>
                        <td className="py-2.5 px-4 font-black text-slate-800 text-right">
                          {formatCurrency(entry.balance)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
