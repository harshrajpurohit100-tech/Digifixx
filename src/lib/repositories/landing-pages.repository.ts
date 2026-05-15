import "server-only";

import { customAlphabet } from "nanoid";

import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";
import {
  createLandingPageSchema,
  type CreateLandingPageInput,
} from "@/lib/validations/digifixx";
import type { LandingPage } from "@/types/digifixx";

const createPublicCode = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  10
);

export async function listLandingPages() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("landing_pages")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as LandingPage[];
}

export async function getLandingPageById(id: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("landing_pages")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as LandingPage | null;
}

export async function getLandingPageByPublicCode(publicCode: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("landing_pages")
    .select("*")
    .eq("public_code", publicCode)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as LandingPage | null;
}

export async function generateUniquePublicCode() {
  const supabase = await createSupabaseServerClient();

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const publicCode = createPublicCode();
    const { data, error } = await supabase
      .from("landing_pages")
      .select("id")
      .eq("public_code", publicCode)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return publicCode;
    }
  }

  throw new Error("Unable to generate a unique public code.");
}

export async function createLandingPage(input: CreateLandingPageInput) {
  const parsedInput = createLandingPageSchema.parse(input);
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("landing_pages")
    .insert({
      ...parsedInput,
      background_style: parsedInput.background_style ?? "default",
      public_code: await generateUniquePublicCode(),
      created_by: user?.id ?? null,
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as LandingPage;
}
