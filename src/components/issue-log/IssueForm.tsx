
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addIssue } from '@/lib/issue-log/issueLogService';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';

export const IssueForm = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    expected_behavior: '',
    actual_behavior: '',
    console_logs: '',
    theories: '',
    component: '',
    reference_links: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const newIssue = await addIssue(formData);
      if (newIssue) {
        navigate(`/issues/${newIssue.id}`);
      }
    } catch (error) {
      console.error('Error creating issue:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <h1 className="text-2xl font-bold">Log New Issue</h1>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Issue Details</CardTitle>
            <CardDescription>
              Provide as much detail as possible to help with troubleshooting
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Issue Title *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Brief description of the issue"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Full Description *</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Detailed explanation of the issue"
                className="min-h-[100px]"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expected_behavior">Expected Behavior</Label>
                <Textarea
                  id="expected_behavior"
                  name="expected_behavior"
                  value={formData.expected_behavior}
                  onChange={handleChange}
                  placeholder="What should happen"
                  className="min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="actual_behavior">Actual Behavior</Label>
                <Textarea
                  id="actual_behavior"
                  name="actual_behavior"
                  value={formData.actual_behavior}
                  onChange={handleChange}
                  placeholder="What actually happens"
                  className="min-h-[80px]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="component">Affected Components</Label>
              <Input
                id="component"
                name="component"
                value={formData.component}
                onChange={handleChange}
                placeholder="e.g., TacticSelector, QueryBuilder, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="console_logs">Console Logs</Label>
              <Textarea
                id="console_logs"
                name="console_logs"
                value={formData.console_logs}
                onChange={handleChange}
                placeholder="Copy and paste relevant console logs"
                className="min-h-[100px] font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="theories">Theories About the Cause</Label>
              <Textarea
                id="theories"
                name="theories"
                value={formData.theories}
                onChange={handleChange}
                placeholder="List possible causes of the issue"
                className="min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reference_links">Reference Links</Label>
              <Input
                id="reference_links"
                name="reference_links"
                value={formData.reference_links}
                onChange={handleChange}
                placeholder="Links to docs, Stack Overflow, etc."
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Log Issue'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};
