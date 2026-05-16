import "server-only";

import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";
import {
  createClientSchema,
  type CreateClientInput,
} from "@/lib/validations/digifixx";
import type { Client } from "@/types/digifixx";

export type ClientDirectoryStats = {
  activePages: number;
  trackingProfiles: number;
};

export type ClientWorkspaceSummary = ClientDirectoryStats & {
  totalPages: number;
  totalEvents: number;
};

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

export async function getClientDirectoryStats(
  clientIds: string[]
): Promise<Record<string, ClientDirectoryStats>> {
  if (clientIds.length === 0) {
    return {};
  }

  const supabase = await createSupabaseServerClient();
  const [landingPagesResult, trackingProfilesResult] = await Promise.all([
    supabase
      .from("landing_pages")
      .select("client_id,status")
      .in("client_id", clientIds),
    supabase
      .from("meta_tracking_profiles")
      .select("client_id")
      .in("client_id", clientIds)
      .eq("is_active", true),
  ]);

  if (landingPagesResult.error) {
    throw landingPagesResult.error;
  }

  if (trackingProfilesResult.error) {
    throw trackingProfilesResult.error;
  }

  const stats: Record<string, ClientDirectoryStats> = Object.fromEntries(
    clientIds.map((id) => [
      id,
      {
        activePages: 0,
        trackingProfiles: 0,
      },
    ])
  );

  for (const page of landingPagesResult.data ?? []) {
    if (page.status === "active" && stats[page.client_id]) {
      stats[page.client_id].activePages += 1;
    }
  }

  for (const profile of trackingProfilesResult.data ?? []) {
    if (stats[profile.client_id]) {
      stats[profile.client_id].trackingProfiles += 1;
    }
  }

  return stats;
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

export async function getClientWorkspaceSummary(
  clientId: string
): Promise<ClientWorkspaceSummary> {
  const supabase = await createSupabaseServerClient();
  const [landingPagesResult, activePagesResult, trackingProfilesResult, eventsResult] =
    await Promise.all([
      supabase
        .from("landing_pages")
        .select("id", { count: "exact", head: true })
        .eq("client_id", clientId),
      supabase
        .from("landing_pages")
        .select("id", { count: "exact", head: true })
        .eq("client_id", clientId)
        .eq("status", "active"),
      supabase
        .from("meta_tracking_profiles")
        .select("id", { count: "exact", head: true })
        .eq("client_id", clientId)
        .eq("is_active", true),
      supabase
        .from("tracking_events")
        .select("id", { count: "exact", head: true })
        .eq("client_id", clientId),
    ]);

  for (const result of [
    landingPagesResult,
    activePagesResult,
    trackingProfilesResult,
    eventsResult,
  ]) {
    if (result.error) {
      throw result.error;
    }
  }

  return {
    totalPages: landingPagesResult.count ?? 0,
    activePages: activePagesResult.count ?? 0,
    trackingProfiles: trackingProfilesResult.count ?? 0,
    totalEvents: eventsResult.count ?? 0,
  };
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
