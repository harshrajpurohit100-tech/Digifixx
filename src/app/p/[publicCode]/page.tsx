import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PublicTelegramPage } from "@/components/public/PublicTelegramPage";
import { getActivePublicLandingPageByCode } from "@/lib/repositories/public-landing-pages.repository";

const publicCodePattern = /^[A-Za-z0-9_-]{8,32}$/;

export const dynamic = "force-dynamic";

type PublicLandingPageRouteProps = {
  params: Promise<{
    publicCode: string;
  }>;
};

function isValidPublicCode(publicCode: string) {
  return publicCodePattern.test(publicCode);
}

export async function generateMetadata({
  params,
}: PublicLandingPageRouteProps): Promise<Metadata> {
  const { publicCode } = await params;
  const robots: Metadata["robots"] = {
    index: false,
    follow: false,
    nocache: true,
    noarchive: true,
  };

  if (!isValidPublicCode(publicCode)) {
    return {
      title: "Telegram Channel",
      description: "Open this Telegram channel.",
      robots,
    };
  }

  const page = await getActivePublicLandingPageByCode(publicCode);

  return {
    title: page?.channel_name || "Telegram Channel",
    description: page?.support_line_2 || "Open this Telegram channel.",
    robots,
  };
}

export default async function PublicLandingPageRoute({
  params,
}: PublicLandingPageRouteProps) {
  const { publicCode } = await params;

  if (!isValidPublicCode(publicCode)) {
    notFound();
  }

  const page = await getActivePublicLandingPageByCode(publicCode);

  if (!page) {
    notFound();
  }

  return <PublicTelegramPage page={page} />;
}
