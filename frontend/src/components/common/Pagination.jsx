import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MoreHorizontal } from "lucide-react";

const getPageNumbers = (currentPage, totalPages, maxVisible = 5) => {
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const half = Math.floor(maxVisible / 2);
  let start = currentPage - half;
  let end = currentPage + half;

  if (start < 1) {
    start = 1;
    end = maxVisible;
  }

  if (end > totalPages) {
    end = totalPages;
    start = totalPages - maxVisible + 1;
  }

  const pages = [];

  if (start > 1) {
    pages.push(1);
    if (start > 2) pages.push("...");
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (end < totalPages) {
    if (end < totalPages - 1) pages.push("...");
    pages.push(totalPages);
  }

  return pages;
};

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  showInfo = true,
  showFirstLast = true,
  maxVisible = 5,
  size = "md",
  className = "",
}) => {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(currentPage, totalPages, maxVisible);

  const from = (currentPage - 1) * itemsPerPage + 1;
  const to = Math.min(currentPage * itemsPerPage, totalItems);

  const SIZE = {
    sm: {
      btn: "w-7 h-7 text-xs",
      text: "text-xs",
    },
    md: {
      btn: "w-9 h-9 text-sm",
      text: "text-sm",
    },
    lg: {
      btn: "w-11 h-11 text-base",
      text: "text-base",
    },
  };

  const s = SIZE[size] || SIZE.md;

  const PageBtn = ({ page, active, disabled, onClick, children, title }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`
        ${s.btn}
        flex items-center justify-center rounded-xl font-medium
        transition-all duration-200 flex-shrink-0
        ${active
          ? "bg-blue-600 text-white shadow-md shadow-blue-200"
          : disabled
          ? "text-gray-300 cursor-not-allowed bg-transparent"
          : "text-gray-600 hover:bg-blue-50 hover:text-blue-600 bg-white border border-gray-200"
        }
      `}
    >
      {children}
    </button>
  );

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}>

      {/* Info */}
      {showInfo && totalItems && itemsPerPage && (
        <p className={`${s.text} text-gray-500 flex-shrink-0`}>
          Showing{" "}
          <span className="font-semibold text-gray-700">{from}</span>
          {" "}to{" "}
          <span className="font-semibold text-gray-700">{to}</span>
          {" "}of{" "}
          <span className="font-semibold text-gray-700">{totalItems}</span>
          {" "}results
        </p>
      )}

      {/* Buttons */}
      <div className="flex items-center gap-1.5">

        {/* First */}
        {showFirstLast && (
          <PageBtn
            disabled={currentPage === 1}
            onClick={() => onPageChange(1)}
            title="First page"
          >
            <ChevronsLeft size={size === "sm" ? 13 : size === "lg" ? 17 : 15} />
          </PageBtn>
        )}

        {/* Prev */}
        <PageBtn
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          title="Previous page"
        >
          <ChevronLeft size={size === "sm" ? 13 : size === "lg" ? 17 : 15} />
        </PageBtn>

        {/* Page numbers */}
        {pages.map((page, i) =>
          page === "..." ? (
            <div
              key={`dots-${i}`}
              className={`${s.btn} flex items-center justify-center text-gray-400`}
            >
              <MoreHorizontal size={14} />
            </div>
          ) : (
            <PageBtn
              key={page}
              page={page}
              active={page === currentPage}
              onClick={() => onPageChange(page)}
              title={`Page ${page}`}
            >
              {page}
            </PageBtn>
          )
        )}

        {/* Next */}
        <PageBtn
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          title="Next page"
        >
          <ChevronRight size={size === "sm" ? 13 : size === "lg" ? 17 : 15} />
        </PageBtn>

        {/* Last */}
        {showFirstLast && (
          <PageBtn
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(totalPages)}
            title="Last page"
          >
            <ChevronsRight size={size === "sm" ? 13 : size === "lg" ? 17 : 15} />
          </PageBtn>
        )}
      </div>
    </div>
  );
};

export const SimplePagination = ({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className={`flex items-center justify-between gap-4 ${className}`}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        <ChevronLeft size={16} />
        Previous
      </button>

      <span className="text-sm text-gray-500">
        Page{" "}
        <span className="font-semibold text-gray-800">{currentPage}</span>
        {" "}of{" "}
        <span className="font-semibold text-gray-800">{totalPages}</span>
      </span>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        Next
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

export const LoadMoreButton = ({
  onClick,
  loading = false,
  hasMore = true,
  loadedCount,
  totalCount,
  className = "",
}) => {
  if (!hasMore) {
    return (
      <div className={`text-center py-6 ${className}`}>
        <div className="inline-flex items-center gap-2 text-sm text-gray-400">
          <div className="h-px w-12 bg-gray-200" />
          <span>All {totalCount} results loaded</span>
          <div className="h-px w-12 bg-gray-200" />
        </div>
      </div>
    );
  }

  return (
    <div className={`text-center py-4 ${className}`}>
      {loadedCount && totalCount && (
        <p className="text-xs text-gray-400 mb-3">
          Showing {loadedCount} of {totalCount} results
        </p>
      )}
      <button
        onClick={onClick}
        disabled={loading}
        className="inline-flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 text-sm font-semibold text-gray-700 rounded-xl hover:bg-gray-50 hover:border-blue-300 hover:text-blue-600 disabled:opacity-50 transition-all duration-200 shadow-sm"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Loading...
          </>
        ) : (
          <>
            Load more
            <ChevronRight size={15} />
          </>
        )}
      </button>
    </div>
  );
};

export const PageSizeSelector = ({
  pageSize,
  onPageSizeChange,
  options = [10, 20, 50, 100],
  className = "",
}) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-sm text-gray-500 flex-shrink-0">Show</span>
      <select
        value={pageSize}
        onChange={(e) => onPageSizeChange(Number(e.target.value))}
        className="text-sm border border-gray-200 rounded-xl px-3 py-1.5 bg-white text-gray-700 outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <span className="text-sm text-gray-500 flex-shrink-0">per page</span>
    </div>
  );
};

export const PaginationWithSize = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  className = "",
}) => {
  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}>
      <PageSizeSelector
        pageSize={pageSize}
        onPageSizeChange={(newSize) => {
          onPageSizeChange(newSize);
          onPageChange(1);
        }}
      />
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={pageSize}
        onPageChange={onPageChange}
        showInfo={false}
        showFirstLast={false}
      />
    </div>
  );
};

export default Pagination;