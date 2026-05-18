import "server-only";

import {
  decryptSecret,
  encryptSecret,
  getSecretLast4,
} from "@/lib/security/crypto";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";
import {
  createMetaTrackingProfileSchema,
  updateMetaTrackingTokenSchema,
  type CreateMetaTrackingProfileInput,
  type UpdateMetaTrackingTokenInput,
} from "@/lib/validations/digifixx";
import type { MetaTrackingProfile } from "@/types/digifixx";
import type { TrackingEventName } from "@/types/digifixx";

type SafeMetaTrackingProfile = Omit<
  MetaTrackingProfile,
  "capi_access_token_encrypted"
>;

const safeTrackingProfileColumns = `
  id,
  client_id,
  landing_page_id,
  profile_name,
  meta_business_id,
  meta_ad_account_id,
  pixel_id,
  capi_token_last4,
  test_event_code,
  default_pageview_event,
  default_click_event,
  is_active,
  last_verified_at,
  created_by,
  created_at,
  updated_at
`;

export async function listTrackingProfilesForClient(clientId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("meta_tracking_profiles")
    .select(safeTrackingProfileColumns)
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as SafeMetaTrackingProfile[];
}

export async function getTrackingProfileForLandingPage(landingPageId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("meta_tracking_profiles")
    .select(safeTrackingProfileColumns)
    .eq("landing_page_id", landingPageId)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as SafeMetaTrackingProfile | null;
}

export async function createMetaTrackingProfile(
  input: CreateMetaTrackingProfileInput
) {
  const parsedInput = createMetaTrackingProfileSchema.parse(input);
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { raw_capi_access_token: rawToken, ...profileInput } = parsedInput;

  const { data, error } = await supabase
    .from("meta_tracking_profiles")
    .insert({
      ...profileInput,
      capi_access_token_encrypted: rawToken
        ? encryptSecret(rawToken)
        : null,
      capi_token_last4: rawToken ? getSecretLast4(rawToken) : null,
      created_by: user?.id ?? null,
    })
    .select(safeTrackingProfileColumns)
    .single();

  if (error) {
    throw error;
  }

  return data as SafeMetaTrackingProfile;
}

export async function updateMetaTrackingToken(
  input: UpdateMetaTrackingTokenInput
) {
  const parsedInput = updateMetaTrackingTokenSchema.parse(input);
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("meta_tracking_profiles")
    .update({
      capi_access_token_encrypted: encryptSecret(
        parsedInput.raw_capi_access_token
      ),
      capi_token_last4: getSecretLast4(parsedInput.raw_capi_access_token),
    })
    .eq("id", parsedInput.profile_id)
    .select(safeTrackingProfileColumns)
    .single();

  if (error) {
    throw error;
  }

  return data as SafeMetaTrackingProfile;
}

// Internal server-only helper for future CAPI delivery jobs. Do not use in UI.
export async function getDecryptedCapiTokenForProfile(profileId: string) {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("meta_tracking_profiles")
    .select("capi_access_token_encrypted")
    .eq("id", profileId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data?.capi_access_token_encrypted) {
    return null;
  }

  return decryptSecret(data.capi_access_token_encrypted);
}

export type ActiveDecryptedTrackingProfile = {
  id: string;
  pixel_id: string;
  access_token: string | null;
  test_event_code: string | null;
  default_pageview_event: TrackingEventName;
  default_click_event: TrackingEventName;
};

export async function getActiveDecryptedTrackingProfileForLandingPage(
  landingPageId: string
): Promise<ActiveDecryptedTrackingProfile | null> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("meta_tracking_profiles")
    .select(
      `
      id,
      pixel_id,
      capi_access_token_encrypted,
      test_event_code,
      default_pageview_event,
      default_click_event
    `
    )
    .eq("landing_page_id", landingPageId)
    .eq("is_active", true)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return {
    id: data.id,
    pixel_id: data.pixel_id,
    access_token: data.capi_access_token_encrypted
      ? decryptSecret(data.capi_access_token_encrypted)
      : null,
    test_event_code: data.test_event_code,
    default_pageview_event:
      data.default_pageview_event as TrackingEventName,
    default_click_event: data.default_click_event as TrackingEventName,
  };
}

export async function upsertTrackingProfileForLandingPage(
  input: CreateMetaTrackingProfileInput,
  options?: {
    removeCapiToken?: boolean;
  }
) {
  if (!input.landing_page_id) {
    throw new Error("landing_page_id is required to upsert tracking profile");
  }

  const existingProfile = await getTrackingProfileForLandingPage(
    input.landing_page_id
  );

  const parsedInput = createMetaTrackingProfileSchema.parse(input);
  const supabase = await createSupabaseServerClient();
  const { raw_capi_access_token: rawToken, ...profileInput } = parsedInput;

  const updatePayload: Record<string, unknown> = {
    ...profileInput,
    updated_at: new Date().toISOString(),
  };

  if (options?.removeCapiToken) {
    updatePayload.capi_access_token_encrypted = null;
    updatePayload.capi_token_last4 = null;
  } else if (rawToken && rawToken.trim() !== "") {
    updatePayload.capi_access_token_encrypted = encryptSecret(rawToken);
    updatePayload.capi_token_last4 = getSecretLast4(rawToken);
  }

  if (existingProfile) {
    const { data, error } = await supabase
      .from("meta_tracking_profiles")
      .update(updatePayload)
      .eq("id", existingProfile.id)
      .select(safeTrackingProfileColumns)
      .single();

    if (error) {
      throw error;
    }
    return data as SafeMetaTrackingProfile;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("meta_tracking_profiles")
    .insert({
      ...profileInput,
      capi_access_token_encrypted:
        rawToken && rawToken.trim() !== "" ? encryptSecret(rawToken) : null,
      capi_token_last4:
        rawToken && rawToken.trim() !== "" ? getSecretLast4(rawToken) : null,
      created_by: user?.id ?? null,
    })
    .select(safeTrackingProfileColumns)
    .single();

  if (error) {
    throw error;
  }

  return data as SafeMetaTrackingProfile;
}
