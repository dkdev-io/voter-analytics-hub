
import { HowItWorks } from '@/components/landing/HowItWorks';
import { Features } from '@/components/landing/Features';
import { Pricing } from '@/components/landing/Pricing';
import { Footer } from '@/components/landing/Footer';
import { Hero } from '@/components/landing/Hero';
import { Navbar } from '@/components/landing/Navbar';
import { useLocation } from 'react-router-dom';

const Landing = () => {
  const location = useLocation();
  
  return (
    <div className="min-h-screen font-sans">
      <Navbar />
      <main className="pt-16">
        <Hero />
        <HowItWorks />
        <Features />
        <Pricing />
      </main>
      <Footer />
    </div>
  );
};

export default Landing;
