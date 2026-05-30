"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

const FEATURES = [
  {
    href:        "/debugger",
    icon:        "🐛",
    title:       "Smart Code Debugger",
    description: "Paste broken code and get back production-ready fixes with full bug explanations.",
    tag:         "Engineer-grade",
    tagColor:    "#6366f1",
    stats:       "Fixes bugs · Optimizes code · Explains errors",
    gradient:    "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(99,102,241,0.03))",
    border:      "rgba(99,102,241,0.25)",
    glow:        "rgba(99,102,241,0.15)",
  },
  {
    href:        "/study",
    icon:        "📚",
    title:       "Study Assistant",
    description: "Pick any subject and topic. Get a full structured study guide, analogies, and a mini-quiz.",
    tag:         "Most Popular",
    tagColor:    "#a855f7",
    stats:       "Core concepts · Analogies · Mini quiz",
    gradient:    "linear-gradient(135deg, rgba(168,85,247,0.15), rgba(168,85,247,0.03))",
    border:      "rgba(168,85,247,0.25)",
    glow:        "rgba(168,85,247,0.15)",
  },
  {
    href:        "/recommend",
    icon:        "💡",
    title:       "Recommendation Engine",
    description: "Input any project idea or dilemma. Get structured recommendations with pros, cons and risks.",
    tag:         "Strategic AI",
    tagColor:    "#f59e0b",
    stats:       "Pros & cons · Hidden risks · First steps",
    gradient:    "linear-gradient(135deg, rgba(245,158,11,0.15), rgba(245,158,11,0.03))",
    border:      "rgba(245,158,11,0.25)",
    glow:        "rgba(245,158,11,0.15)",
  },
];

export default function DashboardPage() {
  const { user } = useAuth();

  // Get greeting based on time
  const hour     = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" :
    hour < 17 ? "Good afternoon" :
    "Good evening";

  return (
    <div className="dash-home">

      {/* ── Welcome Header ──────────────────── */}
      <div className="dash-welcome">
        <div className="dash-welcome-left">
          <p className="dash-greeting">{greeting} 👋</p>
          <h1 className="dash-welcome-title">
            Welcome back, <span className="gradient-text">{user?.name?.split(" ")[0]}</span>
          </h1>
          <p className="dash-welcome-sub">
            What would you like to do today? Pick a tool below to get started.
          </p>
        </div>
        <div className="dash-welcome-badge">
          <span>⚡</span>
          <div>
            <p>Prompt Engine</p>
            <span>Active</span>
          </div>
        </div>
      </div>

      {/* ── How it works strip ──────────────── */}
      <div className="dash-how">
        <div className="dash-how-step">
          <span className="dash-how-num">01</span>
          <p>Pick a tool</p>
        </div>
        <div className="dash-how-arrow">→</div>
        <div className="dash-how-step">
          <span className="dash-how-num">02</span>
          <p>Enter your input</p>
        </div>
        <div className="dash-how-arrow">→</div>
        <div className="dash-how-step">
          <span className="dash-how-num">03</span>
          <p>Get elite AI output</p>
        </div>
      </div>

      {/* ── Feature Cards ───────────────────── */}
      <div className="dash-features-label">
        <span>Choose a tool</span>
        <div className="dash-features-line" />
      </div>

      <div className="dash-cards">
        {FEATURES.map((f) => (
          <Link href={f.href} key={f.href} className="dash-card" style={{
            "--card-gradient": f.gradient,
            "--card-border":   f.border,
            "--card-glow":     f.glow,
          }}>

            {/* Top row */}
            <div className="dash-card-top">
              <div className="dash-card-icon">{f.icon}</div>
              <span className="dash-card-tag" style={{ color: f.tagColor, borderColor: f.tagColor + "40", background: f.tagColor + "15" }}>
                {f.tag}
              </span>
            </div>

            {/* Content */}
            <h2 className="dash-card-title">{f.title}</h2>
            <p className="dash-card-desc">{f.description}</p>

            {/* Stats strip */}
            <div className="dash-card-stats">{f.stats}</div>

            {/* CTA */}
            <div className="dash-card-cta">
              Open Tool
              <span className="dash-card-arrow">→</span>
            </div>

          </Link>
        ))}
      </div>

      {/* ── Tip Banner ──────────────────────── */}
      <div className="dash-tip">
        <span className="dash-tip-icon">🔥</span>
        <p>
          <strong>Pro tip:</strong> You don't need to write perfect prompts —
          Promptify's engine automatically upgrades your input to elite-level instructions behind the scenes.
        </p>
      </div>

    </div>
  );
}