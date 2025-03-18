
import React from 'react';

export interface AuthToggleModeProps {
  isLogin: boolean;
  toggleAuthMode: () => void;
  disabled?: boolean;
}

export const AuthToggleMode: React.FC<AuthToggleModeProps> = ({ isLogin, toggleAuthMode, disabled }) => {
  return (
    <div className="mt-4 text-center">
      <button
        type="button"
        className="text-sm font-medium text-blue-600 transition-colors hover:text-blue-800 hover:underline"
        onClick={toggleAuthMode}
        disabled={disabled}
      >
        {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Login'}
      </button>
    </div>
  );
};
