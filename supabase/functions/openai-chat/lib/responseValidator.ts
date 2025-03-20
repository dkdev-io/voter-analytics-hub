
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
  
  // Special case for Dan Kelly, who's frequently mentioned
  const isDanKellyQuery = prompt.toLowerCase().includes("dan kelly");
  
  if (containsBlacklistedPhrase || (isDanKellyQuery && answer.toLowerCase().includes("don't have") && sampleData.length > 0)) {
    console.log("WARNING: OpenAI response contains blacklisted phrases or isn't properly answering about Dan Kelly");
    
    // CREATE A MANUAL ANSWER BASED ON THE DATA
    // This is our fallback when the AI insists it doesn't have access
    return {
      answer: await createDirectAnswer(sampleData, queryParams, isDanKellyQuery, prompt),
      finishReason
    };
  }
  
  return { answer, finishReason };
}

// Generate a direct answer when LLM fails
async function createDirectAnswer(sampleData: any[], queryParams: any, isDanKellyQuery: boolean, prompt: string) {
  let directAnswer = "Based on the data provided, ";
  
  if (!sampleData || sampleData.length === 0) {
    directAnswer += "I found no matching records for your query.";
    return directAnswer;
  }
  
  // Check if we're looking for a specific person
  if (queryParams && queryParams.person) {
    return handlePersonQuery(sampleData, queryParams, directAnswer);
  } 
  // If we're just looking for a specific tactic
  else if (queryParams && queryParams.tactic) {
    return handleTacticQuery(sampleData, queryParams, directAnswer);
  } 
  // If this is a Dan Kelly query without structured parameters
  else if (isDanKellyQuery) {
    return handleSpecificDanKellyQuery(sampleData, prompt, directAnswer);
  }
  // General data overview
  else {
    return handleGeneralDataQuery(sampleData, directAnswer);
  }
}

// Handle queries for specific people
function handlePersonQuery(sampleData: any[], queryParams: any, directAnswer: string) {
  const personName = queryParams.person.toLowerCase();
  
  // Special handling for Dan Kelly
  if (personName.includes("dan kelly")) {
    // See if there are any Dan Kelly records
    const danKellyRecords = sampleData.filter(record => 
      (record.first_name?.toLowerCase() + ' ' + record.last_name?.toLowerCase()).includes('dan kelly')
    );
    
    if (danKellyRecords.length > 0) {
      const danKellyPhoneRecords = danKellyRecords.filter(record => 
        record.tactic?.toLowerCase() === 'phone'
      );
      
      const phoneAttempts = danKellyPhoneRecords.reduce((sum, record) => sum + (record.attempts || 0), 0);
      
      directAnswer += `I found ${danKellyRecords.length} records for Dan Kelly. `;
      
      // If specifically asking about phone attempts
      if (queryParams.tactic?.toLowerCase() === 'phone') {
        directAnswer += `Dan Kelly made a total of ${phoneAttempts} phone attempts. `;
        
        // Add more details if available
        if (danKellyPhoneRecords.length > 0) {
          const dates = [...new Set(danKellyPhoneRecords.map(r => r.date))];
          directAnswer += `These phone attempts were made on the following dates: ${dates.join(', ')}. `;
        }
      } else {
        // General breakdown for Dan Kelly
        const totalAttempts = danKellyRecords.reduce((sum, record) => sum + (record.attempts || 0), 0);
        directAnswer += `The total number of attempts by Dan Kelly across all tactics is ${totalAttempts}. `;
        
        // Create tactic breakdown
        const tacticBreakdown = {};
        danKellyRecords.forEach(record => {
          if (record.tactic) {
            tacticBreakdown[record.tactic] = (tacticBreakdown[record.tactic] || 0) + (record.attempts || 0);
          }
        });
        
        directAnswer += `Breakdown by tactic: `;
        Object.entries(tacticBreakdown).forEach(([tactic, attempts]) => {
          directAnswer += `${tactic}: ${attempts} attempts. `;
        });
      }
    } else {
      directAnswer += `I found no records for Dan Kelly in the data. The database does not contain any entries for a person with this name.`;
    }
  } else {
    // Normal person search
    const personRecords = sampleData.filter(record => 
      (record.first_name?.toLowerCase() + ' ' + record.last_name?.toLowerCase()).includes(personName)
    );
    
    if (personRecords.length > 0) {
      directAnswer += `I found ${personRecords.length} records for ${queryParams.person}. `;
      
      // If we're also looking for a specific tactic
      if (queryParams.tactic) {
        const tacticRecords = personRecords.filter(record => 
          record.tactic && record.tactic.toLowerCase() === queryParams.tactic.toLowerCase()
        );
        
        const totalAttempts = tacticRecords.reduce((sum, record) => sum + (record.attempts || 0), 0);
        directAnswer += `There are ${totalAttempts} ${queryParams.tactic} attempts by ${queryParams.person}. `;
      } else {
        // Sum all attempts for this person
        const totalAttempts = personRecords.reduce((sum, record) => sum + (record.attempts || 0), 0);
        directAnswer += `The total number of attempts by ${queryParams.person} is ${totalAttempts}. `;
      }
      
      // Add date information if applicable
      if (queryParams.date) {
        const dateRecords = personRecords.filter(record => record.date === queryParams.date);
        if (dateRecords.length > 0) {
          const dateAttempts = dateRecords.reduce((sum, record) => sum + (record.attempts || 0), 0);
          directAnswer += `On ${queryParams.date}, ${queryParams.person} made ${dateAttempts} attempts. `;
        } else {
          directAnswer += `No records found for ${queryParams.person} on ${queryParams.date}. `;
        }
      }
    } else {
      directAnswer += `I found no records for ${queryParams.person} in the data. `;
    }
  }
  
  return directAnswer;
}

// Handle tactic-specific queries
function handleTacticQuery(sampleData: any[], queryParams: any, directAnswer: string) {
  const tacticRecords = sampleData.filter(record => 
    record.tactic && record.tactic.toLowerCase() === queryParams.tactic.toLowerCase()
  );
  
  if (tacticRecords.length > 0) {
    const totalAttempts = tacticRecords.reduce((sum, record) => sum + (record.attempts || 0), 0);
    directAnswer += `I found ${totalAttempts} total ${queryParams.tactic} attempts across ${tacticRecords.length} records. `;
    
    // Add date information if applicable
    if (queryParams.date) {
      const dateRecords = tacticRecords.filter(record => record.date === queryParams.date);
      if (dateRecords.length > 0) {
        const dateAttempts = dateRecords.reduce((sum, record) => sum + (record.attempts || 0), 0);
        directAnswer += `On ${queryParams.date}, there were ${dateAttempts} ${queryParams.tactic} attempts. `;
      } else {
        directAnswer += `No ${queryParams.tactic} records found for ${queryParams.date}. `;
      }
    }
    
    // Breakdown by person for this tactic
    const personBreakdown = {};
    tacticRecords.forEach(record => {
      const fullName = `${record.first_name || ''} ${record.last_name || ''}`.trim();
      if (fullName) {
        personBreakdown[fullName] = (personBreakdown[fullName] || 0) + (record.attempts || 0);
      }
    });
    
    // Add top 3 people for this tactic
    const topPeople = Object.entries(personBreakdown)
      .sort((a, b) => (b[1] as number) - (a[1] as number))
      .slice(0, 3);
    
    if (topPeople.length > 0) {
      directAnswer += `Top people for ${queryParams.tactic}: `;
      topPeople.forEach(([person, attempts]) => {
        directAnswer += `${person}: ${attempts} attempts. `;
      });
    }
  } else {
    directAnswer += `I found no records for ${queryParams.tactic} in the data. `;
  }
  
  return directAnswer;
}

// Handle specific Dan Kelly queries without structured parameters
function handleSpecificDanKellyQuery(sampleData: any[], prompt: string, directAnswer: string) {
  // Check for Dan Kelly in the data
  const danKellyRecords = sampleData.filter(record => 
    (record.first_name?.toLowerCase() + ' ' + record.last_name?.toLowerCase()).includes('dan kelly')
  );
  
  if (danKellyRecords.length > 0) {
    // Focus on phone attempts if that's in the query
    if (prompt.toLowerCase().includes("phone")) {
      const phoneRecords = danKellyRecords.filter(record => 
        record.tactic?.toLowerCase() === 'phone'
      );
      
      const phoneAttempts = phoneRecords.reduce((sum, record) => sum + (record.attempts || 0), 0);
      directAnswer += `Dan Kelly made a total of ${phoneAttempts} phone attempts across ${phoneRecords.length} records. `;
      
      if (phoneRecords.length > 0) {
        const dates = [...new Set(phoneRecords.map(r => r.date))];
        directAnswer += `These phone attempts were made on the following dates: ${dates.join(', ')}. `;
      }
    } else {
      // General Dan Kelly info
      const totalAttempts = danKellyRecords.reduce((sum, record) => sum + (record.attempts || 0), 0);
      directAnswer += `I found ${danKellyRecords.length} records for Dan Kelly with a total of ${totalAttempts} attempts. `;
      
      // Tactic breakdown
      const tacticBreakdown = {};
      danKellyRecords.forEach(record => {
        if (record.tactic) {
          tacticBreakdown[record.tactic] = (tacticBreakdown[record.tactic] || 0) + (record.attempts || 0);
        }
      });
      
      directAnswer += `Breakdown by tactic: `;
      Object.entries(tacticBreakdown).forEach(([tactic, attempts]) => {
        directAnswer += `${tactic}: ${attempts} attempts. `;
      });
    }
  } else {
    directAnswer += `I found no records for Dan Kelly in the database. There are no entries matching this name.`;
  }
  
  return directAnswer;
}

// Handle general data overview
function handleGeneralDataQuery(sampleData: any[], directAnswer: string) {
  const totalAttempts = sampleData.reduce((sum, record) => sum + (record.attempts || 0), 0);
  directAnswer += `I found ${sampleData.length} records with a total of ${totalAttempts} attempts. `;
  
  // Summarize tactics if available
  const tactics = {};
  sampleData.forEach(record => {
    if (record.tactic) {
      tactics[record.tactic] = (tactics[record.tactic] || 0) + (record.attempts || 0);
    }
  });
  
  if (Object.keys(tactics).length > 0) {
    directAnswer += "Breakdown by tactic: ";
    Object.entries(tactics).forEach(([tactic, attempts]) => {
      directAnswer += `${tactic}: ${attempts} attempts. `;
    });
  }
  
  return directAnswer;
}
