
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, AlertTriangle, Calendar, Database, Check } from 'lucide-react';

interface AIAssistantResponseProps {
  response: string | null;
  isLoading?: boolean;
  isTruncated?: boolean;
  model?: string | null;
}

export const AIAssistantResponse: React.FC<AIAssistantResponseProps> = ({ 
  response,
  isLoading = false,
  isTruncated = false,
  model = null
}) => {
  // REDUCED list of error patterns to avoid false positives
  const isErrorResponse = response && (
    (response.toLowerCase().includes("don't have access") && 
     response.toLowerCase().includes("to personal")) ||
    (response.toLowerCase().includes("i don't have information") &&
     response.toLowerCase().includes("specific people")) ||
    (response.toLowerCase().includes("beyond my knowledge cutoff") &&
     !response.toLowerCase().includes("based on the data"))
  );
  
  // Detect date validation errors
  const isDateError = response && (
    response.toLowerCase().includes("is not valid") && 
    response.toLowerCase().includes("date") ||
    (response.toLowerCase().includes("invalid date") && 
    (response.toLowerCase().includes("month") || response.toLowerCase().includes("day")))
  );
  
  // Detect direct data answers from our fallback system
  const isDirectDataAnswer = response && 
    (response.toLowerCase().startsWith("based on the data provided") ||
     response.toLowerCase().includes("according to the data"));

  // Get the first sentence of the response for the bold summary
  const getFirstSentence = (text: string): string => {
    const match = text.match(/^(.*?[.!?])\s/);
    return match ? match[1] : text.split('\n')[0];
  };

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
            Error Processing Query
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm">
            <p>We couldn't process this specific query. Please try a different question about your data.</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Handle date validation errors differently
  if (isDateError) {
    return (
      <Card className="mt-4 border-amber-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center text-amber-600">
            <Calendar className="h-4 w-4 mr-2" />
            Date Format Issue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm">
            <p className="font-bold mb-2">{getFirstSentence(response)}</p>
            <p>I've analyzed the data in your dashboard.</p>
            <p className="text-xs text-gray-500 mt-2">Try using the format YYYY-MM-DD (e.g., 2025-01-31 for January 31, 2025)</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Special styling for direct data answers
  if (isDirectDataAnswer) {
    return (
      <Card className="mt-4 border-blue-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <Check className="h-4 w-4 mr-2 text-green-500" />
            Result
            {model && (
              <span className="text-xs bg-gray-100 rounded-full px-2 py-0.5 ml-2">
                {model}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm">
            <p className="font-bold mb-2">{getFirstSentence(response)}</p>
            <div className="text-xs text-gray-500 mt-4">
              <p>Results have been added to the dashboard below.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className={`mt-4 ${isTruncated ? 'border-amber-200' : ''}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center">
          {isTruncated ? (
            <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
          ) : (
            <Check className="h-4 w-4 mr-2 text-green-500" />
          )}
          Result
          {model && (
            <span className="text-xs bg-gray-100 rounded-full px-2 py-0.5 ml-2">
              {model}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm">
          <p className="font-bold mb-2">{getFirstSentence(response)}</p>
          <div className="text-xs text-gray-500 mt-4">
            <p>Results have been added to the dashboard below.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
