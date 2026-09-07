"use client";

import { ArrowDown, Loader2 } from "lucide-react";

interface CursorPaginationProps {
  /** Total number of items loaded so far. */
  totalLoaded: number;
  /** Whether a next page is available from the backend. */
  hasNextPage: boolean;
  /** Whether the next page is currently being fetched. */
  isFetchingNextPage: boolean;
  /** Callback to trigger loading the next page. */
  onLoadMore: () => void;
  /** Optional noun for the counter label (default: "items"). */
  noun?: string;
}

/**
 * Shared cursor-pagination footer for admin list views.
 *
 * Shows a "Load more" button when more pages exist, a spinner while
 * fetching, and a subtle item count summary beneath.
 */
export function CursorPagination({
  totalLoaded,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  noun = "items",
}: CursorPaginationProps) {
  if (!hasNextPage && totalLoaded === 0) return null;

  return (
    <div className="mt-5 flex flex-col items-center gap-2">
      {hasNextPage ? (
        <button
          onClick={onLoadMore}
          disabled={isFetchingNextPage}
          className="border-line flex min-h-10 items-center gap-4 rounded-lg border px-6 font-mono text-[9px] uppercase disabled:opacity-50"
        >
          {isFetchingNextPage ? (
            <>
              Loading <Loader2 size={13} className="animate-spin" />
            </>
          ) : (
            <>
              Load more <ArrowDown size={13} />
            </>
          )}
        </button>
      ) : null}
      {totalLoaded > 0 ? (
        <p className="text-subtle font-mono text-[8px] uppercase">
          Showing {totalLoaded}{" "}
          {totalLoaded === 1 ? noun.replace(/s$/, "") : noun}
        </p>
      ) : null}
    </div>
  );
}
