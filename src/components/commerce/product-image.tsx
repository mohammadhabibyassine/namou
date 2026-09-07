"use client";

import Image from "next/image";
import { useState } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { cn } from "@/lib/utils/cn";

export function ProductImage({
  src,
  alt,
  className,
  priority,
  sizes,
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes: string;
}) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <>
      {isLoading ? (
        <div className="bg-background/55 absolute inset-0 z-10 grid place-items-center backdrop-blur-[2px]">
          <LoadingSpinner
            size="lg"
            label={`Loading ${alt}`}
            className="text-signal"
          />
        </div>
      ) : null}
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        onLoad={() => setIsLoading(false)}
        onError={() => setIsLoading(false)}
        className={cn(
          "object-cover transition-[opacity,transform] duration-300",
          isLoading ? "opacity-0" : "opacity-100",
          className,
        )}
      />
    </>
  );
}
