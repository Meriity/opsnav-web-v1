import { useEffect, useState, useRef, useMemo } from "react";

export default function Pagination({ data, itemsPerPage = 5, setCurrentData }) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const pageRef = useRef(1);

  useEffect(() => {
    const currentData = data.slice(startIndex, startIndex + itemsPerPage);
    setCurrentData(currentData);
  }, [startIndex, itemsPerPage, data]);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [data, itemsPerPage, totalPages, currentPage]);

const pageNumbers = useMemo(() => {
    const range = [];
    const delta = 1;

    const left = Math.max(2, currentPage - delta);
    const right = Math.min(totalPages - 1, currentPage + delta);

    range.push(1);

    if (left > 2) range.push("...");

    for (let i = left; i <= right; i++) {
      range.push(i);
    }

    if (right < totalPages - 1) range.push("...");

    if (totalPages > 1) range.push(totalPages);

    return range;
  }, [currentPage, totalPages]);

  if (totalPages <= 1) return null;

  return (
  <div className="mt-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 px-2">
      <span className="text-sm text-gray-600 text-center sm:text-left">
        Page <span className="font-semibold">{currentPage}</span> of{" "}
        <span className="font-semibold">{totalPages}</span>
      </span>

      <nav aria-label="Pagination" className="flex justify-center">
        <ul className="inline-flex items-center gap-1 text-sm">
          <li className="mx-1">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
               className="px-3 h-9 rounded-lg border text-sm font-medium transition
              disabled:opacity-50 disabled:cursor-not-allowed
              bg-white hover:bg-gray-100"
            >
              {"<"} Prev
            </button>
          </li>

         {pageNumbers.map((page, index) => (
            <li key={index}>
              {page === "..." ? (
                <span className="px-2 text-gray-400 select-none">…</span>
              ) : (
                <button
                  onClick={() => handlePageChange(page)}
                  aria-current={page === currentPage ? "page" : undefined}
                  className={`min-w-[36px] h-9 rounded-lg border text-sm font-medium transition
                  ${
                    page === currentPage
                      ? "bg-[#FB4A50] text-white border-[#FB4A50]"
                      : "bg-white hover:bg-gray-100"
                  }`}
                >
                  {page}
                </button>
              )}
            </li>
          ))}

          <li className="mx-1">
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
             className="px-3 h-9 rounded-lg border text-sm font-medium transition
              disabled:opacity-50 disabled:cursor-not-allowed
              bg-white hover:bg-gray-100"
            >
              Next {">"}
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}
