
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get all active reminders
    const { data: reminders, error: reminderError } = await supabaseClient
      .from('email_reminders')
      .select('*')
      .eq('is_active', true)

    if (reminderError) {
      throw reminderError
    }

    // Current hour and minutes
    const now = new Date()
    const currentHour = now.getUTCHours()
    const currentMinute = now.getUTCMinutes()

    // Filter reminders for current time (within 5 minute window)
    const remindersToSend = reminders.filter((reminder) => {
      const [reminderHour, reminderMinute] = reminder.reminder_time.split(':').map(Number)
      
      // Check if the reminder time is within the current 5-minute window
      return (
        reminderHour === currentHour &&
        Math.abs(reminderMinute - currentMinute) <= 5
      )
    })

    // Process reminders
    const results = []
    
    for (const reminder of remindersToSend) {
      const reminderType = reminder.is_morning ? 'morning' : 'evening'
      const { data: userData, error: userError } = await supabaseClient
        .auth.admin.getUserById(reminder.user_id)
      
      if (userError) {
        results.push({
          email: reminder.email,
          status: 'error',
          error: userError.message
        })
        continue
      }
      
      // Generate unique link for the reminder with token
      const { data: { user } } = userData
      
      // Use signed URLs instead of a token-based approach for simplicity in this example
      const baseUrl = Deno.env.get('FRONTEND_URL') || 'https://gpcpvouyujctravabftj.lovable.dev'
      
      // In a real implementation, you would generate a secure token here
      const reminderLink = `${baseUrl}?type=${reminderType}&source=email&userId=${user.id}`
      
      // In a real implementation, you would integrate with an email service like SendGrid
      // For this example, we'll just log the email
      console.log(`Would send ${reminderType} reminder to ${reminder.email} with link: ${reminderLink}`)
      
      // Add to results
      results.push({
        email: reminder.email,
        status: 'success',
        type: reminderType
      })
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        reminders_processed: results.length,
        results 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
