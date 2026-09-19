import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  // Required for Firebase Admin and otplib to work in Node.js runtime (not Edge)
  serverExternalPackages: ["otplib", "firebase-admin"],
  // Hide the Next.js development indicator ("N" badge) from overlapping the UI
  devIndicators: false,
};

export default nextConfig;
