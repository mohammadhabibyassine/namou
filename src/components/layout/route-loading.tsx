import { LoadingSpinner } from "@/components/ui/loading-spinner";

export function RouteLoading() {
  return (
    <main className="namou-container grid min-h-[70vh] place-items-center py-8">
      <LoadingSpinner size="lg" label="Loading page" className="text-signal" />
    </main>
  );
}
