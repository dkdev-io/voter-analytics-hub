
import { useState, useCallback } from 'react';
import { useErrorLogger } from '@/hooks/useErrorLogger';
import { supabase } from '@/integrations/supabase/client';
import { type QueryParams } from '@/types/analytics';

interface UseLLMProcessorOptions {
  setQuery?: (query: Partial<QueryParams>) => void;
}

export const useLLMProcessor = ({ setQuery }: UseLLProcessorOptions) => {
  const [isProcessingQuery, setIsProcessingQuery] = useState(false);
  const { logError } = useErrorLogger();

  const processWithLLM = useCallback(async (userQuery: string) => {
    if (!setQuery) {
      console.error("No setQuery function provided to useLLMProcessor");
      return false;
    }

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
            - date: In YYYY-MM-DD format (must be a valid date)
            - resultType: "attempts", "contacts", "support", "oppose", "undecided", "notHome", "refusal", or "badData"
            - team: The team name if mentioned
            
            IMPORTANT DATE INSTRUCTIONS:
            - Always validate dates before returning them
            - If someone mentions "January 31, 2025" convert it to "2025-01-31"
            - If a date like "2025-31-01" is mentioned, it's likely in the wrong format and should be "2025-01-31"
            - Never return an invalid date like February 30
            
            Only include fields that are explicitly mentioned or strongly implied in the query.
            Return ONLY the JSON with no additional text.
            
            Example 1:
            Query: "How many SMS attempts did Jane Doe make on 2025-01-31?"
            Response: {"tactic":"SMS","person":"Jane Doe","date":"2025-01-31","resultType":"attempts"}
            
            Example 2:
            Query: "Show me phone calls by Team Tony"
            Response: {"tactic":"Phone","team":"Team Tony"}
            
            Example 3:
            Query: "How many Phone attempts did Jane Doe make on January 2, 2025?"
            Response: {"tactic":"Phone","person":"Jane Doe","date":"2025-01-02","resultType":"attempts"}
            
            Example 4:
            Query: "Show SMS on 2025-31-01"
            Response: {"tactic":"SMS","date":"2025-01-31"}
            
            Important: Be exact with person names and dates. Make sure to extract all parameters correctly and validate dates.
          `
        }
      });

      if (error) {
        console.error("Error from Supabase function:", error);
        
        if (error.message.includes("Failed to send a request to the Edge Function")) {
          throw new Error("Connection to AI service failed. Please try again later.");
        }
        
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
        
        // Extra validation for date field
        if (extractedParams.date) {
          // Check if the date is valid
          if (!isValidDate(extractedParams.date)) {
            console.error("Invalid date detected:", extractedParams.date);
            
            // Try to fix common date format issues
            if (/^\d{4}-\d{2}-\d{2}$/.test(extractedParams.date)) {
              const parts = extractedParams.date.split("-");
              const year = parseInt(parts[0]);
              const monthOrDay1 = parseInt(parts[1]);
              const monthOrDay2 = parseInt(parts[2]);
              
              // Check if month is out of range but day might be valid
              if (monthOrDay1 > 12 && monthOrDay2 <= 12) {
                // Swap month and day
                const correctedDate = `${year}-${parts[2]}-${parts[1]}`;
                if (isValidDate(correctedDate)) {
                  console.log("Corrected date format:", correctedDate);
                  extractedParams.date = correctedDate;
                }
              }
            }
          }
        }
        
        // Update the query state with the extracted parameters
        setQuery(extractedParams);
        
        // Return the extracted parameters for further use
        return extractedParams;
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

  /**
   * Validates whether a date string is a valid date in YYYY-MM-DD format
   */
  function isValidDate(dateString: string): boolean {
    // First check the format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return false;
    }
    
    // Parse the date parts and create a date object
    const parts = dateString.split("-");
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);
    
    // Check the ranges of month and day
    if (month < 1 || month > 12) {
      return false;
    }
    
    const lastDayOfMonth = new Date(year, month, 0).getDate();
    if (day < 1 || day > lastDayOfMonth) {
      return false;
    }
    
    return true;
  }

  return {
    isProcessingQuery,
    processWithLLM
  };
};
