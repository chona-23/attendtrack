import { NextResponse } from "next/server";
import { authenticator } from "otplib";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Initialize Firebase Admin SDK (server-side only)
function getAdminDb() {
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;

  if (
    !privateKey ||
    !clientEmail ||
    privateKey.includes("paste_private_key_here") ||
    clientEmail.includes("paste_service_account_email_here")
  ) {
    return null;
  }

  try {
    if (!getApps().length) {
      initializeApp({
        credential: cert({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          clientEmail,
          privateKey: privateKey.replace(/\\n/g, "\n"),
        }),
      });
    }
    return getFirestore();
  } catch (err) {
    console.error("Firebase Admin SDK init error:", err);
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const { uid, token } = await request.json();

    if (!uid || !token) {
      return NextResponse.json(
        { error: "Missing uid or token" },
        { status: 400 }
      );
    }

    const adminDb = getAdminDb();
    if (!adminDb) {
      return NextResponse.json(
        { error: "Firebase Admin SDK not configured on server", fallback: true },
        { status: 503 }
      );
    }

    const userDoc = await adminDb.collection("users").doc(uid).get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { totpSecret } = userDoc.data() as { totpSecret?: string };

    if (!totpSecret) {
      return NextResponse.json(
        { error: "2FA not configured for this user" },
        { status: 400 }
      );
    }

    authenticator.options = { window: 1 };
    const isValid = authenticator.verify({ token, secret: totpSecret });

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid or expired code" },
        { status: 401 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("TOTP verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
