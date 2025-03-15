
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Database, ChevronRight, ArrowRight, ArrowLeft } from 'lucide-react';

const ConnectData = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSkip = () => {
    toast({
      title: 'Skipped data connection',
      description: 'You can connect your data sources later in settings.',
    });
    navigate('/dashboard');
  };

  const handleConnect = (source: string) => {
    setLoading(true);
    // Simulate connection process
    setTimeout(() => {
      setLoading(false);
      toast({
        title: 'Connection initiated',
        description: `Connecting to ${source}. This feature is coming soon.`,
      });
    }, 1500);
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="w-full max-w-3xl p-8 space-y-8 bg-white rounded-lg shadow-lg">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleBack} 
            className="mr-2"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Connect Your Data</h1>
        </div>
        
        <p className="mt-2 text-gray-600">
          Connect to your voter file or import your data to get started.
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          <div 
            className="p-6 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
            onClick={() => handleConnect('VAN/NGP')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Database className="w-8 h-8 text-blue-600" />
                <h3 className="text-lg font-medium">VAN/NGP</h3>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
            <p className="mt-3 text-sm text-gray-500">
              Connect to your VAN/NGP voter file directly.
            </p>
          </div>

          <div 
            className="p-6 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
            onClick={() => handleConnect('PDI')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Database className="w-8 h-8 text-blue-600" />
                <h3 className="text-lg font-medium">PDI</h3>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
            <p className="mt-3 text-sm text-gray-500">
              Connect to your PDI voter file directly.
            </p>
          </div>

          <div 
            className="p-6 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
            onClick={() => handleConnect('CSV Upload')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Database className="w-8 h-8 text-blue-600" />
                <h3 className="text-lg font-medium">CSV Upload</h3>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
            <p className="mt-3 text-sm text-gray-500">
              Upload voter data from a CSV file.
            </p>
          </div>

          <div 
            className="p-6 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
            onClick={() => handleConnect('API')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Database className="w-8 h-8 text-blue-600" />
                <h3 className="text-lg font-medium">API</h3>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
            <p className="mt-3 text-sm text-gray-500">
              Connect using our API for custom integrations.
            </p>
          </div>
        </div>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 text-gray-500 bg-white">Or</span>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center">
          <Button 
            variant="outline" 
            className="flex items-center space-x-2 py-3 px-6 text-gray-700 hover:text-blue-600"
            onClick={handleSkip}
          >
            <span>Skip for Now</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
          <p className="mt-2 text-sm text-gray-500">
            You can always connect your data later in settings
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConnectData;
