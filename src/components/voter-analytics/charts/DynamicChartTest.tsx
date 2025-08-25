import React from 'react';
import { DynamicChartAdapter } from './DynamicChartAdapter';

// Test data with various tactics and result types
const testData = [
  {
    id: 1,
    date: '2024-01-15',
    tactic: 'SMS',
    attempts: 150,
    contacts: 45,
    support: 20,
    oppose: 10,
    undecided: 15,
    not_home: 30,
    refusal: 25,
    bad_data: 50,
    team: 'Team Alpha',
    first_name: 'John',
    last_name: 'Doe'
  },
  {
    id: 2,
    date: '2024-01-15',
    tactic: 'Phone',
    attempts: 120,
    contacts: 50,
    support: 25,
    oppose: 15,
    undecided: 10,
    not_home: 20,
    refusal: 30,
    bad_data: 20,
    team: 'Team Beta',
    first_name: 'Jane',
    last_name: 'Smith'
  },
  {
    id: 3,
    date: '2024-01-15',
    tactic: 'Canvas',
    attempts: 80,
    contacts: 35,
    support: 20,
    oppose: 8,
    undecided: 7,
    not_home: 15,
    refusal: 20,
    bad_data: 10,
    team: 'Team Gamma',
    first_name: 'Bob',
    last_name: 'Johnson'
  },
  {
    id: 4,
    date: '2024-01-16',
    tactic: 'Email',
    attempts: 200,
    contacts: 60,
    support: 30,
    oppose: 15,
    undecided: 15,
    not_home: 40,
    refusal: 50,
    bad_data: 50,
    team: 'Team Delta',
    first_name: 'Alice',
    last_name: 'Brown'
  },
  {
    id: 5,
    date: '2024-01-16',
    tactic: 'Digital Ads',
    attempts: 300,
    contacts: 90,
    support: 50,
    oppose: 20,
    undecided: 20,
    not_home: 60,
    refusal: 80,
    bad_data: 70,
    team: 'Team Echo',
    first_name: 'Charlie',
    last_name: 'Wilson'
  }
];

export const DynamicChartTest: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-center mb-6">Dynamic Chart System Test</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tactics Chart */}
        <DynamicChartAdapter
          data={testData}
          title="All Tactics (Dynamic)"
          primaryField="tactic"
          valueField="attempts"
          chartType="pie"
          categoryType="tactics"
          groupBy="tactic"
          aggregationType="sum"
          height={400}
        />

        {/* Contact Results Chart */}
        <DynamicChartAdapter
          data={testData.flatMap(item => [
            { name: 'Support', value: item.support, type: 'contact' },
            { name: 'Oppose', value: item.oppose, type: 'contact' },
            { name: 'Undecided', value: item.undecided, type: 'contact' }
          ])}
          title="Contact Results"
          primaryField="name"
          valueField="value"
          chartType="bar"
          categoryType="contacts"
          groupBy="name"
          aggregationType="sum"
          height={400}
        />

        {/* Team Performance Chart */}
        <DynamicChartAdapter
          data={testData}
          title="Team Performance"
          primaryField="team"
          valueField="contacts"
          chartType="bar"
          categoryType="teams"
          groupBy="team"
          aggregationType="sum"
          height={400}
        />

        {/* Time Series Chart */}
        <DynamicChartAdapter
          data={testData}
          title="Daily Activity"
          primaryField="date"
          valueField="attempts"
          chartType="line"
          categoryType="general"
          height={400}
        />

        {/* Auto-detect Chart Type */}
        <div className="lg:col-span-2">
          <DynamicChartAdapter
            data={testData}
            title="Auto-Detected Chart (All Data)"
            chartType="auto"
            categoryType="general"
            height={400}
          />
        </div>
      </div>

      {/* Raw Data Preview */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Sample Data Structure</h3>
        <pre className="text-sm overflow-x-auto">
          {JSON.stringify(testData[0], null, 2)}
        </pre>
      </div>
    </div>
  );
};