import { notFound } from "next/navigation";

import { AdminShell } from "@/components/admin/AdminShell";
import { LandingPageEditForm } from "@/components/admin/LandingPageEditForm";
import { getAdminDisplayUser, requireAdminUser } from "@/lib/auth/get-admin-user";
import { listClients } from "@/lib/repositories/clients.repository";
import { getLandingPageDetail } from "@/lib/repositories/landing-pages.repository";

export const dynamic = "force-dynamic";

type LandingPageEditPageProps = {
  params: Promise<{
    landingPageId: string;
  }>;
};

export default async function LandingPageEditPage({ params }: LandingPageEditPageProps) {
  const adminUser = await requireAdminUser();
  const { landingPageId } = await params;
  
  const [page, clients] = await Promise.all([
    getLandingPageDetail(landingPageId),
    listClients(),
  ]);

  if (!page) {
    notFound();
  }

  const plainLandingPage = {
    id: page.id,
    client_id: page.client_id,
    internal_name: page.internal_name,
    status: page.status,
    channel_name: page.channel_name,
    logo_url: page.logo_url,
    subscriber_count: page.subscriber_count,
    top_notice_text: page.top_notice_text,
    support_line_1: page.support_line_1,
    support_line_2: page.support_line_2,
    cta_button_text: page.cta_button_text,
    primary_button_url: page.primary_button_url,
    footer_note: page.footer_note,
    is_countdown_enabled: page.is_countdown_enabled,
    countdown_seconds: page.countdown_seconds,
    urgency_text: page.urgency_text,
    tracking: page.tracking_profile ? {
      pixel_id: page.tracking_profile.pixel_id,
      capi_token_last4: page.tracking_profile.capi_token_last4,
      test_event_code: page.tracking_profile.test_event_code,
      default_click_event: page.tracking_profile.default_click_event,
    } : null,
  };

  const plainClients = clients.map((client) => ({
    id: client.id,
    name: client.name,
    status: client.status,
  }));

  return (
    <AdminShell
      title="Edit Landing Page"
      description="Update Telegram page content, public status, and Meta tracking configuration."
      user={getAdminDisplayUser(adminUser)}
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
          <LandingPageEditForm
            clients={plainClients}
            landingPage={plainLandingPage}
          />
        </div>
        <div className="hidden lg:block">
           <div className="sticky top-7 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-6 text-center text-[#64748B]">
             Preview available on detail page.
           </div>
        </div>
      </div>
    </AdminShell>
  );
}
