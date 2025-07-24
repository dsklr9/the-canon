-- Tournament Management Functions and Sample Data

-- Function to create a new tournament
CREATE OR REPLACE FUNCTION create_tournament(
    title_param VARCHAR(255),
    description_param TEXT DEFAULT NULL,
    category_param VARCHAR(100) DEFAULT 'Best Bars',
    bracket_size_param INTEGER DEFAULT 16,
    submission_days INTEGER DEFAULT 7,
    tournament_days INTEGER DEFAULT 14
)
RETURNS UUID AS $$
DECLARE
    tournament_id UUID;
    submission_end_date TIMESTAMP WITH TIME ZONE;
    tournament_start_date TIMESTAMP WITH TIME ZONE;
    tournament_end_date TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Calculate dates
    submission_end_date := NOW() + (submission_days || ' days')::INTERVAL;
    tournament_start_date := submission_end_date + INTERVAL '1 day';
    tournament_end_date := tournament_start_date + (tournament_days || ' days')::INTERVAL;
    
    -- Insert tournament
    INSERT INTO tournaments (
        title,
        description,
        category,
        bracket_size,
        status,
        submission_start,
        submission_end,
        tournament_start,
        tournament_end,
        current_round
    ) VALUES (
        title_param,
        description_param,
        category_param,
        bracket_size_param,
        'submission',
        NOW(),
        submission_end_date,
        tournament_start_date,
        tournament_end_date,
        1
    ) RETURNING id INTO tournament_id;
    
    RETURN tournament_id;
END;
$$ LANGUAGE plpgsql;

-- Function to generate bracket matchups from submissions
CREATE OR REPLACE FUNCTION generate_bracket_matchups(tournament_id_param UUID)
RETURNS void AS $$
DECLARE
    submission_record RECORD;
    submissions_array UUID[];
    bracket_size INTEGER;
    round_num INTEGER := 1;
    matchup_num INTEGER := 1;
    i INTEGER;
BEGIN
    -- Get tournament bracket size
    SELECT tournaments.bracket_size INTO bracket_size 
    FROM tournaments 
    WHERE id = tournament_id_param;
    
    -- Get approved submissions ordered by votes/rating (for seeding)
    SELECT ARRAY_AGG(id ORDER BY votes_received DESC, created_at ASC) INTO submissions_array
    FROM tournament_submissions 
    WHERE tournament_id = tournament_id_param 
      AND status = 'approved'
    LIMIT bracket_size;
    
    -- Ensure we have enough submissions
    IF array_length(submissions_array, 1) < bracket_size THEN
        RAISE EXCEPTION 'Not enough approved submissions for bracket size %', bracket_size;
    END IF;
    
    -- Create first round matchups
    -- Pair submissions: 1 vs bracket_size, 2 vs bracket_size-1, etc.
    FOR i IN 1..bracket_size/2 LOOP
        INSERT INTO tournament_matchups (
            tournament_id,
            round_number,
            matchup_number,
            submission1_id,
            submission2_id,
            status,
            voting_start,
            voting_end
        ) VALUES (
            tournament_id_param,
            round_num,
            i,
            submissions_array[i],
            submissions_array[bracket_size - i + 1],
            'upcoming',
            NULL,
            NULL
        );
    END LOOP;
    
    -- Update tournament status
    UPDATE tournaments 
    SET status = 'voting' 
    WHERE id = tournament_id_param;
END;
$$ LANGUAGE plpgsql;

-- Function to advance tournament to next round
CREATE OR REPLACE FUNCTION advance_tournament_round(tournament_id_param UUID)
RETURNS void AS $$
DECLARE
    current_round_num INTEGER;
    next_round_num INTEGER;
    matchup_record RECORD;
    winners UUID[];
    bracket_size INTEGER;
    matchup_counter INTEGER := 1;
BEGIN
    -- Get current round and bracket size
    SELECT current_round, bracket_size INTO current_round_num, bracket_size
    FROM tournaments 
    WHERE id = tournament_id_param;
    
    next_round_num := current_round_num + 1;
    
    -- Check if tournament is complete
    IF bracket_size / (2^(current_round_num-1)) <= 2 THEN
        -- This was the final, mark tournament complete
        UPDATE tournaments 
        SET status = 'completed'
        WHERE id = tournament_id_param;
        RETURN;
    END IF;
    
    -- Get winners from current round
    SELECT ARRAY_AGG(winner_id ORDER BY matchup_number) INTO winners
    FROM tournament_matchups 
    WHERE tournament_id = tournament_id_param 
      AND round_number = current_round_num
      AND winner_id IS NOT NULL;
    
    -- Create next round matchups
    FOR i IN 1..array_length(winners, 1)/2 LOOP
        INSERT INTO tournament_matchups (
            tournament_id,
            round_number,
            matchup_number,
            submission1_id,
            submission2_id,
            status
        ) VALUES (
            tournament_id_param,
            next_round_num,
            i,
            winners[i*2-1],
            winners[i*2],
            'upcoming'
        );
    END LOOP;
    
    -- Update tournament current round
    UPDATE tournaments 
    SET current_round = next_round_num
    WHERE id = tournament_id_param;
END;
$$ LANGUAGE plpgsql;

-- Function to activate next matchup in current round
CREATE OR REPLACE FUNCTION activate_next_matchup(tournament_id_param UUID)
RETURNS UUID AS $$
DECLARE
    matchup_id UUID;
    voting_duration INTERVAL := '2 days'; -- Each matchup votes for 2 days
BEGIN
    -- Find the next upcoming matchup in current round
    SELECT id INTO matchup_id
    FROM tournament_matchups tm
    JOIN tournaments t ON tm.tournament_id = t.id
    WHERE tm.tournament_id = tournament_id_param
      AND tm.round_number = t.current_round
      AND tm.status = 'upcoming'
    ORDER BY tm.matchup_number
    LIMIT 1;
    
    IF matchup_id IS NOT NULL THEN
        -- Activate the matchup
        UPDATE tournament_matchups 
        SET 
            status = 'active',
            voting_start = NOW(),
            voting_end = NOW() + voting_duration
        WHERE id = matchup_id;
    END IF;
    
    RETURN matchup_id;
END;
$$ LANGUAGE plpgsql;

-- Function to close completed matchups and determine winners
CREATE OR REPLACE FUNCTION close_completed_matchups()
RETURNS void AS $$
DECLARE
    matchup_record RECORD;
    votes1 INTEGER;
    votes2 INTEGER;
    winner_id UUID;
BEGIN
    -- Find active matchups that have passed their voting deadline
    FOR matchup_record IN 
        SELECT * FROM tournament_matchups 
        WHERE status = 'active' 
          AND voting_end < NOW()
    LOOP
        -- Count votes for each submission
        SELECT COUNT(*) INTO votes1 
        FROM tournament_votes 
        WHERE matchup_id = matchup_record.id 
          AND submission_id = matchup_record.submission1_id;
          
        SELECT COUNT(*) INTO votes2 
        FROM tournament_votes 
        WHERE matchup_id = matchup_record.id 
          AND submission_id = matchup_record.submission2_id;
        
        -- Determine winner (in case of tie, submission1 wins)
        IF votes1 >= votes2 THEN
            winner_id := matchup_record.submission1_id;
        ELSE
            winner_id := matchup_record.submission2_id;
        END IF;
        
        -- Update matchup with results
        UPDATE tournament_matchups 
        SET 
            status = 'completed',
            winner_id = winner_id,
            votes_submission1 = votes1,
            votes_submission2 = votes2
        WHERE id = matchup_record.id;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Sample tournament creation
-- Run this to create a test tournament
/*
SELECT create_tournament(
    'March Madness: Best Bars 2024',
    'Submit your favorite 4 bars from any hip-hop artist. Community voting determines the ultimate winner!',
    'Best Bars',
    16,
    7,  -- 7 days for submissions
    21  -- 21 days for tournament
);
*/

-- Tournament management workflow:
-- 1. Create tournament: SELECT create_tournament(...)
-- 2. Users submit bars through the app
-- 3. Admin approves submissions: UPDATE tournament_submissions SET status = 'approved' WHERE ...
-- 4. Generate bracket: SELECT generate_bracket_matchups(tournament_id)
-- 5. Activate matchups: SELECT activate_next_matchup(tournament_id)
-- 6. Monitor and close: SELECT close_completed_matchups()
-- 7. Advance rounds: SELECT advance_tournament_round(tournament_id)