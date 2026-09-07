import Link from "next/link";
import { BrandMark } from "@/components/brand/brand-mark";

export function StoreFooter() {
  return (
    <footer className="border-line mt-14 border-t sm:mt-24">
      <div className="namou-container grid gap-10 py-10 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <BrandMark className="text-xl" />
          <p className="text-subtle mt-3 max-w-sm text-sm">
            Technical fashion and modular objects made for everyday movement.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-8 gap-y-3 font-mono text-[10px] uppercase">
          <Link href="/shop">Shop</Link>
          <Link href="/drops">Drops</Link>
          <Link href="/categories">Categories</Link>
          <Link href="/account">Account</Link>
          <Link href="/orders">Orders</Link>
          <Link href="/admin">Admin</Link>
        </div>
      </div>
      <div className="border-line text-subtle border-t py-3 text-center font-mono text-[9px] uppercase">
        Namou / Adapt · Protect · Move
      </div>
    </footer>
  );
}
