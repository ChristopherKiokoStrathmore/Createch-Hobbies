"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function PendingPoller({ orderId }: { orderId: string }) {
  const router = useRouter();

  useEffect(() => {
    const id = setInterval(() => router.refresh(), 5000);
    return () => clearInterval(id);
  }, [router]);

  return (
    <div className="flex items-center justify-center gap-2 text-white/40 font-inter text-xs">
      <Loader2 size={14} className="animate-spin" />
      Checking payment status…
    </div>
  );
}
