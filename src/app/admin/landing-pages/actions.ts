"use server";

import { redirect } from "next/navigation";

import { getAdminUser } from "@/lib/auth/get-admin-user";
import { createAuditLog } from "@/lib/repositories/audit-logs.repository";
import { getClientById } from "@/lib/repositories/clients.repository";
import {
  createLandingPage,
  generateUniquePublicCode,
} from "@/lib/repositories/landing-pages.repository";
import { createMetaTrackingProfile } from "@/lib/repositories/meta-tracking.repository";
import {
  uploadLandingLogo,
  validateLogoFile,
} from "@/lib/storage/landing-assets";
import { createLandingPageWithTrackingSchema } from "@/lib/validations/digifixx";

export type CreateLandingPageActionState = {
  error?: string;
  fieldErrors?: Partial<Record<string, string>>;
};

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function getLogoFile(formData: FormData) {
  const value = formData.get("logo");
  return value instanceof File && value.size > 0 ? value : null;
}

export async function createLandingPageAction(
  _state: CreateLandingPageActionState,
  formData: FormData
): Promise<CreateLandingPageActionState> {
  const adminUser = await getAdminUser();

  if (!adminUser.user || adminUser.profile?.status !== "active") {
    return {
      error: "You are not authorized to create landing pages.",
    };
  }

  const rawInput = {
    client_id: getString(formData, "client_id"),
    internal_name: getString(formData, "internal_name"),
    channel_name: getString(formData, "channel_name"),
    subscriber_count: getString(formData, "subscriber_count"),
    support_line_1: getString(formData, "support_line_1"),
    support_line_2: getString(formData, "support_line_2"),
    top_notice_text: getString(formData, "top_notice_text"),
    cta_button_text: getString(formData, "cta_button_text"),
    primary_button_url: getString(formData, "primary_button_url"),
    footer_note: getString(formData, "footer_note"),
    is_countdown_enabled: formData.get("is_countdown_enabled"),
    countdown_seconds: getString(formData, "countdown_seconds"),
    urgency_text: getString(formData, "urgency_text"),
    pixel_id: getString(formData, "pixel_id"),
    raw_capi_access_token: getString(formData, "raw_capi_access_token"),
    test_event_code: getString(formData, "test_event_code"),
    default_click_event: getString(formData, "default_click_event") || "Lead",
  };

  const parsedInput = createLandingPageWithTrackingSchema.safeParse(rawInput);

  if (!parsedInput.success) {
    const flattenedErrors = parsedInput.error.flatten().fieldErrors;

    return {
      error: "Please check the highlighted fields and try again.",
      fieldErrors: Object.fromEntries(
        Object.entries(flattenedErrors).map(([field, messages]) => [
          field,
          messages?.[0],
        ])
      ),
    };
  }

  const selectedClient = await getClientById(parsedInput.data.client_id);

  if (!selectedClient) {
    return {
      error: "Selected client could not be found.",
      fieldErrors: {
        client_id: "Select a valid client.",
      },
    };
  }

  const logoFile = getLogoFile(formData);

  try {
    if (logoFile) {
      validateLogoFile(logoFile);
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Invalid logo file.",
      fieldErrors: {
        logo: "Upload a PNG, JPG, or WEBP logo up to 5 MB.",
      },
    };
  }

  const publicCode = await generateUniquePublicCode();
  let logoUpload: { path: string; publicUrl: string } | null = null;

  try {
    if (logoFile) {
      logoUpload = await uploadLandingLogo(logoFile, publicCode);
    }
  } catch (error) {
    console.error("Unable to upload landing page logo", error);
    return {
      error: "There was a problem uploading the logo. Try again or continue without a logo.",
    };
  }

  let createdLandingPage;

  try {
    createdLandingPage = await createLandingPage({
      client_id: parsedInput.data.client_id,
      internal_name: parsedInput.data.internal_name,
      public_code: publicCode,
      template: "telegram_join",
      page_title: parsedInput.data.channel_name,
      headline: parsedInput.data.channel_name,
      primary_button_text: parsedInput.data.cta_button_text,
      primary_button_url: parsedInput.data.primary_button_url,
      default_event_name: parsedInput.data.default_click_event,
      channel_name: parsedInput.data.channel_name,
      logo_url: logoUpload?.publicUrl,
      logo_path: logoUpload?.path,
      subscriber_count: parsedInput.data.subscriber_count ?? null,
      top_notice_text:
        parsedInput.data.top_notice_text ??
        "Don't have Telegram yet? Try it now!",
      support_line_1: parsedInput.data.support_line_1,
      support_line_2: parsedInput.data.support_line_2,
      is_countdown_enabled: parsedInput.data.is_countdown_enabled,
      countdown_seconds: parsedInput.data.countdown_seconds,
      urgency_text: parsedInput.data.urgency_text,
      footer_note: parsedInput.data.footer_note,
      cta_button_text: parsedInput.data.cta_button_text,
    });

    await createMetaTrackingProfile({
      client_id: parsedInput.data.client_id,
      landing_page_id: createdLandingPage.id,
      profile_name: `${parsedInput.data.channel_name} Tracking`,
      meta_business_id: undefined,
      meta_ad_account_id: undefined,
      pixel_id: parsedInput.data.pixel_id,
      raw_capi_access_token: parsedInput.data.raw_capi_access_token,
      test_event_code: parsedInput.data.test_event_code,
      default_pageview_event: "PageView",
      default_click_event: parsedInput.data.default_click_event,
    });
  } catch (error) {
    if (logoUpload) {
      console.warn(
        "Landing page creation failed after logo upload; manual cleanup may be needed.",
        logoUpload.path
      );
    }

    console.error("Unable to create landing page", error);
    return {
      error:
        "There was a problem creating this landing page. Check Supabase configuration and RLS policies.",
    };
  }

  await createAuditLog({
    action: "create",
    entity_type: "landing_page",
    entity_id: createdLandingPage.id,
    entity_label: createdLandingPage.internal_name,
    new_values: {
      id: createdLandingPage.id,
      client_id: createdLandingPage.client_id,
      public_code: createdLandingPage.public_code,
      channel_name: createdLandingPage.channel_name,
      status: createdLandingPage.status,
    },
  });

  redirect(`/admin/landing-pages/${createdLandingPage.id}`);
}
