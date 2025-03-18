
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
      console.log("Processing query with LLM:", userQuery);
      
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
            
            Example 1:
            Query: "How many SMS attempts did Jane Doe make on 2025-01-31?"
            Response: {"tactic":"SMS","person":"Jane Doe","date":"2025-01-31","resultType":"attempts"}
            
            Example 2:
            Query: "Show me phone calls by Team Tony"
            Response: {"tactic":"Phone","team":"Team Tony"}
            
            Example 3:
            Query: "How many Phone attempts did Jane Doe make on 2025-01-02?"
            Response: {"tactic":"Phone","person":"Jane Doe","date":"2025-01-02","resultType":"attempts"}
          `
        }
      });

      if (error) {
        console.error("Error from Supabase function:", error);
        throw new Error(error.message);
      }

      if (!data || !data.answer) {
        console.error("No response from AI");
        throw new Error("No response from AI");
      }

      console.log("LLM raw response:", data.answer);

      // Try to parse the JSON response
      try {
        // Clean the response of any markdown formatting or extra text
        let cleanedResponse = data.answer.trim();
        if (cleanedResponse.startsWith('```') && cleanedResponse.endsWith('```')) {
          cleanedResponse = cleanedResponse.substring(3, cleanedResponse.length - 3).trim();
        }
        if (cleanedResponse.startsWith('json')) {
          cleanedResponse = cleanedResponse.substring(4).trim();
        }
        
        const extractedParams = JSON.parse(cleanedResponse);
        console.log("LLM extracted parameters:", extractedParams);
        
        // Validate extracted parameters
        if (Object.keys(extractedParams).length === 0) {
          console.error("No parameters extracted from query");
          throw new Error("Could not extract search parameters from your query");
        }
        
        // Only update the query if we have a setQuery function
        if (setQuery) {
          // Preserve the original searchQuery
          const updatedQuery = {
            ...extractedParams,
            searchQuery: userQuery
          };
          
          console.log("Setting query with parameters:", updatedQuery);
          setQuery(updatedQuery);
          
          toast({
            title: "Query Processed",
            description: `Interpreted as: ${Object.entries(extractedParams)
              .map(([key, value]) => `${key}: ${value}`)
              .join(', ')}`,
          });
          
          return true;
        }
        
        return false;
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
  }, [setQuery, logError, toast]);

  return {
    isProcessingQuery,
    setIsProcessingQuery,
    processWithLLM
  };
};
