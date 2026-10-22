import { Suspense } from "react";
import Join from "@/components/join";
export default function Page() {
  return (
    <Suspense fallback={<p>Loading invitation…</p>}>
      <Join />
    </Suspense>
  );
}
