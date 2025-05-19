
import { HowItWorks } from '@/components/landing/HowItWorks';
import { Features } from '@/components/landing/Features';
import { Pricing } from '@/components/landing/Pricing';
import { Footer } from '@/components/landing/Footer';
import { Hero } from '@/components/landing/Hero';
import { Navbar } from '@/components/landing/Navbar';
import { AuthForm } from '@/components/auth/AuthForm';
import { useLocation } from 'react-router-dom';

const Landing = () => {
  const location = useLocation();
  
  return (
    <div className="min-h-screen font-sans">
      <Navbar />
      <main className="pt-16">
        <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center">
          <div className="max-w-md w-full">
            <AuthForm redirectPath="/connect-data" />
          </div>
        </div>
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
