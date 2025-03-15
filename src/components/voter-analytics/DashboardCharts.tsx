
import { useState, useEffect } from 'react';
import { type VoterMetrics, type QueryParams } from '@/types/analytics';
import { fetchVoterMetrics } from '@/lib/voter-data';
import { TacticsPieChart } from './charts/TacticsPieChart';
import { ContactsPieChart } from './charts/ContactsPieChart';
import { NotReachedPieChart } from './charts/NotReachedPieChart';
import { TeamsPieChart } from './charts/TeamsPieChart';
import { ActivityLineChart } from './charts/ActivityLineChart';
import { CHART_COLORS } from '@/types/analytics';

interface DashboardChartsProps {
  isLoading: boolean;
  query: Partial<QueryParams>;
  showFilteredData: boolean;
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({ 
  isLoading, 
  query, 
  showFilteredData 
}) => {
  const [tacticsData, setTacticsData] = useState<any[]>([]);
  const [contactsData, setContactsData] = useState<any[]>([]);
  const [notReachedData, setNotReachedData] = useState<any[]>([]);
  const [teamsData, setTeamsData] = useState<any[]>([]);
  const [lineChartData, setLineChartData] = useState<any[]>([]);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [totalContacts, setTotalContacts] = useState(0);
  const [totalNotReached, setTotalNotReached] = useState(0);
  const [totalTeamAttempts, setTotalTeamAttempts] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadChartData = async () => {
      try {
        setLoading(true);
        
        // Fetch aggregated metrics from our service - either overall or filtered
        const metrics = await fetchVoterMetrics(showFilteredData ? query : undefined);
        
        // Chart 1: Tactics breakdown (SMS, Phone, Canvas)
        const tacticsChartData = [
          { name: 'SMS', value: metrics.tactics.sms || 0, color: CHART_COLORS.TACTIC.SMS },
          { name: 'Phone', value: metrics.tactics.phone || 0, color: CHART_COLORS.TACTIC.PHONE },
          { name: 'Canvas', value: metrics.tactics.canvas || 0, color: CHART_COLORS.TACTIC.CANVAS }
        ];
        
        // Chart 2: Contacts breakdown (Support, Oppose, Undecided)
        const contactsChartData = [
          { name: 'Support', value: metrics.contacts.support || 0, color: CHART_COLORS.CONTACT.SUPPORT },
          { name: 'Oppose', value: metrics.contacts.oppose || 0, color: CHART_COLORS.CONTACT.OPPOSE },
          { name: 'Undecided', value: metrics.contacts.undecided || 0, color: CHART_COLORS.CONTACT.UNDECIDED }
        ];
        
        // Chart 3: Not Reached breakdown (Not Home, Refusal, Bad Data)
        const notReachedChartData = [
          { name: 'Not Home', value: metrics.notReached.notHome || 0, color: CHART_COLORS.NOT_REACHED.NOT_HOME },
          { name: 'Refusal', value: metrics.notReached.refusal || 0, color: CHART_COLORS.NOT_REACHED.REFUSAL },
          { name: 'Bad Data', value: metrics.notReached.badData || 0, color: CHART_COLORS.NOT_REACHED.BAD_DATA }
        ];
        
        // Chart 4: Team Attempts
        const teamsAttempts = metrics.teamAttempts || {};
        const teamKeys = Object.keys(teamsAttempts);
        const teamChartData = teamKeys.map((team, index) => {
          // Cycle through green colors
          const colorKey = `TEAM_${(index % 5) + 1}` as keyof typeof CHART_COLORS.TEAM;
          const color = CHART_COLORS.TEAM[colorKey] || CHART_COLORS.TEAM.DEFAULT;
          
          return {
            name: team,
            value: teamsAttempts[team] || 0,
            color
          };
        });
        
        // Line chart data
        const lineData = metrics.byDate || [];
        
        // Calculate totals
        const totalTactics = tacticsChartData.reduce((sum, item) => sum + item.value, 0);
        const totalContactsValue = contactsChartData.reduce((sum, item) => sum + item.value, 0);
        const totalNotReachedValue = notReachedChartData.reduce((sum, item) => sum + item.value, 0);
        const totalTeamAttemptsValue = teamChartData.reduce((sum, item) => sum + item.value, 0);
        
        setTacticsData(tacticsChartData);
        setContactsData(contactsChartData);
        setNotReachedData(notReachedChartData);
        setTeamsData(teamChartData);
        setLineChartData(lineData);
        setTotalAttempts(totalTactics);
        setTotalContacts(totalContactsValue);
        setTotalNotReached(totalNotReachedValue);
        setTotalTeamAttempts(totalTeamAttemptsValue);
      } catch (error) {
        console.error('Error loading chart data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadChartData();
  }, [query, showFilteredData]);
  
  if (loading || isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Analytics</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 bg-gray-100 animate-pulse rounded"></div>
          ))}
        </div>
        <div className="mt-6 h-72 bg-gray-100 animate-pulse rounded"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Analytics {showFilteredData ? '(Filtered Results)' : '(Overall)'}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Chart 1: Tactics Distribution */}
        <TacticsPieChart data={tacticsData} total={totalAttempts} />
        
        {/* Chart 2: Contact Results */}
        <ContactsPieChart data={contactsData} total={totalContacts} />
        
        {/* Chart 3: Not Reached Breakdown */}
        <NotReachedPieChart data={notReachedData} total={totalNotReached} />
        
        {/* Chart 4: Team Attempts */}
        <TeamsPieChart data={teamsData} total={totalTeamAttempts} />
      </div>
      
      {/* Line chart showing attempts, contacts, and issues by date */}
      <ActivityLineChart data={lineChartData} />
    </div>
  );
};
