import { useEffect, useState } from "react";
import {
  Edit,
  Trash2,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  RefreshCw,
  Check,
  Loader2,
} from "lucide-react";
import Eye from "../../icons/Button icons/Frame 362.png";
import Pagination from "./Pagination";

const Table = ({
  data,
  columns,
  onEdit,
  onDelete,
  onReset,
  OnEye,
  showActions = true,
  hoverEffect = true,
  tableClass = "",
  rowSpacing = "py-1",
  headerBgColor = "bg-[#D7F4FF]",
  itemsPerPage = 5,
  showReset = true,
  cellFontSize = "text-xs lg:text-sm xl:text-base",
  sortedColumn,
  sortDirection,
  handleSort,
  resetLoadingEmail,
  resetSuccessEmail,
  isClients = false,
}) => {
  const [currentData, setCurrentData] = useState([]);

  useEffect(() => {
    setCurrentData(data.slice(0, itemsPerPage));
  }, [data, itemsPerPage]);

  return (
    <div className="flex flex-col h-full ">
      <div className="flex-grow overflow-auto">
        <table
          className={`w-full ${tableClass} border-separate border-spacing-y-2`}
        >
          <thead>
            <tr>
              {columns.map((column, colIndex) => {
                const isSorted = sortedColumn === column.key;
                return (
                  <th
                    key={column.key}
                    onClick={() => handleSort(column.key)}
                    className={`sticky top-0 z-[1] px-3 py-4 text-left text-sm font-bold text-black cursor-pointer select-none ${headerBgColor} ${
                      colIndex === 0 ? "rounded-l-2xl" : ""
                    } ${
                      colIndex === columns.length - 1 && !showActions
                        ? "rounded-r-2xl"
                        : ""
                    }`}
                  >
                    <div className="inline-flex items-center justify-start gap-1 whitespace-nowrap">
                      <span className="leading-none">{column.title}</span>
                      <span className="leading-none shrink-0">
                        {isSorted ? (
                          sortDirection === "asc" ? (
                            <ArrowUp size={14} />
                          ) : (
                            <ArrowDown size={14} />
                          )
                        ) : (
                          <ArrowUpDown size={14} />
                        )}
                      </span>
                    </div>
                  </th>
                );
              })}
              {showActions && (
                <th
                  className={`sticky top-0 z-[1] px-3 py-2 text-left text-sm font-bold text-black rounded-r-2xl ${headerBgColor}`}
                >
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {currentData.map((item) => (
              <tr
                key={item.id || item.email}
                className={`border shadow-2xs transition-all ${
                  hoverEffect ? "hover:bg-sky-50" : ""
                }`}
                style={{ backgroundColor: "white" }}
              >
                {columns.map((column, colIndex) => (
                  <td
                    key={column.key}
                    className={`px-3 ${rowSpacing} ${cellFontSize} text-black align-middle lg:font-normal ${
                      colIndex === 0 ? "rounded-l-2xl" : ""
                    } ${
                      colIndex === columns.length - 1 && !showActions
                        ? "rounded-r-2xl"
                        : ""
                    }`}
                  >
                    {item[column.key]}
                  </td>
                ))}
                {showActions && (
                  <td className={`px-3 ${rowSpacing} rounded-r-2xl`}>
                    <div className="flex items-center space-x-3">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(item)}
                          className="flex flex-col items-center cursor-pointer space-y-1 p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit size={16} />
                          <span className="text-xs">Edit</span>
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(item)}
                          className="flex flex-col items-center cursor-pointer space-y-1 p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                          <span className="text-xs">Delete</span>
                        </button>
                      )}
                      {!isClients && showReset && onReset && localStorage.getItem("company")==="vkl" && (
                        <button
                          onClick={() => onReset(item.email)}
                          type="button"
                          disabled={resetLoadingEmail === item.email}
                          className={`flex flex-col items-center cursor-pointer space-y-1 p-2 rounded transition-colors
                            ${
                              resetSuccessEmail === item.email
                                ? "text-green-600 hover:text-green-700 hover:bg-green-50"
                                : "text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50"
                            }
                            ${
                              resetLoadingEmail === item.email
                                ? "opacity-60 cursor-not-allowed"
                                : ""
                            }`}
                          title={
                            resetLoadingEmail === item.email
                              ? "Sending reset link..."
                              : resetSuccessEmail === item.email
                              ? "Reset link sent"
                              : "Reset Password"
                          }
                          aria-busy={resetLoadingEmail === item.email}
                        >
                          {resetLoadingEmail === item.email ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : resetSuccessEmail === item.email ? (
                            <Check size={16} />
                          ) : (
                            <RefreshCw size={16} />
                          )}
                          <span className="text-xs">
                            {resetLoadingEmail === item.email
                              ? "Sending…"
                              : resetSuccessEmail === item.email
                              ? "Sent"
                              : "Reset"}
                          </span>
                        </button>
                      )}
                      {OnEye && (
                        <button
                          onClick={() => OnEye(item.id)}
                          className="flex flex-col items-center cursor-pointer space-y-1 p-2 py-4 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors"
                          title="View"
                        >
                          <img src={Eye} alt="View" className="h-[20px]" />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex-shrink-0">
        <Pagination
          data={data}
          itemsPerPage={itemsPerPage}
          setCurrentData={setCurrentData}
        />
      </div>
    </div>
  );
};

export default Table;
