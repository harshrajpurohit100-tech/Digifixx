"use server";

import { redirect } from "next/navigation";

import { getAdminUser } from "@/lib/auth/get-admin-user";
import {
  DEFAULT_CTA_BUTTON_TEXT,
  DEFAULT_FOOTER_NOTE,
  DEFAULT_SUPPORT_LINE_1,
  DEFAULT_SUPPORT_LINE_2,
  DEFAULT_TOP_NOTICE_TEXT,
} from "@/lib/landing-page-defaults";
import { createAuditLog } from "@/lib/repositories/audit-logs.repository";
import { getClientById } from "@/lib/repositories/clients.repository";
import {
  createLandingPage,
  generateUniquePublicCode,
  updateLandingPage,
  updateLandingPageStatus,
  deleteLandingPage,
  getLandingPageById,
} from "@/lib/repositories/landing-pages.repository";
import {
  createMetaTrackingProfile,
  upsertTrackingProfileForLandingPage,
} from "@/lib/repositories/meta-tracking.repository";
import {
  uploadLandingLogo,
  validateLogoFile,
} from "@/lib/storage/landing-assets";
import {
  createLandingPageWithTrackingSchema,
  updateLandingPageWithTrackingSchema,
  updateLandingPageStatusSchema,
  deleteLandingPageSchema,
} from "@/lib/validations/digifixx";

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

function withDefault(value: string | undefined, fallback: string) {
  return value?.trim() || fallback;
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
        Object.entries(flattenedErrors)
          .filter(([, messages]) => messages && messages.length > 0)
          .map(([field, messages]) => [
            field,
            messages![0],
          ])
      ),
    };
  }

  let selectedClient;
  try {
    selectedClient = await getClientById(parsedInput.data.client_id);
  } catch (error) {
    console.error("Unable to load client", error);
    return {
      error: "There was a problem loading the selected client.",
      fieldErrors: {
        client_id: "Could not verify client.",
      },
    };
  }

  if (!selectedClient) {
    return {
      error: "Selected client could not be found.",
      fieldErrors: {
        client_id: "Select a valid client.",
      },
    };
  }

  if (parsedInput.data.raw_capi_access_token && !process.env.ENCRYPTION_SECRET) {
    return {
      error: "Server encryption is not configured.",
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

  let publicCode: string;
  try {
    publicCode = await generateUniquePublicCode();
  } catch (error) {
    console.error("Unable to generate public code", error);
    return {
      error: "There was a problem generating a unique code for the landing page.",
    };
  }
  let logoUpload: { path: string; publicUrl: string } | null = null;
  const supportLine1 = withDefault(
    parsedInput.data.support_line_1,
    DEFAULT_SUPPORT_LINE_1
  );
  const supportLine2 = withDefault(
    parsedInput.data.support_line_2,
    DEFAULT_SUPPORT_LINE_2
  );
  const topNoticeText = withDefault(
    parsedInput.data.top_notice_text,
    DEFAULT_TOP_NOTICE_TEXT
  );
  const ctaButtonText = withDefault(
    parsedInput.data.cta_button_text,
    DEFAULT_CTA_BUTTON_TEXT
  );
  const footerNote = withDefault(
    parsedInput.data.footer_note,
    DEFAULT_FOOTER_NOTE
  );

  try {
    if (logoFile) {
      logoUpload = await uploadLandingLogo(logoFile, publicCode);
    }
  } catch (error) {
    console.error("Unable to upload landing page logo", error);
    return {
      error: "Logo upload failed. Please verify the landing-assets storage bucket.",
    };
  }

  let createdLandingPageId: string;
  let createdLandingPageDetails;

  try {
    const createdLandingPage = await createLandingPage({
      client_id: parsedInput.data.client_id,
      internal_name: parsedInput.data.internal_name,
      public_code: publicCode,
      template: "telegram_join",
      page_title: parsedInput.data.channel_name,
      headline: parsedInput.data.channel_name,
      primary_button_text: ctaButtonText,
      primary_button_url: parsedInput.data.primary_button_url,
      default_event_name: parsedInput.data.default_click_event,
      channel_name: parsedInput.data.channel_name,
      logo_url: logoUpload?.publicUrl,
      logo_path: logoUpload?.path,
      subscriber_count: parsedInput.data.subscriber_count ?? null,
      top_notice_text: topNoticeText,
      support_line_1: supportLine1,
      support_line_2: supportLine2,
      is_countdown_enabled: parsedInput.data.is_countdown_enabled,
      countdown_seconds: parsedInput.data.countdown_seconds,
      urgency_text: parsedInput.data.urgency_text,
      footer_note: footerNote,
      cta_button_text: ctaButtonText,
    });

    createdLandingPageId = createdLandingPage.id;
    createdLandingPageDetails = createdLandingPage;

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

  try {
    await createAuditLog({
      action: "create",
      entity_type: "landing_page",
      entity_id: createdLandingPageDetails.id,
      entity_label: createdLandingPageDetails.internal_name,
      new_values: {
        id: createdLandingPageDetails.id,
        client_id: createdLandingPageDetails.client_id,
        public_code: createdLandingPageDetails.public_code,
        channel_name: createdLandingPageDetails.channel_name,
        status: createdLandingPageDetails.status,
      },
    });
  } catch (error) {
    console.error("Unable to create audit log", error);
  }

  redirect(`/admin/landing-pages/${createdLandingPageId}`);
}

export async function updateLandingPageAction(
  _state: CreateLandingPageActionState,
  formData: FormData
): Promise<CreateLandingPageActionState> {
  const adminUser = await getAdminUser();

  if (!adminUser.user || adminUser.profile?.status !== "active") {
    return {
      error: "You are not authorized to update landing pages.",
    };
  }

  const rawInput = {
    landing_page_id: getString(formData, "landing_page_id"),
    client_id: getString(formData, "client_id"),
    internal_name: getString(formData, "internal_name"),
    status: getString(formData, "status"),
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

  const parsedInput = updateLandingPageWithTrackingSchema.safeParse(rawInput);

  if (!parsedInput.success) {
    const flattenedErrors = parsedInput.error.flatten().fieldErrors;
    return {
      error: "Please check the highlighted fields and try again.",
      fieldErrors: Object.fromEntries(
        Object.entries(flattenedErrors)
          .filter(([, messages]) => messages && messages.length > 0)
          .map(([field, messages]) => [field, messages![0]])
      ),
    };
  }

  const existingPage = await getLandingPageById(parsedInput.data.landing_page_id);
  if (!existingPage) {
    return { error: "Landing page not found." };
  }

  let selectedClient;
  try {
    selectedClient = await getClientById(parsedInput.data.client_id);
  } catch (error) {
    return {
      error: "There was a problem loading the selected client.",
      fieldErrors: { client_id: "Could not verify client." },
    };
  }

  if (!selectedClient) {
    return {
      error: "Selected client could not be found.",
      fieldErrors: { client_id: "Select a valid client." },
    };
  }

  if (parsedInput.data.raw_capi_access_token && !process.env.ENCRYPTION_SECRET) {
    return { error: "Server encryption is not configured." };
  }

  const logoFile = getLogoFile(formData);

  try {
    if (logoFile) {
      validateLogoFile(logoFile);
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Invalid logo file.",
      fieldErrors: { logo: "Upload a PNG, JPG, or WEBP logo up to 5 MB." },
    };
  }

  let logoUpload: { path: string; publicUrl: string } | null = null;
  const supportLine1 = withDefault(parsedInput.data.support_line_1, DEFAULT_SUPPORT_LINE_1);
  const supportLine2 = withDefault(parsedInput.data.support_line_2, DEFAULT_SUPPORT_LINE_2);
  const topNoticeText = withDefault(parsedInput.data.top_notice_text, DEFAULT_TOP_NOTICE_TEXT);
  const ctaButtonText = withDefault(parsedInput.data.cta_button_text, DEFAULT_CTA_BUTTON_TEXT);
  const footerNote = withDefault(parsedInput.data.footer_note, DEFAULT_FOOTER_NOTE);

  try {
    if (logoFile) {
      // Note: Leaving old logo orphaned intentionally for safety, unless instructed otherwise.
      logoUpload = await uploadLandingLogo(logoFile, existingPage.public_code);
    }
  } catch (error) {
    return { error: "Logo upload failed. Please verify the landing-assets storage bucket." };
  }

  try {
    const updatedPage = await updateLandingPage(parsedInput.data.landing_page_id, {
      client_id: parsedInput.data.client_id,
      internal_name: parsedInput.data.internal_name,
      status: parsedInput.data.status,
      page_title: parsedInput.data.channel_name,
      headline: parsedInput.data.channel_name,
      primary_button_text: ctaButtonText,
      primary_button_url: parsedInput.data.primary_button_url,
      default_event_name: parsedInput.data.default_click_event,
      channel_name: parsedInput.data.channel_name,
      ...(logoUpload ? { logo_url: logoUpload.publicUrl, logo_path: logoUpload.path } : {}),
      subscriber_count: parsedInput.data.subscriber_count ?? null,
      top_notice_text: topNoticeText,
      support_line_1: supportLine1,
      support_line_2: supportLine2,
      is_countdown_enabled: parsedInput.data.is_countdown_enabled,
      countdown_seconds: parsedInput.data.countdown_seconds,
      urgency_text: parsedInput.data.urgency_text,
      footer_note: footerNote,
      cta_button_text: ctaButtonText,
    });

    await upsertTrackingProfileForLandingPage({
      client_id: parsedInput.data.client_id,
      landing_page_id: updatedPage.id,
      profile_name: `${parsedInput.data.channel_name} Tracking`,
      meta_business_id: undefined,
      meta_ad_account_id: undefined,
      pixel_id: parsedInput.data.pixel_id,
      raw_capi_access_token: parsedInput.data.raw_capi_access_token,
      test_event_code: parsedInput.data.test_event_code,
      default_pageview_event: "PageView",
      default_click_event: parsedInput.data.default_click_event,
    });

    await createAuditLog({
      action: "update",
      entity_type: "landing_page",
      entity_id: updatedPage.id,
      entity_label: updatedPage.internal_name,
      new_values: {
        status: updatedPage.status,
        internal_name: updatedPage.internal_name,
      },
    });
  } catch (error) {
    console.error("Unable to update landing page", error);
    return {
      error: "There was a problem updating this landing page. Check Supabase configuration.",
    };
  }

  redirect(`/admin/landing-pages/${parsedInput.data.landing_page_id}`);
}

export async function updateLandingPageStatusAction(
  landingPageId: string,
  status: string
): Promise<{ error?: string }> {
  const adminUser = await getAdminUser();
  if (!adminUser.user || adminUser.profile?.status !== "active") {
    return { error: "You are not authorized to update landing pages." };
  }

  const parsed = updateLandingPageStatusSchema.safeParse({ landing_page_id: landingPageId, status });
  if (!parsed.success) {
    return { error: "Invalid status update request." };
  }

  try {
    const updatedPage = await updateLandingPageStatus(parsed.data.landing_page_id, parsed.data.status);
    
    let auditAction: import("@/types/digifixx").AuditAction = "update";
    if (parsed.data.status === "active") auditAction = "publish";
    else if (parsed.data.status === "paused") auditAction = "pause";
    else if (parsed.data.status === "archived") auditAction = "archive";

    await createAuditLog({
      action: auditAction,
      entity_type: "landing_page",
      entity_id: updatedPage.id,
      entity_label: updatedPage.internal_name,
      new_values: { status: updatedPage.status },
    });
  } catch (error) {
    console.error("Failed to update status", error);
    return { error: "Failed to update landing page status." };
  }

  redirect(`/admin/landing-pages/${landingPageId}`);
}

export async function archiveLandingPageAction(
  landingPageId: string
): Promise<{ error?: string }> {
  return updateLandingPageStatusAction(landingPageId, "archived");
}

export async function deleteLandingPageAction(
  _state: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string }> {
  const adminUser = await getAdminUser();
  if (!adminUser.user || adminUser.profile?.status !== "active") {
    return { error: "You are not authorized to delete landing pages." };
  }

  const landingPageId = getString(formData, "landing_page_id");
  const confirmation = getString(formData, "confirmation");

  if (confirmation !== "DELETE") {
    return { error: "Type DELETE to permanently delete this landing page." };
  }

  const parsed = deleteLandingPageSchema.safeParse({ landing_page_id: landingPageId, confirmation });
  if (!parsed.success) {
    return { error: "Invalid delete request parameters." };
  }

  try {
    const existingPage = await getLandingPageById(parsed.data.landing_page_id);
    if (!existingPage) {
      return { error: "Landing page not found." };
    }

    console.warn(`Admin is permanently deleting landing page: ${existingPage.id}`);

    await deleteLandingPage(existingPage.id);

    await createAuditLog({
      action: "delete",
      entity_type: "landing_page",
      entity_id: existingPage.id,
      entity_label: existingPage.internal_name,
    });
  } catch (error) {
    console.error("Failed to delete landing page", error);
    return { error: "Failed to delete landing page. There may be related records preventing deletion." };
  }

  redirect("/admin/landing-pages");
}
