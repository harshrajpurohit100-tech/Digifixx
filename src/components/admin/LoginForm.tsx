"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { loginAction, type LoginActionState } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type LoginFormProps = {
  nextPath?: string;
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      className="mt-1 h-[42px] w-full rounded-[10px] bg-[#0F172A] text-sm font-semibold text-white hover:bg-[#1E293B]"
    >
      {pending ? "Signing in..." : "Sign in"}
    </Button>
  );
}

const initialState: LoginActionState = {};

export function LoginForm({ nextPath }: LoginFormProps) {
  const [state, formAction] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="mt-7 flex flex-col gap-5">
      <input type="hidden" name="next" value={nextPath ?? ""} />
      <div className="flex flex-col gap-2">
        <Label htmlFor="email" className="text-[13px] text-[#0F172A]">
          Email
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="admin@digifixx.in"
          className="h-[42px] rounded-[10px] border-[#E2E8F0] bg-white text-sm"
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="password" className="text-[13px] text-[#0F172A]">
          Password
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          className="h-[42px] rounded-[10px] border-[#E2E8F0] bg-white text-sm"
        />
      </div>
      {state.error ? (
        <div className="rounded-[10px] border border-[#FECACA] bg-[#FEF2F2] px-3 py-2.5 text-[13px] font-medium leading-5 text-[#B91C1C]">
          {state.error}
        </div>
      ) : null}
      <SubmitButton />
    </form>
  );
}
