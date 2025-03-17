
import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useErrorLogger } from '@/hooks/useErrorLogger';

export const OpenAIChat = () => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { logError } = useErrorLogger();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) {
      toast({
        title: "Empty prompt",
        description: "Please enter a question or prompt",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setResponse(null);

    try {
      const { data, error } = await supabase.functions.invoke('openai-chat', {
        body: { prompt: prompt.trim() }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setResponse(data.answer);
    } catch (error) {
      console.error('Error calling OpenAI:', error);
      logError(error as Error, 'OpenAIChat.handleSubmit');
      
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get response from OpenAI",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Chat with OpenAI</CardTitle>
        <CardDescription>Ask a question or provide a prompt to get a response from OpenAI</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="Type your question or prompt here..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[120px]"
            disabled={isLoading}
          />
          
          <Button 
            type="submit" 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send
              </>
            )}
          </Button>
        </form>

        {response && (
          <div className="mt-6 p-4 bg-gray-50 rounded-md">
            <h3 className="font-medium mb-2">Response:</h3>
            <div className="whitespace-pre-wrap">{response}</div>
          </div>
        )}
      </CardContent>
      <CardFooter className="text-sm text-gray-500">
        Powered by OpenAI
      </CardFooter>
    </Card>
  );
};
