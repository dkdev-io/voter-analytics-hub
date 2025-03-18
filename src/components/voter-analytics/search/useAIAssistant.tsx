
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useErrorLogger } from '@/hooks/useErrorLogger';
import { supabase } from '@/integrations/supabase/client';

export const useAIAssistant = () => {
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const { toast } = useToast();
  const { logError } = useErrorLogger();

  const getAIAssistance = useCallback(async (inputValue: string) => {
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
      console.log("Getting AI assistance for:", inputValue);
      
      const { data, error } = await supabase.functions.invoke('openai-chat', {
        body: { prompt: `Based on this voter analytics query: "${inputValue}", provide insights and suggestions for the user.` }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      console.log("AI response received:", data.answer);
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
  }, [toast, logError]);

  return {
    aiResponse,
    isAiLoading,
    getAIAssistance
  };
};
