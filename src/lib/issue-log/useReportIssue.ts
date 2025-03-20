import { useState } from 'react';
import { useErrorLogger } from '@/hooks/useErrorLogger';
import { 
  logNotReachedPieChartIssue, 
  logNotReachedPieChartSolution,
  logYAxisStretchIssue,
  logYAxisStretchSolution,
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

  const reportPieChartCalculationIssue = async (chartType: string, expectedValues: Record<string, number>, actualValues: Record<string, number>) => {
    try {
      setIsReporting(true);
      
      // Log a detailed issue with specific values
      const issueDescription = `${chartType} pie chart calculations are incorrect.
Expected: ${JSON.stringify(expectedValues)}
Actual: ${JSON.stringify(actualValues)}`;
      
      // In a real implementation, you would send this to your issue tracking system
      console.log("Reporting calculation issue:", issueDescription);
      
      // Create a placeholder issue object that matches the Issue type structure
      const issue: Issue = {
        id: parseInt(Date.now().toString()),
        title: `${chartType} Chart Calculation Issue`,
        description: issueDescription,
        date_reported: new Date().toISOString(),
        expected_behavior: `Chart should show: ${JSON.stringify(expectedValues)}`,
        actual_behavior: `Chart is showing: ${JSON.stringify(actualValues)}`,
        console_logs: null,
        theories: "Possible data type conversion issues or calculation errors in the chart component.",
        status: 'open',
        resolution: null,
        component: `${chartType}PieChart.tsx`,
        reference_links: null,
        last_updated: new Date().toISOString()
      };
      
      setReportedIssue(issue);
      return issue;
      
    } catch (error) {
      logError(error as Error, 'useReportIssue.reportPieChartCalculationIssue');
      return null;
    } finally {
      setIsReporting(false);
    }
  };

  const reportYAxisStretchIssue = async () => {
    try {
      setIsReporting(true);
      
      // Log the issue
      const issue = await logYAxisStretchIssue();
      setReportedIssue(issue);
      
      // Log the attempted solution if we have an issue ID
      if (issue?.id) {
        await logYAxisStretchSolution(issue.id);
      }
      
      return issue;
    } catch (error) {
      logError(error as Error, 'useReportIssue.reportYAxisStretchIssue');
      return null;
    } finally {
      setIsReporting(false);
    }
  };

  return {
    isReporting,
    reportedIssue,
    reportNotReachedPieChartIssue,
    reportPieChartCalculationIssue,
    reportYAxisStretchIssue
  };
};
