
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export const Hero = () => {
  return (
    <section className="pt-32 pb-20 px-4 md:px-6">
      <div className="container mx-auto max-w-4xl text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
          Dashboard Makes Tracking and Analyzing Your Voter Contact Easy
        </h1>
        <p className="text-lg md:text-xl text-gray-700 mb-8 max-w-3xl mx-auto">
          Our AI-powered tool helps you track, analyze and understand your voter contact data without tedious searches, 
          scores of spreadsheets, and hours of time spent combing through your vote file. Built by a field operative 
          for field operatives that want to spend less time running counts and more time contacting voters.
        </p>
        <Link to="/auth">
          <Button size="lg" className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-6 h-auto">
            Get Started
          </Button>
        </Link>
      </div>
    </section>
  );
};
