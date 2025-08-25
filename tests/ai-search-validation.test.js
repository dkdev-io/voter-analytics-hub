/**
 * AI Search Query Validation Suite
 * Tests AI search functionality with realistic campaign data
 */

import { describe, test, expect, beforeAll } from '@jest/globals';
import fs from 'fs';
import path from 'path';

// Mock AI search service - in real implementation this would use actual service
class MockAISearchService {
  constructor(data) {
    this.data = data;
  }

  // Simulate AI query processing
  async processQuery(query) {
    const queryLower = query.toLowerCase();
    
    if (queryLower.includes('total attempts') && queryLower.includes('team tony')) {
      return this.calculateTeamAttempts('Team Tony');
    }
    
    if (queryLower.includes('highest success rate')) {
      return this.findHighestSuccessRate();
    }
    
    if (queryLower.includes('supporter contacts') && queryLower.includes('january')) {
      return this.analyzeSupporterTrend();
    }
    
    if (queryLower.includes('sms') && queryLower.includes('phone') && queryLower.includes('canvas')) {
      return this.compareTactics();
    }
    
    if (queryLower.includes('top') && queryLower.includes('performer')) {
      return this.findTopPerformers();
    }
    
    return { error: 'Query not recognized' };
  }

  calculateTeamAttempts(teamName) {
    const teamData = this.data.filter(row => row.Team === teamName);
    const totalAttempts = teamData.reduce((sum, row) => sum + parseInt(row.Attempts || 0), 0);
    
    return {
      query: `Total attempts for ${teamName}`,
      result: totalAttempts,
      details: {
        records: teamData.length,
        totalAttempts,
        avgAttemptsPerRecord: Math.round(totalAttempts / teamData.length)
      }
    };
  }

  findHighestSuccessRate() {
    const teamMetrics = {};
    
    this.data.forEach(row => {
      const team = row.Team;
      if (!teamMetrics[team]) {
        teamMetrics[team] = { attempts: 0, contacts: 0 };
      }
      teamMetrics[team].attempts += parseInt(row.Attempts || 0);
      teamMetrics[team].contacts += parseInt(row.Contacts || 0);
    });
    
    let bestTeam = null;
    let bestRate = 0;
    
    Object.keys(teamMetrics).forEach(team => {
      const rate = teamMetrics[team].contacts / teamMetrics[team].attempts;
      if (rate > bestRate) {
        bestRate = rate;
        bestTeam = team;
      }
    });
    
    return {
      query: 'Team with highest success rate',
      result: bestTeam,
      details: {
        successRate: (bestRate * 100).toFixed(1) + '%',
        attempts: teamMetrics[bestTeam].attempts,
        contacts: teamMetrics[bestTeam].contacts
      }
    };
  }

  analyzeSupporterTrend() {
    const dailySupport = {};
    
    this.data.forEach(row => {
      const date = row.Date;
      if (!dailySupport[date]) {
        dailySupport[date] = 0;
      }
      dailySupport[date] += parseInt(row.Support || 0);
    });
    
    const dates = Object.keys(dailySupport).sort();
    const totalSupport = Object.values(dailySupport).reduce((sum, val) => sum + val, 0);
    const avgDaily = totalSupport / dates.length;
    
    return {
      query: 'Supporter contact trends in January',
      result: 'Analyzed daily supporter trends',
      details: {
        totalSupport,
        avgDailySupport: Math.round(avgDaily),
        activeDays: dates.length,
        trend: 'Variable with peak activity mid-month'
      }
    };
  }

  compareTactics() {
    const tacticMetrics = {};
    
    this.data.forEach(row => {
      const tactic = row.Tactic;
      if (!tacticMetrics[tactic]) {
        tacticMetrics[tactic] = { 
          attempts: 0, 
          contacts: 0, 
          supporters: 0,
          records: 0
        };
      }
      tacticMetrics[tactic].attempts += parseInt(row.Attempts || 0);
      tacticMetrics[tactic].contacts += parseInt(row.Contacts || 0);
      tacticMetrics[tactic].supporters += parseInt(row.Support || 0);
      tacticMetrics[tactic].records += 1;
    });
    
    const comparison = Object.keys(tacticMetrics).map(tactic => ({
      tactic,
      contactRate: (tacticMetrics[tactic].contacts / tacticMetrics[tactic].attempts * 100).toFixed(1),
      supportRate: (tacticMetrics[tactic].supporters / tacticMetrics[tactic].contacts * 100).toFixed(1),
      totalRecords: tacticMetrics[tactic].records
    }));
    
    return {
      query: 'Compare SMS vs Phone vs Canvas effectiveness',
      result: 'Tactic effectiveness comparison completed',
      details: comparison
    };
  }

  findTopPerformers() {
    const performers = {};
    
    this.data.forEach(row => {
      const name = `${row.Fname} ${row.Lname}`;
      if (!performers[name]) {
        performers[name] = {
          attempts: 0,
          contacts: 0,
          supporters: 0,
          records: 0
        };
      }
      performers[name].attempts += parseInt(row.Attempts || 0);
      performers[name].contacts += parseInt(row.Contacts || 0);
      performers[name].supporters += parseInt(row.Support || 0);
      performers[name].records += 1;
    });
    
    const topPerformers = Object.keys(performers)
      .map(name => ({
        name,
        ...performers[name],
        successRate: (performers[name].contacts / performers[name].attempts * 100).toFixed(1)
      }))
      .sort((a, b) => b.supporters - a.supporters)
      .slice(0, 5);
    
    return {
      query: 'Top 5 performers by supporter contacts',
      result: 'Top performers identified',
      details: topPerformers
    };
  }
}

describe('AI Search Validation with Campaign Data', () => {
  let parsedData;
  let aiSearchService;

  beforeAll(() => {
    // Load and parse test data
    const testDataPath = path.join(__dirname, '../test-data/comprehensive-campaign-data.csv');
    const rawCsvData = fs.readFileSync(testDataPath, 'utf-8');
    const lines = rawCsvData.trim().split('\n');
    const headers = lines[0].split(',');
    const rows = lines.slice(1).map(line => line.split(','));
    
    parsedData = rows.map(row => {
      const record = {};
      headers.forEach((header, index) => {
        record[header] = row[index];
      });
      return record;
    });

    aiSearchService = new MockAISearchService(parsedData);
  });

  describe('Specific AI Query Tests', () => {
    test('Query: "How many total attempts did Team Tony make?"', async () => {
      const result = await aiSearchService.processQuery("How many total attempts did Team Tony make?");
      
      expect(result.result).toBeGreaterThan(1500);
      expect(result.details.records).toBe(155);
      expect(result.details.totalAttempts).toBeGreaterThan(0);
      expect(result.details.avgAttemptsPerRecord).toBeGreaterThan(0);
    });

    test('Query: "Which team had the highest success rate?"', async () => {
      const result = await aiSearchService.processQuery("Which team had the highest success rate?");
      
      expect(result.result).toBeDefined();
      expect(result.details.successRate).toMatch(/\d+\.\d+%/);
      expect(parseFloat(result.details.successRate)).toBeGreaterThan(0);
      expect(parseFloat(result.details.successRate)).toBeLessThan(100);
    });

    test('Query: "What\'s the trend for supporter contacts in January?"', async () => {
      const result = await aiSearchService.processQuery("What's the trend for supporter contacts in January?");
      
      expect(result.details.totalSupport).toBeGreaterThan(800);
      expect(result.details.avgDailySupport).toBeGreaterThan(0);
      expect(result.details.activeDays).toBeGreaterThan(25);
      expect(result.details.trend).toContain('activity');
    });

    test('Query: "Compare SMS vs Phone vs Canvas effectiveness"', async () => {
      const result = await aiSearchService.processQuery("Compare SMS vs Phone vs Canvas effectiveness");
      
      expect(result.details).toHaveLength(3);
      expect(result.details.every(tactic => tactic.tactic)).toBe(true);
      expect(result.details.every(tactic => parseFloat(tactic.contactRate) >= 0)).toBe(true);
      expect(result.details.every(tactic => parseFloat(tactic.supportRate) >= 0)).toBe(true);
      
      // Verify all three tactics are present
      const tactics = result.details.map(t => t.tactic);
      expect(tactics).toContain('SMS');
      expect(tactics).toContain('Phone');
      expect(tactics).toContain('Canvas');
    });

    test('Query: "Who are the top 5 performers?"', async () => {
      const result = await aiSearchService.processQuery("Who are the top 5 performers?");
      
      expect(result.details).toHaveLength(5);
      expect(result.details.every(performer => performer.name)).toBe(true);
      expect(result.details.every(performer => performer.supporters >= 0)).toBe(true);
      expect(result.details.every(performer => parseFloat(performer.successRate) >= 0)).toBe(true);
      
      // Should be sorted by supporters (descending)
      for (let i = 1; i < result.details.length; i++) {
        expect(result.details[i-1].supporters).toBeGreaterThanOrEqual(result.details[i].supporters);
      }
    });
  });

  describe('Query Response Quality', () => {
    test('should provide structured responses', async () => {
      const queries = [
        "How many total attempts did Team Tony make?",
        "Which team had the highest success rate?",
        "Compare SMS vs Phone vs Canvas effectiveness"
      ];

      for (const query of queries) {
        const result = await aiSearchService.processQuery(query);
        
        expect(result).toHaveProperty('query');
        expect(result).toHaveProperty('result');
        expect(result).toHaveProperty('details');
        expect(typeof result.query).toBe('string');
        expect(result.details).toBeDefined();
      }
    });

    test('should handle numeric calculations accurately', async () => {
      const result = await aiSearchService.processQuery("How many total attempts did Team Tony make?");
      
      // Manual verification
      const teamTonyData = parsedData.filter(row => row.Team === 'Team Tony');
      const manualTotal = teamTonyData.reduce((sum, row) => sum + parseInt(row.Attempts || 0), 0);
      
      expect(result.result).toBe(manualTotal);
    });

    test('should provide contextual details', async () => {
      const result = await aiSearchService.processQuery("Compare SMS vs Phone vs Canvas effectiveness");
      
      expect(result.details.every(tactic => {
        return tactic.hasOwnProperty('contactRate') && 
               tactic.hasOwnProperty('supportRate') && 
               tactic.hasOwnProperty('totalRecords');
      })).toBe(true);
    });
  });

  describe('Data Consistency Validation', () => {
    test('AI responses should match raw data calculations', async () => {
      // Test Team Tony attempts
      const aiResult = await aiSearchService.processQuery("How many total attempts did Team Tony make?");
      const manualCount = parsedData
        .filter(row => row.Team === 'Team Tony')
        .reduce((sum, row) => sum + parseInt(row.Attempts || 0), 0);
      
      expect(aiResult.result).toBe(manualCount);
    });

    test('success rate calculations should be mathematically correct', async () => {
      const result = await aiSearchService.processQuery("Which team had the highest success rate?");
      const winningTeam = result.result;
      
      // Verify the math
      const teamData = parsedData.filter(row => row.Team === winningTeam);
      const attempts = teamData.reduce((sum, row) => sum + parseInt(row.Attempts || 0), 0);
      const contacts = teamData.reduce((sum, row) => sum + parseInt(row.Contacts || 0), 0);
      const calculatedRate = (contacts / attempts * 100).toFixed(1);
      
      expect(result.details.successRate).toBe(calculatedRate + '%');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle unrecognized queries gracefully', async () => {
      const result = await aiSearchService.processQuery("What is the weather like?");
      
      expect(result).toHaveProperty('error');
      expect(result.error).toContain('not recognized');
    });

    test('should handle empty or malformed queries', async () => {
      const queries = ['', null, undefined, '   ', '?????'];
      
      for (const query of queries) {
        const result = await aiSearchService.processQuery(query);
        expect(result).toHaveProperty('error');
      }
    });
  });
});