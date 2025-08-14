-- Remove groups/collectives and keep only individual rappers
-- This removes groups but preserves notable individual members

-- Remove groups but keep individual members
DELETE FROM artists WHERE name IN (
-- **GROUPS TO REMOVE**
'Run-DMC',
'Beastie Boys', 
'De La Soul',
'A Tribe Called Quest',
'Jungle Brothers',
'Digital Underground',
'Wu-Tang Clan',
'Gang Starr',
'Pete Rock & CL Smooth',
'Eric B. & Rakim',
'EPMD',
'Public Enemy',
'Boogie Down Productions',
'Group Home',
'Leaders of the New School',
'Das EFX',
'Black Moon',
'Smif-N-Wessun',
'Heltah Skeltah',
'M.O.P.',
'Onyx',
'Naughty by Nature',
'House of Pain',
'Cypress Hill',
'Fu-Schnickens',
'Lords of the Underground',
'Brand Nubian',
'Nice & Smooth',
'Freestyle Fellowship',
'Hieroglyphics',
'Pharcyde',
'Digable Planets',
'Crucial Conflict',
'Do or Die',
'Psychodrama',
'Geto Boys',
'Goodie Mob',
'Dungeon Family',
'Arrested Development',
'Nappy Roots',
'Dilated Peoples',
'Jurassic 5',
'Binary Star',
'Reflection Eternal',
'Black Star',
'Dead Prez',
'The Roots',
'Blackalicious',
'Souls of Mischief',
'Living Legends',
'Zion I',
'Atmosphere',
'Cannibal Ox',
'Company Flow',
'X Clan',
'The Coup',
'Organized Konfusion',
'Ultramagnetic MCs',
'Stetsasonic',
'Salt-N-Pepa',
'Bytches With Problems',
'H.W.A.',
'J.J. Fad',
'Three 6 Mafia',
'Hot Boys',
'Cash Money Records',
'Cash Money Millionaires',
'504 Boyz',
'TRU',
'Partners-N-Crime',
'Big Tymers',
'City Girls',
'UGK',
'Screwed Up Click',
'S.U.C.',
'Botany Boyz',
'8Ball & MJG',
'OutKast',
'Migos',
'Ying Yang Twins',
'Youngbloodz',
'YoungBloodZ',
'Playaz Circle',
'Travis Porter',
'Dem Franchize Boyz',
'D4L',
'Crime Mob',
'Cherish',
'Trillville',
'Run the Jewels',
'EARTHGANG',
'clipping.',
'Death Grips',
'Armand Hammer',
'ShrapKnel',
'Raider Klan',
'Griselda',
'UNLV',
'Comptons Most Wanted',
'Above the Law',
'Tha Alkaholiks',
'The Pharcyde',
'Souls of Mischief',
'Slum Village',
'Frank-N-Dank',
'Rob Base & DJ E-Z Rock',
'Tag Team',
'95 South',
'69 Boyz',
'Quad City DJs',
'Ghost Town DJs',
'Wreckx-N-Effect',
'Bell Biv DeVoe',
'The UMCs',
'3rd Bass',
'Young Black Teenagers',
'IAM',
'NTM',
'2 Live Crew',
'Poison Clan',
'ICP',
'House of Krazees',
'Bone Thugs-N-Harmony',
'MC Solaar',
'Dizzee Rascal',
'JME',
'Dave',
'AJ Tracey',
'Headie One',
'Central Cee',
'Little Simz',
'Tierra Whack',
'Princess Nokia',
'Rico Nasty',
'Kali Uchis',
'Doja Cat',
'Megan Thee Stallion',
'Saweetie',
'Latto',
'BIA',
'MIKE',
'Navy Blue',
'Pink Siifu',
'Liv.e',
'Slauson Malone',
'Maxo',
'Ovrkast.',
'Xavier Wulf',
'Chris Travis',
'Sheff G',
'Sleepy Hallow',
'22Gz',
'Bizzy Banks',
'Army of the Pharaohs',
'Demigodz',
'Jedi Mind Tricks',
'Handsome Boy Modeling School',
'Lovage',
'Gnarls Barkley',
'Deltron 3030',
'Dr. Octagon',
'Black Elvis',
'213',
'Tha Dogg Pound',
'Kane & Abel',
'Skull Duggery',
'Beats by the Pound',
'Magnolia Shorty',
'Three Times Dope',
'Cash Money & Marvelous',
'Finesse & Synquis'
);

-- Add back individual members who are notable solo artists
INSERT INTO artists (name, era, avatar_emoji, heat_score, classics_count) VALUES
-- **FROM WU-TANG CLAN**
('RZA', '90s', '⚔️', 88, 4),
('GZA', '90s', '🧠', 85, 3),
('Method Man', '90s', '🎭', 82, 3),
('Raekwon', '90s', '👑', 80, 2),
('Ghostface Killah', '90s', '👻', 85, 4),
('Inspectah Deck', '90s', '🔍', 75, 2),
('U-God', '90s', '🙏', 68, 1),
('Masta Killa', '90s', '⚔️', 65, 1),
('Cappadonna', '90s', '🎯', 62, 1),

-- **FROM OUTLAST**
('Andre 3000', '90s', '🚀', 92, 4),
('Big Boi', '90s', '🐘', 85, 3),

-- **FROM GANG STARR**
('Guru', '90s', '🧘', 85, 3),
('DJ Premier', '90s', '👑', 88, 4),

-- **FROM PUBLIC ENEMY**
('Chuck D', '80s', '📢', 90, 4),
('Flavor Flav', '80s', '⏰', 70, 2),

-- **FROM ERIC B. & RAKIM**
('Rakim', '80s', '🕌', 95, 4),
('Eric B.', '80s', '🎛️', 70, 2),

-- **FROM EPMD**
('Erick Sermon', '90s', '📖', 75, 2),
('PMD', '80s', '🎤', 70, 2),

-- **FROM PETE ROCK & CL SMOOTH**
('Pete Rock', '90s', '🪨', 85, 3),
('CL Smooth', '90s', '😎', 75, 2),

-- **FROM BLACK STAR**
('Mos Def', '90s', '⭐', 88, 3),
('Talib Kweli', '90s', '📚', 82, 3),

-- **FROM GETO BOYS**
('Scarface', '90s', '😤', 92, 5),
('Willie D', '90s', '🔥', 78, 2),
('Bushwick Bill', '90s', '👨‍🦲', 75, 2),

-- **FROM UGK**
('Bun B', '90s', '🅱️', 85, 3),
('Pimp C', '90s', '👑', 88, 3),

-- **FROM MIGOS**
('Quavo', '2010s', '🦅', 78, 2),
('Offset', '2010s', '🔄', 75, 2),
('Takeoff', '2010s', '🚀', 75, 2),

-- **FROM THREE 6 MAFIA**
('DJ Paul', '90s', '🎧', 75, 2),
('Juicy J', '90s', '🧃', 82, 3),
('Lord Infamous', '90s', '👹', 72, 2),
('Gangsta Boo', '90s', '👻', 78, 2),

-- **FROM 8BALL & MJG**
('8Ball', '90s', '🎱', 75, 2),
('MJG', '90s', '🎯', 75, 2),

-- **FROM RUN THE JEWELS**
('Killer Mike', '2000s', '🔫', 88, 3),
('EL-P', '2000s', '🎹', 85, 3),

-- **FROM BONE THUGS-N-HARMONY**
('Bizzy Bone', '90s', '💀', 70, 2),
('Layzie Bone', '90s', '💀', 68, 2),
('Krayzie Bone', '90s', '💀', 75, 2),
('Wish Bone', '90s', '💀', 65, 1),
('Flesh-N-Bone', '90s', '💀', 65, 1),

-- **FROM NAUGHTY BY NATURE**
('Treach', '90s', '🎯', 78, 2),

-- **FROM CYPRESS HILL**
('B-Real', '90s', '🌿', 75, 3),
('Sen Dog', '90s', '🐕', 65, 2),

-- **FROM M.O.P.**
('Billy Danze', '90s', '💥', 72, 2),
('Lil Fame', '90s', '🔥', 72, 2),

-- **FROM ONYX**
('Sticky Fingaz', '90s', '👆', 70, 2),
('Fredro Starr', '90s', '⭐', 65, 1),

-- **FROM DE LA SOUL**
('Posdnuos', '80s', '🌻', 78, 3),
('Trugoy', '80s', '🎯', 75, 2),
('Maseo', '80s', '🎛️', 70, 2),

-- **FROM A TRIBE CALLED QUEST**
('Q-Tip', '80s', '🎯', 88, 4),
('Phife Dawg', '80s', '🐕', 82, 3),
('Ali Shaheed Muhammad', '80s', '🎛️', 70, 2),

-- **FROM BEASTIE BOYS**
('Mike D', '80s', '🎤', 75, 2),
('MCA', '80s', '🎤', 75, 2),
('Ad-Rock', '80s', '🎤', 72, 2),

-- **FROM GOODIE MOB**
('CeeLo Green', '90s', '💚', 78, 2),
('Big Gipp', '90s', '🐘', 65, 1),
('Khujo', '90s', '🎯', 62, 1),
('T-Mo', '90s', '🎭', 60, 1)

ON CONFLICT DO NOTHING;