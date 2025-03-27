
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export const Pricing = () => {
  const plans = [
    {
      name: "User",
      features: [
        "Built for local and legislative campaigns with a handful of staff and volunteers."
      ]
    },
    {
      name: "Power User",
      features: [
        "Built for congressional and statewide staffs with large field teams."
      ]
    },
    {
      name: "Partner",
      features: [
        "Built for statewide and national partners who need to view results across multiple campaigns."
      ]
    }
  ];

  return (
    <section className="py-20 px-4 md:px-6" id="pricing">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">Choose Your Plan</h2>
        
        <div className="grid md:grid-cols-3 gap-8 mt-12">
          {plans.map((plan, index) => (
            <Card key={index} className="border shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="pb-0">
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center">
                      <svg className="h-5 w-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link to="/auth">
                  <Button className="w-full bg-blue-500 hover:bg-white hover:text-blue-500 border border-blue-500 text-white transition-colors">Get Started</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
