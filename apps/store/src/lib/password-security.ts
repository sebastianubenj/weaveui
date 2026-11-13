import type { CompromisedPasswordResult } from "@weaveui/ds";

/** HIBP range API: only the first five SHA-1 hex characters leave the browser. */
export async function checkCompromisedPassword(password: string): Promise<CompromisedPasswordResult> {
  try {
    const digest = await crypto.subtle.digest("SHA-1", new TextEncoder().encode(password));
    const hash = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0"))
      .join("").toUpperCase();
    const response = await fetch(`https://api.pwnedpasswords.com/range/${hash.slice(0, 5)}`, {
      headers: { "Add-Padding": "true" },
      signal: AbortSignal.timeout(8000),
      credentials: "omit",
      referrerPolicy: "no-referrer",
    });
    if (!response.ok) return "unavailable";

    const rows = (await response.text()).trim().split(/\r?\n/);
    // A malformed or empty response must never count as a successful check.
    if (!rows.every((row) => /^[A-F0-9]{35}:\d+$/i.test(row))) return "unavailable";
    return rows.some((row) => {
      const [suffix, count] = row.split(":");
      return suffix?.toUpperCase() === hash.slice(5) && Number(count) > 0;
    }) ? "compromised" : "clear";
  } catch {
    return "unavailable";
  }
}
