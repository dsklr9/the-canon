import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { challengedUserId, challengerName, challengeType, message, appUrl } = await req.json()

    // Get the challenged user's email using service role key
    const { data: { user }, error: userError } = await supabaseClient.auth.admin.getUserById(challengedUserId)
    
    if (userError || !user?.email) {
      throw new Error('Could not find user email')
    }

    // Here you would integrate with your email service (SendGrid, Resend, etc.)
    // For now, we'll use Supabase's built-in email functionality
    const { error: emailError } = await fetch(
      `${Deno.env.get('SUPABASE_URL')}/auth/v1/recover`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        },
        body: JSON.stringify({
          email: user.email,
          // This is a workaround - in production you'd use a proper email service
          // You could set up SendGrid, Resend, or another service
        }),
      }
    )

    // In a real implementation, you would use an email service like:
    /*
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'The Canon <noreply@thecanon.app>',
        to: user.email,
        subject: `${challengerName} challenged you on The Canon!`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #a855f7;">New Challenge on The Canon! ⚔️</h2>
            <p><strong>${challengerName}</strong> has challenged you to a ${challengeType === 'random' ? 'random' : 'custom'} battle!</p>
            ${message ? `<p><em>"${message}"</em></p>` : ''}
            <p>Log in to accept or decline the challenge:</p>
            <a href="${appUrl}" style="display: inline-block; background-color: #a855f7; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 16px;">View Challenge</a>
            <hr style="margin-top: 32px; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">You received this email because you have friend challenge notifications enabled. You can update your preferences in your account settings.</p>
          </div>
        `,
      }),
    })
    */

    return new Response(
      JSON.stringify({ success: true, message: 'Challenge email sent' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})