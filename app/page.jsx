import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <main className="landing">

      {/* ── Nav ─────────────────────────────── */}
      <nav className="landing-nav">
        <Link href="/" className="nav-logo-link">
          <Image
            src="/logo1.jpg"
            alt="Promptify"
            width={180}
            height={60}
            style={{ objectFit: "contain" }}
            priority
            className="landing-logo-img"
          />
        </Link>
        <div className="landing-nav-links">
          <Link href="/login" className="nav-link">Sign In</Link>
          <Link href="/register" className="btn-nav-cta">
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────── */}
      <section className="hero">
        <Image
          src="/logo1.jpg"
          alt="Promptify"
          width={280}
          height={100}
          style={{ objectFit: "contain", marginBottom: "1rem" }}
          priority
          className="landing-logo-img hero-logo"
        />
        <div className="hero-badge">
          <span className="hero-badge-dot" />
          Powered by AI
        </div>
        <h1 className="hero-title">
          Stop Writing <span className="gradient-text">Bad Prompts.</span>
          <br />
          Start Getting Great Results.
        </h1>
        <p className="hero-subtitle">
          AI Hub automatically wraps your simple inputs inside elite-level
          system instructions — so you always get expert-grade outputs without
          knowing how to prompt.
        </p>
        <div className="hero-cta">
          <Link href="/register" className="btn-hero-primary">
            Start for Free →
          </Link>
          <Link href="/login" className="btn-hero-secondary">
            Sign In
          </Link>
        </div>

        {/* Stats row */}
        <div className="hero-stats">
          <div className="hero-stat">
            <span className="hero-stat-number">3x</span>
            <span className="hero-stat-label">Better outputs</span>
          </div>
          <div className="hero-stat-divider" />
          <div className="hero-stat">
            <span className="hero-stat-number">0</span>
            <span className="hero-stat-label">Prompt knowledge needed</span>
          </div>
          <div className="hero-stat-divider" />
          <div className="hero-stat">
            <span className="hero-stat-number">3</span>
            <span className="hero-stat-label">Powerful AI tools</span>
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────── */}
      <section className="features">
        <div className="features-header">
          <span className="features-eyebrow">What's inside</span>
          <h2 className="features-title">Everything you need. Nothing you don't.</h2>
        </div>
        <div className="features-grid">

          <div className="feature-card">
            <div className="feature-card-top">
              <div className="feature-icon-wrap" style={{"--icon-color":"#6366f1"}}>
                🐛
              </div>
              <span className="feature-tag">Engineer-grade</span>
            </div>
            <h3>Smart Code Debugger</h3>
            <p>
              Paste broken code and get back production-ready fixes with full
              bug explanations — powered by a Senior Engineer prompt.
            </p>
            <div className="feature-card-footer">
              <Link href="/register" className="feature-link">Try it →</Link>
            </div>
          </div>

          <div className="feature-card feature-card--highlight">
            <div className="feature-card-top">
              <div className="feature-icon-wrap" style={{"--icon-color":"#a855f7"}}>
                📚
              </div>
              <span className="feature-tag feature-tag--purple">Most popular</span>
            </div>
            <h3>Study Assistant</h3>
            <p>
              Pick any subject and topic. Get a full structured study guide,
              real-world analogies, and a mini-quiz — instantly.
            </p>
            <div className="feature-card-footer">
              <Link href="/register" className="feature-link">Try it →</Link>
            </div>
          </div>

          <div className="feature-card">
            <div className="feature-card-top">
              <div className="feature-icon-wrap" style={{"--icon-color":"#f59e0b"}}>
                💡
              </div>
              <span className="feature-tag">Strategic AI</span>
            </div>
            <h3>Recommendation Engine</h3>
            <p>
              Input any project idea or dilemma. Get structured recommendations
              with pros, cons, risks, and your first action step.
            </p>
            <div className="feature-card-footer">
              <Link href="/register" className="feature-link">Try it →</Link>
            </div>
          </div>

        </div>
      </section>

      {/* ── CTA Banner ──────────────────────── */}
      <section className="cta-banner">
        <div className="cta-banner-inner">
          <h2>Ready to prompt like a pro?</h2>
          <p>Join Promptify and let the AI do the hard part.</p>
          <Link href="/register" className="btn-hero-primary">
            Create Free Account →
          </Link>
        </div>
      </section>

      {/* ── Footer ──────────────────────────── */}
      <footer className="landing-footer">
        <Image
          src="/logo1.jpg"
          alt="Promptify"
          width={140}
          height={50}
          style={{ objectFit: "contain", opacity: 0.3 }}
          className="landing-logo-img"
        />
        <p>Built with Next.js · MongoDB · AI</p>
        <div className="footer-links">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">Contact</a>
        </div>
      </footer>

    </main>
  );
}