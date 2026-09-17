"use client";

import { useEffect } from "react";
import { ArrowUpRight, Play } from "lucide-react";

const reels = Array.from({ length: 9 }, (_, index) => ({
  src: `/media/reels/reel${index + 1}.mp4`,
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
                  src={reel.src}
                  controls
                  playsInline
                  preload={index < 3 ? "metadata" : "none"}
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
