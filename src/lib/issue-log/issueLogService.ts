import { supabase } from '@/integrations/supabase/client';

export interface Issue {
  id: number;
  title: string;
  description: string;
  date_reported: string;
  expected_behavior: string | null;
  actual_behavior: string | null;
  console_logs: string | null;
  theories: string | null;
  status: string;
  resolution: string | null;
  component: string | null;
  reference_links: string | null;
  last_updated: string;
}

export interface SolutionAttempt {
  id: number;
  issue_id: number;
  attempt_date: string;
  description: string;
  result: string;
  successful: boolean;
}

// Function to fetch all issues
export const fetchIssues = async (): Promise<Issue[]> => {
  try {
    const { data, error } = await supabase
      .from('issue_log')
      .select('*')
      .order('id', { ascending: false });

    if (error) {
      console.error('Error fetching issues:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchIssues:', error);
    return [];
  }
};

// Function to fetch a single issue with its solution attempts
export const fetchIssueWithSolutions = async (issueId: number): Promise<{ issue: Issue | null, solutions: SolutionAttempt[] }> => {
  try {
    const issueResponse = await supabase
      .from('issue_log')
      .select('*')
      .eq('id', issueId)
      .maybeSingle();

    const solutionsResponse = await supabase
      .from('solution_attempts')
      .select('*')
      .eq('issue_id', issueId)
      .order('attempt_date', { ascending: false });

    if (issueResponse.error) {
      console.error('Error fetching issue:', issueResponse.error);
      throw issueResponse.error;
    }

    if (solutionsResponse.error) {
      console.error('Error fetching solutions:', solutionsResponse.error);
      throw solutionsResponse.error;
    }

    return {
      issue: issueResponse.data,
      solutions: solutionsResponse.data || []
    };
  } catch (error) {
    console.error('Error in fetchIssueWithSolutions:', error);
    return { issue: null, solutions: [] };
  }
};

// Function to add a new issue
export const addIssue = async (issue: Omit<Issue, 'id' | 'date_reported' | 'status' | 'last_updated'>): Promise<Issue | null> => {
  try {
    const { data, error } = await supabase
      .from('issue_log')
      .insert({
        title: issue.title,
        description: issue.description,
        expected_behavior: issue.expected_behavior,
        actual_behavior: issue.actual_behavior,
        console_logs: issue.console_logs,
        theories: issue.theories,
        component: issue.component,
        reference_links: issue.reference_links,
        resolution: issue.resolution
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding issue:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in addIssue:', error);
    return null;
  }
};

// Function to add a solution attempt
export const addSolutionAttempt = async (solution: Omit<SolutionAttempt, 'id' | 'attempt_date'>): Promise<SolutionAttempt | null> => {
  try {
    const { data, error } = await supabase
      .from('solution_attempts')
      .insert({
        issue_id: solution.issue_id,
        description: solution.description,
        result: solution.result,
        successful: solution.successful
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding solution attempt:', error);
      throw error;
    }

    // If solution was successful, update the issue status
    if (solution.successful) {
      await updateIssueStatus(solution.issue_id, 'resolved');
    }

    return data;
  } catch (error) {
    console.error('Error in addSolutionAttempt:', error);
    return null;
  }
};

// Function to update issue status
export const updateIssueStatus = async (issueId: number, status: string, resolution?: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('issue_log')
      .update({ 
        status: status,
        resolution: resolution,
        last_updated: new Date().toISOString()
      })
      .eq('id', issueId);

    if (error) {
      console.error('Error updating issue status:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error in updateIssueStatus:', error);
    return false;
  }
};

// Function to log the report printing issue
export const logPrintingIssue = async (): Promise<Issue | null> => {
  try {
    const { data, error } = await supabase
      .from('issue_log')
      .insert({
        title: "Voter Analytics Report Print Functionality Issues",
        description: "The print functionality in the voter analytics dashboard has several issues that need to be fixed.",
        expected_behavior: "When printing a report: 1) Only the report content should be visible (no sidebar/search options), 2) Numbers should have thousand separators, 3) Cumulative progress chart should show proper growth curves, not straight lines, 4) Print button should be properly positioned at the bottom of the page.",
        actual_behavior: "1) Search Options panel still appears in printed output, 2) Some numbers lack thousand separators, 3) Cumulative chart shows incorrect data plotting, 4) Print button positioning may be incorrect.",
        console_logs: null,
        theories: "The PrintStylesheet component may not be correctly targeting and hiding elements. The CumulativeLineChart component may have calculation issues. Number formatting may be inconsistent across components.",
        component: "PrintReport.tsx, PrintStylesheet.tsx, CumulativeLineChart.tsx",
        reference_links: null,
        status: "open"
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding printing issue:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in logPrintingIssue:', error);
    return null;
  }
};
