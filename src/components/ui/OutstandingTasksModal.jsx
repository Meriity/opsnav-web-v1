import { useEffect, useState } from "react";
import { Dialog, DialogPanel } from "@headlessui/react";
import ClientAPI from "../../api/userAPI";
import CommercialAPI from "../../api/commercialAPI";
import { formatDate } from "../../utils/formatters";
import Loader from "./Loader";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function OutstandingTasksModal({
  open,
  onClose,
  activeMatter = null,
  onOpen = false,
}) {
  const company = localStorage.getItem("company");
  const currentModule = localStorage.getItem("currentModule");
  const api =
    currentModule === "commercial" ? new CommercialAPI() : new ClientAPI();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [matterFilter, setMatterFilter] = useState("none");

  useEffect(() => {
    if (open) {
      setCurrentPage(1);
      fetchData(1);
    }
  }, [open, activeMatter, matterFilter]);

  useEffect(() => {
    if (open) {
      fetchData(currentPage);
    }
  }, [currentPage]);

  const fetchData = async (page) => {
    setLoading(true);

    try {
      const ClientID = activeMatter;

      let response;
      if (currentModule === "commercial") {
        // Fixed: Properly construct query parameters for commercial API
        const params = new URLSearchParams({
          page: page.toString(),
          limit: "10", // Add limit if needed by your API
        });

        // Only add filter if it's not "none"
        if (matterFilter && matterFilter !== "none") {
          params.append("filter", matterFilter);
        }

        // Only add matterNumber if activeMatter exists and is valid
        if (
          activeMatter &&
          activeMatter !== "null" &&
          activeMatter !== "undefined"
        ) {
          params.append("matterNumber", activeMatter);
        }

        response = await api.getOutstandingTasks(params);
      } else {
        response =
          company === "vkl"
            ? await api.getAllOutstandingTasks(page, activeMatter, matterFilter)
            : await api.getIDGOutstandingTasks(
                page,
                matterFilter,
                activeMatter
              );
      }
      if (activeMatter) {
        setData([response]);
        setTotalPages(1);
      } else {
        setData(response.results || []);
        setTotalPages(response.totalPages || 1);
      }
    } catch (error) {
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Outstanding Tasks Report", 14, 16);

    const rows = [];
    data.forEach((item) => {
      const allStages = Object.entries(item.outstandingTasks || {});
      const nonEmptyStages = allStages.filter(([_, tasks]) => tasks.length > 0);

      if (nonEmptyStages.length === 0) {
        rows.push([
          `${item.matterNumber} - ${item.clientName}`,
          formatDate(item.settlementDate),
          "-",
          "No outstanding tasks",
        ]);
      } else {
        nonEmptyStages.forEach(([stage, tasks], index) => {
          rows.push([
            index === 0
              ? `${item.matterNumber || item.orderId} - ${item.clientName}`
              : "",
            index === 0
              ? formatDate(item.settlementDate || item.deliveryDate)
              : "",
            stage,
            tasks.join("\n"),
          ]);
        });
      }
    });

    const company = localStorage.getItem("company");

    // dynamic head
    const head =
      company === "idg"
        ? [["Order No. and Client", "Delivery Date", "Stage", "Tasks"]]
        : [["Matter No. and Client", "Settlement Date", "Stage", "Tasks"]];

    autoTable(doc, {
      startY: 22,
      head,
      body: rows,
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: [0, 123, 255] },
      didDrawCell: (data) => {
        if (
          data.section === "body" &&
          (data.column.index === 0 || data.column.index === 1)
        ) {
          if (data.cell.raw === "") {
            let i = data.row.index - 1;
            let startCell = null;
            while (i >= 0) {
              const prevCell = data.table.body[i].cells[data.column.index];
              if (prevCell.raw !== "") {
                startCell = prevCell;
                break;
              }
              i--;
            }
            if (startCell) {
              startCell.rowSpan = (startCell.rowSpan || 1) + 1;
              data.cell.styles.lineWidth = 0;
            }
          }
        }
      },
    });

    doc.save(
      company === "idg"
        ? "IDG_Outstanding_Tasks_Report.pdf"
        : "VKL_Outstanding_Tasks_Report.pdf"
    );
  };

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden rounded-lg bg-white text-left align-middle shadow-xl transition-all">
          {/* Header: Title and Dropdown */}
          <div className="flex-shrink-0 p-6 border-b">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-2xl font-bold">Outstanding Tasks Report</h2>
              {!activeMatter && (
                <div>
                  <label className="text-sm font-semibold block mb-1 text-gray-600">
                    {company === "vkl"
                      ? "Matters Settling in"
                      : "Orders Delivery in"}
                  </label>
                  <select
                    className="w-full sm:w-[150px] px-3 py-2 rounded-md border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                    onChange={(e) => setMatterFilter(e.target.value)}
                    value={matterFilter}
                  >
                    <option value="none">Any Time</option>
                    <option value="two_weeks">Two Weeks</option>
                    <option value="four_weeks">Four Weeks</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-grow overflow-y-auto p-6">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <Loader height={40} />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left border">
                  <thead className="bg-blue-600 text-white">
                    <tr>
                      <th className="px-6 py-3 border">
                        {company === "vkl"
                          ? "Matter No. and Client"
                          : "OrderId and Client"}
                      </th>
                      <th className="px-6 py-3 border">
                        {company === "vkl"
                          ? "Settlement Date"
                          : "Delivery Date"}
                      </th>
                      <th className="px-6 py-3 border">Stage</th>
                      <th className="px-6 py-3 border">Tasks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.length > 0 ? (
                      data.map((item, idx) => {
                        const allStages = Object.entries(
                          item.outstandingTasks || {}
                        );
                        const nonEmptyStages = allStages.filter(
                          ([_, tasks]) => tasks.length > 0
                        );
                        if (nonEmptyStages.length === 0) {
                          return (
                            <tr key={idx} className="border bg-white">
                              <td className="px-6 py-4 border align-top">
                                {item.matterNumber || item.orderId} -{" "}
                                {item.clientName || item.name || item.clientId}
                              </td>
                              <td className="px-6 py-4 border align-top">
                                {formatDate(item.settlementDate)}
                              </td>
                              <td
                                className="px-6 py-4 border text-gray-400"
                                colSpan={2}
                              >
                                No outstanding tasks for any stages.
                              </td>
                            </tr>
                          );
                        }
                        return nonEmptyStages.map(
                          ([stage, tasks], stageIdx) => (
                            <tr
                              key={`${idx}-${stage}`}
                              className="border bg-white"
                            >
                              {stageIdx === 0 && (
                                <>
                                  <td
                                    rowSpan={nonEmptyStages.length}
                                    className="px-6 py-4 border align-top bg-gray-50 font-medium"
                                  >
                                    {item.matterNumber || item.orderId} -{" "}
                                    {item.clientName ||
                                      item.name ||
                                      item.clientId}
                                  </td>
                                  <td
                                    rowSpan={nonEmptyStages.length}
                                    className="px-6 py-4 border align-top bg-gray-50"
                                  >
                                    {formatDate(
                                      item.settlementDate || item.deliveryDate
                                    )}
                                  </td>
                                </>
                              )}
                              <td className="px-6 py-4 border align-top">
                                {stage}
                              </td>
                              <td className="px-6 py-4 border align-top">
                                <ul className="list-disc list-inside space-y-1">
                                  {tasks.map((task, i) => (
                                    <li key={i}>{task}</li>
                                  ))}
                                </ul>
                              </td>
                            </tr>
                          )
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan={4}
                          className="text-center text-gray-500 py-10"
                        >
                          No data available for the selected filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Footer: Pagination and Buttons */}
          <div className="flex-shrink-0 p-6 border-t">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              {/* Pagination */}
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <div className="space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Prev
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={handleDownloadPDF}
                  disabled={data.length === 0}
                  className="bg-[#00AEEF] text-white px-6 py-2 rounded-md hover:bg-sky-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Download
                </button>
              </div>
            </div>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
