export function isSafeHttpUrl(value: string | null | undefined) {
  if (!value) {
    return false;
  }

  try {
    const url = new URL(value);

    if (url.protocol === "https:") {
      return true;
    }

    if (url.protocol === "http:") {
      return url.hostname === "localhost" || url.hostname === "127.0.0.1";
    }

    return false;
  } catch {
    return false;
  }
}
