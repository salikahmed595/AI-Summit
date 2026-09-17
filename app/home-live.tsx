"use client";
import { useEffect, useState } from "react";
import { api, Cards, MessageForm } from "./platform";
import { ArrowUpRight } from "lucide-react";
export default function HomeLive({ mode = "extras" }: { mode?: string }) {
  const [data, setData] = useState<any>(),
    [info, setInfo] = useState<any>(),
    [error, setError] = useState("");
  useEffect(() => {
    api("public")
      .then((d) => {
        setData(d);
        const e = d.events.find((e: any) => e.id === d.config.featured);
        if (e)
          api("event/" + e.id)
            .then(setInfo)
            .catch(() => {});
      })
      .catch((e) => setError(e.message));
  }, []);
  if (mode === "hero")
    return data?.config.hero ? (
      <>{data.config.hero}</>
    ) : (
      <>
        Where Pakistan
        <br />
        connects with <em>AI.</em>
      </>
    );
  if (mode === "about")
    return (
      <>
        {data?.config.about ||
          "Pakistan AI Collaboration & Opportunities Network brings curious minds together to turn conversations into collaboration."}
      </>
    );
  if (mode === "featured") {
    const e = info?.event;
    if (!e)
      return (
        <div className="feature">
          <div className="event-art">
            <span>PAICONS PRESENTS</span>
            <h3>
              Ideas meet
              <br />
              <em>possibility.</em>
            </h3>
            <div>SUMMITS / MEETUPS / WORKSHOPS</div>
          </div>
          <div className="feature-copy">
            <span className="pill">KARACHI & BEYOND</span>
            <h3>
              Your next AI
              <br />
              connection awaits.
            </h3>
            <p>
              Join the people learning, building, and shaping what comes next.
              Published events and passes will appear here.
            </p>
            <a className="button" href="/events">
              Explore Events <ArrowUpRight size={18} />
            </a>
            {error && (
              <p role="status">Event information is temporarily unavailable.</p>
            )}
          </div>
        </div>
      );
    return (
      <>
        <div className="feature">
          <div>
            {e.banner ? (
              <img
                src={e.banner}
                alt={e.title}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <div className="event-art">
                <span>PAICONS PRESENTS</span>
                <h3>{e.title}</h3>
              </div>
            )}
          </div>
          <div className="feature-copy">
            <span className="pill">{e.category}</span>
            <h3>{e.title}</h3>
            <p>
              {e.date} · {e.time}
              <br />
              {e.venue} · {e.city}
            </p>
            <p>{e.description.slice(0, 180)}</p>
            <a className="button" href={"/events/" + e.slug}>
              Get Your Pass <ArrowUpRight size={18} />
            </a>
          </div>
        </div>
        <h2>Get your pass.</h2>
        <div className="grid">
          {info.tickets
            .filter((t: any) => t.status === "active")
            .map((t: any) => (
              <div className="panel" key={t.id}>
                <h3>{t.name}</h3>
                <h2>
                  {t.displayPrice === 0
                    ? "FREE"
                    : "PKR " + t.displayPrice.toLocaleString()}
                </h2>
                <p>{t.description}</p>
                {t.soldOut || t.reserved >= t.capacity ? (
                  <button className="button" disabled>
                    SOLD OUT
                  </button>
                ) : (
                  <a className="button" href={"/events/" + e.slug}>
                    Get Your Pass
                  </a>
                )}
              </div>
            ))}
        </div>
      </>
    );
  }
  if (!data) return null;
  const stats = (data.config.stats || "")
    .split("\n")
    .map((x: string) => x.split(":"))
    .filter((x: string[]) => x.length === 2 && /^\d+$/.test(x[1].trim()));
  return (
    <>
      {data.config.announcement && (
        <div className="section">
          <div className="panel">{data.config.announcement}</div>
        </div>
      )}
      <section className="section">
        <div className="section-heading">
          <div>
            <div className="eyebrow">04 / FIND YOUR PEOPLE</div>
            <h2>Upcoming events.</h2>
          </div>
          <a className="text-button" href="/events">
            View all ↗
          </a>
        </div>
        <Cards
          items={data.events
            .filter((e: any) => e.date >= new Date().toISOString().slice(0, 10))
            .slice(0, 4)}
          kind="events"
        />
      </section>
      <section className="section">
        <div className="section-heading">
          <div>
            <div className="eyebrow">05 / KEEP LEARNING</div>
            <h2>Courses & workshops.</h2>
          </div>
          <a className="text-button" href="/courses">
            Explore courses ↗
          </a>
        </div>
        <Cards items={data.courses.slice(0, 4)} kind="courses" />
      </section>
      {stats.length > 0 && (
        <section className="section">
          <h2>The PAICONS community.</h2>
          <div className="grid">
            {stats.map(([label, n]: string[]) => (
              <div className="panel" key={label}>
                <h2>{Number(n).toLocaleString()}</h2>
                <p>{label}</p>
              </div>
            ))}
          </div>
        </section>
      )}
      {data.galleries.length > 0 && (
        <section className="section">
          <h2>Moments that connect us.</h2>
          {data.galleries.map((g: any) => (
            <div key={g.id}>
              <h3>{g.title}</h3>
              <div className="grid">
                {(g.gallery || "")
                  .split("\n")
                  .filter((x: string) => x.startsWith("/api/paicon/file/"))
                  .map((x: string) => (
                    <img
                      key={x}
                      src={x}
                      className="card-img"
                      alt={g.title}
                      loading="lazy"
                    />
                  ))}
              </div>
            </div>
          ))}
        </section>
      )}
      {data.speakers.length > 0 && (
        <section className="section">
          <h2>Meet the minds.</h2>
          <div className="grid">
            {data.speakers.map((s: any) => (
              <article className="panel" key={s.id}>
                {s.banner && (
                  <img
                    className="card-img"
                    src={s.banner}
                    alt={s.title}
                    loading="lazy"
                  />
                )}
                <h3>{s.title}</h3>
                <p>
                  {s.role} · {s.organization}
                </p>
                <p>{s.bio}</p>
              </article>
            ))}
          </div>
        </section>
      )}
      {data.partners.length > 0 && (
        <section className="section">
          <h2>Building together.</h2>
          <div className="row">
            {data.partners.map((p: any) => (
              <div className="panel" key={p.id}>
                {p.banner && (
                  <img
                    src={p.banner}
                    alt={p.title}
                    style={{ maxHeight: 70, maxWidth: 180 }}
                  />
                )}
                <h3>{p.title}</h3>
                <p>{p.category}</p>
              </div>
            ))}
          </div>
        </section>
      )}
      <section className="section">
        <div className="eyebrow">STAY IN THE LOOP</div>
        <h2>Your community. Your next opportunity.</h2>
        <MessageForm kind="community" />
        {/^https:\/\//.test(data.config.community) && (
          <a
            className="text-button"
            href={data.config.community}
            target="_blank"
            rel="noreferrer"
          >
            Join the Community ↗
          </a>
        )}
        {data.config.contact && <p>{data.config.contact}</p>}
        <div className="row">
          {(data.config.socials || "").split("\n").map((line: string) => {
            const m = line.match(/^([^:]+):\s*(https:\/\/.+)$/);
            return m ? (
              <a key={line} href={m[2]} target="_blank" rel="noreferrer">
                {m[1]} ↗
              </a>
            ) : null;
          })}
        </div>
      </section>
    </>
  );
}
