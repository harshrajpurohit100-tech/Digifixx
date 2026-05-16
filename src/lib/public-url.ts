export function getPublicLandingPageUrl(publicCode: string): string {
  const fallbackUrl =
    process.env.NODE_ENV === "production"
      ? "https://digifixx.in"
      : "http://localhost:3001";
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    (typeof window === "undefined" ? process.env.APP_URL : undefined) ??
    fallbackUrl;

  return `${baseUrl.replace(/\/$/, "")}/p/${publicCode}`;
}
