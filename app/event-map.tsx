"use client";
import { useRef } from "react";
import { ArrowUpRight, MapPin } from "lucide-react";

// [x %, y %, width px, depth px, height px] of each extruded building on the
// tilted map plane. The middle is left clear for the venue pin.
const buildings = [
  [8, 12, 54, 40, 26],
  [22, 62, 44, 46, 44],
  [40, 8, 66, 34, 18],
  [66, 64, 48, 44, 58],
  [78, 16, 44, 44, 34],
  [12, 38, 34, 34, 62],
  [84, 44, 34, 30, 20],
  [56, 78, 60, 30, 24],
];

/** A little 3D map: the tilted city follows the pointer, the venue pin
 *  bounces, and clicking anywhere opens the exact place in Google Maps. */
export function EventMap({
  href,
  venue,
  address,
  city,
}: {
  href: string;
  venue: string;
  address?: string;
  city?: string;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  function tilt(event: React.PointerEvent<HTMLAnchorElement>) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const dx = (event.clientX - r.left) / r.width - 0.5;
    const dy = (event.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--rz", String(-32 + dx * 14));
    el.style.setProperty("--rx", String(56 - dy * 10));
  }
  function settle() {
    const el = ref.current;
    if (!el) return;
    el.style.removeProperty("--rz");
    el.style.removeProperty("--rx");
  }
  return (
    <a
      ref={ref}
      className="emap"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onPointerMove={tilt}
      onPointerLeave={settle}
      aria-label={`Open ${venue} in Google Maps`}
    >
      <div className="emap-scene" aria-hidden="true">
        <div className="emap-plane">
          <svg
            className="emap-svg"
            viewBox="0 0 600 420"
            preserveAspectRatio="none"
          >
            <rect width="600" height="420" fill="#121a0e" />
            {/* minor streets */}
            <g stroke="#1e2917" strokeWidth="7">
              {[60, 130, 200, 270, 340, 400].map((y) => (
                <line key={`h${y}`} x1="0" y1={y} x2="600" y2={y} />
              ))}
              {[70, 150, 230, 380, 450, 530].map((x) => (
                <line key={`v${x}`} x1={x} y1="0" x2={x} y2="420" />
              ))}
            </g>
            {/* park + water */}
            <rect x="248" y="84" width="118" height="80" rx="14" fill="#16260f" />
            <path
              d="M0 350 C120 300 200 380 320 330 S520 300 600 340"
              fill="none"
              stroke="#16302a"
              strokeWidth="18"
              strokeLinecap="round"
            />
            {/* main avenues */}
            <g stroke="#2f3c25" strokeWidth="15" strokeLinecap="round">
              <line x1="-20" y1="200" x2="620" y2="200" />
              <line x1="300" y1="-20" x2="300" y2="440" />
              <line x1="40" y1="20" x2="560" y2="400" />
            </g>
            <g
              stroke="#b9f46455"
              strokeWidth="1.4"
              strokeDasharray="7 9"
              fill="none"
            >
              <line x1="-20" y1="200" x2="620" y2="200" />
              <line x1="300" y1="-20" x2="300" y2="440" />
            </g>
            {/* the route in */}
            <path
              className="emap-route"
              d="M 20 20 L 300 20 L 300 200"
              fill="none"
              stroke="#b9f464"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {buildings.map(([x, y, w, d, h], i) => (
            <span
              key={i}
              className="emap-bld"
              style={
                {
                  left: `${x}%`,
                  top: `${y}%`,
                  width: w,
                  height: d,
                  "--h": `${h}px`,
                  "--d": `${d}px`,
                } as React.CSSProperties
              }
            >
              <i />
              <b />
              <u />
            </span>
          ))}
          <span className="emap-ring" />
          <span className="emap-ring emap-ring-2" />
          <div className="emap-pin">
            <span>
              <MapPin size={20} strokeWidth={2.4} />
            </span>
          </div>
        </div>
      </div>
      <div className="emap-card">
        <span className="emap-kicker">EVENT LOCATION</span>
        <strong>{venue}</strong>
        <span className="emap-addr">{address || city}</span>
        <span className="emap-cta">
          Open in Google Maps <ArrowUpRight size={15} />
        </span>
      </div>
    </a>
  );
}

/** "Organized by": PAICONS gets a proper brand moment; anyone else gets a
 *  simple credit line. */
export function OrganizerCard({ organizer }: { organizer: string }) {
  const brand = /^\s*paicons\s*$/i.test(organizer);
  function spotlight(event: React.PointerEvent<HTMLDivElement>) {
    const el = event.currentTarget;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${event.clientX - r.left}px`);
    el.style.setProperty("--my", `${event.clientY - r.top}px`);
  }
  if (!brand)
    return (
      <div className="org org-plain">
        <span className="org-kicker">ORGANIZED BY</span>
        <strong>{organizer}</strong>
      </div>
    );
  return (
    <div className="org org-brand" onPointerMove={spotlight}>
      <span className="org-kicker">ORGANIZED BY</span>
      <a className="org-mark" href="/" aria-label="PAICONS home">
        {"PAICONS".split("").map((letter, i) => (
          <span
            key={i}
            className="org-letter"
            style={{ "--i": i } as React.CSSProperties}
          >
            {letter}
          </span>
        ))}
        <sup>®</sup>
      </a>
      <p>Pakistan AI Collaboration &amp; Opportunities Network</p>
      <div className="org-tags" aria-hidden="true">
        <span>Learn.</span>
        <span>Connect.</span>
        <span className="lime">Build.</span>
      </div>
      <div className="org-actions">
        <a href="/about">
          Meet PAICONS <ArrowUpRight size={15} />
        </a>
        <a href="/events">
          More events <ArrowUpRight size={15} />
        </a>
      </div>
    </div>
  );
}
