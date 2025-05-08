
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface ChartModeToggleProps {
  showDailyData: boolean;
  onToggle: (checked: boolean) => void;
}

export const ChartModeToggle: React.FC<ChartModeToggleProps> = ({
  showDailyData,
  onToggle,
}) => {
  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="daily-toggle"
        checked={showDailyData}
        onCheckedChange={onToggle}
      />
      <Label htmlFor="daily-toggle" className="text-xs">
        Show Daily Data
      </Label>
    </div>
  );
};
