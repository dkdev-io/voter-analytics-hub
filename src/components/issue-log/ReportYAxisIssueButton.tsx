
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useReportIssue } from '@/lib/issue-log/useReportIssue';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

interface ReportYAxisIssueButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export const ReportYAxisIssueButton = ({ 
  variant = 'outline', 
  size = 'sm',
  className = '' 
}: ReportYAxisIssueButtonProps) => {
  const { reportYAxisStretchIssue, isReporting } = useReportIssue();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const handleReportIssue = async () => {
    const issue = await reportYAxisStretchIssue();
    
    if (issue) {
      toast({
        title: "Issue reported",
        description: "The Y-axis stretch issue has been added to the issue log.",
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
      variant={variant}
      size={size}
      onClick={handleReportIssue}
      disabled={isReporting}
      className={`flex items-center gap-1 ${className}`}
    >
      <AlertTriangle className="h-4 w-4" /> 
      {isReporting ? "Reporting..." : "Report Y-Axis Stretch Issue"}
    </Button>
  );
};
