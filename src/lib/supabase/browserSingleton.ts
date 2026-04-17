/** Singleton Supabase JS client (localStorage-backed).
 *
 * The centralized gateway login (app.jtbd.one/login) uses the vanilla
 * Supabase JS SDK which stores sessions in localStorage. This client
 * MUST use the same storage mechanism so it can read the session that
 * was established by the gateway.
 *
 * IMPORTANT: Only import this in client components ('use client').
 * For Server Components and API routes, use ./server.ts instead.
 */
import { createClient as _createClient, type SupabaseClient } from '@supabase/supabase-js'

let _client: SupabaseClient | null = null

export function getBrowserClient(): SupabaseClient {
  if (!_client) {
    _client = _createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '').trim(),
    )
  }
  return _client
}
