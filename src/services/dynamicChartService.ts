/**
 * Dynamic Chart Service
 * Analyzes data to detect categories and generate chart configurations
 */

import { generateColorPalette, getCategoryColor } from '@/utils/chartColorGenerator';

export interface ChartDataPoint {
  name: string;
  value: number;
  color: string;
  [key: string]: any;
}

export interface DynamicChartConfig {
  data: ChartDataPoint[];
  total: number;
  categories: string[];
  colorMap: Record<string, string>;
  chartType: 'pie' | 'bar' | 'line' | 'scatter';
}

export interface DataAnalysisResult {
  uniqueCategories: string[];
  totalRecords: number;
  hasTimeSeriesData: boolean;
  fieldTypes: Record<string, 'string' | 'number' | 'date'>;
  sampleData: Record<string, unknown>[];
}

/**
 * Analyze raw data to understand its structure
 */
export function analyzeDataStructure(data: Record<string, unknown>[]): DataAnalysisResult {
  if (!data || data.length === 0) {
    return {
      uniqueCategories: [],
      totalRecords: 0,
      hasTimeSeriesData: false,
      fieldTypes: {},
      sampleData: []
    };
  }

  const sampleSize = Math.min(100, data.length);
  const sampleData = data.slice(0, sampleSize);
  const fieldTypes: Record<string, 'string' | 'number' | 'date'> = {};
  
  // Analyze field types from sample data
  if (sampleData.length > 0) {
    const firstRecord = sampleData[0];
    Object.keys(firstRecord).forEach(key => {
      const value = firstRecord[key];
      if (value instanceof Date || (typeof value === 'string' && !isNaN(Date.parse(value)))) {
        fieldTypes[key] = 'date';
      } else if (typeof value === 'number' || (typeof value === 'string' && !isNaN(Number(value)))) {
        fieldTypes[key] = 'number';
      } else {
        fieldTypes[key] = 'string';
      }
    });
  }

  // Detect time series data
  const hasTimeSeriesData = 'date' in fieldTypes || 
                           'created_at' in fieldTypes || 
                           'timestamp' in fieldTypes ||
                           Object.keys(fieldTypes).some(key => 
                             key.toLowerCase().includes('date') || 
                             key.toLowerCase().includes('time')
                           );

  // Find categorical fields for unique category detection
  const categoricalFields = Object.keys(fieldTypes).filter(key => 
    fieldTypes[key] === 'string' && !key.toLowerCase().includes('name')
  );

  const uniqueCategories: string[] = [];
  categoricalFields.forEach(field => {
    const values = [...new Set(data.map(item => item[field]).filter(v => v != null))];
    uniqueCategories.push(...values.map(v => String(v)));
  });

  return {
    uniqueCategories: [...new Set(uniqueCategories)],
    totalRecords: data.length,
    hasTimeSeriesData,
    fieldTypes,
    sampleData
  };
}

/**
 * Dynamically detect all tactics from data
 */
export function detectTacticsFromData(data: Record<string, unknown>[]): string[] {
  if (!data || data.length === 0) return [];

  const tacticFields = ['tactic', 'tactic_type', 'contact_method', 'method'];
  const tactics = new Set<string>();

  // Look for tactic-related fields
  data.forEach(item => {
    tacticFields.forEach(field => {
      const value = item[field];
      if (value && typeof value === 'string') {
        tactics.add(value.trim());
      }
    });

    // Also check if there are direct tactic columns (like sms_attempts, phone_attempts)
    Object.keys(item).forEach(key => {
      if (key.toLowerCase().includes('sms') || 
          key.toLowerCase().includes('phone') || 
          key.toLowerCase().includes('canvas') ||
          key.toLowerCase().includes('email') ||
          key.toLowerCase().includes('door') ||
          key.toLowerCase().includes('knock')) {
        const tacticName = key.split('_')[0]; // Get base name
        if (tacticName) {
          tactics.add(tacticName.toUpperCase());
        }
      }
    });
  });

  return Array.from(tactics).sort();
}

/**
 * Dynamically detect all teams from data
 */
export function detectTeamsFromData(data: Record<string, unknown>[]): string[] {
  if (!data || data.length === 0) return [];

  const teamFields = ['team', 'team_name', 'team_id', 'group', 'squad'];
  const teams = new Set<string>();

  data.forEach(item => {
    teamFields.forEach(field => {
      const value = item[field];
      if (value) {
        teams.add(String(value).trim());
      }
    });
  });

  return Array.from(teams).sort();
}

/**
 * Dynamically detect all result types from data
 */
export function detectResultTypesFromData(data: Record<string, unknown>[]): string[] {
  if (!data || data.length === 0) return [];

  const resultTypes = new Set<string>();
  
  // Common result type fields
  const resultFields = [
    'result', 'contact_result', 'outcome', 'response', 'status',
    'support', 'oppose', 'undecided', 'not_home', 'refusal', 'bad_data'
  ];

  data.forEach(item => {
    resultFields.forEach(field => {
      if (field in item && item[field] != null) {
        // If it's a boolean or number field representing presence, add the field name
        if (typeof item[field] === 'boolean' || typeof item[field] === 'number') {
          if (item[field]) {
            resultTypes.add(field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));
          }
        } else if (typeof item[field] === 'string') {
          resultTypes.add(String(item[field]).trim());
        }
      }
    });
  });

  return Array.from(resultTypes).sort();
}

/**
 * Generate chart configuration for tactics data
 */
export function generateTacticsChartConfig(
  data: Record<string, unknown>[],
  theme: 'light' | 'dark' = 'light'
): DynamicChartConfig {
  const tactics = detectTacticsFromData(data);
  const colorMap = generateColorPalette(tactics, 'tactics', theme);
  
  const chartData: ChartDataPoint[] = tactics.map(tactic => {
    const value = data.reduce((sum, item) => {
      // Look for attempts/count data for this tactic
      const tacticKey = Object.keys(item).find(key => 
        key.toLowerCase().includes(tactic.toLowerCase()) && 
        (key.includes('attempts') || key.includes('count'))
      );
      
      if (tacticKey) {
        return sum + (Number(item[tacticKey]) || 0);
      }
      
      // Fallback: count records matching this tactic
      if (item.tactic === tactic) {
        return sum + (Number(item.attempts) || 1);
      }
      
      return sum;
    }, 0);

    return {
      name: tactic,
      value,
      color: colorMap[tactic]
    };
  }).filter(item => item.value > 0); // Only include non-zero values

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return {
    data: chartData,
    total,
    categories: tactics,
    colorMap,
    chartType: 'pie'
  };
}

/**
 * Generate chart configuration for any categorical data
 */
export function generateCategoricalChartConfig(
  data: Record<string, unknown>[],
  categoryField: string,
  valueField: string,
  categoryType: 'tactics' | 'contacts' | 'notReached' | 'teams' | 'general' = 'general',
  theme: 'light' | 'dark' = 'light'
): DynamicChartConfig {
  if (!data || data.length === 0) {
    return {
      data: [],
      total: 0,
      categories: [],
      colorMap: {},
      chartType: 'pie'
    };
  }

  // Group data by category
  const categoryGroups: Record<string, number> = {};
  
  data.forEach(item => {
    const category = String(item[categoryField] || 'Unknown').trim();
    const value = Number(item[valueField]) || 0;
    categoryGroups[category] = (categoryGroups[category] || 0) + value;
  });

  const categories = Object.keys(categoryGroups).sort();
  const colorMap = generateColorPalette(categories, categoryType, theme);
  
  const chartData: ChartDataPoint[] = categories
    .map(category => ({
      name: category,
      value: categoryGroups[category],
      color: colorMap[category]
    }))
    .filter(item => item.value > 0)
    .sort((a, b) => b.value - a.value); // Sort by value descending

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return {
    data: chartData,
    total,
    categories,
    colorMap,
    chartType: 'pie'
  };
}

/**
 * Generate time series chart configuration
 */
export function generateTimeSeriesChartConfig(
  data: Record<string, unknown>[],
  dateField: string = 'date',
  valueFields: string[] = ['attempts', 'contacts']
): DynamicChartConfig {
  if (!data || data.length === 0) {
    return {
      data: [],
      total: 0,
      categories: valueFields,
      colorMap: {},
      chartType: 'line'
    };
  }

  // Group by date and aggregate values
  const dateGroups: Record<string, Record<string, number>> = {};
  
  data.forEach(item => {
    const date = item[dateField];
    if (!date) return;
    
    const dateStr = new Date(date as string | number | Date).toISOString().split('T')[0];
    if (!dateGroups[dateStr]) {
      dateGroups[dateStr] = {};
      valueFields.forEach(field => {
        dateGroups[dateStr][field] = 0;
      });
    }
    
    valueFields.forEach(field => {
      const value = Number(item[field]) || 0;
      dateGroups[dateStr][field] += value;
    });
  });

  // Convert to chart data format
  const sortedDates = Object.keys(dateGroups).sort();
  const chartData: ChartDataPoint[] = sortedDates.map(date => {
    const values = dateGroups[date];
    const primaryValue = values[valueFields[0]] || 0;
    return {
      name: date,
      value: primaryValue,
      color: colorMap[valueFields[0]] || '#8884d8',
      date,
      ...values
    };
  });

  const colorMap = generateColorPalette(valueFields, 'general');
  const total = chartData.length;

  return {
    data: chartData,
    total,
    categories: valueFields,
    colorMap,
    chartType: 'line'
  };
}

/**
 * Auto-detect best chart type based on data structure
 */
export function detectBestChartType(data: Record<string, unknown>[], analysisResult: DataAnalysisResult): 'pie' | 'bar' | 'line' | 'scatter' {
  if (!data || data.length === 0) return 'pie';
  
  // If we have time series data, use line chart
  if (analysisResult.hasTimeSeriesData) {
    return 'line';
  }
  
  // If we have many categories (>10), use bar chart
  if (analysisResult.uniqueCategories.length > 10) {
    return 'bar';
  }
  
  // Default to pie chart for categorical data
  return 'pie';
}

/**
 * Generate adaptive chart configuration based on data analysis
 */
export function generateAdaptiveChartConfig(
  data: Record<string, unknown>[],
  primaryField?: string,
  valueField: string = 'attempts',
  theme: 'light' | 'dark' = 'light'
): DynamicChartConfig {
  const analysis = analyzeDataStructure(data);
  
  if (!data || data.length === 0) {
    return {
      data: [],
      total: 0,
      categories: [],
      colorMap: {},
      chartType: 'pie'
    };
  }

  // If time series data is available, generate time series chart
  if (analysis.hasTimeSeriesData) {
    return generateTimeSeriesChartConfig(data);
  }

  // If primary field is specified, use it for categorization
  if (primaryField && primaryField in analysis.fieldTypes) {
    return generateCategoricalChartConfig(data, primaryField, valueField, 'general', theme);
  }

  // Auto-detect the best categorical field
  const categoricalFields = Object.keys(analysis.fieldTypes).filter(key => 
    analysis.fieldTypes[key] === 'string' && !key.toLowerCase().includes('name')
  );

  if (categoricalFields.length > 0) {
    const bestField = categoricalFields[0]; // Use first categorical field
    return generateCategoricalChartConfig(data, bestField, valueField, 'general', theme);
  }

  // Fallback to empty configuration
  return {
    data: [],
    total: 0,
    categories: [],
    colorMap: {},
    chartType: 'pie'
  };
}