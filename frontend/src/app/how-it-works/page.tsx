import Link from 'next/link';
import {
  UserCheck,
  Cpu,
  Calculator,
  Building2,
  FileCheck,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';

export default function HowItWorksPage() {
  const steps = [
    {
      num: '01',
      title: 'Profile & Socio-Economic Assessment',
      icon: UserCheck,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      badge: 'Step 1',
      description: 'The applicant or field facilitator enters basic non-sensitive credentials: state, caste category (SC/OBC/Safai Karamchari), family annual income (statutory cap ₹3.0L / ₹5.0L), and proposed entrepreneurial activity.',
      points: ['No initial documents required', 'Speech-to-text voice intake available via AI Assistant', 'Instant non-sensitive parameter assessment']
    },
    {
      num: '02',
      title: 'Deterministic Rule Engine Matching',
      icon: Cpu,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      badge: 'Step 2',
      description: 'The engine evaluates applicant parameters against statutory NSFDC and Ministry guidelines. All 27 welfare schemes are scored and ranked with 100% auditable eligibility rationales.',
      points: ['Explains exact reason for eligibility', 'Female 0.5% interest rate discount applied automatically', 'Identifies highest-subsidy opportunities']
    },
    {
      num: '03',
      title: 'EMI & Moratorium Cashflow Simulation',
      icon: Calculator,
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      badge: 'Step 3',
      description: 'Entrepreneurs model reducing-balance monthly repayments across repayment tenures up to 10 years, factoring in statutory moratoriums (repayment holiday up to 12 months) to safeguard business launch cash flow.',
      points: ['Interactive visual loan repayment curve', 'Detailed principal vs interest breakdown', 'Cashflow savings during grace period']
    },
    {
      num: '04',
      title: 'Solvent Channel Partner Routing',
      icon: Building2,
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      badge: 'Step 4',
      description: 'Rather than sending beneficiaries to inactive or non-compliant branches, UdyamSathi routes applications to authorized State Channelizing Agencies (SCAs) and Bank branches filtered by recovery health score.',
      points: ['Pinpoint authorized district branches', 'Contact nodal officer details & address', 'Overdue risk scoring prevents delayed disbursement']
    },
    {
      num: '05',
      title: 'Guided Checklist & Direct Submission',
      icon: FileCheck,
      color: 'bg-purple-50 text-purple-700 border-purple-200',
      badge: 'Step 5',
      description: 'Generate an application packet with the exact documentary proofs required for the chosen scheme. Submit online through the applicant portal or take a ready packet to the designated nodal desk.',
      points: ['Track application status in real-time', 'Clear document verification checklist', 'Avoid repeated branch visits and rejections']
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="w-[90%] max-w-[1700px] mx-auto space-y-12">
        {/* Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-[#0d5c4e] via-[#094237] to-[#164e63] p-8 sm:p-12 text-white shadow-sm">
          <div className="max-w-3xl">
            <span className="rounded-full bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 px-3.5 py-1 text-xs font-semibold">
              Step-by-Step Pathway
            </span>
            <h1 className="mt-3 text-3xl sm:text-5xl font-extrabold tracking-tight">
              How UdyamSathi Works
            </h1>
            <p className="mt-3 text-base sm:text-lg text-emerald-100 leading-relaxed">
              From discovering statutory welfare credit schemes to visiting an authorized channel branch with your complete application package.
            </p>
          </div>
        </div>

        {/* 5 Steps Grid */}
        <div className="space-y-6">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-emerald-50 text-[#0d5c4e] font-black text-xl flex items-center justify-center shrink-0 border border-emerald-100">
                      {step.num}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{step.badge}</span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                        {step.title}
                      </h2>
                      <p className="mt-2 text-sm text-slate-600 leading-relaxed max-w-4xl">
                        {step.description}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {step.points.map((pt, i) => (
                          <div
                            key={i}
                            className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                            <span>{pt}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="h-12 w-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center shrink-0 hidden lg:flex">
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Card */}
        <div className="rounded-3xl bg-gradient-to-r from-[#e8bd52] via-[#f4cf70] to-[#f6da85] p-8 sm:p-12 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#17372f]">
              Ready to find your eligible scheme?
            </h2>
            <p className="text-sm text-[#4d3807] mt-1 max-w-xl">
              It takes less than 60 seconds to check your eligibility without uploading any documents.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/eligibility"
              className="inline-flex items-center gap-2 rounded-xl bg-[#0d5c4e] px-6 py-3.5 text-xs sm:text-sm font-bold text-white hover:bg-[#094237] transition shadow-md"
            >
              <span>Start Eligibility Check</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
