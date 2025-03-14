
import React from 'react';

interface AuthToggleModeProps {
  isLogin: boolean;
  onToggleMode: () => void;
}

export const AuthToggleMode: React.FC<AuthToggleModeProps> = ({ isLogin, onToggleMode }) => {
  return (
    <div className="mt-4 text-center">
      <button
        type="button"
        className="text-sm font-medium text-blue-600 transition-colors hover:text-blue-800 hover:underline"
        onClick={onToggleMode}
      >
        {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Login'}
      </button>
    </div>
  );
};
