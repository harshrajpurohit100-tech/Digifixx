import { Badge } from "@/components/ui/badge";

import { AdminCard } from "@/components/admin/AdminCard";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  getAdminDisplayUser,
  requireAdminUser,
} from "@/lib/auth/get-admin-user";

export const dynamic = "force-dynamic";

const settingsCards = [
  {
    title: "App Settings",
    description:
      "Manage Digifixx runtime identity, deployment URL, and environment configuration.",
    status: "Configured",
  },
  {
    title: "Security Settings",
    description:
      "Supabase authentication, protected admin routes, and admin profiles are active.",
    status: "Active",
  },
  {
    title: "Tracking Settings",
    description:
      "Meta Pixel, Conversions API, and internal analytics are managed per landing page.",
    status: "Active",
  },
  {
    title: "Team Access",
    description:
      "Admin access is controlled through Supabase Auth and the admin profile table.",
    status: "Managed",
  },
];

export default async function SettingsPage() {
  const adminUser = await requireAdminUser();

  return (
    <AdminShell
      title="Settings"
      description="Configure workspace, security, tracking defaults, and access rules."
      user={getAdminDisplayUser(adminUser)}
    >
      <div className="grid grid-cols-2 gap-4">
        {settingsCards.map((card) => (
          <AdminCard key={card.title} className="min-h-44">
            <div className="flex items-start justify-between gap-5">
              <div>
                <h2 className="text-lg font-bold leading-tight text-[#0F172A]">
                  {card.title}
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-[#64748B]">
                  {card.description}
                </p>
              </div>
              <Badge
                variant="outline"
                className="shrink-0 border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B]"
              >
                {card.status}
              </Badge>
            </div>
          </AdminCard>
        ))}
      </div>
    </AdminShell>
  );
}
