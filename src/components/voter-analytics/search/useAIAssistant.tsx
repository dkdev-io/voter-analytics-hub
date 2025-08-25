
import { useState, useCallback } from 'react';
import { useErrorLogger } from '@/hooks/useErrorLogger';
import { supabase } from '@/integrations/supabase/client';
import { type QueryParams } from '@/types/analytics';
import { AISearchService } from '@/services/aiSearchService';
import { NLPQueryProcessor } from '@/services/nlpQueryProcessor';

interface AIAssistantState {
  response: string | null;
  insights: string[];
  recommendations: string[];
  followUpQuestions: string[];
  confidence: number;
  visualizationSuggestions: string[];
}

export const useAIAssistant = () => {
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isResponseTruncated, setIsResponseTruncated] = useState(false);
  const [responseModel, setResponseModel] = useState<string | null>(null);
  const [insights, setInsights] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([]);
  const [confidence, setConfidence] = useState<number>(0);
  const [visualizationSuggestions, setVisualizationSuggestions] = useState<string[]>([]);
  const { logError, logDataIssue } = useErrorLogger();

  const getAIAssistance = useCallback(async (
    inputValue: string, 
    queryParams?: Partial<QueryParams>, 
    useAdvancedModel: boolean = true,
    conciseResponse: boolean = false
  ) => {
    if (!inputValue.trim()) {
      return;
    }

    setIsAiLoading(true);
    setAiResponse(null);
    setIsResponseTruncated(false);
    setResponseModel(null);
    setInsights([]);
    setRecommendations([]);
    setFollowUpQuestions([]);
    setConfidence(0);
    setVisualizationSuggestions([]);

    try {
      console.log("Getting AI assistance for:", inputValue);
      console.log("With query parameters:", queryParams);
      console.log("Using advanced model:", useAdvancedModel);
      console.log("Using concise response format:", conciseResponse);
      
      // First, use NLP processor to enhance query understanding
      const nlpResult = NLPQueryProcessor.parseQuery(inputValue);
      console.log("NLP processing result:", nlpResult);
      
      // Merge NLP-extracted params with provided params
      const enhancedQueryParams = {
        ...nlpResult.queryParams,
        ...queryParams, // Provided params take precedence
        searchQuery: inputValue
      };
      
      console.log("Enhanced query parameters:", enhancedQueryParams);
      
      // Use the new AI Search Service
      const aiResult = await AISearchService.searchWithAI(
        inputValue,
        enhancedQueryParams,
        {
          includeContext: true,
          useAdvancedModel,
          generateInsights: true,
          format: conciseResponse ? 'concise' : 'detailed'
        }
      );
      
      // Update all state with the enriched response
      setAiResponse(aiResult.response);
      setInsights(aiResult.insights);
      setRecommendations(aiResult.recommendations);
      setFollowUpQuestions(aiResult.followUpQuestions);
      setConfidence(aiResult.confidence);
      setVisualizationSuggestions(aiResult.visualizationSuggestions || []);
      
      // Set model and truncation info
      setResponseModel(useAdvancedModel ? 'gpt-4o' : 'gpt-4o-mini');
      setIsResponseTruncated(false); // AISearchService handles this internally
      
      console.log("AI search result:", aiResult);
      
    } catch (error) {
      console.error('Error calling AI Search Service:', error);
      logError(error as Error, 'useAIAssistant.getAIAssistance');
      
      // Fallback to basic AI response if enhanced service fails
      try {
        const enhancedQueryParams = {
          tactic: queryParams?.tactic || null,
          person: queryParams?.person || null,
          date: queryParams?.date || null,
          resultType: queryParams?.resultType || null,
          team: queryParams?.team || null,
          searchQuery: queryParams?.searchQuery || inputValue,
          ...queryParams
        };
        
        const enhancedPrompt = conciseResponse 
          ? `${inputValue}\n\nIMPORTANT: Provide a direct, factual ONE SENTENCE answer based ONLY on the data. Start with the actual number or result. Then add "This result has been added to the dashboard." at the end.`
          : inputValue;
        
        const { data, error } = await supabase.functions.invoke('openai-chat', {
          body: { 
            prompt: enhancedPrompt,
            includeData: true, 
            queryParams: enhancedQueryParams,
            conciseResponse: true,
            useAdvancedModel: true
          },
        });

        if (error) throw new Error(`Edge function error: ${error.message}`);
        if (data.error) throw new Error(data.error);
        
        setAiResponse(data.answer);
        setResponseModel(data.model);
        
      } catch (fallbackError) {
        console.error('Fallback AI call also failed:', fallbackError);
        setAiResponse("I apologize, but I'm having trouble processing your request right now. Please try again later.");
      }
    } finally {
      setIsAiLoading(false);
    }
  }, [logError, logDataIssue]);

  return {
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
  };
};
