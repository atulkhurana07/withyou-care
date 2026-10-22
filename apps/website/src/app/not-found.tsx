import { Brand, ButtonLink } from "@/components/ui";
export default function NotFound() {
  return (
    <main id="main" className="page-shell">
      <Brand />
      <div className="page-title">
        <h1>Let’s get you back on track.</h1>
        <p>This page could not be found.</p>
      </div>
      <ButtonLink href="/">Return home</ButtonLink>
    </main>
  );
}
