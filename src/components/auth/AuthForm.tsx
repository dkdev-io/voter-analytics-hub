
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AuthFormFooter } from './AuthFormFooter';
import { AuthToggleMode } from './AuthToggleMode';
import { MailCheck } from 'lucide-react';

interface AuthFormProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  error: string | null;
  loading: boolean;
  isLogin: boolean;
  signupSuccess?: boolean;
  onToggleMode: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onSkipAuth: () => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({
  email,
  setEmail,
  password,
  setPassword,
  error,
  loading,
  isLogin,
  signupSuccess = false,
  onToggleMode,
  onSubmit,
  onSkipAuth
}) => {
  if (signupSuccess) {
    return (
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-green-100">
              <MailCheck className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Registration Successful</h1>
          <p className="mt-2 text-gray-600">
            We've sent a verification email to <span className="font-medium">{email}</span>
          </p>
        </div>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Please check your inbox and click on the verification link to activate your account.
            If you don't see the email, check your spam folder.
          </p>
          
          <div className="pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              className="w-full"
              onClick={onToggleMode}
            >
              Return to Login
            </Button>
          </div>
        </div>
        
        <AuthFormFooter />
      </div>
    );
  }

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">{isLogin ? 'Login' : 'Sign Up'}</h1>
        <p className="mt-2 text-gray-600">
          {isLogin ? 'Welcome back to Dashboard!' : 'Create your Dashboard account'}
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="border border-red-200 bg-red-50">
          <AlertDescription className="font-medium">{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-3 transition-colors border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-3 transition-colors border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <Button
          type="submit"
          className="w-full py-3 text-lg font-medium text-white transition-colors bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="w-5 h-5 mr-2 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            isLogin ? 'Login' : 'Sign Up'
          )}
        </Button>
      </form>

      <AuthToggleMode isLogin={isLogin} onToggleMode={onToggleMode} />

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 text-gray-500 bg-white">Or</span>
        </div>
      </div>

      <Button 
        variant="outline" 
        className="w-full py-3 font-medium text-gray-700 transition-colors bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" 
        onClick={onSkipAuth}
      >
        Skip Authentication
      </Button>

      <AuthFormFooter />
    </div>
  );
};
