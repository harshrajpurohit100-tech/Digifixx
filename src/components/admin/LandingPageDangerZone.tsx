"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { AdminCard } from "@/components/admin/AdminCard";
import { Button } from "@/components/ui/button";
import { archiveLandingPageAction, deleteLandingPageAction } from "@/app/admin/landing-pages/actions";

type DangerZoneProps = {
  landingPageId: string;
};

export function LandingPageDangerZone({ landingPageId }: DangerZoneProps) {
  const [archiveState, archiveAction, isArchiving] = useActionState(
    async (_state: unknown) => {
      return await archiveLandingPageAction(landingPageId);
    },
    null
  );

  const [deleteState, deleteAction, isDeleting] = useActionState(
    deleteLandingPageAction,
    null
  );

  return (
    <AdminCard className="border-[#EF4444] bg-[#FEF2F2]">
      <h2 className="text-lg font-bold leading-tight text-[#991B1B]">
        Danger Zone
      </h2>
      <p className="mt-2 text-sm leading-6 text-[#991B1B]">
        Archive or permanently delete this landing page. Deleting is permanent and may remove related tracking records later.
      </p>

      <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <form action={archiveAction} className="flex-1">
          <p className="mb-3 text-sm font-semibold text-[#991B1B]">Archive Page</p>
          <p className="mb-4 text-xs text-[#991B1B] opacity-80">
            Archiving hides the page from the public but keeps all data intact.
          </p>
          <Button
            type="submit"
            variant="outline"
            disabled={isArchiving || isDeleting}
            className="h-10 border-[#FCA5A5] bg-white text-[#991B1B] hover:bg-[#FEE2E2] hover:text-[#991B1B]"
          >
            {isArchiving ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Archiving...
              </>
            ) : (
              "Archive Landing Page"
            )}
          </Button>
          {archiveState?.error && (
            <p className="mt-2 text-sm font-semibold text-[#991B1B]">{archiveState.error}</p>
          )}
        </form>

        <div className="hidden w-px bg-[#FCA5A5] md:block self-stretch" />
        <div className="h-px w-full bg-[#FCA5A5] md:hidden" />

        <form action={deleteAction} className="flex-1">
          <p className="mb-3 text-sm font-semibold text-[#991B1B]">Delete Permanently</p>
          <input type="hidden" name="landing_page_id" value={landingPageId} />
          <div className="flex flex-col gap-3">
            <input
              type="text"
              name="confirmation"
              required
              placeholder="Type DELETE to confirm"
              className="h-10 w-full max-w-[250px] rounded-lg border border-[#FCA5A5] bg-white px-3 text-sm text-[#991B1B] placeholder:text-[#FCA5A5] focus:border-[#EF4444] focus:outline-none focus:ring-1 focus:ring-[#EF4444]"
            />
            <div>
              <Button
                type="submit"
                disabled={isDeleting || isArchiving}
                className="h-10 bg-[#EF4444] text-white hover:bg-[#DC2626]"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete Permanently"
                )}
              </Button>
            </div>
          </div>
          {deleteState?.error && (
            <p className="mt-2 text-sm font-semibold text-[#991B1B]">{deleteState.error}</p>
          )}
        </form>
      </div>
    </AdminCard>
  );
}
