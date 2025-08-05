# Setting Up Fake Users and Debates

This guide will help you populate your platform with realistic fake users, rankings, and debate content to seed engagement.

## 🎭 **Step 1: Create Fake Users**

1. **Run the first SQL file** in your Supabase SQL Editor:
   ```sql
   -- Copy and paste contents of seed_fake_users.sql
   ```
   This creates:
   - 8 fake users with realistic usernames and names
   - Professional profile pictures from Unsplash
   - Proper auth.users and profiles entries

## 📊 **Step 2: Get Your Artist IDs**

1. **Find your artist IDs** by running this in Supabase:
   ```sql
   SELECT id, name FROM artists WHERE name IN (
     'Nas', 'Jay-Z', 'The Notorious B.I.G.', 'Tupac Shakur', 'Kendrick Lamar',
     'Eminem', 'Andre 3000', 'Ghostface Killah', 'Raekwon', 'GZA',
     'Method Man', 'J. Cole', 'Drake', 'Lil Wayne', 'Kanye West',
     'Pusha T', 'MF DOOM', 'Freddie Gibbs', 'JID', 'Danny Brown'
   ) ORDER BY name;
   ```

2. **Copy the results** and note the ID for each artist

## 📝 **Step 3: Create Rankings**

1. **Edit seed_rankings.sql**:
   - Replace all `YOUR_ARTIST_ID` placeholders with actual IDs from Step 2
   - Example: Replace `YOUR_NAS_ID` with the actual UUID for Nas

2. **Run the edited SQL** in Supabase to create:
   - 5 different Top XX rankings with varied styles
   - **HipHopHead92**: East Coast heavy (Nas, Jay-Z, Biggie...)
   - **RealMusic88**: Golden Era focused (Tupac, Biggie, Nas...)
   - **GoldenEraVibes**: 90s purist (Nas, Tupac, Wu-Tang...)
   - **BeatDisciple**: Modern focus (Kendrick, J. Cole, Drake...)
   - **CypherSession**: Underground leaning (MF DOOM, Freddie Gibbs...)

## 🔥 **Step 4: Artist Tagging for Debates**

The debates are created but need artist tagging. You'll need to:

1. **Find the artist IDs** for the mentioned artists:
   ```sql
   SELECT id, name FROM artists WHERE name IN (
     'Pusha T', 'Malice', 'Jay-Z', 'Ghostface Killah', 
     'GZA', 'Raekwon', 'Method Man', 'Lil Wayne'
   );
   ```

2. **Link artists to debates** (if your system supports it):
   - **Debate 1**: Tag Pusha T and Malice for the Clipse album debate
   - **Debate 2**: Tag Jay-Z, Ghostface, GZA, Raekwon, Method Man for Wu-Tang debate
   - **Debate 3**: Tag Lil Wayne and Jay-Z for the Wayne vs Hov debate

## 🎯 **Debate Topics Created**

1. **"Clipse Album of the Year"** 
   - Claims "Let God Sort 'Em Out" is the best album
   - Tags: @pusha-t @malice

2. **"Jay-Z in Wu-Tang"**
   - Argues Jay-Z wouldn't be top 3 in Wu-Tang
   - Tags: @jay-z @ghostface @gza @raekwon @method-man

3. **"Wayne vs Jay-Z Prime"**
   - Claims Lil Wayne's 2005-2010 run > Jay-Z's peak
   - Tags: @lil-wayne @jay-z

## 📸 **Avatar System**

The preset avatar system is now live! Users can:
- **Choose from 16 curated avatars** in profile settings
- **Upload custom images** as before
- **See beautiful hover effects** and grid layout

## 🚀 **Expected Results**

After setup, your platform will have:
- **8 active-looking users** with complete profiles and Top XX lists
- **Varied musical tastes** ensuring compatibility variety  
- **3 spicy debate topics** designed to generate discussion
- **Professional avatar options** for new users

## 💡 **Pro Tips**

- **Stagger the setup** over a few days to look more organic
- **Add more debates** using similar controversial takes
- **Create some replies** to the debates for added authenticity
- **Consider adding face-off votes** between the fake users

This should give your platform the social proof and activity needed to engage real users from day one!

---

**Ready to deploy?** Push your changes and run the SQL files in sequence. Your compatibility system will immediately start showing connections between these users based on their rankings!