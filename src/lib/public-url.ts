export function getPublicLandingPageUrl(publicCode: string): string {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.APP_URL ??
    "http://localhost:3001";

  return `${baseUrl.replace(/\/$/, "")}/p/${publicCode}`;
}
