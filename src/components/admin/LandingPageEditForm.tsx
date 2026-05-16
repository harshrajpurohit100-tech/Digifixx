"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import {
  AlertTriangle,
  Building2,
  Clock3,
  Save,
  Send,
  ShieldCheck,
} from "lucide-react";
import type { ReactNode } from "react";

import {
  updateLandingPageAction,
  type CreateLandingPageActionState,
} from "@/app/admin/landing-pages/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export type ClientOption = {
  id: string;
  name: string;
  status: "active" | "paused" | "archived";
};

export type LandingPageEditData = {
  id: string;
  client_id: string;
  internal_name: string;
  status: string;
  channel_name: string | null;
  logo_url: string | null;
  subscriber_count: number | null;
  top_notice_text: string;
  support_line_1: string | null;
  support_line_2: string | null;
  cta_button_text: string;
  primary_button_url: string;
  footer_note: string | null;
  is_countdown_enabled: boolean;
  countdown_seconds: number;
  urgency_text: string | null;
  tracking: {
    pixel_id: string;
    capi_token_last4: string | null;
    test_event_code: string | null;
    default_click_event: string;
  } | null;
};

type LandingPageEditFormProps = {
  clients: ClientOption[];
  landingPage: LandingPageEditData;
};

const initialState: CreateLandingPageActionState = {};

/* ── shared field styles ── */
const inputCls =
  "h-[42px] rounded-[12px] border-[#E2E8F0] bg-white text-sm placeholder:text-[#94A3B8] transition-colors focus-visible:border-[#BFDBFE] focus-visible:ring-2 focus-visible:ring-[#BFDBFE]";
const selectCls =
  "h-[42px] w-full rounded-[12px] border border-[#E2E8F0] bg-white px-3 text-sm text-[#0F172A] outline-none transition-colors focus-visible:border-[#BFDBFE] focus-visible:ring-2 focus-visible:ring-[#BFDBFE]";
const labelCls = "text-[13px] font-[650] text-[#0F172A]";
const helperCls = "mt-1.5 text-[12px] leading-[1.5] text-[#64748B]";

/* ── Field error ── */
function FieldError({ message }: { message?: string }) {
  return message ? (
    <p className="mt-1 text-[12px] font-medium text-[#B91C1C]">{message}</p>
  ) : null;
}

/* ── Icon section header ── */
function SectionHeader({
  icon: Icon,
  iconBg,
  iconColor,
  title,
}: {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  title: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`flex size-[38px] shrink-0 items-center justify-center rounded-[12px] ${iconBg}`}
      >
        <Icon className={`size-[18px] ${iconColor}`} aria-hidden="true" />
      </div>
      <h2 className="text-[17px] font-extrabold tracking-[-0.01em] text-[#0F172A]">
        {title}
      </h2>
    </div>
  );
}

/* ── Section wrapper with divider ── */
function FormSection({ children }: { children: ReactNode }) {
  return (
    <section className="flex flex-col gap-[18px]">
      {children}
    </section>
  );
}

function Divider() {
  return <div className="my-1 border-t border-[#E2E8F0]" />;
}

/* ── Submit button ── */
function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className="
        inline-flex h-[42px] items-center gap-2 rounded-[12px] px-5
        bg-gradient-to-r from-[#2563EB] to-[#7C3AED]
        text-sm font-bold text-white
        shadow-[0_12px_24px_rgba(37,99,235,0.22)]
        transition-all duration-200 ease-out
        hover:-translate-y-[1px] hover:shadow-[0_16px_32px_rgba(37,99,235,0.30)]
        disabled:cursor-not-allowed disabled:opacity-60 disabled:translate-y-0 disabled:shadow-none
      "
    >
      <Save className="size-4" aria-hidden="true" />
      {pending ? "Saving…" : "Save Changes"}
    </button>
  );
}

/* ══════════════════════════════════════════════════════════════════════ */

export function LandingPageEditForm({
  clients,
  landingPage,
}: LandingPageEditFormProps) {
  const [state, formAction] = useActionState(updateLandingPageAction, initialState);
  const hasClients = clients.length > 0;

  return (
    <form action={formAction} className="flex flex-col gap-7">
      <input type="hidden" name="landing_page_id" value={landingPage.id} />

      {/* Error banner */}
      {state.error ? (
        <div className="flex items-start gap-3 rounded-[14px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-3">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-[#DC2626]" aria-hidden="true" />
          <p className="text-[13px] font-medium leading-5 text-[#B91C1C]">
            {state.error}
          </p>
        </div>
      ) : null}

      {/* ── SECTION 1: Client Ownership ── */}
      <FormSection>
        <SectionHeader
          icon={Building2}
          iconBg="bg-[#F5F3FF]"
          iconColor="text-[#7C3AED]"
          title="Client Ownership"
        />

        {/* Row 1: Client + Internal Name */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="client_id" className={labelCls}>
              Client
            </Label>
            {hasClients ? (
              <select
                id="client_id"
                name="client_id"
                required
                defaultValue={landingPage.client_id}
                className={selectCls}
              >
                <option value="" disabled>
                  Select client
                </option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            ) : (
              <div className="rounded-[12px] border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-sm text-[#475569]">
                No clients found. Create a client first.
              </div>
            )}
            <FieldError message={state.fieldErrors?.client_id} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="internal_name" className={labelCls}>
              Internal Page Name
            </Label>
            <Input
              id="internal_name"
              name="internal_name"
              required
              defaultValue={landingPage.internal_name}
              placeholder="Nova Media — Telegram Join Page"
              className={inputCls}
            />
            <p className={helperCls}>Only visible inside Digifixx.</p>
            <FieldError message={state.fieldErrors?.internal_name} />
          </div>
        </div>

        {/* Row 2: Status */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="status" className={labelCls}>
              Status
            </Label>
            <select
              id="status"
              name="status"
              required
              defaultValue={landingPage.status}
              className={selectCls}
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="archived">Archived</option>
            </select>
            <p className={helperCls}>Only active pages are publicly accessible.</p>
            <FieldError message={state.fieldErrors?.status} />
          </div>
        </div>
      </FormSection>

      <Divider />

      {/* ── SECTION 2: Telegram Page Content ── */}
      <FormSection>
        <SectionHeader
          icon={Send}
          iconBg="bg-[#EFF6FF]"
          iconColor="text-[#2563EB]"
          title="Telegram Page Content"
        />

        {/* Row 1: Channel Name + Logo */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="channel_name" className={labelCls}>
              Channel Name
            </Label>
            <Input
              id="channel_name"
              name="channel_name"
              required
              defaultValue={landingPage.channel_name || ""}
              placeholder="OPTIONS MASTER™"
              className={inputCls}
            />
            <p className={helperCls}>Shown as the main title on the public page.</p>
            <FieldError message={state.fieldErrors?.channel_name} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="logo" className={labelCls}>
              Channel Logo
            </Label>
            {/* Current logo thumbnail */}
            {landingPage.logo_url && (
              <div className="mb-1 flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={landingPage.logo_url}
                  alt="Current logo"
                  className="size-11 rounded-full border-2 border-white object-cover shadow-[0_4px_12px_rgba(15,23,42,0.10)]"
                />
                <span className="text-[12px] font-medium text-[#64748B]">Current Logo</span>
              </div>
            )}
            <Input
              id="logo"
              name="logo"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="h-[42px] rounded-[12px] border-[#E2E8F0] bg-white text-sm
                file:mr-4 file:rounded-lg file:border-0 file:bg-slate-100
                file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-700
                hover:file:bg-slate-200 transition-colors"
            />
            <p className={helperCls}>Leave blank to keep the current logo. PNG, JPG, or WEBP. Max 5 MB.</p>
            <FieldError message={state.fieldErrors?.logo} />
          </div>
        </div>

        {/* Row 2: Subscriber Count + Top Notice */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="subscriber_count" className={labelCls}>
              Subscriber Count
            </Label>
            <Input
              id="subscriber_count"
              name="subscriber_count"
              type="number"
              min="0"
              defaultValue={landingPage.subscriber_count ?? ""}
              placeholder="17821"
              className={inputCls}
            />
            <p className={helperCls}>Optional. Leave blank to hide subscriber count.</p>
            <FieldError message={state.fieldErrors?.subscriber_count} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="top_notice_text" className={labelCls}>
              Top Notice Text
            </Label>
            <Input
              id="top_notice_text"
              name="top_notice_text"
              defaultValue={landingPage.top_notice_text}
              className={inputCls}
            />
            <p className={helperCls}>Small blue notice bar at the top of the public page.</p>
            <FieldError message={state.fieldErrors?.top_notice_text} />
          </div>
        </div>

        {/* Row 3: Support Lines */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="support_line_1" className={labelCls}>
              Support Line 1
            </Label>
            <Input
              id="support_line_1"
              name="support_line_1"
              defaultValue={landingPage.support_line_1 || ""}
              className={inputCls}
            />
            <FieldError message={state.fieldErrors?.support_line_1} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="support_line_2" className={labelCls}>
              Support Line 2
            </Label>
            <Input
              id="support_line_2"
              name="support_line_2"
              defaultValue={landingPage.support_line_2 || ""}
              className={inputCls}
            />
            <FieldError message={state.fieldErrors?.support_line_2} />
          </div>
        </div>

        {/* Row 4: CTA + Telegram Link */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cta_button_text" className={labelCls}>
              CTA Button Text
            </Label>
            <Input
              id="cta_button_text"
              name="cta_button_text"
              defaultValue={landingPage.cta_button_text}
              className={inputCls}
            />
            <FieldError message={state.fieldErrors?.cta_button_text} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="primary_button_url" className={labelCls}>
              Telegram Channel Link
            </Label>
            <Input
              id="primary_button_url"
              name="primary_button_url"
              type="url"
              required
              defaultValue={landingPage.primary_button_url}
              placeholder="https://t.me/yourchannel"
              className={inputCls}
            />
            <p className={helperCls}>Where users go after clicking the Telegram button.</p>
            <FieldError message={state.fieldErrors?.primary_button_url} />
          </div>
        </div>

        {/* Row 5: Footer note – full width */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="footer_note" className={labelCls}>
            Disclaimer / Footer Note
          </Label>
          <Textarea
            id="footer_note"
            name="footer_note"
            defaultValue={landingPage.footer_note || ""}
            className="min-h-[88px] rounded-[12px] border-[#E2E8F0] bg-white p-3 text-sm placeholder:text-[#94A3B8] transition-colors focus-visible:border-[#BFDBFE] focus-visible:ring-2 focus-visible:ring-[#BFDBFE]"
          />
          <FieldError message={state.fieldErrors?.footer_note} />
        </div>
      </FormSection>

      <Divider />

      {/* ── SECTION 3: Urgency Settings ── */}
      <FormSection>
        <SectionHeader
          icon={Clock3}
          iconBg="bg-[#FFFBEB]"
          iconColor="text-[#D97706]"
          title="Urgency Settings"
        />

        {/* Info callout */}
        <div className="rounded-[12px] border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2.5 text-[12px] leading-[1.5] text-[#64748B]">
          Use countdowns only when the invitation or campaign truly expires. Avoid fake scarcity.
        </div>

        {/* 3-col row: toggle | seconds | urgency text */}
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              className="flex h-[42px] cursor-pointer items-center gap-2.5 rounded-[12px] border border-[#E2E8F0] bg-white px-3 text-sm font-medium text-[#0F172A] transition-colors hover:bg-[#F8FAFC]"
            >
              <input
                type="checkbox"
                name="is_countdown_enabled"
                defaultChecked={landingPage.is_countdown_enabled}
                className="size-4 rounded border-[#CBD5E1] accent-[#7C3AED]"
              />
              Enable Countdown
            </label>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="countdown_seconds" className={labelCls}>
              Countdown Seconds
            </Label>
            <Input
              id="countdown_seconds"
              name="countdown_seconds"
              type="number"
              min="0"
              max="86400"
              defaultValue={landingPage.countdown_seconds}
              className={inputCls}
            />
            <FieldError message={state.fieldErrors?.countdown_seconds} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="urgency_text" className={labelCls}>
              Urgency Text
            </Label>
            <Input
              id="urgency_text"
              name="urgency_text"
              defaultValue={landingPage.urgency_text || ""}
              placeholder="Invitation closes soon"
              className={inputCls}
            />
            <FieldError message={state.fieldErrors?.urgency_text} />
          </div>
        </div>
      </FormSection>

      <Divider />

      {/* ── SECTION 4: Meta Tracking ── */}
      <FormSection>
        <SectionHeader
          icon={ShieldCheck}
          iconBg="bg-[#F5F3FF]"
          iconColor="text-[#7C3AED]"
          title="Meta Tracking"
        />

        {/* Row 1: Pixel ID + Test Event Code */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pixel_id" className={labelCls}>
              Meta Pixel ID
            </Label>
            <Input
              id="pixel_id"
              name="pixel_id"
              required
              defaultValue={landingPage.tracking?.pixel_id || ""}
              placeholder="123456789012345"
              className={inputCls}
            />
            <p className={helperCls}>Pixel loads only on this landing page.</p>
            <FieldError message={state.fieldErrors?.pixel_id} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="test_event_code" className={labelCls}>
              Test Event Code
            </Label>
            <Input
              id="test_event_code"
              name="test_event_code"
              defaultValue={landingPage.tracking?.test_event_code || ""}
              placeholder="TEST12345"
              className={inputCls}
            />
            <p className={helperCls}>Optional. Used for Meta Events Manager testing.</p>
            <FieldError message={state.fieldErrors?.test_event_code} />
          </div>
        </div>

        {/* Row 2: Conversion Event + CAPI Token */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="default_click_event" className={labelCls}>
              Default Conversion Event
            </Label>
            <select
              id="default_click_event"
              name="default_click_event"
              defaultValue={landingPage.tracking?.default_click_event || "Lead"}
              className={selectCls}
            >
              <option value="Lead">Lead</option>
              <option value="Contact">Contact</option>
              <option value="Subscribe">Subscribe</option>
              <option value="CompleteRegistration">Complete Registration</option>
              <option value="ButtonClick">Button Click</option>
            </select>
            <FieldError message={state.fieldErrors?.default_click_event} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="raw_capi_access_token" className={labelCls}>
              Meta Conversions API Token
            </Label>
            <Input
              id="raw_capi_access_token"
              name="raw_capi_access_token"
              type="password"
              placeholder="Leave blank to keep existing token"
              className={inputCls}
            />
            <p className={helperCls}>
              {landingPage.tracking?.capi_token_last4
                ? `Existing token: ••••${landingPage.tracking.capi_token_last4} — Stored encrypted. Never shown publicly.`
                : "No CAPI token saved. Stored encrypted. Never shown publicly."}
            </p>
            <FieldError message={state.fieldErrors?.raw_capi_access_token} />
          </div>
        </div>
      </FormSection>

      {/* ── Actions ── */}
      <div className="flex items-center gap-3 border-t border-[#E2E8F0] pt-5">
        <SubmitButton disabled={!hasClients} />
        <Button
          asChild
          variant="outline"
          className="h-[42px] rounded-[12px] border-[#E2E8F0] bg-white px-5 text-sm font-semibold text-[#475569] transition-colors hover:bg-[#F8FAFC]"
        >
          <Link href={`/admin/landing-pages/${landingPage.id}`}>Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
