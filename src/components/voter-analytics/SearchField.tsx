import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Search, Loader2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { type QueryParams } from '@/types/analytics';
import { useLLMProcessor } from './search/useLLMProcessor';
import { useAIAssistant } from './search/useAIAssistant';
import { AIAssistantResponse } from './search/AIAssistantResponse';

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
  const { toast } = useToast();
  
  const { isProcessingQuery, processWithLLM } = useLLMProcessor({ setQuery });
  const { aiResponse, isAiLoading, getAIAssistance } = useAIAssistant();

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
    
    onChange(inputValue);
    
    if (setQuery) {
      try {
        await processWithLLM(inputValue);
        onSubmit();
      } catch (error) {
        toast({
          title: "Query Processing Error",
          description: error instanceof Error ? error.message : "Failed to process your query",
          variant: "destructive",
        });
      }
    } else {
      onSubmit();
    }
  };

  const handleAiAssist = async () => {
    onChange(inputValue);
    await getAIAssistance(inputValue);
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

      <AIAssistantResponse response={aiResponse} />
    </div>
  );
}
