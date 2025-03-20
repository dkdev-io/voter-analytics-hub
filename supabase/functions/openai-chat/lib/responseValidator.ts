// Validate and fix AI responses if needed
export async function validateResponse(
  aiResponse: { answer: string, finishReason: string }, 
  sampleData: any[], 
  prompt: string, 
  queryParams: any
) {
  const { answer, finishReason } = aiResponse;

  // Expanded blacklist of phrases that indicate the AI is ignoring our instructions
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
    "i couldn't find",
    "i apologize, but i don't have",
    "i don't have access to personal",
    "i don't have access to the database",
    "i don't have direct access to the data",
    "i would need to access",
    "i would need access to the",
    "i cannot search through",
    "i don't have the ability to search",
    "i am not able to access",
    "i am unable to access",
    "i do not have the capability",
    "without access to the specific",
    "i am not able to provide",
    "i'm not able to access that information",
    "i don't have the capability to search",
    "i would need to know more",
    "i will need more details",
    "i'll need more information",
    "i don't have visibility into"
  ];
  
  // Check if the answer contains any blacklisted phrases
  const containsBlacklistedPhrase = blacklistedPhrases.some(phrase => 
    answer.toLowerCase().includes(phrase)
  );
  
  // Check for overly generic answers
  const isGenericAnswer = 
    answer.toLowerCase().includes("based on the information provided") && 
    answer.length < 100 &&
    !answer.includes("records") &&
    !answer.includes("attempts");
  
  // Additional check for answers that claim they can't find someone in data
  const isClaimingPersonNotFound = 
    queryParams && 
    queryParams.person && 
    answer.toLowerCase().includes(`couldn't find`) && 
    answer.toLowerCase().includes(queryParams.person.toLowerCase());
    
  // Check for answer where the AI references itself
  const isSelfReferring = 
    answer.toLowerCase().includes("as an ai") || 
    answer.toLowerCase().includes("my capabilities") ||
    answer.toLowerCase().includes("my training") ||
    answer.toLowerCase().includes("my knowledge");
    
  // Check for apologies - almost always a sign the AI is trying to dodge giving a direct answer
  const isApologizing = 
    answer.toLowerCase().includes("i apologize") || 
    answer.toLowerCase().includes("i'm sorry");
    
  // Check if the answer doesn't start with "Based on the data provided"
  const doesNotStartWithDataPhrase = !answer.toLowerCase().startsWith("based on the data provided");
  
  console.log("Response validation checks:", {
    containsBlacklistedPhrase,
    isGenericAnswer,
    isClaimingPersonNotFound,
    isSelfReferring,
    isApologizing,
    doesNotStartWithDataPhrase,
    sampleDataLength: sampleData.length,
    hasPerson: !!queryParams?.person
  });
  
  // Force a direct data answer for any of these conditions
  const shouldGenerateDirectAnswer = 
    (containsBlacklistedPhrase || 
     isGenericAnswer || 
     isSelfReferring || 
     isApologizing ||
     (doesNotStartWithDataPhrase && sampleData.length > 0)) && 
    sampleData.length > 0;
  
  // If the model is claiming it doesn't have access to data, or providing a generic answer
  // when we have data, generate a direct answer from the data
  if (shouldGenerateDirectAnswer) {
    console.log("WARNING: OpenAI response contains problems - generating direct answer from data");
    console.log("Original answer:", answer);
    console.log("Sample data size:", sampleData.length);
    console.log("Query params:", queryParams);
    
    // Generate a direct answer from the data
    return {
      answer: await createDirectAnswer(sampleData, queryParams, prompt),
      finishReason
    };
  } 
  // Special case: If the model claims it can't find a person but there might be data
  else if (isClaimingPersonNotFound) {
    console.log("WARNING: OpenAI claims it can't find a person - checking with case-insensitive search");
    
    // Try a case-insensitive search for the person
    const personMatches = findPersonInData(sampleData, queryParams.person);
    
    if (personMatches.length > 0) {
      console.log(`Found ${personMatches.length} records for ${queryParams.person} using case-insensitive search`);
      
      // Use the filtered data to generate a more accurate answer
      return {
        answer: await createDirectAnswer(personMatches, queryParams, prompt),
        finishReason
      };
    }
  }
  // Special case: If we got a denial but have no data, explain this clearly  
  else if (containsBlacklistedPhrase && sampleData.length === 0) {
    console.log("WARNING: OpenAI returned denial response and we have no matching data");
    return {
      answer: `Based on the data provided, I don't see any records that match your query ${queryParams.person ? `for ${queryParams.person}` : ''} ${queryParams.tactic ? `using ${queryParams.tactic}` : ''}.`,
      finishReason
    };
  }
  
  return { answer, finishReason };
}

// Find a person in the data using case-insensitive and partial matching
function findPersonInData(data: any[], personName: string): any[] {
  if (!personName || !data || data.length === 0) {
    return [];
  }
  
  // Split the query name
  const names = personName.toLowerCase().split(' ');
  if (names.length < 2) {
    // Single name search
    return data.filter(record => {
      const firstName = (record.first_name || '').toLowerCase();
      const lastName = (record.last_name || '').toLowerCase();
      return firstName.includes(names[0]) || lastName.includes(names[0]);
    });
  }
  
  const firstName = names[0];
  const lastName = names.slice(1).join(' ');
  
  console.log(`Searching for name: firstName="${firstName}", lastName="${lastName}"`);
  
  // First try exact match for both first and last name
  const exactMatches = data.filter(record => {
    const recordFirstName = (record.first_name || '').toLowerCase();
    const recordLastName = (record.last_name || '').toLowerCase();
    return recordFirstName === firstName && recordLastName === lastName;
  });
  
  // If we found exact matches, return those
  if (exactMatches.length > 0) {
    console.log(`Found ${exactMatches.length} exact matches for "${firstName} ${lastName}"`);
    return exactMatches;
  }
  
  // Otherwise, try partial matching
  return data.filter(record => {
    const recordFirstName = (record.first_name || '').toLowerCase();
    const recordLastName = (record.last_name || '').toLowerCase();
    
    // Look for partial matches (significant improvement for names like Dan/Daniel, etc.)
    const firstNameMatch = recordFirstName.includes(firstName) || firstName.includes(recordFirstName);
    const lastNameMatch = recordLastName.includes(lastName) || lastName.includes(recordLastName);
    
    const isMatch = firstNameMatch && lastNameMatch;
    if (isMatch) {
      console.log(`Matched: DB record "${recordFirstName} ${recordLastName}" matches query "${firstName} ${lastName}"`);
    }
    
    return isMatch;
  });
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
    // We've already filtered by person in findPersonInData if that function was called
    if (sampleData === filteredData) {
      // Split into first and last name for better matching
      const names = person.split(' ');
      if (names.length > 1) {
        const firstName = names[0];
        const lastName = names.slice(1).join(' ');
        
        filteredData = filteredData.filter(record => {
          const recordFirstName = (record.first_name || '').toLowerCase();
          const recordLastName = (record.last_name || '').toLowerCase();
          
          const firstNameMatch = recordFirstName.includes(firstName) || firstName.includes(recordFirstName);
          const lastNameMatch = recordLastName.includes(lastName) || lastName.includes(recordLastName);
          
          return firstNameMatch && lastNameMatch;
        });
      } else {
        // Single name matching
        filteredData = filteredData.filter(record => {
          const fullName = `${record.first_name || ''} ${record.last_name || ''}`.toLowerCase();
          return fullName.includes(person);
        });
      }
    }
    
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
