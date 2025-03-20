
import { Button } from '@/components/ui/button';
import { useReportIssue } from '@/lib/issue-log/useReportIssue';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ReportChartIssueButtonProps {
  chartType: string;
  actualData: Array<{ name: string; value: number }>;
  expectedTotal: number;
  className?: string;
}

export const ReportChartIssueButton = ({
  chartType,
  actualData,
  expectedTotal,
  className = ''
}: ReportChartIssueButtonProps) => {
  const { reportPieChartCalculationIssue, isReporting } = useReportIssue();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Convert the actual data to a simple record for reporting
  const actualValues = actualData.reduce((acc, item) => {
    acc[item.name] = item.value;
    return acc;
  }, {} as Record<string, number>);
  
  // Create the expected values based on the currently known issue
  // This is a simplified example - in a real app, you'd calculate this from the raw data
  const expectedValues: Record<string, number> = {
    total: expectedTotal
  };
  
  const handleReportIssue = async () => {
    console.log(`Reporting ${chartType} chart issue:`, { actualValues, expectedValues });
    
    const issue = await reportPieChartCalculationIssue(chartType, expectedValues, actualValues);
    
    if (issue) {
      toast({
        title: "Issue reported",
        description: `The ${chartType} chart calculation issue has been logged.`,
        variant: "default"
      });
      
      // Navigate to the issue detail page
      navigate(`/issues/${issue.id}`);
    } else {
      toast({
        title: "Failed to report issue",
        description: "There was a problem adding the issue to the issue log.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleReportIssue}
      disabled={isReporting}
      className={`flex items-center gap-1 ${className}`}
    >
      <AlertTriangle className="h-3 w-3" />
      {isReporting ? "Reporting..." : `Report ${chartType} Issue`}
    </Button>
  );
};
