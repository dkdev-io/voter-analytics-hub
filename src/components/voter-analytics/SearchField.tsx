
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Search, Loader2, Zap } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { type QueryParams } from '@/types/analytics';
import { useLLMProcessor } from './search/useLLMProcessor';
import { useAIAssistant } from './search/useAIAssistant';
import { AIAssistantResponse } from './search/AIAssistantResponse';
import { Switch } from '@/components/ui/switch';

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
  const [useAdvancedModel, setUseAdvancedModel] = useState(false);
  const { toast } = useToast();
  
  const { isProcessingQuery, processWithLLM } = useLLMProcessor({ setQuery });
  const { 
    aiResponse, 
    isAiLoading, 
    isResponseTruncated,
    responseModel,
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
    console.log("Using advanced model:", useAdvancedModel);
    
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
          
          // Get AI insights with the FULL parameters and model preference
          await getAIAssistance(inputValue, fullParams, useAdvancedModel);
          
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
      await getAIAssistance(inputValue, undefined, useAdvancedModel);
    }
  };
  
  const handleAdvancedModelRetry = async () => {
    setUseAdvancedModel(true);
    await getAIAssistance(inputValue, currentQuery, true);
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
          placeholder="Ask a question about your data (e.g., 'How many SMS did Jane send yesterday?')"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyPress}
          className="pl-10 w-full min-h-[100px] resize-none" 
          disabled={isLoading || isAiLoading || isProcessingQuery}
        />
        <div className="text-xs text-gray-500 mt-1 text-right">Press ⌘+Enter to submit</div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Switch
            id="advanced-model"
            checked={useAdvancedModel}
            onCheckedChange={setUseAdvancedModel}
          />
          <label 
            htmlFor="advanced-model" 
            className="text-sm cursor-pointer flex items-center"
          >
            <Zap className="h-3 w-3 mr-1 text-amber-500" />
            Use Advanced Model
            <span className="text-xs text-gray-500 ml-1">(Slower but handles complex data)</span>
          </label>
        </div>
      </div>
      
      <div className="mt-4">
        <Button 
          onClick={handleSubmit}
          disabled={isLoading || isAiLoading || isProcessingQuery}
          variant="default"
          className="w-full"
          size="default"
        >
          {isLoading || isProcessingQuery || isAiLoading ? (
            <span className="flex items-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isProcessingQuery ? "Processing..." : isAiLoading ? "Analyzing Data..." : "Searching..."}
            </span>
          ) : (
            <span className="flex items-center">
              <Search className="mr-2 h-4 w-4" />
              Get Insights {useAdvancedModel && <Zap className="ml-1 h-3 w-3" />}
            </span>
          )}
        </Button>
      </div>

      <AIAssistantResponse 
        response={aiResponse} 
        isLoading={isAiLoading} 
        isTruncated={isResponseTruncated}
        model={responseModel}
        onUseAdvancedModel={!useAdvancedModel && isResponseTruncated ? handleAdvancedModelRetry : undefined}
      />
    </div>
  );
};
