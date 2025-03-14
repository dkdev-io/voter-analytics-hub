
import { VoterAnalytics } from "@/components/voter-analytics/VoterAnalytics";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // If the user came directly to dashboard without going through connect-data,
    // redirect them to connect-data first
    const hasCompletedDataConnection = sessionStorage.getItem('completedDataConnection');
    console.log('Index: Checking if data connection completed:', hasCompletedDataConnection);
    
    if (!hasCompletedDataConnection) {
      console.log('Index: Redirecting to connect-data because user has not completed data connection');
      toast({
        title: "Data connection required",
        description: "Please connect your data sources first",
      });
      navigate('/connect-data');
    }
  }, [navigate]);

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">
          Welcome, {user?.email || "User"}
        </h1>
        <VoterAnalytics />
      </div>
    </div>
  );
};

export default Index;
