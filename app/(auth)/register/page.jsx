"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import Link from "next/link";

export default function RegisterPage() {
  const { register }              = useAuth();
  const [name, setName]           = useState("");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [confirm, setConfirm]     = useState("");
  const [error, setError]         = useState("");
  const [success, setSuccess]     = useState("");
  const [loading, setLoading]     = useState(false);
  const [showPass, setShowPass]   = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirm)
      return setError("Passwords do not match.");
    if (password.length < 6)
      return setError("Password must be at least 6 characters.");

    setLoading(true);
    try {
      await register(name, email, password);
      setSuccess("✅ Account created! Check your email to verify.");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Password strength
  const strength =
    password.length === 0 ? 0
    : password.length < 6 ? 1
    : password.length < 10 ? 2
    : 3;

  const strengthLabel = ["", "Weak", "Good", "Strong"];
  const strengthColor = ["", "#ef4444", "#f59e0b", "#4ade80"];

  return (
    <div className="auth-page">
      <div className="auth-card">

        {/* Brand */}
        <div className="auth-brand">
          <div className="auth-logo-circle">
            <Image
              src="/logo.jpg"
              alt="Promptify"
              width={64}
              height={64}
            />
          </div>
          <span className="auth-brand-name">Promptify</span>
        </div>

        {/* Header */}
        <div className="auth-header">
          <h1>Create your account</h1>
          <p>Start building smarter with AI today</p>
        </div>

        {/* Alerts */}
        {success && <div className="auth-success">{success}</div>}
        {error   && <div className="auth-error">{error}</div>}

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form">

          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Doe"
              required
              autoComplete="name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div style={{ position: "relative" }}>
              <input
                id="password"
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                required
                autoComplete="new-password"
                style={{ paddingRight: "3rem" }}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{
                  position: "absolute", right: "0.75rem",
                  top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none",
                  color: "#555", cursor: "pointer", fontSize: "1rem",
                }}
              >
                {showPass ? "🙈" : "👁️"}
              </button>
            </div>
            {/* Password strength bar */}
            {password.length > 0 && (
              <div style={{ marginTop: "0.4rem" }}>
                <div style={{
                  display: "flex", gap: "4px", marginBottom: "4px"
                }}>
                  {[1,2,3].map((i) => (
                    <div key={i} style={{
                      flex: 1, height: "3px", borderRadius: "999px",
                      background: i <= strength
                        ? strengthColor[strength]
                        : "rgba(255,255,255,0.08)",
                      transition: "background 0.3s",
                    }} />
                  ))}
                </div>
                <span style={{
                  fontSize: "0.72rem",
                  color: strengthColor[strength],
                }}>
                  {strengthLabel[strength]} password
                </span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirm">Confirm Password</label>
            <input
              id="confirm"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="new-password"
              style={{
                borderColor: confirm && confirm !== password
                  ? "rgba(239,68,68,0.5)"
                  : confirm && confirm === password
                  ? "rgba(74,222,128,0.5)"
                  : undefined
              }}
            />
            {confirm && confirm === password && (
              <span style={{ fontSize: "0.72rem", color: "#4ade80" }}>
                ✓ Passwords match
              </span>
            )}
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create Account →"}
          </button>

        </form>

        <p className="auth-footer">
          Already have an account?{" "}
          <Link href="/login">Sign in</Link>
        </p>

        <p className="auth-terms">
          By registering you agree to our{" "}
          <a href="#">Terms of Service</a> and{" "}
          <a href="#">Privacy Policy</a>
        </p>

      </div>
    </div>
  );
}