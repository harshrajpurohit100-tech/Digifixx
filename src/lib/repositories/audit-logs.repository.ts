import "server-only";

import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";
import type { AuditAction, AuditLog, JsonRecord } from "@/types/digifixx";

type CreateAuditLogInput = {
  action: AuditAction;
  entity_type: string;
  entity_id?: string | null;
  entity_label?: string | null;
  old_values?: JsonRecord | null;
  new_values?: JsonRecord | null;
  metadata?: JsonRecord;
  ip_hash?: string | null;
  user_agent?: string | null;
};

export async function createAuditLog(input: CreateAuditLogInput) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("audit_logs")
      .insert({
        ...input,
        actor_user_id: user?.id ?? null,
        actor_email: user?.email ?? null,
        metadata: input.metadata ?? {},
      })
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return data as AuditLog;
  } catch {
    return null;
  }
}

export async function listRecentAuditLogs(limit = 25) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return (data ?? []) as AuditLog[];
}
