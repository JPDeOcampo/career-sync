import { cn } from "@/utils/cn";
import { ChevronRight, ChevronLeft } from "lucide-react";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  limit?: number;
  siblingCount?: number;
  align?: "start" | "center" | "end";
};

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  onLimitChange,
  limit = 5,
  siblingCount = 1,
  align = "end",
}: PaginationProps) => {
  const range = (start: number, end: number) =>
    Array.from({ length: end - start + 1 }, (_, i) => start + i);

  const getPages = () => {
    const totalNumbers = siblingCount * 2 + 5;
    if (totalPages <= totalNumbers) return range(1, totalPages);

    const leftSibling = Math.max(currentPage - siblingCount, 1);
    const rightSibling = Math.min(currentPage + siblingCount, totalPages);
    const showLeftDots = leftSibling > 2;
    const showRightDots = rightSibling < totalPages - 1;

    const pages: (number | "LEFT_DOTS" | "RIGHT_DOTS")[] = [];

    if (!showLeftDots && showRightDots) {
      pages.push(...range(1, 3 + 2 * siblingCount));
      pages.push("RIGHT_DOTS");
      pages.push(totalPages);
    } else if (showLeftDots && !showRightDots) {
      pages.push(1);
      pages.push("LEFT_DOTS");
      pages.push(...range(totalPages - (3 + 2 * siblingCount) + 1, totalPages));
    } else if (showLeftDots && showRightDots) {
      pages.push(1);
      pages.push("LEFT_DOTS");
      pages.push(...range(leftSibling, rightSibling));
      pages.push("RIGHT_DOTS");
      pages.push(totalPages);
    }
    return pages;
  };

  const pages = getPages();

  const alignClasses = {
    start: "justify-center md:justify-start",
    center: "justify-center",
    end: "justify-center md:justify-end",
  };

  // Modern UI Classes with responsive sizes
  const btnBase =
    "h-8 w-8 sm:h-9 sm:w-9 inline-flex items-center justify-center rounded-md text-sm sm:text-base font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-40 disabled:pointer-events-none border border-transparent flex-shrink-0";
  const btnInactive =
    "text-default hover:bg-gray-100 dark:hover:text-gray-900 border-neutral-200 dark:border-neutral-600";
  const btnActive = "bg-blue-600 text-white shadow-sm hover:bg-blue-700";

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-4 py-4 px-2",
        alignClasses[align],
      )}
    >
      {/* Limit Selector */}
      {onLimitChange && (
        <div className="flex items-center gap-2 mr-auto text-muted-foreground">
          <p className="text-xs font-medium uppercase tracking-tighter opacity-70">
            Rows
          </p>
          <select
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="bg-transparent border border-neutral-200 dark:border-neutral-800 text-xs rounded-md px-1.5 py-1 outline-none focus:ring-1 focus:ring-blue-500"
          >
            {[5, 10, 20, 50].map((l) => (
              <option key={l} value={l} className="dark:bg-neutral-900">
                {l}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Navigation */}
      <nav
        className="flex items-center gap-1.5 flex-nowrap overflow-x-auto"
        aria-label="Pagination"
      >
        {/* Previous */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={cn(btnBase, btnInactive)}
          title="Previous Page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Page Numbers */}
        {pages.map((page, index) => {
          if (page === "LEFT_DOTS" || page === "RIGHT_DOTS") {
            return (
              <button
                key={index}
                onClick={() =>
                  onPageChange(
                    page === "LEFT_DOTS"
                      ? Math.max(currentPage - 3, 1)
                      : Math.min(currentPage + 3, totalPages),
                  )
                }
                className={cn(
                  btnBase,
                  "text-muted-foreground hover:text-foreground cursor-pointer border-none",
                )}
              >
                •••
              </button>
            );
          }

          return (
            <button
              key={index}
              onClick={() => onPageChange(page as number)}
              className={cn(
                btnBase,
                currentPage === page ? btnActive : btnInactive,
              )}
            >
              {page}
            </button>
          );
        })}

        {/* Next */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={cn(btnBase, btnInactive)}
          title="Next Page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </nav>
    </div>
  );
};

export default Pagination;
