
import React from 'react';
import { TacticsPieChart } from './TacticsPieChart';
import { ContactsPieChart } from './ContactsPieChart';
import { NotReachedPieChart } from './NotReachedPieChart';

interface PieChartsRowProps {
  tacticsData: any[];
  contactsData: any[];
  notReachedData: any[];
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <TacticsPieChart 
        data={tacticsData || []} 
        total={totalAttempts || 0} 
      />
      <ContactsPieChart 
        data={contactsData || []} 
        total={totalContacts || 0} 
      />
      <NotReachedPieChart 
        data={notReachedData || []} 
        total={totalNotReached || 0} 
      />
    </div>
  );
};
