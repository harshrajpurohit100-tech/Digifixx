import "server-only";

import { customAlphabet } from "nanoid";

import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";
import {
  createLandingPageSchema,
} from "@/lib/validations/digifixx";
import type {
  Client,
  LandingPage,
  LandingPageTemplate,
  LandingPageWithClientAndTracking,
  TrackingEventName,
} from "@/types/digifixx";

const createPublicCode = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  10
);

export async function listLandingPages() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("landing_pages")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as LandingPage[];
}

const landingPageWithRelationsSelect = `
  *,
  clients:clients(id,name),
  meta_tracking_profiles:meta_tracking_profiles(
    id,
    pixel_id,
    capi_token_last4,
    is_active,
    test_event_code,
    default_click_event
  )
`;

type LandingPageRelationRow = LandingPage & {
  clients: Pick<Client, "id" | "name"> | null;
  meta_tracking_profiles:
    | {
        id: string;
        pixel_id: string;
        capi_token_last4: string | null;
        is_active: boolean;
        test_event_code: string | null;
        default_click_event: TrackingEventName;
      }[]
    | null;
};

function mapLandingPageRelationRow(
  row: LandingPageRelationRow
): LandingPageWithClientAndTracking {
  const { clients, meta_tracking_profiles: trackingProfiles, ...page } = row;
  const trackingProfile =
    trackingProfiles?.find((profile) => profile.is_active) ??
    trackingProfiles?.[0] ??
    null;

  return {
    ...page,
    client: clients,
    tracking_profile: trackingProfile,
  };
}

export async function listLandingPagesWithClientAndTracking() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("landing_pages")
    .select(landingPageWithRelationsSelect)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return ((data ?? []) as LandingPageRelationRow[]).map(
    mapLandingPageRelationRow
  );
}

export async function getLandingPageById(id: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("landing_pages")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as LandingPage | null;
}

export async function getLandingPageDetail(id: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("landing_pages")
    .select(landingPageWithRelationsSelect)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return mapLandingPageRelationRow(data as LandingPageRelationRow);
}

export async function getLandingPageByPublicCode(publicCode: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("landing_pages")
    .select("*")
    .eq("public_code", publicCode)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as LandingPage | null;
}

export async function generateUniquePublicCode() {
  const supabase = await createSupabaseServerClient();

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const publicCode = createPublicCode();
    const { data, error } = await supabase
      .from("landing_pages")
      .select("id")
      .eq("public_code", publicCode)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return publicCode;
    }
  }

  throw new Error("Unable to generate a unique public code.");
}

type CreateLandingPageRecordInput = {
  client_id: string;
  internal_name: string;
  headline: string;
  primary_button_url: string;
  default_event_name: TrackingEventName;
  public_code?: string;
  template?: LandingPageTemplate;
  page_title?: string;
  primary_button_text?: string;
  subheadline?: string;
  description?: string;
  secondary_button_text?: string;
  secondary_button_url?: string;
  disclaimer?: string;
  background_style?: string;
  utm_source_default?: string;
  utm_campaign_default?: string;
  logo_url?: string;
  logo_path?: string;
  channel_name?: string;
  subscriber_count?: number | null;
  top_notice_text?: string;
  support_line_1?: string;
  support_line_2?: string;
  urgency_text?: string;
  is_countdown_enabled?: boolean;
  countdown_seconds?: number;
  footer_note?: string;
  maintained_by_text?: string;
  cta_button_text?: string;
};

export async function createLandingPage(input: CreateLandingPageRecordInput) {
  const parsedInput = createLandingPageSchema.parse(input);
  const publicCode = input.public_code ?? (await generateUniquePublicCode());
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("landing_pages")
    .insert({
      ...parsedInput,
      public_code: publicCode,
      template: input.template ?? "telegram_join",
      page_title: input.page_title,
      primary_button_text:
        input.primary_button_text ?? input.cta_button_text ?? "VIEW IN TELEGRAM",
      background_style: parsedInput.background_style ?? "default",
      channel_name: input.channel_name,
      logo_url: input.logo_url,
      logo_path: input.logo_path,
      subscriber_count: input.subscriber_count,
      top_notice_text: input.top_notice_text,
      support_line_1: input.support_line_1,
      support_line_2: input.support_line_2,
      urgency_text: input.urgency_text,
      is_countdown_enabled: input.is_countdown_enabled ?? false,
      countdown_seconds: input.countdown_seconds ?? 0,
      footer_note: input.footer_note,
      maintained_by_text: input.maintained_by_text,
      cta_button_text: input.cta_button_text ?? "VIEW IN TELEGRAM",
      created_by: user?.id ?? null,
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as LandingPage;
}

type UpdateLandingPageRecordInput = Partial<CreateLandingPageRecordInput> & {
  status?: import("@/types/digifixx").LandingPageStatus;
};

export async function updateLandingPage(
  id: string,
  input: UpdateLandingPageRecordInput
) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("landing_pages")
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as LandingPage;
}

export async function updateLandingPageStatus(
  id: string,
  status: import("@/types/digifixx").LandingPageStatus
) {
  const supabase = await createSupabaseServerClient();
  const updateData: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (status === "active") {
    updateData.published_at = new Date().toISOString();
  } else if (status === "archived") {
    updateData.archived_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("landing_pages")
    .update(updateData)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as LandingPage;
}

export async function deleteLandingPage(id: string) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("landing_pages")
    .delete()
    .eq("id", id);

  if (error) {
    throw error;
  }
}
