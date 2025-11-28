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
  compact = false,
}) => {
  const [currentData, setCurrentData] = useState([]);

  useEffect(() => {
    setCurrentData(data.slice(0, itemsPerPage));
  }, [data, itemsPerPage]);

  const getColumnWidth = (columnKey) => {
    switch (columnKey) {
      case "matternumber":
      case "matterNumber":
      case "orderId":
        return "14%";
      case "client_name":
      case "clientName":
        return "18%";
      case "property_address":
      case "business_address":
      case "propertyAddress":
        return "20%";
      case "state":
        return "8%";
      case "clientType":
      case "type":
      case "ordertype":
        return "12%";
      case "matter_date":
      case "orderDate":
        return "12%";
      case "settlement_date":
      case "deliveryDate":
        return "12%";
      case "status":
        return "8%";
      case "displayName":
        return "20%";
      case "email":
        return "25%";
      case "role":
        return "10%";
      case "createdAt":
        return "12%";
      default:
        return "15%";
    }
  };

  const headerPadding = compact ? "py-4" : "py-3";
  const cellPadding = compact ? "py-2" : "py-3";

  const isLeftAlignedColumn = (columnKey) => {
    return columnKey === "displayName" || columnKey === "email";
  };

  return (
    <div className="w-full">
      <div className="flex-grow overflow-auto">
        <table className="w-full border-separate border-spacing-y-1 table-fixed">
          <thead className={`${headerBgColor} text-black`}>
            <tr>
              {columns.map((column, colIndex) => {
                const isSorted = sortedColumn === column.key;
                const isLeftAligned = isLeftAlignedColumn(column.key);

                return (
                  <th
                    key={column.key}
                    style={{ width: getColumnWidth(column.key) }}
                    onClick={() => handleSort(column.key)}
                    className={`px-2 ${headerPadding} text-sm cursor-pointer select-none ${
                      colIndex === 0 ? "rounded-l-2xl" : ""
                    } ${
                      colIndex === columns.length - 1 && !showActions
                        ? "rounded-r-2xl"
                        : ""
                    }`}
                  >
                    <div
                      className={`flex items-center justify-${
                        isLeftAligned ? "start" : "center"
                      } gap-1 ${isLeftAligned ? "pl-3" : ""}`}
                    >
                      <span>{column.title}</span>
                      <span>
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
                  className={`px-2 ${headerPadding} text-center text-sm rounded-r-2xl`}
                  style={{ width: "15%" }}
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
                className={`bg-white rounded-2xl transition-all ${
                  hoverEffect ? "hover:shadow-xl" : ""
                }`}
              >
                {columns.map((column, colIndex) => {
                  const isLeftAligned = isLeftAlignedColumn(column.key);

                  return (
                    <td
                      key={column.key}
                      className={`px-2 ${cellPadding} text-xs lg:text-sm xl:text-base text-black align-middle break-words ${
                        colIndex === 0 ? "rounded-l-2xl" : ""
                      } ${
                        colIndex === columns.length - 1 && !showActions
                          ? "rounded-r-2xl"
                          : ""
                      }`}
                    >
                      <div
                        className={`${
                          isLeftAligned ? "text-left pl-3" : "text-center"
                        }`}
                        title={item[column.key]}
                      >
                        {item[column.key]}
                      </div>
                    </td>
                  );
                })}
                {showActions && (
                  <td
                    className={`px-2 ${cellPadding} rounded-r-2xl align-middle`}
                  >
                    <div className="flex flex-row items-center justify-center space-x-2">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(item)}
                          className="flex flex-col items-center p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit size={14} />
                          <span className="text-xs">Edit</span>
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(item)}
                          className="flex flex-col items-center p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                          <span className="text-xs">Delete</span>
                        </button>
                      )}
                      {!isClients &&
                        showReset &&
                        onReset &&
                        localStorage.getItem("company") === "vkl" && (
                          <button
                            onClick={() => onReset(item.email)}
                            type="button"
                            disabled={resetLoadingEmail === item.email}
                            className={`flex flex-col items-center p-1 rounded transition-colors
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
                              <Loader2 size={14} className="animate-spin" />
                            ) : resetSuccessEmail === item.email ? (
                              <Check size={14} />
                            ) : (
                              <RefreshCw size={14} />
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
                          onClick={() => {
                            console.log("Table: Eye clicked for item:", item);
                            OnEye(item);
                          }}
                          className="flex flex-col items-center p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors"
                          title="View Details"
                        >
                          <img src={Eye} alt="View" className="h-[16px]" />
                          <span className="text-xs">View</span>
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
