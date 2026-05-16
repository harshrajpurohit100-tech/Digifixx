import { z } from "zod";

export const trackingPayloadSchema = z.object({
  publicCode: z
    .string()
    .min(8)
    .max(32)
    .regex(/^[a-zA-Z0-9_\-]+$/, "Invalid public code format"),
  eventName: z.enum([
    "PageView",
    "ViewContent",
    "Lead",
    "Contact",
    "Subscribe",
    "CompleteRegistration",
    "ButtonClick",
  ]),
  eventId: z.string().min(8).max(120),
  sourceUrl: z.string().url().max(2000),
  referrer: z.string().max(1000).nullable().optional(),
  utm: z
    .object({
      source: z.string().max(300).nullable().optional(),
      medium: z.string().max(300).nullable().optional(),
      campaign: z.string().max(300).nullable().optional(),
      content: z.string().max(300).nullable().optional(),
      term: z.string().max(300).nullable().optional(),
      adset: z.string().max(300).nullable().optional(),
      ad: z.string().max(300).nullable().optional(),
    })
    .optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type TrackingPayload = z.infer<typeof trackingPayloadSchema>;
