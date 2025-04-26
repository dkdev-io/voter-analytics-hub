
import React from 'react';
import { TacticsPieChart } from './TacticsPieChart';
import { ContactsPieChart } from './ContactsPieChart';

interface PieChartsRowProps {
  tacticsData: any[];
  contactsData: any[];
  totalAttempts: number;
  totalContacts: number;
}

export const PieChartsRow: React.FC<PieChartsRowProps> = ({
  tacticsData,
  contactsData,
  totalAttempts,
  totalContacts,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <TacticsPieChart 
        data={tacticsData || []} 
        total={totalAttempts || 0} 
      />
      <ContactsPieChart 
        data={contactsData || []} 
        total={totalContacts || 0} 
      />
    </div>
  );
};
