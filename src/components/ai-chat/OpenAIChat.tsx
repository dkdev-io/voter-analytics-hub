
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
  const [rawResponse, setRawResponse] = useState<any>(null);
  const [showRawResponse, setShowRawResponse] = useState(false);
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
    setRawResponse(null);

    try {
      console.log("Sending prompt to OpenAI:", prompt.trim());
      
      // Extract possible structured query parameters for better context
      const queryParams = extractBasicQueryParams(prompt.trim());
      console.log("Auto-extracted query parameters:", queryParams);
      
      // Use the updated API endpoint
      const { data, error } = await supabase.functions.invoke('openai-chat', {
        body: { 
          prompt: prompt.trim(),
          useAdvancedModel: true,  // Always use advanced model for better results
          includeData: true,       // Include relevant data for analysis
          queryParams,             // Add query params to help with context filtering
          debug: true              // Request debug information
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message);
      }

      if (data.error) {
        console.error('OpenAI API error:', data.error);
        throw new Error(data.error);
      }

      console.log("Full response received:", data);
      setRawResponse(data);
      setResponse(data.answer);
      
      toast({
        title: "Response received",
        description: "Successfully received response from AI",
      });
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

  const toggleRawResponse = () => {
    setShowRawResponse(!showRawResponse);
  };
  
  // Function to extract basic query parameters from a text prompt
  const extractBasicQueryParams = (text: string) => {
    const query = text.toLowerCase();
    const params: any = {};
    
    // Simple extraction logic for basic parameters
    if (query.includes('phone')) {
      params.tactic = 'Phone';
    } else if (query.includes('sms')) {
      params.tactic = 'SMS';
    } else if (query.includes('canvas')) {
      params.tactic = 'Canvas';
    }
    
    // Try to extract person names using regex
    const nameRegex = /\b([A-Za-z]+)\s+([A-Za-z]+)\b/g;
    const matches = [...query.matchAll(nameRegex)];
    
    if (matches.length > 0) {
      // Take the first full name match
      const [fullMatch, firstName, lastName] = matches[0];
      const formattedName = `${firstName.charAt(0).toUpperCase() + firstName.slice(1)} ${lastName.charAt(0).toUpperCase() + lastName.slice(1)}`;
      params.person = formattedName;
    }
    
    // Basic date extraction for YYYY-MM-DD format
    const dateMatch = query.match(/\d{4}-\d{2}-\d{2}/);
    if (dateMatch) {
      params.date = dateMatch[0];
    }
    
    return params;
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
            
            {rawResponse && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={toggleRawResponse} 
                className="mt-4"
              >
                {showRawResponse ? "Hide" : "Show"} Diagnostic Info
              </Button>
            )}
            
            {showRawResponse && rawResponse && (
              <div className="mt-4 p-3 bg-gray-100 rounded text-xs overflow-auto max-h-[300px]">
                <pre>{JSON.stringify(rawResponse, null, 2)}</pre>
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="text-sm text-gray-500">
        Powered by OpenAI
      </CardFooter>
    </Card>
  );
};
