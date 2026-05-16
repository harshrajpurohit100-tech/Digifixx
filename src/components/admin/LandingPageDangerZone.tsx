"use client";

import { useActionState } from "react";
import { AlertTriangle, Archive, Loader2, Trash2 } from "lucide-react";

import {
  archiveLandingPageAction,
  deleteLandingPageAction,
} from "@/app/admin/landing-pages/actions";
import { AdminCard } from "@/components/admin/AdminCard";
import { Button } from "@/components/ui/button";

type DangerZoneProps = {
  landingPageId: string;
};

export function LandingPageDangerZone({ landingPageId }: DangerZoneProps) {
  const [archiveState, archiveAction, isArchiving] = useActionState(
    async () => {
      return await archiveLandingPageAction(landingPageId);
    },
    null
  );

  const [deleteState, deleteAction, isDeleting] = useActionState(
    deleteLandingPageAction,
    null
  );

  return (
    <AdminCard
      className="rounded-[20px] border-[#FECACA] bg-[#FFF7F7] shadow-[0_14px_35px_rgba(15,23,42,0.04)]"
      padding="lg"
    >
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-[13px] bg-[#FEF2F2] text-[#DC2626]">
          <AlertTriangle className="size-[18px]" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-[17px] font-extrabold tracking-[-0.01em] text-[#991B1B]">
            Danger Zone
          </h2>
          <p className="mt-1 text-[13px] leading-5 text-[#991B1B]/80">
            Archive or permanently delete this landing page. Deleting may remove
            related tracking records later.
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4">
        <form
          action={archiveAction}
          className="rounded-[16px] border border-[#FECACA] bg-white p-4"
        >
          <div className="flex items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-[12px] bg-[#FFF7ED] text-[#EA580C]">
              <Archive className="size-4" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-bold text-[#0F172A]">Archive Page</p>
              <p className="mt-1 text-xs leading-5 text-[#64748B]">
                Archiving hides this page from the public but keeps all data
                intact.
              </p>
            </div>
          </div>
          <Button
            type="submit"
            variant="outline"
            disabled={isArchiving || isDeleting}
            className="mt-4 h-[38px] rounded-[12px] border-[#FED7AA] bg-white px-3 text-xs font-bold text-[#C2410C] transition-colors hover:bg-[#FFF7ED] hover:text-[#9A3412]"
          >
            {isArchiving ? (
              <>
                <Loader2 data-icon="inline-start" className="animate-spin" />
                Archiving...
              </>
            ) : (
              "Archive Landing Page"
            )}
          </Button>
          {archiveState?.error ? (
            <p className="mt-2 text-sm font-semibold text-[#991B1B]">
              {archiveState.error}
            </p>
          ) : null}
        </form>

        <form
          action={deleteAction}
          className="rounded-[16px] border border-[#FECACA] bg-white p-4"
        >
          <div className="flex items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-[12px] bg-[#FEF2F2] text-[#DC2626]">
              <Trash2 className="size-4" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-bold text-[#0F172A]">
                Delete Permanently
              </p>
              <p className="mt-1 text-xs leading-5 text-[#64748B]">
                This action cannot be undone.
              </p>
            </div>
          </div>
          <input type="hidden" name="landing_page_id" value={landingPageId} />
          <div className="mt-4 flex items-center gap-3">
            <input
              type="text"
              name="confirmation"
              required
              placeholder="Type DELETE to confirm"
              className="h-[38px] min-w-0 flex-1 rounded-[12px] border border-[#FECACA] bg-white px-3 text-sm text-[#991B1B] outline-none placeholder:text-[#FCA5A5] focus:border-[#EF4444] focus:ring-3 focus:ring-[#FECACA]/55"
            />
            <Button
              type="submit"
              disabled={isDeleting || isArchiving}
              className="h-[38px] rounded-[12px] bg-[#DC2626] px-3 text-xs font-bold text-white transition-colors hover:bg-[#B91C1C]"
            >
              {isDeleting ? (
                <>
                  <Loader2 data-icon="inline-start" className="animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Permanently"
              )}
            </Button>
          </div>
          {deleteState?.error ? (
            <p className="mt-2 text-sm font-semibold text-[#991B1B]">
              {deleteState.error}
            </p>
          ) : null}
        </form>
      </div>
    </AdminCard>
  );
}
