import type { ProductCardLayout } from "@/components/ui/product-card";

export interface HomeProduct {
  id: string;
  name: string;
  price: string;
  src: string;
  alt: string;
  layout: ProductCardLayout;
  description?: string;
  images?: { src: string; alt: string }[];
}

export const PRODUCTS: HomeProduct[] = [
  {
    id: "sp-16",
    description: "Meet the SP-16, a compact sampler and sequencer built for creative music production. Featuring 16 tactile pads, intuitive controls, and real-time sound editing, it gives you the freedom to create, experiment, and shape your sound.",
    name: "SP-16 Black",
    price: "$2,299",
    src: "/product-sp-16.png",
    alt: "SP-16 black sampler",
    layout: "horizontal",
  },
  {
    id: "fx-32",
    description: "Meet the FX-32, a compact DJ controller designed for expressive mixing and live performance. Featuring dual jog wheels, intuitive controls, and real-time audio effects, it puts creative sound manipulation at your fingertips.",
    name: "FX-32 DJ Controller",
    price: "$1,499",
    src: "/product-fx-32.png",
    alt: "FX-32 DJ controller",
    layout: "horizontal",
  },
  {
    id: "a01",
    description: "Meet the A01, a compact synthesizer designed for sound exploration and music creation. Featuring an integrated keyboard, intuitive sound-shaping controls, a sequencer, and an arpeggiator, it brings endless creative possibilities to a portable, minimalist design.",
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
    description: "Meet the SP-12 Aluminum, a portable speaker that combines bold sound with minimalist industrial design. Featuring a durable aluminum body, intuitive controls, and a distinctive carrying handle, it's built to take your music anywhere.",
  },
  {
    id: "mk-20",
    description: "Meet the MK-20, a compact condenser microphone designed for clear, detailed sound capture. Featuring intuitive gain controls and a refined minimalist design, it's the perfect companion for recording vocals, instruments, and creative audio projects.",
    name: "MK-20 Condenser Mic",
    price: "$599",
    src: "/product-mk-20.png",
    alt: "MK-20 condenser microphone",
    layout: "vertical",
  },
  {
    id: "ar-4",
    description: "Meet the AR-4, a portable audio recorder designed to capture sound wherever inspiration strikes. Featuring dual stereo microphones, intuitive recording controls, and real-time audio monitoring, it’s ideal for field recordings, music, and creative audio projects.",
    name: "AR-4  Recorder",
    price: "$249",
    src: "/product-ar-4.png",
    alt: "AR-4 recorder",
    layout: "horizontal",
  },
  {
    id: "mx-4",
    description: "Meet the MX-4, a compact four-channel audio mixer designed for precise sound control. Featuring tactile faders, integrated audio effects, and real-time level monitoring, it brings effortless mixing to studio sessions and live performances.",
    name: "MX-4 Audio Controller",
    price: "$1,199",
    src: "/product-mx-4.png",
    alt: "MX-4 audio controller",
    layout: "horizontal",
  },
  {
    id: "gx-24",
    description: "Meet the GX-24 Groovox, a portable groovebox that combines sampling, sequencing, and sound processing in one versatile instrument. Featuring 16 performance pads, intuitive controls, and built-in effects, it’s designed for beatmaking, experimentation, and live performance.",
    name: "GX-24 Groovox",
    price: "$299",
    src: "/product-gx-24.png",
    alt: "GX-24 Groovox sampler",
    layout: "vertical",
  },
  {
    id: "fx-mic",
    description: "Meet the FX-Mic, a compact microphone and effects recorder designed for creative sound exploration. Featuring built-in audio effects, dedicated gain, tone, and mix controls, and real-time waveform visualization, it lets you capture and transform sound on the go.",
    name: "FX-Mic Effects Recorder",
    price: "$59",
    src: "/product-fx-mic.png",
    alt: "FX-Mic effects recorder",
    layout: "vertical",
  },
  {
    id: "sp-40",
    description: "Meet the SP-40 Wavek, a portable sampler and sound processor designed for experimental music creation. Featuring 16 performance pads, advanced sound-shaping controls, and a dedicated microphone and effects module, it lets you capture, transform, and sequence sounds wherever inspiration strikes.",
    name: "SP-40 Wavek + Mic",
    price: "$359",
    src: "/product-sp-40.png",
    alt: "SP-40 Wavek sampler and microphone",
    layout: "horizontal",
  },
];
