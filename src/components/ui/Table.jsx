import { useEffect, useState } from "react";
import {
  Edit,
  Trash2,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  RefreshCw,
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
  cellFontSize = "text-xs lg:text-sm xl:text-base", // New prop with default value
}) => {
  const [currentData, setCurrentData] = useState([]);
  const [sortedColumn, setSortedColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  const handleSort = (columnKey) => {
    let direction = "asc";
    if (sortedColumn === columnKey && sortDirection === "asc") {
      direction = "desc";
    }

    const sorted = [...data].sort((a, b) => {
      const aVal = a[columnKey];
      const bVal = b[columnKey];

      if (typeof aVal === "string") {
        return direction === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      } else if (typeof aVal === "number" || aVal instanceof Date) {
        return direction === "asc" ? aVal - bVal : bVal - aVal;
      }

      return 0;
    });

    setSortedColumn(columnKey);
    setSortDirection(direction);
    setCurrentData(sorted.slice(0, itemsPerPage));
  };

  // Initial Pagination
  useEffect(() => {
    setCurrentData(data.slice(0, itemsPerPage));
  }, [data, itemsPerPage]);

  return (
    <div>
      <div className="font-bold w-full h-[70vh]">
        <div className="overflow-x-auto overflow-y-hidden w-full">
          <table
            className={`w-full ${tableClass} border-separate border-spacing-y-2`}
          >
            <thead>
              <tr className={`${headerBgColor}`}>
                {columns.map((column, colIndex) => {
                  const isSorted = sortedColumn === column.key;
                  return (
                    <th
                      key={column.key}
                      onClick={() => handleSort(column.key)}
                      className={`px-3 py-4 text-left text-sm font-bold text-black cursor-pointer select-none ${
                        colIndex === 0 ? "rounded-l-2xl" : ""
                      } ${
                        colIndex === columns.length - 1 && !showActions
                          ? "rounded-r-2xl"
                          : ""
                      }`}
                    >
                      <div className="flex items-center space-x-0">
                        <span>{column.title}</span>
                        {isSorted ? (
                          sortDirection === "asc" ? (
                            <ArrowUp size={16} />
                          ) : (
                            <ArrowDown size={16} />
                          )
                        ) : (
                          <ArrowUpDown size={16} />
                        )}
                      </div>
                    </th>
                  );
                })}
                {showActions && (
                  <th className="px-3 py-2 text-left text-sm font-bold text-black rounded-r-2xl">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {currentData.map((item) => (
                <tr
                  key={item.id}
                  className={`border shadow-2xs transition-all ${
                    hoverEffect ? "hover:bg-sky-50" : ""
                  }`}
                  style={{ backgroundColor: "white" }}
                >
                  {columns.map((column, colIndex) => (
                    <td
                      key={column.key}
                      className={`px-3 ${rowSpacing} ${cellFontSize} text-black align-middle lg:font-normal ${
                        // Apply the new prop
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
                        {showReset && onReset && (
                          <button
                            onClick={() => onReset(item.email)}
                            type="button"
                            className="flex flex-col items-center cursor-pointer space-y-1 p-2 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 rounded transition-colors"
                            title="Reset Password"
                          >
                            <RefreshCw size={16} />
                            <span className="text-xs">Reset</span>
                          </button>
                        )}
                        {OnEye && (
                          <button
                            onClick={() => onEdit(item.id)}
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
      </div>
      <Pagination
        data={
          sortedColumn
            ? [...data].sort((a, b) => {
                const aVal = a[sortedColumn];
                const bVal = b[sortedColumn];
                if (typeof aVal === "string") {
                  return sortDirection === "asc"
                    ? aVal.localeCompare(bVal)
                    : bVal.localeCompare(aVal);
                } else if (typeof aVal === "number" || aVal instanceof Date) {
                  return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
                }
                return 0;
              })
            : data
        }
        itemsPerPage={itemsPerPage}
        setCurrentData={setCurrentData}
      />
    </div>
  );
};

export default Table;
