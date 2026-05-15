import { redirect } from "next/navigation";

import { DesktopOnlyGuard } from "@/components/admin/DesktopOnlyGuard";
import { LoginForm } from "@/components/admin/LoginForm";
import { getAdminUser } from "@/lib/auth/get-admin-user";

export const dynamic = "force-dynamic";

type AdminLoginPageProps = {
  searchParams?: Promise<{
    next?: string | string[];
  }>;
};

export default async function AdminLoginPage({
  searchParams,
}: AdminLoginPageProps) {
  const { user } = await getAdminUser();
  if (user) {
    redirect("/admin/dashboard");
  }

  const resolvedSearchParams = await searchParams;
  const nextParam = resolvedSearchParams?.next;
  const nextPath = Array.isArray(nextParam) ? nextParam[0] : nextParam;

  return (
    <DesktopOnlyGuard>
      <main className="flex min-h-screen items-center justify-center bg-[#F8FAFC] p-8">
        <section className="w-[420px] rounded-[20px] border border-[#E2E8F0] bg-white p-8">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-[#0F172A] text-base font-extrabold text-white">
              D
            </div>
            <div>
              <p className="text-[22px] font-extrabold leading-none tracking-[-0.03em] text-[#0F172A]">
                Digifixx
              </p>
              <p className="mt-1 text-xs leading-4 text-[#64748B]">
                Agency Control Panel
              </p>
            </div>
          </div>

          <div className="mt-8">
            <h1 className="text-xl font-bold leading-tight text-[#0F172A]">
              Sign in to Digifixx Admin
            </h1>
            <p className="mt-2 text-[13px] leading-5 text-[#64748B]">
              Secure access for authorized Digifixx operators.
            </p>
          </div>

          <LoginForm nextPath={nextPath} />

          <p className="mt-6 text-center text-xs leading-5 text-[#64748B]">
            Secure admin access for authorized users only.
          </p>
        </section>
      </main>
    </DesktopOnlyGuard>
  );
}
