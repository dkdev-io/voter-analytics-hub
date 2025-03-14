
import { Card, CardContent } from '@/components/ui/card';
import { Database, BarChart3, LineChart, MessageSquareText, Lightbulb, ShieldCheck } from 'lucide-react';

export const Features = () => {
  const featuresList = [
    {
      title: "Connect to your data",
      description: "Dashboard connects to the leading voter file software. No importing and exporting spreadsheets.",
      icon: <Database className="h-10 w-10 text-blue-500" />
    },
    {
      title: "Prebuilt reports",
      description: "View prebuilt and adjustible reports that help you quickly see the data that you need.",
      icon: <BarChart3 className="h-10 w-10 text-blue-500" />
    },
    {
      title: "Custom reports",
      description: "Design custom reports by dragging and dropping.",
      icon: <LineChart className="h-10 w-10 text-blue-500" />
    },
    {
      title: "Plain text questions",
      description: "Have a question about your data? Ask Dashboard in plain conversational text or use our prebuilt form.",
      icon: <MessageSquareText className="h-10 w-10 text-blue-500" />
    },
    {
      title: "Ongoing support",
      description: "Attend regular workshops and trainings that help you use Dashboard to understand your data.",
      icon: <Lightbulb className="h-10 w-10 text-blue-500" />
    },
    {
      title: "Safe and Secure data",
      description: "We take privacy and security seriously. We use enterprise level safety to keep your voter contact results safe and our data will never be sold.",
      icon: <ShieldCheck className="h-10 w-10 text-blue-500" />
    }
  ];

  return (
    <section className="py-20 px-4 md:px-6 bg-gray-50">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-3xl md:text-4xl font-bold mb-16 text-center">Features</h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          {featuresList.map((feature, index) => (
            <Card key={index} className="border-0 shadow-md">
              <CardContent className="pt-6 flex gap-4">
                <div className="shrink-0">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-gray-700">{feature.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
