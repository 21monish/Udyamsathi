import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-sm">US</div>
              <span className="text-xl font-bold text-gray-900">UdyamSathi</span>
            </div>
            <p className="text-sm text-gray-600">AI-driven scheme matching platform helping marginalized entrepreneurs find the right government financial assistance.</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="/schemes" className="hover:text-blue-600">Browse Schemes</Link></li>
              <li><Link href="/eligibility" className="hover:text-blue-600">Check Eligibility</Link></li>
              <li><Link href="/calculator" className="hover:text-blue-600">EMI Calculator</Link></li>
              <li><Link href="/partners" className="hover:text-blue-600">Find Partners</Link></li>
              <li><Link href="/application-guide" className="hover:text-blue-600">Application Guide</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Resources</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="/about" className="hover:text-blue-600">About Us</Link></li>
              <li><Link href="/how-it-works" className="hover:text-blue-600">How It Works</Link></li>
              <li><Link href="/assistant" className="hover:text-blue-600">AI Assistant</Link></li>
              <li><a href="https://nsfdc.nic.in" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">NSFDC Official</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Contact</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>Email: support@udyamsathi.in</li>
              <li>Helpline: 1800-XXX-XXXX</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} UdyamSathi — Smart India Hackathon 2026</p>
          <p className="mt-1 text-xs">This is a hackathon demonstration project. Scheme data shown may be simulated.</p>
        </div>
      </div>
    </footer>
  );
}
