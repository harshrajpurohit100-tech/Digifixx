import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";

import { hasSupabaseConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export type AdminRole = "super_admin" | "admin" | "analyst" | "client_viewer";
export type AdminStatus = "active" | "suspended" | "invited";

export type AdminProfile = {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  role: AdminRole;
  status: AdminStatus;
  created_at: string;
  updated_at: string;
};

export type AdminUserResult = {
  user: User | null;
  profile: AdminProfile | null;
};

export type RequiredAdminUserResult = {
  user: User;
  profile: AdminProfile | null;
};

export async function getAdminUser(): Promise<AdminUserResult> {
  if (!hasSupabaseConfig()) {
    return {
      user: null,
      profile: null,
    };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      user: null,
      profile: null,
    };
  }

  const { data: profile } = await supabase
    .from("admin_profiles")
    .select(
      "id,user_id,full_name,email,role,status,created_at,updated_at"
    )
    .eq("user_id", user.id)
    .maybeSingle<AdminProfile>();

  return {
    user,
    profile: profile ?? null,
  };
}

export async function requireAdminUser(): Promise<RequiredAdminUserResult> {
  const adminUser = await getAdminUser();

  if (!adminUser.user) {
    redirect("/admin/login");
  }

  if (adminUser.profile?.status !== "active") {
    redirect("/admin/access-denied");
  }

  return {
    user: adminUser.user,
    profile: adminUser.profile,
  };
}

export function formatAdminRole(role?: AdminRole | null) {
  if (!role) {
    return "Admin";
  }

  return role
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function getAdminDisplayUser(adminUser: RequiredAdminUserResult) {
  return {
    name:
      adminUser.profile?.full_name ??
      adminUser.user.email ??
      adminUser.user.id,
    email: adminUser.profile?.email ?? adminUser.user.email ?? "",
    role: formatAdminRole(adminUser.profile?.role),
  };
}
