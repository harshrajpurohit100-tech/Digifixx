import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { AdminCard } from "@/components/admin/AdminCard";
import { AdminShell } from "@/components/admin/AdminShell";
import { LandingPageForm } from "@/components/admin/LandingPageForm";
import { SectionHeader } from "@/components/admin/SectionHeader";
import { Button } from "@/components/ui/button";
import {
  getAdminDisplayUser,
  requireAdminUser,
} from "@/lib/auth/get-admin-user";
import { listClients } from "@/lib/repositories/clients.repository";
import type { Client } from "@/types/digifixx";

export const dynamic = "force-dynamic";

function PreviewStructureCard() {
  return (
    <AdminCard className="sticky top-7">
      <h2 className="text-lg font-bold leading-tight text-[#0F172A]">
        Public Page Preview Structure
      </h2>
      <div className="mt-5 overflow-hidden rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC]">
        <div className="bg-[#0EA5E9] px-4 py-2 text-center text-xs font-semibold text-white">
          Don&apos;t have Telegram yet? Try it now!
        </div>
        <div className="p-6 text-center">
          <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-white text-xl font-bold text-[#2563EB] ring-1 ring-[#E2E8F0]">
            D
          </div>
          <h3 className="mt-4 text-xl font-bold text-[#0F172A]">
            Channel Name
          </h3>
          <p className="mt-1 text-sm text-[#64748B]">17,821 subscribers</p>
          <div className="mt-4 space-y-2 text-sm leading-5 text-[#475569]">
            <p>Start your trading journey with research-backed education.</p>
            <p>Join the Telegram channel for updates and learning content.</p>
          </div>
          <div className="mt-5 rounded-xl bg-[#0284C7] px-4 py-3 text-sm font-bold text-white">
            VIEW IN TELEGRAM
          </div>
          <p className="mt-4 text-xs leading-5 text-[#64748B]">
            Footer note and compliance copy appears here.
          </p>
        </div>
      </div>
    </AdminCard>
  );
}

export default async function NewLandingPagePage() {
  const adminUser = await requireAdminUser();
  let clients: Pick<Client, "id" | "name">[] = [];

  try {
    clients = (await listClients()).map((client) => ({
      id: client.id,
      name: client.name,
    }));
  } catch (error) {
    console.error("Unable to load clients for landing page form", error);
  }

  return (
    <AdminShell
      title="Create Landing Page"
      description="Build a short coded Telegram landing page with dedicated Pixel and CAPI tracking."
      user={getAdminDisplayUser(adminUser)}
    >
      <div className="flex flex-col gap-6">
        <SectionHeader
          title="Create Landing Page"
          description="Build a short coded Telegram landing page with dedicated Pixel and CAPI tracking."
          action={
            <Button
              asChild
              variant="outline"
              className="h-[38px] rounded-[10px] border-[#E2E8F0] bg-white px-3 text-sm font-semibold text-[#475569]"
            >
              <Link href="/admin/landing-pages">
                <ArrowLeft data-icon="inline-start" />
                Back to Landing Pages
              </Link>
            </Button>
          }
        />

        <div className="grid grid-cols-[2fr_1fr] gap-6">
          <AdminCard padding="lg">
            <LandingPageForm clients={clients} />
          </AdminCard>
          <PreviewStructureCard />
        </div>
      </div>
    </AdminShell>
  );
}
