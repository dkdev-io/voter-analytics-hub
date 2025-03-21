
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { VoterAnalyticsWithErrorHandling } from "@/components/voter-analytics/VoterAnalyticsWithErrorHandling";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Removed the redirect to connect-data to prevent duplicate screens

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <VoterAnalyticsWithErrorHandling />
      </div>
    </div>
  );
};

export default Index;
