// #region agent log
const ENDPOINT = "http://127.0.0.1:7621/ingest/0e986d38-5d34-4228-8a2d-9914e695c467";

type Snap = Record<string, string | number | boolean | null>;

function post(hypothesisId: string, message: string, data: Record<string, unknown>) {
  fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "2693a9" },
    body: JSON.stringify({
      sessionId: "2693a9",
      runId: "pre-fix",
      hypothesisId,
      location: "apps/store/src/debug-resize-observer.ts",
      message,
      data,
      timestamp: Date.now(),
    }),
  }).catch(() => {});
}

function frames(stack: string | undefined) {
  return (stack ?? "")
    .split("\n")
    .slice(1, 6)
    .map((line) => line.trim())
    .filter((line) => !line.includes("debug-resize-observer"));
}

function snap(includeGeometry: boolean): Snap {
  const popup = document.querySelector<HTMLElement>("[data-slot=navigation-panel]");
  const positioner = popup?.parentElement ?? null;
  const bar = document.querySelector<HTMLElement>("[data-slot=navigation]");
  const wrapper = bar?.parentElement ?? null;
  const content = popup?.firstElementChild?.firstElementChild as HTMLElement | null;
  return {
    empty: Boolean(document.querySelector("[data-slot=navigation-bag-empty-title]")),
    starting: popup?.hasAttribute("data-starting-style") ?? false,
    ending: popup?.hasAttribute("data-ending-style") ?? false,
    popupInlineH: popup?.style.height || null,
    popupVarH: popup?.style.getPropertyValue("--popup-height") || null,
    popupVarW: popup?.style.getPropertyValue("--popup-width") || null,
    posH: positioner?.style.getPropertyValue("--positioner-height") || null,
    posW: positioner?.style.getPropertyValue("--positioner-width") || null,
    contentW: positioner?.style.getPropertyValue("--navigation-content-width") || null,
    contentOff: positioner?.style.getPropertyValue("--navigation-content-offset") || null,
    barVar: wrapper?.style.getPropertyValue("--navigation-bar-height") || null,
    popupH: includeGeometry && popup ? popup.offsetHeight : null,
    barH: includeGeometry && bar ? Number(bar.getBoundingClientRect().height.toFixed(2)) : null,
    contentBoxW: includeGeometry && content ? Number(content.getBoundingClientRect().width.toFixed(2)) : null,
    contentBoxH: includeGeometry && content ? Number(content.getBoundingClientRect().height.toFixed(2)) : null,
  };
}

function describe(entry: ResizeObserverEntry) {
  const el = entry.target as HTMLElement;
  return {
    slot: el.getAttribute?.("data-slot"),
    tag: el.tagName,
    w: Number(entry.contentRect.width.toFixed(2)),
    h: Number(entry.contentRect.height.toFixed(2)),
  };
}

const NativeResizeObserver = window.ResizeObserver;
const recent: Record<string, unknown>[] = [];

window.ResizeObserver = class extends NativeResizeObserver {
  constructor(callback: ResizeObserverCallback) {
    const created = frames(new Error().stack);
    super((entries, observer) => {
      const before = snap(false);
      callback(entries, observer);
      const after = snap(false);
      const changed = JSON.stringify(before) !== JSON.stringify(after);
      const bagRelated = before.empty || after.empty || entries.some((entry) =>
        (entry.target as HTMLElement).getAttribute?.("data-slot")?.includes("navigation") ||
        (entry.target as HTMLElement).closest?.("[data-slot=navigation-panel],[data-slot=navigation]"),
      );
      if (!changed && !bagRelated) return;
      const entry = {
        created,
        targets: entries.map((item) => describe(item)),
        before,
        after,
        changed,
      };
      recent.push(entry);
      if (recent.length > 12) recent.shift();
      if (changed) post("A-B-C", "resize callback changed navigation size", entry);
    });
  }
};

window.addEventListener("error", (event) => {
  if (!String(event.message).includes("ResizeObserver")) return;
  post("loop", "resize observer window error", {
    message: event.message,
    snap: snap(true),
    recent,
  });
});

const originalError = console.error.bind(console);
console.error = (...args: unknown[]) => {
  const message = args.map((arg) => (arg instanceof Error ? arg.message : String(arg))).join(" ");
  if (message.includes("ResizeObserver")) {
    post("loop", "resize observer console error", { message, snap: snap(true), recent });
  }
  originalError(...args);
};
// #endregion
