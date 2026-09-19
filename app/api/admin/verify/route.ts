import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      return NextResponse.json(
        { error: "Admin credentials not configured" },
        { status: 500 }
      );
    }

    // Check against root credentials
    if (email !== adminEmail || password !== adminPassword) {
      return NextResponse.json(
        { error: "Invalid administrator credentials" },
        { status: 401 }
      );
    }

    // Generate a simple signed session token (in production use a proper JWT library)
    const sessionToken = Buffer.from(
      JSON.stringify({
        email,
        role: "admin",
        iat: Date.now(),
        exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
        sig: process.env.ADMIN_SESSION_SECRET ?? "default-secret",
      })
    ).toString("base64");

    // Set httpOnly cookie
    const cookieStore = await cookies();
    cookieStore.set("admin_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      path: "/",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin verify error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  // Admin logout
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
  return NextResponse.json({ success: true });
}
