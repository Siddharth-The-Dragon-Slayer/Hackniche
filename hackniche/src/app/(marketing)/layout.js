'use client';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import BackToTop from '@/components/layout/BackToTop';

export default function MarketingLayout({ children }) {
  return (
    <>
      <Navbar />
      <main style={{ overflowX: 'hidden', width: '100%' }}>{children}</main>
      <Footer />
      <BackToTop />
    </>
  );
}
