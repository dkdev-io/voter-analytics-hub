
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from 'lucide-react';

interface AIAssistantResponseProps {
  response: string | null;
  isLoading?: boolean;
}

export const AIAssistantResponse: React.FC<AIAssistantResponseProps> = ({ 
  response,
  isLoading = false
}) => {
  // Check if the response contains the "I don't have access" error message
  const isErrorResponse = response && (
    response.includes("I don't have access") || 
    response.includes("I'm sorry, but I don't have access") ||
    response.includes("I don't have specific personal data")
  );

  if (isLoading) {
    return (
      <Card className="mt-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Generating Insight...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!response) return null;

  // Handle error responses differently
  if (isErrorResponse) {
    return (
      <Card className="mt-4 border-red-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center text-red-500">
            <AlertCircle className="h-4 w-4 mr-2" />
            Error in AI Response
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm whitespace-pre-wrap prose prose-sm max-w-none">
            <p>The AI has incorrectly stated it doesn't have access to data. This is a system error.</p>
            <p className="text-xs text-gray-500 mt-2">Please try again with a different question or contact support if this persists.</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
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
