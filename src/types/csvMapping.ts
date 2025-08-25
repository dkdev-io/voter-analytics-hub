/**
 * TypeScript interfaces for the flexible CSV mapping system
 */

export type FieldType = 'string' | 'number' | 'date' | 'category' | 'name' | 'email' | 'phone' | 'boolean';

export interface ColumnAnalysis {
  type: FieldType;
  confidence: number;
  sampleValues: string[];
  uniqueValues?: number;
  nullCount: number;
  dateFormats?: string[];
}

export interface FieldDefinition {
  key: string;
  label: string;
  type: FieldType;
  required: boolean;
  category?: string;
  description?: string;
  variations: string[];
}

export interface MappingProfile {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  mapping: Record<string, string>;
  fieldDefinitions: FieldDefinition[];
}

export interface ColumnMapping {
  csvColumn: string;
  dbField: string;
  confidence: number;
  isManual: boolean;
}

export interface ValidationError {
  row: number;
  column: string;
  value: string;
  error: string;
  severity: 'warning' | 'error';
}

export interface ProcessingResult {
  success: boolean;
  validRows: Record<string, any>[];
  invalidRows: Array<{
    row: Record<string, any>;
    errors: ValidationError[];
  }>;
  warnings: ValidationError[];
  stats: {
    totalRows: number;
    validRows: number;
    invalidRows: number;
    warningRows: number;
  };
}

export interface FlexibleMappingConfig {
  autoDetectTypes: boolean;
  allowDynamicFields: boolean;
  requireAllFields: boolean;
  saveProfile: boolean;
  profileName?: string;
}

export interface CSVPreviewData {
  headers: string[];
  rows: string[][];
  totalRows: number;
  columnAnalysis: Record<string, ColumnAnalysis>;
  suggestedMappings: ColumnMapping[];
}

// Enhanced field definitions with categories
export const CORE_FIELD_DEFINITIONS: FieldDefinition[] = [
  // Personal Information
  {
    key: 'first_name',
    label: 'First Name',
    type: 'name',
    required: true,
    category: 'personal',
    description: 'Contact first name',
    variations: [
      'first_name', 'firstname', 'first', 'fname', 'given_name', 
      'given name', 'forename', 'christian_name'
    ]
  },
  {
    key: 'last_name',
    label: 'Last Name',
    type: 'name',
    required: true,
    category: 'personal',
    description: 'Contact last name',
    variations: [
      'last_name', 'lastname', 'last', 'lname', 'surname', 
      'family_name', 'family name'
    ]
  },
  {
    key: 'email',
    label: 'Email',
    type: 'email',
    required: false,
    category: 'personal',
    description: 'Contact email address',
    variations: ['email', 'email_address', 'mail', 'e_mail']
  },
  {
    key: 'phone',
    label: 'Phone',
    type: 'phone',
    required: false,
    category: 'personal',
    description: 'Contact phone number',
    variations: ['phone', 'phone_number', 'telephone', 'mobile', 'cell']
  },

  // Contact Information
  {
    key: 'date',
    label: 'Date',
    type: 'date',
    required: false,
    category: 'contact',
    description: 'Contact date',
    variations: [
      'date', 'contact_date', 'day', 'timestamp', 'contact date', 
      'date_contacted', 'call_date'
    ]
  },
  {
    key: 'tactic',
    label: 'Tactic',
    type: 'category',
    required: false,
    category: 'contact',
    description: 'Contact method',
    variations: [
      'tactic', 'type', 'contact_type', 'method', 'channel', 'medium',
      'contact_method', 'approach'
    ]
  },
  {
    key: 'team',
    label: 'Team',
    type: 'category',
    required: false,
    category: 'organization',
    description: 'Team or group',
    variations: [
      'team', 'team_name', 'teamname', 'group', 'department', 
      'organization', 'org', 'unit', 'squad'
    ]
  },

  // Metrics
  {
    key: 'attempts',
    label: 'Attempts',
    type: 'number',
    required: false,
    category: 'metrics',
    description: 'Number of contact attempts',
    variations: [
      'attempts', 'attempt', 'tried', 'tries', 'total_attempts', 
      'total attempts', 'contact_attempts'
    ]
  },
  {
    key: 'contacts',
    label: 'Contacts',
    type: 'number',
    required: false,
    category: 'metrics',
    description: 'Successful contacts',
    variations: [
      'contacts', 'contact', 'reached', 'connected', 'success', 
      'successful', 'completed'
    ]
  },

  // Response Types
  {
    key: 'support',
    label: 'Support',
    type: 'number',
    required: false,
    category: 'response',
    description: 'Supporters',
    variations: [
      'support', 'supports', 'for', 'positive', 'yes', 'favorable', 
      'agree', 'supporter'
    ]
  },
  {
    key: 'oppose',
    label: 'Oppose',
    type: 'number',
    required: false,
    category: 'response',
    description: 'Opposition',
    variations: [
      'oppose', 'opposed', 'against', 'negative', 'disagree', 
      'unfavorable', 'opposition'
    ]
  },
  {
    key: 'undecided',
    label: 'Undecided',
    type: 'number',
    required: false,
    category: 'response',
    description: 'Undecided responses',
    variations: [
      'undecided', 'unsure', 'maybe', 'neutral', 'thinking', 
      'considering', 'unknown'
    ]
  },

  // Non-Response Categories
  {
    key: 'not_home',
    label: 'Not Home',
    type: 'number',
    required: false,
    category: 'non_response',
    description: 'Not home responses',
    variations: [
      'not_home', 'nothome', 'nh', 'not_at_home', 'away', 'absent', 
      'not available', 'no_answer', 'no answer'
    ]
  },
  {
    key: 'refusal',
    label: 'Refusal',
    type: 'number',
    required: false,
    category: 'non_response',
    description: 'Refused responses',
    variations: [
      'refusal', 'refused', 'decline', 'rejected', 'no', 'not interested', 
      'negative', 'ref', 'hung_up'
    ]
  },
  {
    key: 'bad_data',
    label: 'Bad Data',
    type: 'number',
    required: false,
    category: 'non_response',
    description: 'Bad data entries',
    variations: [
      'bad_data', 'baddata', 'bad', 'invalid', 'error', 'incorrect', 
      'wrong number', 'bd', 'disconnected'
    ]
  }
];

export const DEFAULT_MAPPING_CONFIG: FlexibleMappingConfig = {
  autoDetectTypes: true,
  allowDynamicFields: true,
  requireAllFields: false,
  saveProfile: false
};