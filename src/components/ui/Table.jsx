import { useEffect, useState } from "react";
import moment from "moment";

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
import { useNavigate, useLocation } from "react-router-dom";

import {
  Home,
  FileText,
  Newspaper,
  Briefcase,
  Printer,
  Folder,
  Scale,
} from "lucide-react";

// Access Modules Configuration (same as in ManageUsers.jsx)
const ACCESS_MODULES = [
  {
    value: "CONVEYANCING",
    label: "Conveyancing",
    icon: Home,
    color: "bg-blue-500",
  },
  {
    value: "WILLS",
    label: "Wills & Estates",
    icon: FileText,
    color: "bg-emerald-500",
  },
  {
    value: "PRINT MEDIA",
    label: "Signage & Print",
    icon: Newspaper,
    color: "bg-amber-500",
  },
  {
    value: "COMMERCIAL",
    label: "Commercial",
    icon: Briefcase,
    color: "bg-indigo-500",
  },
  {
    value: "VOCAT",
    label: "VOCAT",
    icon: Scale,
    color: "bg-rose-500",
  },
];

// Component to render access modules with icons
// In Table.jsx - Update the AccessModulesDisplay component
function AccessModulesDisplay({ access = [] }) {
  const navigate = useNavigate();
  const location = useLocation();

  if (!access || access.length === 0) {
    return (
      <div className="flex items-center justify-center">
        <span className="text-xs text-gray-400">None</span>
      </div>
    );
  }

  const getTargetPath = (currentPath, module) => {
    const role = localStorage.getItem("role");
    const basePath = role === "user" ? "/user" : "/admin";

    if (currentPath.includes("/dashboard")) return `${basePath}/dashboard`;
    if (currentPath.includes("/view-clients"))
      return `${basePath}/view-clients`;
    if (currentPath.includes("/manage-clients"))
      return `${basePath}/manage-clients`;
    if (currentPath.includes("/manage-users"))
      return `${basePath}/manage-users`;
    if (currentPath.includes("/archived-clients"))
      return `${basePath}/archived-clients`;
    if (currentPath.includes("/client/stages")) return `${basePath}/dashboard`;
    return `${basePath}/dashboard`;
  };

  const handleModuleClick = (module) => {
    // Save the module to localStorage
    const currentModule = localStorage.getItem("currentModule");
    localStorage.setItem("currentModule", module.value.toLowerCase());
    localStorage.setItem("workType", module.value.toUpperCase());

    // Dispatch event to update the sidebar
    window.dispatchEvent(new Event("moduleChanged"));

    // Navigate to the appropriate page
    const targetPath = getTargetPath(location.pathname, module);
    setTimeout(() => {
      navigate(targetPath);
    }, 100);
  };

  return (
    <div className="flex flex-wrap gap-1 justify-center">
      {ACCESS_MODULES.map((module) => {
        if (access.includes(module.value)) {
          const ModuleIcon = module.icon;
          return (
            <button
              key={module.value}
              onClick={() => handleModuleClick(module)}
              className={`w-6 h-6 rounded-md flex items-center justify-center ${module.color} text-white hover:scale-110 transition-transform cursor-pointer group relative`}
              title={`Switch to ${module.label}`}
            >
              <ModuleIcon className="w-3 h-3" strokeWidth={2.5} />
              {/* Tooltip on hover */}
              <div className="absolute bottom-full mb-1 hidden group-hover:flex items-center justify-center px-2 py-1 bg-gray-800 text-white text-xs rounded-md whitespace-nowrap z-10">
                Switch to {module.label}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
              </div>
            </button>
          );
        }
        return null;
      })}
    </div>
  );
}

const Table = ({
  data,
  columns,
  onEdit,
  EditOrder,
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
  hideDeleteForSuperadmin,
}) => {
  const [currentData, setCurrentData] = useState([]);
  const navigate = useNavigate();
  const currentModule = localStorage.getItem("currentModule");

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
      case "access":
        return "20%";
      default:
        return "15%";
    }
  };

  const headerPadding = compact ? "py-2 lg:py-1.5" : "py-3 lg:py-2";
  const cellPadding = compact ? "py-1.5 lg:py-1" : "py-2.5 lg:py-2";

  const isLeftAlignedColumn = (columnKey) => {
    return columnKey === "displayName" || columnKey === "email";
  };

  return (
    <div className="w-full">
      <div className="grow overflow-auto">
        <table className="w-full border-separate border-spacing-y-1 table-fixed">
          <thead className={`${headerBgColor} text-black`}>
            <tr>
              {columns.map((column, colIndex) => {
                const isSorted = sortedColumn === column.key;
                const isLeftAligned = isLeftAlignedColumn(column.key);

                return (
                  <th
                    key={column.key}
                    style={{ width: column.width || getColumnWidth(column.key) }}
                    onClick={() => handleSort(column.key)}
                    className={`px-1 lg:px-1 xl:px-2 ${headerPadding} text-[11px] lg:text-[10px] xl:text-xs 2xl:text-sm cursor-pointer select-none whitespace-normal break-words ${
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
                  className={`px-1 lg:px-1 xl:px-2 ${headerPadding} text-center text-[11px] lg:text-[10px] xl:text-xs 2xl:text-sm rounded-r-2xl`}
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
                      style={{ width: column.width || getColumnWidth(column.key) }}
                      className={`px-1 lg:px-1 xl:px-2 ${cellPadding} text-[11px] lg:text-[10px] xl:text-xs 2xl:text-sm text-black align-middle wrap-break-word ${
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
                        title={
                          column.key === "access"
                            ? ""
                            : ["string", "number"].includes(typeof item[column.key])
                            ? item[column.key]
                            : ""
                        }
                      >
                        {column.key === "access" &&
                        currentModule !== "print media" ? (
                          <AccessModulesDisplay access={item[column.key]} />
                        ) : column.render ? (
                          column.render(item)
                        ) : column.key === "matter_date" ||
                          column.key === "settlement_date" ||
                          column.key === "orderDate" ||
                          column.key === "deliveryDate" ? (
                          item[column.key] ? (
                            moment(item[column.key]).isValid() ? (
                              moment(item[column.key]).format("DD-MM-YYYY")
                            ) : (
                              <span className="font-bold text-gray-500">—</span>
                            )
                          ) : (
                            <span className="font-bold text-gray-500">—</span>
                          )
                        ) : (
                          item[column.key] || item[column.key] === 0 ? item[column.key] : <span className="font-bold text-gray-500">—</span>
                        )}
                      </div>
                    </td>
                  );
                })}
                {showActions && (
                  <td
                    className={`px-1 lg:px-1 xl:px-2 ${cellPadding} rounded-r-2xl align-middle`}
                  >
                    <div className="flex flex-row items-center justify-center space-x-2">
                      {onEdit && !["readonly", "read-only"].includes(localStorage.getItem("role")) && (
                          <button
                           onClick={() => onEdit(item)}
                           className="flex flex-col items-center p-1 text-[#2E3D99] hover:text-blue-800 hover:bg-blue-100 rounded transition-colors"
                           title="Edit"
                         >
                           <Edit className="w-3 h-3 lg:w-3 lg:h-3 xl:w-3.5 xl:h-3.5 2xl:w-4 2xl:h-4" />
                           <span className="text-[10px] lg:text-[9px] xl:text-[10px] 2xl:text-xs">Edit</span>
                         </button>
                      )}
                      {onDelete &&
                        !["readonly", "read-only"].includes(localStorage.getItem("role")) &&
                        (!hideDeleteForSuperadmin ||
                          !hideDeleteForSuperadmin(item)) && (
                          <button
                            onClick={() => onDelete(item)}
                            className="flex flex-col items-center p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3 lg:w-3 lg:h-3 xl:w-3.5 xl:h-3.5 2xl:w-4 2xl:h-4" />
                            <span className="text-[10px] lg:text-[9px] xl:text-[10px] 2xl:text-xs">Delete</span>
                          </button>
                        )}
                      {!isClients &&
                        showReset &&
                        onReset &&
                        currentModule !== "print media" && (
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
                              <Loader2 className="w-3 h-3 lg:w-3 lg:h-3 xl:w-3.5 xl:h-3.5 2xl:w-4 2xl:h-4 animate-spin" />
                            ) : resetSuccessEmail === item.email ? (
                              <Check className="w-3 h-3 lg:w-3 lg:h-3 xl:w-3.5 xl:h-3.5 2xl:w-4 2xl:h-4" />
                            ) : (
                              <RefreshCw className="w-3 h-3 lg:w-3 lg:h-3 xl:w-3.5 xl:h-3.5 2xl:w-4 2xl:h-4" />
                            )}
                            <span className="text-[10px] lg:text-[9px] xl:text-[10px] 2xl:text-xs">
                              {resetLoadingEmail === item.email
                                ? "Sending…"
                                : resetSuccessEmail === item.email
                                ? "Sent"
                                : "Reset"}
                            </span>
                          </button>
                        )}
                      {OnEye && currentModule !== "print media" && (
                          <button
                           onClick={() => {
                             console.log("Table: Eye clicked for item:", item);
                             OnEye(item);
                           }}
                           className="flex flex-col items-center p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors"
                           title="View Details"
                         >
                           <img src={Eye} alt="View" className="h-3 lg:h-3 xl:h-4 2xl:h-5 " />
                           <span className="text-[10px] lg:text-[9px] xl:text-[10px] 2xl:text-xs text-[#2E3D99]">View</span>
                         </button>
                      )}
                      {EditOrder &&
                        !["readonly", "read-only"].includes(localStorage.getItem("role")) &&
                        (currentModule === "print media" ||
                        (["conveyancing", "commercial", "vocat"].includes(currentModule) && localStorage.getItem("role") === "superadmin")) && (
                           <button
                             onClick={() => {
                               const matterId = item.matternumber || item.matterNumber || item.orderId || item.id || item._id;
                               if (currentModule === "print media") {
                                 navigate(`/admin/client/stages/${matterId}`);
                               } else if (currentModule === "vocat") {
                                 navigate(`/admin/client/stages/${matterId}/4`);
                               } else {
                                 navigate(`/admin/client/stages/${matterId}/6`);
                               }
                             }}
                             className="flex flex-col items-center space-y-0.5 p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition"
                             title="Edit"
                           >
                             <Edit className="w-3 h-3 lg:w-3 lg:h-3 xl:w-3.5 xl:h-3.5 2xl:w-4 2xl:h-4" />
                             <span className="text-[10px] lg:text-[9px] xl:text-[10px] 2xl:text-xs">Edit</span>
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
      <div className="shrink-0">
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
