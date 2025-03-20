
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
  const { logError, logDataIssue } = useErrorLogger();

  const getAIAssistance = useCallback(async (
    inputValue: string, 
    queryParams?: Partial<QueryParams>, 
    useAdvancedModel: boolean = true
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
      
      // Prepare request with explicit instructions to use the provided data
      const { data, error } = await supabase.functions.invoke('openai-chat', {
        body: { 
          prompt: inputValue,
          includeData: true, 
          queryParams: queryParams || {}, // Pass the extracted parameters to filter relevant data
          conciseResponse: true,
          useAdvancedModel: true // Always use advanced model for better results
        },
      });

      if (error) {
        console.error("Edge function error:", error);
        throw new Error(`Edge function error: ${error.message}`);
      }

      if (data.error) {
        console.error("OpenAI API error:", data.error);
        throw new Error(data.error);
      }

      console.log("AI response received:", data.answer);
      
      // Check if the response contains any indication that the AI is claiming lack of access
      const accessDenialPhrases = [
        "i don't have access", 
        "i don't have information",
        "i don't have data",
        "my knowledge",
        "my training",
        "knowledge cutoff",
        "i apologize",
        "i cannot provide"
      ];
      
      const containsAccessDenial = accessDenialPhrases.some(phrase => 
        data.answer.toLowerCase().includes(phrase)
      );
      
      if (containsAccessDenial) {
        console.warn("AI response contains access denial language despite our instructions");
        
        // Log this issue for future debugging
        logDataIssue("ai-access-denial", {
          query: inputValue,
          parameters: queryParams,
          response: data.answer,
          model: data.model
        });
        
        // Still set the response and let the UI component handle the error display
      }
      
      setAiResponse(data.answer);
      
      // Set truncation flag if the response was cut off
      if (data.truncated) {
        setIsResponseTruncated(true);
        console.warn("Response was truncated due to token limits");
      }
      
      // Set the model used for the response
      if (data.model) {
        setResponseModel(data.model);
        console.log("Response generated using model:", data.model);
      }
      
      // We're removing the toast notification here as requested by the user
    } catch (error) {
      console.error('Error calling OpenAI:', error);
      logError(error as Error, 'SearchField.handleAiAssist');
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Failed to get response from AI assistant";
        
      const isEdgeFunctionError = errorMessage.includes("Failed to send a request to the Edge Function");
      
      toast({
        title: isEdgeFunctionError ? "Server Connection Error" : "AI Assistant Error",
        description: isEdgeFunctionError 
          ? "Could not connect to the AI service. Please try again in a moment." 
          : errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsAiLoading(false);
    }
  }, [toast, logError, logDataIssue]);

  return {
    aiResponse,
    isAiLoading,
    isResponseTruncated,
    responseModel,
    getAIAssistance
  };
};
