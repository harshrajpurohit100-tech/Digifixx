"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { Plus } from "lucide-react";
import type { ReactNode } from "react";

import {
  createLandingPageAction,
  type CreateLandingPageActionState,
} from "@/app/admin/landing-pages/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Client } from "@/types/digifixx";

type LandingPageFormProps = {
  clients: Pick<Client, "id" | "name">[];
};

const initialState: CreateLandingPageActionState = {};

function FieldError({ message }: { message?: string }) {
  return message ? (
    <p className="text-xs font-medium text-[#B91C1C]">{message}</p>
  ) : null;
}

function FormSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="border-b border-[#E2E8F0] pb-6 last:border-b-0 last:pb-0">
      <h2 className="text-lg font-bold leading-tight text-[#0F172A]">
        {title}
      </h2>
      <div className="mt-5 flex flex-col gap-[18px]">{children}</div>
    </section>
  );
}

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending || disabled}
      className="h-[38px] rounded-[10px] bg-[#2563EB] px-3 text-sm font-semibold text-white hover:bg-[#1D4ED8]"
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
        <div className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] p-3 text-[13px] font-medium leading-5 text-[#B91C1C]">
          {state.error}
        </div>
      ) : null}

      <FormSection title="Client Ownership">
        <div className="flex flex-col gap-2">
          <Label htmlFor="client_id" className="text-[13px] text-[#0F172A]">
            Client
          </Label>
          {hasClients ? (
            <select
              id="client_id"
              name="client_id"
              required
              defaultValue=""
              className="h-[42px] rounded-[10px] border border-[#E2E8F0] bg-white px-3 text-sm text-[#0F172A] outline-none transition-colors focus-visible:border-[#2563EB] focus-visible:ring-3 focus-visible:ring-[#2563EB]/20"
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
            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
              <p className="text-sm font-medium text-[#0F172A]">
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
        </div>

        <div className="flex flex-col gap-2">
          <Label
            htmlFor="internal_name"
            className="text-[13px] text-[#0F172A]"
          >
            Internal Page Name
          </Label>
          <Input
            id="internal_name"
            name="internal_name"
            required
            placeholder="Nova Media - Telegram Join Page"
            className="h-[42px] rounded-[10px] border-[#E2E8F0] bg-white text-sm"
          />
          <p className="text-xs leading-5 text-[#64748B]">
            Only visible inside Digifixx. Not used in public URL.
          </p>
          <FieldError message={state.fieldErrors?.internal_name} />
        </div>
      </FormSection>

      <FormSection title="Telegram Page Content">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="channel_name" className="text-[13px] text-[#0F172A]">
              Channel Name
            </Label>
            <Input
              id="channel_name"
              name="channel_name"
              required
              placeholder="OPTIONS MASTER™"
              className="h-[42px] rounded-[10px] border-[#E2E8F0] bg-white text-sm"
            />
            <p className="text-xs leading-5 text-[#64748B]">
              This is shown as the main title on the public page.
            </p>
            <FieldError message={state.fieldErrors?.channel_name} />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="logo" className="text-[13px] text-[#0F172A]">
              Channel Logo
            </Label>
            <Input
              id="logo"
              name="logo"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="h-[42px] rounded-[10px] border-[#E2E8F0] bg-white text-sm"
            />
            <p className="text-xs leading-5 text-[#64748B]">
              Upload a square logo. PNG, JPG, or WEBP. Max 5 MB.
            </p>
            <FieldError message={state.fieldErrors?.logo} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="subscriber_count"
              className="text-[13px] text-[#0F172A]"
            >
              Subscriber Count
            </Label>
            <Input
              id="subscriber_count"
              name="subscriber_count"
              type="number"
              min="0"
              placeholder="17821"
              className="h-[42px] rounded-[10px] border-[#E2E8F0] bg-white text-sm"
            />
            <p className="text-xs leading-5 text-[#64748B]">
              Optional. Leave blank if you do not want to show subscribers.
            </p>
            <FieldError message={state.fieldErrors?.subscriber_count} />
          </div>

          <div className="flex flex-col gap-2">
            <Label
              htmlFor="top_notice_text"
              className="text-[13px] text-[#0F172A]"
            >
              Top Notice Text
            </Label>
            <Input
              id="top_notice_text"
              name="top_notice_text"
              defaultValue="Don't have Telegram yet? Try it now!"
              className="h-[42px] rounded-[10px] border-[#E2E8F0] bg-white text-sm"
            />
            <p className="text-xs leading-5 text-[#64748B]">
              Small notice bar shown at the top of the public page.
            </p>
            <FieldError message={state.fieldErrors?.top_notice_text} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="support_line_1"
              className="text-[13px] text-[#0F172A]"
            >
              Support Line 1
            </Label>
            <Input
              id="support_line_1"
              name="support_line_1"
              placeholder="Start your trading journey with research-backed market education."
              className="h-[42px] rounded-[10px] border-[#E2E8F0] bg-white text-sm"
            />
            <FieldError message={state.fieldErrors?.support_line_1} />
          </div>

          <div className="flex flex-col gap-2">
            <Label
              htmlFor="support_line_2"
              className="text-[13px] text-[#0F172A]"
            >
              Support Line 2
            </Label>
            <Input
              id="support_line_2"
              name="support_line_2"
              placeholder="Join the Telegram channel for updates and learning content."
              className="h-[42px] rounded-[10px] border-[#E2E8F0] bg-white text-sm"
            />
            <FieldError message={state.fieldErrors?.support_line_2} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="cta_button_text"
              className="text-[13px] text-[#0F172A]"
            >
              CTA Button Text
            </Label>
            <Input
              id="cta_button_text"
              name="cta_button_text"
              required
              defaultValue="VIEW IN TELEGRAM"
              className="h-[42px] rounded-[10px] border-[#E2E8F0] bg-white text-sm"
            />
            <FieldError message={state.fieldErrors?.cta_button_text} />
          </div>

          <div className="flex flex-col gap-2">
            <Label
              htmlFor="primary_button_url"
              className="text-[13px] text-[#0F172A]"
            >
              Telegram Channel Link
            </Label>
            <Input
              id="primary_button_url"
              name="primary_button_url"
              type="url"
              required
              placeholder="https://t.me/yourchannel"
              className="h-[42px] rounded-[10px] border-[#E2E8F0] bg-white text-sm"
            />
            <p className="text-xs leading-5 text-[#64748B]">
              This is where users go after clicking the Telegram button.
            </p>
            <FieldError message={state.fieldErrors?.primary_button_url} />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="footer_note" className="text-[13px] text-[#0F172A]">
            Disclaimer / Footer Note
          </Label>
          <Textarea
            id="footer_note"
            name="footer_note"
            placeholder="If you have Telegram, you can view and join this channel right away."
            className="min-h-24 rounded-[10px] border-[#E2E8F0] bg-white text-sm"
          />
          <FieldError message={state.fieldErrors?.footer_note} />
        </div>
      </FormSection>

      <FormSection title="Urgency Settings">
        <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 text-[13px] leading-5 text-[#64748B]">
          Use countdowns only when the invitation or campaign truly expires.
        </div>
        <div className="grid grid-cols-2 gap-4">
          <label className="flex h-[42px] items-center gap-3 rounded-[10px] border border-[#E2E8F0] bg-white px-3 text-sm font-medium text-[#0F172A]">
            <input
              type="checkbox"
              name="is_countdown_enabled"
              className="size-4 rounded border-[#CBD5E1]"
            />
            Enable Countdown
          </label>
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="countdown_seconds"
              className="text-[13px] text-[#0F172A]"
            >
              Countdown Seconds
            </Label>
            <Input
              id="countdown_seconds"
              name="countdown_seconds"
              type="number"
              min="0"
              max="86400"
              defaultValue="0"
              className="h-[42px] rounded-[10px] border-[#E2E8F0] bg-white text-sm"
            />
            <p className="text-xs leading-5 text-[#64748B]">
              Used only if countdown is enabled.
            </p>
            <FieldError message={state.fieldErrors?.countdown_seconds} />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="urgency_text" className="text-[13px] text-[#0F172A]">
            Urgency Text
          </Label>
          <Input
            id="urgency_text"
            name="urgency_text"
            placeholder="Invitation closes soon"
            className="h-[42px] rounded-[10px] border-[#E2E8F0] bg-white text-sm"
          />
          <p className="text-xs leading-5 text-[#64748B]">
            Keep this truthful and avoid fake scarcity.
          </p>
          <FieldError message={state.fieldErrors?.urgency_text} />
        </div>
      </FormSection>

      <FormSection title="Meta Tracking">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="pixel_id" className="text-[13px] text-[#0F172A]">
              Meta Pixel ID
            </Label>
            <Input
              id="pixel_id"
              name="pixel_id"
              required
              placeholder="123456789012345"
              className="h-[42px] rounded-[10px] border-[#E2E8F0] bg-white text-sm"
            />
            <p className="text-xs leading-5 text-[#64748B]">
              This Pixel ID will load only on this landing page.
            </p>
            <FieldError message={state.fieldErrors?.pixel_id} />
          </div>

          <div className="flex flex-col gap-2">
            <Label
              htmlFor="test_event_code"
              className="text-[13px] text-[#0F172A]"
            >
              Test Event Code
            </Label>
            <Input
              id="test_event_code"
              name="test_event_code"
              placeholder="TEST12345"
              className="h-[42px] rounded-[10px] border-[#E2E8F0] bg-white text-sm"
            />
            <FieldError message={state.fieldErrors?.test_event_code} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="default_click_event"
              className="text-[13px] text-[#0F172A]"
            >
              Default Conversion Event
            </Label>
            <select
              id="default_click_event"
              name="default_click_event"
              defaultValue="Lead"
              className="h-[42px] rounded-[10px] border border-[#E2E8F0] bg-white px-3 text-sm text-[#0F172A] outline-none transition-colors focus-visible:border-[#2563EB] focus-visible:ring-3 focus-visible:ring-[#2563EB]/20"
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
          </div>

          <div className="flex flex-col gap-2">
            <Label
              htmlFor="raw_capi_access_token"
              className="text-[13px] text-[#0F172A]"
            >
              Meta Conversions API Token
            </Label>
            <Input
              id="raw_capi_access_token"
              name="raw_capi_access_token"
              type="password"
              placeholder="Paste CAPI access token"
              className="h-[42px] rounded-[10px] border-[#E2E8F0] bg-white text-sm"
            />
            <p className="text-xs leading-5 text-[#64748B]">
              Stored encrypted. Never shown publicly.
            </p>
            <FieldError message={state.fieldErrors?.raw_capi_access_token} />
          </div>
        </div>
      </FormSection>

      <div className="flex items-center gap-3 pt-1">
        <SubmitButton disabled={!hasClients} />
        <Button
          asChild
          variant="outline"
          className="h-[38px] rounded-[10px] border-[#E2E8F0] bg-white px-3 text-sm font-semibold text-[#475569]"
        >
          <Link href="/admin/landing-pages">Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
