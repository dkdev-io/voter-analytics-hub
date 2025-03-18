
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AIAssistantResponseProps {
  response: string | null;
}

export const AIAssistantResponse: React.FC<AIAssistantResponseProps> = ({ response }) => {
  if (!response) return null;
  
  return (
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Insight</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm whitespace-pre-wrap prose prose-sm max-w-none">
          {response}
        </div>
      </CardContent>
    </Card>
  );
};
