// All login/session logic lives here so it's in one place.

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import prisma from "./prisma";

const JWT_SECRET = process.env.JWT_SECRET;
const COOKIE_NAME = "token";

export async function hashPassword(plainPassword) {
  return bcrypt.hash(plainPassword, 10);
}

export async function verifyPassword(plainPassword, passwordHash) {
  return bcrypt.compare(plainPassword, passwordHash);
}

export function signToken(payload) {
  // Token stays valid for 7 days - after that the person has to log in again.
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

// Call this from a Route Handler's response object to log a user in.
export function setAuthCookie(response, token) {
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days, in seconds
  });
}

export function clearAuthCookie(response) {
  response.cookies.set(COOKIE_NAME, "", { path: "/", maxAge: 0 });
}

// Reads the cookie from the incoming request (works in Server Components,
// Route Handlers, anywhere `cookies()` is available) and returns the
// logged-in user's basic info from the database, or null if not logged in.
export async function getSessionUser() {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload?.userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, name: true, email: true },
  });
  return user;
}
