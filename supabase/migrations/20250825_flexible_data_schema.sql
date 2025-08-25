-- Migration for flexible voter analytics data schema
-- Supports dynamic fields and unlimited categories

-- Table for storing CSV mapping profiles
CREATE TABLE IF NOT EXISTS csv_mapping_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  mappings JSONB NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Table for dynamic field definitions
CREATE TABLE IF NOT EXISTS voter_contact_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL,
  field_type TEXT NOT NULL CHECK (field_type IN ('string', 'number', 'date', 'category', 'boolean')),
  display_name TEXT,
  is_required BOOLEAN DEFAULT FALSE,
  validation_rules JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, field_name)
);

-- Extend voter_contacts with JSONB for custom fields
ALTER TABLE voter_contacts 
ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}';

-- Add index for custom fields queries
CREATE INDEX IF NOT EXISTS idx_voter_contacts_custom_fields 
ON voter_contacts USING GIN (custom_fields);

-- Table for AI search history
CREATE TABLE IF NOT EXISTS ai_search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  natural_language TEXT,
  structured_query JSONB,
  results_count INT,
  execution_time_ms INT,
  response TEXT,
  confidence_score DECIMAL(3,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table for saved searches
CREATE TABLE IF NOT EXISTS saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  query TEXT NOT NULL,
  parameters JSONB,
  is_favorite BOOLEAN DEFAULT FALSE,
  usage_count INT DEFAULT 0,
  last_used TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Table for data insights
CREATE TABLE IF NOT EXISTS data_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL CHECK (insight_type IN ('trend', 'anomaly', 'pattern', 'recommendation')),
  title TEXT NOT NULL,
  description TEXT,
  data JSONB,
  severity TEXT CHECK (severity IN ('info', 'warning', 'critical')),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for csv_mapping_profiles
CREATE TRIGGER update_csv_mapping_profiles_updated_at
BEFORE UPDATE ON csv_mapping_profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- RLS policies for new tables
ALTER TABLE csv_mapping_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE voter_contact_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_insights ENABLE ROW LEVEL SECURITY;

-- Policies for csv_mapping_profiles
CREATE POLICY "Users can view own mapping profiles"
  ON csv_mapping_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mapping profiles"
  ON csv_mapping_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own mapping profiles"
  ON csv_mapping_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own mapping profiles"
  ON csv_mapping_profiles FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for voter_contact_fields
CREATE POLICY "Users can view own field definitions"
  ON voter_contact_fields FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own field definitions"
  ON voter_contact_fields FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own field definitions"
  ON voter_contact_fields FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own field definitions"
  ON voter_contact_fields FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for ai_search_history
CREATE POLICY "Users can view own search history"
  ON ai_search_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own search history"
  ON ai_search_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own search history"
  ON ai_search_history FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for saved_searches
CREATE POLICY "Users can view own saved searches"
  ON saved_searches FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved searches"
  ON saved_searches FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own saved searches"
  ON saved_searches FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved searches"
  ON saved_searches FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for data_insights
CREATE POLICY "Users can view own insights"
  ON data_insights FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own insights"
  ON data_insights FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own insights"
  ON data_insights FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own insights"
  ON data_insights FOR DELETE
  USING (auth.uid() = user_id);

-- Function to get dynamic field values
CREATE OR REPLACE FUNCTION get_unique_field_values(
  p_user_id UUID,
  p_field_name TEXT
)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  -- Check if it's a standard field
  IF p_field_name IN ('team', 'tactic', 'first_name', 'last_name', 'date') THEN
    EXECUTE format('
      SELECT json_agg(DISTINCT %I ORDER BY %I)
      FROM voter_contacts
      WHERE user_id = $1 AND %I IS NOT NULL
    ', p_field_name, p_field_name, p_field_name)
    INTO result
    USING p_user_id;
  ELSE
    -- Check custom fields
    SELECT json_agg(DISTINCT value ORDER BY value)
    INTO result
    FROM (
      SELECT DISTINCT custom_fields->p_field_name as value
      FROM voter_contacts
      WHERE user_id = p_user_id
        AND custom_fields ? p_field_name
        AND custom_fields->p_field_name IS NOT NULL
    ) t
    WHERE value IS NOT NULL;
  END IF;
  
  RETURN COALESCE(result, '[]'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to analyze CSV data patterns
CREATE OR REPLACE FUNCTION analyze_data_patterns(
  p_user_id UUID,
  p_time_range INTERVAL DEFAULT '30 days'::INTERVAL
)
RETURNS TABLE (
  pattern_type TEXT,
  description TEXT,
  data JSONB,
  confidence DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  WITH recent_data AS (
    SELECT *
    FROM voter_contacts
    WHERE user_id = p_user_id
      AND date >= CURRENT_DATE - p_time_range
  ),
  daily_stats AS (
    SELECT 
      date,
      COUNT(*) as total_attempts,
      SUM(contacts) as total_contacts,
      AVG(CASE WHEN attempts > 0 THEN contacts::DECIMAL / attempts ELSE 0 END) as success_rate
    FROM recent_data
    GROUP BY date
  )
  -- Trend detection
  SELECT 
    'trend'::TEXT as pattern_type,
    'Contact success rate trend'::TEXT as description,
    jsonb_build_object(
      'direction', CASE 
        WHEN regr_slope(success_rate, EXTRACT(epoch FROM date)) > 0 THEN 'improving'
        ELSE 'declining'
      END,
      'change_rate', regr_slope(success_rate, EXTRACT(epoch FROM date))
    ) as data,
    0.85::DECIMAL as confidence
  FROM daily_stats
  WHERE COUNT(*) > 7
  
  UNION ALL
  
  -- Anomaly detection
  SELECT 
    'anomaly'::TEXT,
    'Unusual activity detected'::TEXT,
    jsonb_build_object(
      'date', date,
      'metric', 'total_attempts',
      'value', total_attempts,
      'expected', AVG(total_attempts) OVER (ORDER BY date ROWS BETWEEN 7 PRECEDING AND 1 PRECEDING)
    ),
    0.75::DECIMAL
  FROM daily_stats
  WHERE total_attempts > AVG(total_attempts) OVER () * 2
     OR total_attempts < AVG(total_attempts) OVER () * 0.5
  LIMIT 5;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_search_history_user_created 
ON ai_search_history(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_saved_searches_user_favorite 
ON saved_searches(user_id, is_favorite, usage_count DESC);

CREATE INDEX IF NOT EXISTS idx_data_insights_user_unread 
ON data_insights(user_id, is_read, created_at DESC);

-- Grant necessary permissions
GRANT ALL ON csv_mapping_profiles TO authenticated;
GRANT ALL ON voter_contact_fields TO authenticated;
GRANT ALL ON ai_search_history TO authenticated;
GRANT ALL ON saved_searches TO authenticated;
GRANT ALL ON data_insights TO authenticated;

GRANT EXECUTE ON FUNCTION get_unique_field_values TO authenticated;
GRANT EXECUTE ON FUNCTION analyze_data_patterns TO authenticated;