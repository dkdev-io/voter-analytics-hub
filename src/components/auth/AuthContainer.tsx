
import React from 'react';

interface AuthContainerProps {
  children: React.ReactNode;
}

export const AuthContainer: React.FC<AuthContainerProps> = ({ children }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {children}
    </div>
  );
};
