import { Suspense } from "react";
import { AcceptInvitation } from "@/components/care";
export default function Page() {
  return (
    <Suspense fallback={<p>Loading invitation…</p>}>
      <AcceptInvitation />
    </Suspense>
  );
}
