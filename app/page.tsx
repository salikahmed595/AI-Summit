import { ArrowUpRight } from "lucide-react";
import { HomeContent } from "./home-live";
import { CommunityPopup, PremiumMotion } from "./premium-home";
import { Header } from "./platform";

export default function Home() {
  return <><PremiumMotion /><Header /><main>
    <section className="hero hero-single"><div className="hero-copy"><div className="eyebrow"><span className="dot" /> PAKISTAN'S AI COMMUNITY. TOGETHER.</div><h1>Building Pakistan&apos;s AI future <em>together.</em></h1><p className="intro">PAICONS brings Pakistan&apos;s students, builders and businesses together to learn, connect and use AI.</p><div className="actions"><a className="button" href="#upcoming">Explore Upcoming Events <ArrowUpRight size={18} /></a><a className="text-button" href="/membership">Join the Community <ArrowUpRight size={18} /></a></div><div className="hero-foot"><span>SCROLL TO EXPLORE ↓</span></div></div></section>
    <div className="ticker"><span>AI & INNOVATION</span><i>✳</i><span>MEANINGFUL CONNECTIONS</span><i>✳</i><span>REAL OPPORTUNITIES</span><i>✳</i><span>BUILT IN PAKISTAN</span><i>✳</i></div>
    <section className="section intro-band" data-reveal>
      <article className="intro-card">
        <h2>More Than Events—A Platform for Pakistan&apos;s AI Future</h2>
        <p>PAICONS stands for <strong>Pakistan AI Collaboration &amp; Opportunities Network</strong>. We bring together students, professionals, developers, founders, investors, educators, and businesses who want to learn, collaborate, and grow through artificial intelligence.</p>
        <p>Through AI summits, meetups, workshops, courses, and networking sessions, PAICONS turns curiosity into knowledge, connections, and real opportunities.</p>
        <p className="intro-tagline">One network. Different minds. A shared future.</p>
        <a className="text-button" href="/about">Explore PAICONS <ArrowUpRight size={18} /></a>
      </article>
      <article className="intro-card">
        <h2>Learn. Connect. Build. Grow.</h2>
        <p>Pakistan has talent, ideas, and ambition—but the right people and opportunities are often disconnected. PAICONS exists to close that gap.</p>
        <p>Whether you want to learn practical AI skills, meet industry experts, find collaborators, showcase your startup, build partnerships, or discover career opportunities, PAICONS gives you a place to move forward.</p>
        <p className="intro-tagline">Our mission is simple: Building Pakistan&apos;s AI future together.</p>
        <a className="button" href="/membership">Join the PAICONS Community <ArrowUpRight size={18} /></a>
      </article>
    </section>
    <HomeContent />
    <section className="partner-band"><div className="eyebrow">LET'S MAKE IT HAPPEN</div><h2>Build Pakistan&apos;s AI<br />future with us.</h2><a className="button light" href="/partners">Become a Partner <ArrowUpRight size={18} /></a></section>
  </main><CommunityPopup /><footer><div><a className="brand" href="/">PAICONS<span>®</span></a><p>Pakistan AI Collaboration &<br />Opportunities Network</p><strong>Learn. Connect. Build.</strong></div><div><a href="/events">Events</a><a href="/courses">Courses</a><a href="/about">About PAICONS</a></div><div><a href="/partners">Partnerships</a><a href="/contact">Contact</a></div><div><a href="/privacy">Privacy Policy</a><a href="/terms">Terms</a><a href="/refund-policy">Refund Policy</a></div><div className="footer-bottom">© {new Date().getFullYear()} PAICONS<span>MADE FOR CONNECTION. BUILT FOR POSSIBILITY.</span></div></footer></>;
}
