import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Session refresh middleware — NON-BLOCKING.
 *
 * The gateway stores auth in localStorage (UMD Supabase JS), so on the first
 * navigation from the app-chooser the server sees no cookie yet. The client-side
 * Supabase client will hydrate the session from localStorage and set the cookie
 * for subsequent requests.
 *
 * This middleware only refreshes an existing cookie-based session (keeps it
 * alive). Auth enforcement happens client-side via useEntitlement / AuthGuard.
 *
 * Auth bypass: set NEXT_PUBLIC_AUTH_BYPASS=true in .env.local for local dev.
 */
export async function updateSession(request: NextRequest) {
  const AUTH_BYPASS = process.env.NEXT_PUBLIC_AUTH_BYPASS === 'true'

  if (AUTH_BYPASS) {
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Only attempt session refresh if auth cookies are present
  const hasAuthCookie = request.cookies.getAll().some(c => c.name.startsWith('sb-'))
  if (hasAuthCookie) {
    await supabase.auth.getUser()
  }

  return supabaseResponse
}
