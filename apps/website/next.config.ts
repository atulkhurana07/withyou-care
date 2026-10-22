import type { NextConfig } from "next";
if (
  (process.env.APP_ENV === "production" ||
    process.env.VERCEL_ENV === "production") &&
  (process.env.FIREBASE_MODE !== "cloud" ||
    process.env.DEVELOPMENT_CHECKOUT === "true" ||
    process.env.EMAIL_MODE === "local")
) {
  throw new Error(
    "Production requires Firebase Cloud, live email configuration and development checkout disabled. Run the production configuration check before deployment.",
  );
}
const config: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "no-referrer" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
    ];
  },
};
export default config;
