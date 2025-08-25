
import { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { type QueryParams } from '@/types/analytics';
import { useLLMProcessor } from './search/useLLMProcessor';
import { useAIAssistant } from './search/useAIAssistant';
import { AIAssistantResponse } from './search/AIAssistantResponse';
import { NLPQueryProcessor } from '@/services/nlpQueryProcessor';
import { QueryTemplateUtils, EXAMPLE_QUERIES_BY_CATEGORY } from '@/utils/queryTemplates';
import { Loader2, Search, Lightbulb, Sparkles, Mic, HelpCircle } from 'lucide-react';

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
  const [querySuggestions, setQuerySuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [nlpConfidence, setNlpConfidence] = useState<number>(0);
  const [interpretedQuery, setInterpretedQuery] = useState<string>('');
  const [voiceSupported] = useState(typeof window !== 'undefined' && 'webkitSpeechRecognition' in window);
  
  const { isProcessingQuery, processWithLLM } = useLLMProcessor({ setQuery });
  const { 
    aiResponse, 
    isAiLoading,
    isResponseTruncated,
    responseModel,
    insights,
    recommendations,
    followUpQuestions,
    confidence,
    visualizationSuggestions,
    getAIAssistance 
  } = useAIAssistant();

  // Update suggestions as user types
  useEffect(() => {
    if (inputValue.length > 2) {
      const suggestions = QueryTemplateUtils.getQuerySuggestions(inputValue, 5);
      setQuerySuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
      
      // Run NLP analysis for confidence scoring
      try {
        const nlpResult = NLPQueryProcessor.parseQuery(inputValue);
        setNlpConfidence(nlpResult.confidence);
        setInterpretedQuery(
          Object.entries(nlpResult.queryParams)
            .filter(([_, value]) => value)
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ')
        );
      } catch (error) {
        console.warn('NLP processing failed:', error);
        setNlpConfidence(0);
        setInterpretedQuery('');
      }
    } else {
      setShowSuggestions(false);
      setNlpConfidence(0);
      setInterpretedQuery('');
    }
  }, [inputValue]);

  const handleSubmit = async () => {
    if (!inputValue.trim()) {
      return;
    }

    console.log("Processing query:", inputValue);
    setShowSuggestions(false);
    
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
          
          // Apply the query parameters immediately to update charts
          setQuery(fullParams);
          
          console.log("Sending query with full parameters:", fullParams);
          
          // Request a concise, one-sentence answer format
          await getAIAssistance(inputValue, fullParams, true, true);
          
          // Trigger the main search action to update results and charts
          onSubmit();
        }
      } catch (error) {
        console.error("Error in query processing:", error);
        // No toast notification for errors
      }
    } else {
      // If no setQuery function is provided, just get AI assistance 
      await getAIAssistance(inputValue);
    }
  };

  const handleSuggestionSelect = (suggestion: string) => {
    setInputValue(suggestion);
    setShowSuggestions(false);
  };

  const startVoiceInput = () => {
    if (!voiceSupported) return;
    
    const SpeechRecognition = (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputValue(transcript);
    };
    
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
    };
    
    recognition.start();
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
        
        <Popover open={showSuggestions} onOpenChange={setShowSuggestions}>
          <PopoverTrigger asChild>
            <Textarea
              placeholder="Ask a question about your data (e.g., 'How many SMS messages were sent yesterday?')"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              className="pl-10 pr-20 w-full min-h-[100px] resize-none" 
              disabled={isLoading || isAiLoading || isProcessingQuery}
              onFocus={() => inputValue.length > 2 && setShowSuggestions(true)}
            />
          </PopoverTrigger>
          
          {/* Voice input and help buttons */}
          <div className="absolute right-3 top-3 flex gap-1">
            {voiceSupported && (
              <Button
                variant="ghost"
                size="sm"
                onClick={startVoiceInput}
                disabled={isLoading || isAiLoading || isProcessingQuery}
                className="h-6 w-6 p-0"
                title="Voice input"
              >
                <Mic className="h-3 w-3" />
              </Button>
            )}
            
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  title="Query examples"
                >
                  <HelpCircle className="h-3 w-3" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Example Queries</h4>
                  {Object.entries(EXAMPLE_QUERIES_BY_CATEGORY).map(([category, examples]) => (
                    <div key={category}>
                      <h5 className="text-xs font-medium text-muted-foreground mb-1">{category}</h5>
                      <div className="space-y-1">
                        {examples.slice(0, 2).map((example, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSuggestionSelect(example)}
                            className="text-xs text-left w-full p-1 hover:bg-muted rounded"
                          >
                            {example}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
          
          <PopoverContent className="w-full p-0" align="start">
            <Command>
              <CommandInput placeholder="Type to search suggestions..." />
              <CommandEmpty>No suggestions found.</CommandEmpty>
              <CommandGroup heading="Query Suggestions">
                {querySuggestions.map((suggestion, index) => (
                  <CommandItem
                    key={index}
                    onSelect={() => handleSuggestionSelect(suggestion)}
                    className="cursor-pointer"
                  >
                    <Search className="mr-2 h-4 w-4" />
                    {suggestion}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
        
        <div className="flex justify-between items-center mt-1">
          <div className="text-xs text-gray-500">Press ⌘+Enter to submit</div>
          <div className="flex items-center gap-2">
            {nlpConfidence > 0 && (
              <div className="flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-primary" />
                <Badge 
                  variant={nlpConfidence > 0.7 ? "default" : nlpConfidence > 0.4 ? "secondary" : "outline"}
                  className="text-xs h-5"
                >
                  {Math.round(nlpConfidence * 100)}% confident
                </Badge>
              </div>
            )}
          </div>
        </div>
        
        {interpretedQuery && nlpConfidence > 0.3 && (
          <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-1 mb-1">
              <Lightbulb className="h-3 w-3 text-blue-600" />
              <span className="text-xs font-medium text-blue-700">Query Interpretation:</span>
            </div>
            <p className="text-xs text-blue-600">{interpretedQuery}</p>
          </div>
        )}
      </div>
      
      {/* Get Results button */}
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
        isTruncated={isResponseTruncated}
        model={responseModel}
        insights={insights}
        recommendations={recommendations}
        followUpQuestions={followUpQuestions}
        confidence={confidence}
        visualizationSuggestions={visualizationSuggestions}
      />
    </div>
  );
};
