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
INSERT INTO ranking_items (ranking_id, artist_id, position) VALUES 
('550e8400-e29b-41d4-a716-446655440101', 3768, 1),  -- Nas
('550e8400-e29b-41d4-a716-446655440101', 3769, 2),  -- Jay-Z
('550e8400-e29b-41d4-a716-446655440101', 3770, 3),  -- The Notorious B.I.G.
('550e8400-e29b-41d4-a716-446655440101', 4030, 4),  -- Kendrick Lamar
('550e8400-e29b-41d4-a716-446655440101', 3760, 5),  -- Ghostface Killah
('550e8400-e29b-41d4-a716-446655440101', 3759, 6),  -- Raekwon
('550e8400-e29b-41d4-a716-446655440101', 4256, 7),  -- Pusha T
('550e8400-e29b-41d4-a716-446655440101', 3953, 8),  -- Eminem
('550e8400-e29b-41d4-a716-446655440101', 3757, 9),  -- GZA
('550e8400-e29b-41d4-a716-446655440101', 4031, 10); -- J. Cole

-- RealMusic88's Golden Era focused ranking  
INSERT INTO ranking_items (ranking_id, artist_id, position) VALUES 
('550e8400-e29b-41d4-a716-446655440102', 3771, 1),  -- 2Pac
('550e8400-e29b-41d4-a716-446655440102', 3770, 2),  -- The Notorious B.I.G.
('550e8400-e29b-41d4-a716-446655440102', 3768, 3),  -- Nas
('550e8400-e29b-41d4-a716-446655440102', 3783, 4),  -- Andre 3000
('550e8400-e29b-41d4-a716-446655440102', 3758, 5),  -- Method Man
('550e8400-e29b-41d4-a716-446655440102', 3760, 6),  -- Ghostface Killah
('550e8400-e29b-41d4-a716-446655440102', 3769, 7),  -- Jay-Z
('550e8400-e29b-41d4-a716-446655440102', 3953, 8),  -- Eminem
('550e8400-e29b-41d4-a716-446655440102', 4030, 9),  -- Kendrick Lamar
('550e8400-e29b-41d4-a716-446655440102', 3955, 10); -- Kanye West

-- GoldenEraVibes's 90s purist ranking
INSERT INTO ranking_items (ranking_id, artist_id, position) VALUES 
('550e8400-e29b-41d4-a716-446655440103', 3768, 1),  -- Nas
('550e8400-e29b-41d4-a716-446655440103', 3771, 2),  -- 2Pac
('550e8400-e29b-41d4-a716-446655440103', 3770, 3),  -- The Notorious B.I.G.
('550e8400-e29b-41d4-a716-446655440103', 3759, 4),  -- Raekwon
('550e8400-e29b-41d4-a716-446655440103', 3757, 5),  -- GZA
('550e8400-e29b-41d4-a716-446655440103', 3760, 6),  -- Ghostface Killah
('550e8400-e29b-41d4-a716-446655440103', 3758, 7),  -- Method Man
('550e8400-e29b-41d4-a716-446655440103', 3783, 8),  -- Andre 3000
('550e8400-e29b-41d4-a716-446655440103', 3953, 9),  -- Eminem
('550e8400-e29b-41d4-a716-446655440103', 3956, 10); -- Lil Wayne

-- Add more fake users with different ranking styles
INSERT INTO rankings (
  id,
  user_id,
  list_title,
  list_type,
  is_all_time,
  created_at,
  updated_at
) VALUES 
(
  '550e8400-e29b-41d4-a716-446655440104',
  '550e8400-e29b-41d4-a716-446655440004',
  'Keesha Williams''s Top XX',
  'all-time',
  true,
  NOW(),
  NOW()
),
(
  '550e8400-e29b-41d4-a716-446655440105',
  '550e8400-e29b-41d4-a716-446655440005',
  'Andre Thompson''s Top XX',
  'all-time',
  true,
  NOW(),
  NOW()
),
(
  '550e8400-e29b-41d4-a716-446655440106',
  '550e8400-e29b-41d4-a716-446655440006',
  'Maya Patel''s Top XX',
  'all-time',
  true,
  NOW(),
  NOW()
),
(
  '550e8400-e29b-41d4-a716-446655440107',
  '550e8400-e29b-41d4-a716-446655440007',
  'Jamal Washington''s Top XX',
  'all-time',
  true,
  NOW(),
  NOW()
),
(
  '550e8400-e29b-41d4-a716-446655440108',
  '550e8400-e29b-41d4-a716-446655440008',
  'Alex Chen''s Top XX',
  'all-time',
  true,
  NOW(),
  NOW()
);

-- BeatDisciple's modern hip-hop focused ranking
INSERT INTO ranking_items (ranking_id, artist_id, position) VALUES 
('550e8400-e29b-41d4-a716-446655440104', 4030, 1),  -- Kendrick Lamar
('550e8400-e29b-41d4-a716-446655440104', 4031, 2),  -- J. Cole
('550e8400-e29b-41d4-a716-446655440104', 4032, 3),  -- Drake
('550e8400-e29b-41d4-a716-446655440104', 3768, 4),  -- Nas
('550e8400-e29b-41d4-a716-446655440104', 3769, 5),  -- Jay-Z
('550e8400-e29b-41d4-a716-446655440104', 3955, 6),  -- Kanye West
('550e8400-e29b-41d4-a716-446655440104', 3956, 7),  -- Lil Wayne
('550e8400-e29b-41d4-a716-446655440104', 4256, 8),  -- Pusha T
('550e8400-e29b-41d4-a716-446655440104', 4260, 9),  -- Freddie Gibbs
('550e8400-e29b-41d4-a716-446655440104', 3854, 10); -- JID

-- CypherSession's underground-leaning ranking
INSERT INTO ranking_items (ranking_id, artist_id, position) VALUES 
('550e8400-e29b-41d4-a716-446655440105', 4004, 1),  -- MF DOOM
('550e8400-e29b-41d4-a716-446655440105', 3768, 2),  -- Nas
('550e8400-e29b-41d4-a716-446655440105', 3760, 3),  -- Ghostface Killah
('550e8400-e29b-41d4-a716-446655440105', 4260, 4),  -- Freddie Gibbs
('550e8400-e29b-41d4-a716-446655440105', 4008, 5),  -- Danny Brown
('550e8400-e29b-41d4-a716-446655440105', 3783, 6),  -- Andre 3000
('550e8400-e29b-41d4-a716-446655440105', 4030, 7),  -- Kendrick Lamar
('550e8400-e29b-41d4-a716-446655440105', 4256, 8),  -- Pusha T
('550e8400-e29b-41d4-a716-446655440105', 3757, 9),  -- GZA
('550e8400-e29b-41d4-a716-446655440105', 3769, 10); -- Jay-Z

-- LyricalGenius's lyrical-focused ranking
INSERT INTO ranking_items (ranking_id, artist_id, position) VALUES 
('550e8400-e29b-41d4-a716-446655440106', 3783, 1),  -- Andre 3000
('550e8400-e29b-41d4-a716-446655440106', 3768, 2),  -- Nas
('550e8400-e29b-41d4-a716-446655440106', 4030, 3),  -- Kendrick Lamar
('550e8400-e29b-41d4-a716-446655440106', 3757, 4),  -- GZA
('550e8400-e29b-41d4-a716-446655440106', 3769, 5),  -- Jay-Z
('550e8400-e29b-41d4-a716-446655440106', 3953, 6),  -- Eminem
('550e8400-e29b-41d4-a716-446655440106', 3760, 7),  -- Ghostface Killah
('550e8400-e29b-41d4-a716-446655440106', 4004, 8),  -- MF DOOM
('550e8400-e29b-41d4-a716-446655440106', 4031, 9),  -- J. Cole
('550e8400-e29b-41d4-a716-446655440106', 3854, 10); -- JID

-- StreetPoetry's streets-focused ranking
INSERT INTO ranking_items (ranking_id, artist_id, position) VALUES 
('550e8400-e29b-41d4-a716-446655440107', 3771, 1),  -- 2Pac
('550e8400-e29b-41d4-a716-446655440107', 3770, 2),  -- The Notorious B.I.G.
('550e8400-e29b-41d4-a716-446655440107', 3769, 3),  -- Jay-Z
('550e8400-e29b-41d4-a716-446655440107', 4260, 4),  -- Freddie Gibbs
('550e8400-e29b-41d4-a716-446655440107', 4256, 5),  -- Pusha T
('550e8400-e29b-41d4-a716-446655440107', 3760, 6),  -- Ghostface Killah
('550e8400-e29b-41d4-a716-446655440107', 3759, 7),  -- Raekwon
('550e8400-e29b-41d4-a716-446655440107', 3768, 8),  -- Nas
('550e8400-e29b-41d4-a716-446655440107', 3956, 9),  -- Lil Wayne
('550e8400-e29b-41d4-a716-446655440107', 4008, 10); -- Danny Brown

-- UndergroundKing's underground-heavy ranking
INSERT INTO ranking_items (ranking_id, artist_id, position) VALUES 
('550e8400-e29b-41d4-a716-446655440108', 4004, 1),  -- MF DOOM
('550e8400-e29b-41d4-a716-446655440108', 4008, 2),  -- Danny Brown
('550e8400-e29b-41d4-a716-446655440108', 4260, 3),  -- Freddie Gibbs
('550e8400-e29b-41d4-a716-446655440108', 3854, 4),  -- JID
('550e8400-e29b-41d4-a716-446655440108', 3760, 5),  -- Ghostface Killah
('550e8400-e29b-41d4-a716-446655440108', 3757, 6),  -- GZA
('550e8400-e29b-41d4-a716-446655440108', 3783, 7),  -- Andre 3000
('550e8400-e29b-41d4-a716-446655440108', 4256, 8),  -- Pusha T
('550e8400-e29b-41d4-a716-446655440108', 4030, 9),  -- Kendrick Lamar
('550e8400-e29b-41d4-a716-446655440108', 3768, 10); -- Nas

-- CrunkEra2004's early 2000s southern ranking
INSERT INTO ranking_items (ranking_id, artist_id, position) VALUES 
('550e8400-e29b-41d4-a716-446655440109', 3958, 1),  -- Jeezy
('550e8400-e29b-41d4-a716-446655440109', 3957, 2),  -- T.I.
('550e8400-e29b-41d4-a716-446655440109', 3956, 3),  -- Lil Wayne
('550e8400-e29b-41d4-a716-446655440109', 3961, 4),  -- Ludacris
('550e8400-e29b-41d4-a716-446655440109', 3792, 5),  -- Krayzie Bone
('550e8400-e29b-41d4-a716-446655440109', 3959, 6),  -- Rick Ross
('550e8400-e29b-41d4-a716-446655440109', 3967, 7),  -- Fabolous
('550e8400-e29b-41d4-a716-446655440109', 3960, 8),  -- The Game
('550e8400-e29b-41d4-a716-446655440109', 3810, 9),  -- Fat Joe
('550e8400-e29b-41d4-a716-446655440109', 3769, 10); -- Jay-Z

-- DirtySouthFan's early 2000s Atlanta/Houston ranking
INSERT INTO ranking_items (ranking_id, artist_id, position) VALUES 
('550e8400-e29b-41d4-a716-446655440110', 3961, 1),  -- Ludacris
('550e8400-e29b-41d4-a716-446655440110', 3957, 2),  -- T.I.
('550e8400-e29b-41d4-a716-446655440110', 3780, 3),  -- Master P
('550e8400-e29b-41d4-a716-446655440110', 3781, 4),  -- Juvenile
('550e8400-e29b-41d4-a716-446655440110', 3789, 5),  -- Pimp C
('550e8400-e29b-41d4-a716-446655440110', 3790, 6),  -- Bun B
('550e8400-e29b-41d4-a716-446655440110', 3972, 7),  -- Freeway
('550e8400-e29b-41d4-a716-446655440110', 3813, 8),  -- Cam'ron
('550e8400-e29b-41d4-a716-446655440110', 3958, 9),  -- Jeezy
('550e8400-e29b-41d4-a716-446655440110', 3793, 10); -- Bizzy Bone

-- Note: In the debates, we mention:
-- Pusha T (4256), Jay-Z (3769), Ghostface Killah (3760), 
-- GZA (3757), Raekwon (3759), Method Man (3758), Lil Wayne (3956)
-- Malice is mentioned but not in the artist list (ID 4257 in the list)