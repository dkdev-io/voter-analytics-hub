
import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { type QueryParams } from '@/types/analytics';
import { useLLMProcessor } from './search/useLLMProcessor';
import { useAIAssistant } from './search/useAIAssistant';
import { AIAssistantResponse } from './search/AIAssistantResponse';
import { Loader2, Search } from 'lucide-react';

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
  const [currentQuery, setCurrentQuery] = useState<Partial<QueryParams>>({});
  const { toast } = useToast();
  
  const { isProcessingQuery, processWithLLM } = useLLMProcessor({ setQuery });
  const { 
    aiResponse, 
    isAiLoading,
    getAIAssistance 
  } = useAIAssistant();

  const handleSubmit = async () => {
    if (!inputValue.trim()) {
      toast({
        title: "Empty Query",
        description: "Please enter a question before submitting.",
        variant: "destructive",
      });
      return;
    }

    console.log("Processing query:", inputValue);
    
    // Update the parent component's search query value
    onChange(inputValue);
    
    if (setQuery) {
      try {
        // Process the query with LLM to extract structured parameters
        const extractedParams = await processWithLLM(inputValue);
        
        if (extractedParams) {
          // Make sure we have the full set of parameters (extractedParams + searchQuery)
          const fullParams = {
            ...extractedParams,
            searchQuery: inputValue
          };
          
          // Store the current query for future reference
          setCurrentQuery(fullParams);
          
          console.log("Sending query with full parameters:", fullParams);
          
          // Always use advanced model for better results
          await getAIAssistance(inputValue, fullParams);
          
          // Trigger the main search action if needed
          onSubmit();
        }
      } catch (error) {
        console.error("Error in query processing:", error);
        toast({
          title: "Query Processing Error",
          description: error instanceof Error ? error.message : "Failed to process your query",
          variant: "destructive",
        });
      }
    } else {
      // If no setQuery function is provided, just get AI assistance 
      await getAIAssistance(inputValue);
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
          placeholder="Ask a question about your data (e.g., 'How many SMS messages were sent yesterday?')"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyPress}
          className="pl-10 w-full min-h-[100px] resize-none" 
          disabled={isLoading || isAiLoading || isProcessingQuery}
        />
        <div className="text-xs text-gray-500 mt-1 text-right">Press ⌘+Enter to submit</div>
      </div>
      
      {/* Single Get Results button */}
      <div className="mt-8">
        <button 
          onClick={handleSubmit}
          disabled={isLoading || isAiLoading || isProcessingQuery}
          className="w-full bg-primary hover:bg-primary/90 text-white py-2 px-4 rounded-md flex items-center justify-center"
        >
          {isLoading || isProcessingQuery || isAiLoading ? (
            <span className="flex items-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isProcessingQuery ? "Processing..." : isAiLoading ? "Analyzing Data..." : "Searching..."}
            </span>
          ) : (
            <span className="flex items-center">
              <Search className="mr-2 h-4 w-4" />
              Get Results
            </span>
          )}
        </button>
      </div>

      <AIAssistantResponse 
        response={aiResponse}
        isLoading={isAiLoading}
      />
    </div>
  );
};
