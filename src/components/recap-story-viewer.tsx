"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

const SLIDE_DURATION_MS = 5000;

export type RecapSlide = {
  background: string;
  content: React.ReactNode;
};

export function RecapStoryViewer({
  slides,
  onClose,
}: {
  slides: RecapSlide[];
  onClose: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef(0);

  function goNext() {
    setIndex((i) => {
      if (i >= slides.length - 1) {
        onClose();
        return i;
      }
      return i + 1;
    });
  }

  function goPrev() {
    setIndex((i) => Math.max(0, i - 1));
  }

  useEffect(() => {
    setProgress(0);
    startRef.current = performance.now();

    function tick(now: number) {
      const elapsed = now - startRef.current;
      const pct = Math.min(elapsed / SLIDE_DURATION_MS, 1);
      setProgress(pct);
      if (pct >= 1) {
        goNext();
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const slide = slides[index];

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden transition-colors duration-500"
      style={{ background: slide.background }}
    >
      <div className="absolute inset-0 z-0 flex items-center justify-center p-8">{slide.content}</div>

      <button type="button" aria-label="Previous" onClick={goPrev} className="absolute inset-y-0 left-0 z-10 w-2/5" />
      <button type="button" aria-label="Next" onClick={goNext} className="absolute inset-y-0 right-0 z-10 w-3/5" />

      <div className="absolute inset-x-0 top-0 z-20 flex gap-1 p-3 pt-[calc(0.75rem+env(safe-area-inset-top))]">
        {slides.map((_, i) => (
          <div key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-white/30">
            <div
              className="h-full bg-white"
              style={{ width: i < index ? "100%" : i === index ? `${progress * 100}%` : "0%" }}
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onClose}
        className="absolute top-[calc(1.5rem+env(safe-area-inset-top))] right-3 z-20 rounded-full bg-black/20 p-2 text-white"
        aria-label="Close"
      >
        <X size={20} />
      </button>
    </div>
  );
}
