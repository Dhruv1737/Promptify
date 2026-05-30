"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function DashboardLayout({ children }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  
  // ⚡ FIXED: Moved usePathname inside the component so React can track it correctly
  const pathname = usePathname();

  // Protect all dashboard routes
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Show spinner while checking auth
  if (loading) {
    return (
      <div className="dash-loading">
        <LoadingSpinner text="Loading your workspace..." />
      </div>
    );
  }

  // Don't render if not logged in
  if (!user) return null;

  return (
    <div className="dash-shell">

      {/* ── Top Navbar ──────────────────────── */}
      <nav className="dash-nav">

        {/* Left — Logo */}
        <Link href="/dashboard" className="dash-nav-logo">
          <Image
            src="/logo1.jpg"
            alt="Promptify"
            width={110}
            height={38}
            style={{ objectFit: "contain" }}
            className="landing-logo-img"
            priority
          />
        </Link>

        {/* Center — Feature Links */}
        <div className="dash-nav-links">
          <Link
            href="/dashboard"
            className={`dash-nav-link ${pathname === "/dashboard" ? "active" : ""}`}
          >
            🏠 Home
          </Link>
          <Link
            href="/debugger"
            className={`dash-nav-link ${pathname === "/debugger" ? "active" : ""}`}
          >
            🐛 Debugger
          </Link>
          <Link
            href="/study"
            className={`dash-nav-link ${pathname === "/study" ? "active" : ""}`}
          >
            📚 Study
          </Link>
          <Link
            href="/recommend"
            className={`dash-nav-link ${pathname === "/recommend" ? "active" : ""}`}
          >
            💡 Recommend
          </Link>
        </div> {/* ⚡ FIXED: Added the missing closing div for dash-nav-links here */}

        {/* Right — User + Logout */}
        <div className="dash-nav-user">
          <div className="dash-user-info">
            <div className="dash-user-avatar">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <span className="dash-user-name">{user.name}</span>
          </div>
          <button onClick={logout} className="dash-logout-btn">
            Logout
          </button>
        </div>

      </nav>

      {/* ── Page Content ────────────────────── */}
      <main className="dash-main">
        {children}
      </main>

    </div>
  );
}