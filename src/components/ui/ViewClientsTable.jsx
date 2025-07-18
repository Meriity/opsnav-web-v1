import { useEffect, useState, useRef, useMemo } from 'react';
import { Edit, Share2, ChevronUp, ChevronDown } from 'lucide-react';
import report from "../../icons/Button icons/Group 318.png";
import { useNavigate } from "react-router-dom";
import Pagination from './Pagination';

const ViewClientsTable = ({
  data,
  columns,
  onEdit,
  onShare,
  showActions = true,
  status = false,
  ot = false,
  hoverEffect = true,
  tableClass = '',
  rowSpacing = 'py-3',
  headerBgColor = 'bg-[#D7F4FF]',
  itemsPerPage = 5,
  handelOTOpen,
  handelOT
}) => {
  const [currentData, setCurrentData] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const navigate = useNavigate();

  const stageColorMap = {
    green: 'green',
    red: 'red',
    amber: '#f59e0b',
    yellow: '#facc15',
    blue: '#3b82f6',
    default: "red"
  };

  const sortData = (dataToSort) => {
    if (!sortConfig.key) return dataToSort;

    return [...dataToSort].sort((a, b) => {
      const aVal = a[sortConfig.key] || '';
      const bVal = b[sortConfig.key] || '';

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const sortedData = useMemo(() => sortData(data), [data, sortConfig]);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  return (
    <div className="w-full overflow-x-auto">
      <div className="font-bold w-full min-h-[70vh]">
        <div className="w-full">
          <table className={`w-full border-separate border-spacing-y-2 min-w-[700px] table-fixed ${tableClass}`}>
            <thead>
              <tr className={`p-1 ${headerBgColor}`}>
                {columns.map((column, colIndex) => (
                  <th
                    key={column.key}
                    onClick={() => handleSort(column.key)}
                    className={`px-3 py-2 text-left text-sm font-bold text-black ${colIndex === 0 ? 'rounded-l-2xl' : ''} ${colIndex === columns.length - 1 && !showActions && !status && !ot ? 'rounded-r-2xl' : ''} cursor-pointer select-none`}
                    style={{ width: column.width || 'auto' }}
                  >
                    <div className="flex items-center gap-1">
                      {column.title}
                      {sortConfig.key === column.key && (sortConfig.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
                    </div>
                  </th>
                ))}

                {status && (
                  <th className="px-3 py-2 text-left text-sm font-bold text-black" style={{ width: '110px' }}>
                    <div>Stages</div>
                  </th>
                )}
                {ot && (
                  <th className="px-3 py-2 text-left text-sm font-bold text-black" style={{ width: '45px' }}>
                    <div className="truncate">OT</div>
                  </th>
                )}
                {showActions && (
                  <th className="px-3 py-2 text-left text-sm font-bold text-black rounded-r-2xl" style={{ width: '95px' }}>
                    <div className="truncate">Actions</div>
                  </th>
                )}
              </tr>
            </thead>

            <tbody>
              {currentData.map((item) => (
                <tr key={item.id} className={`bg-white transition-all rounded-2xl ${hoverEffect ? 'hover:bg-sky-50' : ''}`}>
                  {columns.map((column, colIndex) => (
                    <td
                      key={column.key}
                      className={`px-3 ${rowSpacing} text-sm text-black align-middle ${colIndex === 0 ? 'rounded-l-2xl' : ''} ${colIndex === columns.length - 1 && !showActions && !status && !ot ? 'rounded-r-2xl' : ''}`}
                      style={{ width: column.width || 'auto' }}
                    >
                      <div
                        className={`w-full overflow-hidden truncate ${['property_address', 'client_name', 'dataentryby'].includes(column.key) ? 'break-words leading-tight' : ''}`}
                        title={item[column.key]}
                      >
                        {['property_address', 'client_name', 'dataentryby'].includes(column.key)
                          ? (() => {
                            const text = item[column.key] || '';
                            const words = text.split(' ');
                            const mid = Math.ceil(words.length / 2);
                            return (
                              <>
                                <div>{words.slice(0, mid).join(' ')}</div>
                                <div>{words.slice(mid).join(' ')}</div>
                              </>
                            );
                          })()
                          : item[column.key]}
                      </div>
                    </td>
                  ))}

                  {status && (
                    <td className={`px-1 ${rowSpacing}`} style={{ width: '150px' }}>
                      <div className="flex flex-wrap gap-1 w-[80px]">
                        {Object.keys(item?.stages?.[0] || {}).map((keyName, index) => (
                          <a
                            href={`/admin/client/stages/${item.matternumber}/${(index + 1)}`}
                            key={keyName}
                            className="px-1 py-1 text-white rounded text-xs shrink-0 cursor-pointer"
                            style={{ backgroundColor: stageColorMap[item?.stages?.[0]?.[keyName]] || stageColorMap['default'] }}
                            title={`Stage ${keyName} - ${stageColorMap[item?.stages?.[0]?.[keyName]] || 'missing'}`}
                            target='_blank'
                          >
                            {keyName.toUpperCase()}
                          </a>
                        ))}
                      </div>
                    </td>
                  )}

                  {ot && (
                    <td className={`px-1 items-center ${rowSpacing}`} style={{ width: '30px' }}>
                      <div className="flex justify-center">
                        <button type="button" onClick={() => { handelOTOpen(); handelOT(item?.matternumber); }}>
                          <img src={report} alt="OT Report" className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  )}

                  {showActions && (
                    <td className={`px-3 ${rowSpacing} rounded-r-2xl`} style={{ width: '80px' }}>
                      <div className="flex items-center space-x-1">
                        {onEdit && (
                          <button
                            onClick={() => navigate(`/admin/client/stages/${item.matternumber}`)}
                            className="flex flex-col items-center space-y-1 p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit size={12} />
                            <span className="text-xs">Edit</span>
                          </button>
                        )}
                        <button
                          onClick={() => onShare(item.matternumber, item.client_email)}
                          className="flex flex-col items-center space-y-1 p-1 text-black hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
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
      </div>

      <Pagination data={sortedData} itemsPerPage={itemsPerPage} setCurrentData={setCurrentData} />
    </div>
  );
};

export default ViewClientsTable;
