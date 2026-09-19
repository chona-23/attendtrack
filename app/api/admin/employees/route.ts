import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function getAdminApp() {
  if (getApps().length > 0) return getApps()[0];
  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

function verifyAdminSession(cookieStore: Awaited<ReturnType<typeof cookies>>) {
  const token = cookieStore.get("admin_session")?.value;
  if (!token) return false;
  try {
    const payload = JSON.parse(Buffer.from(token, "base64").toString("utf-8"));
    const validSig = process.env.ADMIN_SESSION_SECRET ?? "default-secret";
    if (payload.sig !== validSig) return false;
    if (Date.now() > payload.exp) return false;
    return true;
  } catch {
    return false;
  }
}

const VALID_WORKER_TYPES = ["virtual", "onsite", "hybrid", "other"] as const;

// PATCH — update employee account info and/or work profile fields
export async function PATCH(request: Request) {
  const cookieStore = await cookies();
  if (!verifyAdminSession(cookieStore)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      uid,
      displayName,
      email,
      password,
      // Work profile fields
      project,
      workerType,
      workingHoursStart,
      workingHoursEnd,
      extraHoursAuthorized,
      extraHoursAllowed,
      profileVisible,
    } = body;

    if (!uid) return NextResponse.json({ error: "uid is required" }, { status: 400 });

    // Validate workerType if provided
    if (workerType !== undefined && workerType !== "" &&
        !VALID_WORKER_TYPES.includes(workerType)) {
      return NextResponse.json({ error: "Invalid workerType value" }, { status: 400 });
    }

    // Validate extraHoursAllowed if provided
    if (extraHoursAllowed !== undefined && extraHoursAllowed !== null) {
      const n = Number(extraHoursAllowed);
      if (isNaN(n) || n < 0) {
        return NextResponse.json({ error: "extraHoursAllowed must be a non-negative number" }, { status: 400 });
      }
    }

    const app = getAdminApp();
    const adminAuth = getAuth(app);
    const adminDb = getFirestore(app);

    // Firebase Auth updates (name + email + password)
    const authUpdates: { displayName?: string; email?: string; password?: string } = {};
    if (displayName?.trim()) authUpdates.displayName = displayName.trim();
    if (email?.trim()) authUpdates.email = email.trim();
    if (password?.trim() && password.trim().length >= 6) authUpdates.password = password.trim();

    // Firestore updates — account fields
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const firestoreUpdates: Record<string, any> = {};
    if (displayName?.trim()) firestoreUpdates.displayName = displayName.trim();
    if (email?.trim()) firestoreUpdates.email = email.trim();

    // Firestore updates — work profile fields
    if (project !== undefined) firestoreUpdates.project = project ?? "";
    if (workerType !== undefined) firestoreUpdates.workerType = workerType ?? "";
    if (workingHoursStart !== undefined || workingHoursEnd !== undefined) {
      firestoreUpdates["workingHours.start"] = workingHoursStart ?? "";
      firestoreUpdates["workingHours.end"] = workingHoursEnd ?? "";
    }
    if (extraHoursAuthorized !== undefined) {
      firestoreUpdates.extraHoursAuthorized = Boolean(extraHoursAuthorized);
    }
    if (extraHoursAllowed !== undefined && extraHoursAllowed !== null) {
      firestoreUpdates.extraHoursAllowed = Number(extraHoursAllowed);
    }
    if (profileVisible !== undefined) {
      firestoreUpdates.profileVisible = Boolean(profileVisible);
    }

    // Nothing to do?
    if (Object.keys(authUpdates).length === 0 && Object.keys(firestoreUpdates).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    // Apply Firebase Auth changes first (if any)
    if (Object.keys(authUpdates).length > 0) {
      await adminAuth.updateUser(uid, authUpdates);
    }

    // Apply Firestore changes
    if (Object.keys(firestoreUpdates).length > 0) {
      await adminDb.doc(`users/${uid}`).update(firestoreUpdates);
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const error = err as { message?: string };
    console.error("Employee update error:", err);
    return NextResponse.json({ error: error?.message ?? "Update failed" }, { status: 500 });
  }
}

// DELETE — soft-delete: disable in Firebase Auth, mark in Firestore, keep attendance records
export async function DELETE(request: Request) {
  const cookieStore = await cookies();
  if (!verifyAdminSession(cookieStore)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { uid } = await request.json();
    if (!uid) return NextResponse.json({ error: "uid is required" }, { status: 400 });

    const app = getAdminApp();
    const adminAuth = getAuth(app);
    const adminDb = getFirestore(app);

    // Disable the user in Firebase Auth (does NOT delete attendance records)
    await adminAuth.updateUser(uid, { disabled: true });
    // Mark as deleted in Firestore user profile
    await adminDb.doc(`users/${uid}`).update({
      deleted: true,
      deletedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const error = err as { message?: string };
    console.error("Employee delete error:", err);
    return NextResponse.json({ error: error?.message ?? "Delete failed" }, { status: 500 });
  }
}
