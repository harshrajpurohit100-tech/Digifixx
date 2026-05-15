export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-6 text-center">
      <div className="w-full max-w-[420px] rounded-[18px] border border-[#E2E8F0] bg-white p-8">
        <h1 className="text-xl font-bold text-[#0F172A]">Page not found</h1>
        <p className="mt-3 text-sm leading-6 text-[#64748B]">
          This link may be inactive or no longer available.
        </p>
      </div>
    </main>
  );
}
