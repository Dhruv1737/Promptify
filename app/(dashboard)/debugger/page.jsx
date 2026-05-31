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
  const [code, setCode]         = useState("");
  const [language, setLanguage] = useState("Auto Detect");
  const [output, setOutput]     = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [copied, setCopied]     = useState(false);

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
      if (!res.ok) throw new Error(data.error);
      setOutput(data.output);
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
        <div className="feature-header-badge">
          Senior Engineer Prompt
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
            {/* Loading skeleton */}
            {loading && <SkeletonCode />}

            {/* Error */}
            {error && !loading && (
              <div className="output-error">
                ❌ {error}
              </div>
            )}

            {/* Empty state */}
            {!loading && !output && !error && (
              <div className="output-empty">
                <span>🐛</span>
                <p>Your debugged code will appear here</p>
                <span className="output-empty-sub">
                  Paste code on the left and click Debug
                </span>
              </div>
            )}

            {/* Result */}
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