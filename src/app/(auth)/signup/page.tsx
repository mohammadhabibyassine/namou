import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SignupForm } from "@/components/auth/signup-form";
import { getSession } from "@/lib/auth/session";
import { safeRedirectPath } from "@/lib/navigation/safe-redirect";

export const metadata: Metadata = {
  title: "Create account",
  robots: { index: false, follow: false },
};

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  if (await getSession()) redirect(safeRedirectPath(next, "/account"));
  return <SignupForm nextPath={next} />;
}
