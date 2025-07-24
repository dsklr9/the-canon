-- Tournament Bracket System Database Schema

-- Main tournaments table
CREATE TABLE tournaments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) DEFAULT 'Best Bars', -- 'Best Bars', 'Punchlines', 'Storytelling', etc.
    status VARCHAR(50) DEFAULT 'submission', -- 'submission', 'voting', 'completed'
    bracket_size INTEGER DEFAULT 16, -- 8, 16, 32, 64
    submission_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    submission_end TIMESTAMP WITH TIME ZONE,
    tournament_start TIMESTAMP WITH TIME ZONE,
    tournament_end TIMESTAMP WITH TIME ZONE,
    current_round INTEGER DEFAULT 1,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tournament submissions (the bars entered by users)
CREATE TABLE tournament_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    artist_name VARCHAR(255) NOT NULL,
    song_title VARCHAR(255),
    bars_text TEXT NOT NULL, -- The 4 bars submitted
    artist_id UUID REFERENCES artists(id), -- Optional link to existing artist
    votes_received INTEGER DEFAULT 0,
    submission_rank INTEGER, -- For seeding purposes
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tournament bracket matchups
CREATE TABLE tournament_matchups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
    round_number INTEGER NOT NULL,
    matchup_number INTEGER NOT NULL, -- Position in the round (1, 2, 3, 4...)
    submission1_id UUID REFERENCES tournament_submissions(id),
    submission2_id UUID REFERENCES tournament_submissions(id),
    winner_id UUID REFERENCES tournament_submissions(id),
    votes_submission1 INTEGER DEFAULT 0,
    votes_submission2 INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'upcoming', -- 'upcoming', 'active', 'completed'
    voting_start TIMESTAMP WITH TIME ZONE,
    voting_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tournament votes from users
CREATE TABLE tournament_votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    matchup_id UUID REFERENCES tournament_matchups(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    submission_id UUID REFERENCES tournament_submissions(id), -- Which submission they voted for
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(matchup_id, user_id) -- One vote per user per matchup
);

-- Tournament predictions (bracket challenges)
CREATE TABLE tournament_predictions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    predicted_winner_id UUID REFERENCES tournament_submissions(id),
    predicted_bracket JSONB, -- Store entire bracket predictions
    points_earned INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tournament_id, user_id) -- One prediction per user per tournament
);

-- Row Level Security Policies
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_matchups ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_predictions ENABLE ROW LEVEL SECURITY;

-- Tournaments are viewable by everyone
CREATE POLICY "Tournaments are viewable by everyone" ON tournaments FOR SELECT USING (true);

-- Only authenticated users can create tournaments (you might want to restrict this further)
CREATE POLICY "Authenticated users can create tournaments" ON tournaments FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Tournament submissions are viewable by everyone
CREATE POLICY "Tournament submissions are viewable by everyone" ON tournament_submissions FOR SELECT USING (true);

-- Users can create their own submissions
CREATE POLICY "Users can create their own submissions" ON tournament_submissions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own submissions
CREATE POLICY "Users can update their own submissions" ON tournament_submissions FOR UPDATE USING (auth.uid() = user_id);

-- Tournament matchups are viewable by everyone
CREATE POLICY "Tournament matchups are viewable by everyone" ON tournament_matchups FOR SELECT USING (true);

-- Tournament votes are viewable by everyone
CREATE POLICY "Tournament votes are viewable by everyone" ON tournament_votes FOR SELECT USING (true);

-- Users can create their own votes
CREATE POLICY "Users can create their own votes" ON tournament_votes FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Tournament predictions are viewable by everyone
CREATE POLICY "Tournament predictions are viewable by everyone" ON tournament_predictions FOR SELECT USING (true);

-- Users can create and update their own predictions
CREATE POLICY "Users can manage their own predictions" ON tournament_predictions FOR ALL USING (auth.uid() = user_id);

-- Functions for tournament management
CREATE OR REPLACE FUNCTION advance_tournament_round(tournament_id_param UUID)
RETURNS void AS $$
DECLARE
    current_round_num INTEGER;
    matchup_record RECORD;
BEGIN
    -- Get current round
    SELECT current_round INTO current_round_num FROM tournaments WHERE id = tournament_id_param;
    
    -- Create next round matchups based on winners
    -- This would contain logic to pair up winners for the next round
    -- Implementation depends on bracket structure
    
    -- Update tournament to next round
    UPDATE tournaments SET current_round = current_round_num + 1 WHERE id = tournament_id_param;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate bracket predictions scoring
CREATE OR REPLACE FUNCTION calculate_prediction_points(tournament_id_param UUID)
RETURNS void AS $$
BEGIN
    -- Logic to award points based on correct predictions
    -- Different points for different rounds (more points for later rounds)
    -- This would be called when tournament advances or completes
    NULL;
END;
$$ LANGUAGE plpgsql;