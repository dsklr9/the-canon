import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables!')
}

// Determine the redirect URL based on environment
const getRedirectUrl = () => {
  if (typeof window !== 'undefined') {
    const { protocol, hostname, port } = window.location
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1'
    
    if (isLocalhost) {
      return `${protocol}//${hostname}${port ? `:${port}` : ''}`
    }
    return 'https://thecanon.io'
  }
  return 'https://thecanon.io'
}

// Create Supabase client with custom auth domain configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Use custom auth domain
    redirectTo: getRedirectUrl(),
    // Enable custom domain for auth
    detectSessionInUrl: true,
    persistSession: true,
    autoRefreshToken: true,
    // Custom auth domain configuration
    ...(process.env.NODE_ENV === 'production' && {
      // In production, use the custom auth domain
      url: 'https://auth.thecanon.io',
    }),
  },
})

// Helper function to get auth redirect URL for sign in/out operations
export const getAuthRedirectUrl = (path = '') => {
  const baseUrl = getRedirectUrl()
  return path ? `${baseUrl}${path}` : baseUrl
}