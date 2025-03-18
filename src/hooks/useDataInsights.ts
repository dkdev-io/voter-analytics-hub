
import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useErrorLogger } from '@/hooks/useErrorLogger';
import { supabase } from '@/integrations/supabase/client';
import { processUserData, type DataSummary } from '@/utils/dataProcessingUtils';

export const useDataInsights = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [dataSummary, setDataSummary] = useState<DataSummary | null>(null);
  const [insight, setInsight] = useState<string | null>(null);
  const [isGeneratingInsight, setIsGeneratingInsight] = useState(false);
  const { toast } = useToast();
  const { logError } = useErrorLogger();

  // Process data and generate summary statistics
  const analyzeUserData = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const summary = await processUserData();
      setDataSummary(summary);
      
      if (!summary) {
        toast({
          title: "No Data Available",
          description: "No data found for analysis. Please upload some data first.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Data Analysis Complete",
          description: `Analyzed ${summary.totalRows} rows across ${Object.keys(summary.columnStats).length} columns`,
        });
      }
      
      return summary;
    } catch (error) {
      console.error('Error analyzing data:', error);
      logError(error as Error, 'useDataInsights.analyzeUserData');
      
      toast({
        title: "Analysis Error",
        description: error instanceof Error ? error.message : "Failed to analyze data",
        variant: "destructive",
      });
      
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast, logError]);

  // Generate AI insight based on data summary
  const generateInsight = useCallback(async (question?: string) => {
    if (!dataSummary) {
      toast({
        title: "No Data Summary",
        description: "Please analyze data first before generating insights",
        variant: "destructive",
      });
      return null;
    }
    
    setIsGeneratingInsight(true);
    
    try {
      console.log("Generating insight for data summary:", dataSummary);
      
      // Default prompt if no specific question
      const defaultPrompt = "What are the most important insights from this data? Focus on key metrics and trends.";
      const userPrompt = question || defaultPrompt;
      
      // Call OpenAI function with structured data
      const { data, error } = await supabase.functions.invoke('openai-chat', {
        body: { 
          prompt: userPrompt,
          includeData: true,
          dataSummary: dataSummary, // Send the structured summary instead of raw data
          conciseResponse: true
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }
      
      const insightText = data.answer;
      console.log("AI generated insight:", insightText);
      setInsight(insightText);
      
      return insightText;
    } catch (error) {
      console.error('Error generating insight:', error);
      logError(error as Error, 'useDataInsights.generateInsight');
      
      toast({
        title: "Insight Error",
        description: error instanceof Error ? error.message : "Failed to generate insight",
        variant: "destructive",
      });
      
      return null;
    } finally {
      setIsGeneratingInsight(false);
    }
  }, [dataSummary, toast, logError]);

  // Initial data analysis on component mount
  useEffect(() => {
    if (!dataSummary) {
      analyzeUserData();
    }
  }, [analyzeUserData, dataSummary]);

  return {
    isLoading,
    isGeneratingInsight,
    dataSummary,
    insight,
    analyzeUserData,
    generateInsight
  };
};
