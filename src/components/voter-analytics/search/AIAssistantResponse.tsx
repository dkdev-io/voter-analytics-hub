
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from "@/components/ui/skeleton";

interface AIAssistantResponseProps {
  response: string | null;
  isLoading?: boolean;
}

export const AIAssistantResponse: React.FC<AIAssistantResponseProps> = ({ 
  response,
  isLoading = false
}) => {
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
