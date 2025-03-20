
import React from 'react';
import { TacticsPieChart } from './TacticsPieChart';
import { ContactsPieChart } from './ContactsPieChart';
import { NotReachedPieChart } from './NotReachedPieChart';

interface PieChartsRowProps {
  tacticsData: Array<{ name: string; value: number; color: string }>;
  contactsData: Array<{ name: string; value: number; color: string }>;
  notReachedData: Array<{ name: string; value: number; color: string }>;
  totalAttempts: number;
  totalContacts: number;
  totalNotReached: number;
}

export const PieChartsRow: React.FC<PieChartsRowProps> = ({
  tacticsData,
  contactsData,
  notReachedData,
  totalAttempts,
  totalContacts,
  totalNotReached
}) => {
  return (
    <div id="pie-charts-row" className="grid grid-cols-1 md:grid-cols-3 gap-4 print:flex print:flex-row print:justify-between print:gap-1">
      {/* Chart 1: Tactics Distribution */}
      <div className="pie-chart-container print:w-[32%] print:min-w-[32%] print:max-w-[32%]">
        <TacticsPieChart data={tacticsData} total={totalAttempts} />
      </div>
      
      {/* Chart 2: Contact Results */}
      <div className="pie-chart-container print:w-[32%] print:min-w-[32%] print:max-w-[32%]">
        <ContactsPieChart data={contactsData} total={totalContacts} />
      </div>
      
      {/* Chart 3: Not Reached Breakdown */}
      <div className="pie-chart-container print:w-[32%] print:min-w-[32%] print:max-w-[32%]">
        <NotReachedPieChart data={notReachedData} total={totalNotReached} />
      </div>
    </div>
  );
};
