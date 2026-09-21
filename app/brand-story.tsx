"use client";
import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  GraduationCap,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";

// Two brand-defining homepage sections, shown right under the hero. They
// reuse the site's own language — lime on near-black, tight Arial headlines,
// thin orbit rings, "01 /" style eyebrows — and add interaction: a cursor
// spotlight, floating audience chips, a journey line that draws itself and
// expanding Learn / Connect / Build / Grow panels.

/** Adds `.in` once the section scrolls into view (safe under StrictMode). */
function useInView<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      el.classList.add("in");
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("in");
          io.disconnect();
        }
      },
      { threshold: 0.18 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

/** Points the section's spotlight at the cursor without re-rendering. */
function spotlight(event: React.PointerEvent<HTMLElement>) {
  const el = event.currentTarget;
  const rect = el.getBoundingClientRect();
  el.style.setProperty("--mx", `${event.clientX - rect.left}px`);
  el.style.setProperty("--my", `${event.clientY - rect.top}px`);
}

const audience = [
  "Students",
  "Professionals",
  "Developers",
  "Founders",
  "Investors",
  "Educators",
  "Businesses",
];
const formats = ["AI Summits", "Meetups", "Workshops", "Courses", "Networking"];
const journey = ["Curiosity", "Knowledge", "Connections", "Real opportunities"];

export function WhatIsPaicons() {
  const ref = useInView<HTMLElement>();
  return (
    <section
      ref={ref}
      className="bs bs-platform"
      onPointerMove={spotlight}
      aria-labelledby="bs-platform-title"
    >
      <div className="bs-inner">
        <div className="bs-eyebrow" style={{ "--d": "0s" } as React.CSSProperties}>
          <span className="dot" /> THE PLATFORM
        </div>
        <h2 id="bs-platform-title" className="bs-title">
          <span className="bs-line" style={{ "--d": "0.05s" } as React.CSSProperties}>
            More Than Events—
          </span>
          <span className="bs-line" style={{ "--d": "0.15s" } as React.CSSProperties}>
            A Platform for
          </span>
          <span className="bs-line" style={{ "--d": "0.25s" } as React.CSSProperties}>
            <em>Pakistan&apos;s AI Future</em>
          </span>
        </h2>

        <div className="bs-split">
          <div className="bs-copy">
            <p className="bs-rise" style={{ "--d": "0.3s" } as React.CSSProperties}>
              PAICONS stands for{" "}
              <strong>Pakistan AI Collaboration &amp; Opportunities Network</strong>
              . We bring together students, professionals, developers, founders,
              investors, educators, and businesses who want to learn,
              collaborate, and grow through artificial intelligence.
            </p>
            <p className="bs-rise" style={{ "--d": "0.4s" } as React.CSSProperties}>
              Through AI summits, meetups, workshops, courses, and networking
              sessions, PAICONS turns curiosity into knowledge, connections, and
              real opportunities.
            </p>

            <ol className="bs-journey" aria-label="From curiosity to opportunity">
              {journey.map((step, i) => (
                <li
                  key={step}
                  className="bs-step"
                  style={{ "--i": i } as React.CSSProperties}
                >
                  <span className="bs-step-dot" aria-hidden="true" />
                  <span className="bs-step-label">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          <div
            className="bs-orbit-card bs-rise"
            style={{ "--d": "0.35s" } as React.CSSProperties}
          >
            <div className="bs-orbit" aria-hidden="true">
              <i />
              <i />
              <i />
            </div>
            <div className="bs-orbit-label">WHO WE BRING TOGETHER</div>
            <ul className="bs-chips">
              {audience.map((name, i) => (
                <li
                  key={name}
                  className="bs-chip"
                  style={{ "--i": i } as React.CSSProperties}
                >
                  {name}
                </li>
              ))}
            </ul>
            <div className="bs-formats" aria-label="How we bring people together">
              {formats.map((f) => (
                <span key={f}>{f}</span>
              ))}
            </div>
          </div>
        </div>

        <p
          className="bs-tagline bs-rise"
          style={{ "--d": "0.5s" } as React.CSSProperties}
        >
          <span>One network.</span>
          <span>Different minds.</span>
          <span className="lime">A shared future.</span>
        </p>
        <a
          className="text-button bs-rise"
          style={{ "--d": "0.6s" } as React.CSSProperties}
          href="/about"
        >
          Explore PAICONS <ArrowUpRight size={18} />
        </a>
      </div>
    </section>
  );
}

const pillars = [
  {
    word: "Learn.",
    icon: GraduationCap,
    line: "Practical AI skills",
  },
  {
    word: "Connect.",
    icon: Users,
    line: "Industry experts & collaborators",
  },
  {
    word: "Build.",
    icon: Sparkles,
    line: "Your startup & partnerships",
  },
  {
    word: "Grow.",
    icon: TrendingUp,
    line: "Career opportunities",
  },
];

export function LearnConnectBuild() {
  const ref = useInView<HTMLElement>();
  const [active, setActive] = useState(0);
  return (
    <section
      ref={ref}
      className="bs bs-pillars"
      onPointerMove={spotlight}
      aria-labelledby="bs-pillars-title"
    >
      <div className="bs-inner">
        <div className="bs-eyebrow" style={{ "--d": "0s" } as React.CSSProperties}>
          <span className="dot" /> THE MISSION
        </div>

        <p
          className="bs-lead bs-rise"
          style={{ "--d": "0.1s" } as React.CSSProperties}
        >
          Pakistan has talent, ideas, and ambition—but the right people and
          opportunities are often disconnected.{" "}
          <span className="lime">PAICONS exists to close that gap.</span>
        </p>

        <svg
          className="bs-gap"
          viewBox="0 0 600 44"
          aria-hidden="true"
        >
          {[26, 62, 40, 84, 54].map((x, i) => (
            <circle key={`l${i}`} cx={x} cy={[12, 30, 20, 34, 8][i]} r="3" />
          ))}
          {[516, 552, 540, 574, 500].map((x, i) => (
            <circle key={`r${i}`} cx={x} cy={[10, 28, 18, 34, 32][i]} r="3" />
          ))}
          <line className="bs-gap-dash" x1="100" y1="22" x2="500" y2="22" />
          <line
            className="bs-gap-bridge"
            x1="100"
            y1="22"
            x2="500"
            y2="22"
            pathLength="1"
          />
        </svg>

        <h2 id="bs-pillars-title" className="sr-only">
          Learn. Connect. Build. Grow.
        </h2>
        <div className="bs-panels" role="list">
          {pillars.map((p, i) => {
            const Icon = p.icon;
            const open = active === i;
            return (
              <button
                key={p.word}
                type="button"
                role="listitem"
                className={`bs-panel${open ? " open" : ""}`}
                aria-expanded={open}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onClick={() => setActive(i)}
                style={{ "--i": i } as React.CSSProperties}
              >
                <span className="bs-panel-num">0{i + 1}</span>
                <span className="bs-panel-icon">
                  <Icon size={22} />
                </span>
                <span className="bs-panel-word">{p.word}</span>
                <span className="bs-panel-line">{p.line}</span>
              </button>
            );
          })}
        </div>

        <p
          className="bs-sub bs-rise"
          style={{ "--d": "0.3s" } as React.CSSProperties}
        >
          Whether you want to learn practical AI skills, meet industry experts,
          find collaborators, showcase your startup, build partnerships, or
          discover career opportunities, PAICONS gives you a place to move
          forward.
        </p>
      </div>
    </section>
  );
}

/** The closing statement, its own section so the "Proof, not promises"
 *  videos can sit between the pillars and it. */
export function MissionStatement() {
  const ref = useInView<HTMLElement>();
  return (
    <section
      ref={ref}
      className="bs bs-closing"
      onPointerMove={spotlight}
      aria-label="Our mission"
    >
      <div className="bs-inner">
        <div
          className="bs-mission bs-rise"
          style={{ "--d": "0.1s" } as React.CSSProperties}
        >
          <span>Our mission is simple:</span>
          <strong>
            Building Pakistan&apos;s AI future <em>together.</em>
          </strong>
          <a className="button" href="/membership">
            Join the PAICONS Community <ArrowUpRight size={18} />
          </a>
        </div>
      </div>
    </section>
  );
}
