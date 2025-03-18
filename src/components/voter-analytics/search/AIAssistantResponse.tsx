
import React from 'react';

interface AIAssistantResponseProps {
  response: string | null;
}

export const AIAssistantResponse: React.FC<AIAssistantResponseProps> = ({ response }) => {
  if (!response) return null;
  
  return (
    <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
      <h3 className="text-xs font-medium mb-2">AI Assistant:</h3>
      <div className="text-xs whitespace-pre-wrap">{response}</div>
    </div>
  );
};
