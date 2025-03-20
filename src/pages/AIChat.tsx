
import { useState } from 'react';
import { OpenAIChat } from '@/components/ai-chat/OpenAIChat';
import { Button } from '@/components/ui/button';
import { Info, Database } from 'lucide-react';
import { Card } from '@/components/ui/card';

const AIChat = () => {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">AI Chat Assistant</h1>
        <Button variant="ghost" size="sm" onClick={() => setShowHelp(!showHelp)}>
          <Info className="h-4 w-4 mr-1" />
          {showHelp ? 'Hide Help' : 'Show Help'}
        </Button>
      </div>
      
      {showHelp && (
        <Card className="p-4 mb-6 bg-blue-50 text-sm">
          <h3 className="font-medium mb-2 flex items-center">
            <Database className="h-4 w-4 mr-1" />
            Sample Questions
          </h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>How many phone calls did Dan Kelly make?</li>
            <li>How many SMS messages were sent last month?</li>
            <li>Which team had the most contacts?</li>
            <li>What was the success rate of canvassing compared to phone calls?</li>
            <li>How many voter contact attempts have been made in total?</li>
          </ul>
          <p className="mt-3 text-gray-600">
            If you encounter any errors, the diagnostic information can help troubleshoot the issue.
          </p>
        </Card>
      )}
      
      <OpenAIChat />
    </div>
  );
};

export default AIChat;
