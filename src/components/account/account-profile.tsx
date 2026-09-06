"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AccountTabs } from "@/components/account/account-tabs";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useUpdateProfile, useUserProfile } from "@/hooks/users";

const profileSchema = z.object({
  firstName: z
    .string()
    .trim()
    .max(100)
    .transform((value) => value || null),
  lastName: z
    .string()
    .trim()
    .max(100)
    .transform((value) => value || null),
  phone: z
    .string()
    .trim()
    .max(32)
    .transform((value) => value || null),
});
type ProfileInput = z.input<typeof profileSchema>;
type ProfileOutput = z.output<typeof profileSchema>;

export function AccountProfile() {
  const profile = useUserProfile();
  const form = useForm<ProfileInput, unknown, ProfileOutput>({
    resolver: zodResolver(profileSchema),
    defaultValues: { firstName: "", lastName: "", phone: "" },
  });
  useEffect(() => {
    if (profile.data)
      form.reset({
        firstName: profile.data.firstName ?? "",
        lastName: profile.data.lastName ?? "",
        phone: profile.data.phone ?? "",
      });
  }, [form, profile.data]);
  const update = useUpdateProfile();

  return (
    <div className="namou-container py-7 sm:py-10">
      <p className="technical-label text-subtle">Identity / User system</p>
      <h1 className="display-title mt-2 text-7xl sm:text-9xl">Account</h1>
      <div className="mt-7">
        <AccountTabs />
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-[.85fr_1.15fr]">
        <section className="hairline-panel p-5 sm:p-7">
          <p className="technical-label mb-7">Profile</p>
          {profile.isPending ? (
            <div className="bg-muted h-64 animate-pulse rounded-lg" />
          ) : profile.isError || !profile.data ? (
            <p role="alert" className="text-danger text-sm">
              Profile information could not be loaded.
            </p>
          ) : (
            <form
              onSubmit={form.handleSubmit((values) =>
                update.mutate(values, {
                  onSuccess: (data) =>
                    form.reset({
                      firstName: data.firstName ?? "",
                      lastName: data.lastName ?? "",
                      phone: data.phone ?? "",
                    }),
                }),
              )}
              className="space-y-5"
            >
              <Field>
                <FieldLabel htmlFor="account-email" className="technical-label">
                  Email
                </FieldLabel>
                <Input id="account-email" value={profile.data.email} disabled />
              </Field>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field>
                  <FieldLabel
                    htmlFor="account-first"
                    className="technical-label"
                  >
                    First name
                  </FieldLabel>
                  <Input id="account-first" {...form.register("firstName")} />
                  <FieldError>
                    {form.formState.errors.firstName?.message}
                  </FieldError>
                </Field>
                <Field>
                  <FieldLabel
                    htmlFor="account-last"
                    className="technical-label"
                  >
                    Last name
                  </FieldLabel>
                  <Input id="account-last" {...form.register("lastName")} />
                  <FieldError>
                    {form.formState.errors.lastName?.message}
                  </FieldError>
                </Field>
              </div>
              <Field>
                <FieldLabel htmlFor="account-phone" className="technical-label">
                  Phone
                </FieldLabel>
                <Input
                  id="account-phone"
                  type="tel"
                  {...form.register("phone")}
                />
                <FieldError>{form.formState.errors.phone?.message}</FieldError>
              </Field>
              {update.error ? (
                <p role="alert" className="text-danger text-sm">
                  {update.error.message}
                </p>
              ) : null}
              {update.isSuccess && !form.formState.isDirty ? (
                <p role="status" className="font-mono text-[9px] uppercase">
                  Profile synchronized.
                </p>
              ) : null}
              <button
                disabled={update.isPending || !form.formState.isDirty}
                className="bg-ink min-h-12 w-full rounded-lg font-mono text-xs text-white uppercase disabled:opacity-40"
              >
                {update.isPending ? "Saving…" : "Save changes"}
              </button>
            </form>
          )}
        </section>
        <aside className="hairline-panel technical-grid flex min-h-80 flex-col justify-between p-6 sm:p-8">
          <div>
            <p className="technical-label text-subtle">
              Namou member / {profile.data?.role.name ?? "customer"}
            </p>
            <p className="display-title mt-4 text-5xl sm:text-7xl">
              Move as one system.
            </p>
          </div>
          <div className="border-line grid grid-cols-2 gap-3 border-t pt-5 font-mono text-[9px] uppercase">
            <div>
              <span className="text-subtle">Status</span>
              <p className="mt-1">
                <span className="text-acid mr-2">●</span>
                {profile.data?.isActive ? "Active" : "Unavailable"}
              </p>
            </div>
            <div>
              <span className="text-subtle">Member since</span>
              <p className="mt-1">
                {profile.data
                  ? new Intl.DateTimeFormat("en", {
                      month: "short",
                      year: "numeric",
                    }).format(new Date(profile.data.createdAt))
                  : "—"}
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
