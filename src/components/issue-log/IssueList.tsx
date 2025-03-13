
import { useState, useEffect } from 'react';
import { fetchIssues, Issue } from '@/lib/issue-log/issueLogService';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const IssueList = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadIssues = async () => {
      try {
        setIsLoading(true);
        const data = await fetchIssues();
        setIssues(data);
      } catch (err) {
        console.error('Failed to load issues:', err);
        setError('Failed to load issues. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    loadIssues();
  }, []);

  // Function to get status badge color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
        return 'bg-yellow-500';
      case 'in progress':
        return 'bg-blue-500';
      case 'resolved':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading issues...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-8">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Issue Log</h2>
        <Link to="/issues/new">
          <Button>Log New Issue</Button>
        </Link>
      </div>

      {issues.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No issues found.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {issues.map((issue) => (
            <Card key={issue.id} className="shadow-md">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{issue.title}</CardTitle>
                  <Badge className={getStatusColor(issue.status)}>{issue.status}</Badge>
                </div>
                <CardDescription>
                  {new Date(issue.date_reported).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="text-sm line-clamp-3">{issue.description}</p>
                {issue.component && (
                  <p className="text-xs text-gray-500 mt-2">
                    <span className="font-medium">Components:</span> {issue.component}
                  </p>
                )}
              </CardContent>
              <CardFooter>
                <Link to={`/issues/${issue.id}`} className="w-full">
                  <Button variant="outline" className="w-full">View Details</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
