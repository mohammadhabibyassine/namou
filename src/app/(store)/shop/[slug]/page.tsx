import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { ProductDetailView } from "@/components/product/product-detail-view";
import { catalogServerApi } from "@/features/catalog/api.server";
import { BackendError } from "@/lib/api/backend-error";

const getProduct = cache((slug: string) => catalogServerApi.product(slug));

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const product = await getProduct(slug);
    return {
      title: product.title,
      description:
        product.description ??
        `${product.title} by Namou. Technical objects made to move.`,
      openGraph: product.images[0]
        ? {
            images: [
              {
                url: product.images[0].imageUrl,
                alt: product.images[0].altText ?? product.title,
              },
            ],
          }
        : undefined,
    };
  } catch {
    return { title: "Product" };
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  let product;
  try {
    product = await getProduct(slug);
  } catch (error) {
    if (error instanceof BackendError && error.status === 404) notFound();
    throw error;
  }
  return <ProductDetailView product={product} />;
}
