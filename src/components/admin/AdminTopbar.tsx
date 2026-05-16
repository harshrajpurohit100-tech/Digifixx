import { logoutAction } from "@/lib/auth/actions";

type AdminTopbarProps = {
  title: string;
  description?: string;
  user: {
    name: string;
    email: string;
    role: string;
  };
};

export function AdminTopbar({ title, description, user }: AdminTopbarProps) {
  return (
    <header className="relative z-10 flex h-[72px] shrink-0 items-center justify-between border-b border-[#E2E8F0] bg-white/90 px-7 backdrop-blur">
      <div>
        <h1 className="text-xl font-bold leading-tight text-[#0F172A]">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 text-[13px] leading-5 text-[#64748B]">
            {description}
          </p>
        ) : null}
      </div>
      <div className="flex items-center gap-5">
        <span className="inline-flex h-7 items-center rounded-full border border-[#BFDBFE] bg-[#EFF6FF] px-3 text-xs font-bold text-[#1D4ED8] shadow-[0_8px_20px_rgba(37,99,235,0.10)]">
          Dev
        </span>
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-[#0F172A] to-[#2563EB] text-xs font-bold text-white shadow-[0_10px_24px_rgba(15,23,42,0.16)]">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-[13px] font-semibold leading-4 text-[#0F172A]">
              {user.name}
            </p>
            <p className="mt-0.5 text-[11px] leading-4 text-[#64748B]">
              {user.role}
            </p>
          </div>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="h-8 rounded-[10px] border border-[#E2E8F0] bg-white px-3 text-xs font-semibold text-[#475569] transition-colors hover:bg-[#F8FAFC] hover:text-[#0F172A]"
          >
            Logout
          </button>
        </form>
      </div>
    </header>
  );
}
