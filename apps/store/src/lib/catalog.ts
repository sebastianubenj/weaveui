import type { ProductCardLayout } from "@/components/ui/product-card";

export interface HomeProduct {
  id: string;
  name: string;
  price: string;
  src: string;
  alt: string;
  layout: ProductCardLayout;
}

export const PRODUCTS: HomeProduct[] = [
  {
    id: "tp-7",
    name: "TP-7 aluminum",
    price: "$1499",
    src: "/product-card-tp7.png",
    alt: "Teenage Engineering TP-7 aluminum field recorder",
    layout: "horizontal",
  },
  {
    id: "op-1-field",
    name: "OP-1 field",
    price: "$1999",
    src: "/product-op-1-field.png",
    alt: "Teenage Engineering OP-1 field portable synthesizer",
    layout: "horizontal",
  },
  {
    id: "op-xy",
    name: "OP-XY",
    price: "$2299",
    src: "/product-op-xy.png",
    alt: "Teenage Engineering OP-XY synthesizer",
    layout: "horizontal",
  },
  {
    id: "ep-2350",
    name: "EP–2350 FX–MIC",
    price: "$59",
    src: "/product-ep-2350.png",
    alt: "Teenage Engineering EP-2350 FX-MIC microphone",
    layout: "vertical",
  },
  {
    id: "cm-15",
    name: "CM-15 aluminum",
    price: "$1199",
    src: "/product-cm-15.png",
    alt: "Teenage Engineering CM-15 aluminum microphone",
    layout: "vertical",
  },
  {
    id: "ko-pedal",
    name: "K.O.-PEDAL",
    price: "$99",
    src: "/product-ko-pedal.png",
    alt: "Teenage Engineering K.O.-PEDAL",
    layout: "horizontal",
  },
  {
    id: "tx-6",
    name: "TX-6 black",
    price: "$1199",
    src: "/product-tx-6.png",
    alt: "Teenage Engineering TX-6 black mixer",
    layout: "horizontal",
  },
  {
    id: "life-is-fantastic",
    name: "life is fantastic!",
    price: "$399",
    src: "/product-life-is-fantastic.png",
    alt: "Teenage Engineering life is fantastic speaker",
    layout: "vertical",
  },
  {
    id: "ep-40",
    name: "EP–40 riddim",
    price: "$299",
    src: "/product-ep-40.png",
    alt: "Teenage Engineering EP-40 riddim sampler",
    layout: "vertical",
  },
  {
    id: "ko-ii-fx-mic",
    name: "K.O. II & FX–MIC",
    price: "$359",
    src: "/product-ko-ii-fx-mic.png",
    alt: "Teenage Engineering K.O. II and FX-MIC",
    layout: "horizontal",
  },
];

