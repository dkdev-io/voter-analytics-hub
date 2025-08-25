/**
 * Chart Rendering Validation Suite
 * Tests dynamic chart generation with realistic campaign data
 */

import { describe, test, expect, beforeAll } from '@jest/globals';
import fs from 'fs';
import path from 'path';

// Import chart utilities
import { generateColorPalette, getCategoryColor } from '../src/utils/chartColorGenerator.js';
import { analyzeDataStructure } from '../src/services/dynamicChartService.js';

// Mock React Chart components for testing
class MockChartRenderer {
  constructor(data) {
    this.data = data;
  }

  generateTeamsPieChart() {
    const teamCounts = {};
    this.data.forEach(row => {
      teamCounts[row.Team] = (teamCounts[row.Team] || 0) + 1;
    });

    const chartData = Object.keys(teamCounts).map((team, index) => ({
      name: team,
      value: teamCounts[team],
      color: getCategoryColor(team, index)
    }));

    return {
      type: 'pie',
      data: chartData,
      total: this.data.length,
      title: 'Team Distribution'
    };
  }

  generateTacticsPieChart() {
    const tacticCounts = {};
    this.data.forEach(row => {
      tacticCounts[row.Tactic] = (tacticCounts[row.Tactic] || 0) + 1;
    });

    const chartData = Object.keys(tacticCounts).map((tactic, index) => ({
      name: tactic,
      value: tacticCounts[tactic],
      color: getCategoryColor(tactic, index)
    }));

    return {
      type: 'pie',
      data: chartData,
      total: this.data.length,
      title: 'Tactic Distribution'
    };
  }

  generateActivityLineChart() {
    const dailyActivity = {};
    
    this.data.forEach(row => {
      const date = row.Date;
      if (!dailyActivity[date]) {
        dailyActivity[date] = {
          date,
          attempts: 0,
          contacts: 0,
          supporters: 0
        };
      }
      dailyActivity[date].attempts += parseInt(row.Attempts || 0);
      dailyActivity[date].contacts += parseInt(row.Contacts || 0);
      dailyActivity[date].supporters += parseInt(row.Support || 0);
    });

    const chartData = Object.keys(dailyActivity)
      .sort()
      .map(date => dailyActivity[date]);

    return {
      type: 'line',
      data: chartData,
      title: 'Daily Activity Trends',
      xAxis: 'date',
      yAxes: ['attempts', 'contacts', 'supporters']
    };
  }

  generateCumulativeChart() {
    const dailyTotals = {};
    
    this.data.forEach(row => {
      const date = row.Date;
      if (!dailyTotals[date]) {
        dailyTotals[date] = {
          attempts: 0,
          contacts: 0,
          supporters: 0
        };
      }
      dailyTotals[date].attempts += parseInt(row.Attempts || 0);
      dailyTotals[date].contacts += parseInt(row.Contacts || 0);
      dailyTotals[date].supporters += parseInt(row.Support || 0);
    });

    // Convert to cumulative
    let cumulativeAttempts = 0;
    let cumulativeContacts = 0;
    let cumulativeSupporters = 0;

    const chartData = Object.keys(dailyTotals)
      .sort()
      .map(date => {
        cumulativeAttempts += dailyTotals[date].attempts;
        cumulativeContacts += dailyTotals[date].contacts;
        cumulativeSupporters += dailyTotals[date].supporters;
        
        return {
          date,
          attempts: cumulativeAttempts,
          contacts: cumulativeContacts,
          supporters: cumulativeSupporters
        };
      });

    return {
      type: 'line',
      data: chartData,
      title: 'Cumulative Progress',
      xAxis: 'date',
      yAxes: ['attempts', 'contacts', 'supporters']
    };
  }

  generatePerformanceMetrics() {
    const teamMetrics = {};
    
    this.data.forEach(row => {
      const team = row.Team;
      if (!teamMetrics[team]) {
        teamMetrics[team] = {
          attempts: 0,
          contacts: 0,
          supporters: 0,
          records: 0
        };
      }
      teamMetrics[team].attempts += parseInt(row.Attempts || 0);
      teamMetrics[team].contacts += parseInt(row.Contacts || 0);
      teamMetrics[team].supporters += parseInt(row.Support || 0);
      teamMetrics[team].records += 1;
    });

    const performanceData = Object.keys(teamMetrics).map(team => ({
      team,
      contactRate: (teamMetrics[team].contacts / teamMetrics[team].attempts * 100).toFixed(1),
      supportRate: (teamMetrics[team].supporters / teamMetrics[team].contacts * 100).toFixed(1),
      totalAttempts: teamMetrics[team].attempts,
      totalContacts: teamMetrics[team].contacts,
      totalSupporters: teamMetrics[team].supporters
    }));

    return {
      type: 'performance',
      data: performanceData,
      title: 'Team Performance Metrics'
    };
  }
}

describe('Chart Rendering Validation', () => {
  let parsedData;
  let chartRenderer;

  beforeAll(() => {
    // Load test data
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

    chartRenderer = new MockChartRenderer(parsedData);
  });

  describe('1. Teams Pie Chart Validation', () => {
    test('should generate correct team distribution chart', () => {
      const chart = chartRenderer.generateTeamsPieChart();
      
      expect(chart.type).toBe('pie');
      expect(chart.data).toHaveLength(3); // 3 teams: Team Tony, Local Party, Candidate
      expect(chart.total).toBe(324);
      expect(chart.title).toBe('Team Distribution');
      
      // Verify team data
      const teamTony = chart.data.find(d => d.name === 'Team Tony');
      const localParty = chart.data.find(d => d.name === 'Local Party');
      const candidate = chart.data.find(d => d.name === 'Candidate');
      
      expect(teamTony).toBeDefined();
      expect(localParty).toBeDefined();
      expect(candidate).toBeDefined();
      
      expect(teamTony.value).toBe(155);
      expect(localParty.value).toBe(154);
      expect(candidate.value).toBe(15);
      
      // Verify colors are assigned
      expect(teamTony.color).toBeDefined();
      expect(localParty.color).toBeDefined();
      expect(candidate.color).toBeDefined();
    });

    test('should generate distinct colors for each team', () => {
      const chart = chartRenderer.generateTeamsPieChart();
      const colors = chart.data.map(d => d.color);
      const uniqueColors = new Set(colors);
      
      expect(uniqueColors.size).toBe(3); // All colors should be unique
    });
  });

  describe('2. Tactics Pie Chart Validation', () => {
    test('should generate correct tactic distribution chart', () => {
      const chart = chartRenderer.generateTacticsPieChart();
      
      expect(chart.type).toBe('pie');
      expect(chart.data).toHaveLength(3); // 3 tactics: SMS, Phone, Canvas
      expect(chart.total).toBe(324);
      expect(chart.title).toBe('Tactic Distribution');
      
      // Verify tactic data
      const sms = chart.data.find(d => d.name === 'SMS');
      const phone = chart.data.find(d => d.name === 'Phone');
      const canvas = chart.data.find(d => d.name === 'Canvas');
      
      expect(sms).toBeDefined();
      expect(phone).toBeDefined();
      expect(canvas).toBeDefined();
      
      expect(sms.value).toBe(111);
      expect(phone.value).toBe(110);
      expect(canvas.value).toBe(103);
      
      // Total should equal sum of parts
      const total = sms.value + phone.value + canvas.value;
      expect(total).toBe(324);
    });
  });

  describe('3. Activity Line Chart Validation', () => {
    test('should generate daily activity trends', () => {
      const chart = chartRenderer.generateActivityLineChart();
      
      expect(chart.type).toBe('line');
      expect(chart.title).toBe('Daily Activity Trends');
      expect(chart.xAxis).toBe('date');
      expect(chart.yAxes).toEqual(['attempts', 'contacts', 'supporters']);
      
      // Should have data for most days in January
      expect(chart.data.length).toBeGreaterThan(25);
      
      // Each data point should have required fields
      chart.data.forEach(point => {
        expect(point).toHaveProperty('date');
        expect(point).toHaveProperty('attempts');
        expect(point).toHaveProperty('contacts');
        expect(point).toHaveProperty('supporters');
        
        expect(point.attempts).toBeGreaterThanOrEqual(0);
        expect(point.contacts).toBeGreaterThanOrEqual(0);
        expect(point.supporters).toBeGreaterThanOrEqual(0);
        
        // Contacts should never exceed attempts
        expect(point.contacts).toBeLessThanOrEqual(point.attempts);
      });
    });

    test('should have dates in correct chronological order', () => {
      const chart = chartRenderer.generateActivityLineChart();
      const dates = chart.data.map(d => d.date);
      const sortedDates = [...dates].sort();
      
      expect(dates).toEqual(sortedDates);
      expect(dates[0]).toBe('2025-01-01');
      expect(dates[dates.length - 1]).toBe('2025-01-31');
    });
  });

  describe('4. Cumulative Chart Validation', () => {
    test('should generate cumulative progress chart', () => {
      const chart = chartRenderer.generateCumulativeChart();
      
      expect(chart.type).toBe('line');
      expect(chart.title).toBe('Cumulative Progress');
      expect(chart.xAxis).toBe('date');
      expect(chart.yAxes).toEqual(['attempts', 'contacts', 'supporters']);
      
      // Cumulative values should only increase or stay the same
      for (let i = 1; i < chart.data.length; i++) {
        const prev = chart.data[i - 1];
        const curr = chart.data[i];
        
        expect(curr.attempts).toBeGreaterThanOrEqual(prev.attempts);
        expect(curr.contacts).toBeGreaterThanOrEqual(prev.contacts);
        expect(curr.supporters).toBeGreaterThanOrEqual(prev.supporters);
      }
      
      // Final values should represent totals
      const final = chart.data[chart.data.length - 1];
      const expectedAttempts = parsedData.reduce((sum, row) => sum + parseInt(row.Attempts || 0), 0);
      const expectedContacts = parsedData.reduce((sum, row) => sum + parseInt(row.Contacts || 0), 0);
      const expectedSupporters = parsedData.reduce((sum, row) => sum + parseInt(row.Support || 0), 0);
      
      expect(final.attempts).toBe(expectedAttempts);
      expect(final.contacts).toBe(expectedContacts);
      expect(final.supporters).toBe(expectedSupporters);
    });
  });

  describe('5. Performance Metrics Validation', () => {
    test('should calculate team performance metrics correctly', () => {
      const metrics = chartRenderer.generatePerformanceMetrics();
      
      expect(metrics.type).toBe('performance');
      expect(metrics.title).toBe('Team Performance Metrics');
      expect(metrics.data).toHaveLength(3);
      
      metrics.data.forEach(teamData => {
        expect(teamData).toHaveProperty('team');
        expect(teamData).toHaveProperty('contactRate');
        expect(teamData).toHaveProperty('supportRate');
        expect(teamData).toHaveProperty('totalAttempts');
        expect(teamData).toHaveProperty('totalContacts');
        expect(teamData).toHaveProperty('totalSupporters');
        
        // Validate rates are percentages
        const contactRate = parseFloat(teamData.contactRate);
        const supportRate = parseFloat(teamData.supportRate);
        
        expect(contactRate).toBeGreaterThanOrEqual(0);
        expect(contactRate).toBeLessThanOrEqual(100);
        expect(supportRate).toBeGreaterThanOrEqual(0);
        expect(supportRate).toBeLessThanOrEqual(100);
        
        // Validate totals make sense
        expect(teamData.totalContacts).toBeLessThanOrEqual(teamData.totalAttempts);
        expect(teamData.totalSupporters).toBeLessThanOrEqual(teamData.totalContacts);
      });
    });
  });

  describe('6. Color Generation Validation', () => {
    test('should generate consistent colors for same categories', () => {
      const teams = ['Team Tony', 'Local Party', 'Candidate'];
      const colors1 = teams.map((team, i) => getCategoryColor(team, i));
      const colors2 = teams.map((team, i) => getCategoryColor(team, i));
      
      expect(colors1).toEqual(colors2);
    });

    test('should generate palette with sufficient colors', () => {
      const palette = generateColorPalette(10);
      
      expect(palette).toHaveLength(10);
      expect(new Set(palette).size).toBe(10); // All unique
      
      // Should be valid hex colors
      palette.forEach(color => {
        expect(color).toMatch(/^#[0-9A-F]{6}$/i);
      });
    });
  });

  describe('7. Data Structure Analysis', () => {
    test('should analyze data structure correctly', () => {
      const analysis = analyzeDataStructure(parsedData);
      
      expect(analysis.totalRecords).toBe(324);
      expect(analysis.hasTimeSeriesData).toBe(true);
      expect(analysis.uniqueCategories).toBeDefined();
      expect(analysis.fieldTypes).toBeDefined();
      expect(analysis.sampleData.length).toBeGreaterThan(0);
      
      // Should detect common field types
      expect(analysis.fieldTypes).toHaveProperty('Team');
      expect(analysis.fieldTypes).toHaveProperty('Tactic');
      expect(analysis.fieldTypes).toHaveProperty('Date');
    });
  });

  describe('8. Chart Responsiveness', () => {
    test('should handle data filtering correctly', () => {
      // Filter to Team Tony only
      const teamTonyData = parsedData.filter(row => row.Team === 'Team Tony');
      const filteredRenderer = new MockChartRenderer(teamTonyData);
      
      const chart = filteredRenderer.generateTeamsPieChart();
      expect(chart.data).toHaveLength(1);
      expect(chart.data[0].name).toBe('Team Tony');
      expect(chart.data[0].value).toBe(155);
    });

    test('should handle date range filtering', () => {
      // Filter to first week of January
      const weekOneData = parsedData.filter(row => {
        const date = new Date(row.Date);
        return date >= new Date('2025-01-01') && date <= new Date('2025-01-07');
      });
      
      const filteredRenderer = new MockChartRenderer(weekOneData);
      const chart = filteredRenderer.generateActivityLineChart();
      
      expect(chart.data.length).toBeLessThanOrEqual(7);
      chart.data.forEach(point => {
        const date = new Date(point.date);
        expect(date).toBeGreaterThanOrEqual(new Date('2025-01-01'));
        expect(date).toBeLessThanOrEqual(new Date('2025-01-07'));
      });
    });
  });

  describe('9. Chart Performance', () => {
    test('should generate charts within reasonable time', () => {
      const startTime = Date.now();
      
      const teamsChart = chartRenderer.generateTeamsPieChart();
      const tacticsChart = chartRenderer.generateTacticsPieChart();
      const activityChart = chartRenderer.generateActivityLineChart();
      const cumulativeChart = chartRenderer.generateCumulativeChart();
      const metricsChart = chartRenderer.generatePerformanceMetrics();
      
      const totalTime = Date.now() - startTime;
      
      expect(totalTime).toBeLessThan(100); // Should complete within 100ms
      expect(teamsChart).toBeDefined();
      expect(tacticsChart).toBeDefined();
      expect(activityChart).toBeDefined();
      expect(cumulativeChart).toBeDefined();
      expect(metricsChart).toBeDefined();
    });
  });
});