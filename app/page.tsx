import HomeLive from "./home-live";
import { PremiumMotion, TrustPrinciples, TrustReels } from "./premium-home";
import { Header } from "./platform";
import {
  ArrowUpRight,
  ArrowRight,
  MoveUpRight,
  Sparkles,
  Users,
  GraduationCap,
} from "lucide-react";
export default function Home() {
  return (
    <>
      <PremiumMotion />
      <Header />
      <main>
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="dot" /> PAKISTAN'S AI COMMUNITY. TOGETHER.
            </div>
            <h1>
              <HomeLive mode="hero" />
            </h1>
            <p className="intro">
              The people. The ideas. The possibilities.
              <br />
              Your next connection starts here.
            </p>
            <div className="actions">
              <a className="button" href="/events">
                Explore Events <ArrowUpRight size={18} />
              </a>
              <a className="text-button" href="/events">
                Get Your Pass <ArrowRight size={18} />
              </a>
            </div>
            <div className="hero-foot">
              <span>BASED IN KARACHI · OPEN TO PAKISTAN</span>
              <span>SCROLL TO EXPLORE ↓</span>
            </div>
          </div>
          <div className="orbit-art" aria-hidden="true">
            <div className="art-grid" />
            <div className="orb orb-one" />
            <div className="orb orb-two" />
            <div className="orb orb-three" />
            <span className="art-label">CONNECTED BY CURIOSITY.</span>
            <span className="art-number">
              24°51′ N<br />
              67°00′ E
            </span>
            <div className="art-bottom">
              LEARN.
              <br />
              CONNECT.
              <br />
              <b>BUILD.</b>
            </div>
            <MoveUpRight className="big-arrow" size={74} strokeWidth={1} />
          </div>
        </section>
        <div className="ticker">
          <span>AI & INNOVATION</span>
          <i>✳</i>
          <span>MEANINGFUL CONNECTIONS</span>
          <i>✳</i>
          <span>REAL OPPORTUNITIES</span>
          <i>✳</i>
          <span>BUILT IN PAKISTAN</span>
          <i>✳</i>
        </div>
        <section className="section" data-reveal>
          <div className="section-heading">
            <div>
              <div className="eyebrow">01 / WHAT'S NEXT</div>
              <h2>Be in the room.</h2>
            </div>
            <a className="text-button" href="/events">
              All events <ArrowUpRight size={18} />
            </a>
          </div>
          <HomeLive mode="featured" />
        </section>
        <section className="section about-section" data-reveal>
          <div>
            <div className="eyebrow">02 / MORE THAN AN EVENT</div>
            <h2>
              A network.
              <br />A shared ambition.
            </h2>
            <p>
              <HomeLive mode="about" />
            </p>
            <a className="text-button" href="/about">
              Meet PAICONS <ArrowUpRight size={18} />
            </a>
          </div>
          <div className="values">
            {[
              [
                GraduationCap,
                "Learn.",
                "New perspectives. Practical skills. Knowledge that moves you forward.",
              ],
              [
                Users,
                "Connect.",
                "Meet developers, founders, students, and people who share your curiosity.",
              ],
              [
                Sparkles,
                "Build.",
                "Find your collaborators. Explore opportunities. Turn an idea into something real.",
              ],
            ].map(([Icon, title, copy]: any) => (
              <article key={title}>
                <Icon size={25} />
                <div>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </div>
                <ArrowUpRight size={20} />
              </article>
            ))}
          </div>
        </section>
        <TrustReels />
        <TrustPrinciples />
        <HomeLive />
        <section className="partner-band">
          <div className="eyebrow">LET'S MAKE IT HAPPEN</div>
          <h2>
            Build Pakistan's AI
            <br />
            future with us.
          </h2>
          <a className="button light" href="/partners">
            Become a Partner <ArrowUpRight size={18} />
          </a>
        </section>
      </main>
      <footer>
        <div>
          <a className="brand" href="/">
            PAICONS<span>®</span>
          </a>
          <p>
            Pakistan AI Collaboration &<br />
            Opportunities Network
          </p>
          <strong>Learn. Connect. Build.</strong>
        </div>
        <div>
          <a href="/events">Events</a>
          <a href="/courses">Courses</a>
          <a href="/about">About PAICONS</a>
        </div>
        <div>
          <a href="/partners">Partnerships</a>
          <a href="/contact">Contact</a>
        </div>
        <div>
          <a href="/privacy">Privacy Policy</a>
          <a href="/terms">Terms</a>
          <a href="/refund-policy">Refund Policy</a>
        </div>
        <div className="footer-bottom">
          © {new Date().getFullYear()} PAICONS
          <span>MADE FOR CONNECTION. BUILT FOR POSSIBILITY.</span>
        </div>
      </footer>
    </>
  );
}
