import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { AdminCard } from "@/components/admin/AdminCard";
import { AdminShell } from "@/components/admin/AdminShell";
import { ClientForm } from "@/components/admin/ClientForm";
import { SectionHeader } from "@/components/admin/SectionHeader";
import { Button } from "@/components/ui/button";
import {
  getAdminDisplayUser,
  requireAdminUser,
} from "@/lib/auth/get-admin-user";

export const dynamic = "force-dynamic";

export default async function NewClientPage() {
  const adminUser = await requireAdminUser();

  return (
    <AdminShell
      title="Add Client"
      description="Create a client workspace for landing pages, tracking profiles, and analytics."
      user={getAdminDisplayUser(adminUser)}
    >
      <div className="flex flex-col gap-6">
        <SectionHeader
          title="Add Client"
          description="Create a client workspace for landing pages, tracking profiles, and analytics."
          action={
            <Button
              asChild
              variant="outline"
              className="h-[38px] rounded-[10px] border-[#E2E8F0] bg-white px-3 text-sm font-semibold text-[#475569]"
            >
              <Link href="/admin/clients">
                <ArrowLeft data-icon="inline-start" />
                Back to Clients
              </Link>
            </Button>
          }
        />

        <AdminCard className="w-full" padding="lg">
          <ClientForm />
        </AdminCard>
      </div>
    </AdminShell>
  );
}
