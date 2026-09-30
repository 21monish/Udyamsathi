'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import {
  ChevronDown,
  Menu,
  UserRound,
  X,
  LogOut,
  ShieldCheck,
  User,
  LayoutDashboard,
  Sparkles,
} from 'lucide-react';

const links = [
  { href: '/schemes', label: 'Schemes' },
  { href: '/eligibility', label: 'Eligibility Check' },
  { href: '/calculator', label: 'EMI Calculator' },
  { href: '/partners', label: 'Channel Partners' },
  { href: '/assistant', label: 'AI Assistant' },
];

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    setOpen(false);
    router.push('/auth/login');
  };

  const dashboardHref = user?.role === 'ADMIN' ? '/admin' : '/dashboard';

  return (
    <header className="sticky top-0 z-50 border-b border-emerald-950/10 bg-white/90 shadow-[0_4px_20px_rgba(6,78,59,.04)] backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] w-[90%] max-w-[1700px] items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="group flex items-center gap-2.5">
          <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-md shadow-emerald-950/20 ring-1 ring-emerald-950/10 transition-transform duration-300 group-hover:rotate-3">
            <Image src="/images/udyamsathi-mark.png" alt="UdyamSathi" width={44} height={44} className="h-full w-full object-contain" priority />
          </div>
          <div>
            <p className="font-extrabold text-base leading-4 text-slate-900 tracking-tight">UdyamSathi</p>
            <p className="text-[10px] font-bold tracking-wider text-[#0d5c4e] uppercase">NSFDC LENDING ACCESS</p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-600 transition hover:text-[#0d5c4e]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Action Bar */}
        <div className="hidden items-center gap-3 lg:flex">

          {/* User Auth State */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-100 transition"
              >
                <div className="h-6 w-6 rounded-lg bg-[#0d5c4e] text-white flex items-center justify-center font-bold text-[10px]">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="max-w-[120px] truncate">{user?.name}</span>
                {user?.role === 'ADMIN' && (
                  <span className="rounded bg-purple-100 px-1.5 py-0.5 text-[9px] font-bold text-purple-800 uppercase">
                    Admin
                  </span>
                )}
                <ChevronDown className="h-3 w-3 text-slate-400" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl z-50 space-y-1">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
                    <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
                  </div>

                  <Link
                    href={dashboardHref}
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-emerald-50 hover:text-[#0d5c4e] transition"
                  >
                    {user?.role === 'ADMIN' ? (
                      <>
                        <ShieldCheck className="h-4 w-4 text-purple-600" />
                        <span>Admin Operations Hub</span>
                      </>
                    ) : (
                      <>
                        <LayoutDashboard className="h-4 w-4 text-[#0d5c4e]" />
                        <span>Beneficiary Dashboard</span>
                      </>
                    )}
                  </Link>

                  <Link
                    href="/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-emerald-50 hover:text-[#0d5c4e] transition"
                  >
                    <User className="h-4 w-4 text-[#0d5c4e]" />
                    <span>My Profile & Eligibility</span>
                  </Link>

                  <div className="border-t border-slate-100 pt-1">
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/auth/login"
                className="px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-[#0d5c4e] transition"
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                Register
              </Link>
              <Link
                href="/eligibility"
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#0d5c4e] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#094237] transition"
              >
                <Sparkles className="h-3.5 w-3.5 text-[#f4cf70]" />
                <span>Check Eligibility</span>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="rounded-xl p-2 text-slate-700 hover:bg-slate-100 lg:hidden"
          aria-label="Toggle Navigation"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      {open && (
        <div className="border-t border-slate-200 bg-white px-5 py-5 lg:hidden space-y-4 shadow-xl">
          <nav className="grid gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-emerald-50 hover:text-[#0d5c4e]"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="border-t border-slate-100 pt-3">
            {isAuthenticated ? (
              <div className="space-y-2">
                <div className="px-3.5 py-2 bg-slate-50 rounded-xl">
                  <p className="text-xs font-bold text-slate-900">{user?.name}</p>
                  <p className="text-[10px] text-slate-500">{user?.email}</p>
                </div>
                <Link
                  href={dashboardHref}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-3.5 py-2.5 text-sm font-semibold text-[#0d5c4e] hover:bg-emerald-50"
                >
                  {user?.role === 'ADMIN' ? '👑 Admin Operations Hub' : '📊 Beneficiary Dashboard'}
                </Link>
                <Link
                  href="/profile"
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  👤 My Profile & Eligibility
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/auth/login"
                  onClick={() => setOpen(false)}
                  className="rounded-xl border border-slate-200 py-2.5 text-center text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setOpen(false)}
                  className="rounded-xl bg-[#0d5c4e] py-2.5 text-center text-xs font-bold text-white hover:bg-[#094237]"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
