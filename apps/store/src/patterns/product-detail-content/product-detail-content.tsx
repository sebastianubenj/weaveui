import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Button, Icon } from "@weaveui/ds";
import type { HomeProduct } from "@/lib/catalog";

export interface ProductDetailContentProps {
  product: HomeProduct;
  onAdd: () => void;
}

export function ProductDetailContent({ product, onAdd }: ProductDetailContentProps) {
  const [slide, setSlide] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const targetPosition = useRef(1);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const touching = useRef(false);
  const gesture = useRef<{ x: number; y: number; left: number; time: number; horizontal: boolean } | null>(null);
  const images = [{ src: product.src, alt: product.alt }, ...(product.images ?? [])];
  const slideCount = Math.max(4, images.length);
  useLayoutEffect(() => {
    const track = trackRef.current;
    if (track) track.scrollTo({ left: track.clientWidth, behavior: "instant" });
  }, [slideCount]);

  useEffect(() => () => clearTimeout(settleTimer.current), []);

  function scrollToPosition(position: number) {
    const track = trackRef.current;
    if (!track) return;
    clearTimeout(settleTimer.current);
    if (position > slideCount + 1 || position < 0) {
      const shift = position > slideCount + 1 ? -slideCount : slideCount;
      track.scrollTo({ left: track.scrollLeft + shift * track.clientWidth, behavior: "instant" });
      position += shift;
    }
    targetPosition.current = position;
    track.scrollTo({ left: position * track.clientWidth });
  }

  function goToSlide(index: number) {
    const current = (targetPosition.current - 1 + slideCount) % slideCount;
    const position = current === slideCount - 1 && index === 0
      ? slideCount + 1
      : current === 0 && index === slideCount - 1 ? 0 : index + 1;
    scrollToPosition(position);
  }
  const move = (offset: number) => scrollToPosition(targetPosition.current + offset);

  function syncScroll(track: HTMLDivElement) {
    if (!track.clientWidth) return;
    const position = Math.round(track.scrollLeft / track.clientWidth);
    setSlide((position - 1 + slideCount) % slideCount);
    clearTimeout(settleTimer.current);
    if (touching.current) return;
    settleTimer.current = setTimeout(() => {
      const settled = Math.round(track.scrollLeft / track.clientWidth);
      if (settled === 0 || settled === slideCount + 1) {
        const normalized = settled === 0 ? slideCount : 1;
        targetPosition.current = normalized;
        track.scrollTo({ left: normalized * track.clientWidth, behavior: "instant" });
      } else {
        targetPosition.current = settled;
      }
    }, 150);
  }

  function finishTouch(track: HTMLDivElement, x: number, time: number, cancelled = false) {
    const start = gesture.current;
    gesture.current = null;
    touching.current = false;
    if (!start) return;
    track.style.scrollSnapType = "";
    if (start.horizontal) {
      const distance = x - start.x;
      const fast = time - start.time < 300 && Math.abs(distance) > 24;
      const advance = !cancelled && (Math.abs(distance) > track.clientWidth * 0.12 || fast);
      const initial = Math.round(start.left / track.clientWidth);
      const target = Math.max(0, Math.min(slideCount + 1, initial + (advance ? (distance < 0 ? 1 : -1) : 0)));
      scrollToPosition(target);
    }
    syncScroll(track);
  }

  return (
    <div className="flex justify-center px-(--semantics-layout-mobile-grid-margin) md:px-(--primitives-spacing-8)">
      <div className="flex w-full max-w-(--semantics-layout-desktop-content-max-width-1062) flex-col gap-(--primitives-spacing-4) pt-(--primitives-spacing-4) pb-(--primitives-spacing-32) md:flex-row md:gap-(--primitives-spacing-6)">
        <section aria-label={`${product.name} images`} aria-roledescription="carousel" className="relative aspect-square w-full overflow-hidden [background-color:var(--semantics-colors-background-subtle)] md:w-0 md:flex-1">
          <div ref={trackRef} tabIndex={0} aria-label="Product images" role="group" onTouchStart={(event) => { const track = event.currentTarget; const touch = event.touches[0]; touching.current = true; clearTimeout(settleTimer.current); targetPosition.current = Math.round(track.scrollLeft / track.clientWidth); gesture.current = { x: touch.clientX, y: touch.clientY, left: track.scrollLeft, time: event.timeStamp, horizontal: false }; }} onTouchMove={(event) => { const start = gesture.current; if (!start) return; const track = event.currentTarget; const touch = event.touches[0]; const dx = touch.clientX - start.x; const dy = touch.clientY - start.y; if (!start.horizontal && Math.abs(dx) > 5 && Math.abs(dx) > Math.abs(dy)) { start.horizontal = true; track.style.scrollSnapType = "none"; } if (start.horizontal) { const initial = Math.round(start.left / track.clientWidth) * track.clientWidth; track.scrollTo({ left: Math.max(initial - track.clientWidth, Math.min(initial + track.clientWidth, start.left - dx)), behavior: "instant" }); } }} onTouchEnd={(event) => finishTouch(event.currentTarget, event.changedTouches[0].clientX, event.timeStamp)} onTouchCancel={(event) => finishTouch(event.currentTarget, event.changedTouches[0]?.clientX ?? gesture.current?.x ?? 0, event.timeStamp, true)} onScroll={(event) => syncScroll(event.currentTarget)} className="flex size-full touch-pan-y snap-x snap-mandatory overflow-x-auto overscroll-x-contain scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden motion-reduce:scroll-auto focus-visible:outline-(--semantics-colors-border-highlight) focus-visible:outline-offset-[-2px]">
            {Array.from({ length: slideCount + 2 }, (_, position) => {
              const index = (position - 1 + slideCount) % slideCount;
              const clone = position === 0 || position === slideCount + 1;
              return (
              <div key={position} role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${slideCount}`} aria-hidden={clone || slide !== index} className="flex size-full shrink-0 snap-start items-center justify-center">
                {images[index] ? <img src={images[index].src} alt={images[index].alt} draggable={false} className="size-full object-contain" /> : <Icon name="image" aria-label="Product image coming soon" size="58.4%" className="[color:var(--semantics-colors-border-default)]" />}
              </div>
              );
            })}
          </div>
          <div className="absolute inset-x-0 top-1/2 hidden -translate-y-1/2 justify-between md:flex">
            <button type="button" aria-label="Previous image" onClick={() => move(-1)} className="cursor-pointer border-0 bg-transparent p-0 [color:var(--semantics-colors-foreground-subtle)] focus-visible:outline-(--semantics-colors-border-highlight)"><Icon name="chevron-left" size="var(--primitives-spacing-8)" /></button>
            <button type="button" aria-label="Next image" onClick={() => move(1)} className="cursor-pointer border-0 bg-transparent p-0 [color:var(--semantics-colors-foreground-subtle)] focus-visible:outline-(--semantics-colors-border-highlight)"><Icon name="chevron-right" size="var(--primitives-spacing-8)" /></button>
          </div>
          <div className="absolute inset-x-0 bottom-0 flex justify-center gap-(--primitives-spacing-2) pb-(--primitives-spacing-2)">
            {Array.from({ length: slideCount }, (_, index) => <button key={index} type="button" aria-label={`Show image ${index + 1}`} aria-current={slide === index ? "true" : undefined} onClick={() => goToSlide(index)} className="size-(--primitives-spacing-2) cursor-pointer rounded-full border-0 p-0 [background-color:var(--semantics-colors-background-secondary)] aria-[current=true]:[background-color:var(--semantics-colors-background-primary)] focus-visible:outline-(--semantics-colors-border-highlight)" />)}
          </div>
        </section>
        <div className="flex min-w-0 flex-1 flex-col gap-(--primitives-spacing-8)">
          <div className="flex flex-col gap-(--primitives-spacing-2) [color:var(--semantics-colors-foreground-default)]">
            <div className="font-sans [font-weight:var(--semantics-typography-heading-font-weight)] text-(length:--semantics-typography-heading-heading-md-font-size) leading-(--semantics-typography-heading-heading-md-lh-tight) tracking-(--semantics-typography-heading-heading-md-tracking-tight) md:text-(length:--semantics-typography-heading-heading-lg-font-size) md:leading-(--semantics-typography-heading-heading-lg-lh-tight) md:tracking-(--semantics-typography-heading-heading-lg-tracking-tight)">
              <h1 className="m-0 text-inherit font-inherit">{product.name}</h1><p className="m-0">{product.price}</p>
            </div>
            {product.description && <p className="m-0 font-sans [font-weight:var(--semantics-typography-body-font-weight)] text-(length:--semantics-typography-body-body-md-font-size) leading-(--semantics-typography-body-body-md-lh-normal) tracking-(--semantics-typography-body-body-md-tracking-tight) md:text-(length:--semantics-typography-body-body-lg-font-size) md:leading-(--semantics-typography-body-body-lg-lh-normal) md:tracking-(--semantics-typography-body-body-lg-tracking-tight)">{product.description}</p>}
          </div>
          <Button size="lg" className="w-full md:max-w-[22.375rem] md:self-center" onClick={onAdd}>Add to bag</Button>
        </div>
      </div>
    </div>
  );
}
