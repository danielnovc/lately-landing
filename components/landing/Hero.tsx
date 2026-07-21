"use client";

import { useGSAP } from "@gsap/react";
import Image from "next/image";
import Link from "next/link";
import { useLayoutEffect, useRef, useState } from "react";

import { getGsap } from "@/lib/gsap";
import {
  getInsetLine,
  NODE_CLEARANCE,
  PREVIEW_CLEARANCE,
  type LineSeg,
  type Point,
} from "@/lib/pathAttachments";

const PHONE_VIEWBOX = { width: 430, height: 820 } as const;
/** Gentler vertical path — less side-to-side swing than the app serpentine. */
const PHONE_PATH_D =
  "M215 860 C160 720 160 620 215 540 C270 460 270 360 215 280 C160 200 160 100 215 -40";

const EDGE = 22;
const HERO_POLAROID = { width: 122, height: 126 } as const;
const HERO_PAPER = { width: 148, height: 68 } as const;
const HERO_GAP = 48;
/** Extra padding so slight card rotation stays inside overflow:hidden. */
const ROTATE_PAD = 14;

type MemoryKind = "note" | "photo";

type HeroMemoryDef = {
  id: string;
  kind: MemoryKind;
  progress: number;
  side: "left" | "right";
  rotate: number;
  src?: string;
  alt?: string;
  text?: string;
};

/** 5 nodes: 3 photos + 2 notes, spaced along the hero path. */
const HERO_MEMORIES: HeroMemoryDef[] = [
  {
    id: "note-a",
    kind: "note",
    progress: 0.18,
    side: "left",
    rotate: -4,
    text: "Late walk. Soft air. Nothing urgent.",
  },
  {
    id: "beach",
    kind: "photo",
    progress: 0.34,
    side: "right",
    rotate: 3,
    src: "/memories/beach.jpg",
    alt: "A quiet beach memory",
  },
  {
    id: "note-b",
    kind: "note",
    progress: 0.5,
    side: "left",
    rotate: 3,
    text: "Coffee went cold while we talked.",
  },
  {
    id: "cat",
    kind: "photo",
    progress: 0.66,
    side: "right",
    rotate: -3,
    src: "/memories/cat.jpg",
    alt: "A cat resting at home",
  },
  {
    id: "horsies",
    kind: "photo",
    progress: 0.82,
    side: "left",
    rotate: 4,
    src: "/memories/horsies.jpg",
    alt: "Horses in a field",
  },
];

type PlacedMemory = {
  def: HeroMemoryDef;
  node: Point;
  card: Point;
  size: { width: number; height: number };
  line: LineSeg | null;
};

type HeroLayout = {
  items: PlacedMemory[];
  size: { width: number; height: number };
};

function ConnectorFade({ id, line }: { id: string; line: LineSeg }) {
  return (
    <linearGradient
      id={id}
      gradientUnits="userSpaceOnUse"
      x1={line.x1}
      y1={line.y1}
      x2={line.x2}
      y2={line.y2}
    >
      <stop offset="0%" stopColor="#000" stopOpacity="0.72" />
      <stop offset="72%" stopColor="#000" stopOpacity="0.36" />
      <stop offset="100%" stopColor="#000" stopOpacity="0.08" />
    </linearGradient>
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function placeCard(
  node: Point,
  size: { width: number; height: number },
  side: "left" | "right",
  bounds: { width: number; height: number },
) {
  const desiredX =
    side === "left" ? node.x - HERO_GAP - size.width : node.x + HERO_GAP;
  const x = clamp(
    desiredX,
    EDGE + ROTATE_PAD,
    bounds.width - size.width - EDGE - ROTATE_PAD,
  );
  const y = clamp(
    node.y - size.height / 2,
    EDGE + ROTATE_PAD,
    bounds.height - size.height - EDGE - ROTATE_PAD,
  );
  return { x, y };
}

export function Hero() {
  const rootRef = useRef<HTMLElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const [layout, setLayout] = useState<HeroLayout | null>(null);

  useLayoutEffect(() => {
    const path = pathRef.current;
    const phone = phoneRef.current;
    if (!path || !phone) return;

    const place = () => {
      const length = path.getTotalLength();
      if (!length) return;

      // Absolute children use the padding box (inside the border).
      const bounds = { width: phone.clientWidth, height: phone.clientHeight };
      if (!bounds.width || !bounds.height) return;

      const toLocal = (pt: DOMPoint): Point => ({
        x: (pt.x / PHONE_VIEWBOX.width) * bounds.width,
        y: (pt.y / PHONE_VIEWBOX.height) * bounds.height,
      });

      const items: PlacedMemory[] = HERO_MEMORIES.map((def) => {
        const node = toLocal(path.getPointAtLength(length * def.progress));
        const size =
          def.kind === "photo"
            ? { width: HERO_POLAROID.width, height: HERO_POLAROID.height }
            : { width: HERO_PAPER.width, height: HERO_PAPER.height };
        const card = placeCard(node, size, def.side, bounds);
        const anchor = {
          x: def.side === "left" ? card.x + size.width : card.x,
          y: clamp(node.y, card.y + 12, card.y + size.height - 12),
        };

        return {
          def,
          node,
          card,
          size,
          line: getInsetLine({
            start: node,
            end: anchor,
            startInset: NODE_CLEARANCE,
            endInset: PREVIEW_CLEARANCE,
          }),
        };
      });

      setLayout({ items, size: bounds });
    };

    place();
    const observer = new ResizeObserver(place);
    observer.observe(phone);
    return () => observer.disconnect();
  }, []);

  useGSAP(() => {
    const { gsap } = getGsap();
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;
    gsap
      .timeline({ defaults: { ease: "power3.out" } })
      .from("[data-nav]", { y: -18, opacity: 0, duration: 0.65 })
      .from("[data-hero-copy] > *", { y: 34, opacity: 0, duration: 0.8, stagger: 0.09 }, "-=0.2")
      .from("[data-phone]", { y: 44, rotate: 2, opacity: 0, duration: 1 }, "-=0.6")
      .from("[data-phone-memory]", { scale: 0.82, opacity: 0, duration: 0.65, stagger: 0.08 }, "-=0.5");
  }, { scope: rootRef });

  useGSAP(() => {
    const phone = phoneRef.current;
    if (!phone || !layout) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (reduceMotion || !canHover) return;

    const { gsap } = getGsap();
    const cards = phone.querySelectorAll<HTMLElement>("[data-memory-card]");
    const cleanups: Array<() => void> = [];

    cards.forEach((card, index) => {
      const baseRotate = Number(card.dataset.baseRotate) || 0;
      // Alternate twist direction for a playful feel.
      const hoverTwist = index % 2 === 0 ? 5.5 : -5.5;

      gsap.set(card, {
        rotation: baseRotate,
        transformOrigin: "50% 50%",
        force3D: false,
      });

      const onEnter = () => {
        card.style.zIndex = "30";
        gsap.to(card, {
          scale: 1.18,
          rotation: baseRotate + hoverTwist,
          duration: 0.5,
          ease: "power3.out",
          overwrite: "auto",
          force3D: false,
        });
      };
      const onLeave = () => {
        gsap.to(card, {
          scale: 1,
          rotation: baseRotate,
          duration: 0.42,
          ease: "power3.out",
          overwrite: "auto",
          force3D: false,
          onComplete: () => {
            card.style.zIndex = "";
          },
        });
      };
      card.addEventListener("pointerenter", onEnter);
      card.addEventListener("pointerleave", onLeave);
      cleanups.push(() => {
        card.removeEventListener("pointerenter", onEnter);
        card.removeEventListener("pointerleave", onLeave);
        gsap.killTweensOf(card);
        gsap.set(card, { clearProps: "transform,scale,rotation,zIndex" });
      });
    });

    return () => cleanups.forEach((fn) => fn());
  }, { scope: rootRef, dependencies: [layout] });

  return (
    <section ref={rootRef} className="hero">
      <header data-nav className="nav wrap">
        <Link className="wordmark" href="/">
          Lately
        </Link>
        <nav aria-label="Main navigation">
          <a href="#how-it-works">How it works</a>
          <a href="#privacy">Privacy</a>
          <Link href="/terms">Terms</Link>
          <a className="nav-button" href="#download">
            Get Lately
          </a>
        </nav>
      </header>

      <div className="hero-layout wrap">
        <div data-hero-copy className="hero-copy">
          <p className="kicker">Your ordinary days, remembered.</p>
          <h1>A path back to what mattered lately.</h1>
          <p className="hero-body">Voice notes and photos become a path through your year.</p>
          <div className="hero-actions">
            <a className="primary-button" href="#download">
              Coming soon on the App Store
            </a>
            <a className="quiet-link" href="#how-it-works">
              See how it feels <span aria-hidden>↓</span>
            </a>
          </div>
        </div>

        <div ref={phoneRef} data-phone className="phone-journey" aria-label="A Lately weekly journey preview">
          <svg
            className="phone-path"
            viewBox={`0 0 ${PHONE_VIEWBOX.width} ${PHONE_VIEWBOX.height}`}
            preserveAspectRatio="none"
            aria-hidden
          >
            <defs>
              <linearGradient id="phoneFade" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#111" stopOpacity="0" />
                <stop offset=".12" stopColor="#111" />
                <stop offset=".88" stopColor="#111" />
                <stop offset="1" stopColor="#111" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              ref={pathRef}
              data-phone-path
              d={PHONE_PATH_D}
              stroke="url(#phoneFade)"
            />
          </svg>

          {layout ? (
            <div className="phone-memories">
              <svg
                className="phone-connectors"
                width={layout.size.width}
                height={layout.size.height}
                aria-hidden
              >
                <defs>
                  {layout.items.map((item) =>
                    item.line ? (
                      <ConnectorFade
                        key={`fade-${item.def.id}`}
                        id={`heroFade-${item.def.id}`}
                        line={item.line}
                      />
                    ) : null,
                  )}
                </defs>
                {layout.items.map((item) =>
                  item.line ? (
                    <line
                      key={`line-${item.def.id}`}
                      x1={item.line.x1}
                      y1={item.line.y1}
                      x2={item.line.x2}
                      y2={item.line.y2}
                      stroke={`url(#heroFade-${item.def.id})`}
                      strokeWidth="1.35"
                      strokeLinecap="round"
                    />
                  ) : null,
                )}
              </svg>

              {layout.items.map((item) => (
                <span
                  key={`node-${item.def.id}`}
                  data-phone-memory
                  className="path-node phone-path-node"
                  style={{ left: item.node.x, top: item.node.y }}
                  aria-hidden
                />
              ))}

              {layout.items.map((item) =>
                item.def.kind === "note" ? (
                  <div
                    key={`card-${item.def.id}`}
                    data-phone-memory
                    data-memory-card
                    data-base-rotate={item.def.rotate}
                    className="native-paper phone-paper"
                    style={{
                      left: item.card.x,
                      top: item.card.y,
                      width: item.size.width,
                      height: item.size.height,
                    }}
                  >
                    <Image
                      src="/app-assets/paper-note.webp"
                      alt=""
                      fill
                      sizes="280px"
                      quality={90}
                    />
                    <p>{item.def.text}</p>
                  </div>
                ) : (
                  <div
                    key={`card-${item.def.id}`}
                    data-phone-memory
                    data-memory-card
                    data-base-rotate={item.def.rotate}
                    className="native-polaroid phone-polaroid"
                    style={{
                      left: item.card.x,
                      top: item.card.y,
                      width: item.size.width,
                      height: item.size.height,
                    }}
                  >
                    <div className="polaroid-photo">
                      <Image
                        src={item.def.src!}
                        alt={item.def.alt ?? ""}
                        fill
                        sizes="280px"
                        quality={92}
                      />
                    </div>
                    <Image
                      className="polaroid-frame"
                      src="/images/photo-frame.png"
                      alt=""
                      fill
                      sizes="280px"
                      unoptimized
                    />
                  </div>
                ),
              )}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
