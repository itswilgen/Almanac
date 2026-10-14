import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  LockKeyhole,
  CalendarDays,
  Leaf,
  Check,
  Menu,
  X,
} from "lucide-react";
import { Brand, Footer } from "../components/UI";
import { Calendar } from "../components/Calendar";

export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    if (menuOpen) {
      window.addEventListener("keydown", onKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <header className="public-header">
        <Brand />
        <nav className="desktop-nav" aria-label="Main navigation">
          <a href="#how-it-works">How it works</a>
          <Link to="/learn">A little knowledge</Link>
          <Link to="/login">Sign in</Link>
          <Link className="button primary" to="/register">
            Start your journal <ArrowRight size={16} />
          </Link>
        </nav>
        <button
          className="hamburger-button"
          aria-label={
            menuOpen ? "Close navigation menu" : "Open navigation menu"
          }
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>
      {menuOpen && (
        <div
          id="mobile-nav"
          className="mobile-menu-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation menu"
          onClick={(e) => {
            if (e.target === e.currentTarget) setMenuOpen(false);
          }}
        >
          <div className="mobile-menu-panel">
            <nav className="mobile-menu-nav" aria-label="Mobile navigation">
              <a href="#how-it-works" onClick={() => setMenuOpen(false)}>
                How it works
              </a>
              <Link to="/learn" onClick={() => setMenuOpen(false)}>
                A little knowledge
              </Link>
              <Link to="/login" onClick={() => setMenuOpen(false)}>
                Sign in
              </Link>
              <Link
                className="button primary"
                to="/register"
                onClick={() => setMenuOpen(false)}
              >
                Start your journal <ArrowRight size={16} />
              </Link>
            </nav>
          </div>
        </div>
      )}
      <main id="main">
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">
              <span className="tiny-line" /> A LITTLE CLOSER TO YOURSELF
            </p>
            <h1>
              Get to know
              <br />
              your own <em>rhythm.</em>
            </h1>
            <p className="hero-description">
              A thoughtful space to track your period, notice patterns, and
              understand your cycle. One day at a time.
            </p>
            <Link className="button primary" to="/register">
              Start your private journal <ArrowRight size={18} />
            </Link>
            <p className="small-note">
              <LockKeyhole size={14} /> Personal by nature. Private by design.
            </p>
          </div>
          <div className="hero-journal">
            <div className="journal-topline">
              <span>THE EVERYDAY JOURNAL</span>
              <Leaf size={20} strokeWidth={1.3} />
            </div>
            <Calendar
              today="2026-10-14"
              example
              periods={[
                { id: 1, start_date: "2026-10-03", end_date: "2026-10-07" },
              ]}
              estimate={{
                from: "2026-10-29",
                to: "2026-11-02",
                kind: "estimated_period_start",
                method_version: "example",
              }}
            />
            <div className="journal-caption">
              <span className="caption-dot" />
              <p>
                A record of your days.
                <br />
                <strong>A little more understanding.</strong>
              </p>
              <span className="handwritten">at your pace</span>
            </div>
          </div>
        </section>
        <div className="principle-strip">
          <span>
            <CalendarDays size={18} /> A clearer picture of your cycle
          </span>
          <span>
            <LockKeyhole size={18} /> Your records, in your hands
          </span>
          <span>
            <BookOpen size={18} /> Information with perspective
          </span>
        </div>
        <section className="how-section" id="how-it-works">
          <div className="section-intro">
            <p className="eyebrow">SMALL HABITS. MEANINGFUL UNDERSTANDING.</p>
            <h2>
              A journal that grows
              <br />
              with you.
            </h2>
            <p>
              No perfect record needed.
              <br />
              Just start with what you know.
            </p>
          </div>
          <div className="steps">
            {[
              [
                "01",
                "Make a little note",
                "Log period dates, symptoms, and how you feel. Leave a period open until it ends.",
              ],
              [
                "02",
                "See your own patterns",
                "Bring your records together in a clear calendar, with estimates always marked as estimates.",
              ],
              [
                "03",
                "Feel more prepared",
                "Look back on your history or take a summary to your next healthcare conversation.",
              ],
            ].map(([n, t, p]) => (
              <div className="step" key={n}>
                <span>{n}</span>
                <div>
                  <h3>{t}</h3>
                  <p>{p}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="privacy-band">
          <div className="privacy-illustration">
            <LockKeyhole size={45} strokeWidth={1} />
            <span>YOURS, ALWAYS</span>
          </div>
          <div>
            <p className="eyebrow">A PERSONAL SPACE</p>
            <h2>You decide what to share.</h2>
            <p>
              Your journal is yours. Export your records when you choose, adjust
              reminders, or delete your account. No advertising trackers. No
              automatic sharing with partners or family.
            </p>
            <Link className="inline-link" to="/privacy">
              Read about your privacy <ArrowRight size={16} />
            </Link>
          </div>
        </section>
        <section className="faq-section">
          <div>
            <p className="eyebrow">BEFORE YOU BEGIN</p>
            <h2>A few things to know.</h2>
          </div>
          <div className="faq">
            {[
              [
                "Can I start without past records?",
                "Absolutely. Begin with an empty calendar and add dates as you go. You can add previous dates if you know them. We won’t fill gaps with guesses.",
              ],
              [
                "Can this tell me when pregnancy is impossible?",
                "No. No predicted date is guaranteed pregnancy-free. Fertility estimates are unavailable in this version. Tracking supports awareness; it is not contraception.",
              ],
              [
                "How are upcoming periods estimated?",
                "After at least three completed cycles, eligible records can show a possible start range. Variable records or a range that has passed may make an estimate unavailable. Your period can still fall outside any range.",
              ],
              [
                "Is this suitable for someone new to periods?",
                "Yes. Tracking and plain-language educational resources are available without intimate questions. Educational content links to NHS and CDC sources; our summaries are marked as awaiting clinical review.",
              ],
            ].map(([q, a]) => (
              <details key={q}>
                <summary>
                  {q}
                  <span>+</span>
                </summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </section>
        <section className="closing">
          <Check size={24} />
          <h2>Your story, one day at a time.</h2>
          <Link to="/register" className="button primary">
            Begin your journal <ArrowRight size={16} />
          </Link>
          <p>
            For awareness and recordkeeping. Not a diagnosis or contraceptive
            method.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
