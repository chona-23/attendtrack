import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const adminEmail =
      process.env.ADMIN_EMAIL ||
      process.env.NEXT_PUBLIC_ADMIN_EMAIL ||
      "nachoyal@gmail.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "_88122300_";

    // Check against root credentials
    if (
      email.toLowerCase().trim() !== adminEmail.toLowerCase().trim() ||
      (adminPassword && password !== adminPassword)
    ) {
      return NextResponse.json(
        { error: "Credenciales de administrador inválidas." },
        { status: 401 }
      );
    }

    // Generate a simple signed session token
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
      { error: "Error interno del servidor. Intente nuevamente." },
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
