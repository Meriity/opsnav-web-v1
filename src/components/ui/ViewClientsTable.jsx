import { useEffect, useState, useMemo } from "react";
import {
  Edit,
  Share2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ClipboardList,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Pagination from "./Pagination";

const ViewClientsTable = ({
  data,
  columns,
  onShare,
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
      {/* Desktop Table View */}
      <div className="hidden lg:block">
        <table className="w-full border-separate border-spacing-y-1 table-fixed">
          <thead className="bg-[#D7F4FF]">
            <tr>
              {columns.map((column, colIndex) => (
                <th
                  key={column.key}
                  style={{ width: column.width }}
                  onClick={() => handleSort(column.key)}
                  className={`px-2 py-3 text-center text-sm  text-black ${
                    colIndex === 0 ? "rounded-l-2xl" : ""
                  } cursor-pointer select-none`}
                >
                  <div className="flex flex-col items-center">
                    <span>{column.title}</span>
                    <span>
                      {sortConfig.key === column.key ? (
                        sortConfig.direction === "asc" ? (
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
              ))}
              <th
                className="pl-6 pr-5 py-3 text-center text-sm text-black"
                style={{ width: "11%" }}
              >
                Stages
              </th>
              <th
                className="py-3 pl-6 text-center text-sm text-black"
                style={{ width: "6%" }}
              >
                OT
              </th>
              <th
                className="pl-2 pr-2 py-3 text-center text-sm text-black rounded-r-2xl"
                style={{ width: "6%" }}
              >
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {currentData.map((item) => (
              <tr
                key={item.id}
                className="bg-white rounded-2xl transition-all hover:bg-sky-50"
              >
                {columns.map((column, colIndex) => (
                  <td
                    key={column.key}
                    className={`px-2 py-3 text-xs lg:text-sm xl:text-base 2xl:text-md 4xl:text-lg text-black align-middle break-words ${
                      colIndex === 0 ? "rounded-l-2xl" : ""
                    }`}
                  >
                    <div
                      className=" lg:font-normal 2xl:"
                      title={item[column.key]}
                    >
                      {item[column.key]}
                    </div>
                  </td>
                ))}
                <td className="pl-3 align-middle">
                  <div className="flex flex-nowrap gap-0.5 justify-center">
                    {Object.keys(item?.stages?.[0] || {}).map(
                      (keyName, index) => (
                        <a
                          href={`/admin/client/stages/${item.matternumber}/${
                            index + 1
                          }`}
                          key={keyName}
                          className="px-1 py-1 text-white rounded text-xs  cursor-pointer"
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
                <td className="pl-8 align-middle">
                  <div className="flex justify-center">
                    <button
                      type="button"
                      title="View Outstanding Tasks"
                      className="p-1 text-gray-700 hover:text-black hover:bg-gray-100 rounded-full transition-colors"
                      onClick={() => {
                        handelOTOpen();
                        handelOT(item?.matternumber);
                      }}
                    >
                      <ClipboardList size={20} />
                    </button>
                  </div>
                </td>
                <td className="pl-3 pr-2 rounded-r-2xl align-middle">
                  <div className="flex flex-col items-center space-y-2">
                    <button
                      onClick={() =>
                        navigate(`/admin/client/stages/${item.matternumber}`)
                      }
                      className="flex flex-col items-center space-y-1 p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors cursor-pointer"
                      title="Edit"
                    >
                      <Edit size={12} />
                      <span className="text-xs">Edit</span>
                    </button>
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile & Tablet Card View */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:hidden">
        {currentData.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl shadow p-4 space-y-3"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-gray-500">Matter #</p>
                <p className=" text-blue-600">{item.matternumber}</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  title="View Outstanding Tasks"
                  className="p-1 text-gray-700"
                  onClick={() => {
                    handelOTOpen();
                    handelOT(item?.matternumber);
                  }}
                >
                  <ClipboardList size={20} />
                </button>
                <button
                  onClick={() =>
                    navigate(`/admin/client/stages/${item.matternumber}`)
                  }
                  className="p-1 text-blue-600"
                  title="Edit"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => onShare(item.matternumber, item.client_email)}
                  className="p-1 text-gray-600"
                  title="Share"
                >
                  <Share2 size={16} />
                </button>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-500">Client</p>
              <p className="font-semibold break-words">{item.client_name}</p>
            </div>

            <div>
              <p className="text-xs text-gray-500">Address</p>
              <p className="text-sm break-words">{item.property_address}</p>
            </div>

            <div className="flex justify-between text-xs pt-2">
              <div>
                <p className="text-gray-500">Settlement</p>
                <p>{item.settlement_date}</p>
              </div>
              <div>
                <p className="text-gray-500">Status</p>
                <p>{item.close_matter}</p>
              </div>
              <div>
                <p className="text-gray-500">Entered By</p>
                <p>{item.dataentryby}</p>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">Stages</p>
              <div className="flex flex-wrap gap-1">
                {Object.keys(item?.stages?.[0] || {}).map((keyName, index) => (
                  <a
                    href={`/admin/client/stages/${item.matternumber}/${
                      index + 1
                    }`}
                    key={keyName}
                    className="px-2 py-1 text-white rounded text-xs "
                    style={{
                      backgroundColor:
                        stageColorMap[item?.stages?.[0]?.[keyName]] ||
                        stageColorMap["default"],
                    }}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {keyName.toUpperCase()}
                  </a>
                ))}
              </div>
            </div>
          </div>
        ))}
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
