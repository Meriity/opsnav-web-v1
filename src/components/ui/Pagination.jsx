import { useEffect, useState, useRef } from "react";

export default function Pagination({ data, itemsPerPage = 5, setCurrentData }) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const pageRef = useRef(currentPage);

  useEffect(() => {
    const currentData = data.slice(startIndex, startIndex + itemsPerPage);
    setCurrentData(currentData);
  }, [startIndex, itemsPerPage, data]);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  useEffect(() => {
    pageRef.current = currentPage;
  }, [currentPage]);

  useEffect(() => {
    if (currentPage > Math.ceil(data.length / itemsPerPage)) {
      setCurrentPage(1);
    }
  }, [data]);

  const renderPageNumbers = () => {
    const pagesToShow = [1, 2, 3];
    const result = [];

    pagesToShow.forEach((page) => {
      if (page <= totalPages) {
        result.push(page);
      }
    });

    if (
      currentPage > 3 &&
      currentPage <= totalPages &&
      !result.includes(currentPage)
    ) {
      result.push("...");
      result.push(currentPage);
    }

    return result;
  };

  return (
    <div className="mt-4 flex justify-between items-center p-2">
      <span className="text-sm text-gray-600">
        Page {currentPage} of {totalPages}
      </span>
      <nav aria-label="Table pagination">
        <ul className="inline-flex text-sm">
          <li className="mx-1">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`flex items-center cursor-pointer justify-center px-3 h-8 rounded-lg border ${
                currentPage === 1
                  ? "bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white cursor-not-allowed"
                  : "bg-white text-black border-gray-300 hover:bg-gray-100"
              }`}
            >
              {"<"} Prev
            </button>
          </li>

          {renderPageNumbers().map((page, index) => (
            <li key={index} className="mx-1">
              {page === "..." ? (
                <span className="px-3 h-8 flex items-center justify-center text-gray-500">
                  ...
                </span>
              ) : (
                <button
                  onClick={() => handlePageChange(page)}
                  className={`flex items-center cursor-pointer justify-center px-3 h-8 rounded-lg border ${
                    currentPage === page
                      ? "bg-[#FB4A50]  text-white border-white hover:bg-red-600"
                      : "bg-white text-black border-gray-300 hover:bg-gray-100"
                  }`}
                  aria-current={currentPage === page ? "page" : undefined}
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
              className={`flex items-center cursor-pointer justify-center px-3 h-8 rounded-lg border ${
                currentPage === totalPages
                  ? "bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white cursor-not-allowed"
                  : "bg-white text-black border-gray-300 hover:bg-gray-100"
              }`}
            >
              Next {">"}
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}
