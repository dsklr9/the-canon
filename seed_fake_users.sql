-- Seed fake users, rankings, and debates for The Canon
-- Run this in your Supabase SQL editor

-- First, let's create some realistic fake users
INSERT INTO auth.users (
  id,
  email,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'hiphophead92@gmail.com', NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', false, 'authenticated'),
  ('550e8400-e29b-41d4-a716-446655440002', 'realmusic88@gmail.com', NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', false, 'authenticated'),
  ('550e8400-e29b-41d4-a716-446655440003', 'goldeneravibes@gmail.com', NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', false, 'authenticated'),
  ('550e8400-e29b-41d4-a716-446655440004', 'beatdisciple@gmail.com', NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', false, 'authenticated'),
  ('550e8400-e29b-41d4-a716-446655440005', 'cyphersession@gmail.com', NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', false, 'authenticated'),
  ('550e8400-e29b-41d4-a716-446655440006', 'lyricalgenius@gmail.com', NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', false, 'authenticated'),
  ('550e8400-e29b-41d4-a716-446655440007', 'streetpoetry@gmail.com', NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', false, 'authenticated'),
  ('550e8400-e29b-41d4-a716-446655440008', 'undergroundking@gmail.com', NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', false, 'authenticated'),
  ('550e8400-e29b-41d4-a716-446655440009', 'crunkera2004@gmail.com', NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', false, 'authenticated'),
  ('550e8400-e29b-41d4-a716-446655440010', 'dirtysouthfan@gmail.com', NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', false, 'authenticated');

-- Create profiles for these users
INSERT INTO profiles (
  id,
  username,
  display_name,
  profile_picture_url,
  created_at
) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'HipHopHead92', 'Marcus Johnson', 'https://djuoisgfwromkvtcenyd.supabase.co/storage/v1/object/public/profile-pictures/guy1.png', NOW()),
  ('550e8400-e29b-41d4-a716-446655440002', 'RealMusic88', 'Sofia Rodriguez', 'https://djuoisgfwromkvtcenyd.supabase.co/storage/v1/object/public/profile-pictures/gal1.png', NOW()),
  ('550e8400-e29b-41d4-a716-446655440003', 'GoldenEraVibes', 'DJ Nostalgia', 'https://djuoisgfwromkvtcenyd.supabase.co/storage/v1/object/public/profile-pictures/dude1.png', NOW()),
  ('550e8400-e29b-41d4-a716-446655440004', 'BeatDisciple', 'Keesha Williams', 'https://djuoisgfwromkvtcenyd.supabase.co/storage/v1/object/public/profile-pictures/gal2.png', NOW()),
  ('550e8400-e29b-41d4-a716-446655440005', 'CypherSession', 'Andre Thompson', 'https://djuoisgfwromkvtcenyd.supabase.co/storage/v1/object/public/profile-pictures/guy2.png', NOW()),
  ('550e8400-e29b-41d4-a716-446655440006', 'LyricalGenius', 'Maya Patel', 'https://djuoisgfwromkvtcenyd.supabase.co/storage/v1/object/public/profile-pictures/gal3.png', NOW()),
  ('550e8400-e29b-41d4-a716-446655440007', 'StreetPoetry', 'Jamal Washington', 'https://djuoisgfwromkvtcenyd.supabase.co/storage/v1/object/public/profile-pictures/dude2.png', NOW()),
  ('550e8400-e29b-41d4-a716-446655440008', 'UndergroundKing', 'Alex Chen', 'https://djuoisgfwromkvtcenyd.supabase.co/storage/v1/object/public/profile-pictures/guy3.png', NOW()),
  ('550e8400-e29b-41d4-a716-446655440009', 'CrunkEra2004', 'DeAndre Mitchell', 'https://djuoisgfwromkvtcenyd.supabase.co/storage/v1/object/public/profile-pictures/dude3.png', NOW()),
  ('550e8400-e29b-41d4-a716-446655440010', 'DirtySouthFan', 'Ashley Taylor', 'https://djuoisgfwromkvtcenyd.supabase.co/storage/v1/object/public/profile-pictures/gal4.png', NOW());

-- Create rankings (Top XX lists) for each fake user
-- First user's ranking - HipHopHead92 (East Coast focused)
INSERT INTO rankings (
  id,
  user_id,
  list_title,
  list_type,
  is_all_time,
  created_at,
  updated_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655440101',
  '550e8400-e29b-41d4-a716-446655440001',
  'Marcus Johnson''s Top XX',
  'all-time',
  true,
  NOW(),
  NOW()
);

-- Second user's ranking - RealMusic88 (Golden era focused)
INSERT INTO rankings (
  id,
  user_id,
  list_title,
  list_type,
  is_all_time,
  created_at,
  updated_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655440102',
  '550e8400-e29b-41d4-a716-446655440002',
  'Sofia Rodriguez''s Top XX',
  'all-time',
  true,
  NOW(),
  NOW()
);

-- Third user's ranking - GoldenEraVibes (90s purist)
INSERT INTO rankings (
  id,
  user_id,
  list_title,
  list_type,
  is_all_time,
  created_at,
  updated_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655440103',
  '550e8400-e29b-41d4-a716-446655440003',
  'DJ Nostalgia''s Top XX',
  'all-time',
  true,
  NOW(),
  NOW()
);

-- Fourth user's ranking - CrunkEra2004 (Early 2000s southern focused)
INSERT INTO rankings (
  id,
  user_id,
  list_title,
  list_type,
  is_all_time,
  created_at,
  updated_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655440109',
  '550e8400-e29b-41d4-a716-446655440009',
  'DeAndre Mitchell''s Top XX',
  'all-time',
  true,
  NOW(),
  NOW()
);

-- Fifth user's ranking - DirtySouthFan (Early 2000s Atlanta/Houston)
INSERT INTO rankings (
  id,
  user_id,
  list_title,
  list_type,
  is_all_time,
  created_at,
  updated_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655440110',
  '550e8400-e29b-41d4-a716-446655440010',
  'Ashley Taylor''s Top XX',
  'all-time',
  true,
  NOW(),
  NOW()
);

-- Create some debates with the topics you requested
INSERT INTO debates (
  id,
  author_id,
  title,
  content,
  artist_tags,
  created_at
) VALUES 
  (
    '550e8400-e29b-41d4-a716-446655440201',
    '550e8400-e29b-41d4-a716-446655440001',
    'Clipse Album of the Year',
    'Hot take: Clipse''s "Let God Sort ''Em Out" is hands down the album of the year. The bars, the production, the chemistry between Pusha T and Malice - it''s peak hip-hop. Nothing else even comes close.',
    ARRAY[4256, 4257]::integer[],  -- Pusha T, Malice
    NOW()
  ),
  (
    '550e8400-e29b-41d4-a716-446655440202',
    '550e8400-e29b-41d4-a716-446655440002',
    'Jay-Z in Wu-Tang?',
    'Controversial opinion: Jay-Z would NOT be a top 3 member if he was in Wu-Tang Clan. Ghostface, GZA, Raekwon, and Method Man all have better catalogs bar for bar. Fight me.',
    ARRAY[3769, 3760, 3757, 3759, 3758]::integer[],  -- Jay-Z, Ghostface, GZA, Raekwon, Method Man
    NOW()
  ),
  (
    '550e8400-e29b-41d4-a716-446655440203',
    '550e8400-e29b-41d4-a716-446655440003',
    'Wayne vs Hov: Peak Years',
    'I''m ready to die on this hill: Lil Wayne in his prime (2005-2010) was better than Jay-Z has ever been. The wordplay, the flow switches, the hunger - Wayne was untouchable. Hov got longevity but Wayne got that magic.',
    ARRAY[3956, 3769]::integer[],  -- Lil Wayne, Jay-Z
    NOW()
  ),
  (
    '550e8400-e29b-41d4-a716-446655440204',
    '550e8400-e29b-41d4-a716-446655440009',
    'The South Changed Hip-Hop Forever',
    'Y''all can keep debating NY vs LA, but the 2000s belonged to the SOUTH. Jeezy, T.I., Ludacris ran the game while y''all were stuck in the past. Crunk music, trap beats, the whole sound of hip-hop today? That''s all us. Put some respect on it.',
    ARRAY[3958, 3957, 3961]::integer[],  -- Jeezy, T.I., Ludacris
    NOW()
  );

-- Note: You'll need to run additional queries to:
-- 1. Get artist IDs from your artists table and insert ranking_artists for each fake user
-- 2. Link the mentioned artists in debates (this requires your artist tagging system)

-- Example for first user's ranking items (you'll need to replace with actual artist IDs):
-- INSERT INTO ranking_artists (ranking_id, artist_id, position) VALUES 
-- ('550e8400-e29b-41d4-a716-446655440101', 'nas-artist-id', 1),
-- ('550e8400-e29b-41d4-a716-446655440101', 'jay-z-artist-id', 2),
-- etc...

-- To get your actual artist IDs, run:
SELECT id, name FROM artists ORDER BY name;