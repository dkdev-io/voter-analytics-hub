import { QueryParams } from '@/types/analytics';

export interface QueryTemplate {
  id: string;
  category: string;
  name: string;
  description: string;
  template: string;
  examples: string[];
  parameters: Array<{
    key: keyof QueryParams;
    type: 'text' | 'select' | 'date' | 'number';
    options?: string[];
    required?: boolean;
  }>;
  tags: string[];
}

export interface QueryShortcut {
  shortcut: string;
  expansion: string;
  description: string;
}

export const QUERY_TEMPLATES: QueryTemplate[] = [
  // Contact Metrics Templates
  {
    id: 'contact-count-by-tactic',
    category: 'Contact Metrics',
    name: 'Contact Count by Tactic',
    description: 'Get the number of contacts made using a specific tactic',
    template: 'How many {tactic} {resultType} were made {timeframe}?',
    examples: [
      'How many SMS contacts were made yesterday?',
      'How many Phone attempts were made last week?',
      'How many Canvas supporters were contacted this month?'
    ],
    parameters: [
      { key: 'tactic', type: 'select', options: ['SMS', 'Phone', 'Canvas'], required: true },
      { key: 'resultType', type: 'select', options: ['contacts', 'attempts', 'supporters', 'undecided'], required: true },
      { key: 'date', type: 'date', required: false }
    ],
    tags: ['metrics', 'count', 'tactic']
  },
  
  {
    id: 'person-performance',
    category: 'Contact Metrics',
    name: 'Individual Performance',
    description: 'Check how many contacts a specific person made',
    template: 'How many {resultType} did {person} make {timeframe}?',
    examples: [
      'How many contacts did John Smith make yesterday?',
      'How many SMS attempts did Mary Johnson make last week?',
      'How many supporters did Tony Rodriguez contact this month?'
    ],
    parameters: [
      { key: 'person', type: 'text', required: true },
      { key: 'resultType', type: 'select', options: ['contacts', 'attempts', 'supporters'], required: true },
      { key: 'date', type: 'date', required: false },
      { key: 'tactic', type: 'select', options: ['SMS', 'Phone', 'Canvas'], required: false }
    ],
    tags: ['person', 'performance', 'individual']
  },

  {
    id: 'team-performance',
    category: 'Team Analytics',
    name: 'Team Performance',
    description: 'Analyze performance by team',
    template: 'How many {resultType} did {team} make {timeframe}?',
    examples: [
      'How many contacts did Team Tony make yesterday?',
      'How many Phone calls did Team Alpha make last week?',
      'How many supporters did the Canvas Team contact this month?'
    ],
    parameters: [
      { key: 'team', type: 'text', required: true },
      { key: 'resultType', type: 'select', options: ['contacts', 'attempts', 'supporters'], required: true },
      { key: 'date', type: 'date', required: false },
      { key: 'tactic', type: 'select', options: ['SMS', 'Phone', 'Canvas'], required: false }
    ],
    tags: ['team', 'performance', 'group']
  },

  // Comparison Templates
  {
    id: 'tactic-comparison',
    category: 'Comparisons',
    name: 'Tactic Effectiveness',
    description: 'Compare effectiveness of different contact tactics',
    template: 'Compare {tactic1} vs {tactic2} effectiveness {timeframe}',
    examples: [
      'Compare SMS vs Phone effectiveness yesterday',
      'Compare Phone vs Canvas success rates last week',
      'Compare all tactic effectiveness this month'
    ],
    parameters: [
      { key: 'tactic', type: 'select', options: ['SMS', 'Phone', 'Canvas'], required: true },
      { key: 'date', type: 'date', required: false }
    ],
    tags: ['comparison', 'effectiveness', 'tactic']
  },

  {
    id: 'team-comparison',
    category: 'Comparisons',
    name: 'Team vs Team',
    description: 'Compare performance between teams',
    template: 'Compare {team1} vs {team2} performance {timeframe}',
    examples: [
      'Compare Team Tony vs Team Alpha performance yesterday',
      'Compare all team performance last week',
      'Compare Phone Team vs SMS Team results'
    ],
    parameters: [
      { key: 'team', type: 'text', required: true },
      { key: 'date', type: 'date', required: false },
      { key: 'resultType', type: 'select', options: ['contacts', 'attempts', 'supporters'], required: false }
    ],
    tags: ['comparison', 'team', 'performance']
  },

  // Trend Analysis Templates
  {
    id: 'contact-trends',
    category: 'Trends',
    name: 'Contact Trends',
    description: 'Show how contacts are trending over time',
    template: 'Show {tactic} {resultType} trends over {timeframe}',
    examples: [
      'Show SMS contact trends over the last week',
      'Show Phone attempt trends over the last month',
      'Show all contact trends over time'
    ],
    parameters: [
      { key: 'tactic', type: 'select', options: ['SMS', 'Phone', 'Canvas', 'all'], required: false },
      { key: 'resultType', type: 'select', options: ['contacts', 'attempts', 'supporters'], required: true },
      { key: 'date', type: 'date', required: false }
    ],
    tags: ['trends', 'time-series', 'analysis']
  },

  {
    id: 'performance-trends',
    category: 'Trends',
    name: 'Performance Trends',
    description: 'Track performance changes over time',
    template: 'How has {person/team} performance changed {timeframe}?',
    examples: [
      'How has John Smith performance changed this week?',
      'How has Team Tony performance changed this month?',
      'How has overall team performance changed over time?'
    ],
    parameters: [
      { key: 'person', type: 'text', required: false },
      { key: 'team', type: 'text', required: false },
      { key: 'date', type: 'date', required: false }
    ],
    tags: ['trends', 'performance', 'change']
  },

  // Top Performer Templates
  {
    id: 'top-performers',
    category: 'Rankings',
    name: 'Top Performers',
    description: 'Find the highest performing individuals',
    template: 'Who are the top {number} performers {timeframe}?',
    examples: [
      'Who are the top 5 performers yesterday?',
      'Who are the top performers this week?',
      'Who made the most contacts last month?'
    ],
    parameters: [
      { key: 'date', type: 'date', required: false },
      { key: 'tactic', type: 'select', options: ['SMS', 'Phone', 'Canvas'], required: false }
    ],
    tags: ['rankings', 'top', 'performers']
  },

  {
    id: 'response-rates',
    category: 'Analytics',
    name: 'Response Rates',
    description: 'Analyze contact response and success rates',
    template: 'What is the {tactic} response rate {timeframe}?',
    examples: [
      'What is the SMS response rate yesterday?',
      'What is the overall response rate this week?',
      'Which tactic has the best response rate?'
    ],
    parameters: [
      { key: 'tactic', type: 'select', options: ['SMS', 'Phone', 'Canvas'], required: false },
      { key: 'date', type: 'date', required: false }
    ],
    tags: ['analytics', 'rates', 'effectiveness']
  },

  // Data Quality Templates
  {
    id: 'data-quality',
    category: 'Data Quality',
    name: 'Data Issues',
    description: 'Check for data quality problems',
    template: 'How many {issueType} contacts were there {timeframe}?',
    examples: [
      'How many bad data contacts were there yesterday?',
      'How many not home results were there last week?',
      'How many refusals did we get this month?'
    ],
    parameters: [
      { key: 'resultType', type: 'select', options: ['badData', 'notHome', 'refused'], required: true },
      { key: 'date', type: 'date', required: false },
      { key: 'tactic', type: 'select', options: ['SMS', 'Phone', 'Canvas'], required: false }
    ],
    tags: ['data-quality', 'issues', 'problems']
  }
];

export const QUERY_SHORTCUTS: QueryShortcut[] = [
  {
    shortcut: 'yesterday',
    expansion: 'yesterday',
    description: 'Filter results to yesterday only'
  },
  {
    shortcut: 'today',
    expansion: 'today',
    description: 'Filter results to today only'
  },
  {
    shortcut: 'last week',
    expansion: 'in the last 7 days',
    description: 'Filter results to the last week'
  },
  {
    shortcut: 'this week',
    expansion: 'this week',
    description: 'Filter results to current week'
  },
  {
    shortcut: 'this month',
    expansion: 'this month',
    description: 'Filter results to current month'
  },
  {
    shortcut: 'sms',
    expansion: 'SMS messages',
    description: 'Filter to SMS/text message contacts'
  },
  {
    shortcut: 'calls',
    expansion: 'Phone calls',
    description: 'Filter to phone call contacts'
  },
  {
    shortcut: 'canvas',
    expansion: 'Canvas contacts',
    description: 'Filter to door-to-door canvas contacts'
  },
  {
    shortcut: 'top',
    expansion: 'highest performing',
    description: 'Show best performers'
  },
  {
    shortcut: 'compare',
    expansion: 'show comparison between',
    description: 'Compare different metrics or groups'
  },
  {
    shortcut: 'trend',
    expansion: 'show trends over time for',
    description: 'Display time-based trends'
  },
  {
    shortcut: 'team',
    expansion: 'team members',
    description: 'Filter to specific teams'
  }
];

export const EXAMPLE_QUERIES_BY_CATEGORY = {
  'Getting Started': [
    'How many contacts were made yesterday?',
    'Show me SMS performance this week',
    'What are the total attempts by all teams?',
    'Who are the top performers?'
  ],
  'Contact Analysis': [
    'How many phone contacts did Team Tony make yesterday?',
    'Show me supporter contacts from last week',
    'What are John Smith\'s SMS attempts this month?',
    'How many Canvas contacts were successful?'
  ],
  'Performance Comparison': [
    'Compare SMS vs Phone effectiveness',
    'Team Alpha vs Team Beta performance last week',
    'John Smith vs Mary Johnson contact rates',
    'Which tactic has the best response rate?'
  ],
  'Trend Analysis': [
    'Show contact trends over the last month',
    'How has team performance changed this week?',
    'Display SMS success rate trends',
    'Track supporter growth over time'
  ],
  'Data Quality': [
    'How many bad data contacts were there?',
    'Show me all not home results yesterday',
    'What\'s our refusal rate by tactic?',
    'Which contacts need follow-up?'
  ]
};

/**
 * Utility functions for working with query templates
 */
export class QueryTemplateUtils {
  /**
   * Get templates by category
   */
  static getTemplatesByCategory(category: string): QueryTemplate[] {
    return QUERY_TEMPLATES.filter(template => template.category === category);
  }

  /**
   * Search templates by tag
   */
  static getTemplatesByTag(tag: string): QueryTemplate[] {
    return QUERY_TEMPLATES.filter(template => template.tags.includes(tag));
  }

  /**
   * Get all categories
   */
  static getCategories(): string[] {
    return [...new Set(QUERY_TEMPLATES.map(template => template.category))];
  }

  /**
   * Get all tags
   */
  static getTags(): string[] {
    const allTags = QUERY_TEMPLATES.flatMap(template => template.tags);
    return [...new Set(allTags)].sort();
  }

  /**
   * Fill template with parameters
   */
  static fillTemplate(template: QueryTemplate, parameters: Partial<QueryParams>): string {
    let filledTemplate = template.template;
    
    Object.entries(parameters).forEach(([key, value]) => {
      if (value) {
        const placeholder = `{${key}}`;
        filledTemplate = filledTemplate.replace(new RegExp(placeholder, 'g'), value.toString());
      }
    });

    // Handle timeframe placeholder
    if (parameters.date) {
      filledTemplate = filledTemplate.replace('{timeframe}', `on ${parameters.date}`);
    } else {
      filledTemplate = filledTemplate.replace(' {timeframe}', '');
      filledTemplate = filledTemplate.replace('{timeframe} ', '');
      filledTemplate = filledTemplate.replace('{timeframe}', '');
    }

    return filledTemplate;
  }

  /**
   * Apply shortcut expansions to a query
   */
  static expandShortcuts(query: string): string {
    let expandedQuery = query;
    
    QUERY_SHORTCUTS.forEach(shortcut => {
      const regex = new RegExp(`\\b${shortcut.shortcut}\\b`, 'gi');
      expandedQuery = expandedQuery.replace(regex, shortcut.expansion);
    });

    return expandedQuery;
  }

  /**
   * Get query suggestions based on partial input
   */
  static getQuerySuggestions(partialQuery: string, maxSuggestions: number = 5): string[] {
    const lowerQuery = partialQuery.toLowerCase();
    const suggestions: string[] = [];

    // Get suggestions from all example queries
    const allExamples = Object.values(EXAMPLE_QUERIES_BY_CATEGORY).flat();
    
    // Find exact matches first
    allExamples.forEach(example => {
      if (example.toLowerCase().includes(lowerQuery) && suggestions.length < maxSuggestions) {
        suggestions.push(example);
      }
    });

    // If we don't have enough suggestions, get template examples
    if (suggestions.length < maxSuggestions) {
      QUERY_TEMPLATES.forEach(template => {
        template.examples.forEach(example => {
          if (example.toLowerCase().includes(lowerQuery) && 
              !suggestions.includes(example) && 
              suggestions.length < maxSuggestions) {
            suggestions.push(example);
          }
        });
      });
    }

    return suggestions;
  }

  /**
   * Get recommended templates based on query parameters
   */
  static getRecommendedTemplates(queryParams: Partial<QueryParams>): QueryTemplate[] {
    const recommendations: QueryTemplate[] = [];

    // If user has specified a person, recommend person-related templates
    if (queryParams.person) {
      recommendations.push(...this.getTemplatesByTag('person'));
    }

    // If user has specified a team, recommend team-related templates
    if (queryParams.team) {
      recommendations.push(...this.getTemplatesByTag('team'));
    }

    // If user has specified a tactic, recommend tactic-related templates
    if (queryParams.tactic) {
      recommendations.push(...this.getTemplatesByTag('tactic'));
    }

    // Remove duplicates and limit results
    const uniqueRecommendations = recommendations.filter(
      (template, index, self) => self.findIndex(t => t.id === template.id) === index
    );

    return uniqueRecommendations.slice(0, 6);
  }
}