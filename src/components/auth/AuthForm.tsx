
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AuthToggleMode } from './AuthToggleMode';
import { AuthFormFooter } from './AuthFormFooter';
import { useAuthForm } from '@/hooks/useAuthForm';

export interface AuthFormProps {
  redirectPath?: string;
}

export function AuthForm({ redirectPath = '/connect-data' }: AuthFormProps) {
  const { 
    email, 
    setEmail, 
    password, 
    setPassword,
    fullName,
    setFullName,
    loading, 
    error, 
    isLogin, 
    signupSuccess,
    toggleAuthMode,
    handleSubmit,
    handleSkipAuth
  } = useAuthForm(redirectPath);

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">
          {isLogin ? 'Login to your account' : 'Create an account'}
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          {isLogin 
            ? 'Enter your email and password to access your account' 
            : 'Enter your details to create your account'}
        </p>
      </div>
      
      {signupSuccess && (
        <Alert className="bg-green-50 border-green-200">
          <AlertDescription className="text-green-700">
            Registration successful! Please check your email to verify your account.
          </AlertDescription>
        </Alert>
      )}
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input 
              id="fullName" 
              placeholder="Full Name" 
              required={!isLogin}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={loading}
            />
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="Email" 
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            {isLogin && (
              <Button variant="link" className="p-0 h-auto" disabled={loading}>
                Forgot password?
              </Button>
            )}
          </div>
          <Input 
            id="password" 
            type="password" 
            placeholder="Password" 
            required 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
        </div>
        
        <Button 
          type="submit" 
          className="w-full" 
          disabled={loading}
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLogin ? 'Login' : 'Sign Up'}
        </Button>
      </form>
      
      <AuthToggleMode 
        isLogin={isLogin} 
        toggleAuthMode={toggleAuthMode} 
        disabled={loading} 
      />
      
      <AuthFormFooter 
        onSkipAuth={handleSkipAuth} 
        disabled={loading} 
      />
    </div>
  );
}
