import "server-only";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { PublicLandingPage } from "@/types/digifixx";

const publicLandingPageColumns = `
  id,
  public_code,
  page_title,
  channel_name,
  logo_url,
  subscriber_count,
  top_notice_text,
  support_line_1,
  support_line_2,
  urgency_text,
  is_countdown_enabled,
  countdown_seconds,
  footer_note,
  maintained_by_text,
  cta_button_text,
  primary_button_url,
  disclaimer,
  status,
  updated_at
`;

export async function getActivePublicLandingPageByCode(publicCode: string) {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("landing_pages")
    .select(publicLandingPageColumns)
    .eq("public_code", publicCode)
    .eq("status", "active")
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as PublicLandingPage | null;
}
