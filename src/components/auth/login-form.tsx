"use client";

import Link from "next/link";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { AuthVisual } from "@/components/auth/auth-visual";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { loginSchema, type LoginInput } from "@/features/auth/schemas";
import { useLoginMutation } from "@/features/auth/hooks";
import { safeRedirectPath } from "@/lib/navigation/safe-redirect";
import { extractErrorMessage } from "@/utils/errorHandler";

export function LoginForm({ nextPath }: { nextPath: string | undefined }) {
  const [showPassword, setShowPassword] = useState(false);
  const login = useLoginMutation();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });
  const destination = safeRedirectPath(nextPath, "/account");

  return (
    <div className="namou-container grid items-stretch gap-4 py-6 lg:min-h-[44rem] lg:grid-cols-[1.1fr_1fr]">
      <section className="hairline-panel flex flex-col justify-between p-7 sm:p-10 lg:p-12">
        <div>
          <div className="flex items-start justify-between">
            <div>
              <p className="technical-label text-subtle">
                Identity // Protocol A-01
              </p>
              <h1 className="display-title mt-3 text-6xl sm:text-7xl lg:text-8xl">
                Login
              </h1>
            </div>
            <span className="text-acid border-line bg-surface rounded border px-2 py-0.5 font-mono text-xs font-semibold">
              01
            </span>
          </div>

          <p className="text-subtle mt-3 max-w-md text-xs sm:text-sm">
            Sign in to access your orders, saved objects, and technical identity
            profile.
          </p>

          <form
            className="mt-10 space-y-5"
            onSubmit={handleSubmit(async (values) => {
              await login.mutateAsync(values);
              router.push(destination);
            })}
            noValidate
          >
            <Field>
              <FieldLabel htmlFor="email" className="technical-label">
                Email Address
              </FieldLabel>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="operative@namou.studio"
                invalid={Boolean(errors.email)}
                className="font-mono text-sm"
                {...register("email")}
              />
              <FieldError>{errors.email?.message}</FieldError>
            </Field>

            <Field>
              <FieldLabel htmlFor="password" className="technical-label">
                Password
              </FieldLabel>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  invalid={Boolean(errors.password)}
                  className="pr-12 font-mono text-sm"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="hover:text-foreground text-subtle absolute top-1 right-1 grid size-9 place-items-center transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <FieldError>{errors.password?.message}</FieldError>
            </Field>

            {login.error ? (
              <div
                className="text-danger rounded-xl border border-red-200 bg-red-500/10 p-4 font-mono text-xs"
                role="alert"
              >
                {extractErrorMessage(login.error)}
              </div>
            ) : null}

            <button
              className="bg-acid text-ink flex min-h-12 w-full items-center justify-between rounded-xl px-6 font-mono text-xs font-semibold uppercase transition-transform disabled:opacity-50 motion-safe:hover:scale-[1.02]"
              disabled={login.isPending}
            >
              <span>
                {login.isPending ? "Authenticating…" : "Sign In to System"}
              </span>
              <ArrowRight size={16} />
            </button>
          </form>
        </div>

        <div className="border-line mt-10 border-t pt-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-subtle font-mono text-[9px] tracking-wider uppercase">
                New to the system?
              </p>
              <p className="text-foreground font-mono text-xs font-medium">
                Create your Namou identity
              </p>
            </div>
            <Link
              href={`/signup${nextPath ? `?next=${encodeURIComponent(nextPath)}` : ""}`}
              className="border-line hover:border-foreground flex min-h-10 items-center justify-between gap-3 rounded-lg border px-4 font-mono text-[10px] uppercase transition-colors"
            >
              <span>Create Account</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      <AuthVisual />
    </div>
  );
}
