type AdminTopbarProps = {
  title: string;
  description?: string;
};

export function AdminTopbar({ title, description }: AdminTopbarProps) {
  return (
    <header className="flex h-[72px] shrink-0 items-center justify-between border-b border-[#E2E8F0] bg-white px-7">
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
        <span className="inline-flex h-7 items-center rounded-full border border-[#BFDBFE] bg-[#EFF6FF] px-3 text-xs font-semibold text-[#1D4ED8]">
          Development
        </span>
        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-full bg-[#0F172A] text-xs font-bold text-white">
            A
          </div>
          <div>
            <p className="text-[13px] font-semibold leading-4 text-[#0F172A]">
              Admin
            </p>
            <p className="mt-0.5 text-[11px] leading-4 text-[#64748B]">
              Super Admin
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
