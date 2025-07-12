import { useEffect, useState, useRef } from 'react';
import { Edit, Share2 } from 'lucide-react';
import report from "../../icons/Button icons/Group 318.png";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

// Stage color fetch hook
const useStageColors = (matterNumber) => {
  const [colors, setColors] = useState({});

  useEffect(() => {
    const fetchColors = async () => {
      if (!matterNumber) return;
      try {
        const response = await axios.get(
          `https://opsnav-app-service-871399330172.us-central1.run.app/clients/stage-colors?matterNumber=${matterNumber}`
        );
        setColors(response.data || {});
      } catch (error) {
        console.error("Error fetching stage colors for matter:", matterNumber, error);
        setColors({}); // fallback
      }
    };
    fetchColors();
  }, [matterNumber]);

  return colors;
};

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
  itemsPerPage = 5
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageRef = useRef(currentPage);
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = data.slice(startIndex, startIndex + itemsPerPage);
  const navigate = useNavigate();

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  useEffect(() => {
    pageRef.current = currentPage;
  }, [currentPage]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      setCurrentPage(prev => {
        if (e.key === 'ArrowRight') {
          return Math.min(prev + 1, totalPages);
        } else if (e.key === 'ArrowLeft') {
          return Math.max(prev - 1, 1);
        }
        return prev;
      });
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="max-w-[1228px] w-full">
      <div className="font-bold w-full overflow-x-auto">
        <div className="w-full">
          <table className={`w-full border-separate border-spacing-y-2 min-w-[700px] table-fixed ${tableClass}`}>
           <thead>
  <tr className={`${headerBgColor}`}>
    <th className="px-3 py-2 text-left text-sm font-bold text-black rounded-l-2xl" style={{ width: '80px' }}>
      <div className="truncate">Matter <br /> Number</div>
    </th>
    <th className="px-3 py-2 text-left text-sm font-bold text-black" style={{ width: '100px' }}>
      <div className="whitespace-normal leading-tight">Data Entry by</div>
    </th>
    <th className="px-3 py-2 text-left text-sm font-bold text-black" style={{ width: '100px' }}>
      <div className="whitespace-normal leading-tight">Client<br />Name</div>
    </th>
    <th className="px-3 py-2 text-left text-sm font-bold text-black" style={{ width: '140px' }}>
      <div>Property <br />Address</div>
    </th>
    <th className="px-3 py-2 text-left text-sm font-bold text-black" style={{ width: '70px' }}>
      <div>State</div>
    </th>
    <th className="px-3 py-2 text-left text-sm font-bold text-black" style={{ width: '70px' }}>
      <div>Type</div>
    </th>
    <th className="px-3 py-2 text-left text-sm font-bold text-black" style={{ width: '100px' }}>
      <div>Settlement Date</div>
    </th>
    <th className="px-3 py-2 text-left text-sm font-bold text-black" style={{ width: '100px' }}>
      <div>Final <br /> Approval</div>
    </th>
    <th className="px-3 py-2 text-left text-sm font-bold text-black" style={{ width: '130px' }}>
      <div>Building & <br />Pest Inspection</div>
    </th>

    {status && (
      <th className="px-3 py-2 text-left text-sm font-bold text-black" style={{ width: '120px' }}>
        <div>Stages</div>
      </th>
    )}
    {ot && (
      <th className="px-3 py-2 text-left text-sm font-bold text-black" style={{ width: '40px' }}>
        <div className="truncate">OT</div>
      </th>
    )}
    {showActions && (
      <th className="px-3 py-2 text-left text-sm font-bold text-black rounded-r-2xl" style={{ width: '80px' }}>
        <div className="truncate">Actions</div>
      </th>
    )}
  </tr>
</thead>

            <tbody>
              {currentData.map((item) => {
                const stageColors = useStageColors(item.matternumber); // Get colors for each row
                return (
                  <tr key={item.id} className={`bg-white transition-all rounded-2xl ${hoverEffect ? 'hover:bg-sky-50' : ''}`}>
                    {columns.map((column, colIndex) => (
                      <td
                        key={column.key}
                        className={`px-3 ${rowSpacing} text-sm text-black align-middle ${colIndex === 0 ? 'rounded-l-2xl' : ''} ${colIndex === columns.length - 1 && !showActions && !status && !ot ? 'rounded-r-2xl' : ''}`}
                        style={{
                          width: colIndex === 0 ? '60px' :
                                 colIndex === 1 ? '100px' :
                                 colIndex === 2 ? '100px' : 'auto',
                        }}
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
      {['s1', 's2', 's3', 's4', 's5'].map((stageKey) => {
        // Normalize color mapping
        const rawColor = stageColors[stageKey];
        const fallbackColor = 'red';
        const colorMap = {
          green: 'green',
          red: 'red',
          amber: '#f59e0b', 
          yellow: '#facc15',
          blue: '#3b82f6',
          default: fallbackColor
        };

        const color = colorMap[rawColor] || fallbackColor;

        return (
          <button
            key={stageKey}
            className="px-1 py-1 text-white rounded text-xs shrink-0"
            style={{ backgroundColor: color }}
            title={`Stage ${stageKey.toUpperCase()} - ${rawColor || 'missing'}`}
          >
            {stageKey.toUpperCase()}
          </button>
        );
      })}
    </div>
  </td>
)}


                    {ot && (
                      <td className={`px-1 items-center ${rowSpacing}`} style={{ width: '30px' }}>
                        <div className="flex justify-center">
                          <img src={report} alt="OT Report" className="w-5 h-5" />
                        </div>
                      </td>
                    )}

                    {showActions && (
                      <td className={`px-2 ${rowSpacing} rounded-r-2xl`} style={{ width: '80px' }}>
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
                            onClick={() => onShare(item.matter_number, item.client_email)}
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
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination (unchanged) */}
      <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 mt-4 ml-28">
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

export default ViewClientsTable;
