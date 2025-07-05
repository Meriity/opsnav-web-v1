import { useEffect, useState } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import Eye from "../../icons/Button icons/Frame 362.png"

const Table = ({
  data,
  columns,
  onEdit,
  onDelete,
  OnEye,
  showActions = true,
  hoverEffect = true,
  tableClass = '',
  rowSpacing = 'py-3',
  headerBgColor = 'bg-[#D7F4FF]',
  itemsPerPage = 5
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = data.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // 👇 Arrow key navigation support
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') {
        handlePageChange(currentPage + 1);
      } else if (e.key === 'ArrowLeft') {
        handlePageChange(currentPage - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, );

  return (
    <div>
      <div className="font-bold w-full"> 
        <div className="overflow-x-auto overflow-y-hidden w-full">
          <table className={`w-full ${tableClass} border-separate border-spacing-y-2`}>
            <thead>
              <tr className={`${headerBgColor}`}>
                {columns.map((column, colIndex) => (
                  <th
                    key={column.key}
                    className={`px-6 py-4 text-left text-sm font-bold text-black ${
                      colIndex === 0 ? 'rounded-l-2xl' : ''
                    } ${colIndex === columns.length - 1 && !showActions ? 'rounded-r-2xl' : ''}`}
                  >
                    {column.title}
                  </th>
                ))}
                {showActions && (
                  <th className="px-6 py-2 text-left text-sm font-bold text-black rounded-r-2xl">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {currentData.map((item) => (
                <tr
                  key={item.id}
                  className={`border transition-all ${hoverEffect ? 'hover:bg-sky-50' : ''}`}
                  style={{ backgroundColor: 'white' }}
                >
                  {columns.map((column, colIndex) => (
                    <td
                      key={column.key}
                      className={`px-6 ${rowSpacing} text-sm text-black align-middle ${
                        colIndex === 0 ? 'rounded-l-2xl' : ''
                      } ${colIndex === columns.length - 1 && !showActions ? 'rounded-r-2xl' : ''}`}
                    >
                      {item[column.key]}
                    </td>
                  ))}
                  {showActions && (
                    <td className={`px-6 ${rowSpacing} rounded-r-2xl`}>
                      <div className="flex items-center space-x-3">
                        {onEdit && (
                          <button
                            onClick={() => onEdit(item.id)}
                            className="flex flex-col items-center space-y-1 p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit size={16} />
                            <span className="text-xs">Edit</span>
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(item.id)}
                            className="flex flex-col items-center space-y-1 p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                            <span className="text-xs">Delete</span>
                          </button>
                        )}
                        <div className="flex items-center space-x-3">
                        {OnEye && (
                          <button
                            onClick={() => onEdit(item.id)}
                            className="flex flex-col items-center space-y-1 p-2 py-4 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors"
                            title="Edit"
                          >
                           <img src={Eye} alt="" className='h-[20px]' />
                            
                          </button>
                        )}
                      </div>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="absolute bottom-5 right-5 mt-4">
        <nav aria-label="Table pagination">
          <ul className="inline-flex text-sm">
            <li className="mx-1">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`flex items-center justify-center px-3 h-8 rounded-lg border ${
                  currentPage === 1
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-black border-gray-300 hover:bg-gray-100'
                }`}
              >
                {'<'}
              </button>
            </li>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <li key={page} className="mx-1">
                <button
                  onClick={() => handlePageChange(page)}
                  className={`flex items-center justify-center px-3 h-8 rounded-lg border ${
                    currentPage === page
                      ? 'bg-sky-500 text-white border-sky-500'
                      : 'bg-white text-black border-gray-300 hover:bg-gray-100'
                  }`}
                  aria-current={currentPage === page ? 'page' : undefined}
                >
                  {page}
                </button>
              </li>
            ))}

            <li className="mx-1">
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`flex items-center justify-center px-3 h-8 rounded-lg border ${
                  currentPage === totalPages
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-black border-gray-300 hover:bg-gray-100'
                }`}
              >
                {'>'}
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default Table;