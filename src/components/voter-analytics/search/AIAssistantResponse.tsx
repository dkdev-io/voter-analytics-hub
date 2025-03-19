
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, AlertTriangle, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AIAssistantResponseProps {
  response: string | null;
  isLoading?: boolean;
  isTruncated?: boolean;
  model?: string | null;
  onUseAdvancedModel?: () => void;
}

export const AIAssistantResponse: React.FC<AIAssistantResponseProps> = ({ 
  response,
  isLoading = false,
  isTruncated = false,
  model = null,
  onUseAdvancedModel
}) => {
  // Expanded list of error patterns to catch more variations of "no access" messages
  const isErrorResponse = response && (
    response.toLowerCase().includes("don't have access") || 
    response.toLowerCase().includes("i don't have information") ||
    response.toLowerCase().includes("don't have specific personal data") ||
    response.toLowerCase().includes("i don't have specific") ||
    response.toLowerCase().includes("beyond my knowledge cutoff") ||
    response.toLowerCase().includes("after my last update") ||
    response.toLowerCase().includes("i don't have data") ||
    response.toLowerCase().includes("i don't have access to data") ||
    response.toLowerCase().includes("cannot provide information about") ||
    response.toLowerCase().includes("can't access") ||
    response.toLowerCase().includes("i'm unable to provide specific information") ||
    response.toLowerCase().includes("i'm sorry, but i don't") ||
    response.toLowerCase().includes("not privy to") ||
    response.toLowerCase().includes("as an ai") ||
    response.toLowerCase().includes("my training data") ||
    response.toLowerCase().includes("my knowledge")
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
    <Card className={`mt-4 ${isTruncated ? 'border-amber-200' : ''}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center">
          {isTruncated && (
            <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
          )}
          Insight
          {model && (
            <span className="text-xs bg-gray-100 rounded-full px-2 py-0.5 ml-2">
              {model}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm whitespace-pre-wrap prose prose-sm max-w-none">
          {response}
        </div>
      </CardContent>
      {isTruncated && onUseAdvancedModel && (
        <CardFooter className="flex justify-start pt-0 px-6 pb-4">
          <div className="text-xs text-amber-600 bg-amber-50 rounded-lg p-2 mb-2 flex items-start">
            <AlertTriangle className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
            <span>
              This response was truncated due to data complexity. Try using a more advanced model for better results.
            </span>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="mt-2"
            onClick={onUseAdvancedModel}
          >
            <Zap className="h-3 w-3 mr-1" />
            Use Advanced Model
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};
