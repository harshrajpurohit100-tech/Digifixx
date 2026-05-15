import Link from "next/link";

import { DesktopOnlyGuard } from "@/components/admin/DesktopOnlyGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminLoginPage() {
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

          <form className="mt-7 flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email" className="text-[13px] text-[#0F172A]">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@digifixx.in"
                className="h-[42px] rounded-[10px] border-[#E2E8F0] bg-white text-sm"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password" className="text-[13px] text-[#0F172A]">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                className="h-[42px] rounded-[10px] border-[#E2E8F0] bg-white text-sm"
              />
            </div>
            <Button
              asChild
              className="mt-1 h-[42px] w-full rounded-[10px] bg-[#0F172A] text-sm font-semibold text-white hover:bg-[#1E293B]"
            >
              <Link href="/admin/dashboard">Sign in</Link>
            </Button>
          </form>

          <p className="mt-6 text-center text-xs leading-5 text-[#64748B]">
            Secure admin access for authorized users only.
          </p>
        </section>
      </main>
    </DesktopOnlyGuard>
  );
}
