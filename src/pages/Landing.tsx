
import { Navbar } from '@/components/landing/Navbar';
import { Hero } from '@/components/landing/Hero';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { DataAccess } from '@/components/landing/DataAccess';
import { Features } from '@/components/landing/Features';
import { Pricing } from '@/components/landing/Pricing';
import { Footer } from '@/components/landing/Footer';

const Landing = () => {
  return (
    <div className="min-h-screen font-sans">
      <Navbar />
      <main>
        <Hero />
        <HowItWorks />
        <DataAccess />
        <Features />
        <Pricing />
      </main>
      <Footer />
    </div>
  );
};

export default Landing;
