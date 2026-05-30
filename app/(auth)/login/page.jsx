"use client";

import { useState, useEffect, Suspense } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

function LoginForm() {
  const { login }               = useAuth();
  const searchParams            = useSearchParams();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState("");
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    if (searchParams.get("verified") === "true")
      setSuccess("✅ Email verified! You can now sign in.");
    if (searchParams.get("error") === "invalid-token")
      setError("❌ Verification link is invalid or expired.");
    if (searchParams.get("error") === "missing-token")
      setError("❌ No verification token found.");
  }, [searchParams]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">

        {/* Brand */}
        <div className="auth-brand">
          <div className="auth-logo-circle">
            <Image
              src="/logo1.jpg"
              alt="Promptify"
              width={64}
              height={64}
            />
          </div>
          <span className="auth-brand-name">Promptify</span>
        </div>

        {/* Header */}
        <div className="auth-header">
          <h1>Welcome back</h1>
          <p>Sign in to continue to your workspace</p>
        </div>

        {/* Alerts */}
        {success && <div className="auth-success">{success}</div>}
        {error   && <div className="auth-error">{error}</div>}

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form">

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
                placeholder="••••••••"
                required
                autoComplete="current-password"
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
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In →"}
          </button>

        </form>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <p className="auth-footer">
          Don&apos;t have an account?{" "}
          <Link href="/register">Create one free</Link>
        </p>

        <p className="auth-terms">
          By signing in you agree to our{" "}
          <a href="#">Terms of Service</a> and{" "}
          <a href="#">Privacy Policy</a>
        </p>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}