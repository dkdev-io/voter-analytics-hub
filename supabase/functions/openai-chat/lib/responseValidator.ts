
// Validate and fix AI responses if needed
export async function validateResponse(
  aiResponse: { answer: string, finishReason: string }, 
  sampleData: any[], 
  prompt: string, 
  queryParams: any
) {
  const { answer, finishReason } = aiResponse;

  // Blacklist of phrases that indicate the AI is ignoring our instructions
  const blacklistedPhrases = [
    "i don't have access",
    "i don't have information",
    "beyond my knowledge cutoff",
    "after my last update",
    "not have specific",
    "can't access",
    "i'm unable to provide specific information",
    "i'm sorry, but i don't",
    "not privy to",
    "as an ai",
    "my training data",
    "my knowledge",
    "my last update",
    "knowledge cutoff",
    "training cutoff",
    "i don't have data",
    "i don't have specific data",
    "i can't provide details",
    "i cannot access",
    "i do not have access",
    "i do not have the data",
    "i do not have direct access",
    "i don't have the ability to access",
    "without access to",
    "i would need access to",
    "i'm not able to access",
    "i cannot provide specific",
    "i can't provide specific",
    "i apologize",
    "i need more context",
    "could you please clarify",
    "please provide more information",
    "i need more information",
    "i don't see",
    "i cannot see"
  ];
  
  // Check if the answer contains any blacklisted phrases
  const containsBlacklistedPhrase = blacklistedPhrases.some(phrase => 
    answer.toLowerCase().includes(phrase)
  );
  
  if (containsBlacklistedPhrase && sampleData.length > 0) {
    console.log("WARNING: OpenAI response contains blacklisted phrases - generating direct answer from data");
    
    // Generate a direct answer from the data
    return {
      answer: await createDirectAnswer(sampleData, queryParams, prompt),
      finishReason
    };
  }
  
  return { answer, finishReason };
}

// Generate a direct answer when LLM fails
async function createDirectAnswer(sampleData: any[], queryParams: any, prompt: string) {
  let directAnswer = "Based on the data provided, ";
  
  if (!sampleData || sampleData.length === 0) {
    directAnswer += "I found no matching records for your query.";
    return directAnswer;
  }
  
  // Extract query information
  const tactic = queryParams?.tactic?.toLowerCase();
  const person = queryParams?.person?.toLowerCase();
  const date = queryParams?.date;
  const resultType = queryParams?.resultType?.toLowerCase();
  
  // Filter data based on query parameters - generic approach without special cases
  let filteredData = [...sampleData];
  
  // Apply person filter if present
  if (person) {
    filteredData = filteredData.filter(record => {
      const fullName = `${record.first_name || ''} ${record.last_name || ''}`.toLowerCase();
      return fullName.includes(person);
    });
    
    directAnswer += `I found ${filteredData.length} records for ${queryParams.person}. `;
  }
  
  // Apply tactic filter if present
  if (tactic) {
    const previousCount = filteredData.length;
    filteredData = filteredData.filter(record => 
      record.tactic && record.tactic.toLowerCase() === tactic
    );
    
    if (person) {
      directAnswer += `Of these, ${filteredData.length} records involve ${tactic} tactic. `;
    } else {
      directAnswer += `I found ${filteredData.length} records for ${tactic} tactic. `;
    }
  }
  
  // Apply date filter if present
  if (date) {
    const previousCount = filteredData.length;
    filteredData = filteredData.filter(record => record.date === date);
    
    directAnswer += `For the date ${date}, there are ${filteredData.length} matching records. `;
  }
  
  // Calculate metrics based on filtered data
  const totalAttempts = filteredData.reduce((sum, record) => sum + (Number(record.attempts) || 0), 0);
  
  // Add general metrics
  directAnswer += `The total number of attempts is ${totalAttempts}. `;
  
  // Add result type specific information if requested
  if (resultType) {
    let value = 0;
    
    // Map result types to data fields
    const fieldMap = {
      'attempts': 'attempts',
      'contacts': 'contacts',
      'support': 'support',
      'oppose': 'oppose',
      'undecided': 'undecided',
      'nothome': 'not_home',
      'not_home': 'not_home',
      'refusal': 'refusal',
      'baddata': 'bad_data',
      'bad_data': 'bad_data'
    };
    
    const field = fieldMap[resultType] || 'attempts';
    
    // Calculate total for the specific result type
    value = filteredData.reduce((sum, record) => sum + (Number(record[field]) || 0), 0);
    
    directAnswer += `The total for ${resultType} is ${value}. `;
  }
  
  // Add breakdown by tactic if we have multiple tactics
  if (!tactic && filteredData.length > 0) {
    const tacticBreakdown = {};
    filteredData.forEach(record => {
      if (record.tactic) {
        const tacticName = record.tactic.toLowerCase();
        tacticBreakdown[tacticName] = (tacticBreakdown[tacticName] || 0) + (Number(record.attempts) || 0);
      }
    });
    
    if (Object.keys(tacticBreakdown).length > 0) {
      directAnswer += `Breakdown by tactic: `;
      Object.entries(tacticBreakdown).forEach(([tactic, attempts]) => {
        directAnswer += `${tactic}: ${attempts} attempts. `;
      });
    }
  }
  
  // Add breakdown by date if we have multiple dates and no specific date was queried
  if (!date && filteredData.length > 0) {
    const dateBreakdown = {};
    filteredData.forEach(record => {
      if (record.date) {
        dateBreakdown[record.date] = (dateBreakdown[record.date] || 0) + (Number(record.attempts) || 0);
      }
    });
    
    // Only add date breakdown if we have multiple dates
    if (Object.keys(dateBreakdown).length > 1) {
      directAnswer += `Recent activity: `;
      
      // Get the 3 most recent dates
      const sortedDates = Object.keys(dateBreakdown).sort().slice(-3);
      
      sortedDates.forEach(date => {
        directAnswer += `${date}: ${dateBreakdown[date]} attempts. `;
      });
    }
  }
  
  return directAnswer;
}
