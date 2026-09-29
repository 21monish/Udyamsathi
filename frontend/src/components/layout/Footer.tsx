import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, HeartHandshake, Landmark } from 'lucide-react';

const linkStyle = 'text-sm text-emerald-50/65 transition hover:translate-x-0.5 hover:text-[#f4cf70]';

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[#073b35] text-white">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#f4cf70]/70 to-transparent" />
      <div className="absolute -right-32 bottom-0 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />
      <div className="relative mx-auto w-[90%] max-w-[1700px] px-5 py-14 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.45fr_1fr_1fr_1fr]">
          <div className="max-w-sm">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#f4cf70] font-extrabold text-[#073b35] shadow-lg shadow-black/15">US</div>
              <div><p className="font-extrabold tracking-tight">UdyamSathi</p><p className="text-[10px] font-bold tracking-[.16em] text-[#f4cf70]">NSFDC LENDING ACCESS</p></div>
            </div>
            <p className="mt-5 text-sm leading-relaxed text-emerald-50/70">Clear, guided access to government financial assistance for every entrepreneur with an idea worth growing.</p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-emerald-50/85"><HeartHandshake className="h-4 w-4 text-[#f4cf70]" /> Built for inclusive enterprise</div>
          </div>
          <div><h3 className="mb-4 text-xs font-extrabold uppercase tracking-[.16em] text-[#f4cf70]">Explore</h3><ul className="space-y-3"><li><Link href="/schemes" className={linkStyle}>Browse schemes</Link></li><li><Link href="/eligibility" className={linkStyle}>Check eligibility</Link></li><li><Link href="/calculator" className={linkStyle}>EMI calculator</Link></li><li><Link href="/partners" className={linkStyle}>Find partners</Link></li></ul></div>
          <div><h3 className="mb-4 text-xs font-extrabold uppercase tracking-[.16em] text-[#f4cf70]">Guidance</h3><ul className="space-y-3"><li><Link href="/application-guide" className={linkStyle}>Application guide</Link></li><li><Link href="/how-it-works" className={linkStyle}>How it works</Link></li><li><Link href="/assistant" className={linkStyle}>AI assistant</Link></li><li><Link href="/about" className={linkStyle}>About UdyamSathi</Link></li></ul></div>
          <div><h3 className="mb-4 text-xs font-extrabold uppercase tracking-[.16em] text-[#f4cf70]">Official resource</h3><a href="https://nsfdc.nic.in" target="_blank" rel="noopener noreferrer" className="group flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-[#f4cf70]/40 hover:bg-white/10"><Landmark className="mt-0.5 h-5 w-5 shrink-0 text-[#f4cf70]" /><span className="text-sm font-semibold leading-snug text-emerald-50">Visit the NSFDC official portal <ArrowUpRight className="ml-1 inline h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></span></a></div>
        </div>
        <div className="mt-12 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-emerald-50/55 sm:flex-row sm:items-center sm:justify-between"><p>© {new Date().getFullYear()} UdyamSathi · Smart India Hackathon 2026</p><p>Demo platform · Verify final scheme details with the authorized channel partner.</p></div>
      </div>
    </footer>
  );
}
