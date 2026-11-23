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
    id: "sp-16",
    name: "SP-16 Black",
    price: "$2,299",
    src: "/product-sp-16.png",
    alt: "SP-16 black sampler",
    layout: "horizontal",
  },
  {
    id: "fx-32",
    name: "FX-32 DJ Controller",
    price: "$1,499",
    src: "/product-fx-32.png",
    alt: "FX-32 DJ controller",
    layout: "horizontal",
  },
  {
    id: "a01",
    name: "A01 Synth Pad",
    price: "$1,999",
    src: "/product-a01.png",
    alt: "A01 synthesizer",
    layout: "horizontal",
  },
  {
    id: "sp-12",
    name: "SP-12 Aluminum",
    price: "$399",
    src: "/product-sp-12.png",
    alt: "SP-12 aluminum speaker",
    layout: "vertical",
  },
  {
    id: "mk-20",
    name: "MK-20 Condenser Mic",
    price: "$599",
    src: "/product-mk-20.png",
    alt: "MK-20 condenser microphone",
    layout: "vertical",
  },
  {
    id: "ar-4",
    name: "AR-4  Recorder",
    price: "$249",
    src: "/product-ar-4.png",
    alt: "AR-4 recorder",
    layout: "horizontal",
  },
  {
    id: "mx-4",
    name: "MX-4 Audio Controller",
    price: "$1,199",
    src: "/product-mx-4.png",
    alt: "MX-4 audio controller",
    layout: "horizontal",
  },
  {
    id: "gx-24",
    name: "GX-24 Groovox",
    price: "$299",
    src: "/product-gx-24.png",
    alt: "GX-24 Groovox sampler",
    layout: "vertical",
  },
  {
    id: "fx-mic",
    name: "FX-Mic Effects Recorder",
    price: "$59",
    src: "/product-fx-mic.png",
    alt: "FX-Mic effects recorder",
    layout: "vertical",
  },
  {
    id: "sp-40",
    name: "SP-40 Wavek + Mic",
    price: "$359",
    src: "/product-sp-40.png",
    alt: "SP-40 Wavek sampler and microphone",
    layout: "horizontal",
  },
];
