import { SupabaseClient } from '@supabase/supabase-js'
import { getBrowserClient } from '@/lib/supabase/browserSingleton'

const APP_ID = process.env.NEXT_PUBLIC_APP_ID || 'spoke_app'

/**
 * Check if the current session has super_admin role in JWT claims.
 * Super admins bypass all entitlement checks.
 */
async function isSuperAdmin(supabase: SupabaseClient): Promise<boolean> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.access_token) return false
  try {
    let b64str = session.access_token.split('.')[1]
    b64str = b64str.replace(/-/g, '+').replace(/_/g, '/')
    while (b64str.length % 4) b64str += '='
    const payload = JSON.parse(atob(b64str))
    return payload?.user_role === 'super_admin'
  } catch {
    return false
  }
}

export async function hasActiveAccess(supabase?: SupabaseClient): Promise<boolean> {
  const AUTH_BYPASS = process.env.NEXT_PUBLIC_AUTH_BYPASS === 'true'
  if (AUTH_BYPASS) return true

  const client = supabase ?? getBrowserClient()
  const { data: { user } } = await client.auth.getUser()
  if (!user) return false

  if (await isSuperAdmin(client)) return true

  const { data } = await client
    .from('user_app_access')
    .select('status')
    .eq('supabase_user_id', user.id)
    .eq('app_id', APP_ID)
    .eq('status', 'active')
    .single()

  return !!data
}

export async function getUserProfile(supabase?: SupabaseClient) {
  const client = supabase ?? getBrowserClient()
  const { data: { user } } = await client.auth.getUser()
  if (!user) return null

  const { data } = await client
    .from('profiles')
    .select('id, email, display_name, avatar_url, first_name, last_name')
    .eq('id', user.id)
    .single()

  return data
}
