"use client";

import { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { SkeletonStudy } from "@/components/ui/LoadingSpinner";

export default function ResumePage() {
  const [pdfFile, setPdfFile]             = useState(null);
  const [pdfName, setPdfName]             = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [output, setOutput]               = useState("");
  const [error, setError]                 = useState("");
  const [loading, setLoading]             = useState(false);
  const [copied, setCopied]               = useState(false);
  const [showJD, setShowJD]               = useState(false);
  const [score, setScore]                 = useState(null);
  const [dragOver, setDragOver]           = useState(false);
  const [remaining, setRemaining]         = useState(null);
  const [totalLimit, setTotalLimit]       = useState(null);
  const fileInputRef                      = useRef(null);

  function handleFileChange(file) {
    if (!file) return;
    if (file.type !== "application/pdf") {
      setError("Please upload a PDF file only.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be under 10MB.");
      return;
    }
    setError("");
    setPdfFile(file);
    setPdfName(file.name);
    setOutput("");
    setScore(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!pdfFile) return;
    setError("");
    setOutput("");
    setScore(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("resume",         pdfFile);
      formData.append("jobDescription", jobDescription);

      const res = await fetch("/api/resume", {
        method: "POST",
        body:   formData,
      });

      const data = await res.json();

      // ── Handle rate limit ─────────────────
      if (res.status === 429) {
        setError(data.error);
        return;
      }

      if (!res.ok) throw new Error(data.error);

      setScore(data.score);
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
    setPdfFile(null);
    setPdfName("");
    setJobDescription("");
    setOutput("");
    setError("");
    setScore(null);
    setRemaining(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const scoreColor =
    !score      ? "#666"    :
    score >= 80 ? "#4ade80" :
    score >= 60 ? "#f59e0b" :
    score >= 40 ? "#fb923c" :
    "#f87171";

  const scoreLabel =
    !score      ? ""           :
    score >= 80 ? "Excellent"  :
    score >= 60 ? "Good"       :
    score >= 40 ? "Needs Work" :
    "Poor";

  return (
    <div className="feature-page">

      {/* ── Page Header ─────────────────────── */}
      <div className="feature-header">
        <div className="feature-header-left">
          <div className="feature-header-icon">📄</div>
          <div>
            <h1>ATS Resume Checker</h1>
            <p>Upload your resume PDF — get an ATS score, keywords, fixes and optimized summary</p>
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

      {/* ── Score Banner ────────────────────── */}
      {score !== null && !loading && (
        <div className="ats-score-banner">
          <div className="ats-score-left">
            <div className="ats-score-circle"
              style={{ "--score-color": scoreColor }}
            >
              <span className="ats-score-num" style={{ color: scoreColor }}>
                {score}
              </span>
              <span className="ats-score-denom">/100</span>
            </div>
            <div>
              <p className="ats-score-label" style={{ color: scoreColor }}>
                {scoreLabel}
              </p>
              <p className="ats-score-sub">ATS Compatibility Score</p>
            </div>
          </div>
          <div className="ats-score-bar-wrap">
            <div className="ats-score-bar-track">
              <div className="ats-score-bar-fill"
                style={{ width: `${score}%`, background: scoreColor }}
              />
            </div>
            <div className="ats-score-bar-labels">
              <span>0</span>
              <span style={{ color: "#f87171"  }}>Poor</span>
              <span style={{ color: "#fb923c"  }}>Needs Work</span>
              <span style={{ color: "#f59e0b"  }}>Good</span>
              <span style={{ color: "#4ade80"  }}>Excellent</span>
              <span>100</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Layout ─────────────────────── */}
      <div className="resume-layout">

        {/* ── Left — Input ──────────────────── */}
        <div className="resume-input-col">
          <form onSubmit={handleSubmit} className="resume-form">

            {/* ── PDF Drop Zone ─────────────── */}
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
                  <p className="pdf-dropzone-title">Drop your resume here</p>
                  <p className="pdf-dropzone-sub">
                    or click to browse · PDF only · Max 10MB
                  </p>
                </div>
              )}
            </div>

            {/* ── Job Description toggle ─────── */}
            <button
              type="button"
              className="study-context-toggle"
              onClick={() => setShowJD(!showJD)}
            >
              {showJD ? "▼" : "▶"} Add Job Description
              <span>(recommended)</span>
            </button>

            {showJD && (
              <div className="form-group">
                <label htmlFor="jd">Job Description</label>
                <textarea
                  id="jd"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job description here for tailored keyword analysis..."
                  className="study-context-textarea"
                  rows={5}
                />
              </div>
            )}

            {/* ── What you'll get ────────────── */}
            <div className="ats-preview">
              <p className="study-preview-title">Your analysis includes:</p>
              <div className="ats-preview-grid">
                <span>🎯 ATS score /100</span>
                <span>🔑 Keywords found</span>
                <span>❌ Missing keywords</span>
                <span>⚠️ Formatting issues</span>
                <span>📊 Section ratings</span>
                <span>🔧 Top 3 fixes</span>
                <span>✍️ Optimized summary</span>
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
                className="feature-submit-btn ats-submit-btn"
                disabled={loading || !pdfFile}
              >
                {loading ? (
                  <span className="btn-loading">
                    <span className="btn-spinner" /> Analyzing resume...
                  </span>
                ) : (
                  "📄 Analyze My Resume →"
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
                    color: remaining === 0 ? "#f87171" : "#fbbf24"
                  }}>
                    {remaining}
                  </strong>
                  {" "}/ {totalLimit} resume analysis left this hour
                </p>
              </div>
            )}

          </form>
        </div>

        {/* ── Right — Output ────────────────── */}
        <div className="debugger-output-col">
          <div className="output-header">
            <span>Analysis Report</span>
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
                <span>📄</span>
                <p>Your ATS analysis will appear here</p>
                <span className="output-empty-sub">
                  Upload your resume PDF on the left
                </span>
                <div className="ats-tips">
                  <p className="ats-tips-title">💡 Tips for best results:</p>
                  <ul>
                    <li>Upload a text-based PDF (not a scanned image)</li>
                    <li>Add the job description for tailored analysis</li>
                    <li>Make sure resume has all key sections</li>
                  </ul>
                </div>
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