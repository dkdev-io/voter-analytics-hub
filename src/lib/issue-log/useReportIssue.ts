
import { useState } from 'react';
import { useErrorLogger } from '@/hooks/useErrorLogger';
import { 
  logNotReachedPieChartIssue, 
  logNotReachedPieChartSolution,
  type Issue
} from './issueLogService';

export const useReportIssue = () => {
  const [isReporting, setIsReporting] = useState(false);
  const [reportedIssue, setReportedIssue] = useState<Issue | null>(null);
  const { logError } = useErrorLogger();

  const reportNotReachedPieChartIssue = async () => {
    try {
      setIsReporting(true);
      
      // Log the issue
      const issue = await logNotReachedPieChartIssue();
      setReportedIssue(issue);
      
      // Log the attempted solution if we have an issue ID
      if (issue?.id) {
        await logNotReachedPieChartSolution(issue.id);
      }
      
      return issue;
    } catch (error) {
      logError(error as Error, 'useReportIssue.reportNotReachedPieChartIssue');
      return null;
    } finally {
      setIsReporting(false);
    }
  };

  // Add a more specific function to report calculation issues
  const reportPieChartCalculationIssue = async (chartType: string, expectedValues: Record<string, number>, actualValues: Record<string, number>) => {
    try {
      setIsReporting(true);
      
      // Log a detailed issue with specific values
      const issueDescription = `${chartType} pie chart calculations are incorrect.
Expected: ${JSON.stringify(expectedValues)}
Actual: ${JSON.stringify(actualValues)}`;
      
      // In a real implementation, you would send this to your issue tracking system
      console.log("Reporting calculation issue:", issueDescription);
      
      // Create a placeholder issue object
      const issue = {
        id: Date.now().toString(),
        title: `${chartType} Chart Calculation Issue`,
        description: issueDescription,
        status: 'open',
        createdAt: new Date().toISOString()
      };
      
      setReportedIssue(issue as Issue);
      return issue as Issue;
      
    } catch (error) {
      logError(error as Error, 'useReportIssue.reportPieChartCalculationIssue');
      return null;
    } finally {
      setIsReporting(false);
    }
  };

  return {
    isReporting,
    reportedIssue,
    reportNotReachedPieChartIssue,
    reportPieChartCalculationIssue
  };
};
