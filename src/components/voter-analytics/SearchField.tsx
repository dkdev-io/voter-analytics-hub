import { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2, Sparkle } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useErrorLogger } from '@/hooks/useErrorLogger';
import { type QueryParams } from '@/types/analytics';

interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  isLoading: boolean;
  onSubmit: () => void;
  setQuery?: (query: Partial<QueryParams>) => void;
}

export const SearchField: React.FC<SearchFieldProps> = ({ 
  value, 
  onChange, 
  isLoading,
  onSubmit,
  setQuery
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
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

  const handleSubmit = async () => {
    if (!inputValue.trim()) {
      toast({
        title: "Empty Query",
        description: "Please enter a question or query before submitting.",
        variant: "destructive",
      });
      return;
    }

    console.log("Submitting natural language query:", inputValue);
    
    // Update the search value
    onChange(inputValue);
    
    // If we have a setQuery function, try to process with LLM first
    if (setQuery) {
      try {
        // Instead of updating local isLoading, we're setting isProcessingQuery
        setIsProcessingQuery(true);
        await processWithLLM(inputValue);
        // After processing, submit the query
        onSubmit();
      } catch (error) {
        toast({
          title: "Query Processing Error",
          description: error instanceof Error ? error.message : "Failed to process your query",
          variant: "destructive",
        });
      } finally {
        setIsProcessingQuery(false);
      }
    } else {
      // Otherwise just submit directly
      onSubmit();
    }
  };

  const handleAiAssist = async () => {
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
    
    // Update the search value but don't submit
    onChange(inputValue);

    try {
      const { data, error } = await supabase.functions.invoke('openai-chat', {
        body: { prompt: `Based on this voter analytics query: "${inputValue}", provide insights and suggestions for the user.` }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setAiResponse(data.answer);
      toast({
        title: "AI Analysis Complete",
        description: "The AI has analyzed your query and provided insights.",
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
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.metaKey) {
      handleSubmit();
    }
  };

  return (
    <div className="space-y-3">
      <div className="relative w-full">
        <Search className="absolute left-3 top-3 text-gray-400 h-4 w-4" />
        <Textarea
          placeholder="Try asking: 'How many SMS did Jane Doe make on 2025-01-03?'"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyPress}
          className="pl-10 w-full min-h-[100px] resize-none" 
          disabled={isLoading || isAiLoading || isProcessingQuery}
        />
        <div className="text-xs text-gray-500 mt-1 text-right">Press ⌘+Enter to submit</div>
      </div>
      
      <div className="mt-4 flex justify-center gap-2">
        <Button 
          onClick={handleSubmit}
          disabled={isLoading || isAiLoading || isProcessingQuery}
          variant="default"
          className="w-full"
          size="sm"
        >
          {isLoading || isProcessingQuery ? (
            <span className="flex items-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isProcessingQuery ? "Processing with AI..." : "Searching..."}
            </span>
          ) : (
            "Submit"
          )}
        </Button>
      </div>

      {aiResponse && (
        <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
          <h3 className="text-xs font-medium mb-2">AI Assistant:</h3>
          <div className="text-xs whitespace-pre-wrap">{aiResponse}</div>
        </div>
      )}
    </div>
  );
}
