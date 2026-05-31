// ── Dot Pulse Loader (inline, for buttons) ──────────────
export function DotLoader() {
  return (
    <div className="dot-loader">
      <span /><span /><span />
    </div>
  );
}

// ── Skeleton Block (single line) ────────────────────────
export function SkeletonLine({ width = "100%", height = "16px" }) {
  return (
    <div
      className="skeleton"
      style={{ width, height, borderRadius: "6px" }}
    />
  );
}

// ── Skeleton Card ────────────────────────────────────────
export function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
        <div className="skeleton" style={{ width: "40px", height: "40px", borderRadius: "10px" }} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          <SkeletonLine width="60%" height="14px" />
          <SkeletonLine width="40%" height="12px" />
        </div>
      </div>
      <SkeletonLine width="100%" height="12px" />
      <SkeletonLine width="90%"  height="12px" />
      <SkeletonLine width="75%"  height="12px" />
    </div>
  );
}

// ── Code Block Skeleton (for Debugger) ──────────────────
export function SkeletonCode() {
  return (
    <div className="skeleton-code-wrap">
      {/* Header bar */}
      <div className="skeleton-code-header">
        <div className="skeleton" style={{ width: "80px", height: "12px", borderRadius: "4px" }} />
        <div style={{ display: "flex", gap: "6px" }}>
          <div className="skeleton-dot" />
          <div className="skeleton-dot" />
          <div className="skeleton-dot" />
        </div>
      </div>
      {/* Code lines */}
      <div className="skeleton-code-body">
        {[
          "85%", "60%", "90%", "45%", "70%",
          "80%", "55%", "65%", "40%", "75%",
        ].map((w, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            {/* Line number */}
            <div className="skeleton" style={{ width: "20px", height: "12px", borderRadius: "3px", opacity: 0.3, flexShrink: 0 }} />
            {/* Code line */}
            <div className="skeleton" style={{ width: w, height: "13px", borderRadius: "3px", animationDelay: `${i * 0.08}s` }} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Study Guide Skeleton ─────────────────────────────────
export function SkeletonStudy() {
  return (
    <div className="skeleton-study">
      {/* Title */}
      <SkeletonLine width="50%" height="22px" />
      <div style={{ height: "0.5rem" }} />
      <SkeletonLine width="30%" height="13px" />

      <div className="skeleton-divider" />

      {/* Section 1 */}
      <SkeletonLine width="40%" height="18px" />
      <div style={{ marginTop: "0.75rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <SkeletonLine width="100%" height="13px" />
        <SkeletonLine width="95%"  height="13px" />
        <SkeletonLine width="80%"  height="13px" />
      </div>

      <div className="skeleton-divider" />

      {/* Section 2 */}
      <SkeletonLine width="35%" height="18px" />
      <div style={{ marginTop: "0.75rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <SkeletonLine width="100%" height="13px" />
        <SkeletonLine width="88%"  height="13px" />
        <SkeletonLine width="92%"  height="13px" />
        <SkeletonLine width="70%"  height="13px" />
      </div>

      <div className="skeleton-divider" />

      {/* Quiz pills */}
      <SkeletonLine width="25%" height="18px" />
      <div style={{ marginTop: "0.75rem", display: "flex", flexDirection: "column", gap: "0.65rem" }}>
        {[1,2,3].map((i) => (
          <div key={i} className="skeleton-quiz-item">
            <div className="skeleton" style={{ width: "24px", height: "24px", borderRadius: "50%", flexShrink: 0 }} />
            <SkeletonLine width="75%" height="13px" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Recommendation Skeleton ──────────────────────────────
export function SkeletonRecommend() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {[1, 2, 3].map((i) => (
        <div key={i} className="skeleton-card">
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem" }}>
            <SkeletonLine width="40%" height="16px" />
            <SkeletonLine width="20%" height="14px" />
          </div>
          <SkeletonLine width="100%" height="12px" />
          <SkeletonLine width="90%"  height="12px" />
          <SkeletonLine width="60%"  height="12px" />
          <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
            <SkeletonLine width="80px" height="28px" />
            <SkeletonLine width="80px" height="28px" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Full Page Loader ─────────────────────────────────────
export function PageLoader() {
  return (
    <div className="page-loader">
      <div className="page-loader-inner">
        <div className="page-loader-logo">⚡</div>
        <div className="dot-loader">
          <span /><span /><span />
        </div>
        <p>Generating your result...</p>
      </div>
    </div>
  );
}

// ── Default export (generic spinner) ────────────────────
export default function LoadingSpinner({ text = "Loading..." }) {
  return (
    <div className="spinner-wrap">
      <div className="spinner" />
      <span>{text}</span>
    </div>
  );
}