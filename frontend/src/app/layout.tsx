import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'UdyamSathi - AI-Driven Scheme Matching for Entrepreneurs',
  description: 'Find the right government financial assistance scheme based on your eligibility. Get personalized recommendations, EMI calculations, and locate nearby channel partners.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased text-slate-900 bg-slate-50">
        <AuthProvider>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
