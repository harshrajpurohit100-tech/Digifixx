import "server-only";

import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";
import {
  createClientSchema,
  type CreateClientInput,
} from "@/lib/validations/digifixx";
import type { Client } from "@/types/digifixx";

export async function listClients() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as Client[];
}

export async function getClientById(clientId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("id", clientId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as Client | null;
}

export async function createClient(input: CreateClientInput) {
  const parsedInput = createClientSchema.parse(input);
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("clients")
    .insert({
      ...parsedInput,
      created_by: user?.id ?? null,
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as Client;
}
