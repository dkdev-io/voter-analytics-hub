
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, BarChart, Search, RefreshCw } from 'lucide-react';
import { useDataInsights } from '@/hooks/useDataInsights';
import { AIAssistantResponse } from '../search/AIAssistantResponse';

export const DataInsightsPanel = () => {
  const [question, setQuestion] = useState('');
  const { 
    isLoading, 
    isGeneratingInsight, 
    dataSummary, 
    insight, 
    analyzeUserData, 
    generateInsight 
  } = useDataInsights();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await generateInsight(question);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.metaKey) {
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Data Insights</CardTitle>
            <CardDescription>
              AI-powered analysis of your voter contact data
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={analyzeUserData}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span className="ml-2">Refresh</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {dataSummary ? (
          <>
            <div className="mb-4">
              <div className="flex items-center mb-2">
                <BarChart className="h-4 w-4 mr-2 text-gray-500" />
                <span className="text-sm font-medium">
                  {dataSummary.totalRows.toLocaleString()} rows analyzed across {Object.keys(dataSummary.columnStats).length} columns
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="relative w-full">
                <Search className="absolute left-3 top-3 text-gray-400 h-4 w-4" />
                <Textarea
                  placeholder="Ask a question about your data (e.g., 'What's the average number of contacts per team member?')"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="pl-10 w-full min-h-[80px] resize-none" 
                  disabled={isGeneratingInsight}
                />
                <div className="text-xs text-gray-500 mt-1 text-right">Press ⌘+Enter to submit</div>
              </div>
              
              <Button 
                type="submit"
                disabled={isGeneratingInsight || !question.trim()}
                className="w-full"
              >
                {isGeneratingInsight ? (
                  <span className="flex items-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing Data...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Search className="mr-2 h-4 w-4" />
                    Get Insight
                  </span>
                )}
              </Button>
            </form>

            <AIAssistantResponse response={insight} />
          </>
        ) : (
          <div className="py-12 text-center">
            {isLoading ? (
              <>
                <Loader2 className="h-10 w-10 mx-auto animate-spin text-primary" />
                <p className="mt-4 text-gray-500">Analyzing your data...</p>
              </>
            ) : (
              <>
                <p className="text-gray-500">No data available for analysis.</p>
                <Button 
                  onClick={analyzeUserData} 
                  className="mt-4"
                >
                  Analyze Data
                </Button>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
