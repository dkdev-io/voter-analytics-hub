/**
 * Flexible CSV Mapping System
 * Auto-detects column types and provides dynamic field mapping
 */

import { 
  ColumnAnalysis, 
  FieldDefinition, 
  ColumnMapping, 
  CSVPreviewData, 
  MappingProfile,
  FieldType,
  CORE_FIELD_DEFINITIONS 
} from '@/types/csvMapping';

/**
 * Analyzes a column's content to determine its type
 */
export function analyzeColumn(values: string[], header: string): ColumnAnalysis {
  const nonEmptyValues = values.filter(v => v && v.trim() !== '');
  const uniqueValues = new Set(nonEmptyValues);
  const nullCount = values.length - nonEmptyValues.length;
  
  if (nonEmptyValues.length === 0) {
    return {
      type: 'string',
      confidence: 0,
      sampleValues: [],
      uniqueValues: 0,
      nullCount
    };
  }

  // Sample values for preview
  const sampleValues = Array.from(uniqueValues).slice(0, 5);
  
  // Type detection
  const analysis = detectFieldType(nonEmptyValues, header.toLowerCase());
  
  return {
    ...analysis,
    sampleValues,
    uniqueValues: uniqueValues.size,
    nullCount
  };
}

/**
 * Detects the field type based on content and header name
 */
function detectFieldType(values: string[], headerLower: string): { type: FieldType; confidence: number; dateFormats?: string[] } {
  const sampleSize = Math.min(values.length, 100);
  const sample = values.slice(0, sampleSize);
  
  // Name detection
  if (isNameField(sample, headerLower)) {
    return { type: 'name', confidence: 0.9 };
  }
  
  // Email detection
  if (isEmailField(sample, headerLower)) {
    return { type: 'email', confidence: 0.95 };
  }
  
  // Phone detection
  if (isPhoneField(sample, headerLower)) {
    return { type: 'phone', confidence: 0.9 };
  }
  
  // Date detection
  const dateResult = isDateField(sample, headerLower);
  if (dateResult.isDate) {
    return { type: 'date', confidence: dateResult.confidence, dateFormats: dateResult.formats };
  }
  
  // Number detection
  if (isNumberField(sample, headerLower)) {
    return { type: 'number', confidence: 0.9 };
  }
  
  // Boolean detection
  if (isBooleanField(sample, headerLower)) {
    return { type: 'boolean', confidence: 0.8 };
  }
  
  // Category detection (limited unique values)
  if (isCategoryField(sample, values.length)) {
    return { type: 'category', confidence: 0.7 };
  }
  
  // Default to string
  return { type: 'string', confidence: 0.5 };
}

/**
 * Check if field contains name data
 */
function isNameField(sample: string[], header: string): boolean {
  const namePatterns = ['name', 'first', 'last', 'fname', 'lname', 'given', 'surname', 'family'];
  if (namePatterns.some(pattern => header.includes(pattern))) {
    return true;
  }
  
  // Check if values look like names
  const nameRegex = /^[a-zA-Z\s\-'\.]{1,50}$/;
  const validNames = sample.filter(v => nameRegex.test(v.trim()));
  return validNames.length / sample.length > 0.8;
}

/**
 * Check if field contains email data
 */
function isEmailField(sample: string[], header: string): boolean {
  if (header.includes('email') || header.includes('mail')) {
    return true;
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const validEmails = sample.filter(v => emailRegex.test(v.trim()));
  return validEmails.length / sample.length > 0.7;
}

/**
 * Check if field contains phone data
 */
function isPhoneField(sample: string[], header: string): boolean {
  const phonePatterns = ['phone', 'tel', 'mobile', 'cell'];
  if (phonePatterns.some(pattern => header.includes(pattern))) {
    return true;
  }
  
  const phoneRegex = /^[\+\-\(\)\s\d]{7,15}$/;
  const validPhones = sample.filter(v => phoneRegex.test(v.trim()));
  return validPhones.length / sample.length > 0.7;
}

/**
 * Check if field contains date data
 */
function isDateField(sample: string[], header: string): { isDate: boolean; confidence: number; formats: string[] } {
  const datePatterns = ['date', 'day', 'time', 'when', 'created', 'updated'];
  let confidence = 0.5;
  
  if (datePatterns.some(pattern => header.includes(pattern))) {
    confidence = 0.8;
  }
  
  const dateFormats: string[] = [];
  let validDates = 0;
  
  for (const value of sample) {
    const trimmed = value.trim();
    if (tryParseDate(trimmed)) {
      validDates++;
      const format = inferDateFormat(trimmed);
      if (format && !dateFormats.includes(format)) {
        dateFormats.push(format);
      }
    }
  }
  
  const dateRatio = validDates / sample.length;
  if (dateRatio > 0.6) {
    return { isDate: true, confidence: Math.min(confidence + dateRatio * 0.4, 0.95), formats: dateFormats };
  }
  
  return { isDate: false, confidence: 0, formats: [] };
}

/**
 * Try to parse a date string
 */
function tryParseDate(value: string): boolean {
  if (!value || value.length < 4) return false;
  
  const date = new Date(value);
  if (!isNaN(date.getTime())) {
    return true;
  }
  
  // Try common formats
  const formats = [
    /^\d{1,2}\/\d{1,2}\/\d{2,4}$/, // MM/DD/YYYY or M/D/YY
    /^\d{1,2}-\d{1,2}-\d{2,4}$/, // MM-DD-YYYY
    /^\d{4}-\d{1,2}-\d{1,2}$/, // YYYY-MM-DD
    /^\d{1,2}\/\d{1,2}\/\d{2}$/, // MM/DD/YY
  ];
  
  return formats.some(format => format.test(value));
}

/**
 * Infer date format from a string
 */
function inferDateFormat(value: string): string | null {
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(value)) return 'MM/DD/YYYY';
  if (/^\d{1,2}\/\d{1,2}\/\d{2}$/.test(value)) return 'MM/DD/YY';
  if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(value)) return 'YYYY-MM-DD';
  if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(value)) return 'MM-DD-YYYY';
  return null;
}

/**
 * Check if field contains numeric data
 */
function isNumberField(sample: string[], header: string): boolean {
  const numberPatterns = ['count', 'total', 'num', 'amount', 'attempt', 'contact'];
  if (numberPatterns.some(pattern => header.includes(pattern))) {
    return true;
  }
  
  const validNumbers = sample.filter(v => {
    const num = parseFloat(v.trim());
    return !isNaN(num) && isFinite(num);
  });
  
  return validNumbers.length / sample.length > 0.8;
}

/**
 * Check if field contains boolean data
 */
function isBooleanField(sample: string[], header: string): boolean {
  const booleanValues = new Set(['true', 'false', 'yes', 'no', '1', '0', 'y', 'n']);
  const lowerSample = sample.map(v => v.toLowerCase().trim());
  const validBooleans = lowerSample.filter(v => booleanValues.has(v));
  
  return validBooleans.length / sample.length > 0.8;
}

/**
 * Check if field should be treated as a category
 */
function isCategoryField(sample: string[], totalValues: number): boolean {
  const uniqueValues = new Set(sample);
  const uniqueRatio = uniqueValues.size / totalValues;
  
  // If less than 20% unique values and reasonable number of categories
  return uniqueRatio < 0.2 && uniqueValues.size > 1 && uniqueValues.size < 50;
}

/**
 * Generate suggested mappings for CSV columns
 */
export function generateSuggestedMappings(
  headers: string[], 
  columnAnalysis: Record<string, ColumnAnalysis>,
  fieldDefinitions: FieldDefinition[] = CORE_FIELD_DEFINITIONS
): ColumnMapping[] {
  const mappings: ColumnMapping[] = [];
  
  for (const header of headers) {
    const analysis = columnAnalysis[header];
    if (!analysis) continue;
    
    const bestMatch = findBestFieldMatch(header, analysis, fieldDefinitions);
    if (bestMatch) {
      mappings.push({
        csvColumn: header,
        dbField: bestMatch.field.key,
        confidence: bestMatch.confidence,
        isManual: false
      });
    }
  }
  
  return mappings;
}

/**
 * Find the best matching field definition for a column
 */
function findBestFieldMatch(
  header: string, 
  analysis: ColumnAnalysis, 
  fieldDefinitions: FieldDefinition[]
): { field: FieldDefinition; confidence: number } | null {
  const headerLower = header.toLowerCase().trim();
  let bestMatch: { field: FieldDefinition; confidence: number } | null = null;
  
  for (const field of fieldDefinitions) {
    let confidence = 0;
    
    // Exact match with variations
    if (field.variations.includes(headerLower)) {
      confidence = 0.9;
    } else if (field.variations.some(variation => headerLower.includes(variation))) {
      confidence = 0.7;
    } else if (field.variations.some(variation => variation.includes(headerLower))) {
      confidence = 0.5;
    }
    
    // Type compatibility bonus
    if (analysis.type === field.type) {
      confidence += 0.1;
    }
    
    // Content analysis bonus
    if (analysis.confidence > 0.8) {
      confidence += 0.1;
    }
    
    if (confidence > 0 && (!bestMatch || confidence > bestMatch.confidence)) {
      bestMatch = { field, confidence };
    }
  }
  
  return bestMatch;
}

/**
 * Analyze CSV data and generate preview
 */
export function analyzeCSVData(
  headers: string[], 
  rows: string[][],
  fieldDefinitions: FieldDefinition[] = CORE_FIELD_DEFINITIONS
): CSVPreviewData {
  const columnAnalysis: Record<string, ColumnAnalysis> = {};
  
  // Analyze each column
  headers.forEach((header, index) => {
    const columnValues = rows.map(row => row[index] || '');
    columnAnalysis[header] = analyzeColumn(columnValues, header);
  });
  
  // Generate suggested mappings
  const suggestedMappings = generateSuggestedMappings(headers, columnAnalysis, fieldDefinitions);
  
  return {
    headers,
    rows: rows.slice(0, 10), // First 10 rows for preview
    totalRows: rows.length,
    columnAnalysis,
    suggestedMappings
  };
}

/**
 * Validate and normalize date values
 */
export function normalizeDate(value: string, detectedFormats: string[] = []): string | null {
  if (!value || value.trim() === '') return null;
  
  const trimmed = value.trim();
  
  // Try standard Date parsing first
  const standardDate = new Date(trimmed);
  if (!isNaN(standardDate.getTime())) {
    return standardDate.toISOString().split('T')[0];
  }
  
  // Try specific format parsing
  for (const format of detectedFormats) {
    const normalized = parseSpecificDateFormat(trimmed, format);
    if (normalized) return normalized;
  }
  
  return null;
}

/**
 * Parse date with specific format
 */
function parseSpecificDateFormat(value: string, format: string): string | null {
  try {
    let date: Date | null = null;
    
    if (format === 'MM/DD/YYYY' || format === 'MM/DD/YY') {
      const parts = value.split('/');
      if (parts.length === 3) {
        const month = parseInt(parts[0]) - 1; // Month is 0-indexed
        const day = parseInt(parts[1]);
        let year = parseInt(parts[2]);
        if (year < 100) year += 2000; // Convert YY to YYYY
        date = new Date(year, month, day);
      }
    } else if (format === 'MM-DD-YYYY') {
      const parts = value.split('-');
      if (parts.length === 3) {
        const month = parseInt(parts[0]) - 1;
        const day = parseInt(parts[1]);
        const year = parseInt(parts[2]);
        date = new Date(year, month, day);
      }
    } else if (format === 'YYYY-MM-DD') {
      const parts = value.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1;
        const day = parseInt(parts[2]);
        date = new Date(year, month, day);
      }
    }
    
    if (date && !isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
  } catch (error) {
    console.warn('Error parsing date:', value, error);
  }
  
  return null;
}

/**
 * Save a mapping profile to localStorage
 */
export function saveMappingProfile(profile: Omit<MappingProfile, 'id' | 'createdAt' | 'updatedAt'>): string {
  const id = Date.now().toString();
  const fullProfile: MappingProfile = {
    ...profile,
    id,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  const existingProfiles = getMappingProfiles();
  const updatedProfiles = [...existingProfiles, fullProfile];
  
  localStorage.setItem('csvMappingProfiles', JSON.stringify(updatedProfiles));
  return id;
}

/**
 * Get all saved mapping profiles
 */
export function getMappingProfiles(): MappingProfile[] {
  try {
    const stored = localStorage.getItem('csvMappingProfiles');
    if (!stored) return [];
    
    const profiles = JSON.parse(stored);
    return profiles.map((p: any) => ({
      ...p,
      createdAt: new Date(p.createdAt),
      updatedAt: new Date(p.updatedAt)
    }));
  } catch (error) {
    console.warn('Error loading mapping profiles:', error);
    return [];
  }
}

/**
 * Delete a mapping profile
 */
export function deleteMappingProfile(id: string): void {
  const profiles = getMappingProfiles();
  const filtered = profiles.filter(p => p.id !== id);
  localStorage.setItem('csvMappingProfiles', JSON.stringify(filtered));
}

/**
 * Create dynamic field definitions from detected categories
 */
export function createDynamicFieldDefinitions(
  columnAnalysis: Record<string, ColumnAnalysis>,
  existingFields: FieldDefinition[] = CORE_FIELD_DEFINITIONS
): FieldDefinition[] {
  const dynamicFields: FieldDefinition[] = [...existingFields];
  
  // Find category columns that might represent new tactics, teams, etc.
  Object.entries(columnAnalysis).forEach(([header, analysis]) => {
    if (analysis.type === 'category' && analysis.uniqueValues && analysis.uniqueValues < 20) {
      const headerLower = header.toLowerCase();
      
      // Check if it's not already covered by existing fields
      const isExisting = existingFields.some(field => 
        field.variations.some(variation => headerLower.includes(variation))
      );
      
      if (!isExisting) {
        // Create a dynamic field definition
        dynamicFields.push({
          key: `dynamic_${header.toLowerCase().replace(/\s+/g, '_')}`,
          label: header,
          type: 'category',
          required: false,
          category: 'dynamic',
          description: `Dynamic category field: ${header}`,
          variations: [headerLower, header.toLowerCase().replace(/\s+/g, '_')]
        });
      }
    }
  });
  
  return dynamicFields;
}