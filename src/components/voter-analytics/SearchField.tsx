import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2, Sparkle } from 'lucide-react';
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

  const handleSubmit = () => {
    if (!inputValue.trim()) {
      toast({
        title: "Empty Query",
        description: "Please enter a question or query before submitting.",
        variant: "destructive",
      });
      return;
    }

    // Check for Dan Kelly special case
    const isDanKellyQuery = inputValue.toLowerCase().includes("dan kelly") && 
                           (inputValue.toLowerCase().includes("phone") || 
                            inputValue.toLowerCase().includes("call"));
    
    if (isDanKellyQuery) {
      console.log("Dan Kelly special case detected in search field:", inputValue);
    }
    
    // Update the search value
    onChange(inputValue);
    
    // Submit the search query
    onSubmit();
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
      
      <div className="mt-6 flex justify-center gap-2">
        <Button 
          onClick={handleSubmit}
          disabled={isLoading || isAiLoading}
          variant="default"
          className="w-full sm:w-auto"
        >
          {isLoading ? (
            <span className="flex items-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </span>
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" />
              Submit Query
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
