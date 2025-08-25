import { QueryParams } from '@/types/analytics';

// Entity extraction patterns
const DATE_PATTERNS = [
  /\b(yesterday|today|tomorrow)\b/i,
  /\blast (week|month|day|year)\b/i,
  /\bthis (week|month|day|year)\b/i,
  /\b(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})\b/, // MM/DD/YYYY or MM-DD-YYYY
  /\b(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})\b/, // YYYY/MM/DD or YYYY-MM-DD
  /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),?\s*(\d{4})\b/i,
  /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\.?\s+(\d{1,2}),?\s*(\d{4})\b/i
];

const TACTIC_PATTERNS = [
  { pattern: /\b(sms|text|message|messaging)\b/i, value: 'SMS' },
  { pattern: /\b(phone|call|calling|called|calls)\b/i, value: 'Phone' },
  { pattern: /\b(canvas|canvass|door|knocking|field)\b/i, value: 'Canvas' }
];

const PERSON_PATTERNS = [
  /\b([A-Z][a-z]+)\s+([A-Z][a-z]+)\b/g, // First Last name pattern
  /\bby\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b/i, // "by Name" pattern
  /\bdid\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b/i, // "did Name" pattern
];

const TEAM_PATTERNS = [
  /\b(team\s+[a-z]+)\b/i,
  /\b([a-z]+\s+team)\b/i
];

const RESULT_TYPE_PATTERNS = [
  { pattern: /\b(attempt|attempts|tried|trying)\b/i, value: 'attempts' },
  { pattern: /\b(contact|contacted|reached|successful)\b/i, value: 'contacts' },
  { pattern: /\b(support|supporter|supporters|supporting)\b/i, value: 'supporters' },
  { pattern: /\b(oppose|opposed|opposition|against)\b/i, value: 'oppose' },
  { pattern: /\b(undecided|unsure|maybe|thinking)\b/i, value: 'undecided' },
  { pattern: /\b(not\s+home|unavailable|missed)\b/i, value: 'notHome' },
  { pattern: /\b(refuse|refused|rejection|declined)\b/i, value: 'refused' },
  { pattern: /\b(bad\s+data|invalid|wrong\s+number)\b/i, value: 'badData' }
];

const COMPARISON_PATTERNS = [
  /\bcompare\s+([^,\s]+)(?:\s+(?:vs?\.?|versus|and|with)\s+([^,\s]+))?/i,
  /\b([^,\s]+)\s+(?:vs?\.?|versus)\s+([^,\s]+)/i,
  /\bdifference\s+between\s+([^,\s]+)\s+and\s+([^,\s]+)/i
];

const TREND_PATTERNS = [
  /\btrend\b/i,
  /\bover\s+time\b/i,
  /\bprogress\b/i,
  /\bchange\b/i,
  /\bgrowth\b/i
];

interface EntityExtractionResult {
  entities: {
    dates: string[];
    tactics: string[];
    people: string[];
    teams: string[];
    resultTypes: string[];
    comparisons: string[][];
    hasTrend: boolean;
  };
  confidence: number;
}

interface QueryInterpretation {
  queryParams: Partial<QueryParams>;
  queryType: 'simple' | 'comparison' | 'trend' | 'complex';
  confidence: number;
  suggestions: string[];
  examples: string[];
}

export class NLPQueryProcessor {
  /**
   * Main method to parse natural language queries
   */
  static parseQuery(query: string): QueryInterpretation {
    const normalizedQuery = query.trim().toLowerCase();
    
    // Extract entities
    const extraction = this.extractEntities(query);
    
    // Determine query type
    const queryType = this.determineQueryType(extraction);
    
    // Convert to structured query parameters
    const queryParams = this.convertToQueryParams(extraction);
    
    // Calculate confidence score
    const confidence = this.calculateConfidence(extraction, queryParams);
    
    // Generate suggestions and examples
    const suggestions = this.generateSuggestions(queryParams, queryType);
    const examples = this.generateExamples(queryType);
    
    return {
      queryParams,
      queryType,
      confidence,
      suggestions,
      examples
    };
  }

  /**
   * Extract entities from the query
   */
  private static extractEntities(query: string): EntityExtractionResult {
    const entities = {
      dates: this.extractDates(query),
      tactics: this.extractTactics(query),
      people: this.extractPeople(query),
      teams: this.extractTeams(query),
      resultTypes: this.extractResultTypes(query),
      comparisons: this.extractComparisons(query),
      hasTrend: this.detectTrend(query)
    };

    // Calculate extraction confidence based on number of entities found
    const totalPatterns = Object.keys(entities).length;
    const foundPatterns = Object.values(entities).filter(e => 
      Array.isArray(e) ? e.length > 0 : e === true
    ).length;
    
    const confidence = foundPatterns / totalPatterns;

    return { entities, confidence };
  }

  /**
   * Extract date-related entities
   */
  private static extractDates(query: string): string[] {
    const dates: string[] = [];
    const today = new Date();

    // Handle relative dates
    if (/\byesterday\b/i.test(query)) {
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      dates.push(yesterday.toISOString().split('T')[0]);
    }

    if (/\btoday\b/i.test(query)) {
      dates.push(today.toISOString().split('T')[0]);
    }

    if (/\blast\s+week\b/i.test(query)) {
      const lastWeek = new Date(today);
      lastWeek.setDate(today.getDate() - 7);
      dates.push(lastWeek.toISOString().split('T')[0]);
    }

    if (/\bthis\s+week\b/i.test(query)) {
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      dates.push(startOfWeek.toISOString().split('T')[0]);
    }

    // Handle absolute dates
    DATE_PATTERNS.forEach(pattern => {
      const matches = query.match(pattern);
      if (matches) {
        try {
          let dateStr = '';
          if (matches[0].includes('/') || matches[0].includes('-')) {
            // Handle MM/DD/YYYY or YYYY-MM-DD formats
            const parts = matches[0].split(/[\/\-]/);
            if (parts.length === 3) {
              if (parts[0].length === 4) {
                // YYYY-MM-DD
                dateStr = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
              } else {
                // MM/DD/YYYY
                dateStr = `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
              }
            }
          } else {
            // Handle month name formats
            const monthNames = ['january', 'february', 'march', 'april', 'may', 'june',
                               'july', 'august', 'september', 'october', 'november', 'december'];
            const monthAbbr = ['jan', 'feb', 'mar', 'apr', 'may', 'jun',
                              'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
            
            const monthName = matches[1]?.toLowerCase();
            const day = matches[2];
            const year = matches[3];
            
            let monthIndex = monthNames.indexOf(monthName);
            if (monthIndex === -1) {
              monthIndex = monthAbbr.indexOf(monthName);
            }
            
            if (monthIndex !== -1) {
              dateStr = `${year}-${(monthIndex + 1).toString().padStart(2, '0')}-${day.padStart(2, '0')}`;
            }
          }
          
          if (dateStr && this.isValidDate(dateStr)) {
            dates.push(dateStr);
          }
        } catch (e) {
          console.warn('Failed to parse date:', matches[0]);
        }
      }
    });

    return [...new Set(dates)]; // Remove duplicates
  }

  /**
   * Extract tactic-related entities
   */
  private static extractTactics(query: string): string[] {
    const tactics: string[] = [];
    
    TACTIC_PATTERNS.forEach(({ pattern, value }) => {
      if (pattern.test(query)) {
        tactics.push(value);
      }
    });

    return [...new Set(tactics)];
  }

  /**
   * Extract people names
   */
  private static extractPeople(query: string): string[] {
    const people: string[] = [];
    
    PERSON_PATTERNS.forEach(pattern => {
      const matches = query.matchAll(pattern);
      for (const match of matches) {
        if (match[1]) {
          // Handle "by Name" or "did Name" patterns
          const name = match[1].trim();
          if (name.length > 2) { // Avoid single letters
            people.push(this.capitalizeName(name));
          }
        } else if (match[0]) {
          // Handle direct name matches
          const name = match[0].trim();
          if (name.length > 2 && !this.isCommonWord(name)) {
            people.push(this.capitalizeName(name));
          }
        }
      }
    });

    return [...new Set(people)];
  }

  /**
   * Extract team references
   */
  private static extractTeams(query: string): string[] {
    const teams: string[] = [];
    
    TEAM_PATTERNS.forEach(pattern => {
      const matches = query.match(pattern);
      if (matches) {
        teams.push(this.capitalizeTeam(matches[1]));
      }
    });

    return [...new Set(teams)];
  }

  /**
   * Extract result type references
   */
  private static extractResultTypes(query: string): string[] {
    const resultTypes: string[] = [];
    
    RESULT_TYPE_PATTERNS.forEach(({ pattern, value }) => {
      if (pattern.test(query)) {
        resultTypes.push(value);
      }
    });

    return [...new Set(resultTypes)];
  }

  /**
   * Extract comparison patterns
   */
  private static extractComparisons(query: string): string[][] {
    const comparisons: string[][] = [];
    
    COMPARISON_PATTERNS.forEach(pattern => {
      const matches = query.match(pattern);
      if (matches && matches.length >= 3) {
        const item1 = matches[1]?.trim();
        const item2 = matches[2]?.trim();
        if (item1 && item2) {
          comparisons.push([item1, item2]);
        }
      }
    });

    return comparisons;
  }

  /**
   * Detect if query is asking for trends
   */
  private static detectTrend(query: string): boolean {
    return TREND_PATTERNS.some(pattern => pattern.test(query));
  }

  /**
   * Determine the type of query
   */
  private static determineQueryType(extraction: EntityExtractionResult): 'simple' | 'comparison' | 'trend' | 'complex' {
    const { entities } = extraction;
    
    if (entities.comparisons.length > 0) {
      return 'comparison';
    }
    
    if (entities.hasTrend) {
      return 'trend';
    }
    
    const totalEntities = entities.dates.length + entities.tactics.length + 
                         entities.people.length + entities.teams.length + 
                         entities.resultTypes.length;
    
    if (totalEntities > 3) {
      return 'complex';
    }
    
    return 'simple';
  }

  /**
   * Convert extracted entities to QueryParams
   */
  private static convertToQueryParams(extraction: EntityExtractionResult): Partial<QueryParams> {
    const { entities } = extraction;
    const params: Partial<QueryParams> = {};

    // Set date (use first date found)
    if (entities.dates.length > 0) {
      params.date = entities.dates[0];
    }

    // Set tactic (use first tactic found)
    if (entities.tactics.length > 0) {
      params.tactic = entities.tactics[0];
    }

    // Set person (use first person found)
    if (entities.people.length > 0) {
      params.person = entities.people[0];
    }

    // Set team (use first team found)
    if (entities.teams.length > 0) {
      params.team = entities.teams[0];
    }

    // Set result type (use first result type found)
    if (entities.resultTypes.length > 0) {
      params.resultType = entities.resultTypes[0];
    }

    return params;
  }

  /**
   * Calculate confidence score for the interpretation
   */
  private static calculateConfidence(
    extraction: EntityExtractionResult, 
    queryParams: Partial<QueryParams>
  ): number {
    let confidence = extraction.confidence;
    
    // Boost confidence for specific parameter matches
    const paramCount = Object.keys(queryParams).length;
    if (paramCount > 0) {
      confidence += 0.2 * paramCount;
    }
    
    // Reduce confidence for very short queries
    if (Object.keys(queryParams).length < 2) {
      confidence *= 0.8;
    }
    
    return Math.min(confidence, 1.0);
  }

  /**
   * Generate query suggestions based on extracted parameters
   */
  private static generateSuggestions(
    queryParams: Partial<QueryParams>, 
    queryType: string
  ): string[] {
    const suggestions: string[] = [];
    
    if (!queryParams.date) {
      suggestions.push("Add a time period (e.g., 'yesterday', 'last week', 'January 15, 2024')");
    }
    
    if (!queryParams.tactic) {
      suggestions.push("Specify contact method (SMS, Phone, or Canvas)");
    }
    
    if (!queryParams.person && !queryParams.team) {
      suggestions.push("Add a person or team name for more specific results");
    }
    
    if (queryType === 'simple' && queryParams.tactic) {
      suggestions.push(`Try comparing ${queryParams.tactic} with other tactics`);
    }
    
    return suggestions;
  }

  /**
   * Generate example queries based on query type
   */
  private static generateExamples(queryType: string): string[] {
    const examples = {
      simple: [
        "How many phone calls were made yesterday?",
        "Show me SMS contacts by Team Tony",
        "What are John Smith's supporter contacts?"
      ],
      comparison: [
        "Compare SMS vs Phone effectiveness",
        "Show Team A vs Team B performance",
        "Phone calls vs Canvas contacts last week"
      ],
      trend: [
        "Show contact trends over time",
        "How has SMS performance changed this month?",
        "Display weekly progress for all teams"
      ],
      complex: [
        "How many Phone supporters did Team Tony contact last week?",
        "Compare John Smith's SMS vs Canvas effectiveness yesterday",
        "Show undecided contacts by tactic and team this month"
      ]
    };
    
    return examples[queryType as keyof typeof examples] || examples.simple;
  }

  /**
   * Utility functions
   */
  private static isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  }

  private static capitalizeName(name: string): string {
    return name.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  private static capitalizeTeam(team: string): string {
    return team.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  private static isCommonWord(word: string): boolean {
    const commonWords = ['the', 'and', 'or', 'but', 'for', 'with', 'by', 'from', 'to', 'in', 'on', 'at'];
    return commonWords.includes(word.toLowerCase());
  }

  /**
   * Get query templates for common patterns
   */
  static getQueryTemplates(): Record<string, string[]> {
    return {
      'Contact Metrics': [
        'How many {tactic} {resultType} were made {timeframe}?',
        'Show me {tactic} performance for {person}',
        'What are the total {resultType} by {team}?'
      ],
      'Comparisons': [
        'Compare {tactic1} vs {tactic2} effectiveness',
        'Show {team1} vs {team2} performance',
        '{person1} vs {person2} contact rates'
      ],
      'Trends': [
        'Show {tactic} trends over time',
        'How has {team} performance changed?',
        'Display weekly progress for {resultType}'
      ],
      'Team Performance': [
        'Who are the top performers?',
        'Which team has the best response rate?',
        'Show performance by team member'
      ]
    };
  }
}