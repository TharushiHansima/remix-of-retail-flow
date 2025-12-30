-- Add policy for admins to update any profile
CREATE POLICY "Admins can update any profile" 
ON public.profiles 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Fix the existing user who was approved but profile not updated
UPDATE public.profiles 
SET approval_status = 'approved' 
WHERE email = 'sahan1@gmail.com';