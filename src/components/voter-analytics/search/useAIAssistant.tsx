
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useErrorLogger } from '@/hooks/useErrorLogger';
import { supabase } from '@/integrations/supabase/client';
import { type QueryParams } from '@/types/analytics';

export const useAIAssistant = () => {
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isResponseTruncated, setIsResponseTruncated] = useState(false);
  const [responseModel, setResponseModel] = useState<string | null>(null);
  const { toast } = useToast();
  const { logError } = useErrorLogger();

  const getAIAssistance = useCallback(async (
    inputValue: string, 
    queryParams?: Partial<QueryParams>, 
    useAdvancedModel: boolean = false
  ) => {
    if (!inputValue.trim()) {
      toast({
        title: "Empty Query",
        description: "Please enter a question or query before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsAiLoading(true);
    setAiResponse(null);
    setIsResponseTruncated(false);
    setResponseModel(null);

    try {
      console.log("Getting AI assistance for:", inputValue);
      console.log("With query parameters:", queryParams);
      console.log("Using advanced model:", useAdvancedModel);
      
      // Ensure we're passing structured parameters to help filter relevant data
      const { data, error } = await supabase.functions.invoke('openai-chat', {
        body: { 
          prompt: inputValue,
          includeData: true, 
          queryParams: queryParams || {}, // Pass the extracted parameters to filter relevant data
          conciseResponse: true,
          useAdvancedModel // Pass the advanced model flag
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      console.log("AI response received:", data.answer);
      setAiResponse(data.answer);
      
      // Set truncation flag if the response was cut off
      if (data.truncated) {
        setIsResponseTruncated(true);
        console.warn("Response was truncated due to token limits");
      }
      
      // Set the model used for the response
      if (data.model) {
        setResponseModel(data.model);
      }
      
      toast({
        title: "Insight Ready",
        description: data.truncated 
          ? "Analysis may be incomplete due to data size limitations." 
          : "Here's what the data shows.",
        variant: data.truncated ? "warning" : "default"
      });
    } catch (error) {
      console.error('Error calling OpenAI:', error);
      logError(error as Error, 'SearchField.handleAiAssist');
      
      toast({
        title: "AI Assistant Error",
        description: error instanceof Error ? error.message : "Failed to get response from AI assistant",
        variant: "destructive",
      });
    } finally {
      setIsAiLoading(false);
    }
  }, [toast, logError]);

  return {
    aiResponse,
    isAiLoading,
    isResponseTruncated,
    responseModel,
    getAIAssistance
  };
};
