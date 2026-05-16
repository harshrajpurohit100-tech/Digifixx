import "server-only";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { PublicLandingPage } from "@/types/digifixx";

const publicLandingPageColumns = `
  id,
  client_id,
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
  updated_at,
  meta_tracking_profiles:meta_tracking_profiles(
    pixel_id,
    default_pageview_event,
    default_click_event,
    is_active,
    updated_at
  )
`;

type PublicLandingPageRelationRow = Omit<PublicLandingPage, "tracking"> & {
  client_id: string;
  meta_tracking_profiles:
    | {
        pixel_id: string;
        default_pageview_event: import("@/types/digifixx").TrackingEventName;
        default_click_event: import("@/types/digifixx").TrackingEventName;
        is_active: boolean;
        updated_at: string;
      }[]
    | null;
};

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

  if (!data) {
    return null;
  }

  const row = data as unknown as PublicLandingPageRelationRow;
  const profiles = row.meta_tracking_profiles || [];
  
  // Sort descending by updated_at
  const activeProfiles = profiles
    .filter((p) => p.is_active)
    .sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );

  const activeProfile = activeProfiles[0];

  const tracking = activeProfile
    ? {
        pixel_id: activeProfile.pixel_id,
        default_pageview_event: activeProfile.default_pageview_event,
        default_click_event: activeProfile.default_click_event,
      }
    : null;

  const { meta_tracking_profiles: _, ...rest } = row;

  return {
    ...rest,
    tracking,
  } as PublicLandingPage;
}
