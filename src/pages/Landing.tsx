
import { HowItWorks } from '@/components/landing/HowItWorks';
import { DataAccess } from '@/components/landing/DataAccess';
import { Features } from '@/components/landing/Features';
import { Pricing } from '@/components/landing/Pricing';
import { Footer } from '@/components/landing/Footer';
import { PasswordGate } from '@/components/landing/PasswordGate';
import { Hero } from '@/components/landing/Hero';

const Landing = () => {
  return (
    <PasswordGate>
      <div className="min-h-screen font-sans">
        <main className="pt-16"> {/* Added padding-top to account for fixed navbar */}
          <Hero />
          <HowItWorks />
          <DataAccess />
          <Features />
          <Pricing />
        </main>
        <Footer />
      </div>
    </PasswordGate>
  );
};

export default Landing;
