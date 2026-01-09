-- Fix function search_path for get_aging_bucket
CREATE OR REPLACE FUNCTION public.get_aging_bucket(days_old integer)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT CASE 
    WHEN days_old <= 30 THEN '0-30'
    WHEN days_old <= 60 THEN '31-60'
    WHEN days_old <= 90 THEN '61-90'
    ELSE '90+'
  END;
$$;