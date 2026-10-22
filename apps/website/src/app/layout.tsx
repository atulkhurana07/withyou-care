import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
const manrope = localFont({
  src: "./fonts/Manrope.woff2",
  variable: "--font-manrope",
  display: "swap",
});
export const metadata: Metadata = {
  icons: { icon: "/_next/image?url=%2Fbrand%2FWithYou_logo.png&w=32&q=75" },
  title: "WithYou — From your doctor’s desk to your day",
  description:
    "Digital medical reports, clinician-approved care schedules and a connected patient experience. Explore WithYou Enterprise and WithYou Care.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className={manrope.variable}>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
