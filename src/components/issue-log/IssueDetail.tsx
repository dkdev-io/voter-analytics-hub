
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchIssueWithSolutions, updateIssueStatus, addSolutionAttempt, Issue, SolutionAttempt } from '@/lib/issue-log/issueLogService';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { AlertCircle, CheckCircle, Clock, ArrowLeft } from 'lucide-react';

export const IssueDetail = () => {
  const { issueId } = useParams<{ issueId: string }>();
  const navigate = useNavigate();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [solutions, setSolutions] = useState<SolutionAttempt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form state for adding a solution
  const [newSolution, setNewSolution] = useState({
    description: '',
    result: '',
    successful: false
  });

  // State for showing additional details
  const [showLogs, setShowLogs] = useState(false);
  const [showTheories, setShowTheories] = useState(false);

  useEffect(() => {
    const loadIssue = async () => {
      if (!issueId) return;
      
      try {
        setIsLoading(true);
        const { issue: loadedIssue, solutions: loadedSolutions } = await fetchIssueWithSolutions(parseInt(issueId));
        
        if (loadedIssue) {
          setIssue(loadedIssue);
          setSolutions(loadedSolutions);
        } else {
          setError('Issue not found');
        }
      } catch (err) {
        console.error('Failed to load issue:', err);
        setError('Failed to load issue details. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    loadIssue();
  }, [issueId]);

  const handleStatusChange = async (newStatus: string) => {
    if (!issue) return;
    
    try {
      const success = await updateIssueStatus(issue.id, newStatus);
      if (success) {
        setIssue({ ...issue, status: newStatus });
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleSolutionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issue) return;
    
    try {
      const result = await addSolutionAttempt({
        issue_id: issue.id,
        description: newSolution.description,
        result: newSolution.result,
        successful: newSolution.successful
      });
      
      if (result) {
        setSolutions([result, ...solutions]);
        
        // If solution was successful, update the issue status
        if (newSolution.successful) {
          setIssue({ ...issue, status: 'resolved' });
        }
        
        // Reset form
        setNewSolution({
          description: '',
          result: '',
          successful: false
        });
      }
    } catch (err) {
      console.error('Failed to add solution:', err);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'in progress':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'resolved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading issue details...</div>;
  }

  if (error || !issue) {
    return (
      <div className="p-8">
        <div className="text-red-500 mb-4">{error || 'Issue not found'}</div>
        <Button onClick={() => navigate('/issues')} variant="outline" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Issues
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center mb-6">
        <Button 
          onClick={() => navigate('/issues')} 
          variant="outline" 
          size="sm"
          className="mr-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <h1 className="text-2xl font-bold flex-grow">{issue.title}</h1>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Issue Details</CardTitle>
            <Badge className={`flex items-center gap-1 ${
              issue.status === 'open' ? 'bg-yellow-500' :
              issue.status === 'in progress' ? 'bg-blue-500' :
              issue.status === 'resolved' ? 'bg-green-500' : 'bg-gray-500'
            }`}>
              {getStatusIcon(issue.status)} {issue.status}
            </Badge>
          </div>
          <CardDescription>
            Reported on {new Date(issue.date_reported).toLocaleDateString()}, 
            last updated {new Date(issue.last_updated).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium mb-1">Description</h3>
            <p className="text-sm whitespace-pre-line">{issue.description}</p>
          </div>

          {issue.component && (
            <div>
              <h3 className="font-medium mb-1">Affected Components</h3>
              <p className="text-sm">{issue.component}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {issue.expected_behavior && (
              <div>
                <h3 className="font-medium mb-1">Expected Behavior</h3>
                <p className="text-sm">{issue.expected_behavior}</p>
              </div>
            )}
            
            {issue.actual_behavior && (
              <div>
                <h3 className="font-medium mb-1">Actual Behavior</h3>
                <p className="text-sm">{issue.actual_behavior}</p>
              </div>
            )}
          </div>

          {issue.console_logs && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <h3 className="font-medium">Console Logs</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowLogs(!showLogs)}
                >
                  {showLogs ? 'Hide' : 'Show'}
                </Button>
              </div>
              {showLogs && (
                <pre className="text-xs bg-gray-800 text-white p-3 rounded overflow-x-auto">
                  {issue.console_logs}
                </pre>
              )}
            </div>
          )}

          {issue.theories && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <h3 className="font-medium">Potential Causes & Theories</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowTheories(!showTheories)}
                >
                  {showTheories ? 'Hide' : 'Show'}
                </Button>
              </div>
              {showTheories && (
                <div className="text-sm whitespace-pre-line">{issue.theories}</div>
              )}
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex flex-wrap gap-2">
          <Button 
            variant={issue.status === 'open' ? 'default' : 'outline'} 
            onClick={() => handleStatusChange('open')}
            size="sm"
          >
            Open
          </Button>
          <Button 
            variant={issue.status === 'in progress' ? 'default' : 'outline'} 
            onClick={() => handleStatusChange('in progress')}
            size="sm"
          >
            In Progress
          </Button>
          <Button 
            variant={issue.status === 'resolved' ? 'default' : 'outline'} 
            onClick={() => handleStatusChange('resolved')}
            size="sm"
          >
            Resolved
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Solution Attempts</CardTitle>
          <CardDescription>Record attempts to solve this issue</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSolutionSubmit} className="space-y-4">
            <div>
              <Label htmlFor="solution-description">What was tried?</Label>
              <Textarea 
                id="solution-description"
                placeholder="Describe what was attempted to fix the issue..."
                value={newSolution.description}
                onChange={(e) => setNewSolution({...newSolution, description: e.target.value})}
                className="min-h-[80px]"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="solution-result">What was the result?</Label>
              <Textarea 
                id="solution-result"
                placeholder="Describe the outcome of this attempt..."
                value={newSolution.result}
                onChange={(e) => setNewSolution({...newSolution, result: e.target.value})}
                className="min-h-[80px]"
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch 
                id="solution-success"
                checked={newSolution.successful}
                onCheckedChange={(checked) => setNewSolution({...newSolution, successful: checked})}
              />
              <Label htmlFor="solution-success">This solution fixed the issue</Label>
            </div>

            <Button type="submit" className="w-full">Record Solution Attempt</Button>
          </form>

          <Separator className="my-6" />

          {solutions.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No solution attempts recorded yet.</p>
          ) : (
            <div className="space-y-4">
              {solutions.map(solution => (
                <Card key={solution.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-md">Attempt #{solution.id}</CardTitle>
                      {solution.successful && (
                        <Badge className="bg-green-500">Successful</Badge>
                      )}
                    </div>
                    <CardDescription>{new Date(solution.attempt_date).toLocaleString()}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="space-y-2">
                      <div>
                        <h4 className="text-sm font-medium">What was tried:</h4>
                        <p className="text-sm whitespace-pre-line">{solution.description}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">Result:</h4>
                        <p className="text-sm whitespace-pre-line">{solution.result}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
