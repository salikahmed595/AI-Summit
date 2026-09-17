import { ArrowUpRight } from "lucide-react";
import { HomeContent } from "./home-live";
import { CommunityPopup, PremiumMotion } from "./premium-home";
import { Header } from "./platform";

export default function Home() {
  return <><PremiumMotion /><Header /><main>
    <section className="hero hero-single"><div className="hero-copy"><div className="eyebrow"><span className="dot" /> PAKISTAN'S AI COMMUNITY. TOGETHER.</div><h1>Building Pakistan&apos;s AI future <em>together.</em></h1><p className="intro">PAICONS brings Pakistan&apos;s students, builders and businesses together to learn, connect and use AI.</p><div className="actions"><a className="button" href="#upcoming">Explore Upcoming Events <ArrowUpRight size={18} /></a><a className="text-button" href="/membership">Join the Community <ArrowUpRight size={18} /></a></div><div className="hero-foot"><span>SCROLL TO EXPLORE ↓</span></div></div></section>
    <div className="ticker"><span>AI & INNOVATION</span><i>✳</i><span>MEANINGFUL CONNECTIONS</span><i>✳</i><span>REAL OPPORTUNITIES</span><i>✳</i><span>BUILT IN PAKISTAN</span><i>✳</i></div>
    <HomeContent />
    <section className="partner-band"><div className="eyebrow">LET'S MAKE IT HAPPEN</div><h2>Build Pakistan&apos;s AI<br />future with us.</h2><a className="button light" href="/partners">Become a Partner <ArrowUpRight size={18} /></a></section>
  </main><CommunityPopup /><footer><div><a className="brand" href="/">PAICONS<span>®</span></a><p>Pakistan AI Collaboration &<br />Opportunities Network</p><strong>Learn. Connect. Build.</strong></div><div><a href="/events">Events</a><a href="/courses">Courses</a><a href="/about">About PAICONS</a></div><div><a href="/partners">Partnerships</a><a href="/contact">Contact</a></div><div><a href="/privacy">Privacy Policy</a><a href="/terms">Terms</a><a href="/refund-policy">Refund Policy</a></div><div className="footer-bottom">© {new Date().getFullYear()} PAICONS<span>MADE FOR CONNECTION. BUILT FOR POSSIBILITY.</span></div></footer></>;
}
