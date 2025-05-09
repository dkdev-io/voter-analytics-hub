
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
  const generateInsight = useCallback(async (
    question?: string, 
    useSummary: boolean = true
  ) => {
    // Check if we have data to analyze
    if (!dataSummary && useSummary) {
      // Try to analyze data first if we don't have a summary
      const summary = await analyzeUserData();
      if (!summary) {
        toast({
          title: "No Data Summary",
          description: "No data available for analysis. Please upload some data first.",
          variant: "destructive",
        });
        return null;
      }
    }
    
    setIsGeneratingInsight(true);
    
    try {
      console.log("Generating insight with options:", {
        question,
        useSummary,
        hasSummary: !!dataSummary
      });
      
      // Default prompt if no specific question
      const defaultPrompt = "What are the most important insights from this data? Focus on key metrics and trends.";
      const userPrompt = question || defaultPrompt;
      
      // Enhanced system instructions to force OpenAI to use the provided data
      const enhancedPrompt = `${userPrompt} 
      
IMPORTANT: You MUST use ONLY the provided data to answer this question. Do NOT say you don't have access to data or need more context.`;
      
      // Call OpenAI function with appropriate data approach
      const { data, error } = await supabase.functions.invoke('openai-chat', {
        body: { 
          prompt: enhancedPrompt,
          includeData: true,
          // Only include data summary if we're using the summary approach
          dataSummary: useSummary ? dataSummary : null,
          conciseResponse: true,
          useAdvancedModel: true // Always use advanced model for better results
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
      
      // Check if response contains access denial phrases
      const accessDenialPhrases = [
        "i don't have access", "i don't have information", "my knowledge", "i need more context",
        "could you please clarify", "please provide more information"
      ];
      
      const containsAccessDenial = accessDenialPhrases.some(phrase => 
        insightText.toLowerCase().includes(phrase)
      );
      
      if (containsAccessDenial) {
        console.error("OpenAI response contains access denial despite our instructions!");
        
        // Try a more direct approach with stronger instructions
        const retryResult = await supabase.functions.invoke('openai-chat', {
          body: { 
            prompt: "Provide a direct summary of the data you were given. Do not say you don't have access to data.",
            includeData: true,
            dataSummary: useSummary ? dataSummary : null,
            conciseResponse: true,
            useAdvancedModel: true
          }
        });
        
        if (retryResult.error) {
          throw new Error(retryResult.error.message);
        }
        
        if (retryResult.data.error) {
          throw new Error(retryResult.data.error);
        }
        
        // Use the retry response instead
        const retryInsight = retryResult.data.answer;
        console.log("Retry AI generated insight:", retryInsight);
        setInsight(retryInsight);
        
        toast({
          title: "Insight Generated",
          description: "AI has analyzed your data and generated insights.",
        });
        
        return retryInsight;
      }
      
      setInsight(insightText);
      
      toast({
        title: "Insight Generated",
        description: "AI has analyzed your data and generated insights.",
      });
      
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
  }, [dataSummary, toast, logError, analyzeUserData]);

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
