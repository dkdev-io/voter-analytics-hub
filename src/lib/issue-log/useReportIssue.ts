
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

  return {
    isReporting,
    reportedIssue,
    reportNotReachedPieChartIssue
  };
};
