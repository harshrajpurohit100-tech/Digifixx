"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { Save } from "lucide-react";

import {
  createClientAction,
  type CreateClientActionState,
} from "@/app/admin/clients/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const initialState: CreateClientActionState = {};

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-xs font-medium text-[#B91C1C]">{message}</p>;
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      className="h-[38px] rounded-[10px] bg-[#2563EB] px-3 text-sm font-semibold text-white hover:bg-[#1D4ED8]"
    >
      <Save data-icon="inline-start" />
      {pending ? "Creating Client..." : "Create Client"}
    </Button>
  );
}

export function ClientForm() {
  const [state, formAction] = useActionState(
    createClientAction,
    initialState
  );

  return (
    <form action={formAction} className="flex max-w-[760px] flex-col gap-[18px]">
      {state.error ? (
        <div className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] p-3 text-[13px] font-medium leading-5 text-[#B91C1C]">
          {state.error}
        </div>
      ) : null}

      <div className="flex flex-col gap-2">
        <Label htmlFor="name" className="text-[13px] text-[#0F172A]">
          Client Name
        </Label>
        <Input
          id="name"
          name="name"
          required
          placeholder="Nova Media"
          className="h-[42px] rounded-[10px] border-[#E2E8F0] bg-white text-sm"
        />
        <p className="text-xs leading-5 text-[#64748B]">
          Publicly visible nowhere by default. Used internally in Digifixx.
        </p>
        <FieldError message={state.fieldErrors?.name} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="internal_code" className="text-[13px] text-[#0F172A]">
            Internal Code
          </Label>
          <Input
            id="internal_code"
            name="internal_code"
            placeholder="nova-media"
            className="h-[42px] rounded-[10px] border-[#E2E8F0] bg-white text-sm"
          />
          <p className="text-xs leading-5 text-[#64748B]">
            Optional internal reference code. Keep it short and readable.
          </p>
          <FieldError message={state.fieldErrors?.internal_code} />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="contact_name" className="text-[13px] text-[#0F172A]">
            Contact Name
          </Label>
          <Input
            id="contact_name"
            name="contact_name"
            placeholder="Priya Sharma"
            className="h-[42px] rounded-[10px] border-[#E2E8F0] bg-white text-sm"
          />
          <FieldError message={state.fieldErrors?.contact_name} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="contact_email" className="text-[13px] text-[#0F172A]">
            Contact Email
          </Label>
          <Input
            id="contact_email"
            name="contact_email"
            type="email"
            placeholder="priya@example.com"
            className="h-[42px] rounded-[10px] border-[#E2E8F0] bg-white text-sm"
          />
          <FieldError message={state.fieldErrors?.contact_email} />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="contact_phone" className="text-[13px] text-[#0F172A]">
            Contact Phone
          </Label>
          <Input
            id="contact_phone"
            name="contact_phone"
            placeholder="+91 98765 43210"
            className="h-[42px] rounded-[10px] border-[#E2E8F0] bg-white text-sm"
          />
          <FieldError message={state.fieldErrors?.contact_phone} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="notes" className="text-[13px] text-[#0F172A]">
          Notes
        </Label>
        <Textarea
          id="notes"
          name="notes"
          placeholder="Internal notes for this client workspace."
          className="min-h-32 rounded-[10px] border-[#E2E8F0] bg-white text-sm"
        />
        <FieldError message={state.fieldErrors?.notes} />
      </div>

      <div className="flex items-center gap-3 pt-1">
        <SubmitButton />
        <Button
          asChild
          variant="outline"
          className="h-[38px] rounded-[10px] border-[#E2E8F0] bg-white px-3 text-sm font-semibold text-[#475569]"
        >
          <Link href="/admin/clients">Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
