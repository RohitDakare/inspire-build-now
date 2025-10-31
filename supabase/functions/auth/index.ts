import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action, ...data } = await req.json()

    switch (action) {
      case 'signup':
        return await handleSignup(data)
      case 'login':
        return await handleLogin(data)
      case 'logout':
        return await handleLogout(data)
      case 'reset-password':
        return await handleResetPassword(data)
      case 'update-profile':
        return await handleUpdateProfile(data)
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})

async function handleSignup({ email, password, full_name, redirectTo = '' }) {
  // Validate input
  if (!email || !password) {
    throw new Error('Email and password are required')
  }

  // Create user in Auth
  const { data: authData, error: signUpError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Auto-confirm email for now
    user_metadata: { full_name }
  })

  if (signUpError) {
    throw new Error(signUpError.message)
  }

  const user = authData.user

  // Create profile in public schema
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      full_name,
      updated_at: new Date().toISOString()
    })

  if (profileError) {
    console.error('Error creating profile:', profileError)
    // Don't fail the signup if profile creation fails
  }

  // Create user preferences
  const { error: prefError } = await supabase
    .from('user_preferences')
    .insert([{ user_id: user.id }])

  if (prefError) {
    console.error('Error creating user preferences:', prefError)
  }

  // Sign in the user
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (signInError) {
    throw new Error(signInError.message)
  }

  return new Response(
    JSON.stringify({
      user: {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name,
        avatar_url: user.user_metadata?.avatar_url
      },
      session: signInData.session
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleLogin({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    throw new Error(error.message)
  }

  // Get user profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single()

  if (profileError) {
    console.error('Error fetching profile:', profileError)
  }

  return new Response(
    JSON.stringify({
      user: {
        id: data.user.id,
        email: data.user.email,
        full_name: profile?.full_name || data.user.user_metadata?.full_name,
        avatar_url: profile?.avatar_url || data.user.user_metadata?.avatar_url
      },
      session: data.session
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleLogout() {
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    throw new Error(error.message)
  }

  return new Response(
    JSON.stringify({ message: 'Logged out successfully' }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleResetPassword({ email, redirectTo }) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectTo || `${Deno.env.get('SITE_URL')}/auth/reset-password`
  })

  if (error) {
    throw new Error(error.message)
  }

  return new Response(
    JSON.stringify({ message: 'Password reset email sent' }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleUpdateProfile({ userId, updates }) {
  const { data: { user }, error: authError } = await supabase.auth.admin.updateUserById(
    userId,
    { 
      email: updates.email,
      user_metadata: { 
        full_name: updates.full_name,
        avatar_url: updates.avatar_url
      }
    }
  )

  if (authError) {
    throw new Error(authError.message)
  }

  // Update profile in public schema
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      full_name: updates.full_name,
      avatar_url: updates.avatar_url,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)

  if (profileError) {
    throw new Error(profileError.message)
  }

  return new Response(
    JSON.stringify({
      user: {
        id: user.id,
        email: user.email,
        full_name: updates.full_name,
        avatar_url: updates.avatar_url
      }
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}
