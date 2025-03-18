
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useErrorLogger } from '@/hooks/useErrorLogger';
import { supabase } from '@/integrations/supabase/client';
import { type QueryParams } from '@/types/analytics';

interface UseLLMProcessorOptions {
  setQuery?: (query: Partial<QueryParams>) => void;
}

export const useLLMProcessor = ({ setQuery }: UseLLMProcessorOptions) => {
  const [isProcessingQuery, setIsProcessingQuery] = useState(false);
  const { toast } = useToast();
  const { logError } = useErrorLogger();

  const processWithLLM = useCallback(async (userQuery: string) => {
    setIsProcessingQuery(true);
    try {
      const { data, error } = await supabase.functions.invoke('openai-chat', {
        body: { 
          prompt: `
            Given this natural language query about voter analytics: "${userQuery}", 
            extract structured parameters for searching a voter database. 
            The result should be a valid JSON object with these possible fields:
            - tactic: "Phone", "SMS", or "Canvas" (type of voter contact)
            - person: The full name of the person, with proper capitalization
            - date: In YYYY-MM-DD format
            - resultType: "attempts", "contacts", "support", "oppose", "undecided", "notHome", "refusal", or "badData"
            - team: The team name if mentioned
            
            Only include fields that are explicitly mentioned or strongly implied in the query.
            Return ONLY the JSON with no additional text.
          `
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data || !data.answer) {
        throw new Error("No response from AI");
      }

      // Try to parse the JSON response
      try {
        const extractedParams = JSON.parse(data.answer.trim());
        console.log("LLM extracted parameters:", extractedParams);
        
        // Only update the query if we have a setQuery function
        if (setQuery) {
          // Preserve the original searchQuery
          setQuery({
            ...extractedParams,
            searchQuery: userQuery
          });
        }
        
        return true;
      } catch (parseError) {
        console.error("Failed to parse LLM response:", data.answer);
        console.error("Parse error:", parseError);
        throw new Error("Failed to parse parameters from the query");
      }
    } catch (error) {
      console.error('Error processing with LLM:', error);
      logError(error as Error, 'SearchField.processWithLLM');
      throw error;
    } finally {
      setIsProcessingQuery(false);
    }
  }, [setQuery, logError]);

  return {
    isProcessingQuery,
    setIsProcessingQuery,
    processWithLLM
  };
};
