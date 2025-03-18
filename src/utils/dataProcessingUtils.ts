
import { supabase } from '@/integrations/supabase/client';

interface ColumnStats {
  type: 'numeric' | 'categorical' | 'datetime';
  count: number;
  uniqueCount?: number;
  min?: number | string;
  max?: number | string;
  mean?: number;
  median?: number;
  mode?: string;
  mostCommonValues?: {value: string, count: number}[];
  histogram?: Record<string, number>;
}

export interface DataSummary {
  totalRows: number;
  columnStats: Record<string, ColumnStats>;
  sampleRows: Record<string, any>[];
}

/**
 * Detects the type of a column based on its values
 */
const detectColumnType = (values: any[]): 'numeric' | 'categorical' | 'datetime' => {
  // Sample the first 100 non-null values for type detection
  const sampleValues = values.filter(v => v !== null && v !== undefined).slice(0, 100);
  
  if (sampleValues.length === 0) return 'categorical';
  
  // Check if the column contains dates
  const datePattern = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(.\d{3})?Z?)?$/;
  const potentialDateCount = sampleValues.filter(v => 
    typeof v === 'string' && datePattern.test(v)
  ).length;
  
  if (potentialDateCount / sampleValues.length > 0.8) {
    return 'datetime';
  }
  
  // Check if the column contains numbers
  const numberCount = sampleValues.filter(v => !isNaN(Number(v))).length;
  
  if (numberCount / sampleValues.length > 0.8) {
    return 'numeric';
  }
  
  return 'categorical';
};

/**
 * Calculates numeric statistics for a column
 */
const calculateNumericStats = (values: any[]): Partial<ColumnStats> => {
  const numericValues = values
    .filter(v => v !== null && v !== undefined && !isNaN(Number(v)))
    .map(v => Number(v));
  
  if (numericValues.length === 0) {
    return {};
  }
  
  // Sort values for median calculation
  numericValues.sort((a, b) => a - b);
  
  // Calculate basic statistics
  const min = numericValues[0];
  const max = numericValues[numericValues.length - 1];
  const sum = numericValues.reduce((acc, val) => acc + val, 0);
  const mean = sum / numericValues.length;
  
  // Calculate median
  let median;
  const midPoint = Math.floor(numericValues.length / 2);
  if (numericValues.length % 2 === 0) {
    median = (numericValues[midPoint - 1] + numericValues[midPoint]) / 2;
  } else {
    median = numericValues[midPoint];
  }
  
  return {
    min,
    max,
    mean,
    median
  };
};

/**
 * Calculates categorical statistics for a column
 */
const calculateCategoricalStats = (values: any[]): Partial<ColumnStats> => {
  const valueCounts = new Map<string, number>();
  
  // Count occurrences of each value
  values.forEach(v => {
    if (v === null || v === undefined) return;
    
    const stringValue = String(v);
    valueCounts.set(stringValue, (valueCounts.get(stringValue) || 0) + 1);
  });
  
  // Get unique count
  const uniqueCount = valueCounts.size;
  
  // Get most common values
  const sortedValues = [...valueCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([value, count]) => ({ value, count }));
  
  // Create histogram for top categories
  const histogram: Record<string, number> = {};
  sortedValues.forEach(({ value, count }) => {
    histogram[value] = count;
  });
  
  // Find mode (most common value)
  const mode = sortedValues.length > 0 ? sortedValues[0].value : undefined;
  
  return {
    uniqueCount,
    mostCommonValues: sortedValues,
    mode,
    histogram
  };
};

/**
 * Analyzes data to create a summary with column statistics
 */
export const analyzeData = (data: Record<string, any>[]): DataSummary => {
  console.log(`Analyzing ${data.length} rows of data`);
  
  if (data.length === 0) {
    return { totalRows: 0, columnStats: {}, sampleRows: [] };
  }
  
  // Get all column names from the first row
  const columnNames = Object.keys(data[0]);
  
  // Initialize column statistics
  const columnStats: Record<string, ColumnStats> = {};
  
  // Process each column
  columnNames.forEach(column => {
    // Extract all values for this column
    const columnValues = data.map(row => row[column]);
    
    // Detect column type
    const type = detectColumnType(columnValues);
    
    // Initialize column stats with count and type
    columnStats[column] = {
      type,
      count: columnValues.filter(v => v !== null && v !== undefined).length
    };
    
    // Calculate type-specific statistics
    if (type === 'numeric') {
      Object.assign(columnStats[column], calculateNumericStats(columnValues));
    } else {
      Object.assign(columnStats[column], calculateCategoricalStats(columnValues));
    }
  });
  
  return {
    totalRows: data.length,
    columnStats,
    sampleRows: data.slice(0, 10) // Include 10 sample rows
  };
};

/**
 * Processes user data efficiently in chunks to generate summary statistics
 */
export const processUserData = async (): Promise<DataSummary | null> => {
  try {
    // Get the current user's ID
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user.id;
    
    if (!userId) {
      console.error("No user ID found when processing data");
      return null;
    }
    
    console.log(`Processing data for user ${userId}...`);
    
    // Query data in chunks to avoid memory issues
    const CHUNK_SIZE = 1000;
    let allData: Record<string, any>[] = [];
    let lastId = 0;
    let hasMore = true;
    
    while (hasMore) {
      const { data, error } = await supabase
        .from('voter_contacts')
        .select('*')
        .eq('user_id', userId)
        .gt('id', lastId)
        .order('id')
        .limit(CHUNK_SIZE);
      
      if (error) {
        console.error("Error fetching data chunk:", error);
        return null;
      }
      
      if (!data || data.length === 0) {
        hasMore = false;
        break;
      }
      
      // Process this chunk
      allData = [...allData, ...data];
      
      // Update last ID for next chunk
      lastId = data[data.length - 1].id;
      
      // If we got fewer rows than the chunk size, we've reached the end
      if (data.length < CHUNK_SIZE) {
        hasMore = false;
      }
      
      console.log(`Processed chunk of ${data.length} rows, total: ${allData.length}`);
      
      // If we've collected enough data for a good sample, stop
      if (allData.length >= 10000) {
        console.log("Reached sample limit of 10,000 rows");
        break;
      }
    }
    
    if (allData.length === 0) {
      console.log("No data found for analysis");
      return null;
    }
    
    // Generate summary statistics
    return analyzeData(allData);
  } catch (error) {
    console.error("Error in processUserData:", error);
    return null;
  }
};
