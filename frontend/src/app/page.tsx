import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  Calculator,
  Landmark,
  MapPin,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Percent,
  Building2,
  FileCheck2,
  Users,
  Compass,
} from 'lucide-react';

const sectors = [
  {
    title: 'Agriculture & Allied Farming',
    image: '/images/agriculture.jpg',
    copy: 'Finance for dairy farming, irrigation pumps, tractors, and organic horticulture.',
    tag: 'NSFDC Term Loan',
    href: '/schemes?purpose=agriculture',
  },
  {
    title: 'Small Business & MSME Units',
    image: '/images/business.jpg',
    copy: 'Capital for manufacturing, retail kirana stores, garment workshops, and repair centers.',
    tag: 'Micro Finance (MFS)',
    href: '/schemes?purpose=business',
  },
  {
    title: 'Street Vendors & Micro Trade',
    image: '/images/vendors.jpg',
    copy: 'Working capital and equipment credit for daily urban and rural livelihood trades.',
    tag: 'PM SVANidhi / Aajeevika',
    href: '/schemes?search=svanidhi',
  },
  {
    title: 'Traditional Artisans & Crafts',
    image: '/images/artisans.jpg',
    copy: 'Concessional loans, tool-kit incentives, and skill training for traditional craftspeople.',
    tag: 'PM Vishwakarma',
    href: '/schemes?search=vishwakarma',
  },
];

const pillars = [
  {
    icon: Sparkles,
    title: 'Deterministic Scheme Matching',
    copy: 'Our statutory engine cross-checks family income, caste category, and project cost with 100% explainability.',
  },
  {
    icon: Calculator,
    title: 'EMI & Moratorium Simulator',
    copy: 'Simulate monthly installments under reducing balance rules, with 3 to 12 months repayment holiday relief.',
  },
  {
    icon: MapPin,
    title: 'Geo-Spatial Partner Routing',
    copy: 'Identify the closest State Channelizing Agency (SCA), Bank, or RRB branch filtered by solvent NPA health.',
  },
];

const stats = [
  { val: '27+', label: 'Statutory Welfare Schemes', sub: 'NSFDC, MUDRA, PMEGP, Stand-Up' },
  { val: '6.0%', label: 'Concessional Interest Rates', sub: 'Includes 0.5% female rebate' },
  { val: '₹50 Lakh', label: 'Maximum Loan Assistance', sub: 'Up to 90% project cost' },
  { val: '100+', label: 'Channel Partner Desks', sub: 'SCAs, PSBs & Regional Rural Banks' },
];

export default function HomePage() {
  return (
    <div className="page-enter overflow-hidden bg-[#f8faf7]">
      {/* Hero Section */}
      <section className="relative isolate overflow-hidden bg-[#073b35] text-white">
        <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(#d9b454_1px,transparent_1px)] [background-size:22px_22px]" />
        <div className="hero-orb absolute -right-28 -top-40 h-[35rem] w-[35rem] rounded-full bg-[#16856e]/40 blur-3xl" />
        <div className="hero-orb absolute -bottom-36 left-[20%] h-72 w-72 rounded-full bg-[#e8bd52]/15 blur-3xl [animation-delay:-4s]" />

        <div className="relative mx-auto grid w-[90%] max-w-[1700px] items-center gap-12 px-5 py-16 lg:grid-cols-[1.1fr_.9fr] lg:px-8 lg:py-24">
          <div className="relative z-10">
            {/* Ministry Tag */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-[#f6da85]">
              <BadgeCheck className="h-4 w-4 text-[#f6da85]" />
              <span>SIH26092 &bull; NSFDC Credit Access Portal</span>
            </div>

            <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl text-white">
              The right government credit scheme,{' '}
              <span className="text-[#f6da85]">made simple and transparent.</span>
            </h1>

            <p className="mt-6 max-w-2xl text-base sm:text-lg leading-relaxed text-emerald-50/85">
              UdyamSathi bridges the discovery and operational gap for Scheduled Caste entrepreneurs and artisans.
              Check statutory eligibility, calculate repayment with moratorium holidays, and locate your authorized
              State Channelizing Agency in minutes.
            </p>

            {/* Main Action CTAs */}
            <div className="mt-8 flex flex-col gap-3.5 sm:flex-row">
              <Link
                href="/eligibility"
                className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-[#e8bd52] px-6 py-4 font-bold text-[#17372f] shadow-lg shadow-black/10 transition duration-300 hover:-translate-y-0.5 hover:bg-[#f5d57f] hover:shadow-xl"
              >
                <span>Check Eligibility (Free & Instant)</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/schemes"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 px-6 py-4 font-semibold text-white transition hover:bg-white/10"
              >
                <span>Explore 27+ Schemes</span>
              </Link>
            </div>

            {/* Quick Metrics Banner */}
            <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-white/15 pt-8">
              {stats.map((s) => (
                <div key={s.label}>
                  <p className="text-2xl sm:text-3xl font-black text-[#f6da85]">{s.val}</p>
                  <p className="text-xs font-bold text-white mt-0.5">{s.label}</p>
                  <p className="text-[10px] text-emerald-100/70 mt-0.5">{s.sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Hero Visual Card */}
          <div className="hero-card relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="relative overflow-hidden rounded-[2.5rem] border border-white/20 bg-white/5 p-3.5 shadow-2xl backdrop-blur">
              <Image
                src="/images/business.jpg"
                alt="Entrepreneur in India working in enterprise unit"
                width={800}
                height={600}
                priority
                className="h-[360px] w-full rounded-[2rem] object-cover sm:h-[440px]"
              />

              {/* Floating Floating Stat Badge */}
              <div className="absolute bottom-7 left-7 right-7 rounded-2xl bg-white/95 p-4 text-slate-900 shadow-xl backdrop-blur border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center text-[#0d5c4e] shrink-0">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                      Zero Bureaucratic Ambiguity
                    </p>
                    <p className="text-xs font-bold text-slate-800 mt-0.5">
                      Deterministic government statutory rules. No hidden interest rates or surprise exclusions.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Core Pillars Section */}
      <section className="bg-white py-16 lg:py-24 border-b border-slate-100">
        <div className="w-[90%] max-w-[1700px] mx-auto px-5 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-[#0d5c4e]">
              A Unified Digital Channel Finance Bridge
            </p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Solving the Awareness, Discovery, and Operational Gap
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600">
              Transforming the fragmented channel partner system into a transparent, guided journey for beneficiaries.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {pillars.map(({ icon: Icon, title, copy }, i) => (
              <div
                key={title}
                className="ui-card group relative rounded-3xl border border-slate-200 bg-slate-50/50 p-8 hover:border-[#0d5c4e]/30 hover:bg-white"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="h-12 w-12 rounded-2xl bg-emerald-100 text-[#0d5c4e] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-black text-slate-300">0{i + 1}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">{title}</h3>
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-600">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sectors & Livelihoods */}
      <section className="bg-[#eef5f0] py-16 lg:py-24">
        <div className="w-[90%] max-w-[1700px] mx-auto px-5 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#0d5c4e]">Target Beneficiaries</p>
              <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">
                Support Tailored for Every Livelihood
              </h2>
            </div>
            <Link
              href="/schemes"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0d5c4e] hover:underline"
            >
              <span>View All 27 Schemes</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {sectors.map((sector) => (
              <Link
                href={sector.href}
                key={sector.title}
                className="ui-card group overflow-hidden rounded-3xl bg-white border border-slate-200 shadow-sm hover:border-emerald-300 flex flex-col"
              >
                <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                  <Image
                    src={sector.image}
                    alt={sector.title}
                    fill
                    sizes="(max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                  <span className="absolute left-3.5 top-3.5 rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold text-emerald-900 shadow-sm backdrop-blur">
                    {sector.tag}
                  </span>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-[#0d5c4e] transition-colors">
                      {sector.title}
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{sector.copy}</p>
                  </div>
                  <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#0d5c4e]">
                    <span>Check Options</span>
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4-Step Pathway Section */}
      <section className="bg-white py-16 lg:py-24">
        <div className="w-[90%] max-w-[1700px] mx-auto px-5 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-12 items-center">
            <div className="lg:col-span-5 rounded-3xl bg-[#0d5c4e] p-8 sm:p-10 text-white shadow-xl">
              <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center text-[#f4cf70] mb-6">
                <Landmark className="h-6 w-6" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight">
                From Enquiry to Authorized Branch in 4 Simple Steps.
              </h2>
              <p className="mt-4 text-xs sm:text-sm leading-relaxed text-emerald-100">
                Eliminate repeated bank visits and application rejections by knowing your scheme fit and checklist in advance.
              </p>
              <Link
                href="/application-guide"
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#e8bd52] px-5 py-3 text-xs font-bold text-[#17372f] hover:bg-[#f5d57f] transition shadow-md"
              >
                <span>Read Full Application Guide</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="lg:col-span-7 space-y-6">
              {[
                {
                  step: '01',
                  title: 'Complete 60-Second Questionnaire',
                  desc: 'Input annual family income (up to ₹5L), proposed loan amount, and social category without uploading documents.',
                },
                {
                  step: '02',
                  title: 'Receive Explainable Scheme Recommendations',
                  desc: 'See exactly why you qualify, statutory interest rate (including 0.5% female rebate), and maximum eligible funding.',
                },
                {
                  step: '03',
                  title: 'Simulate EMI with Repayment Holiday',
                  desc: 'Model reducing balance monthly installments with 3 to 12 months moratorium period where principal repayment is deferred.',
                },
                {
                  step: '04',
                  title: 'Route to Nearest Solvent Channel Partner',
                  desc: 'Locate authorized State Channelizing Agencies (SCAs) and Bank branches filtered to exclude those with high overdues.',
                },
              ].map((s) => (
                <div key={s.step} className="ui-card flex gap-4 p-4 rounded-2xl border border-slate-100 hover:border-slate-200 bg-white/70">
                  <div className="h-10 w-10 rounded-xl bg-emerald-50 text-[#0d5c4e] font-black text-sm flex items-center justify-center shrink-0">
                    {s.step}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{s.title}</h3>
                    <p className="mt-1 text-xs text-slate-500 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="px-5 pb-16 lg:pb-24">
        <div className="w-[90%] max-w-[1700px] mx-auto rounded-3xl bg-gradient-to-r from-[#e8bd52] via-[#f4cf70] to-[#f6da85] p-8 sm:p-12 shadow-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#4d3807] flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4" />
                <span>Government of India Concessional Credit</span>
              </p>
              <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold text-[#17372f]">
                Ready to find the right loan for your enterprise?
              </h2>
              <p className="text-xs sm:text-sm text-[#4d3807] mt-1 max-w-xl">
                Free, instant, and completely deterministic. No broker fee, no guesswork.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/eligibility"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0d5c4e] px-6 py-3.5 text-xs sm:text-sm font-bold text-white hover:bg-[#094237] transition shadow-md"
              >
                <span>Start Free Check</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
