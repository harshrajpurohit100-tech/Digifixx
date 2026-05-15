"use client";

import type { ReactNode } from "react";

type DesktopOnlyGuardProps = {
  children: ReactNode;
};

export function DesktopOnlyGuard({ children }: DesktopOnlyGuardProps) {
  return (
    <>
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-6 lg:hidden">
        <section className="w-full max-w-[420px] rounded-[18px] border border-[#E2E8F0] bg-white p-8 text-center">
          <h1 className="text-xl font-bold leading-tight text-[#0F172A]">
            Digifixx Admin is designed for desktop use only.
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#64748B]">
            Please open this panel on a laptop or desktop screen.
          </p>
        </section>
      </div>
      <div className="hidden lg:block">{children}</div>
    </>
  );
}
