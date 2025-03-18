
-- Add index on user_id to improve query performance for user-specific data
CREATE INDEX IF NOT EXISTS voter_contacts_user_id_idx ON voter_contacts (user_id);

-- Add additional functions for more complex data aggregation
CREATE OR REPLACE FUNCTION get_voter_contact_summary(user_id_param TEXT)
RETURNS JSON AS $$
DECLARE
  result JSON;
  total_count INTEGER;
  total_attempts INTEGER;
  total_contacts INTEGER;
  success_rate NUMERIC;
  top_tactic TEXT;
  top_team TEXT;
BEGIN
  -- Get total count
  SELECT COUNT(*) INTO total_count
  FROM voter_contacts
  WHERE user_id = user_id_param;
  
  -- Get totals
  SELECT 
    SUM(attempts),
    SUM(contacts)
  INTO 
    total_attempts,
    total_contacts
  FROM voter_contacts
  WHERE user_id = user_id_param;
  
  -- Calculate success rate
  IF total_attempts > 0 THEN
    success_rate := ROUND((total_contacts::NUMERIC / total_attempts::NUMERIC) * 100, 2);
  ELSE
    success_rate := 0;
  END IF;
  
  -- Get top tactic
  SELECT tactic INTO top_tactic
  FROM voter_contacts
  WHERE user_id = user_id_param
  GROUP BY tactic
  ORDER BY SUM(attempts) DESC
  LIMIT 1;
  
  -- Get top team
  SELECT team INTO top_team
  FROM voter_contacts
  WHERE user_id = user_id_param
  GROUP BY team
  ORDER BY SUM(attempts) DESC
  LIMIT 1;
  
  -- Build result JSON
  SELECT json_build_object(
    'total_records', total_count,
    'total_attempts', total_attempts,
    'total_contacts', total_contacts,
    'success_rate', success_rate,
    'top_tactic', top_tactic,
    'top_team', top_team
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;
