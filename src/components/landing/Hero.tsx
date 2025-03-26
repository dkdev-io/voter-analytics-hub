import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
export const Hero = () => {
  return <section className="pt-32 pb-20 px-4 md:px-6 bg-background">
      <div className="container mx-auto max-w-4xl text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">Make Tracking and Analyzing Your Voter Contact Easy</h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">Our AI-powered tool helps you track amd analyze your voter contact data so you can spend less time running counts and more time contacting voters.</p>
        <Link to="/auth">
          <Button size="lg" className="bg-primary hover:bg-background hover:text-primary border border-primary px-8 py-6 h-auto transition-colors">
            Get Started
          </Button>
        </Link>
      </div>
    </section>;
};