import { supabase } from '@/integrations/supabase/client';
import { QueryParams, VoterMetrics } from '@/types/analytics';

interface ConversationContext {
  previousQueries: Array<{
    query: string;
    queryParams: Partial<QueryParams>;
    response: string;
    timestamp: Date;
  }>;
  sessionId: string;
}

interface AISearchOptions {
  includeContext?: boolean;
  contextWindow?: number;
  useAdvancedModel?: boolean;
  generateInsights?: boolean;
  format?: 'concise' | 'detailed' | 'structured';
}

interface AISearchResult {
  response: string;
  insights: string[];
  recommendations: string[];
  followUpQuestions: string[];
  confidence: number;
  dataUsed: boolean;
  visualizationSuggestions?: string[];
}

export class AISearchService {
  private static conversationHistory: Map<string, ConversationContext> = new Map();
  private static sessionId: string = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  /**
   * Main method to perform AI-powered search with context
   */
  static async searchWithAI(
    query: string,
    queryParams: Partial<QueryParams>,
    options: AISearchOptions = {}
  ): Promise<AISearchResult> {
    const {
      includeContext = true,
      contextWindow = 5,
      useAdvancedModel = true,
      generateInsights = true,
      format = 'detailed'
    } = options;

    try {
      // Build conversation context if requested
      const context = includeContext ? this.buildConversationContext(contextWindow) : '';
      
      // Create enhanced prompt with context and data requirements
      const enhancedPrompt = this.buildEnhancedPrompt(
        query,
        queryParams,
        context,
        generateInsights,
        format
      );

      // Call the OpenAI edge function with enhanced parameters
      const { data, error } = await supabase.functions.invoke('openai-chat', {
        body: {
          prompt: enhancedPrompt,
          includeData: true,
          queryParams: queryParams,
          useAdvancedModel: useAdvancedModel,
          conciseResponse: format === 'concise',
          generateInsights: generateInsights
        }
      });

      if (error) {
        throw new Error(`AI Search error: ${error.message}`);
      }

      if (!data || !data.answer) {
        throw new Error('No response from AI service');
      }

      // Parse the structured response
      const result = this.parseAIResponse(data.answer, format);

      // Store query in conversation history
      this.addToConversationHistory(query, queryParams, data.answer);

      // Generate follow-up questions based on the response
      result.followUpQuestions = this.generateFollowUpQuestions(query, queryParams, result);

      return result;

    } catch (error) {
      console.error('Error in AI search:', error);
      throw error;
    }
  }

  /**
   * Generate insights from data analysis
   */
  static async generateDataInsights(
    metrics: VoterMetrics,
    queryParams: Partial<QueryParams>
  ): Promise<{
    insights: string[];
    anomalies: string[];
    recommendations: string[];
    trends: string[];
  }> {
    const insights: string[] = [];
    const anomalies: string[] = [];
    const recommendations: string[] = [];
    const trends: string[] = [];

    try {
      // Analyze tactics distribution
      const tacticsTotal = Object.values(metrics.tactics).reduce((a, b) => a + b, 0);
      if (tacticsTotal > 0) {
        const tacticsBreakdown = Object.entries(metrics.tactics)
          .map(([tactic, count]) => ({ tactic, count, percentage: (count / tacticsTotal) * 100 }))
          .sort((a, b) => b.count - a.count);

        insights.push(`Most used tactic: ${tacticsBreakdown[0].tactic} (${tacticsBreakdown[0].percentage.toFixed(1)}%)`);

        // Check for unusual distributions
        if (tacticsBreakdown[0].percentage > 80) {
          anomalies.push(`Heavy reliance on ${tacticsBreakdown[0].tactic} - consider diversifying contact methods`);
          recommendations.push(`Try increasing ${tacticsBreakdown[1]?.tactic || 'other tactics'} to improve reach`);
        }
      }

      // Analyze contact effectiveness
      const contactsTotal = Object.values(metrics.contacts).reduce((a, b) => a + b, 0);
      if (contactsTotal > 0) {
        const supportRate = (metrics.contacts.support / contactsTotal) * 100;
        const undecidedRate = (metrics.contacts.undecided / contactsTotal) * 100;

        insights.push(`Support rate: ${supportRate.toFixed(1)}%`);
        
        if (undecidedRate > 40) {
          insights.push(`High undecided rate (${undecidedRate.toFixed(1)}%) - opportunity for follow-up`);
          recommendations.push('Focus on undecided contacts with targeted messaging');
        }

        if (supportRate < 20) {
          anomalies.push('Low support conversion rate detected');
          recommendations.push('Review and refine contact scripts and approach');
        }
      }

      // Analyze time trends if available
      if (metrics.byDate && metrics.byDate.length > 1) {
        const recentData = metrics.byDate.slice(-7); // Last 7 data points
        const avgContacts = recentData.reduce((sum, d) => sum + d.contacts, 0) / recentData.length;
        const latestContacts = recentData[recentData.length - 1].contacts;

        if (latestContacts > avgContacts * 1.2) {
          trends.push('Contact volume trending upward');
          insights.push('Recent increase in contact activity');
        } else if (latestContacts < avgContacts * 0.8) {
          trends.push('Contact volume trending downward');
          anomalies.push('Declining contact activity needs attention');
          recommendations.push('Investigate causes of reduced contact volume');
        }
      }

      // Team performance analysis
      if (metrics.teamAttempts) {
        const teamData = Object.entries(metrics.teamAttempts)
          .map(([team, attempts]) => ({ team, attempts }))
          .sort((a, b) => b.attempts - a.attempts);

        if (teamData.length > 1) {
          const topTeam = teamData[0];
          const bottomTeam = teamData[teamData.length - 1];
          
          if (topTeam.attempts > bottomTeam.attempts * 2) {
            insights.push(`${topTeam.team} significantly outperforming other teams`);
            recommendations.push(`Study ${topTeam.team}'s methods for best practices`);
          }
        }
      }

      return { insights, anomalies, recommendations, trends };

    } catch (error) {
      console.error('Error generating data insights:', error);
      return { insights: [], anomalies: [], recommendations: [], trends: [] };
    }
  }

  /**
   * Build enhanced prompt with context and requirements
   */
  private static buildEnhancedPrompt(
    query: string,
    queryParams: Partial<QueryParams>,
    context: string,
    generateInsights: boolean,
    format: string
  ): string {
    let prompt = `You are an AI assistant specialized in voter analytics and campaign data analysis. 
    
USER QUERY: "${query}"

CONTEXT: You have access to real voter contact data that includes:
- Contact attempts by tactic (SMS, Phone, Canvas)
- Contact results (supporters, opponents, undecided, not home, refusal, bad data)
- Team member performance data
- Date-based activity tracking

QUERY PARAMETERS: ${JSON.stringify(queryParams)}

CONVERSATION CONTEXT: ${context}

INSTRUCTIONS:
1. Use ONLY the actual data provided to answer the question
2. Be specific with numbers and facts from the data
3. Do not make assumptions or provide generic responses
4. Focus on actionable insights`;

    if (generateInsights) {
      prompt += `
5. Provide specific insights about patterns in the data
6. Identify any anomalies or opportunities
7. Suggest actionable recommendations based on the data`;
    }

    if (format === 'concise') {
      prompt += `
8. Provide a direct, one-sentence answer starting with the specific number/result
9. End with "This result has been added to the dashboard."`;
    } else if (format === 'structured') {
      prompt += `
8. Structure your response with clear sections:
   - ANSWER: Direct response to the question
   - INSIGHTS: Key patterns or findings
   - RECOMMENDATIONS: Specific actions to take
   - DATA NOTES: Any data limitations or context`;
    }

    return prompt;
  }

  /**
   * Build conversation context from history
   */
  private static buildConversationContext(contextWindow: number): string {
    const history = this.conversationHistory.get(this.sessionId);
    if (!history || history.previousQueries.length === 0) {
      return '';
    }

    const recentQueries = history.previousQueries
      .slice(-contextWindow)
      .map(q => `Q: ${q.query} -> A: ${q.response.substring(0, 100)}...`)
      .join('\n');

    return `Recent conversation:\n${recentQueries}\n\n`;
  }

  /**
   * Parse AI response and extract structured information
   */
  private static parseAIResponse(response: string, format: string): AISearchResult {
    const result: AISearchResult = {
      response,
      insights: [],
      recommendations: [],
      followUpQuestions: [],
      confidence: 0.8, // Default confidence
      dataUsed: true,
      visualizationSuggestions: []
    };

    try {
      // Extract insights if present
      const insightMatches = response.match(/INSIGHTS?:(.*?)(?:\n\n|RECOMMENDATIONS?:|$)/is);
      if (insightMatches) {
        result.insights = insightMatches[1]
          .split('\n')
          .map(line => line.replace(/^[-•*]\s*/, '').trim())
          .filter(line => line.length > 0);
      }

      // Extract recommendations if present
      const recommendationMatches = response.match(/RECOMMENDATIONS?:(.*?)(?:\n\n|$)/is);
      if (recommendationMatches) {
        result.recommendations = recommendationMatches[1]
          .split('\n')
          .map(line => line.replace(/^[-•*]\s*/, '').trim())
          .filter(line => line.length > 0);
      }

      // Extract numbers to determine if actual data was used
      const numberMatches = response.match(/\b\d+\b/g);
      result.dataUsed = (numberMatches && numberMatches.length > 0) || false;

      // Increase confidence if specific numbers are present
      if (numberMatches && numberMatches.length > 2) {
        result.confidence = Math.min(result.confidence + 0.2, 1.0);
      }

      // Generate visualization suggestions based on content
      result.visualizationSuggestions = this.generateVisualizationSuggestions(response);

    } catch (error) {
      console.warn('Error parsing AI response structure:', error);
    }

    return result;
  }

  /**
   * Generate follow-up questions based on the current query and response
   */
  private static generateFollowUpQuestions(
    query: string,
    queryParams: Partial<QueryParams>,
    result: AISearchResult
  ): string[] {
    const questions: string[] = [];

    // Generate questions based on missing parameters
    if (!queryParams.date) {
      questions.push('How does this compare to last week?');
      questions.push('What about the same period last month?');
    }

    if (!queryParams.tactic && result.response.includes('SMS')) {
      questions.push('How do phone calls compare?');
      questions.push('What about canvas results?');
    }

    if (!queryParams.person && result.response.includes('team')) {
      questions.push('Which team member performed best?');
      questions.push('How are individual performances distributed?');
    }

    // Generate trend-related questions
    if (result.insights.some(insight => insight.includes('increase') || insight.includes('decrease'))) {
      questions.push('What caused this trend?');
      questions.push('Is this trend continuing?');
    }

    // Generate comparative questions
    if (queryParams.tactic) {
      const otherTactics = ['SMS', 'Phone', 'Canvas'].filter(t => t !== queryParams.tactic);
      if (otherTactics.length > 0) {
        questions.push(`How does ${queryParams.tactic} compare to ${otherTactics[0]}?`);
      }
    }

    // Generate performance questions
    if (result.response.includes('supporter') || result.response.includes('contact')) {
      questions.push('What are the top-performing strategies?');
      questions.push('Which approaches need improvement?');
    }

    return questions.slice(0, 4); // Limit to 4 questions
  }

  /**
   * Generate visualization suggestions based on response content
   */
  private static generateVisualizationSuggestions(response: string): string[] {
    const suggestions: string[] = [];

    if (response.includes('compare') || response.includes('vs')) {
      suggestions.push('side-by-side-comparison');
      suggestions.push('comparative-bar-chart');
    }

    if (response.includes('trend') || response.includes('over time')) {
      suggestions.push('line-chart-timeline');
      suggestions.push('area-chart-cumulative');
    }

    if (response.includes('team') && response.includes('performance')) {
      suggestions.push('team-performance-grid');
      suggestions.push('leaderboard-ranking');
    }

    if (response.includes('percentage') || response.includes('%')) {
      suggestions.push('pie-chart-breakdown');
      suggestions.push('donut-chart-distribution');
    }

    return suggestions;
  }

  /**
   * Add query to conversation history
   */
  private static addToConversationHistory(
    query: string,
    queryParams: Partial<QueryParams>,
    response: string
  ): void {
    if (!this.conversationHistory.has(this.sessionId)) {
      this.conversationHistory.set(this.sessionId, {
        previousQueries: [],
        sessionId: this.sessionId
      });
    }

    const context = this.conversationHistory.get(this.sessionId)!;
    context.previousQueries.push({
      query,
      queryParams,
      response,
      timestamp: new Date()
    });

    // Keep only last 10 queries to prevent memory issues
    if (context.previousQueries.length > 10) {
      context.previousQueries = context.previousQueries.slice(-10);
    }
  }

  /**
   * Clear conversation history (for new sessions)
   */
  static clearConversationHistory(): void {
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.conversationHistory.clear();
  }

  /**
   * Get conversation history for debugging
   */
  static getConversationHistory(): ConversationContext | undefined {
    return this.conversationHistory.get(this.sessionId);
  }
}