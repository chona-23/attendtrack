import { authenticator } from "otplib";

// Allow ±1 period (30s) clock drift tolerance
authenticator.options = { window: 1 };

/**
 * Generate a new TOTP secret (base32 encoded).
 * Called once during 2FA setup.
 */
export function generateTOTPSecret(): string {
  return authenticator.generateSecret();
}

/**
 * Build a standard otpauth:// URI for QR code display.
 * Compatible with Microsoft Authenticator, Google Authenticator, Authy, 1Password, etc.
 * Uses a single-word issuer ("AttendTrack") to prevent Microsoft Authenticator URL encoding issues.
 */
export function buildOTPAuthURI(
  secret: string,
  email: string,
  issuer = "AttendTrack"
): string {
  const cleanIssuer = issuer.replace(/\s+/g, "");
  return authenticator.keyuri(email, cleanIssuer, secret);
}

/**
 * Verify a 6-digit TOTP token client-side.
 * NOTE: For setup verification only — subsequent logins are verified server-side.
 */
export function verifyTOTPClient(token: string, secret: string): boolean {
  try {
    // Tolerant window: 2 checks [-2, -1, 0, +1, +2] (±60 seconds) to tolerate phone clock drift
    authenticator.options = { window: 2 };
    return authenticator.verify({ token, secret });
  } catch {
    return false;
  }
}
