import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from "@/components/ui/skeleton";
import { 
  AlertCircle, 
  AlertTriangle, 
  Calendar, 
  Check, 
  Lightbulb, 
  Target,
  MessageCircle,
  BarChart3,
  Bot,
  Loader2
} from 'lucide-react';

interface AIAssistantResponseProps {
  response: string | null;
  isLoading?: boolean;
  isTruncated?: boolean;
  model?: string | null;
  insights?: string[];
  recommendations?: string[];
  followUpQuestions?: string[];
  confidence?: number;
  visualizationSuggestions?: string[];
}

export const AIAssistantResponse: React.FC<AIAssistantResponseProps> = ({ 
  response,
  isLoading = false,
  isTruncated = false,
  model = null,
  insights = [],
  recommendations = [],
  followUpQuestions = [],
  confidence = 0,
  visualizationSuggestions = []
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
          <CardTitle className="text-sm font-medium flex items-center">
            <Bot className="h-4 w-4 mr-2 text-primary" />
            AI Assistant
            <Loader2 className="h-3 w-3 ml-2 animate-spin" />
          </CardTitle>
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
  
  // Don't render if no content
  if (!response && insights.length === 0 && recommendations.length === 0 && followUpQuestions.length === 0) {
    return null;
  }

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
            <p className="font-bold mb-2">{response && getFirstSentence(response)}</p>
            <p>I've analyzed the data in your dashboard.</p>
            <p className="text-xs text-gray-500 mt-2">Try using the format YYYY-MM-DD (e.g., 2025-01-31 for January 31, 2025)</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`mt-4 ${isTruncated ? 'border-amber-200' : 'border-green-100'}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <div className="flex items-center">
            {isTruncated ? (
              <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
            ) : (
              <Check className="h-4 w-4 mr-2 text-green-500" />
            )}
            AI Assistant Response
          </div>
          <div className="flex items-center gap-2">
            {confidence > 0 && (
              <Badge variant="outline" className="text-xs">
                {Math.round(confidence * 100)}% confidence
              </Badge>
            )}
            {model && (
              <Badge variant="secondary" className="text-xs">
                {model}
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Main Response */}
        {response && (
          <div className="text-sm">
            <p className="font-bold mb-2">{getFirstSentence(response)}</p>
            {response.split('.').length > 1 && (
              <div className="text-gray-600">
                {response.split('.').slice(1).join('.').trim()}
              </div>
            )}
          </div>
        )}

        {/* Truncation Warning */}
        {isTruncated && (
          <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium">Response Truncated</p>
              <p>The response was cut off due to length limits. Try asking a more specific question for a complete answer.</p>
            </div>
          </div>
        )}

        {/* Enhanced AI Features */}
        {(insights.length > 0 || recommendations.length > 0 || followUpQuestions.length > 0 || visualizationSuggestions.length > 0) && (
          <>
            <Separator />
            <div className="space-y-4">
              
              {/* Insights */}
              {insights.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <Lightbulb className="h-3 w-3 text-blue-500" />
                    Key Insights
                  </h4>
                  <div className="space-y-2">
                    {insights.map((insight, idx) => (
                      <div key={idx} className="text-xs text-gray-600 pl-3 border-l-2 border-blue-200 bg-blue-50 p-2 rounded-r">
                        {insight}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {recommendations.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <Target className="h-3 w-3 text-green-500" />
                    Recommendations
                  </h4>
                  <div className="space-y-2">
                    {recommendations.map((rec, idx) => (
                      <div key={idx} className="text-xs text-gray-600 pl-3 border-l-2 border-green-200 bg-green-50 p-2 rounded-r">
                        {rec}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Follow-up Questions */}
              {followUpQuestions.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <MessageCircle className="h-3 w-3 text-purple-500" />
                    Follow-up Questions
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {followUpQuestions.map((question, idx) => (
                      <Badge 
                        key={idx} 
                        variant="outline" 
                        className="text-xs cursor-pointer hover:bg-purple-50 hover:border-purple-300"
                        onClick={() => {
                          // This could trigger a new search with the follow-up question
                          console.log('Follow-up question clicked:', question);
                        }}
                      >
                        {question}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Visualization Suggestions */}
              {visualizationSuggestions.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <BarChart3 className="h-3 w-3 text-orange-500" />
                    Visualization Suggestions
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {visualizationSuggestions.map((suggestion, idx) => (
                      <Badge 
                        key={idx} 
                        variant="secondary" 
                        className="text-xs"
                      >
                        {suggestion.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Footer */}
        <div className="text-xs text-gray-500 pt-2 border-t">
          <p>Results have been added to the dashboard below.</p>
        </div>
      </CardContent>
    </Card>
  );
};