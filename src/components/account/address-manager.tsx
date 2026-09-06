"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { MapPin, Pencil, Plus, Trash2, X } from "lucide-react";
import { AccountTabs } from "@/components/account/account-tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  useCreateAddress,
  useDeleteAddress,
  useUpdateAddress,
  useUserAddresses,
} from "@/hooks/users";
import type { CreateAddressDto, UserAddress } from "@/types/api";

const schema = z.object({
  label: z
    .string()
    .trim()
    .max(50)
    .transform((value) => value || null),
  recipientName: z.string().trim().min(1).max(200),
  addressLine1: z.string().trim().min(1).max(255),
  addressLine2: z
    .string()
    .trim()
    .max(255)
    .transform((value) => value || null),
  city: z.string().trim().min(1).max(100),
  state: z
    .string()
    .trim()
    .max(100)
    .transform((value) => value || null),
  postalCode: z.string().trim().min(1).max(20),
  countryCode: z
    .string()
    .trim()
    .length(2)
    .transform((value) => value.toUpperCase()),
  phone: z
    .string()
    .trim()
    .max(32)
    .transform((value) => value || null),
  isDefault: z.boolean(),
});
type FormValues = z.input<typeof schema>;
type FormOutput = z.output<typeof schema>;
const defaults: FormValues = {
  label: "",
  recipientName: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  countryCode: "LB",
  phone: "",
  isDefault: false,
};

function AddressForm({
  address,
  onClose,
}: {
  address: UserAddress | null;
  onClose: () => void;
}) {
  const form = useForm<FormValues, unknown, FormOutput>({
    resolver: zodResolver(schema),
    defaultValues: defaults,
  });
  useEffect(() => {
    form.reset(
      address
        ? {
            label: address.label ?? "",
            recipientName: address.recipientName,
            addressLine1: address.addressLine1,
            addressLine2: address.addressLine2 ?? "",
            city: address.city,
            state: address.state ?? "",
            postalCode: address.postalCode,
            countryCode: address.countryCode,
            phone: address.phone ?? "",
            isDefault: address.isDefault,
          }
        : defaults,
    );
  }, [address, form]);
  const create = useCreateAddress();
  const update = useUpdateAddress();
  const savePending = create.isPending || update.isPending;
  const saveError = create.error ?? update.error;

  function save(values: CreateAddressDto) {
    if (address) {
      update.mutate(
        { addressId: address.id, input: values },
        { onSuccess: onClose },
      );
      return;
    }
    create.mutate(values, { onSuccess: onClose });
  }
  return (
    <section className="hairline-panel p-5 sm:p-7">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="technical-label text-subtle">Address editor</p>
          <h2 className="display-title mt-2 text-4xl">
            {address ? "Edit location" : "Add location"}
          </h2>
        </div>
        <button
          onClick={onClose}
          className="hover:bg-muted grid size-10 place-items-center rounded-full"
          aria-label="Close address editor"
        >
          <X size={17} />
        </button>
      </div>
      <form
        className="grid gap-4 sm:grid-cols-2"
        onSubmit={form.handleSubmit(save)}
      >
        <Field>
          <FieldLabel htmlFor="label" className="technical-label">
            Label
          </FieldLabel>
          <Input id="label" placeholder="Home" {...form.register("label")} />
        </Field>
        <Field>
          <FieldLabel htmlFor="recipient" className="technical-label">
            Recipient
          </FieldLabel>
          <Input
            id="recipient"
            autoComplete="name"
            {...form.register("recipientName")}
          />
          <FieldError>
            {form.formState.errors.recipientName?.message}
          </FieldError>
        </Field>
        <Field className="sm:col-span-2">
          <FieldLabel htmlFor="line1" className="technical-label">
            Address line 1
          </FieldLabel>
          <Input
            id="line1"
            autoComplete="address-line1"
            {...form.register("addressLine1")}
          />
          <FieldError>{form.formState.errors.addressLine1?.message}</FieldError>
        </Field>
        <Field className="sm:col-span-2">
          <FieldLabel htmlFor="line2" className="technical-label">
            Address line 2
          </FieldLabel>
          <Input
            id="line2"
            autoComplete="address-line2"
            {...form.register("addressLine2")}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="city" className="technical-label">
            City
          </FieldLabel>
          <Input
            id="city"
            autoComplete="address-level2"
            {...form.register("city")}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="state" className="technical-label">
            State / region
          </FieldLabel>
          <Input
            id="state"
            autoComplete="address-level1"
            {...form.register("state")}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="postal" className="technical-label">
            Postal code
          </FieldLabel>
          <Input
            id="postal"
            autoComplete="postal-code"
            {...form.register("postalCode")}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="country" className="technical-label">
            Country code
          </FieldLabel>
          <Input
            id="country"
            autoComplete="country"
            maxLength={2}
            pattern="[A-Za-z]{2}"
            {...form.register("countryCode")}
          />
        </Field>
        <Field className="sm:col-span-2">
          <FieldLabel htmlFor="address-phone" className="technical-label">
            Phone
          </FieldLabel>
          <Input
            id="address-phone"
            type="tel"
            autoComplete="tel"
            {...form.register("phone")}
          />
        </Field>
        <label className="flex items-center gap-3 font-mono text-[10px] uppercase sm:col-span-2">
          <Checkbox {...form.register("isDefault")} /> Use as default address
        </label>
        {saveError ? (
          <p className="text-danger text-sm sm:col-span-2">
            {saveError.message}
          </p>
        ) : null}
        <button
          disabled={savePending}
          className="bg-ink min-h-12 rounded-lg font-mono text-xs text-white uppercase sm:col-span-2"
        >
          {savePending ? "Saving…" : "Save address"}
        </button>
      </form>
    </section>
  );
}

export function AddressManager() {
  const [editing, setEditing] = useState<UserAddress | null | undefined>(
    undefined,
  );
  const query = useUserAddresses();
  const remove = useDeleteAddress();
  return (
    <div className="namou-container py-7 sm:py-10">
      <p className="technical-label text-subtle">Account / Delivery system</p>
      <h1 className="display-title mt-2 text-7xl sm:text-9xl">Addresses</h1>
      <div className="mt-7">
        <AccountTabs />
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_.9fr]">
        <section>
          <div className="flex items-center justify-between">
            <h2 className="technical-label">
              Saved locations / {query.data?.length ?? 0}
            </h2>
            <button
              onClick={() => setEditing(null)}
              className="bg-ink inline-flex min-h-10 items-center gap-3 rounded-lg px-4 font-mono text-[10px] text-white uppercase"
            >
              <Plus size={14} /> Add address
            </button>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {query.isPending ? (
              <div className="bg-muted h-56 animate-pulse rounded-xl sm:col-span-2" />
            ) : query.data?.length ? (
              query.data.map((address) => (
                <article key={address.id} className="hairline-panel p-5">
                  <div className="flex items-start justify-between">
                    <MapPin size={18} />
                    <div className="flex gap-1">
                      <button
                        onClick={() => setEditing(address)}
                        className="grid size-9 place-items-center"
                        aria-label={`Edit ${address.label ?? "address"}`}
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => remove.mutate(address.id)}
                        className="text-danger grid size-9 place-items-center"
                        aria-label={`Delete ${address.label ?? "address"}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="mt-5 flex items-center gap-2">
                    <h3 className="font-mono text-xs font-semibold uppercase">
                      {address.label ?? "Address"}
                    </h3>
                    {address.isDefault ? (
                      <span className="bg-acid rounded px-2 py-1 font-mono text-[8px] uppercase">
                        Default
                      </span>
                    ) : null}
                  </div>
                  <p className="text-subtle mt-3 text-sm leading-6">
                    {address.recipientName}
                    <br />
                    {address.addressLine1}
                    {address.addressLine2 ? (
                      <>
                        <br />
                        {address.addressLine2}
                      </>
                    ) : null}
                    <br />
                    {address.city}
                    {address.state ? `, ${address.state}` : ""}{" "}
                    {address.postalCode}
                    <br />
                    {address.countryCode}
                  </p>
                </article>
              ))
            ) : (
              <div className="hairline-panel p-8 text-center sm:col-span-2">
                <p className="display-title text-4xl">No saved locations.</p>
                <p className="text-subtle mt-2 text-sm">
                  Add an address before checkout.
                </p>
              </div>
            )}
          </div>
        </section>
        {editing !== undefined ? (
          <AddressForm
            address={editing}
            onClose={() => setEditing(undefined)}
          />
        ) : (
          <aside className="hairline-panel technical-grid hidden min-h-96 place-items-center lg:grid">
            <div className="text-center">
              <MapPin
                className="text-acid mx-auto"
                size={32}
                fill="currentColor"
              />
              <p className="display-title mt-5 text-5xl">Ready to move.</p>
              <p className="text-subtle mt-2 font-mono text-[9px] uppercase">
                Select a location to edit
              </p>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
