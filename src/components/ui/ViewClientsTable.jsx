import { useEffect, useState, useMemo } from "react";
import { Edit, Share2, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import report from "../../icons/Button icons/Group 318.png";
import { useNavigate } from "react-router-dom";
import Pagination from "./Pagination";

const ViewClientsTable = ({
  data,
  columns,
  onEdit,
  onShare,
  showActions = true,
  status = false,
  ot = false,
  hoverEffect = true,
  tableClass = "",
  rowSpacing = "py-3",
  headerBgColor = "bg-[#D7F4FF]",
  itemsPerPage = 5,
  handelOTOpen,
  handelOT,
}) => {
  const [currentData, setCurrentData] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const navigate = useNavigate();

  const stageColorMap = {
    green: "green",
    red: "red",
    amber: "#f59e0b",
    yellow: "#facc15",
    blue: "#3b82f6",
    default: "red",
  };

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return data;
    return [...data].sort((a, b) => {
      const aVal = a[sortConfig.key] || "";
      const bVal = b[sortConfig.key] || "";
      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  useEffect(() => {
    setCurrentData(sortedData.slice(0, itemsPerPage));
  }, [sortedData, itemsPerPage]);

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        {/* Added table-fixed for reliable truncation */}
        <table
          className={`min-w-full border-separate border-spacing-y-1 table-fixed ${tableClass}`}
        >
          <thead>
            <tr className={headerBgColor}>
              {columns.map((column, colIndex) => (
                <th
                  key={column.key}
                  onClick={() => handleSort(column.key)}
                  className={`px-3 py-4 text-left text-md font-bold text-black ${
                    colIndex === 0 ? "rounded-l-2xl" : ""
                  } cursor-pointer select-none whitespace-nowrap`}
                  style={{ width: column.width || "auto" }}
                >
                  <div className="flex items-center gap-1">
                    {column.title}
                    {sortConfig.key === column.key ? (
                      sortConfig.direction === "asc" ? (
                        <ArrowUp size={16} />
                      ) : (
                        <ArrowDown size={16} />
                      )
                    ) : (
                      <ArrowUpDown size={16} />
                    )}
                  </div>
                </th>
              ))}
              {status && (
                <th
                  className="px-3 py-2 text-left text-sm font-bold text-black"
                  style={{ width: "170px" }}
                >
                  Stages
                </th>
              )}
              {ot && (
                <th
                  className="px-3 py-2 text-left text-sm font-bold text-black"
                  style={{ width: "45px" }}
                >
                  OT
                </th>
              )}
              {showActions && (
                <th
                  className="px-3 py-2 text-left text-sm font-bold text-black rounded-r-2xl"
                  style={{ width: "95px" }}
                >
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {currentData.map((item) => (
              <tr
                key={item.id}
                className={`bg-white rounded-2xl transition-all ${
                  hoverEffect ? "hover:bg-sky-50" : ""
                }`}
              >
                {columns.map((column, colIndex) => (
                  <td
                    key={column.key}
                    className={`px-3 ${rowSpacing} text-sm text-black align-middle ${
                      colIndex === 0 ? "rounded-l-2xl" : ""
                    }`}
                    style={{ width: column.width || "auto" }}
                  >
                    {/* --- TEXT TRUNCATION FIX IS HERE --- */}
                    <div
                      className="font-bold truncate"
                      title={item[column.key]}
                    >
                      {item[column.key]}
                    </div>
                  </td>
                ))}
                {status && (
                  <td
                    className={`px-1 align-middle`}
                    style={{ width: "150px" }}
                  >
                    <div className="flex gap-1">
                      {Object.keys(item?.stages?.[0] || {}).map(
                        (keyName, index) => (
                          <a
                            href={`/admin/client/stages/${item.matternumber}/${
                              index + 1
                            }`}
                            key={keyName}
                            className="px-1 py-1 text-white rounded text-xs font-bold cursor-pointer"
                            style={{
                              backgroundColor:
                                stageColorMap[item?.stages?.[0]?.[keyName]] ||
                                stageColorMap["default"],
                            }}
                            title={`Stage ${keyName}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {keyName.toUpperCase()}
                          </a>
                        )
                      )}
                    </div>
                  </td>
                )}
                {ot && (
                  <td className={`px-1 align-middle`} style={{ width: "30px" }}>
                    <div className="flex justify-center">
                      <button
                        type="button"
                        className="cursor-pointer"
                        onClick={() => {
                          handelOTOpen();
                          handelOT(item?.matternumber);
                        }}
                      >
                        <img src={report} alt="OT Report" className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                )}
                {showActions && (
                  <td
                    className={`px-3 rounded-r-2xl align-middle`}
                    style={{ width: "80px" }}
                  >
                    <div className="flex items-center space-x-1">
                      {onEdit && (
                        <button
                          onClick={() =>
                            navigate(
                              `/admin/client/stages/${item.matternumber}`
                            )
                          }
                          className="flex flex-col items-center space-y-1 p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit size={12} />
                          <span className="text-xs">Edit</span>
                        </button>
                      )}
                      <button
                        onClick={() =>
                          onShare(item.matternumber, item.client_email)
                        }
                        className="flex flex-col items-center space-y-1 p-1 text-black hover:text-gray-700 hover:bg-gray-100 rounded transition-colors cursor-pointer"
                        title="Share"
                      >
                        <Share2 size={12} />
                        <span className="text-xs">Share</span>
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination
        data={sortedData}
        itemsPerPage={itemsPerPage}
        setCurrentData={setCurrentData}
      />
    </div>
  );
};

export default ViewClientsTable;
