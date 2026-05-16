"use server";

import { redirect } from "next/navigation";

import { hasSupabaseConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export type LoginActionState = {
  error?: string;
};

function getSafeNextPath(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return "/admin/dashboard";
  }

  if (
    value.startsWith("/admin") &&
    !value.startsWith("/admin/login") &&
    !value.startsWith("//")
  ) {
    return value;
  }

  return "/admin/dashboard";
}

export async function loginAction(
  _state: LoginActionState,
  formData: FormData
): Promise<LoginActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const nextPath = getSafeNextPath(formData.get("next"));

  if (!email || !password) {
    return {
      error: "Invalid email or password.",
    };
  }

  if (!hasSupabaseConfig()) {
    return {
      error: "Supabase authentication is not configured.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      error: "Invalid email or password.",
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("admin_profiles")
      .select("status")
      .eq("user_id", user.id)
      .maybeSingle<{ status: string }>();

    if (profile?.status !== "active") {
      await supabase.auth.signOut();
      return {
        error: "This account is not authorized for admin access.",
      };
    }
  }

  redirect(nextPath);
}

export async function logoutAction() {
  if (hasSupabaseConfig()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }

  redirect("/admin/login");
}
