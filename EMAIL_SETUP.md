# Email Notification Setup for Challenge System

## Overview
Email notifications have been added for when users receive challenges. The implementation includes:
1. Email preference setting in user settings
2. In-app notification creation
3. Email sending via Supabase Edge Function

## Setup Instructions

### 1. Database Changes
Add the `friend_challenges` column to your `email_subscriptions` table if it doesn't exist:

```sql
ALTER TABLE email_subscriptions 
ADD COLUMN friend_challenges BOOLEAN DEFAULT true;
```

### 2. Deploy the Edge Function
Deploy the email sending Edge Function to Supabase:

```bash
supabase functions deploy send-challenge-email
```

### 3. Set Up Email Service (Choose One)

#### Option A: Using Resend (Recommended)
1. Sign up at https://resend.com
2. Get your API key
3. Add to Supabase Edge Function secrets:
   ```bash
   supabase secrets set RESEND_API_KEY=your_api_key_here
   ```
4. Update the Edge Function to use Resend (uncomment the Resend code in the function)

#### Option B: Using SendGrid
1. Sign up at https://sendgrid.com
2. Get your API key
3. Add to Supabase Edge Function secrets:
   ```bash
   supabase secrets set SENDGRID_API_KEY=your_api_key_here
   ```
4. Update the Edge Function to use SendGrid API

### 4. Testing
1. Create a test account with a real email
2. Enable "Friend challenges" in email settings
3. Send a challenge from another account
4. Verify email is received

## How It Works

1. When a user sends a challenge, the `createChallengeNotification` function is called
2. It creates an in-app notification in the `notifications` table
3. It checks if the challenged user has `friend_challenges` enabled in `email_subscriptions`
4. If enabled, it calls the Edge Function with challenge details
5. The Edge Function securely retrieves the user's email and sends the notification

## Email Template
The email includes:
- Challenger's name
- Challenge type (random or custom)
- Optional message from challenger
- Link to view/accept the challenge
- Unsubscribe information

## Troubleshooting
- Check Edge Function logs: `supabase functions logs send-challenge-email`
- Verify email service API keys are set correctly
- Ensure `email_subscriptions` table has the `friend_challenges` column
- Check that users have valid email addresses in auth.users table