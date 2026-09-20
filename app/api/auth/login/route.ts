import { NextResponse } from "next/server";
import { createSession, findUserByCredentials, isAdminCredentials } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body || {};

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const emailStr = String(email);
    const passwordStr = String(password);

    const validAdmin = isAdminCredentials(emailStr, passwordStr);
    if (validAdmin) {
      await createSession(emailStr, emailStr.split("@")[0].replace(/[^a-zA-Z]/g, " "));
      return NextResponse.json({ ok: true });
    }

    const user = await findUserByCredentials(emailStr, passwordStr);
    if (user) {
      await createSession(
        user.email,
        user.name || emailStr.split("@")[0].replace(/[^a-zA-Z]/g, " ")
      );
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 }
    );
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json(
      { error: "Unable to login. Please try again." },
      { status: 500 }
    );
  }
}
