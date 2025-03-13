
import { Routes, Route, Navigate } from 'react-router-dom';
import { IssueList } from './IssueList';
import { IssueDetail } from './IssueDetail';
import { IssueForm } from './IssueForm';

export const IssueTracker = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <Routes>
        <Route path="/" element={<IssueList />} />
        <Route path="/:issueId" element={<IssueDetail />} />
        <Route path="/new" element={<IssueForm />} />
        <Route path="*" element={<Navigate to="/issues" replace />} />
      </Routes>
    </div>
  );
};
