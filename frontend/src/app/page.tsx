import React from 'react';
import Link from 'next/link';

const features = [
  { icon: '🎯', title: 'Smart Eligibility Check', description: 'Answer a few questions about your needs and get matched with government schemes you may qualify for.' },
  { icon: '📋', title: 'Scheme Database', description: 'Browse NSFDC, MUDRA, PMEGP, Stand-Up India and other schemes with verified eligibility criteria.' },
  { icon: '🧮', title: 'EMI Calculator', description: 'Calculate your monthly payments, total interest, and view detailed amortization schedules.' },
  { icon: '📍', title: 'Partner Locator', description: 'Find nearby authorized channel partners — SCAs, banks, and RRBs — on an interactive map.' },
  { icon: '🤖', title: 'AI Assistant', description: 'Ask in English, Hindi, or Gujarati. Our AI extracts your needs and finds matching schemes.' },
  { icon: '🌐', title: 'Multilingual Support', description: 'Full support for English, Hindi, and Gujarati — including scheme explanations and document guidance.' },
];

const steps = [
  { num: '1', title: 'Tell Us Your Needs', desc: 'Share your purpose, income, and loan requirement' },
  { num: '2', title: 'Get Matched', desc: 'Our engine checks your eligibility against all schemes' },
  { num: '3', title: 'Calculate EMI', desc: 'Understand your monthly payments and total cost' },
  { num: '4', title: 'Find a Partner', desc: 'Locate the nearest authorized channel partner' },
  { num: '5', title: 'Apply', desc: 'Get your document checklist and apply through the partner' },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="container mx-auto px-4 py-20 md:py-28">
          <div className="max-w-3xl">
            <span className="inline-block mb-4 px-3 py-1 text-sm bg-white/20 rounded-full">
              SIH 2026 • Problem Statement 26092
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Find the Right Government Scheme for{' '}
              <span className="text-yellow-300">Your Business</span>
            </h1>
            <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-2xl">
              SchemeSetu matches you with government financial assistance schemes based on your eligibility.
              Get transparent recommendations, calculate EMI, and find nearby partners — all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/eligibility" className="inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-blue-700 bg-white rounded-lg hover:bg-gray-100 transition">
                Check Your Eligibility
              </Link>
              <Link href="/schemes" className="inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-white border-2 border-white rounded-lg hover:bg-white/10 transition">
                Browse Schemes
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 60L1440 60L1440 30C1440 30 1080 0 720 0C360 0 0 30 0 30L0 60Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Everything You Need</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            From eligibility checks to partner locator — a complete platform for accessing government financial schemes.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="rounded-xl border bg-white p-6 hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-gray-600">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-lg text-gray-600">Five simple steps to find your scheme</p>
          </div>
          <div className="flex flex-col md:flex-row items-start justify-center gap-4 md:gap-0">
            {steps.map((s, i) => (
              <React.Fragment key={s.num}>
                <div className="flex flex-col items-center text-center max-w-[200px] mx-auto md:mx-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-lg mb-3">
                    {s.num}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{s.title}</h3>
                  <p className="text-sm text-gray-600">{s.desc}</p>
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden md:flex items-center pt-6 px-2">
                    <div className="w-12 h-0.5 bg-blue-300" />
                    <span className="text-blue-400">→</span>
                    <div className="w-12 h-0.5 bg-blue-300" />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Find Your Scheme?</h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Answer a few questions and discover which government financial assistance schemes you may qualify for.
          </p>
          <Link href="/eligibility" className="inline-flex items-center px-6 py-3 text-base font-semibold text-blue-700 bg-white rounded-lg hover:bg-gray-100 transition">
            Start Eligibility Check →
          </Link>
        </div>
      </section>

      {/* Data Disclaimer */}
      <section className="bg-yellow-50 border-t border-yellow-200 py-4">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-yellow-800">
            ⚠️ <strong>Hackathon Demo:</strong> Scheme data shown is for demonstration purposes. Always verify eligibility with official sources like{' '}
            <a href="https://nsfdc.nic.in" target="_blank" rel="noopener noreferrer" className="underline">NSFDC</a>{' '}
            or <a href="https://www.jansamarth.in" target="_blank" rel="noopener noreferrer" className="underline">JanSamarth</a>.
          </p>
        </div>
      </section>
    </div>
  );
}
