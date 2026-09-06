export const commerceFeedbackEvent = "namou:commerce-feedback";

export interface CommerceFeedbackDetail {
  message: string;
  detail?: string;
  tone?: "success" | "error" | "neutral";
  target?: "cart" | "wishlist";
}

export function announceCommerceFeedback(detail: CommerceFeedbackDetail): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<CommerceFeedbackDetail>(commerceFeedbackEvent, {
      detail,
    }),
  );
}
