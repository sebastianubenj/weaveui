import { afterEach, expect, test, vi } from "vitest";
import { checkCompromisedPassword } from "./password-security";

afterEach(() => vi.unstubAllGlobals());

test("checks only a hash prefix and ignores padding matches with zero occurrences", async () => {
  // Published SHA-1 test vector for the deliberately compromised password 'password'.
  const suffix = "1E4C9B93F3F0682250B6CF8331B7EE68FD8";
  const request = vi.fn().mockResolvedValue(new Response(`${suffix}:12\r\n${"A".repeat(35)}:0`));
  vi.stubGlobal("fetch", request);
  expect(await checkCompromisedPassword("password")).toBe("compromised");
  expect(request).toHaveBeenCalledWith("https://api.pwnedpasswords.com/range/5BAA6", expect.objectContaining({
    headers: { "Add-Padding": "true" }, credentials: "omit", referrerPolicy: "no-referrer",
  }));
  request.mockResolvedValue(new Response(`${suffix}:0`));
  expect(await checkCompromisedPassword("password")).toBe("clear");
});

test.each(["", "upstream failure", "ABC:2"])("rejects malformed range response %j", async (body) => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(body)));
  expect(await checkCompromisedPassword("test password")).toBe("unavailable");
});

test("fails closed on HTTP and connection errors", async () => {
  const request = vi.fn().mockResolvedValueOnce(new Response("", { status: 503 })).mockRejectedValueOnce(new Error("Offline"));
  vi.stubGlobal("fetch", request);
  expect(await checkCompromisedPassword("test password")).toBe("unavailable");
  expect(await checkCompromisedPassword("test password")).toBe("unavailable");
});
