"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, GraduationCap, MoveUpRight, Sparkles, Users } from "lucide-react";
import { api, Cards } from "./platform";
import { TrustReels, VerifiedVoices } from "./premium-home";

const upcoming = (events: any[]) => events.filter((event) => event.date >= new Date().toISOString().slice(0, 10)).sort((a, b) => String(a.date).localeCompare(String(b.date)));

function EventsCarousel({ events }: { events: any[] }) {
  const windowRef = useRef<HTMLDivElement>(null);
  const scrollBy = (dir: number) =>
    windowRef.current?.scrollBy({ left: dir * 360, behavior: "smooth" });
  if (!events.length) return <Cards items={[]} kind="events" />;
  return (
    <div className="events-carousel">
      <div className="events-carousel-window" ref={windowRef}>
        <div className="events-carousel-track">
          {events.map((e) => (
            <a
              href={`/events/${e.slug}`}
              className="event-carousel-card"
              key={e.id}
            >
              {e.banner ? (
                <img src={e.banner} alt="" loading="lazy" />
              ) : (
                <div className="mini-art">
                  PAICONS <ArrowUpRight />
                </div>
              )}
              <div className="event-carousel-body">
                <div className="eyebrow">
                  {e.category || "PAICONS EVENT"} · {e.city}
                </div>
                <h3>{e.title}</h3>
                <p>
                  {e.date}
                  {e.time ? ` · ${e.time}` : ""}
                  <br />
                  {e.venue}
                </p>
                <span className="text-button">
                  Explore event <ArrowUpRight size={16} />
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
      {events.length > 1 && (
        <div className="events-carousel-controls">
          <button
            type="button"
            aria-label="Scroll to previous events"
            onClick={() => scrollBy(-1)}
          >
            <ArrowLeft size={18} />
          </button>
          <button
            type="button"
            aria-label="Scroll to next events"
            onClick={() => scrollBy(1)}
          >
            <ArrowRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}

export function HomeContent() {
  const [data, setData] = useState<any>();
  const [error, setError] = useState(false);
  useEffect(() => { api("public").then(setData).catch(() => setError(true)); }, []);
  const events = useMemo(() => upcoming(data?.events || []), [data]);
  const featured = useMemo(() => !data ? undefined : data.events.find((event: any) => event.id === data.config.featured) || events[0], [data, events]);
  if (!data) return <section className="section home-loading" aria-live="polite"><div className="skeleton-line skeleton-short" /><div className="skeleton-line skeleton-title" /><div className="skeleton-card" /></section>;
  const stats = String(data.config.stats || "").split("\n").map((line) => line.split(":")).filter(([label, value]) => label && /^\d+$/.test(value?.trim()));
  const communityHref = /^https:\/\//.test(data.config.community || "") ? data.config.community : "/membership";
  return <>
    <section className="section upcoming-section" id="upcoming" data-reveal><div className="section-heading"><div><div className="eyebrow">01 / UPCOMING EVENT</div><h2>Be in the room.</h2></div><a className="text-button" href="/events">All events <ArrowUpRight size={18} /></a></div>{featured ? <article className="feature upcoming-card"><div className="event-art">{featured.banner ? <img src={featured.banner} alt={featured.title} /> : <><span>PAICONS PRESENTS</span><h3>{featured.title}</h3></>}</div><div className="feature-copy"><span className="pill">{featured.category || "PAICONS EVENT"}</span><h3>{featured.title}</h3><p className="event-meta">{featured.date}{featured.time ? ` · ${featured.time}` : ""}<br />{[featured.venue, featured.city].filter(Boolean).join(" · ")}</p><p>{String(featured.description || "A focused space to meet people, learn practical ideas and take your next step in AI.").slice(0, 180)}</p><a className="button" href={`/events/${featured.slug}`}>Get Your Pass <ArrowUpRight size={18} /></a></div></article> : <div className="feature empty-upcoming"><div className="event-art"><span>PAICONS</span><h3>New rooms are taking shape.</h3></div><div className="feature-copy"><span className="pill">KARACHI & PAKISTAN</span><h3>Find your next event.</h3><p>Published events will appear here as soon as they are ready.</p><a className="button" href="/events">Explore Events <ArrowUpRight size={18} /></a>{error && <p role="status">Event details are temporarily unavailable.</p>}</div></div>}</section>
    <section className="section about-section" data-reveal><div><div className="eyebrow">02 / WHAT IS PAICONS</div><h2>A network.<br />A shared ambition.</h2><p>{data.config.about || "PAICONS brings Pakistan’s curious minds together to learn, connect and build practical opportunities with AI."}</p><a className="text-button" href="/about">Meet PAICONS <ArrowUpRight size={18} /></a></div><div className="values">{[[GraduationCap, "Learn.", "Practical knowledge that helps you move forward."], [Users, "Connect.", "Meet people who share your curiosity and momentum."], [Sparkles, "Build.", "Find collaborators and turn good ideas into real work."]].map(([Icon, title, copy]: any) => <article key={title}><Icon size={25} /><div><h3>{title}</h3><p>{copy}</p></div><ArrowUpRight size={20} /></article>)}</div></section>
    <section className="section" data-reveal><div className="section-heading"><div><div className="eyebrow">03 / EVENTS</div><h2>Choose your next room.</h2></div><a className="text-button" href="/events">View all <ArrowUpRight size={18} /></a></div><EventsCarousel events={events} /></section>
    <section className="orbit-showcase" aria-label="Learn, connect and build"><div className="orbit-art" aria-hidden="true"><div className="art-grid" /><div className="orb orb-one" /><div className="orb orb-two" /><div className="orb orb-three" /><span className="art-label">CONNECTED BY CURIOSITY.</span><span className="art-number">24°51′ N<br />67°00′ E</span><div className="art-bottom">LEARN.<br />CONNECT.<br /><b>BUILD.</b></div><MoveUpRight className="big-arrow" size={74} strokeWidth={1} /></div></section>
    <section className="section" data-reveal><div className="section-heading"><div><div className="eyebrow">04 / COURSES & WORKSHOPS</div><h2>Learn with purpose.</h2></div><a className="text-button" href="/courses">Explore courses <ArrowUpRight size={18} /></a></div><Cards items={data.courses.slice(0, 4)} kind="courses" /></section>
    <section className="community-section" data-reveal><div className="section community-heading"><div className="eyebrow">05 / COMMUNITY</div><h2>People make the difference.</h2><p>PAICONS is for students, builders, founders and professionals who want clearer paths into AI.</p><a className="button" href={communityHref} target={communityHref.startsWith("http") ? "_blank" : undefined} rel={communityHref.startsWith("http") ? "noreferrer" : undefined}>Join the Community <ArrowUpRight size={18} /></a></div>{stats.length > 0 && <div className="section stat-grid">{stats.map(([label, value]) => <div className="panel" key={label}><strong>{Number(value).toLocaleString()}</strong><p>{label}</p></div>)}</div>}<TrustReels /><VerifiedVoices events={data.events} /></section>
    {data.galleries.length > 0 && <section className="section" data-reveal><div className="section-heading"><div><div className="eyebrow">06 / PAST EVENTS</div><h2>Moments that connect us.</h2></div></div>{data.galleries.map((gallery: any) => <div key={gallery.id} className="gallery-block"><h3>{gallery.title}</h3><div className="grid">{String(gallery.gallery || "").split("\n").filter((url) => url.startsWith("/api/paicon/file/")).map((url) => <img key={url} src={url} className="card-img" alt={gallery.title} loading="lazy" />)}</div></div>)}</section>}
    {data.speakers.length > 0 && <section className="section" data-reveal><div className="eyebrow">07 / SPEAKERS</div><h2>Meet the minds.</h2><div className="grid">{data.speakers.map((speaker: any) => <article className="panel" key={speaker.id}>{speaker.banner && <img className="card-img" src={speaker.banner} alt={speaker.title} loading="lazy" />}<h3>{speaker.title}</h3><p>{[speaker.role, speaker.organization].filter(Boolean).join(" · ")}</p><p>{speaker.bio}</p></article>)}</div></section>}
    {data.partners.length > 0 && <section className="section" data-reveal><div className="eyebrow">08 / PARTNERS</div><h2>Building together.</h2><div className="row">{data.partners.map((partner: any) => <article className="panel partner-card" key={partner.id}>{partner.banner && <img src={partner.banner} alt={partner.title} loading="lazy" />}<h3>{partner.title}</h3><p>{partner.category}</p></article>)}</div></section>}
  </>;
}
