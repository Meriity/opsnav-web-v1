import { useEffect, useState, useMemo } from "react";
import {
  Edit,
  Share2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ClipboardList,
  Trash2,
  GripVertical
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Pagination from "./Pagination";
import { formatDate } from "../../utils/formatters";

// DnD Kit Imports
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Sortable Row Component
const SortableRow = ({ children, id, isDraggingMode, ...props }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: isDraggingMode ? "grab" : "default",
    zIndex: isDragging ? 999 : "auto",
    position: "relative",
  };

  if (!isDraggingMode) {
    return <tr {...props}>{children}</tr>;
  }

  return (
    <tr ref={setNodeRef} style={style} {...props}>
      {children(attributes, listeners)} 
    </tr>
  );
};

const ViewClientsTable = ({
  data,
  columns,
  onShare,
  itemsPerPage = 5,
  handelOTOpen,
  handelOT,
  currentModule,
  users,
  handleChangeUser,
  onDelete,
  // Drag Props
  isDraggingMode = false,
  setDraggedData,
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
  const [, setRefresh] = useState(false);

  const sortedData = useMemo(() => {
    // If dragging mode is on, we bypass sorting to avoid jumping rows
    if (isDraggingMode) return data; 
    
    if (!sortConfig.key) return data;
    return [...data].sort((a, b) => {
      const aVal = a[sortConfig.key] || "";
      const bVal = b[sortConfig.key] || "";
      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig, isDraggingMode]);

  const handleSort = (key) => {
    if (isDraggingMode) return; // Disable sorting during drag
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  useEffect(() => {
    // In dragging mode, we typically show ALL items (pagination disabled in parent)
    // But verify if slicing is needed. Parent forces itemsPerPage to 1000.
    setCurrentData(sortedData.slice(0, itemsPerPage));
  }, [sortedData, itemsPerPage]);

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
       // We need to find the indexes in the original 'data' array (or sortedData if we are sorting locally)
       // But wait, 'data' passed from parent IS 'draggedData' state in parent when in mode.
       // So we can compute the new order and call setDraggedData.
       
       const oldIndex = currentData.findIndex((item) => (item.id || item._id || item.orderId) === active.id);
       const newIndex = currentData.findIndex((item) => (item.id || item._id || item.orderId) === over.id);
       
       const newData = arrayMove(currentData, oldIndex, newIndex);
       
       // Update local state for immediate feedback
       setCurrentData(newData);
       // Update parent state
       if (setDraggedData) {
           setDraggedData(newData);
       }
    }
  };

  return (
    <div className="w-full">
      {/* Desktop Table View */}
      <div className="hidden lg:block">
        <DndContext 
            sensors={sensors} 
            collisionDetection={closestCenter} 
            onDragEnd={handleDragEnd}
        >
        <table className="w-full border-separate border-spacing-y-1 table-fixed">
          <thead className="bg-gradient-to-r from-[#2E3D99]/90 to-[#1D97D7] text-white">
            <tr>
              {/* Add Drag Handle Column Header if in drag mode */}
              {isDraggingMode && <th className="w-10 rounded-l-2xl"></th>}
              
              {columns.map((column, colIndex) => (
                <th
                  key={column.key}
                  style={{ width: column.width }}
                  onClick={() => handleSort(column.key)}
                  className={`px-2 py-3 text-center text-sm ${
                    colIndex === 0 && !isDraggingMode ? "rounded-l-2xl" : ""
                  } ${!isDraggingMode ? "cursor-pointer" : "cursor-default"} select-none`}
                >
                  <div className="flex flex-col items-center">
                    <span>{column.title}</span>
                    {!isDraggingMode && <span>
                      {sortConfig.key === column.key ? (
                        sortConfig.direction === "asc" ? (
                          <ArrowUp size={14} />
                        ) : (
                          <ArrowDown size={14} />
                        )
                      ) : (
                        <ArrowUpDown size={14} />
                      )}
                    </span>}
                  </div>
                </th>
              ))}
              <th
                className="pl-6 pr-5 py-3 text-center text-sm"
                style={{ width: "11%" }}
              >
                Stages
              </th>
              <th
                className="py-3 pl-6 text-center text-sm"
                style={{ width: "6.5%" }}
              >
                OT
              </th>
              <th
                className="pl-2 pr-2 py-3 text-center text-sm rounded-r-2xl"
                style={{ width: "6.5%" }}
              >
                Action
              </th>
            </tr>
          </thead>
          
          {/* Table Body wrapped in SortableContext if dragging */}
          {isDraggingMode ? (
             <tbody className="relative">
               <SortableContext 
                  items={currentData.map(item => item.id || item._id || item.orderId)}
                  strategy={verticalListSortingStrategy}
               >
                 {currentData.map((item) => {
                   const uniqueId = item.id || item._id || item.orderId;
                   return (
                     <SortableRow 
                       key={uniqueId} 
                       id={uniqueId} 
                       isDraggingMode={true}
                       className="bg-white rounded-2xl transition-all hover:shadow-xl"
                     >
                       {(attributes, listeners) => (
                         <>
                           {/* Drag Handle Cell */}
                           <td 
                             className="w-10 text-center rounded-l-2xl cursor-grab active:cursor-grabbing" 
                             {...attributes} 
                             {...listeners}
                           >
                             <GripVertical size={20} className="text-gray-400 mx-auto" strokeWidth={2} />
                           </td>
                           
                           {columns.map((column, colIndex) => (
                             <td
                               key={column.key}
                               className={`px-2 py-3 text-xs lg:text-sm xl:text-base 2xl:text-md 4xl:text-lg text-black align-middle break-words`}
                             >
                               {/* Content Logic (Same as before) */}
                               <div
                                className="lg:font-normal 2xl:text-center"
                                title={item[column.key]}
                              >
                                {[
                                  "settlement_date",
                                  "finance_approval_date",
                                  "building_and_pest_date",
                                  "order_date",
                                  "delivery_date",
                                  "settlementDate",
                                  "matterDate",
                                ].includes(column.key) ? (
                                  item[column.key] &&
                                  item[column.key] !== "-" &&
                                  item[column.key] !== "N/A" ? (
                                    formatDate(item[column.key])
                                  ) : (
                                    <span className="font-bold text-gray-500">—</span>
                                  )
                                ) : (column.key === "billing_address" ||
                                    column.key === "businessAddress" ||
                                    column.key === "property_address") &&
                                  item[column.key] ? (
                                  <a
                                    href={`https://www.google.com/maps?q=${encodeURIComponent(
                                      item[column.key]
                                    )}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline"
                                  >
                                    {item[column.key]}
                                  </a>
                                ) : ["allocatedUser"].includes(column.key) ? (
                                  <div>
                                    {["allocatedUser"].includes(column.key) ? (
                                      <select
                                        disabled={true} // Disable dropdown when dragging
                                        name="allocatedUser"
                                        className="bg-gray-100 p-2 text-gray-500 rounded w-full cursor-not-allowed"
                                        value={item.allocatedUser || ""}
                                      >
                                        <option value="">
                                          {item?.allocatedUser || "Select User"}
                                        </option>
                                      </select>
                                    ) : (
                                      ""
                                    )}
                                  </div>
                                ) : (
                                  item[column.key] || item[column.key] === 0 ? item[column.key] : <span className="font-bold text-gray-500">—</span>
                                )}
                              </div>
                             </td>
                           ))}
                           {/* Stages, OT, Action Columns (Simplified for drag mode - usually static) */}
                            <td className="pl-3 align-middle text-gray-400 scale-90 opacity-50 pointer-events-none">
                                {/* Disabled Stages View */}
                                <div className="text-xs text-center">Stages (Locked)</div>
                            </td>
                            <td className="pl-8 align-middle text-gray-400 pointer-events-none">
                                <ClipboardList size={20} className="mx-auto opacity-50" />
                            </td>
                            <td className="pl-3 pr-2 rounded-r-2xl align-middle pointer-events-none">
                                <Edit size={12} className="mx-auto opacity-50" />
                            </td>
                         </>
                       )}
                     </SortableRow>
                   );
                 })}
               </SortableContext>
             </tbody>
          ) : (
            <tbody>
            {currentData.map((item) => {
              return (
                <tr
                  key={item.id}
                  className="bg-white rounded-2xl transition-all hover:shadow-xl"
                >
                  {columns.map((column, colIndex) => (
                    <td
                      key={column.key}
                      className={`px-2 py-3 text-xs lg:text-sm xl:text-base 2xl:text-md 4xl:text-lg text-black align-middle break-words ${
                        colIndex === 0 ? "rounded-l-2xl" : ""
                      }`}
                    >
                      <div
                        className="lg:font-normal 2xl:text-center"
                        title={item[column.key]}
                      >
                        {[
                          "settlement_date",
                          "finance_approval_date",
                          "building_and_pest_date",
                          "order_date",
                          "delivery_date",
                          "settlementDate",
                          "matterDate",
                        ].includes(column.key) ? (
                          item[column.key] &&
                          item[column.key] !== "-" &&
                          item[column.key] !== "N/A" ? (
                            formatDate(item[column.key])
                          ) : (
                            <span className="font-bold text-gray-500">—</span>
                          )
                        ) : (column.key === "billing_address" ||
                            column.key === "businessAddress" ||
                            column.key === "property_address") &&
                          item[column.key] ? (
                          <a
                            href={`https://www.google.com/maps?q=${encodeURIComponent(
                              item[column.key]
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {item[column.key]}
                          </a>
                        ) : ["allocatedUser"].includes(column.key) ? (
                          <div>
                            {["allocatedUser"].includes(column.key) ? (
                              <select
                                name="allocatedUser"
                                className={
                                  !["admin", "superadmin"].includes(
                                    localStorage.getItem("role")
                                  )
                                    ? "bg-gray-100 p-2 text-gray-500 rounded w-full"
                                    : "bg-white p-2 border rounded w-full"
                                }
                                value={item.allocatedUser || ""}
                                onChange={(e) => {
                                  handleChangeUser(
                                    e.target.value,
                                    item.orderId
                                  );
                                  item.allocatedUser = e.target.value;
                                  setRefresh((prev) => !prev);
                                }}
                                disabled={
                                  !["admin", "superadmin"].includes(
                                    localStorage.getItem("role")
                                  )
                                }
                              >
                                <option value="">
                                  {item?.allocatedUser || "Select User"}
                                </option>

                                {users.map((user) => (
                                  <option
                                    key={user.id}
                                    value={`${user.id}-${user.name}`}
                                  >
                                    {user.name}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              ""
                            )}
                          </div>
                        ) : (
                          item[column.key] || item[column.key] === 0 ? item[column.key] : <span className="font-bold text-gray-500">—</span>
                        )}
                      </div>
                    </td>
                  ))}
                  <td className="pl-3 align-middle">
                    <div className="flex flex-nowrap gap-0.5 justify-center">
                      {Object.keys(item?.stages?.[0] || {}).map(
                        (keyName, index) => (
                          <a
                            href={`/admin/client/stages/${
                              currentModule === "commercial"
                                ? item.matterNumber
                                : item.matternumber || item.orderId
                            }/${index + 1}`}
                            key={keyName}
                            className="px-1 py-1 text-white rounded text-xs cursor-pointer"
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
                        className="p-1 text-black hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                        onClick={() => {
                          handelOTOpen();
                          handelOT(
                            currentModule === "commercial"
                              ? item.matterNumber
                              : item.matternumber || item.orderId
                          );
                        }}
                      >
                        <ClipboardList size={20} />
                      </button>
                    </div>
                  </td>
                  <td className="pl-3 pr-2 rounded-r-2xl align-middle">
                    <div className="flex flex-col items-center space-y-2">
                      <button
                        onClick={() => {
                          const id =
                            currentModule === "commercial"
                              ? item.matterNumber
                              : item.matternumber || item.orderId;
                          navigate(`/admin/client/stages/${id}`);
                        }}
                        className="flex flex-col items-center space-y-1 p-1 text-black hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                        title="Edit"
                      >
                        <Edit size={12} />
                        <span className="text-xs">Edit</span>
                      </button>
                      {/* <button
                        onClick={() =>
                          onShare(item.matternumber, item.client_email)
                        }
                        className="flex flex-col items-center space-y-1 p-1 text-black hover:text-gray-700 hover:bg-gray-100 rounded transition-colors cursor-pointer"
                        title="Share"
                      >
                        <Share2 size={12} />
                        <span className="text-xs">Share</span>
                      </button> */}
                      {currentModule === "print media" && (
                        <button
                          onClick={() => onDelete(item)}
                          className="flex flex-col items-center space-y-1 p-1 text-red-500 hover:text-red-700 hover:bg-gray-100 transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 size={12} />
                          <span className="text-xs">Delete</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
          )}
        </table>
        </DndContext>
      </div>

      {/* Mobile & Tablet Card View */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:hidden">
        {currentData.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl shadow p-4 space-y-3"
          >
            <div className="flex justify-between items-center border-b pb-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {currentModule === "commercial"
                  ? "Project No"
                  : currentModule === "print media"
                  ? "Order ID"
                  : "Matter No"}  
              </p>
              <p className="text-sm font-bold text-[#2E3D99] break-all">
                {currentModule === "commercial"
                  ? item.matterNumber
                  : currentModule === "print media"
                  ? item.orderId
                  : item.matternumber}
              </p>
            </div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-gray-500">
                  {currentModule === "commercial"
                    ? "Business Address"
                    : currentModule === "print media"
                    ? "Billing Address"
                    : "Property Address"}
                </p>
                <p className="text-sm break-words">
                  {item.businessAddress ||
                  item.property_address ||
                  item.billing_address ? (
                    <a
                      href={`https://www.google.com/maps?q=${encodeURIComponent(
                        item.businessAddress ||
                          item.property_address ||
                          item.billing_address
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {item.businessAddress ||
                        item.property_address ||
                        item.billing_address}
                    </a>
                  ) : (
                    item.businessAddress ||
                    item.property_address ||
                    item.billing_address
                  )}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  title="View Outstanding Tasks"
                  className="p-1 text-gray-700"
                  onClick={() => {
                    handelOTOpen();
                    handelOT(
                      currentModule === "commercial"
                        ? item.matterNumber
                        : item.matternumber || item.orderId
                    );
                  }}
                >
                  <ClipboardList size={20} />
                </button>
                <button
                  onClick={() => {
                    const id =
                      currentModule === "commercial"
                        ? item.matterNumber
                        : item.matternumber || item.orderId;
                    navigate(`/admin/client/stages/${id}`);
                  }}
                  className="p-1 text-black hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                  title="Edit"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() =>
                    onShare(
                      currentModule === "commercial"
                        ? item.matterNumber
                        : item.matternumber,
                      item.client_email
                    )
                  }
                  className="p-1 text-gray-600"
                  title="Share"
                >
                  <Share2 size={16} />
                </button>
                {currentModule === "print media" && (
                  <button
                    onClick={() => onDelete(item)}
                    className="p-1 text-red-500 hover:text-red-700"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-500">Client Name</p>
              <p className="font-semibold break-words">
                {item.clientName || item.client_name}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">
                {currentModule === "commercial"
                  ? "Business Address"
                  : currentModule === "print media"
                  ? "Billing Address"
                  : "Property Address"}
              </p>
              <p className="text-sm break-words">
                {item.businessAddress ||
                  item.property_address ||
                  item.billing_address}
              </p>
            </div>

            <div className="flex justify-between text-xs pt-2">
              <div>
                <p className="text-gray-500">
                  {currentModule === "commercial"
                    ? "Completion Date"
                    : currentModule === "print media"
                    ? "Delivery Date"
                    : "Settlement Date"}
                </p>
                <p>
                  {formatDate(
                    item.settlementDate ||
                      item.settlement_date ||
                      item.delivery_date
                  )}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Entered By</p>
                <p>
                  {item.dataEntryBy || item.dataentryby || item.data_entry_by}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">Stages</p>
              <div className="flex flex-wrap gap-1">
                {Object.keys(item?.stages?.[0] || {}).map((keyName, index) => (
                  <button
                    onClick={() => {
                      const path = `/admin/client/stages/${
                        currentModule === "commercial"
                          ? item.matterNumber
                          : item.matternumber || item.orderId
                      }/${index + 1}`;
                      navigate(path);
                    }}
                    key={keyName}
                    className="px-2 py-1 text-white rounded text-xs"
                    style={{
                      backgroundColor:
                        stageColorMap[item?.stages?.[0]?.[keyName]] ||
                        stageColorMap["default"],
                    }}
                  >
                    {keyName.toUpperCase()}
                  </button>
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
