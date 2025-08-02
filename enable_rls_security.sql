-- Enable RLS on public tables and create appropriate policies

-- 1. USER_STATS table
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- Everyone can view user stats (for leaderboards, public profiles)
CREATE POLICY "User stats are viewable by everyone" ON user_stats
    FOR SELECT USING (true);

-- Only the user can update their own stats
CREATE POLICY "Users can update own stats" ON user_stats
    FOR UPDATE USING (auth.uid() = user_id);

-- Only the user can insert their own stats
CREATE POLICY "Users can insert own stats" ON user_stats
    FOR INSERT WITH CHECK (auth.uid() = user_id);


-- 2. DAILY_CHALLENGES table
ALTER TABLE daily_challenges ENABLE ROW LEVEL SECURITY;

-- Everyone can view daily challenges (public feature)
CREATE POLICY "Daily challenges are viewable by everyone" ON daily_challenges
    FOR SELECT USING (true);

-- Only admins can insert/update/delete challenges (you'll need to set this up)
-- For now, we'll restrict modifications completely
CREATE POLICY "No public modifications to daily challenges" ON daily_challenges
    FOR ALL USING (false);


-- 3. USER_BADGES table
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- Everyone can view badges (for public profiles)
CREATE POLICY "User badges are viewable by everyone" ON user_badges
    FOR SELECT USING (true);

-- Users can only insert their own badges
CREATE POLICY "Users can insert own badges" ON user_badges
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own badges
CREATE POLICY "Users can update own badges" ON user_badges
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own badges
CREATE POLICY "Users can delete own badges" ON user_badges
    FOR DELETE USING (auth.uid() = user_id);