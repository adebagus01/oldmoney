"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Sparkle, X, type LucideIcon } from "lucide-react";
import { useCurrency } from "@/components/currency-provider";
import { useLanguage } from "@/components/language-provider";

const SLIDE_DURATION_MS = 6000;
const HOLD_TO_PAUSE_MS = 180;
const CROSSFADE_MS = 550;

export type RecapTheme = { from: string; to: string; blobs: [string, string, string] };

export type RecapValue =
  | { kind: "amount"; amount: string }
  | { kind: "count"; count: number }
  | { kind: "text"; text: string; dotColor?: string };

export type RecapSlide = {
  theme: RecapTheme;
  icon: LucideIcon;
  eyebrow: string;
  value: RecapValue;
  caption?: string;
  hint?: string;
  summary?: { label: string; value: string }[];
};

type CoinSpec = { top: string; left: string; size: number; delay: string; duration: string };

// A few hand-placed arrangements, rotated per slide so consecutive scenes
// don't look identical. Coins hug the edges to keep the centre readable.
const COIN_LAYOUTS: CoinSpec[][] = [
  [
    { top: "11%", left: "7%", size: 46, delay: "0s", duration: "6s" },
    { top: "19%", left: "80%", size: 30, delay: "-2s", duration: "7s" },
    { top: "77%", left: "12%", size: 34, delay: "-4s", duration: "6.5s" },
    { top: "81%", left: "74%", size: 54, delay: "-1s", duration: "8s" },
  ],
  [
    { top: "14%", left: "76%", size: 50, delay: "-1s", duration: "7s" },
    { top: "25%", left: "6%", size: 28, delay: "-3s", duration: "6s" },
    { top: "72%", left: "80%", size: 32, delay: "0s", duration: "6.5s" },
    { top: "84%", left: "18%", size: 44, delay: "-2.5s", duration: "7.5s" },
  ],
  [
    { top: "9%", left: "44%", size: 26, delay: "-2s", duration: "6s" },
    { top: "22%", left: "84%", size: 40, delay: "0s", duration: "7s" },
    { top: "75%", left: "6%", size: 52, delay: "-3s", duration: "8s" },
    { top: "86%", left: "62%", size: 30, delay: "-1.5s", duration: "6.5s" },
  ],
];

const SPARKLES = [
  { top: "30%", left: "16%", size: 16, delay: "0s" },
  { top: "34%", left: "82%", size: 20, delay: "-0.8s" },
  { top: "76%", left: "88%", size: 14, delay: "-1.6s" },
  { top: "68%", left: "10%", size: 18, delay: "-1.1s" },
  { top: "8%", left: "62%", size: 12, delay: "-2s" },
];

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function CountUp({ target, render }: { target: number; render: (n: number) => string }) {
  const [n, setN] = useState(0);

  useEffect(() => {
    const duration = prefersReducedMotion() ? 1 : 1400;
    const delay = 450;
    let raf = 0;
    let start: number | null = null;
    function step(now: number) {
      if (start === null) start = now + delay;
      const t = Math.min(Math.max((now - start) / duration, 0), 1);
      setN(target * (1 - Math.pow(1 - t, 3)));
      if (t < 1) raf = requestAnimationFrame(step);
    }
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target]);

  return <>{render(n)}</>;
}

function Coin({ top, left, size, delay, duration }: CoinSpec) {
  return (
    <div className="pointer-events-none absolute" style={{ top, left, width: size, height: size, perspective: 600 }}>
      <div
        className="recap-coin relative h-full w-full rounded-full"
        style={{
          animationDelay: delay,
          animationDuration: duration,
          background: "radial-gradient(circle at 30% 26%, #fffbeb 0%, #fde68a 18%, #f59e0b 55%, #92400e 100%)",
          boxShadow:
            "inset 0 0 0 2px rgba(255,241,190,0.75), inset 0 -5px 10px rgba(120,53,15,0.5), 0 12px 24px rgba(0,0,0,0.35)",
        }}
      >
        <div className="absolute inset-[18%] rounded-full border-2 border-amber-100/60" />
        <div
          className="absolute inset-0 flex items-center justify-center font-black text-amber-900/80"
          style={{ fontSize: size * 0.3 }}
        >
          Rp
        </div>
      </div>
    </div>
  );
}

function IconTile({ icon: Icon, glow }: { icon: LucideIcon; glow: string }) {
  return (
    <div className="recap-pop relative flex h-40 w-40 items-center justify-center" style={{ animationDelay: "80ms" }}>
      <div
        className="pointer-events-none absolute inset-2 rounded-full opacity-80 blur-2xl"
        style={{ background: `radial-gradient(circle, ${glow} 0%, transparent 70%)` }}
      />
      <div className="recap-spin absolute top-1/2 left-1/2 h-60 w-60 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-white/25">
        <span className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-white shadow-[0_0_14px_rgba(255,255,255,0.95)]" />
      </div>
      <div className="recap-spin-reverse absolute top-1/2 left-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/15">
        <span className="absolute top-1/2 -right-1 h-2 w-2 -translate-y-1/2 rounded-full bg-white/80" />
      </div>

      <div className="relative h-32 w-32" style={{ perspective: "900px" }}>
        <div className="recap-tile relative h-full w-full">
          <div
            className="absolute inset-0 rounded-[2rem] border border-white/20"
            style={{
              transform: "translateZ(-18px)",
              background: `linear-gradient(145deg, rgba(255,255,255,0.3), ${glow})`,
            }}
          />
          <div
            className="absolute inset-0 overflow-hidden rounded-[2rem] border border-white/50 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.55)] backdrop-blur-xl"
            style={{
              background: `linear-gradient(145deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.22) 45%, ${glow}aa 100%)`,
            }}
          >
            <div className="absolute inset-x-3 top-2 h-1/3 rounded-t-[1.6rem] bg-gradient-to-b from-white/55 to-transparent" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center" style={{ transform: "translateZ(34px)" }}>
            <Icon size={58} strokeWidth={1.6} className="text-white drop-shadow-[0_8px_14px_rgba(0,0,0,0.4)]" />
          </div>
        </div>
      </div>
      <div className="recap-shadow absolute -bottom-3 left-1/2 h-4 w-24 -translate-x-1/2 rounded-full bg-black/45 blur-md" />
    </div>
  );
}

function SlideValue({ value }: { value: RecapValue }) {
  const { format } = useCurrency();
  const textClass =
    "recap-shine bg-[linear-gradient(110deg,#ffffff_35%,rgba(255,255,255,0.55)_50%,#ffffff_65%)] bg-clip-text text-transparent";

  if (value.kind === "text") {
    return (
      <span className="inline-flex items-center gap-3">
        {value.dotColor ? (
          <span
            className="inline-block h-5 w-5 shrink-0 rounded-full ring-2 ring-white/60"
            style={{ backgroundColor: value.dotColor, boxShadow: `0 0 24px ${value.dotColor}` }}
          />
        ) : null}
        <span className={textClass}>{value.text}</span>
      </span>
    );
  }

  const target = value.kind === "amount" ? Number(value.amount) : value.count;
  return (
    <span className={`tabular-nums ${textClass}`}>
      <CountUp
        target={target}
        render={(n) => (value.kind === "amount" ? format(Math.round(n)) : String(Math.round(n)))}
      />
    </span>
  );
}

function SlideScene({ slide, index, className }: { slide: RecapSlide; index: number; className: string }) {
  const [b0, b1, b2] = slide.theme.blobs;
  const layout = COIN_LAYOUTS[index % COIN_LAYOUTS.length];
  // The summary card fills the lower half — keep coins from peeking through it.
  const coins = slide.summary ? layout.filter((coin) => parseFloat(coin.top) < 50) : layout;

  return (
    <div
      className={`absolute inset-0 overflow-hidden ${className}`}
      style={{ background: `linear-gradient(160deg, ${slide.theme.from} 0%, ${slide.theme.to} 100%)` }}
    >
      <div
        className="recap-blob pointer-events-none absolute -top-[18vmax] -left-[16vmax] h-[62vmax] w-[62vmax] rounded-full opacity-70 mix-blend-screen blur-3xl"
        style={{ background: `radial-gradient(circle, ${b0} 0%, transparent 65%)` }}
      />
      <div
        className="recap-blob pointer-events-none absolute -right-[18vmax] -bottom-[20vmax] h-[66vmax] w-[66vmax] rounded-full opacity-60 mix-blend-screen blur-3xl"
        style={{ background: `radial-gradient(circle, ${b1} 0%, transparent 65%)`, animationDelay: "-5s", animationDuration: "17s" }}
      />
      <div
        className="recap-blob pointer-events-none absolute top-1/3 left-1/4 h-[40vmax] w-[40vmax] rounded-full opacity-40 mix-blend-screen blur-3xl"
        style={{ background: `radial-gradient(circle, ${b2} 0%, transparent 65%)`, animationDelay: "-9s", animationDuration: "21s" }}
      />

      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.2) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
          maskImage: "radial-gradient(ellipse at center, black 25%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 25%, transparent 75%)",
        }}
      />

      {coins.map((coin, i) => (
        <Coin key={i} {...coin} />
      ))}
      {SPARKLES.map((s, i) => (
        <Sparkle
          key={i}
          size={s.size}
          className="recap-twinkle pointer-events-none absolute fill-white text-white"
          style={{ top: s.top, left: s.left, animationDelay: s.delay }}
        />
      ))}

      <div className="relative flex h-full flex-col items-center justify-center px-8 pt-8 text-center text-white">
        <IconTile icon={slide.icon} glow={b0} />
        <div
          className="recap-rise mt-10 text-xs font-semibold tracking-[0.22em] text-white/75 uppercase"
          style={{ animationDelay: "250ms" }}
        >
          {slide.eyebrow}
        </div>
        <div
          className="recap-rise mt-3 text-[clamp(2.25rem,11vw,4rem)] leading-[1.05] font-black tracking-tight text-balance"
          style={{ animationDelay: "400ms" }}
        >
          <SlideValue value={slide.value} />
        </div>
        {slide.caption ? (
          <div
            className="recap-rise mt-5 max-w-xs rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm text-white/90 shadow-lg backdrop-blur-md"
            style={{ animationDelay: "600ms" }}
          >
            {slide.caption}
          </div>
        ) : null}
        {slide.summary ? (
          <div
            className="recap-rise mt-7 grid w-full max-w-xs grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/20 bg-white/15 shadow-2xl backdrop-blur-xl"
            style={{ animationDelay: "750ms" }}
          >
            {slide.summary.map((item) => (
              <div key={item.label} className="bg-black/10 px-3 py-3 text-left">
                <div className="text-[10px] font-semibold tracking-wider text-white/60 uppercase">{item.label}</div>
                <div className="mt-0.5 truncate text-sm font-bold text-white">{item.value}</div>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {slide.hint ? (
        <div
          className="recap-hint absolute inset-x-0 bottom-[calc(2.5rem+env(safe-area-inset-bottom))] text-center text-xs font-medium tracking-wide text-white/80"
          style={{ animationDelay: "1.2s" }}
        >
          {slide.hint}
        </div>
      ) : null}
    </div>
  );
}

export function RecapStoryViewer({ slides, onClose }: { slides: RecapSlide[]; onClose: () => void }) {
  const { t } = useLanguage();
  const [index, setIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);

  const indexRef = useRef(0);
  const elapsedRef = useRef(0);
  const pausedRef = useRef(false);
  const closedRef = useRef(false);
  const onCloseRef = useRef(onClose);
  const pressRef = useRef<{ x: number } | null>(null);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  const close = useCallback(() => {
    if (closedRef.current) return;
    closedRef.current = true;
    onCloseRef.current();
  }, []);

  const go = useCallback(
    (next: number) => {
      elapsedRef.current = 0;
      setProgress(0);
      if (next >= slides.length) {
        close();
        return;
      }
      const target = Math.max(0, next);
      if (target === indexRef.current) return;
      setPrevIndex(indexRef.current);
      indexRef.current = target;
      setIndex(target);
    },
    [slides.length, close]
  );

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    function tick(now: number) {
      const dt = Math.min(now - last, 100);
      last = now;
      if (!pausedRef.current && !closedRef.current) {
        elapsedRef.current += dt;
        const pct = Math.min(elapsedRef.current / SLIDE_DURATION_MS, 1);
        setProgress(pct);
        if (pct >= 1) go(indexRef.current + 1);
      }
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [go]);

  useEffect(() => {
    if (prevIndex === null) return;
    const timer = setTimeout(() => setPrevIndex(null), CROSSFADE_MS);
    return () => clearTimeout(timer);
  }, [prevIndex, index]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") go(indexRef.current + 1);
      if (e.key === "ArrowLeft") go(indexRef.current - 1);
    }
    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [go, close]);

  function setHeld(held: boolean) {
    pausedRef.current = held;
    setPaused(held);
  }

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    pressRef.current = { x: e.clientX };
    holdTimerRef.current = setTimeout(() => setHeld(true), HOLD_TO_PAUSE_MS);
  }

  function handlePointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    const press = pressRef.current;
    const wasHeld = pausedRef.current;
    pressRef.current = null;
    setHeld(false);
    if (!press || wasHeld) return;
    const { left, width } = e.currentTarget.getBoundingClientRect();
    go(press.x - left < width * 0.35 ? indexRef.current - 1 : indexRef.current + 1);
  }

  function handlePointerCancel() {
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    pressRef.current = null;
    setHeld(false);
  }

  return (
    <div className={`recap-root fixed inset-0 z-50 overflow-hidden bg-black ${paused ? "recap-paused" : ""}`}>
      {prevIndex !== null && prevIndex !== index ? (
        <SlideScene key={`scene-${prevIndex}`} slide={slides[prevIndex]} index={prevIndex} className="recap-scene-out" />
      ) : null}
      <SlideScene key={`scene-${index}`} slide={slides[index]} index={index} className="recap-scene-in" />

      <div
        className="absolute inset-0 z-10 cursor-pointer touch-none select-none"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onPointerLeave={handlePointerCancel}
        onContextMenu={(e) => e.preventDefault()}
      />

      <div
        className={`pointer-events-none absolute inset-x-0 top-0 z-20 bg-gradient-to-b from-black/35 to-transparent pb-10 transition-opacity duration-300 ${
          paused ? "opacity-0" : "opacity-100"
        }`}
      >
        <div className="flex gap-1.5 px-3 pt-[calc(0.75rem+env(safe-area-inset-top))]">
          {slides.map((_, i) => (
            <div key={i} className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/25">
              <div
                className="h-full rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                style={{ width: i < index ? "100%" : i === index ? `${progress * 100}%` : "0%" }}
              />
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={close}
        className={`absolute top-[calc(1.5rem+env(safe-area-inset-top))] right-3 z-30 rounded-full border border-white/25 bg-white/10 p-2 text-white backdrop-blur-md transition-opacity duration-300 hover:bg-white/20 ${
          paused ? "opacity-0" : "opacity-100"
        }`}
        aria-label={t("recap.close")}
      >
        <X size={18} />
      </button>
    </div>
  );
}
