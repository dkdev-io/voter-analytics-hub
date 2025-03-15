
import React from 'react';
import { DataMigrationAlert } from '../DataMigrationAlert';

interface DashboardHeaderProps {
  isDataMigrated: boolean;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ isDataMigrated }) => {
  return (
    <>
      <h1 className="text-2xl font-semibold text-gray-900 mb-2 text-center">Dashboard</h1>
      <p className="text-lg text-gray-700 mb-8 text-center italic">
        The first user friendly tool to help campaigns analyze their voter contact data.
      </p>
      
      <DataMigrationAlert isDataMigrated={isDataMigrated} />
    </>
  );
};
