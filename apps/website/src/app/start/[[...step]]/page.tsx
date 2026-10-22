import { Suspense } from "react";
import Onboarding from "@/components/onboarding";
export default function Page() {
  return (
    <Suspense fallback={<p>Loading setup…</p>}>
      <Onboarding />
    </Suspense>
  );
}
