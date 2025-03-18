
-- Function to sum attempts, contacts, etc. by tactic
CREATE OR REPLACE FUNCTION sum_by_tactic(user_id_param TEXT)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  WITH aggregated AS (
    SELECT 
      tactic,
      SUM(attempts) as total_attempts,
      SUM(contacts) as total_contacts,
      SUM(support) as total_support,
      SUM(oppose) as total_oppose,
      SUM(undecided) as total_undecided,
      SUM(not_home) as total_not_home,
      SUM(refusal) as total_refusal,
      SUM(bad_data) as total_bad_data
    FROM voter_contacts
    WHERE user_id = user_id_param
    GROUP BY tactic
  )
  SELECT json_agg(row_to_json(aggregated)) INTO result
  FROM aggregated;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to sum attempts, contacts, etc. by team
CREATE OR REPLACE FUNCTION sum_by_team(user_id_param TEXT)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  WITH aggregated AS (
    SELECT 
      team,
      SUM(attempts) as total_attempts,
      SUM(contacts) as total_contacts,
      SUM(support) as total_support,
      SUM(oppose) as total_oppose,
      SUM(undecided) as total_undecided,
      SUM(not_home) as total_not_home,
      SUM(refusal) as total_refusal,
      SUM(bad_data) as total_bad_data
    FROM voter_contacts
    WHERE user_id = user_id_param
    GROUP BY team
  )
  SELECT json_agg(row_to_json(aggregated)) INTO result
  FROM aggregated;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to sum attempts, contacts, etc. by date
CREATE OR REPLACE FUNCTION sum_by_date(user_id_param TEXT)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  WITH aggregated AS (
    SELECT 
      date,
      SUM(attempts) as total_attempts,
      SUM(contacts) as total_contacts,
      SUM(support) as total_support,
      SUM(oppose) as total_oppose,
      SUM(undecided) as total_undecided,
      SUM(not_home) as total_not_home,
      SUM(refusal) as total_refusal,
      SUM(bad_data) as total_bad_data
    FROM voter_contacts
    WHERE user_id = user_id_param
    GROUP BY date
    ORDER BY date
  )
  SELECT json_agg(row_to_json(aggregated)) INTO result
  FROM aggregated;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;
