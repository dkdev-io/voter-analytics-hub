
import { VoterAnalytics } from "@/components/voter-analytics/VoterAnalytics";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Removed the redirect to connect-data to prevent duplicate screens

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">
          Welcome, {user?.email}
        </h1>
        <VoterAnalytics />
      </div>
    </div>
  );
};

export default Index;
