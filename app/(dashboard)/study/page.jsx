"use client";

import { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { SkeletonStudy } from "@/components/ui/LoadingSpinner";

const SUBJECTS = [
  "Computer Science", "Mathematics", "Physics", "Chemistry",
  "Biology", "History", "Geography", "Economics", "Psychology",
  "Philosophy", "Literature", "Law", "Medicine", "Engineering",
  "Data Science", "Artificial Intelligence", "Cybersecurity",
  "Business", "Finance", "Other",
];

export default function StudyPage() {
  const [mode, setMode]               = useState("text");
  const [subject, setSubject]         = useState("");
  const [topic, setTopic]             = useState("");
  const [context, setContext]         = useState("");
  const [showContext, setShowContext] = useState(false);
  const [pdfFile, setPdfFile]         = useState(null);
  const [pdfName, setPdfName]         = useState("");
  const [pdfTopic, setPdfTopic]       = useState("");
  const [pdfContext, setPdfContext]   = useState("");
  const [dragOver, setDragOver]       = useState(false);
  const [output, setOutput]           = useState("");
  const [error, setError]             = useState("");
  const [loading, setLoading]         = useState(false);
  const [copied, setCopied]           = useState(false);
  const [remaining, setRemaining]     = useState(null);
  const [totalLimit, setTotalLimit]   = useState(null);
  const fileInputRef                  = useRef(null);

  function handleFileChange(file) {
    if (!file) return;
    if (file.type !== "application/pdf") {
      setError("Please upload a PDF file only.");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setError("File size must be under 20MB.");
      return;
    }
    setError("");
    setPdfFile(file);
    setPdfName(file.name);
    setOutput("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setOutput("");
    setLoading(true);

    try {
      let res;

      if (mode === "pdf") {
        if (!pdfFile) throw new Error("Please upload a PDF file.");
        const formData = new FormData();
        formData.append("pdf",     pdfFile);
        formData.append("topic",   pdfTopic);
        formData.append("context", pdfContext);
        res = await fetch("/api/study", {
          method: "POST",
          body:   formData,
        });
      } else {
        res = await fetch("/api/study", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ subject, topic, context }),
        });
      }

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
    setSubject(""); setTopic(""); setContext("");
    setPdfFile(null); setPdfName(""); setPdfTopic(""); setPdfContext("");
    setOutput(""); setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div className="feature-page">

      {/* ── Page Header ─────────────────────── */}
      <div className="feature-header">
        <div className="feature-header-left">
          <div className="feature-header-icon">📚</div>
          <div>
            <h1>Study Assistant</h1>
            <p>Get a full study guide from a topic or your own PDF notes</p>
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

      {/* ── Mode Toggle ─────────────────────── */}
      <div className="study-mode-toggle">
        <button
          type="button"
          className={`study-mode-btn ${mode === "text" ? "active" : ""}`}
          onClick={() => { setMode("text"); setOutput(""); setError(""); }}
        >
          ✏️ Type a Topic
        </button>
        <button
          type="button"
          className={`study-mode-btn ${mode === "pdf" ? "active" : ""}`}
          onClick={() => { setMode("pdf"); setOutput(""); setError(""); }}
        >
          📄 Upload PDF Notes
        </button>
      </div>

      {/* ── Main Layout ─────────────────────── */}
      <div className="study-layout">

        {/* ── Left — Input ──────────────────── */}
        <div className="study-input-col">
          <form onSubmit={handleSubmit} className="study-form">

            {/* ── TEXT MODE ─────────────────── */}
            {mode === "text" && (<>
              <div className="form-group">
                <label htmlFor="subject">Subject</label>
                <select
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="debugger-select"
                  required
                >
                  <option value="">Select a subject...</option>
                  {SUBJECTS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="topic">Topic</label>
                <input
                  id="topic"
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Binary Search Trees, Photosynthesis..."
                  className="study-topic-input"
                  required
                />
              </div>

              <button
                type="button"
                className="study-context-toggle"
                onClick={() => setShowContext(!showContext)}
              >
                {showContext ? "▼" : "▶"} Add extra context
                <span>(optional)</span>
              </button>

              {showContext && (
                <div className="form-group">
                  <label>Extra Context</label>
                  <textarea
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    placeholder="e.g. I'm a beginner, preparing for an exam..."
                    className="study-context-textarea"
                    rows={3}
                  />
                </div>
              )}
            </>)}

            {/* ── PDF MODE ──────────────────── */}
            {mode === "pdf" && (<>
              <div
                className={`pdf-dropzone ${dragOver ? "pdf-dropzone--over" : ""} ${pdfFile ? "pdf-dropzone--filled" : ""}`}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFileChange(e.dataTransfer.files[0]); }}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  style={{ display: "none" }}
                  onChange={(e) => handleFileChange(e.target.files[0])}
                />
                {pdfFile ? (
                  <div className="pdf-dropzone-filled">
                    <span className="pdf-icon">📄</span>
                    <div>
                      <p className="pdf-name">{pdfName}</p>
                      <p className="pdf-size">
                        {(pdfFile.size / 1024).toFixed(1)} KB · PDF ready
                      </p>
                    </div>
                    <button
                      type="button"
                      className="pdf-remove-btn"
                      onClick={(e) => { e.stopPropagation(); handleClear(); }}
                    >✕</button>
                  </div>
                ) : (
                  <div className="pdf-dropzone-empty">
                    <span className="pdf-upload-icon">⬆️</span>
                    <p className="pdf-dropzone-title">Drop your PDF notes here</p>
                    <p className="pdf-dropzone-sub">
                      Textbook, lecture notes, any PDF · Max 20MB
                    </p>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="pdfTopic">
                  Focus Topic
                  <span className="resume-label-hint">(optional)</span>
                </label>
                <input
                  id="pdfTopic"
                  type="text"
                  value={pdfTopic}
                  onChange={(e) => setPdfTopic(e.target.value)}
                  placeholder="e.g. Chapter 3, Recursion..."
                  className="study-topic-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="pdfContext">
                  Extra Context
                  <span className="resume-label-hint">(optional)</span>
                </label>
                <textarea
                  id="pdfContext"
                  value={pdfContext}
                  onChange={(e) => setPdfContext(e.target.value)}
                  placeholder="e.g. I'm preparing for finals..."
                  className="study-context-textarea"
                  rows={3}
                />
              </div>
            </>)}

            {/* ── What you'll get ────────────── */}
            <div className="study-preview">
              <p className="study-preview-title">Your guide will include:</p>
              <div className="study-preview-items">
                <span>📖 Core concepts</span>
                <span>🌍 Real-world analogies</span>
                <span>⚠️ Common misconceptions</span>
                <span>🧠 Mini quiz (5 questions)</span>
                <span>🔭 Follow-up topics</span>
              </div>
            </div>

            {/* ── Buttons ───────────────────── */}
            <div className="study-form-btns">
              <button
                type="button"
                onClick={handleClear}
                className="debugger-clear-btn"
              >
                Clear
              </button>
              <button
                type="submit"
                className="feature-submit-btn"
                disabled={
                  loading ||
                  (mode === "text" && (!subject || !topic.trim())) ||
                  (mode === "pdf"  && !pdfFile)
                }
                style={{
                  background: "linear-gradient(135deg, #a855f7, #7c3aed)",
                  boxShadow:  "0 4px 15px rgba(168,85,247,0.3)",
                }}
              >
                {loading ? (
                  <span className="btn-loading">
                    <span className="btn-spinner" /> Generating guide...
                  </span>
                ) : (
                  "📚 Generate Study Guide →"
                )}
              </button>
            </div>

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
                    color: remaining === 0 ? "#f87171" : "#c084fc"
                  }}>
                    {remaining}
                  </strong>
                  {" "}/ {totalLimit} study guides left this hour
                </p>
              </div>
            )}

          </form>
        </div>

        {/* ── Right — Output ────────────────── */}
        <div className="debugger-output-col">
          <div className="output-header">
            <span>
              {output
                ? mode === "pdf"
                  ? `📚 ${pdfName}`
                  : `📚 ${subject} — ${topic}`
                : "Study Guide Output"
              }
            </span>
            {output && (
              <button onClick={handleCopy} className="output-copy-btn">
                {copied ? "✅ Copied!" : "📋 Copy"}
              </button>
            )}
          </div>

          <div className="output-body">
            {loading && <SkeletonStudy />}

            {error && !loading && (
              <div className="output-error">❌ {error}</div>
            )}

            {!loading && !output && !error && (
              <div className="output-empty">
                <span>📚</span>
                <p>Your study guide will appear here</p>
                <span className="output-empty-sub">
                  {mode === "pdf"
                    ? "Upload your PDF notes on the left"
                    : "Select a subject and topic on the left"
                  }
                </span>
              </div>
            )}

            {output && !loading && (
              <div className="output-result">
                <ReactMarkdown>{output}</ReactMarkdown>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}