
import React from 'react';
import { Button } from '@/components/ui/button';

export interface AuthFormFooterProps {
  onSkipAuth?: () => void;
  disabled?: boolean;
}

export const AuthFormFooter: React.FC<AuthFormFooterProps> = ({ onSkipAuth, disabled }) => {
  return (
    <div className="mt-6 space-y-4">
      <div className="text-center text-sm text-gray-600">
        <p>By continuing, you agree to Dashboard's</p>
        <p>
          <a href="#" className="font-medium text-blue-600 hover:text-blue-800 hover:underline">Terms of Service</a> and{' '}
          <a href="#" className="font-medium text-blue-600 hover:text-blue-800 hover:underline">Privacy Policy</a>
        </p>
      </div>
      
      {onSkipAuth && (
        <div className="text-center">
          <Button 
            variant="outline" 
            onClick={onSkipAuth}
            disabled={disabled}
            className="mt-2"
          >
            Skip for now
          </Button>
        </div>
      )}
    </div>
  );
};
