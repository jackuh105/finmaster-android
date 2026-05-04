-- Function to get monthly category statistics
-- This function aggregates transaction amounts by category for a given date range
-- It runs with SECURITY DEFINER to ensure it respects RLS via auth.uid() check inside the query

CREATE OR REPLACE FUNCTION get_monthly_category_stats(start_date DATE, end_date DATE)
RETURNS TABLE (category_name TEXT, total_amount NUMERIC)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(c.name, 'Uncategorized') as category_name,
    SUM(t.amount) as total_amount
  FROM
    transactions t
  LEFT JOIN
    categories c ON t.category_id = c.id
  WHERE
    t.user_id = auth.uid()
    AND t.date >= start_date
    AND t.date <= end_date
  GROUP BY
    c.name;
END;
$$;

-- Function to get distinct months from transactions
-- Returns all unique year-month combinations where the user has transactions
-- Ordered by most recent first
CREATE OR REPLACE FUNCTION get_distinct_transaction_months()
RETURNS TABLE (year_month TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT
    TO_CHAR(t.date, 'YYYY-MM') as year_month
  FROM
    transactions t
  WHERE
    t.user_id = auth.uid()
  ORDER BY
    year_month DESC;
END;
$$;
