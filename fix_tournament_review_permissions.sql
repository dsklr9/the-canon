-- Fix Tournament Review Permissions
-- This allows updating tournament submission status for review purposes

-- SIMPLE FIX: Allow all authenticated users to update submission status
-- This is appropriate for now since tournament review is an admin-level feature
CREATE POLICY "Authenticated users can update submission status" 
ON tournament_submissions 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

-- FUTURE ENHANCEMENT: If you want to restrict to specific admin users later,
-- you can replace the above policy with one of these approaches:

-- Option 1: Hardcode specific user IDs (replace with your actual admin user IDs)
/*
DROP POLICY "Authenticated users can update submission status" ON tournament_submissions;
CREATE POLICY "Specific admins can update submission status" 
ON tournament_submissions 
FOR UPDATE 
USING (
  auth.uid() IN (
    'your-admin-user-id-1'::UUID,
    'your-admin-user-id-2'::UUID
  )
);
*/

-- Option 2: Add admin columns and use them
/*
ALTER TABLE profiles ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN is_moderator BOOLEAN DEFAULT FALSE;

-- Then update specific users to be admins
-- UPDATE profiles SET is_admin = true WHERE id = 'your-user-id';

DROP POLICY "Authenticated users can update submission status" ON tournament_submissions;
CREATE POLICY "Admins can update submission status" 
ON tournament_submissions 
FOR UPDATE 
USING (
  auth.uid() IN (
    SELECT id FROM profiles 
    WHERE is_admin = true OR is_moderator = true
  )
);
*/