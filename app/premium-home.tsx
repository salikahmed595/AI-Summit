"use client";

import { useEffect, useRef } from "react";
import {
  ArrowUpRight,
  BadgeCheck,
  Play,
  ScanLine,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

const reels = Array.from({ length: 9 }, (_, index) => ({
  src: `/media/reels/reel${index + 1}.mp4`,
  poster: `/media/reels/reel${index + 1}.webp`,
  label: `Community moment ${String(index + 1).padStart(2, "0")}`,
}));

export function PremiumMotion() {
  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>("[data-reveal]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);
  return null;
}

export function TrustReels() {
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);
  const playOnly = (active: HTMLVideoElement) => {
    videoRefs.current.forEach((video) => {
      if (video && video !== active && !video.paused) video.pause();
    });
  };
  return (
    <section className="reels-section" data-reveal>
      <div className="reels-heading">
        <div>
          <div className="eyebrow">03 / PROOF, NOT PROMISES</div>
          <h2>
            Real rooms. Real people.
            <br />
            Real momentum.
          </h2>
        </div>
        <p>
          See the energy behind PAICONS. These are the conversations,
          connections and community moments that move ideas forward.
        </p>
      </div>
      <div className="reels-window" aria-label="PAICONS community videos">
        <div className="reels-track">
          {reels.map((reel, index) => (
            <article className="reel-card" key={reel.src}>
              <div className="reel-frame">
                <video
                  ref={(video) => {
                    videoRefs.current[index] = video;
                  }}
                  src={reel.src}
                  poster={reel.poster}
                  controls
                  playsInline
                  preload="none"
                  onPlay={(event) => playOnly(event.currentTarget)}
                  aria-label={reel.label}
                />
                <span className="reel-index">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="reel-play">
                  <Play size={14} fill="currentColor" /> WATCH
                </span>
              </div>
              <div className="reel-caption">
                <span>{reel.label}</span>
                <ArrowUpRight size={16} />
              </div>
            </article>
          ))}
        </div>
      </div>
      <div className="reels-foot">
        <span>DRAG TO EXPLORE</span>
        <span>09 COMMUNITY STORIES</span>
      </div>
    </section>
  );
}

const trustPoints = [
  [ShieldCheck, "Privacy first", "Attendee details and photos stay private."],
  [ScanLine, "Secure entry", "Every active pass has a unique QR token."],
  [
    UserCheck,
    "Human verified",
    "VIP payments are reviewed by the PAICONS team.",
  ],
  [BadgeCheck, "Real access", "A ticket can only be checked in once."],
] as const;

export function TrustPrinciples() {
  return (
    <section className="trust-principles" data-reveal>
      <div className="trust-intro">
        <div className="eyebrow">BUILT FOR TRUST</div>
        <strong>Clear systems. Real people. No shortcuts.</strong>
      </div>
      <div className="trust-grid">
        {trustPoints.map(([Icon, title, copy]) => (
          <article key={title}>
            <Icon size={22} />
            <div>
              <h3>{title}</h3>
              <p>{copy}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

type Voice = { name: string; location: string; quote: string; photo: string };

export function VerifiedVoices({
  events,
}: {
  events: Array<Record<string, unknown>>;
}) {
  const voices = events.flatMap((event) =>
    String(event.testimonials || "")
      .split("\n")
      .map((line) => {
        const [name, location, quote, photo] = line
          .split("|")
          .map((part) => part.trim());
        return { name, location, quote, photo };
      })
      .filter(
        (voice): voice is Voice =>
          Boolean(voice.name && voice.location && voice.quote) &&
          /^(https:\/\/|\/api\/paicon\/file\/)/.test(voice.photo || ""),
      ),
  );
  if (!voices.length) return null;
  return (
    <section className="voices-section" data-reveal>
      <div className="section-heading">
        <div>
          <div className="eyebrow">VERIFIED COMMUNITY VOICES</div>
          <h2>What attendees remember.</h2>
        </div>
        <span className="verified-note">
          <BadgeCheck size={15} /> REAL ATTENDEES
        </span>
      </div>
      <div className="voices-window">
        <div className="voices-track">
          {voices.slice(0, 20).map((voice, index) => (
            <figure className="voice-card" key={`${voice.name}-${index}`}>
              <blockquote>“{voice.quote}”</blockquote>
              <figcaption>
                <img src={voice.photo} alt="" loading="lazy" />
                <span>
                  <strong>{voice.name}</strong>
                  {voice.location}
                </span>
                <BadgeCheck size={17} />
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
