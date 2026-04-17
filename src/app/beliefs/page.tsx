import { Suspense } from "react";
import BeliefsContent from "./BeliefsContent";

export default function BeliefsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-[#4A5568] text-sm">Loading…</div>}>
      <BeliefsContent />
    </Suspense>
  );
}
