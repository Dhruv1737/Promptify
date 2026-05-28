import Link from "next/link";

export const metadata = {
  title: "Promptify — Smarter Prompts, Better Outputs",
  description:
    "Stop getting bad AI outputs. Our smart prompt engine wraps your ideas in elite-level instructions automatically.",
};

export default function HomePage() {
  return (
    <main className="landing">

      {/* ── Nav ─────────────────────────────── */}
      <nav className="landing-nav">
        <span className="landing-logo">Promptify</span>
        <div className="landing-nav-links">
          <Link href="/login">Sign In</Link>
          <Link href="/register" className="btn-nav-cta">
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────── */}
      <section className="hero">
        <div className="hero-badge">Powered by AI</div>
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
      </section>

      {/* ── Features ────────────────────────── */}
      <section className="features">
        <h2 className="features-title">Everything you need. Nothing you don't.</h2>
        <div className="features-grid">

          <div className="feature-card">
            <div className="feature-icon">🐛</div>
            <h3>Smart Code Debugger</h3>
            <p>
              Paste broken code and get back production-ready fixes with full
              bug explanations — powered by a Senior Engineer prompt.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📚</div>
            <h3>Study Assistant</h3>
            <p>
              Pick any subject and topic. Get a full structured study guide,
              real-world analogies, and a mini-quiz — instantly.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">💡</div>
            <h3>Recommendation Engine</h3>
            <p>
              Input any project idea or dilemma. Get structured recommendations
              with pros, cons, risks, and your first action step.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Secure & Private</h3>
            <p>
              Your data is protected with bcrypt hashing, JWT auth, and
              HTTP-only cookies. No third-party auth services.
            </p>
          </div>

        </div>
      </section>

      {/* ── Footer ──────────────────────────── */}
      <footer className="landing-footer">
        <p>Built with Next.js · MongoDB · Claude AI</p>
      </footer>

    </main>
  );
}