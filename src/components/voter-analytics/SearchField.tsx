
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Send, Loader2 } from 'lucide-react';
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
  const { toast } = useToast();
  const { logError } = useErrorLogger();

  const handleSearch = () => {
    onChange(inputValue);
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

  const handleAiAssist = async () => {
    if (!inputValue.trim()) {
      toast({
        title: "Empty Query",
        description: "Please enter a question before asking AI for assistance.",
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
      
      <div className="mt-6 flex justify-center gap-4">
        <Button 
          onClick={handleAiAssist}
          disabled={isLoading || isAiLoading}
          variant="outline"
        >
          {isAiLoading ? (
            <span className="flex items-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              AI Processing...
            </span>
          ) : (
            <>
              <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4M12 8h.01" />
              </svg>
              Ask AI for Help
            </>
          )}
        </Button>
        
        <Button 
          onClick={handleSubmit}
          disabled={isLoading || isAiLoading}
          variant="default"
        >
          {isLoading ? (
            <span className="flex items-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </span>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Submit
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
