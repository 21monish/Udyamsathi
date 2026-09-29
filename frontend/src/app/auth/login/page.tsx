'use client';

import React, { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { ShieldCheck, UserCheck, Lock, Mail, ArrowRight, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('test@udyamsathi.in');
  const [password, setPassword] = useState('test123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleQuickFill = (type: 'admin' | 'beneficiary') => {
    if (type === 'admin') {
      setEmail('admin@udyamsathi.in');
      setPassword('admin123');
    } else {
      setEmail('test@udyamsathi.in');
      setPassword('test123');
    }
    setError('');
  };

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const loggedUser = await login({ email, password });
      setSuccess(`Authenticated as ${loggedUser.name} (${loggedUser.role})`);
      
      setTimeout(() => {
        if (loggedUser.role === 'ADMIN') {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
      }, 500);
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0d5c4e] text-white shadow-md shadow-emerald-900/10 mb-4">
            <span className="font-bold text-lg text-[#f4cf70]">US</span>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Sign In to UdyamSathi
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Government Concessional Credit Matching Portal (SIH26092)
          </p>
        </div>

        {/* Demo Fast-Login Selector */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-2.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            One-Click Demo Credentials
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('beneficiary')}
              className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition text-xs font-medium ${
                email === 'test@udyamsathi.in'
                  ? 'border-emerald-600 bg-emerald-50/70 text-emerald-900'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <UserCheck className="h-4 w-4 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold">Beneficiary</p>
                <p className="text-[10px] text-slate-500">Ramesh Kumar (SC)</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('admin')}
              className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition text-xs font-medium ${
                email === 'admin@udyamsathi.in'
                  ? 'border-purple-600 bg-purple-50/70 text-purple-900'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <ShieldCheck className="h-4 w-4 text-purple-600 shrink-0" />
              <div>
                <p className="font-bold">Admin Console</p>
                <p className="text-[10px] text-slate-500">Full CRUD Authority</p>
              </div>
            </button>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
          {error && (
            <div className="mb-5 flex items-start gap-2.5 rounded-2xl bg-red-50 border border-red-200 p-3.5 text-xs text-red-800">
              <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-5 flex items-center gap-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs text-emerald-800">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{success} - Redirecting...</span>
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Official Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.gov.in"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d5c4e] focus:border-transparent transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d5c4e] focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#0d5c4e] hover:bg-[#094237] text-white font-semibold text-sm shadow-md transition disabled:opacity-60"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 border-t border-slate-100 pt-5 text-center text-xs text-slate-500">
            Need an account?{' '}
            <Link href="/auth/register" className="font-bold text-[#0d5c4e] hover:underline">
              Register as Beneficiary
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
