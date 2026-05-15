import { Badge } from "@/components/ui/badge";

import { AdminCard } from "@/components/admin/AdminCard";
import { AdminShell } from "@/components/admin/AdminShell";

const settingsCards = [
  {
    title: "App Settings",
    description:
      "Manage Digifixx workspace identity and environment configuration.",
    status: "Phase 1 placeholder",
  },
  {
    title: "Security Settings",
    description:
      "Authentication, admin access, roles, and session controls will be added in Phase 2.",
    status: "Pending",
  },
  {
    title: "Tracking Settings",
    description:
      "Meta Pixel, Conversions API, and event defaults will be configured in later phases.",
    status: "Pending",
  },
  {
    title: "Team Access",
    description: "Admin roles and invited users will be managed here.",
    status: "Pending",
  },
];

export default function SettingsPage() {
  return (
    <AdminShell
      title="Settings"
      description="Configure workspace, security, tracking defaults, and access rules."
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
