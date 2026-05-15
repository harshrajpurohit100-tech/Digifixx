"use server";

import { redirect } from "next/navigation";

import { getAdminUser } from "@/lib/auth/get-admin-user";
import { createAuditLog } from "@/lib/repositories/audit-logs.repository";
import { createClient } from "@/lib/repositories/clients.repository";
import { createClientSchema } from "@/lib/validations/digifixx";

export type CreateClientActionState = {
  error?: string;
  fieldErrors?: Partial<
    Record<
      ClientFormField,
      string
    >
  >;
};

type ClientFormField =
  | "name"
  | "internal_code"
  | "contact_name"
  | "contact_email"
  | "contact_phone"
  | "notes";

function getFormValue(formData: FormData, key: ClientFormField) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function createClientAction(
  _state: CreateClientActionState,
  formData: FormData
): Promise<CreateClientActionState> {
  const adminUser = await getAdminUser();

  if (!adminUser.user || adminUser.profile?.status !== "active") {
    return {
      error: "You are not authorized to create clients.",
    };
  }

  const rawInput = {
    name: getFormValue(formData, "name"),
    internal_code: getFormValue(formData, "internal_code"),
    contact_name: getFormValue(formData, "contact_name"),
    contact_email: getFormValue(formData, "contact_email"),
    contact_phone: getFormValue(formData, "contact_phone"),
    notes: getFormValue(formData, "notes"),
  };

  const parsedInput = createClientSchema.safeParse(rawInput);

  if (!parsedInput.success) {
    const flattenedErrors = parsedInput.error.flatten().fieldErrors;

    return {
      error: "Please check the highlighted fields and try again.",
      fieldErrors: Object.fromEntries(
        Object.entries(flattenedErrors).map(([field, messages]) => [
          field,
          messages?.[0],
        ])
      ),
    };
  }

  let createdClient;

  try {
    createdClient = await createClient(parsedInput.data);
  } catch (error) {
    console.error("Unable to create client", error);
    return {
      error:
        "There was a problem creating this client. Check Supabase configuration and RLS policies.",
    };
  }

  await createAuditLog({
    action: "create",
    entity_type: "client",
    entity_id: createdClient.id,
    entity_label: createdClient.name,
    new_values: {
      id: createdClient.id,
      name: createdClient.name,
      internal_code: createdClient.internal_code,
      contact_name: createdClient.contact_name,
      contact_email: createdClient.contact_email,
      contact_phone: createdClient.contact_phone,
      status: createdClient.status,
    },
  });

  redirect("/admin/clients");
}
