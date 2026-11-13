import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { PRODUCTS } from "./catalog";

let storage: Map<string, string>;

beforeEach(() => {
  vi.resetModules();
  storage = new Map();
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
  });
});
afterEach(() => vi.unstubAllGlobals());

test("retains product quantities after a new page loads", async () => {
  const first = await import("./bag");
  first.addProductToBag(PRODUCTS[0]!);
  first.addProductToBag(PRODUCTS[0]!);
  first.addProductToBag(PRODUCTS[1]!);
  vi.resetModules();
  const nextPage = await import("./bag");
  expect(nextPage.readBag()).toEqual([
    { productId: "tp-7", quantity: 2 }, { productId: "op-1-field", quantity: 1 },
  ]);
});

test("ignores unknown products, duplicates and invalid quantities from storage", async () => {
  storage.set("weaveui-bag-v1", JSON.stringify([
    { productId: "tp-7", quantity: 2 }, { productId: "tp-7", quantity: 50 },
    { productId: "unknown", quantity: 1 }, { productId: "op-xy", quantity: -1 },
    { productId: "tx-6", quantity: "2" }, null,
  ]));
  const { readBag } = await import("./bag");
  expect(readBag()).toEqual([{ productId: "tp-7", quantity: 2 }]);
});

test("recovers from corrupt data and keeps working when writes are blocked", async () => {
  storage.set("weaveui-bag-v1", "broken json");
  const { addProductToBag, readBag } = await import("./bag");
  expect(readBag()).toEqual([]);
  vi.stubGlobal("localStorage", {
    getItem: () => "broken json",
    setItem: () => { throw new Error("Quota exceeded"); },
  });
  addProductToBag(PRODUCTS[0]!);
  expect(readBag()).toEqual([{ productId: "tp-7", quantity: 1 }]);
});
