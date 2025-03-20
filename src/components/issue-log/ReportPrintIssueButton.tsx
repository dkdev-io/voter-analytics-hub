
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Printer } from 'lucide-react';
import { logPrintingIssue } from '@/lib/issue-log/issueLogService';
import { useErrorLogger } from '@/hooks/useErrorLogger';

interface ReportPrintIssueButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export const ReportPrintIssueButton = ({ 
  variant = 'outline', 
  size = 'sm',
  className = '' 
}: ReportPrintIssueButtonProps) => {
  const [isReporting, setIsReporting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { logError } = useErrorLogger();
  
  const handleReportIssue = async () => {
    try {
      setIsReporting(true);
      const issue = await logPrintingIssue();
      
      if (issue) {
        toast({
          title: "Print issue reported",
          description: "The print functionality issue has been added to the issue log.",
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
    } catch (error) {
      logError(error as Error, 'ReportPrintIssueButton.handleReportIssue');
      toast({
        title: "Error",
        description: "An unexpected error occurred while reporting the issue.",
        variant: "destructive"
      });
    } finally {
      setIsReporting(false);
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
      <Printer className="h-4 w-4" /> 
      {isReporting ? "Reporting..." : "Report Print Issue"}
    </Button>
  );
};
