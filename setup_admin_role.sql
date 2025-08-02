-- Create admin users table to track who has admin privileges
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    UNIQUE(user_id),
    UNIQUE(email)
);

-- Enable RLS on admin_users table
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Only admins can view the admin list
CREATE POLICY "Only admins can view admin users" ON admin_users
    FOR SELECT USING (
        auth.uid() IN (SELECT user_id FROM admin_users)
    );

-- Only admins can modify the admin list
CREATE POLICY "Only admins can manage admin users" ON admin_users
    FOR ALL USING (
        auth.uid() IN (SELECT user_id FROM admin_users)
    );

-- Get the user ID for dereksackler@gmail.com and make them admin
INSERT INTO admin_users (user_id, email)
SELECT id, email 
FROM auth.users 
WHERE email = 'dereksackler@gmail.com'
ON CONFLICT (email) DO NOTHING;

-- Create a function to check if a user is an admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM admin_users WHERE admin_users.user_id = $1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update daily_challenges policies to allow admin access
DROP POLICY IF EXISTS "No public modifications to daily challenges" ON daily_challenges;

-- Admins can insert daily challenges
CREATE POLICY "Admins can insert daily challenges" ON daily_challenges
    FOR INSERT WITH CHECK (
        is_admin(auth.uid())
    );

-- Admins can update daily challenges
CREATE POLICY "Admins can update daily challenges" ON daily_challenges
    FOR UPDATE USING (
        is_admin(auth.uid())
    );

-- Admins can delete daily challenges
CREATE POLICY "Admins can delete daily challenges" ON daily_challenges
    FOR DELETE USING (
        is_admin(auth.uid())
    );

-- Also give admins ability to manage user_badges if needed (e.g., for special badges)
CREATE POLICY "Admins can manage any user badges" ON user_badges
    FOR ALL USING (
        is_admin(auth.uid())
    );

-- Give admins ability to manage user_stats if needed (e.g., for corrections)
CREATE POLICY "Admins can manage any user stats" ON user_stats
    FOR ALL USING (
        is_admin(auth.uid())
    );

-- Give admins ability to approve/manage custom categories
CREATE POLICY "Admins can manage all custom categories" ON custom_categories
    FOR ALL USING (
        is_admin(auth.uid())
    );

-- Give admins ability to manage artist requests
CREATE POLICY "Admins can manage artist requests" ON artist_requests
    FOR ALL USING (
        is_admin(auth.uid())
    );

-- Create a view to easily check admin status in the app
CREATE OR REPLACE VIEW public.current_user_admin_status AS
SELECT 
    auth.uid() as user_id,
    COALESCE(is_admin(auth.uid()), false) as is_admin;