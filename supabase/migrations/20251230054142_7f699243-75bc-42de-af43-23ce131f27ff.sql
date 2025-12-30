-- Add approval status to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS approval_status text NOT NULL DEFAULT 'pending';

-- Add approved_at and approved_by columns
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS approved_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS approved_by uuid;

-- Create index for faster approval status queries
CREATE INDEX IF NOT EXISTS idx_profiles_approval_status ON public.profiles(approval_status);

-- Update existing profiles to be approved (so current users aren't locked out)
UPDATE public.profiles SET approval_status = 'approved' WHERE approval_status = 'pending';

-- Create a trigger function to create approval request when new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create an approval request for the new user
  INSERT INTO public.approvals (
    entity_type,
    entity_id,
    rule_id,
    rule_name,
    status,
    metadata,
    requested_by
  ) VALUES (
    'user',
    NEW.id,
    'user_signup_approval',
    'New User Signup Approval',
    'pending',
    jsonb_build_object(
      'email', NEW.email,
      'full_name', NEW.full_name
    ),
    NEW.user_id
  );
  RETURN NEW;
END;
$$;

-- Create trigger to fire after profile is created
DROP TRIGGER IF EXISTS on_profile_created_approval ON public.profiles;
CREATE TRIGGER on_profile_created_approval
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_approval();