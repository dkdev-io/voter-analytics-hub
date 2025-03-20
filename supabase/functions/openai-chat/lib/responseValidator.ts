
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
    "i cannot see",
    "there are many individuals named",
    "i couldn't find any information",
    "i don't have any data",
    "i don't have that information",
    "i'm not able to provide",
    "i'm not able to tell you",
    "i can't tell you",
    "i cannot tell you",
    "i'm not able to find",
    "i can't find",
    "cannot find",
    "i couldn't find"
  ];
  
  // Check if the answer contains any blacklisted phrases or is too short (indicating a non-answer)
  const containsBlacklistedPhrase = blacklistedPhrases.some(phrase => 
    answer.toLowerCase().includes(phrase)
  );
  
  // Check for overly generic answers
  const isGenericAnswer = 
    answer.toLowerCase().includes("based on the information provided") && 
    answer.length < 100 &&
    !answer.includes("records") &&
    !answer.includes("attempts");
  
  // If the model is claiming it doesn't have access to data, or providing a generic answer
  // when we have data, generate a direct answer from the data
  if ((containsBlacklistedPhrase || isGenericAnswer) && sampleData.length > 0) {
    console.log("WARNING: OpenAI response contains blacklisted phrases or generic answer - generating direct answer from data");
    console.log("Original answer:", answer);
    console.log("Sample data size:", sampleData.length);
    console.log("Query params:", queryParams);
    
    // Generate a direct answer from the data
    return {
      answer: await createDirectAnswer(sampleData, queryParams, prompt),
      finishReason
    };
  } else if (containsBlacklistedPhrase && sampleData.length === 0) {
    // Special case: If we got a denial but have no data, explain this clearly
    console.log("WARNING: OpenAI returned denial response and we have no matching data");
    return {
      answer: `Based on the data provided, I don't see any records that match your query ${queryParams.person ? `for ${queryParams.person}` : ''} ${queryParams.tactic ? `using ${queryParams.tactic}` : ''}.`,
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
  const team = queryParams?.team;
  
  // Filter data based on query parameters - generic approach without special cases
  let filteredData = [...sampleData];
  let filters = [];
  
  // Apply person filter if present - use more flexible case-insensitive matching
  if (person) {
    filteredData = filteredData.filter(record => {
      const fullName = `${record.first_name || ''} ${record.last_name || ''}`.toLowerCase();
      return fullName.includes(person.toLowerCase());
    });
    
    filters.push(`person: ${queryParams.person}`);
    
    if (filteredData.length === 0) {
      directAnswer += `I couldn't find any records for "${queryParams.person}". `;
      return directAnswer;
    }
    
    directAnswer += `I found ${filteredData.length} records for ${queryParams.person}. `;
  }
  
  // Apply tactic filter if present
  if (tactic) {
    const previousCount = filteredData.length;
    filteredData = filteredData.filter(record => 
      record.tactic && record.tactic.toLowerCase() === tactic.toLowerCase()
    );
    
    filters.push(`tactic: ${tactic}`);
    
    if (person) {
      directAnswer += `Of these, ${filteredData.length} records involve the ${tactic} tactic. `;
    } else {
      directAnswer += `I found ${filteredData.length} records for the ${tactic} tactic. `;
    }
  }
  
  // Apply team filter if present
  if (team && team !== 'All') {
    const previousCount = filteredData.length;
    filteredData = filteredData.filter(record => 
      record.team && record.team.toLowerCase() === team.toLowerCase()
    );
    
    filters.push(`team: ${team}`);
    
    if (filters.length > 1) {
      directAnswer += `Within team ${team}, there are ${filteredData.length} matching records. `;
    } else {
      directAnswer += `For team ${team}, I found ${filteredData.length} records. `;
    }
  }
  
  // Apply date filter if present
  if (date) {
    const previousCount = filteredData.length;
    filteredData = filteredData.filter(record => record.date === date);
    
    filters.push(`date: ${date}`);
    
    directAnswer += `For the date ${date}, there are ${filteredData.length} matching records. `;
  }
  
  // No matching data after all filters
  if (filteredData.length === 0) {
    directAnswer += `No records match all the specified criteria (${filters.join(', ')}).`;
    return directAnswer;
  }
  
  // Calculate metrics based on filtered data
  const totalAttempts = filteredData.reduce((sum, record) => sum + (Number(record.attempts) || 0), 0);
  const totalContacts = filteredData.reduce((sum, record) => sum + (Number(record.contacts) || 0), 0);
  const totalSupport = filteredData.reduce((sum, record) => sum + (Number(record.support) || 0), 0);
  const totalOppose = filteredData.reduce((sum, record) => sum + (Number(record.oppose) || 0), 0);
  const totalUndecided = filteredData.reduce((sum, record) => sum + (Number(record.undecided) || 0), 0);
  const totalNotHome = filteredData.reduce((sum, record) => sum + (Number(record.not_home) || 0), 0);
  const totalRefusal = filteredData.reduce((sum, record) => sum + (Number(record.refusal) || 0), 0);
  const totalBadData = filteredData.reduce((sum, record) => sum + (Number(record.bad_data) || 0), 0);
  
  // Add general metrics
  directAnswer += `The total number of attempts is ${totalAttempts}. `;
  
  // Add details about contacts if we have any
  if (totalContacts > 0) {
    directAnswer += `There were ${totalContacts} successful contacts: ${totalSupport} support, ${totalOppose} oppose, and ${totalUndecided} undecided. `;
  }
  
  // Add details about not reached if we have any
  const totalNotReached = totalNotHome + totalRefusal + totalBadData;
  if (totalNotReached > 0) {
    directAnswer += `${totalNotReached} were not reached: ${totalNotHome} not home, ${totalRefusal} refusals, and ${totalBadData} bad data. `;
  }
  
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
