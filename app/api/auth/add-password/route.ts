import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createSession } from "@/lib/auth";
import { hashPassword } from "@/lib/password";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name } = body || {};

    const normalizedEmail = String(email || "").trim().toLowerCase();
    if (!normalizedEmail || !/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    if (typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existing) {
      return NextResponse.json(
        { error: "A user with this email already exists. Please login instead." },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: typeof name === "string" && name.trim() ? name.trim() : null,
        passwordHash,
      },
    });

    await createSession(
      user.email,
      user.name || user.email.split("@")[0].replace(/[^a-zA-Z]/g, " ")
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Add password error:", err);
    return NextResponse.json(
      { error: "Unable to create credentials. Please try again." },
      { status: 500 }
    );
  }
}