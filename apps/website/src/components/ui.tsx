import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Check } from "lucide-react";
import { MarketingArt } from "./marketing-art";
export function Brand({ dark = false }: { dark?: boolean }) {
  return (
    <Link href="/" className={`brand ${dark ? "brand-dark" : ""}`}>
      <Image
        src="/brand/WithYou_logo.png"
        alt=""
        width={72}
        height={48}
        sizes="52px"
      />
      <span>
        With<span className="brand-you">You</span>
        <small>CONNECTED CARE</small>
      </span>
    </Link>
  );
}
export function ButtonLink({
  href,
  children,
  secondary = false,
}: {
  href: string;
  children: React.ReactNode;
  secondary?: boolean;
}) {
  return (
    <Link
      className={`button ${secondary ? "button-secondary" : ""}`}
      href={href}
    >
      {children}
      <ArrowUpRight size={18} />
    </Link>
  );
}
export function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "success" | "warning";
}) {
  return (
    <span className={`badge badge-${tone}`}>
      {tone === "success" && <Check size={12} />} {children}
    </span>
  );
}
export function PatientArtwork({ compact = false }: { compact?: boolean }) {
  return (
    <MarketingArt
      asset="patient"
      className={
        compact ? "standalone-patient-art compact" : "standalone-patient-art"
      }
    />
  );
}
export function EnterpriseArtwork({
  audience = "Doctors",
}: {
  audience?: string;
}) {
  return (
    <MarketingArt
      asset={audience === "Hospitals" ? "hospital" : "doctor"}
      className="standalone-enterprise-art"
    />
  );
}
