"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { AuthVisual } from "@/components/auth/auth-visual";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useRegisterMutation } from "@/features/auth/hooks";
import { registerSchema, type RegisterInput } from "@/features/auth/schemas";
import { safeRedirectPath } from "@/lib/navigation/safe-redirect";
import { extractErrorMessage } from "@/utils/errorHandler";

export function SignupForm({ nextPath }: { nextPath: string | undefined }) {
  const [showPassword, setShowPassword] = useState(false);
  const registerMutation = useRegisterMutation();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      phone: "",
    },
  });
  const destination = safeRedirectPath(nextPath, "/account");

  return (
    <div className="namou-container grid items-stretch gap-4 py-6 lg:min-h-[44rem] lg:grid-cols-[1fr_1.15fr]">
      <AuthVisual />
      <section className="hairline-panel flex flex-col justify-between p-7 sm:p-10 lg:p-12">
        <div className="flex items-start justify-between">
          <div>
            <p className="technical-label text-subtle">Identity / A-02</p>
            <h1 className="display-title mt-3 text-6xl sm:text-8xl">
              Create account
            </h1>
          </div>
          <span className="text-acid font-mono text-[9px]">02</span>
        </div>
        <form
          className="mt-8 grid gap-5 sm:grid-cols-2"
          onSubmit={handleSubmit(async (values) => {
            await registerMutation.mutateAsync(values);
            router.push(destination);
          })}
          noValidate
        >
          <Field className="sm:col-span-2">
            <FieldLabel htmlFor="signup-email" className="technical-label">
              Email
            </FieldLabel>
            <Input
              id="signup-email"
              type="email"
              autoComplete="email"
              invalid={Boolean(errors.email)}
              {...register("email")}
            />
            <FieldError>{errors.email?.message}</FieldError>
          </Field>
          <Field className="sm:col-span-2">
            <FieldLabel htmlFor="signup-password" className="technical-label">
              Password
            </FieldLabel>
            <div className="relative">
              <Input
                id="signup-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
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
            <FieldDescription className="text-xs">
              Use at least 15 characters.
            </FieldDescription>
            <FieldError>{errors.password?.message}</FieldError>
          </Field>
          <Field>
            <FieldLabel htmlFor="firstName" className="technical-label">
              First name
            </FieldLabel>
            <Input
              id="firstName"
              autoComplete="given-name"
              {...register("firstName")}
            />
            <FieldError>{errors.firstName?.message}</FieldError>
          </Field>
          <Field>
            <FieldLabel htmlFor="lastName" className="technical-label">
              Last name
            </FieldLabel>
            <Input
              id="lastName"
              autoComplete="family-name"
              {...register("lastName")}
            />
            <FieldError>{errors.lastName?.message}</FieldError>
          </Field>
          <Field className="sm:col-span-2">
            <FieldLabel htmlFor="phone" className="technical-label">
              Phone / optional
            </FieldLabel>
            <Input
              id="phone"
              type="tel"
              autoComplete="tel"
              {...register("phone")}
            />
            <FieldError>{errors.phone?.message}</FieldError>
          </Field>
          {registerMutation.error ? (
            <p
              className="text-danger rounded-lg bg-red-50 p-3 text-sm sm:col-span-2"
              role="alert"
            >
              {extractErrorMessage(registerMutation.error)}
            </p>
          ) : null}
          <button
            className="bg-acid flex min-h-12 items-center justify-between rounded-lg px-5 font-mono text-xs uppercase disabled:opacity-50 sm:col-span-2"
            disabled={registerMutation.isPending}
          >
            {registerMutation.isPending ? "Creating…" : "Create account"}
            <ArrowRight size={16} />
          </button>
        </form>
        <Link
          href={`/login${nextPath ? `?next=${encodeURIComponent(nextPath)}` : ""}`}
          className="mt-6 inline-flex items-center gap-3 font-mono text-[10px] uppercase"
        >
          <ArrowLeft size={15} /> Back to login
        </Link>
      </section>
    </div>
  );
}
