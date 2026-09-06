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
    <div className="namou-container grid gap-3 py-4 lg:grid-cols-[1fr_.8fr_1fr]">
      <section className="hairline-panel flex min-h-[36rem] flex-col p-6 sm:p-9 lg:min-h-[42rem]">
        <div className="flex items-start justify-between">
          <div>
            <p className="technical-label text-subtle">Identity / A-01</p>
            <h1 className="display-title mt-3 text-7xl sm:text-8xl">Login</h1>
          </div>
          <span className="text-acid font-mono text-[9px]">01</span>
        </div>
        <form
          className="mt-12 space-y-5"
          onSubmit={handleSubmit(async (values) => {
            await login.mutateAsync(values);
            router.push(destination);
          })}
          noValidate
        >
          <Field>
            <FieldLabel htmlFor="email" className="technical-label">
              Email
            </FieldLabel>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="Enter your email"
              invalid={Boolean(errors.email)}
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
                placeholder="Enter your password"
                invalid={Boolean(errors.password)}
                className="pr-12"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute top-1 right-1 grid size-9 place-items-center"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <FieldError>{errors.password?.message}</FieldError>
          </Field>
          {login.error ? (
            <p
              className="text-danger rounded-lg bg-red-50 p-3 text-sm"
              role="alert"
            >
              {extractErrorMessage(login.error)}
            </p>
          ) : null}
          <button
            className="bg-acid flex min-h-12 w-full items-center justify-between rounded-lg px-5 font-mono text-xs uppercase transition-transform disabled:opacity-50 motion-safe:hover:scale-[1.025]"
            disabled={login.isPending}
          >
            {login.isPending ? "Entering…" : "Login"}
            <ArrowRight size={16} />
          </button>
        </form>
        <div className="border-line mt-auto border-t pt-6">
          <p className="text-subtle font-mono text-[9px] uppercase">
            New to the system?
          </p>
          <Link
            href={`/signup${nextPath ? `?next=${encodeURIComponent(nextPath)}` : ""}`}
            className="border-line mt-3 flex min-h-11 items-center justify-between rounded-lg border px-5 font-mono text-[10px] uppercase"
          >
            Create account <ArrowRight size={15} />
          </Link>
        </div>
      </section>
      <AuthVisual />
      <aside className="hairline-panel hidden min-h-[42rem] flex-col justify-between p-8 lg:flex">
        <div>
          <p className="technical-label text-subtle">Secure system</p>
          <p className="display-title mt-4 text-5xl">
            Your objects.
            <br />
            Your movement.
          </p>
        </div>
        <div className="technical-grid border-line grid aspect-square place-items-center rounded-full border">
          <span className="display-title text-6xl">N/02</span>
        </div>
        <p className="text-subtle text-sm leading-6">
          Sign in only when you are ready to check out, manage saved addresses,
          or track an order.
        </p>
      </aside>
    </div>
  );
}
