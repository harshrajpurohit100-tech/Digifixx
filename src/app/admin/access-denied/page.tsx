import { redirect } from "next/navigation";

import { DesktopOnlyGuard } from "@/components/admin/DesktopOnlyGuard";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/lib/auth/actions";
import { getAdminUser } from "@/lib/auth/get-admin-user";

export const dynamic = "force-dynamic";

export default async function AdminAccessDeniedPage() {
  const { user, profile } = await getAdminUser();

  if (!user) {
    redirect("/admin/login");
  }

  if (profile?.status === "active") {
    redirect("/admin/dashboard");
  }

  return (
    <DesktopOnlyGuard>
      <main className="flex min-h-screen items-center justify-center bg-[#F8FAFC] p-8">
        <section className="w-[460px] rounded-[20px] border border-[#E2E8F0] bg-white p-8 text-center shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
          <div className="mx-auto flex size-12 items-center justify-center rounded-[14px] bg-[#FEF2F2] text-lg font-extrabold text-[#DC2626]">
            D
          </div>
          <h1 className="mt-6 text-xl font-extrabold tracking-[-0.02em] text-[#0F172A]">
            Admin access unavailable
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#64748B]">
            This account is signed in, but it does not have an active Digifixx
            admin profile. Ask a super admin to activate access, then sign in
            again.
          </p>
          <form action={logoutAction} className="mt-7">
            <Button
              type="submit"
              className="h-[42px] rounded-[12px] bg-[#0F172A] px-5 text-sm font-semibold text-white hover:bg-[#1E293B]"
            >
              Sign out
            </Button>
          </form>
        </section>
      </main>
    </DesktopOnlyGuard>
  );
}
