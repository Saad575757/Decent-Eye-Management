import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { getSession } from "@/lib/session";

export {
  createSession,
  destroySession,
  getSession,
  nameFromEmail,
  type SessionPayload,
} from "@/lib/session";

export function isAdminCredentials(email: string, password: string) {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@decenteye.local";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@123";
  return email === adminEmail && password === adminPassword;
}

export async function findUserByCredentials(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });
  if (!user) return null;
  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) return null;
  return user;
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  return session;
}