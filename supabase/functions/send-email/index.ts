import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

interface EmailRequest {
  type: 'friend_request' | 'debate_reply' | 'comment_reply' | 'tournament_announcement' | 'tournament_reminder'
  recipient_id: string
  data: any
}

const emailTemplates = {
  friend_request: (data: any) => ({
    subject: `${data.sender_username} wants to connect on The Canon`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1e293b; padding: 30px; text-align: center;">
          <h1 style="color: #fbbf24; margin: 0;">The Canon</h1>
        </div>
        <div style="background: #f8fafc; padding: 30px;">
          <h2 style="color: #1e293b; margin-bottom: 20px;">New Friend Request!</h2>
          <p style="color: #475569; font-size: 16px; line-height: 1.5;">
            <strong>${data.sender_username}</strong> wants to connect with you on The Canon.
          </p>
          <p style="color: #475569; font-size: 16px; line-height: 1.5;">
            Connect to see their rankings and share your hip-hop takes!
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://thecanon.io" style="background: #7c3aed; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View Friend Request
            </a>
          </div>
        </div>
        <div style="background: #e2e8f0; padding: 20px; text-align: center; font-size: 14px; color: #64748b;">
          <p style="margin: 0;">The Canon - Settle Hip-Hop Debates</p>
          <p style="margin: 5px 0;">
            <a href="https://thecanon.io/settings" style="color: #7c3aed; text-decoration: none;">Manage email preferences</a>
          </p>
        </div>
      </div>
    `
  }),

  debate_reply: (data: any) => ({
    subject: `${data.replier_username} replied to your debate: "${data.debate_title}"`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1e293b; padding: 30px; text-align: center;">
          <h1 style="color: #fbbf24; margin: 0;">The Canon</h1>
        </div>
        <div style="background: #f8fafc; padding: 30px;">
          <h2 style="color: #1e293b; margin-bottom: 20px;">New Reply to Your Debate</h2>
          <p style="color: #475569; font-size: 16px; line-height: 1.5;">
            <strong>${data.replier_username}</strong> replied to your debate:
          </p>
          <div style="background: white; border-left: 4px solid #7c3aed; padding: 15px; margin: 20px 0;">
            <h3 style="color: #1e293b; margin: 0 0 10px 0; font-size: 18px;">${data.debate_title}</h3>
            <p style="color: #64748b; margin: 0; font-style: italic;">
              "${data.comment_preview}${data.comment_preview.length >= 100 ? '...' : ''}"
            </p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://thecanon.io" style="background: #7c3aed; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View Full Reply
            </a>
          </div>
        </div>
        <div style="background: #e2e8f0; padding: 20px; text-align: center; font-size: 14px; color: #64748b;">
          <p style="margin: 0;">The Canon - Settle Hip-Hop Debates</p>
          <p style="margin: 5px 0;">
            <a href="https://thecanon.io/settings" style="color: #7c3aed; text-decoration: none;">Manage email preferences</a>
          </p>
        </div>
      </div>
    `
  }),

  comment_reply: (data: any) => ({
    subject: `${data.replier_username} replied to your comment`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1e293b; padding: 30px; text-align: center;">
          <h1 style="color: #fbbf24; margin: 0;">The Canon</h1>
        </div>
        <div style="background: #f8fafc; padding: 30px;">
          <h2 style="color: #1e293b; margin-bottom: 20px;">New Reply to Your Comment</h2>
          <p style="color: #475569; font-size: 16px; line-height: 1.5;">
            <strong>${data.replier_username}</strong> replied to your comment in the debate "${data.debate_title}":
          </p>
          <div style="background: white; border-left: 4px solid #7c3aed; padding: 15px; margin: 20px 0;">
            <p style="color: #64748b; margin: 0; font-style: italic;">
              "${data.comment_preview}${data.comment_preview.length >= 100 ? '...' : ''}"
            </p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://thecanon.io" style="background: #7c3aed; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View Full Thread
            </a>
          </div>
        </div>
        <div style="background: #e2e8f0; padding: 20px; text-align: center; font-size: 14px; color: #64748b;">
          <p style="margin: 0;">The Canon - Settle Hip-Hop Debates</p>
          <p style="margin: 5px 0;">
            <a href="https://thecanon.io/settings" style="color: #7c3aed; text-decoration: none;">Manage email preferences</a>
          </p>
        </div>
      </div>
    `
  }),

  tournament_announcement: (data: any) => ({
    subject: `New Bars Madness: ${data.tournament_title}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1e293b; padding: 30px; text-align: center;">
          <h1 style="color: #fbbf24; margin: 0;">The Canon</h1>
        </div>
        <div style="background: #f8fafc; padding: 30px;">
          <h2 style="color: #1e293b; margin-bottom: 20px;">🏆 New Bar-for-Bar Breakdown Starting!</h2>
          <h3 style="color: #7c3aed; font-size: 24px; margin: 20px 0;">${data.tournament_title}</h3>
          <p style="color: #475569; font-size: 16px; line-height: 1.5;">
            ${data.tournament_description}
          </p>
          <div style="background: white; border: 1px solid #e2e8f0; padding: 20px; margin: 20px 0; border-radius: 8px;">
            <p style="color: #1e293b; margin: 0 0 10px 0;"><strong>Category:</strong> ${data.category}</p>
            <p style="color: #1e293b; margin: 0 0 10px 0;"><strong>Bracket Size:</strong> ${data.bracket_size} Artists</p>
            <p style="color: #1e293b; margin: 0;"><strong>Submissions Close:</strong> ${new Date(data.submission_end).toLocaleDateString()}</p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://thecanon.io" style="background: #7c3aed; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Submit Your Bars
            </a>
          </div>
        </div>
        <div style="background: #e2e8f0; padding: 20px; text-align: center; font-size: 14px; color: #64748b;">
          <p style="margin: 0;">The Canon - Settle Hip-Hop Debates</p>
          <p style="margin: 5px 0;">
            <a href="https://thecanon.io/settings" style="color: #7c3aed; text-decoration: none;">Manage email preferences</a>
          </p>
        </div>
      </div>
    `
  }),

  tournament_reminder: (data: any) => ({
    subject: `${data.time_remaining} left to submit bars!`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1e293b; padding: 30px; text-align: center;">
          <h1 style="color: #fbbf24; margin: 0;">The Canon</h1>
        </div>
        <div style="background: #f8fafc; padding: 30px;">
          <h2 style="color: #1e293b; margin-bottom: 20px;">⏰ Bar-for-Bar Breakdown Deadline Approaching!</h2>
          <p style="color: #475569; font-size: 16px; line-height: 1.5;">
            Only <strong>${data.time_remaining}</strong> left to submit your bars for:
          </p>
          <h3 style="color: #7c3aed; font-size: 20px; margin: 20px 0;">${data.tournament_title}</h3>
          <p style="color: #475569; font-size: 16px; line-height: 1.5;">
            Don't miss your chance to compete in this ${data.bracket_size}-artist bracket!
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://thecanon.io" style="background: #fbbf24; color: #1e293b; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              Submit Now
            </a>
          </div>
        </div>
        <div style="background: #e2e8f0; padding: 20px; text-align: center; font-size: 14px; color: #64748b;">
          <p style="margin: 0;">The Canon - Settle Hip-Hop Debates</p>
          <p style="margin: 5px 0;">
            <a href="https://thecanon.io/settings" style="color: #7c3aed; text-decoration: none;">Manage email preferences</a>
          </p>
        </div>
      </div>
    `
  })
}

serve(async (req) => {
  try {
    const { type, recipient_id, data } = await req.json() as EmailRequest

    // Get the email template
    const template = emailTemplates[type]
    if (!template) {
      throw new Error(`Unknown email type: ${type}`)
    }

    // Generate email content
    const emailContent = template(data)

    // Send email via Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'The Canon <notifications@thecanon.io>',
        to: data.recipient_email,
        subject: emailContent.subject,
        html: emailContent.html,
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to send email: ${await response.text()}`)
    }

    // Log the sent email
    await supabase.from('email_logs').insert({
      user_id: recipient_id,
      email_type: type,
      email_to: data.recipient_email,
      subject: emailContent.subject,
      metadata: data
    })

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})