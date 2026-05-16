"use client";

import type { ReactNode } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import {
  AlertTriangle,
  Building2,
  Clock3,
  Plus,
  ShieldCheck,
  Send,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import {
  createLandingPageAction,
  type CreateLandingPageActionState,
} from "@/app/admin/landing-pages/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DEFAULT_CTA_BUTTON_TEXT,
  DEFAULT_FOOTER_NOTE,
  DEFAULT_SUPPORT_LINE_1,
  DEFAULT_SUPPORT_LINE_2,
  DEFAULT_TOP_NOTICE_TEXT,
} from "@/lib/landing-page-defaults";

export type ClientOption = {
  id: string;
  name: string;
  status: "active" | "paused" | "archived";
};

type LandingPageFormProps = {
  clients: ClientOption[];
};

const initialState: CreateLandingPageActionState = {};

const inputClassName =
  "h-[42px] rounded-[12px] border-[#E2E8F0] bg-white text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus-visible:border-[#BFDBFE] focus-visible:ring-3 focus-visible:ring-[#BFDBFE]/45";

const selectClassName =
  "h-[42px] rounded-[12px] border border-[#E2E8F0] bg-white px-3 text-sm text-[#0F172A] outline-none transition-colors focus-visible:border-[#BFDBFE] focus-visible:ring-3 focus-visible:ring-[#BFDBFE]/45";

const textareaClassName =
  "min-h-24 rounded-[12px] border-[#E2E8F0] bg-white p-3 text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus-visible:border-[#BFDBFE] focus-visible:ring-3 focus-visible:ring-[#BFDBFE]/45";

const fileInputClassName =
  "h-[42px] rounded-[12px] border-[#E2E8F0] bg-white text-sm text-[#64748B] file:mr-4 file:h-full file:rounded-l-[12px] file:border-0 file:bg-[#F1F5F9] file:px-4 file:text-sm file:font-semibold file:text-[#334155] hover:file:bg-[#E2E8F0]";

function FieldError({ message }: { message?: string }) {
  return message ? (
    <p className="text-xs font-semibold text-[#B91C1C]">{message}</p>
  ) : null;
}

function FieldShell({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`flex flex-col gap-2 ${className}`}>{children}</div>;
}

function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <Label
      htmlFor={htmlFor}
      className="text-[13px] font-semibold text-[#0F172A]"
    >
      {children}
    </Label>
  );
}

function HelperText({ children }: { children: ReactNode }) {
  return <p className="text-xs leading-5 text-[#64748B]">{children}</p>;
}

function FormSection({
  title,
  icon: Icon,
  tone = "purple",
  children,
}: {
  title: string;
  icon: LucideIcon;
  tone?: "purple" | "blue" | "amber";
  children: ReactNode;
}) {
  const toneClass = {
    purple: "bg-[#F5F3FF] text-[#7C3AED]",
    blue: "bg-[#EFF6FF] text-[#2563EB]",
    amber: "bg-[#FFF7ED] text-[#D97706]",
  }[tone];

  return (
    <section className="border-b border-[#E2E8F0] pb-6 last:border-b-0 last:pb-0">
      <div className="flex items-center gap-3">
        <span
          className={`flex size-[38px] items-center justify-center rounded-[12px] ${toneClass}`}
        >
          <Icon className="size-[18px]" aria-hidden="true" />
        </span>
        <h2 className="text-[18px] font-extrabold leading-tight tracking-[-0.01em] text-[#0F172A]">
          {title}
        </h2>
      </div>
      <div className="mt-[18px] flex flex-col gap-[18px]">{children}</div>
    </section>
  );
}

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending || disabled}
      className="h-[42px] rounded-[12px] bg-gradient-to-r from-[#2563EB] to-[#7C3AED] px-4 text-sm font-bold text-white shadow-[0_12px_24px_rgba(37,99,235,0.22)] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:from-[#1D4ED8] hover:to-[#6D28D9] hover:shadow-[0_16px_30px_rgba(37,99,235,0.28)]"
    >
      <Plus data-icon="inline-start" />
      {pending ? "Creating Landing Page..." : "Create Landing Page"}
    </Button>
  );
}

export function LandingPageForm({ clients }: LandingPageFormProps) {
  const [state, formAction] = useActionState(
    createLandingPageAction,
    initialState
  );
  const hasClients = clients.length > 0;

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {state.error ? (
        <div className="flex items-start gap-3 rounded-[14px] border border-[#FECACA] bg-[#FEF2F2] px-3.5 py-3 text-[13px] font-semibold leading-5 text-[#B91C1C]">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{state.error}</span>
        </div>
      ) : null}

      <FormSection title="Client Ownership" icon={Building2}>
        <div className="grid grid-cols-2 gap-4">
          <FieldShell>
            <FieldLabel htmlFor="client_id">Client</FieldLabel>
            {hasClients ? (
              <select
                id="client_id"
                name="client_id"
                required
                defaultValue=""
                className={selectClassName}
              >
                <option value="" disabled>
                  Select client
                </option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            ) : (
              <div className="rounded-[14px] border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                <p className="text-sm font-semibold text-[#0F172A]">
                  Create a client before creating a landing page.
                </p>
                <Button
                  asChild
                  variant="outline"
                  className="mt-3 h-8 rounded-[10px] border-[#E2E8F0] bg-white px-3 text-xs font-semibold text-[#475569]"
                >
                  <Link href="/admin/clients/new">Create Client</Link>
                </Button>
              </div>
            )}
            <FieldError message={state.fieldErrors?.client_id} />
          </FieldShell>

          <FieldShell>
            <FieldLabel htmlFor="internal_name">Internal Page Name</FieldLabel>
            <Input
              id="internal_name"
              name="internal_name"
              required
              placeholder="Nova Media - Telegram Join Page"
              className={inputClassName}
            />
            <HelperText>
              Only visible inside Digifixx. Not used in public URL.
            </HelperText>
            <FieldError message={state.fieldErrors?.internal_name} />
          </FieldShell>
        </div>
      </FormSection>

      <FormSection title="Telegram Page Content" icon={Send} tone="blue">
        <div className="grid grid-cols-2 gap-4">
          <FieldShell>
            <FieldLabel htmlFor="channel_name">Channel Name</FieldLabel>
            <Input
              id="channel_name"
              name="channel_name"
              required
              placeholder="OPTIONS MASTER™"
              className={inputClassName}
            />
            <HelperText>This is shown as the main title on the public page.</HelperText>
            <FieldError message={state.fieldErrors?.channel_name} />
          </FieldShell>

          <FieldShell>
            <FieldLabel htmlFor="logo">Channel Logo</FieldLabel>
            <Input
              id="logo"
              name="logo"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className={fileInputClassName}
            />
            <HelperText>Upload square logo. PNG, JPG, or WEBP. Max 5 MB.</HelperText>
            <FieldError message={state.fieldErrors?.logo} />
          </FieldShell>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FieldShell>
            <FieldLabel htmlFor="subscriber_count">Subscriber Count</FieldLabel>
            <Input
              id="subscriber_count"
              name="subscriber_count"
              type="number"
              min="0"
              placeholder="17821"
              className={inputClassName}
            />
            <HelperText>
              Optional. Leave blank if you do not want to show subscribers.
            </HelperText>
            <FieldError message={state.fieldErrors?.subscriber_count} />
          </FieldShell>

          <FieldShell>
            <FieldLabel htmlFor="top_notice_text">Top Notice Text</FieldLabel>
            <Input
              id="top_notice_text"
              name="top_notice_text"
              defaultValue={DEFAULT_TOP_NOTICE_TEXT}
              className={inputClassName}
            />
            <HelperText>Small notice bar shown at the top of the public page.</HelperText>
            <FieldError message={state.fieldErrors?.top_notice_text} />
          </FieldShell>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FieldShell>
            <FieldLabel htmlFor="support_line_1">Support Line 1</FieldLabel>
            <Input
              id="support_line_1"
              name="support_line_1"
              defaultValue={DEFAULT_SUPPORT_LINE_1}
              placeholder={DEFAULT_SUPPORT_LINE_1}
              className={inputClassName}
            />
            <FieldError message={state.fieldErrors?.support_line_1} />
          </FieldShell>

          <FieldShell>
            <FieldLabel htmlFor="support_line_2">Support Line 2</FieldLabel>
            <Input
              id="support_line_2"
              name="support_line_2"
              defaultValue={DEFAULT_SUPPORT_LINE_2}
              placeholder={DEFAULT_SUPPORT_LINE_2}
              className={inputClassName}
            />
            <FieldError message={state.fieldErrors?.support_line_2} />
          </FieldShell>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FieldShell>
            <FieldLabel htmlFor="cta_button_text">CTA Button Text</FieldLabel>
            <Input
              id="cta_button_text"
              name="cta_button_text"
              defaultValue={DEFAULT_CTA_BUTTON_TEXT}
              className={inputClassName}
            />
            <FieldError message={state.fieldErrors?.cta_button_text} />
          </FieldShell>

          <FieldShell>
            <FieldLabel htmlFor="primary_button_url">
              Telegram Channel Link
            </FieldLabel>
            <Input
              id="primary_button_url"
              name="primary_button_url"
              type="url"
              required
              placeholder="https://t.me/yourchannel"
              className={inputClassName}
            />
            <HelperText>
              This is where users go after clicking the Telegram button.
            </HelperText>
            <FieldError message={state.fieldErrors?.primary_button_url} />
          </FieldShell>
        </div>

        <FieldShell>
          <FieldLabel htmlFor="footer_note">Disclaimer / Footer Note</FieldLabel>
          <Textarea
            id="footer_note"
            name="footer_note"
            defaultValue={DEFAULT_FOOTER_NOTE}
            placeholder={DEFAULT_FOOTER_NOTE}
            className={textareaClassName}
          />
          <FieldError message={state.fieldErrors?.footer_note} />
        </FieldShell>
      </FormSection>

      <FormSection title="Urgency Settings" icon={Clock3} tone="amber">
        <div className="rounded-[12px] border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-3 text-[13px] leading-5 text-[#64748B]">
          Use countdowns only when the invitation or campaign truly expires.
        </div>
        <div className="grid grid-cols-[minmax(190px,0.8fr)_minmax(0,0.8fr)_minmax(0,1.4fr)] gap-4">
          <label className="flex h-[42px] items-center gap-3 self-end rounded-[12px] border border-[#E2E8F0] bg-white px-3 text-sm font-semibold text-[#0F172A]">
            <input
              type="checkbox"
              name="is_countdown_enabled"
              className="size-4 rounded border-[#CBD5E1]"
            />
            Enable Countdown
          </label>
          <FieldShell>
            <FieldLabel htmlFor="countdown_seconds">
              Countdown Seconds
            </FieldLabel>
            <Input
              id="countdown_seconds"
              name="countdown_seconds"
              type="number"
              min="0"
              max="86400"
              defaultValue="0"
              className={inputClassName}
            />
            <FieldError message={state.fieldErrors?.countdown_seconds} />
          </FieldShell>
          <FieldShell>
            <FieldLabel htmlFor="urgency_text">Urgency Text</FieldLabel>
            <Input
              id="urgency_text"
              name="urgency_text"
              placeholder="Invitation closes soon"
              className={inputClassName}
            />
            <HelperText>Keep this truthful and avoid fake scarcity.</HelperText>
            <FieldError message={state.fieldErrors?.urgency_text} />
          </FieldShell>
        </div>
      </FormSection>

      <FormSection title="Meta Tracking" icon={ShieldCheck}>
        <div className="grid grid-cols-2 gap-4">
          <FieldShell>
            <FieldLabel htmlFor="pixel_id">Meta Pixel ID</FieldLabel>
            <Input
              id="pixel_id"
              name="pixel_id"
              required
              placeholder="123456789012345"
              className={inputClassName}
            />
            <HelperText>This Pixel ID will load only on this landing page.</HelperText>
            <FieldError message={state.fieldErrors?.pixel_id} />
          </FieldShell>

          <FieldShell>
            <FieldLabel htmlFor="test_event_code">Test Event Code</FieldLabel>
            <Input
              id="test_event_code"
              name="test_event_code"
              placeholder="TEST12345"
              className={inputClassName}
            />
            <FieldError message={state.fieldErrors?.test_event_code} />
          </FieldShell>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FieldShell>
            <FieldLabel htmlFor="default_click_event">
              Default Conversion Event
            </FieldLabel>
            <select
              id="default_click_event"
              name="default_click_event"
              defaultValue="Lead"
              className={selectClassName}
            >
              <option value="Lead">Lead</option>
              <option value="Contact">Contact</option>
              <option value="Subscribe">Subscribe</option>
              <option value="CompleteRegistration">
                Complete Registration
              </option>
              <option value="ButtonClick">Button Click</option>
            </select>
            <FieldError message={state.fieldErrors?.default_click_event} />
          </FieldShell>

          <FieldShell>
            <FieldLabel htmlFor="raw_capi_access_token">
              Meta Conversions API Token
            </FieldLabel>
            <Input
              id="raw_capi_access_token"
              name="raw_capi_access_token"
              type="password"
              placeholder="Paste CAPI access token"
              className={inputClassName}
            />
            <HelperText>Stored encrypted. Never shown publicly.</HelperText>
            <FieldError message={state.fieldErrors?.raw_capi_access_token} />
          </FieldShell>
        </div>
      </FormSection>

      <div className="flex items-center gap-3 border-t border-[#E2E8F0] pt-6">
        <SubmitButton disabled={!hasClients} />
        <Button
          asChild
          variant="outline"
          className="h-[42px] rounded-[12px] border-[#E2E8F0] bg-white px-4 text-sm font-semibold text-[#475569] transition-colors hover:bg-[#F8FAFC] hover:text-[#0F172A]"
        >
          <Link href="/admin/landing-pages">Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
