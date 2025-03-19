import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'lucide-react';
export const HowItWorks = () => {
  return <section className="py-20 px-4 md:px-6 bg-blue-500 text-white" id="features">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How it works</h2>
          <p className="text-xl max-w-3xl mx-auto">
            Connect your data, view the metrics that matter, and ask plain text questions to get the data you need.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="bg-white text-black border-0">
            <CardContent className="pt-6">
              <h3 className="text-xl font-bold mb-4">Connect Your Data</h3>
              <p>Upload your data or connect to your voter file software. Your data stays safe and secure.</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white text-black border-0">
            <CardContent className="pt-6">
              <h3 className="text-xl font-bold mb-4">View the Metrics that Matter</h3>
              <p>Prebuilt and searchable reports that help you focus on the metrics that shoulddrive your voter contact program.</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white text-black border-0">
            <CardContent className="pt-6">
              <h3 className="text-xl font-bold mb-4">Ask questions</h3>
              <p>Ask plain text questions to get the data you need. No more trying to translate what you want to see into &quot;voter file speak.&quot;</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>;
};