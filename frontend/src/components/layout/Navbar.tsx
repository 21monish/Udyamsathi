'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/schemes', label: 'Schemes' },
  { href: '/eligibility', label: 'Check Eligibility' },
  { href: '/calculator', label: 'EMI Calculator' },
  { href: '/partners', label: 'Find Partners' },
  { href: '/assistant', label: 'AI Assistant' },
];

const languages = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'gu', label: 'ગુજરાતી' },
];

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('en');
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-sm">
            SS
          </div>
          <span className="text-xl font-bold text-gray-900">SchemeSetu</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="hidden md:flex items-center space-x-3">
          {/* Language Switcher */}
          <div className="relative">
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-md hover:bg-gray-100"
            >
              🌐 {languages.find(l => l.code === currentLang)?.label}
            </button>
            {langDropdownOpen && (
              <div className="absolute right-0 mt-1 w-32 rounded-md border bg-white shadow-lg z-50">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => { setCurrentLang(lang.code); setLangDropdownOpen(false); }}
                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${currentLang === lang.code ? 'bg-blue-50 text-blue-600' : ''}`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Auth */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md hover:bg-gray-100"
              >
                👤 {user?.name}
              </button>
              {userDropdownOpen && (
                <div className="absolute right-0 mt-1 w-48 rounded-md border bg-white shadow-lg z-50">
                  <Link href="/dashboard" className="block px-4 py-2 text-sm hover:bg-gray-100" onClick={() => setUserDropdownOpen(false)}>
                    Dashboard
                  </Link>
                  <Link href="/profile" className="block px-4 py-2 text-sm hover:bg-gray-100" onClick={() => setUserDropdownOpen(false)}>
                    Profile
                  </Link>
                  {user?.role === 'ADMIN' && (
                    <Link href="/admin" className="block px-4 py-2 text-sm hover:bg-gray-100" onClick={() => setUserDropdownOpen(false)}>
                      Admin Panel
                    </Link>
                  )}
                  <hr />
                  <button onClick={() => { logout(); setUserDropdownOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link href="/auth/login" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600">
                Login
              </Link>
              <Link href="/auth/register" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                Register
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-white px-4 py-4 space-y-3">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="block text-sm font-medium text-gray-600 hover:text-blue-600" onClick={() => setMobileMenuOpen(false)}>
              {link.label}
            </Link>
          ))}
          <div className="pt-3 border-t space-y-2">
            {!isAuthenticated ? (
              <>
                <Link href="/auth/login" className="block text-center py-2 text-sm border rounded-md hover:bg-gray-50">Login</Link>
                <Link href="/auth/register" className="block text-center py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700">Register</Link>
              </>
            ) : (
              <button onClick={logout} className="block w-full text-center py-2 text-sm border rounded-md hover:bg-gray-50">Logout</button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
