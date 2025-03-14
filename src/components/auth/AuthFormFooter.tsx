
import React from 'react';

export const AuthFormFooter: React.FC = () => {
  return (
    <div className="mt-6 text-center text-sm text-gray-600">
      <p>By continuing, you agree to Dashboard's</p>
      <p>
        <a href="#" className="font-medium text-blue-600 hover:text-blue-800 hover:underline">Terms of Service</a> and{' '}
        <a href="#" className="font-medium text-blue-600 hover:text-blue-800 hover:underline">Privacy Policy</a>
      </p>
    </div>
  );
};
