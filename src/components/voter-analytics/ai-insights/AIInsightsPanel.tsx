import React, { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Lightbulb, 
  Target, 
  BarChart3,
  Users,
  Clock,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { VoterMetrics, QueryParams } from '@/types/analytics';
import { AISearchService } from '@/services/aiSearchService';
import { cn } from '@/lib/utils';

interface AIInsightsPanelProps {
  metrics?: VoterMetrics;
  queryParams?: Partial<QueryParams>;
  isVisible?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number; // milliseconds
}

interface InsightItem {
  id: string;
  type: 'insight' | 'anomaly' | 'recommendation' | 'trend';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  confidence: number;
  timestamp: Date;
  actionable: boolean;
  category: string;
}

export const AIInsightsPanel: React.FC<AIInsightsPanelProps> = ({
  metrics,
  queryParams,
  isVisible = true,
  autoRefresh = true,
  refreshInterval = 30000 // 30 seconds
}) => {
  const [insights, setInsights] = useState<InsightItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Generate insights when data changes
  const generateInsights = async () => {
    if (!metrics) return;
    
    setIsLoading(true);
    try {
      const result = await AISearchService.generateDataInsights(metrics, queryParams || {});
      
      const newInsights: InsightItem[] = [];
      let idCounter = 0;

      // Convert insights to structured format
      result.insights.forEach(insight => {
        newInsights.push({
          id: `insight-${idCounter++}`,
          type: 'insight',
          title: 'Data Insight',
          description: insight,
          severity: 'medium',
          confidence: 0.8,
          timestamp: new Date(),
          actionable: false,
          category: 'performance'
        });
      });

      result.anomalies.forEach(anomaly => {
        newInsights.push({
          id: `anomaly-${idCounter++}`,
          type: 'anomaly',
          title: 'Data Anomaly Detected',
          description: anomaly,
          severity: 'high',
          confidence: 0.9,
          timestamp: new Date(),
          actionable: true,
          category: 'issues'
        });
      });

      result.recommendations.forEach(recommendation => {
        newInsights.push({
          id: `recommendation-${idCounter++}`,
          type: 'recommendation',
          title: 'Recommended Action',
          description: recommendation,
          severity: 'medium',
          confidence: 0.85,
          timestamp: new Date(),
          actionable: true,
          category: 'optimization'
        });
      });

      result.trends.forEach(trend => {
        newInsights.push({
          id: `trend-${idCounter++}`,
          type: 'trend',
          title: 'Trend Analysis',
          description: trend,
          severity: 'low',
          confidence: 0.75,
          timestamp: new Date(),
          actionable: false,
          category: 'trends'
        });
      });

      setInsights(newInsights);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error generating insights:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-refresh insights
  useEffect(() => {
    if (metrics && isVisible) {
      generateInsights();
    }
  }, [metrics, queryParams, isVisible]);

  useEffect(() => {
    if (!autoRefresh || !isVisible) return;

    const interval = setInterval(() => {
      if (metrics) {
        generateInsights();
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, metrics, isVisible]);

  // Filter insights by category
  const filteredInsights = useMemo(() => {
    if (selectedCategory === 'all') return insights;
    return insights.filter(insight => insight.category === selectedCategory);
  }, [insights, selectedCategory]);

  // Group insights by type
  const insightsByType = useMemo(() => {
    return {
      insights: filteredInsights.filter(item => item.type === 'insight'),
      anomalies: filteredInsights.filter(item => item.type === 'anomaly'),
      recommendations: filteredInsights.filter(item => item.type === 'recommendation'),
      trends: filteredInsights.filter(item => item.type === 'trend')
    };
  }, [filteredInsights]);

  // Get icon for insight type
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'insight': return <Lightbulb className="h-4 w-4" />;
      case 'anomaly': return <AlertTriangle className="h-4 w-4" />;
      case 'recommendation': return <Target className="h-4 w-4" />;
      case 'trend': return <TrendingUp className="h-4 w-4" />;
      default: return <BarChart3 className="h-4 w-4" />;
    }
  };

  // Get color for severity
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const categories = useMemo(() => {
    const cats = [...new Set(insights.map(i => i.category))];
    return [{ value: 'all', label: 'All Insights' }, ...cats.map(cat => ({ 
      value: cat, 
      label: cat.charAt(0).toUpperCase() + cat.slice(1) 
    }))];
  }, [insights]);

  if (!isVisible) return null;

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Insights
            </CardTitle>
            <CardDescription>
              Automated analysis and recommendations from your data
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {lastUpdated && (
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {lastUpdated.toLocaleTimeString()}
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={generateInsights}
              disabled={isLoading}
              className="h-8"
            >
              <RefreshCw className={cn("h-3 w-3 mr-1", isLoading && "animate-spin")} />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <Button
              key={category.value}
              variant={selectedCategory === category.value ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.value)}
              className="h-7 text-xs"
            >
              {category.label}
            </Button>
          ))}
        </div>

        <Separator />

        {isLoading && insights.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
            <p>Analyzing your data...</p>
          </div>
        ) : filteredInsights.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No insights available yet</p>
            <p className="text-xs">Insights will appear as you analyze your data</p>
          </div>
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all" className="text-xs">
                All ({filteredInsights.length})
              </TabsTrigger>
              <TabsTrigger value="anomalies" className="text-xs">
                Issues ({insightsByType.anomalies.length})
              </TabsTrigger>
              <TabsTrigger value="recommendations" className="text-xs">
                Actions ({insightsByType.recommendations.length})
              </TabsTrigger>
              <TabsTrigger value="trends" className="text-xs">
                Trends ({insightsByType.trends.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-4">
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {filteredInsights.map(insight => (
                    <InsightCard key={insight.id} insight={insight} />
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="anomalies" className="mt-4">
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {insightsByType.anomalies.map(insight => (
                    <InsightCard key={insight.id} insight={insight} />
                  ))}
                  {insightsByType.anomalies.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">No anomalies detected</p>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="recommendations" className="mt-4">
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {insightsByType.recommendations.map(insight => (
                    <InsightCard key={insight.id} insight={insight} />
                  ))}
                  {insightsByType.recommendations.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">No recommendations available</p>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="trends" className="mt-4">
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {insightsByType.trends.map(insight => (
                    <InsightCard key={insight.id} insight={insight} />
                  ))}
                  {insightsByType.trends.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">No trends identified</p>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};

// Individual insight card component
const InsightCard: React.FC<{ insight: InsightItem }> = ({ insight }) => {
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'insight': return <Lightbulb className="h-4 w-4 text-blue-500" />;
      case 'anomaly': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'recommendation': return <Target className="h-4 w-4 text-green-500" />;
      case 'trend': return <TrendingUp className="h-4 w-4 text-purple-500" />;
      default: return <BarChart3 className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      case 'low': return 'border-blue-200 bg-blue-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className={cn(
      "p-3 rounded-lg border",
      getSeverityColor(insight.severity)
    )}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5">
          {getInsightIcon(insight.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-sm font-medium truncate">{insight.title}</h4>
            <Badge variant="outline" className="h-5 text-xs">
              {Math.round(insight.confidence * 100)}%
            </Badge>
            {insight.actionable && (
              <Badge variant="secondary" className="h-5 text-xs">
                Action Required
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {insight.description}
          </p>
          <div className="mt-2 text-xs text-muted-foreground">
            {insight.timestamp.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
};