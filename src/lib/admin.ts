"use client";

import { getBrowserClient } from "@/lib/supabase/browserSingleton";

const CLOUD_RUN_URL =
  process.env.NEXT_PUBLIC_CENTRAL_API_URL ||
  "https://jtbd-gateway-69501538350.us-central1.run.app";

async function authHeaders(): Promise<HeadersInit> {
  const supabase = getBrowserClient();
  const { data: { session } } = await supabase.auth.getSession();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (session?.access_token) {
    headers["Authorization"] = `Bearer ${session.access_token}`;
  }
  return headers;
}

export interface TierOption {
  tier: string;
  display_name: string;
  model_id: string | null;
  research_model_id: string | null;
}

export interface AppTierInfo {
  app_id: string;
  app_name: string;
  current_tier: string | null;
  available_tiers: TierOption[];
}

export async function fetchTestingTiers(): Promise<AppTierInfo[]> {
  const res = await fetch(`${CLOUD_RUN_URL}/api/v1/admin/testing-tiers`, {
    headers: await authHeaders(),
  });
  if (!res.ok) throw new Error(`Fetch tiers failed: ${res.status}`);
  return res.json();
}

export async function setTestingTier(
  appId: string,
  tier: string
): Promise<{
  status: string;
  app_id: string;
  new_tier: string;
  model_id: string | null;
  research_model_id: string | null;
}> {
  const res = await fetch(`${CLOUD_RUN_URL}/api/v1/admin/testing-tiers`, {
    method: "PATCH",
    headers: await authHeaders(),
    body: JSON.stringify({ app_id: appId, tier }),
  });
  if (!res.ok) throw new Error(`Set tier failed: ${res.status}`);
  return res.json();
}
