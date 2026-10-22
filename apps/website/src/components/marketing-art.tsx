import Image from "next/image";
import type { CSSProperties } from "react";
import hero from "../../public/images/generated/hero-connected-care.png";
import enterprise from "../../public/images/generated/enterprise-clinician.png";
import care from "../../public/images/generated/care-at-home.png";
import workflow from "../../public/images/generated/report-to-daily-care-v2.png";
import doctor from "../../public/images/generated/showcase-doctor.png";
import hospital from "../../public/images/generated/showcase-hospital.png";
import patient from "../../public/images/generated/showcase-patient.png";

const artworks = {
  hero: {
    image: hero,
    alt: "Illustration of a WithYou clinical report on a laptop connected to a patient care timeline on a phone.",
  },
  enterprise: {
    image: enterprise,
    alt: "Illustrative Indian clinician reviewing a digital care plan on a laptop.",
  },
  care: {
    image: care,
    alt: "Illustrative older Indian patient and her daughter viewing a care schedule together at home.",
  },
  workflow: {
    image: workflow,
    alt: "Illustration of a clinician-reviewed report beside a phone showing daily care tasks and follow-up.",
  },
  doctor: {
    image: doctor,
    alt: "Illustrative clinical review screen with original report, proposed tasks, clarification and approval states.",
  },
  hospital: {
    image: hospital,
    alt: "Illustrative receptionist and doctor reviewing a patient queue together.",
  },
  patient: {
    image: patient,
    alt: "Illustrative patient holding a phone with a daily care timeline at home.",
  },
};
export type ArtworkName = keyof typeof artworks;
export function MarketingArt({
  asset,
  className = "",
  preload = false,
}: {
  asset: ArtworkName;
  className?: string;
  preload?: boolean;
}) {
  const art = artworks[asset];
  return (
    <div
      className={`marketing-art ${className}`}
      data-artwork={asset}
      style={
        {
          "--art-ratio": `${art.image.width} / ${art.image.height}`,
        } as CSSProperties
      }
    >
      <Image
        src={art.image}
        alt={art.alt}
        fill
        sizes={
          preload
            ? "(max-width: 900px) 100vw, 650px"
            : "(max-width: 600px) 100vw, (max-width: 900px) 80vw, 1200px"
        }
        preload={preload}
        placeholder="blur"
        style={{ objectFit: "cover" }}
      />
    </div>
  );
}
