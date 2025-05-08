
import { Database, ChevronRight } from 'lucide-react';

interface IntegrationOptionProps {
  title: string;
  description: string;
  onClick: () => void;
}

export const IntegrationOption = ({ title, description, onClick }: IntegrationOptionProps) => {
  return (
    <div 
      className="p-6 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Database className="w-8 h-8 text-blue-600" />
          <h3 className="text-lg font-medium">{title}</h3>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400" />
      </div>
      <p className="mt-3 text-sm text-gray-500">
        {description}
      </p>
    </div>
  );
};
