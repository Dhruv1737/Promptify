"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { SkeletonCode } from "@/components/ui/LoadingSpinner";

const LANGUAGES = [
  "Auto Detect", "JavaScript", "TypeScript", "Python", "Java",
  "C", "C++", "C#", "Go", "Rust", "PHP", "Ruby", "Swift",
  "Kotlin", "HTML", "CSS", "SQL", "Bash",
];

export default function DebuggerPage() {
  const [code, setCode]           = useState("");
  const [language, setLanguage]   = useState("Auto Detect");
  const [output, setOutput]       = useState("");
  const [error, setError]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [copied, setCopied]       = useState(false);
  const [remaining, setRemaining] = useState(null);
  const [totalLimit, setTotalLimit] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!code.trim()) return;
    setError("");
    setOutput("");
    setLoading(true);

    try {
      const res = await fetch("/api/debugger", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          code,
          language: language === "Auto Detect" ? null : language,
        }),
      });

      const data = await res.json();

      // ── Handle rate limit ─────────────────
      if (res.status === 429) {
        setError(data.error);
        return;
      }

      if (!res.ok) throw new Error(data.error);

      setOutput(data.output);
      setRemaining(data.remaining);
      setTotalLimit(data.limit);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleClear() {
    setCode("");
    setOutput("");
    setError("");
  }

  return (
    <div className="feature-page">

      {/* ── Page Header ─────────────────────── */}
      <div className="feature-header">
        <div className="feature-header-left">
          <div className="feature-header-icon">🐛</div>
          <div>
            <h1>Smart Code Debugger</h1>
            <p>Paste your broken code and get a production-ready fix with full explanations</p>
          </div>
        </div>
        <div className="feature-header-badge" style={{
          background:  "rgba(66,133,244,0.1)",
          borderColor: "rgba(66,133,244,0.25)",
          color:       "#60a5fa",
        }}>
          ⚡ Powered by Gemini
        </div>
      </div>

      {/* ── Main Layout ─────────────────────── */}
      <div className="debugger-layout">

        {/* ── Left — Input ──────────────────── */}
        <div className="debugger-input-col">
          <form onSubmit={handleSubmit} className="debugger-form">

            {/* Language selector */}
            <div className="debugger-toolbar">
              <label htmlFor="language">Language</label>
              <select
                id="language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="debugger-select"
              >
                {LANGUAGES.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleClear}
                className="debugger-clear-btn"
              >
                Clear
              </button>
            </div>

            {/* Code textarea */}
            <div className="debugger-editor-wrap">
              <div className="debugger-editor-header">
                <span>Your Code</span>
                <span className="debugger-char-count">
                  {code.length} chars
                </span>
              </div>
              <textarea
                className="debugger-textarea"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={`// Paste your broken code here...\n\nfunction example() {\n  // I'll fix it for you!\n}`}
                spellCheck={false}
                required
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="feature-submit-btn"
              disabled={loading || !code.trim()}
            >
              {loading ? (
                <span className="btn-loading">
                  <span className="btn-spinner" /> Analyzing code...
                </span>
              ) : (
                "🔍 Debug My Code →"
              )}
            </button>

            {/* ── Rate limit display ─────────── */}
            {remaining !== null && (
              <div className="rate-limit-info">
                <div className="rate-limit-bar">
                  {Array.from({ length: totalLimit }).map((_, i) => (
                    <div
                      key={i}
                      className={`rate-limit-pip ${
                        i < (totalLimit - remaining) ? "used" : "available"
                      }`}
                    />
                  ))}
                </div>
                <p>
                  <strong style={{
                    color: remaining === 0 ? "#f87171" : "#818cf8"
                  }}>
                    {remaining}
                  </strong>
                  {" "}/ {totalLimit} debug requests left this hour
                </p>
              </div>
            )}

          </form>
        </div>

        {/* ── Right — Output ────────────────── */}
        <div className="debugger-output-col">
          <div className="output-header">
            <span>Output</span>
            {output && (
              <button onClick={handleCopy} className="output-copy-btn">
                {copied ? "✅ Copied!" : "📋 Copy"}
              </button>
            )}
          </div>

          <div className="output-body">
            {loading && <SkeletonCode />}

            {error && !loading && (
              <div className="output-error">❌ {error}</div>
            )}

            {!loading && !output && !error && (
              <div className="output-empty">
                <span>🐛</span>
                <p>Your debugged code will appear here</p>
                <span className="output-empty-sub">
                  Paste code on the left and click Debug
                </span>
              </div>
            )}

            {output && !loading && (
              <div className="output-result">
                <ReactMarkdown
                  components={{
                    code({ node, inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || "");
                      return !inline && match ? (
                        <SyntaxHighlighter
                          style={oneDark}
                          language={match[1]}
                          PreTag="div"
                          customStyle={{
                            borderRadius: "10px",
                            fontSize: "0.85rem",
                            margin: "0.75rem 0",
                          }}
                          {...props}
                        >
                          {String(children).replace(/\n$/, "")}
                        </SyntaxHighlighter>
                      ) : (
                        <code className="inline-code" {...props}>
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {output}
                </ReactMarkdown>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}