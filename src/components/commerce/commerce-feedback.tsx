"use client";

import { useEffect, useState } from "react";
import { Check, ShoppingBag, TriangleAlert } from "lucide-react";
import {
  commerceFeedbackEvent,
  type CommerceFeedbackDetail,
} from "@/lib/commerce/feedback";
import { cn } from "@/lib/utils/cn";

export function CommerceFeedback() {
  const [feedback, setFeedback] = useState<
    (CommerceFeedbackDetail & { id: number }) | null
  >(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    function receive(event: Event) {
      const detail = (event as CustomEvent<CommerceFeedbackDetail>).detail;
      setFeedback({ ...detail, id: Date.now() });
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => setFeedback(null), 3200);
    }
    window.addEventListener(commerceFeedbackEvent, receive);
    return () => {
      window.removeEventListener(commerceFeedbackEvent, receive);
      if (timer) clearTimeout(timer);
    };
  }, []);

  return (
    <div
      className={cn(
        "pointer-events-none fixed top-20 right-4 z-[90] w-[min(24rem,calc(100vw-2rem))] transition-all duration-300 sm:top-24 sm:right-8",
        feedback ? "translate-y-0 opacity-100" : "-translate-y-3 opacity-0",
      )}
      aria-live="polite"
      aria-atomic="true"
    >
      {feedback ? (
        <div
          key={feedback.id}
          className={cn(
            "grid grid-cols-[2.75rem_1fr] overflow-hidden rounded-xl border shadow-[0_18px_60px_rgb(0_0_0/.22)]",
            feedback.tone === "error"
              ? "border-red-300 bg-[#291513] text-white"
              : "bg-ink border-white/10 text-white",
          )}
          role={feedback.tone === "error" ? "alert" : "status"}
        >
          <div className="bg-acid text-ink grid place-items-center">
            {feedback.tone === "error" ? (
              <TriangleAlert size={17} />
            ) : feedback.target === "cart" ? (
              <ShoppingBag size={17} />
            ) : (
              <Check size={17} />
            )}
          </div>
          <div className="p-3">
            <p className="font-mono text-[10px] font-semibold uppercase">
              {feedback.message}
            </p>
            {feedback.detail ? (
              <p className="mt-1 text-xs text-white/55">{feedback.detail}</p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
