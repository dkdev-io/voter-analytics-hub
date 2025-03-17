
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Send, Loader2, Sparkle } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useErrorLogger } from '@/hooks/useErrorLogger';

interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  isLoading: boolean;
  onSubmit: () => void;
}

export const SearchField: React.FC<SearchFieldProps> = ({ 
  value, 
  onChange, 
  isLoading,
  onSubmit
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [useAiAssist, setUseAiAssist] = useState(false);
  const { toast } = useToast();
  const { logError } = useErrorLogger();

  const handleSearch = () => {
    onChange(inputValue);
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

  const handleSubmit = () => {
    if (!inputValue.trim()) {
      toast({
        title: "Empty Query",
        description: "Please enter a question or query before submitting.",
        variant: "destructive",
      });
      return;
    }
    
    handleSearch();
    onSubmit();
    
    toast({
      title: "Query Submitted",
      description: "Your search query has been submitted successfully.",
    });
  };

  const handleButtonClick = () => {
    if (useAiAssist) {
      handleAiAssist();
    } else {
      handleSubmit();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.metaKey) {
      handleButtonClick();
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative w-full">
        <Search className="absolute left-3 top-4 text-gray-400 h-4 w-4" />
        <Textarea
          placeholder="Type your question here..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyPress}
          className="pl-10 w-full min-h-[150px] resize-none" 
          disabled={isLoading || isAiLoading}
        />
        <div className="text-xs text-gray-500 mt-1 text-right">Press ⌘+Enter to submit</div>
      </div>
      
      <div className="mt-6 flex flex-col sm:flex-row justify-center items-center gap-4">
        <div className="flex items-center">
          <label className="inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer"
              checked={useAiAssist}
              onChange={() => setUseAiAssist(!useAiAssist)}
              disabled={isLoading || isAiLoading}
            />
            <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            <span className="ms-3 text-sm font-medium">Use AI Assistant</span>
          </label>
        </div>
        
        <Button 
          onClick={handleButtonClick}
          disabled={isLoading || isAiLoading}
          variant="default"
          className="w-full sm:w-auto"
        >
          {isLoading || isAiLoading ? (
            <span className="flex items-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isAiLoading ? "AI Processing..." : "Processing..."}
            </span>
          ) : (
            <>
              {useAiAssist ? (
                <>
                  <Sparkle className="mr-2 h-4 w-4" />
                  Get AI Insights
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Submit Query
                </>
              )}
            </>
          )}
        </Button>
      </div>

      {aiResponse && (
        <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-md">
          <h3 className="text-sm font-medium mb-2">AI Assistant:</h3>
          <div className="text-sm whitespace-pre-wrap">{aiResponse}</div>
        </div>
      )}
    </div>
  );
}
