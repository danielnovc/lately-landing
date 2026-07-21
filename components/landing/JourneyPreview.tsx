"use client";

import { useGSAP } from "@gsap/react";
import Image from "next/image";
import { useLayoutEffect, useRef, useState } from "react";

import { getGsap } from "@/lib/gsap";
import {
  getInsetLine,
  NODE_CLEARANCE,
  NODE_GAP,
  PAPER,
  POLAROID,
  PREVIEW_CLEARANCE,
  type LineSeg,
  type Point,
} from "@/lib/pathAttachments";

const steps = [
  {
    eyebrow: "Capture",
    title: "Say it, type it, add the photos.",
    body: "Save the moment while it is still fresh. Voice becomes editable text, and every photo stays attached to the same memory.",
    visual: "record",
  },
  {
    eyebrow: "Your path",
    title: "Every memory lands where it happened.",
    body: "Notes and photos take their place on a weekly path instead of disappearing into a list.",
    visual: "path",
  },
  {
    eyebrow: "Recaps",
    title: "See the story the days were telling.",
    body: "Create a month or year recap when you want the longer story. It only runs when you ask.",
    visual: "recap",
  },
] as const;

const PATH_VIEWBOX = { width: 1000, height: 1880 } as const;
const PATH_D =
  "M500 -40 C850 130 860 390 510 540 C150 690 145 945 500 1085 C855 1230 855 1510 495 1920";

/** Progress along the main path for step-02 attachments. */
const PATH_PROGRESS = { photo: 0.46, note: 0.53 } as const;

function RecordPreview() {
  return (
    <div className="record-preview" aria-label="Lately memory editor preview">
      <div className="transcript">
        <p>Coffee outside. We stayed until it went cold.</p>
        <div className="attachments">
          <figure>
            <Image src="/memories/beach.jpg" alt="A photo attached to a memory" fill sizes="76px" />
          </figure>
          <div className="add-image">
            <Image src="/app-assets/plus.png" alt="" width={18} height={18} />
            <span>Add an image</span>
          </div>
        </div>
      </div>
      <div className="record-action">
        <div className="record-ring">
          <Image src="/app-assets/first_memory.png" alt="" fill sizes="72px" />
          <Image className="plus-mark" src="/app-assets/plus.png" alt="" width={21} height={21} />
        </div>
        <span>Tap to record or type above</span>
      </div>
    </div>
  );
}

function PathPreview() {
  return <div className="path-preview" aria-hidden />;
}

function RecapPreview() {
  return (
    <div className="recap-preview" aria-label="Lately month recap preview">
      <p className="recap-date">July 2026</p>
      <div className="recap-copy">
        <strong>The month you made room</strong>
        <p>
          July was full of unhurried things: late walks, coffee that went cold, and
          afternoons that lasted longer than planned.
        </p>
        <p>
          You kept returning to the people and places that made the days feel less
          rushed.
        </p>
      </div>
    </div>
  );
}

function StepVisual({ type }: { type: (typeof steps)[number]["visual"] }) {
  if (type === "record") return <RecordPreview />;
  if (type === "path") return <PathPreview />;
  return <RecapPreview />;
}

type MemoryLayout = {
  photoNode: Point;
  noteNode: Point;
  photoCard: Point;
  noteCard: Point;
  photoLine: LineSeg | null;
  noteLine: LineSeg | null;
  mapSize: { width: number; height: number };
};

export function JourneyPreview() {
  const rootRef = useRef<HTMLElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const [layout, setLayout] = useState<MemoryLayout | null>(null);

  useLayoutEffect(() => {
    const path = pathRef.current;
    const map = path?.closest(".story-map");
    if (!path || !(map instanceof HTMLElement)) return;

    const place = () => {
      const length = path.getTotalLength();
      if (!length) return;

      const bounds = { width: map.clientWidth, height: map.clientHeight };
      if (!bounds.width || !bounds.height) return;

      const toLocal = (pt: DOMPoint): Point => ({
        x: (pt.x / PATH_VIEWBOX.width) * bounds.width,
        y: (pt.y / PATH_VIEWBOX.height) * bounds.height,
      });

      const photoNode = toLocal(path.getPointAtLength(length * PATH_PROGRESS.photo));
      const noteNode = toLocal(path.getPointAtLength(length * PATH_PROGRESS.note));

      // Flank layout like the app: photo right of node, note left of node.
      const photoCard = {
        x: photoNode.x + NODE_GAP,
        y: photoNode.y - POLAROID.height / 2,
      };
      const noteCard = {
        x: noteNode.x - NODE_GAP - PAPER.width,
        y: noteNode.y - PAPER.height / 2,
      };

      const photoAnchor = {
        x: photoCard.x,
        y: photoNode.y,
      };
      const noteAnchor = {
        x: noteCard.x + PAPER.width,
        y: noteNode.y,
      };

      setLayout({
        photoNode,
        noteNode,
        photoCard,
        noteCard,
        photoLine: getInsetLine({
          start: photoNode,
          end: photoAnchor,
          startInset: NODE_CLEARANCE,
          endInset: PREVIEW_CLEARANCE,
        }),
        noteLine: getInsetLine({
          start: noteNode,
          end: noteAnchor,
          startInset: NODE_CLEARANCE,
          endInset: PREVIEW_CLEARANCE,
        }),
        mapSize: bounds,
      });
    };

    place();
    const observer = new ResizeObserver(place);
    observer.observe(map);
    return () => observer.disconnect();
  }, []);

  useGSAP(() => {
    const { gsap } = getGsap();
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    gsap.to("[data-main-path]", {
      strokeDashoffset: -220,
      ease: "none",
      scrollTrigger: {
        trigger: rootRef.current,
        start: "top bottom",
        end: "bottom top",
        scrub: 0.5,
      },
    });

    gsap.utils.toArray<HTMLElement>("[data-step]").forEach((step) => {
      gsap.from(step.querySelector("[data-step-copy]"), {
        y: 48,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: { trigger: step, start: "top 78%" },
      });
      gsap.from(step.querySelector("[data-step-visual]"), {
        y: 64,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: step, start: "top 74%" },
      });
    });

    gsap.from("[data-path-memory]", {
      scale: 0.86,
      opacity: 0,
      duration: 0.75,
      stagger: 0.1,
      ease: "back.out(1.4)",
      scrollTrigger: { trigger: "#journey-path", start: "top 70%" },
    });
  }, { scope: rootRef });

  return (
    <section id="how-it-works" ref={rootRef} className="story">
      <div className="story-heading wrap">
        <p className="kicker">How Lately works</p>
        <h2>Save it once. Find it later.</h2>
      </div>
      <div className="story-map wrap">
        <svg
          className="main-path"
          viewBox={`0 0 ${PATH_VIEWBOX.width} ${PATH_VIEWBOX.height}`}
          preserveAspectRatio="none"
          aria-hidden
        >
          <defs>
            <linearGradient id="mainFade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#111" stopOpacity="0" />
              <stop offset=".07" stopColor="#111" />
              <stop offset=".93" stopColor="#111" />
              <stop offset="1" stopColor="#111" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path ref={pathRef} data-main-path d={PATH_D} stroke="url(#mainFade)" />
        </svg>

        {layout ? (
          <div className="path-memories" aria-label="A note and photo attached to the Lately path">
            <svg
              className="path-connectors"
              width={layout.mapSize.width}
              height={layout.mapSize.height}
              aria-hidden
            >
              <defs>
                {layout.photoLine ? (
                  <linearGradient
                    id="photoConnectorFade"
                    gradientUnits="userSpaceOnUse"
                    x1={layout.photoLine.x1}
                    y1={layout.photoLine.y1}
                    x2={layout.photoLine.x2}
                    y2={layout.photoLine.y2}
                  >
                    <stop offset="0%" stopColor="#000" stopOpacity="0.72" />
                    <stop offset="72%" stopColor="#000" stopOpacity="0.36" />
                    <stop offset="100%" stopColor="#000" stopOpacity="0.08" />
                  </linearGradient>
                ) : null}
                {layout.noteLine ? (
                  <linearGradient
                    id="noteConnectorFade"
                    gradientUnits="userSpaceOnUse"
                    x1={layout.noteLine.x1}
                    y1={layout.noteLine.y1}
                    x2={layout.noteLine.x2}
                    y2={layout.noteLine.y2}
                  >
                    <stop offset="0%" stopColor="#000" stopOpacity="0.72" />
                    <stop offset="72%" stopColor="#000" stopOpacity="0.36" />
                    <stop offset="100%" stopColor="#000" stopOpacity="0.08" />
                  </linearGradient>
                ) : null}
              </defs>
              {layout.photoLine ? (
                <line
                  data-path-memory
                  x1={layout.photoLine.x1}
                  y1={layout.photoLine.y1}
                  x2={layout.photoLine.x2}
                  y2={layout.photoLine.y2}
                  stroke="url(#photoConnectorFade)"
                  strokeWidth="1.35"
                  strokeLinecap="round"
                />
              ) : null}
              {layout.noteLine ? (
                <line
                  data-path-memory
                  x1={layout.noteLine.x1}
                  y1={layout.noteLine.y1}
                  x2={layout.noteLine.x2}
                  y2={layout.noteLine.y2}
                  stroke="url(#noteConnectorFade)"
                  strokeWidth="1.35"
                  strokeLinecap="round"
                />
              ) : null}
            </svg>

            <span
              data-path-memory
              className="path-node"
              style={{ left: layout.photoNode.x, top: layout.photoNode.y }}
              aria-hidden
            />
            <span
              data-path-memory
              className="path-node"
              style={{ left: layout.noteNode.x, top: layout.noteNode.y }}
              aria-hidden
            />
            <div
              data-path-memory
              className="native-polaroid preview-polaroid"
              style={{ left: layout.photoCard.x, top: layout.photoCard.y }}
            >
              <div className="polaroid-photo">
                <Image
                  src="/memories/beach.jpg"
                  alt="The photo attached to this memory"
                  fill
                  sizes="130px"
                />
              </div>
              <Image
                className="polaroid-frame"
                src="/images/photo-frame.png"
                alt=""
                fill
                sizes="140px"
                unoptimized
              />
            </div>
            <div
              data-path-memory
              className="native-paper preview-paper"
              style={{ left: layout.noteCard.x, top: layout.noteCard.y }}
            >
              <Image src="/app-assets/paper-note.webp" alt="" fill sizes="164px" />
              <p>Coffee went cold while we talked.</p>
            </div>
          </div>
        ) : null}

        {steps.map((step, index) => (
          <article
            id={`journey-${step.visual}`}
            data-step
            className={`story-step ${index % 2 ? "step-reverse" : ""} ${step.visual === "path" ? "path-step" : ""}`}
            key={step.title}
          >
            <div data-step-copy className="step-copy">
              <span className="step-index">0{index + 1}</span>
              <p className="kicker">{step.eyebrow}</p>
              <h2>{step.title}</h2>
              <p>{step.body}</p>
            </div>
            <div data-step-visual className="step-visual">
              <StepVisual type={step.visual} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
