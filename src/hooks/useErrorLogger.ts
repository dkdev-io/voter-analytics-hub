import { supabase } from '@/integrations/supabase/client';
import { useLocation } from 'react-router-dom';
import { useRef } from 'react';

// More aggressive debouncing for auth flow logging
const debounce = (func: Function, wait = 1000) => {
  let timeout: number | null = null;
  return (...args: any[]) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), wait) as unknown as number;
  };
};

// Cache to prevent duplicate auth logs
const recentAuthLogs: Record<string, number> = {};

export function useErrorLogger() {
  const location = useLocation();
  const pendingLogs = useRef<any[]>([]);
  
  const logError = async (error: Error | string, source: string, metadata?: Record<string, any>) => {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error(`[ERROR] ${source}:`, error);
    
    try {
      const { error: logError } = await supabase.functions.invoke('slack-error-logger', {
        body: {
          message: errorMessage,
          stack: errorStack,
          source,
          route: location.pathname,
          metadata
        }
      });
      
      if (logError) {
        console.error('Failed to log error to Slack:', logError);
      }
    } catch (loggingError) {
      console.error('Error while sending to error logger:', loggingError);
    }
  };
  
  // Highly optimized version for auth flow logging
  const logAuthFlowIssue = debounce(async (source: string, metadata: Record<string, any>) => {
    // Skip routine auth logs that don't indicate problems
    if (!metadata.error && !source.includes("Error") && !source.includes("Failed")) {
      // For auth guards, only log when there's an authentication failure
      if (source === 'AuthGuard' || source === 'UnauthGuard') {
        if (!metadata.isAuthenticated && !metadata.skipAuth && metadata.path !== '/auth') {
          // This is an authentication failure, log it
          console.warn(`[AUTH FLOW] ${source}: Auth check failed`, metadata);
        } else {
          // Skip logging successful auth checks
          return;
        }
      } else {
        // Skip other routine logs
        return;
      }
    }
    
    // Create a cache key from the source and relevant metadata
    const cacheKey = `${source}-${JSON.stringify(metadata)}`;
    const now = Date.now();
    
    // Check if we've logged this exact issue recently (last 10 seconds)
    if (recentAuthLogs[cacheKey] && (now - recentAuthLogs[cacheKey] < 10000)) {
      return;
    }
    
    // Update the cache
    recentAuthLogs[cacheKey] = now;
    
    // Cleanup old cache entries
    Object.keys(recentAuthLogs).forEach(key => {
      if (now - recentAuthLogs[key] > 60000) {  // Remove entries older than 1 minute
        delete recentAuthLogs[key];
      }
    });
    
    console.warn(`[AUTH FLOW] ${source}:`, metadata);
    
    try {
      await supabase.functions.invoke('slack-error-logger', {
        body: {
          message: `Auth Flow Issue: ${source}`,
          source: 'Auth Flow Debugger',
          route: location.pathname,
          metadata: {
            ...metadata,
            // Minimal browser state for debugging
            location: {
              pathname: window.location.pathname
            }
          }
        }
      });
    } catch (loggingError) {
      console.error('Error while sending auth flow log:', loggingError);
    }
  }, 5000);  // Increased debounce time to 5 seconds for auth logs
  
  // Keep existing functions for data issues and error wrapping
  const logDataIssue = async (source: string, metadata: Record<string, any>) => {
    console.warn(`[DATA ISSUE] ${source}:`, metadata);
    
    try {
      await supabase.functions.invoke('slack-error-logger', {
        body: {
          message: `Data Issue: ${source}`,
          source: 'Data Debugging',
          route: location.pathname,
          metadata: {
            ...metadata,
            debugHistory: [
              "Previous attempts: Initial query returned 151 for Dan Kelly (all records)",
              "Added filtering by tactic: returned 25 for Dan Kelly + Phone",
              "Added exact date filtering: returned 85 for Dan Kelly + Phone + 2025-01-31",
              "Added special case for Dan Kelly: still returning incorrect values",
              "Current issue: Test data generation appears to be creating multiple Dan Kelly records"
            ]
          }
        }
      });
    } catch (loggingError) {
      console.error('Error while sending data issue log:', loggingError);
    }
  };
  
  const withErrorLogging = <T extends (...args: any[]) => Promise<any>>(
    fn: T,
    source: string
  ) => {
    return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
      try {
        return await fn(...args);
      } catch (error) {
        logError(error as Error, source, { args });
        throw error; // Re-throw the error to maintain normal error flow
      }
    };
  };
  
  return {
    logError,
    logAuthFlowIssue,
    logDataIssue,
    withErrorLogging
  };
}
