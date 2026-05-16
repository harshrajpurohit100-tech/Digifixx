export function createTrackingEventId(prefix = "evt") {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  const randomValue = Math.random().toString(36).slice(2, 15);
  const timestamp = Date.now().toString(36);

  return `${prefix}_${timestamp}_${randomValue}`;
}
