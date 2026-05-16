import { z } from "zod";

export const landingPageTemplateSchema = z.enum([
  "telegram_join",
  "whatsapp_lead",
  "simple_lead_form",
  "custom_basic",
]);

export const trackingEventNameSchema = z.enum([
  "PageView",
  "ViewContent",
  "Lead",
  "Contact",
  "Subscribe",
  "CompleteRegistration",
  "ButtonClick",
  "FormSubmit",
  "Custom",
]);

export const defaultClickEventSchema = z.enum([
  "Lead",
  "Contact",
  "Subscribe",
  "CompleteRegistration",
  "ButtonClick",
]);

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => (value === "" ? undefined : value));

export const createClientSchema = z.object({
  name: z.string().trim().min(2).max(120),
  internal_code: optionalText(80),
  contact_name: optionalText(120),
  contact_email: z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() === ""
        ? undefined
        : value,
    z.string().trim().email().optional()
  ),
  contact_phone: optionalText(30),
  notes: optionalText(2000),
});

export const createLandingPageSchema = z.object({
  client_id: z.uuid(),
  internal_name: z.string().trim().min(2).max(160),
  template: landingPageTemplateSchema,
  page_title: optionalText(180),
  headline: z.string().trim().min(2).max(180),
  subheadline: optionalText(240),
  description: optionalText(2000),
  primary_button_text: z.string().trim().min(1).max(80),
  primary_button_url: z.url(),
  secondary_button_text: optionalText(80),
  secondary_button_url: z.url().optional().or(z.literal("").transform(() => undefined)),
  disclaimer: optionalText(2000),
  background_style: optionalText(80),
  default_event_name: trackingEventNameSchema,
  utm_source_default: optionalText(120),
  utm_campaign_default: optionalText(160),
});

export const createMetaTrackingProfileSchema = z.object({
  client_id: z.uuid(),
  landing_page_id: z.uuid().nullable().optional(),
  profile_name: z.string().trim().min(2).max(120),
  meta_business_id: optionalText(120),
  meta_ad_account_id: optionalText(120),
  pixel_id: z.string().trim().min(3).max(80),
  raw_capi_access_token: optionalText(2000),
  test_event_code: optionalText(120),
  default_pageview_event: trackingEventNameSchema,
  default_click_event: trackingEventNameSchema,
});

export const updateMetaTrackingTokenSchema = z.object({
  profile_id: z.uuid(),
  raw_capi_access_token: z.string().trim().min(10).max(2000),
});

const optionalNumber = z.preprocess(
  (value) => {
    if (value === "" || value === null || value === undefined) {
      return undefined;
    }

    return Number(value);
  },
  z.number().int().nonnegative().optional()
);

const countdownSeconds = z.preprocess(
  (value) => {
    if (value === "" || value === null || value === undefined) {
      return 0;
    }

    return Number(value);
  },
  z.number().int().min(0).max(86400).default(0)
);

const formBoolean = z.preprocess((value) => value === "on" || value === true, z.boolean());

export const createLandingPageWithTrackingSchema = z.object({
  client_id: z.uuid(),
  internal_name: z.string().trim().min(2).max(160),
  channel_name: z.string().trim().min(2).max(120),
  subscriber_count: optionalNumber,
  support_line_1: optionalText(220),
  support_line_2: optionalText(220),
  top_notice_text: optionalText(160),
  cta_button_text: optionalText(60),
  primary_button_url: z.url(),
  footer_note: optionalText(300),
  is_countdown_enabled: formBoolean.default(false),
  countdown_seconds: countdownSeconds,
  urgency_text: optionalText(120),
  pixel_id: z.string().trim().min(3).max(80),
  raw_capi_access_token: optionalText(2000),
  test_event_code: optionalText(120),
  default_click_event: defaultClickEventSchema.default("Lead"),
});

export type CreateClientInput = z.infer<typeof createClientSchema>;
export type CreateLandingPageInput = z.infer<typeof createLandingPageSchema>;
export type CreateMetaTrackingProfileInput = z.infer<
  typeof createMetaTrackingProfileSchema
>;
export type UpdateMetaTrackingTokenInput = z.infer<
  typeof updateMetaTrackingTokenSchema
>;
export type CreateLandingPageWithTrackingInput = z.infer<
  typeof createLandingPageWithTrackingSchema
>;

export const updateLandingPageStatusSchema = z.object({
  landing_page_id: z.string().uuid(),
  status: z.enum(["draft", "active", "paused", "archived"]),
});

export const deleteLandingPageSchema = z.object({
  landing_page_id: z.string().uuid(),
  confirmation: z.literal("DELETE"),
});

export const updateLandingPageWithTrackingSchema =
  createLandingPageWithTrackingSchema.extend({
    landing_page_id: z.string().uuid(),
    status: z.enum(["draft", "active", "paused", "archived"]),
  });

export type UpdateLandingPageStatusInput = z.infer<
  typeof updateLandingPageStatusSchema
>;
export type DeleteLandingPageInput = z.infer<typeof deleteLandingPageSchema>;
export type UpdateLandingPageWithTrackingInput = z.infer<
  typeof updateLandingPageWithTrackingSchema
>;
