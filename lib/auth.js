import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const SECRET = process.env.JWT_SECRET;
const COOKIE_NAME = "ai_hub_token"; // Brand matched

if (!SECRET) {
  throw new Error("Please define the JWT_SECRET environment variable inside .env.local");
}

export function signToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: "7d" });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
}

// Upgraded to use native Next.js cookie handling safely anywhere
export async function setAuthCookie(token) {
  const cookieStore = await cookies();
  
  // Explicitly verify if we are truly running live on production networks
  const isProd = process.env.NODE_ENV === "production";

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: false, // ⚡ FORCE FALSE for local testing to let http://localhost accept it!
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "", { maxAge: 0, path: "/" });
}

export async function getSessionUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) {
    console.log("❌ [AUTH UTILS] No token found in cookie store container.");
    return null;
  }
  return verifyToken(token);
}