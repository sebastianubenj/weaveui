import { useSyncExternalStore } from "react";
import { PRODUCTS, type HomeProduct } from "./catalog";
import type { NavigationBagItem } from "@/components/ui/navigation-bag-loaded";

export const BAG_STORAGE_KEY = "weaveui-bag-v1";
interface BagEntry { productId: string; quantity: number }

const empty: BagEntry[] = [];
let snapshot = empty;
let lastStored: string | null | undefined;
const listeners = new Set<() => void>();

function parseBag(raw: string | null): BagEntry[] {
  try {
    const entries: unknown = JSON.parse(raw ?? "[]");
    if (!Array.isArray(entries)) return [];
    const seen = new Set<string>();
    return entries.filter((entry): entry is BagEntry => {
      if (!entry || typeof entry !== "object") return false;
      const { productId, quantity } = entry;
      if (!PRODUCTS.some((product) => product.id === productId) || seen.has(productId)) return false;
      if (!Number.isSafeInteger(quantity) || quantity < 1) return false;
      seen.add(productId);
      return true;
    }).map(({ productId, quantity }) => ({ productId, quantity }));
  } catch {
    return [];
  }
}

export function readBag() {
  try {
    const stored = localStorage.getItem(BAG_STORAGE_KEY);
    if (stored !== lastStored) {
      lastStored = stored;
      snapshot = parseBag(stored);
    }
  } catch {
    // Keep the in-memory bag usable when browser storage is unavailable.
  }
  return snapshot;
}

function subscribe(notify: () => void) {
  listeners.add(notify);
  const onStorage = (event: StorageEvent) => {
    if (event.key === BAG_STORAGE_KEY || event.key === null) notify();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(notify);
    window.removeEventListener("storage", onStorage);
  };
}

function writeBag(entries: BagEntry[]) {
  snapshot = entries;
  try {
    const stored = JSON.stringify(snapshot);
    localStorage.setItem(BAG_STORAGE_KEY, stored);
    lastStored = stored;
  } catch {
    // Keep the in-memory bag usable when browser storage is unavailable.
  }
  listeners.forEach((notify) => notify());
}

export function changeBagQuantity(productId: string, change: number) {
  const entries = readBag();
  const entry = entries.find((item) => item.productId === productId);
  if (!entry || !Number.isSafeInteger(entry.quantity + change) || entry.quantity + change < 1) return;
  writeBag(entries.map((item) => item === entry ? { ...item, quantity: item.quantity + change } : item));
}

export function removeFromBag(productId: string) {
  writeBag(readBag().filter((item) => item.productId !== productId));
}

export function clearBag() {
  writeBag([]);
}

export function useBagEntries() {
  return useSyncExternalStore(subscribe, readBag, () => empty);
}

export function addProductToBag(product: HomeProduct) {
  const entries = readBag();
  const existing = entries.find((entry) => entry.productId === product.id);
  if (existing && !Number.isSafeInteger(existing.quantity + 1)) return;
  writeBag(existing
    ? entries.map((entry) => entry === existing ? { ...entry, quantity: entry.quantity + 1 } : entry)
    : [...entries, { productId: product.id, quantity: 1 }]);
}

export function useBag(): NavigationBagItem[] {
  const entries = useSyncExternalStore(subscribe, readBag, () => empty);
  return entries.flatMap((entry) => {
    const product = PRODUCTS.find((candidate) => candidate.id === entry.productId);
    return product ? [{
      name: product.name, src: product.src, alt: product.alt,
      quantity: entry.quantity > 1 ? `x${entry.quantity}` : undefined,
    }] : [];
  });
}

export function useBagUnitCount(): number {
  return useSyncExternalStore(subscribe, readBag, () => empty).reduce((total, entry) => total + entry.quantity, 0);
}
