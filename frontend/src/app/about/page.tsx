import Link from 'next/link';
import { ShieldCheck, Target, Users, Landmark, Award, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="w-[90%] max-w-[1700px] mx-auto space-y-12">
        {/* Hero Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-[#0d5c4e] via-[#094237] to-[#164e63] p-8 sm:p-12 text-white shadow-sm">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-[#f6da85] mb-4">
              <Award className="h-4 w-4" />
              <span>Smart India Hackathon 2026 &bull; Problem Statement 26092</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              About UdyamSathi
            </h1>
            <p className="mt-4 text-base sm:text-lg text-emerald-100 leading-relaxed">
              An AI-assisted, zero-hallucination statutory credit matching portal and channel partner bridge built specifically for marginalized entrepreneurs under NSFDC (National Scheduled Castes Finance and Development Corporation).
            </p>
          </div>
        </div>

        {/* Mission & Statutory Mandate */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-[#0d5c4e] flex items-center justify-center mb-6">
              <Target className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">The Problem</h2>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              Thousands of viable entrepreneurs from Scheduled Caste and marginalized backgrounds fail to access statutory concessional loans (rates as low as 4%–6%) due to fragmented scheme guidelines, lack of awareness, and opaque channel partner routing.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center mb-6">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Our Deterministic Solution</h2>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              Unlike generic chatbot wrappers, UdyamSathi features a strict rule engine that cross-references statutory income caps (₹3.0L / ₹5.0L), project cost boundaries, and caste eligibility criteria. The AI assistant extracts intents while calculations remain 100% auditable.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mb-6">
              <Landmark className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Channel Partner Routing</h2>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              Beneficiaries are connected directly to solvent, active State Channelizing Agencies (SCAs), Regional Rural Banks (RRBs), and Public Sector Banks with full document checklists to prevent repeated branch visits.
            </p>
          </div>
        </div>

        {/* Key Innovations */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Key Engineering Innovations</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm mb-2">
                <CheckCircle2 className="h-4 w-4" />
                <span>Deterministic Engine</span>
              </div>
              <p className="text-xs text-slate-600">Zero-hallucination rule validator codified directly from official NSFDC operational handbooks.</p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm mb-2">
                <CheckCircle2 className="h-4 w-4" />
                <span>Voice STT & Speech Synthesis</span>
              </div>
              <p className="text-xs text-slate-600">Web Speech API speech-to-text and audio readout with real-time intent extraction.</p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm mb-2">
                <CheckCircle2 className="h-4 w-4" />
                <span>Female 0.5% Rebate</span>
              </div>
              <p className="text-xs text-slate-600">Automatic statutory 0.50% interest rate concession applied across Mahila Samriddhi and Dhibar schemes.</p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm mb-2">
                <CheckCircle2 className="h-4 w-4" />
                <span>Partner Health Scoring</span>
              </div>
              <p className="text-xs text-slate-600">Filters disbursement channels based on recovery performance and operational solvency ratios.</p>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
            <p className="text-xs text-slate-500">
              UdyamSathi &copy; 2026 &bull; Developed for SIH 26092 &bull; Ministry of Social Justice and Empowerment
            </p>
            <div className="flex items-center gap-3">
              <Link
                href="/eligibility"
                className="px-5 py-2.5 rounded-xl bg-[#0d5c4e] text-white text-xs font-bold hover:bg-[#094237] transition"
              >
                Check Eligibility Now &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
