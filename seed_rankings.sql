-- Populate fake user rankings with realistic Top XX lists
-- Run this AFTER the first SQL file and AFTER checking your artist table

-- First, let's see what artists are available (run this first to check):
-- SELECT id, name FROM artists WHERE name IN (
--   'Nas', 'Jay-Z', 'The Notorious B.I.G.', 'Tupac Shakur', 'Kendrick Lamar',
--   'Eminem', 'Andre 3000', 'Ghostface Killah', 'Raekwon', 'GZA',
--   'Method Man', 'J. Cole', 'Drake', 'Lil Wayne', 'Kanye West',
--   'Pusha T', 'MF DOOM', 'Freddie Gibbs', 'JID', 'Danny Brown'
-- ) ORDER BY name;

-- REPLACE THE IDs BELOW WITH YOUR ACTUAL ARTIST IDs FROM THE QUERY ABOVE

-- HipHopHead92's East Coast heavy ranking
INSERT INTO ranking_artists (ranking_id, artist_id, position) VALUES 
('550e8400-e29b-41d4-a716-446655440101', 'YOUR_NAS_ID', 1),
('550e8400-e29b-41d4-a716-446655440101', 'YOUR_JAY_Z_ID', 2),
('550e8400-e29b-41d4-a716-446655440101', 'YOUR_BIGGIE_ID', 3),
('550e8400-e29b-41d4-a716-446655440101', 'YOUR_KENDRICK_ID', 4),
('550e8400-e29b-41d4-a716-446655440101', 'YOUR_GHOSTFACE_ID', 5),
('550e8400-e29b-41d4-a716-446655440101', 'YOUR_RAEKWON_ID', 6),
('550e8400-e29b-41d4-a716-446655440101', 'YOUR_PUSHA_T_ID', 7),
('550e8400-e29b-41d4-a716-446655440101', 'YOUR_EMINEM_ID', 8),
('550e8400-e29b-41d4-a716-446655440101', 'YOUR_GZA_ID', 9),
('550e8400-e29b-41d4-a716-446655440101', 'YOUR_J_COLE_ID', 10);

-- RealMusic88's Golden Era focused ranking  
INSERT INTO ranking_artists (ranking_id, artist_id, position) VALUES 
('550e8400-e29b-41d4-a716-446655440102', 'YOUR_TUPAC_ID', 1),
('550e8400-e29b-41d4-a716-446655440102', 'YOUR_BIGGIE_ID', 2),
('550e8400-e29b-41d4-a716-446655440102', 'YOUR_NAS_ID', 3),
('550e8400-e29b-41d4-a716-446655440102', 'YOUR_ANDRE_3000_ID', 4),
('550e8400-e29b-41d4-a716-446655440102', 'YOUR_METHOD_MAN_ID', 5),
('550e8400-e29b-41d4-a716-446655440102', 'YOUR_GHOSTFACE_ID', 6),
('550e8400-e29b-41d4-a716-446655440102', 'YOUR_JAY_Z_ID', 7),
('550e8400-e29b-41d4-a716-446655440102', 'YOUR_EMINEM_ID', 8),
('550e8400-e29b-41d4-a716-446655440102', 'YOUR_KENDRICK_ID', 9),
('550e8400-e29b-41d4-a716-446655440102', 'YOUR_KANYE_ID', 10);

-- GoldenEraVibes's 90s purist ranking
INSERT INTO ranking_artists (ranking_id, artist_id, position) VALUES 
('550e8400-e29b-41d4-a716-446655440103', 'YOUR_NAS_ID', 1),
('550e8400-e29b-41d4-a716-446655440103', 'YOUR_TUPAC_ID', 2),
('550e8400-e29b-41d4-a716-446655440103', 'YOUR_BIGGIE_ID', 3),
('550e8400-e29b-41d4-a716-446655440103', 'YOUR_RAEKWON_ID', 4),
('550e8400-e29b-41d4-a716-446655440103', 'YOUR_GZA_ID', 5),
('550e8400-e29b-41d4-a716-446655440103', 'YOUR_GHOSTFACE_ID', 6),
('550e8400-e29b-41d4-a716-446655440103', 'YOUR_METHOD_MAN_ID', 7),
('550e8400-e29b-41d4-a716-446655440103', 'YOUR_ANDRE_3000_ID', 8),
('550e8400-e29b-41d4-a716-446655440103', 'YOUR_EMINEM_ID', 9),
('550e8400-e29b-41d4-a716-446655440103', 'YOUR_LIL_WAYNE_ID', 10);

-- Add more fake users with different ranking styles
INSERT INTO rankings (
  id,
  user_id,
  title,
  category,
  created_at,
  updated_at
) VALUES 
(
  '550e8400-e29b-41d4-a716-446655440104',
  '550e8400-e29b-41d4-a716-446655440004',
  'Keesha Williams''s Top XX',
  NULL,
  NOW(),
  NOW()
),
(
  '550e8400-e29b-41d4-a716-446655440105',
  '550e8400-e29b-41d4-a716-446655440005',
  'Andre Thompson''s Top XX',
  NULL,
  NOW(),
  NOW()
);

-- BeatDisciple's modern hip-hop focused ranking
INSERT INTO ranking_artists (ranking_id, artist_id, position) VALUES 
('550e8400-e29b-41d4-a716-446655440104', 'YOUR_KENDRICK_ID', 1),
('550e8400-e29b-41d4-a716-446655440104', 'YOUR_J_COLE_ID', 2),
('550e8400-e29b-41d4-a716-446655440104', 'YOUR_DRAKE_ID', 3),
('550e8400-e29b-41d4-a716-446655440104', 'YOUR_NAS_ID', 4),
('550e8400-e29b-41d4-a716-446655440104', 'YOUR_JAY_Z_ID', 5),
('550e8400-e29b-41d4-a716-446655440104', 'YOUR_KANYE_ID', 6),
('550e8400-e29b-41d4-a716-446655440104', 'YOUR_LIL_WAYNE_ID', 7),
('550e8400-e29b-41d4-a716-446655440104', 'YOUR_PUSHA_T_ID', 8),
('550e8400-e29b-41d4-a716-446655440104', 'YOUR_FREDDIE_GIBBS_ID', 9),
('550e8400-e29b-41d4-a716-446655440104', 'YOUR_JID_ID', 10);

-- CypherSession's underground-leaning ranking
INSERT INTO ranking_artists (ranking_id, artist_id, position) VALUES 
('550e8400-e29b-41d4-a716-446655440105', 'YOUR_MF_DOOM_ID', 1),
('550e8400-e29b-41d4-a716-446655440105', 'YOUR_NAS_ID', 2),
('550e8400-e29b-41d4-a716-446655440105', 'YOUR_GHOSTFACE_ID', 3),
('550e8400-e29b-41d4-a716-446655440105', 'YOUR_FREDDIE_GIBBS_ID', 4),
('550e8400-e29b-41d4-a716-446655440105', 'YOUR_DANNY_BROWN_ID', 5),
('550e8400-e29b-41d4-a716-446655440105', 'YOUR_ANDRE_3000_ID', 6),
('550e8400-e29b-41d4-a716-446655440105', 'YOUR_KENDRICK_ID', 7),
('550e8400-e29b-41d4-a716-446655440105', 'YOUR_PUSHA_T_ID', 8),
('550e8400-e29b-41d4-a716-446655440105', 'YOUR_GZA_ID', 9),
('550e8400-e29b-41d4-a716-446655440105', 'YOUR_JAY_Z_ID', 10);

-- Instructions:
-- 1. Run: SELECT id, name FROM artists ORDER BY name;
-- 2. Replace all the YOUR_ARTIST_ID placeholders with actual IDs
-- 3. Run this SQL to populate the rankings