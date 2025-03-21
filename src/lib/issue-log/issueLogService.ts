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

    if (solution.successful) {
      await updateIssueStatus(solution.issue_id, 'resolved');
    }

    return data;
  } catch (error) {
    console.error('Error in addSolutionAttempt:', error);
    return null;
  }
};

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

export const logNotReachedPieChartIssue = async (): Promise<Issue | null> => {
  try {
    const { data, error } = await supabase
      .from('issue_log')
      .insert({
        title: "Not Reached Pie Chart Data Calculation Issues",
        description: "The Not Reached pie chart is not calculating or displaying the correct totals. The dataset shows 2069 total not reached, with 561 refusals, 579 not home, and 929 bad data, but the chart shows incorrect values.",
        expected_behavior: "The pie chart should show the correct total (2069) and correctly display the breakdown of not reached contacts: 579 not home, 561 refusals, and 929 bad data.",
        actual_behavior: "The pie chart shows incorrect totals and breakdown. Even after code changes to fix calculation issues in NotReachedPieChart.tsx and calculationService.ts, the chart still displays incorrect values.",
        console_logs: "NotReachedPieChart data: [{name: 'Not Home', value: incorrectValue, color: '#9333EA'}, {name: 'Refusal', value: incorrectValue, color: '#F97316'}, {name: 'Bad Data', value: incorrectValue, color: '#6B7280'}]\nNotReachedPieChart calculated total: incorrectValue\nNotReachedPieChart passed total: incorrectValue\nNot Reached aggregation details: {notHome: incorrectValue, refusal: incorrectValue, badData: incorrectValue}",
        theories: "1. Data conversion issues: The 'not_home', 'refusal', and 'bad_data' values might not be properly converted to numbers during aggregation.\n2. Double-counting: The metrics might be getting reset or double-counted during data processing.\n3. Data type mismatch: Values might be treated as strings during addition operations.\n4. Total calculation: The pie chart component might not be correctly calculating its own total from the data points.\n5. Data source issue: The metrics structure might not be properly initialized.",
        component: "NotReachedPieChart.tsx, calculationService.ts, DataLoader.tsx",
        reference_links: null,
        status: "open"
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding Not Reached pie chart issue:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in logNotReachedPieChartIssue:', error);
    return null;
  }
};

export const logNotReachedPieChartSolution = async (issueId: number): Promise<SolutionAttempt | null> => {
  try {
    const { data, error } = await supabase
      .from('solution_attempts')
      .insert({
        issue_id: issueId,
        description: "Made the following changes to fix the Not Reached pie chart:\n1. Updated NotReachedPieChart.tsx to use the calculated total from data with additional debug logging.\n2. Modified calculationService.ts to ensure explicit Number conversion for not_home, refusal, and bad_data values.\n3. Updated DataLoader.tsx to calculate the total not reached value with null checks and added more detailed logging.",
        result: "The changes did not fix the issue. The pie chart still displays incorrect totals and breakdown values. Debug logs showed that the calculation logic was updated, but the displayed values remained incorrect.",
        successful: false
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding Not Reached pie chart solution attempt:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in logNotReachedPieChartSolution:', error);
    return null;
  }
};

export const logYAxisStretchIssue = async (): Promise<Issue | null> => {
  try {
    const { data, error } = await supabase
      .from('issue_log')
      .insert({
        title: "Chart Y-Axis Not Stretching in Print View",
        description: "When printing individual charts, the Y-axis does not properly stretch to fill the entire screen, making the chart appear smaller than desired and harder to read.",
        expected_behavior: "The Y-axis should stretch vertically to fill the entire printable area, with the chart scaling appropriately to use all available space on the printed page.",
        actual_behavior: "The Y-axis remains at its default size and does not stretch to fill the available vertical space. The chart appears smaller than expected in the printout.",
        console_logs: null,
        theories: "1. CSS transformation and SVG viewBox settings may not be properly applying in print context.\n2. The Recharts Y-axis component might need specific print-mode styling that our current approach isn't addressing.\n3. The PrintChart component's container sizing or hierarchy might be preventing proper Y-axis expansion.\n4. The @media print CSS rules may be conflicting or not targeting the right elements.",
        component: "PrintChart.tsx",
        reference_links: null,
        status: "open"
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding Y-axis stretch issue:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in logYAxisStretchIssue:', error);
    return null;
  }
};

export const logYAxisStretchSolution = async (issueId: number): Promise<SolutionAttempt | null> => {
  try {
    const { data, error } = await supabase
      .from('solution_attempts')
      .insert({
        issue_id: issueId,
        description: "Attempted multiple styling approaches to fix the Y-axis stretching issue:\n1. Adjusted container dimensions and positioning with fixed height/width.\n2. Modified SVG viewBox attributes and preserveAspectRatio to control scaling.\n3. Added specific styles targeting .recharts-yAxis elements.\n4. Increased the transform scale values for the chart.\n5. Added print-specific CSS to maximize chart size in print view.\n6. Added specific styling for axes, including increased stroke width and forced height properties.\n7. Applied special styling to all Recharts elements to ensure they expand properly.",
        result: "The changes did not resolve the issue. The Y-axis still does not properly stretch to fill the entire screen in print view. The chart remains smaller than desired in the printout.",
        successful: false
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding Y-axis stretch solution attempt:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in logYAxisStretchSolution:', error);
    return null;
  }
};

export const logCSVUploadDialogIssue = async (): Promise<Issue | null> => {
  try {
    const { data, error } = await supabase
      .from('issue_log')
      .insert({
        title: "CSV Upload Dialog Prop Interface Mismatch",
        description: "The CSVUploadDialog component has a prop interface mismatch causing TypeScript errors. DashboardHeader.tsx expects an 'onOpenChange' prop, but the component defines an 'onClose' prop.",
        expected_behavior: "The CSVUploadDialog component should accept an 'onOpenChange' prop of type '(open: boolean) => void' to match how it's being used in DashboardHeader.tsx.",
        actual_behavior: "TypeScript error: 'Property 'onOpenChange' does not exist on type 'IntrinsicAttributes & CSVUploadDialogProps'. This occurs despite updating the interface in CSVUploadDialog.tsx.",
        console_logs: "src/components/voter-analytics/dashboard/DashboardHeader.tsx(99,9): error TS2322: Type '{ open: boolean; onOpenChange: Dispatch<SetStateAction<boolean>>; onSuccess: () => Promise<void>; }' is not assignable to type 'IntrinsicAttributes & CSVUploadDialogProps'.",
        theories: "1. Possible circular imports causing TypeScript to use stale definitions.\n2. Build system caching old type definitions.\n3. Wrong file being modified (multiple CSVUploadDialog components).\n4. Import resolution issues between components.\n5. Mismatch between what's being imported and what's being modified.",
        component: "CSVUploadDialog.tsx, DashboardHeader.tsx",
        reference_links: null,
        status: "open"
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding CSV Upload Dialog issue:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in logCSVUploadDialogIssue:', error);
    return null;
  }
};

export const logCSVUploadDialogSolution = async (issueId: number): Promise<SolutionAttempt | null> => {
  try {
    const { data, error } = await supabase
      .from('solution_attempts')
      .insert({
        issue_id: issueId,
        description: "Made the following changes to fix the CSVUploadDialog interface:\n1. Updated CSVUploadDialogProps interface to change 'onClose: () => void' to 'onOpenChange: (open: boolean) => void'\n2. Updated component parameter destructuring to use 'onOpenChange' instead of 'onClose'\n3. Modified the handleClose function to call 'onOpenChange(false)' instead of 'onClose()'\n4. Updated the Cancel button's onClick to use handleClose instead of directly calling onClose",
        result: "The changes did not resolve the issue. TypeScript error still persists suggesting either build caching issues, incorrect file modification, or import resolution problems. The interface update was made to src/components/voter-analytics/CSVUploadDialog.tsx but may not be affecting the component that's actually being imported by DashboardHeader.tsx.",
        successful: false
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding CSV Upload Dialog solution attempt:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in logCSVUploadDialogSolution:', error);
    return null;
  }
};
