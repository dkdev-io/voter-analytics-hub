import { VoterAnalytics } from "@/components/voter-analytics/VoterAnalytics";

const Demo = () => {
  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Voter Analytics Hub - Live Demo
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Experience the full functionality without authentication
          </p>
        </div>
        <VoterAnalytics />
      </div>
    </div>
  );
};

export default Demo;