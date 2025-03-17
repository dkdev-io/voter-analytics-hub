
/**
 * Parses a CSV file and returns the headers and data rows
 */
export const parseCSV = (file: File): Promise<{ headers: string[], data: string[][] }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim() !== '');
        
        if (lines.length < 2) {
          throw new Error('CSV must contain headers and at least one row of data');
        }
        
        const parsedLines = lines.map(parseCSVLine);
        
        // Normalize headers (trim whitespace and convert to lowercase)
        const headers = parsedLines[0].map(header => header.trim());
        
        // Process data rows - clean up any trailing carriage returns
        const cleanData = parsedLines.slice(1).map(row => 
          row.map(cell => cell.replace(/\r$/, '').trim())
        );
        
        console.log("Parsed headers:", headers);
        console.log("First data row:", cleanData.length > 0 ? cleanData[0] : []);
        
        resolve({
          headers: headers,
          data: cleanData
        });
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('The file could not be read.'));
    };
    
    reader.readAsText(file);
  });
};

/**
 * Parses a single CSV line, handling quoted values correctly
 */
const parseCSVLine = (line: string): string[] => {
  const result = [];
  let inQuote = false;
  let currentValue = '';
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuote = !inQuote;
    } else if (char === ',' && !inQuote) {
      result.push(currentValue);
      currentValue = '';
    } else {
      currentValue += char;
    }
  }
  
  result.push(currentValue);
  return result;
};
