import { useEffect, useState } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import Eye from "../../icons/Button icons/Frame 362.png"
import Pagination from './Pagination';

const Table = ({
  data,
  columns,
  onEdit,
  onDelete,
  OnEye,
  showActions = true,
  hoverEffect = true,
  tableClass = '',
  rowSpacing = 'py-1',
  headerBgColor = 'bg-[#D7F4FF]',
  itemsPerPage = 5,
  pagination = "absolute bottom-5 right-5 mt-4"
}) => {
  const [currentData, setCurrentData] = useState([])

  return (
    <div>
      <div className="font-bold w-full h-[70vh]">
        <div className="overflow-x-auto overflow-y-hidden w-full">
          <table className={`w-full ${tableClass} border-separate border-spacing-y-2`}>
            <thead>
              <tr className={`${headerBgColor}`}>
                {columns.map((column, colIndex) => (
                  <th
                    key={column.key}
                    className={`px-3 py-4 text-left text-sm font-bold text-black ${colIndex === 0 ? 'rounded-l-2xl' : ''
                      } ${colIndex === columns.length - 1 && !showActions ? 'rounded-r-2xl' : ''}`}
                  >
                    {column.title}
                  </th>
                ))}
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
                  className={`border shadow-2xs transition-all ${hoverEffect ? 'hover:bg-sky-50' : ''}`}
                  style={{ backgroundColor: 'white' }}
                >
                  {columns.map((column, colIndex) => (
                    <td
                      key={column.key}
                      className={`px-3 ${rowSpacing} text-sm text-black align-middle ${colIndex === 0 ? 'rounded-l-2xl' : ''
                        } ${colIndex === columns.length - 1 && !showActions ? 'rounded-r-2xl' : ''}`}
                    >
                      {item[column.key]}
                    </td>
                  ))}
                  {showActions && (
                    <td className={`px-3 ${rowSpacing} rounded-r-2xl`}>
                      <div className="flex items-center space-x-3">
                        {onEdit && (
                          <button
                            onClick={() => {
                              onEdit(item)
                              console.log(item)
                            }}
                            className="flex flex-col items-center space-y-1 p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit size={16} />
                            <span className="text-xs">Edit</span>
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(item)}
                            className="flex flex-col items-center space-y-1 p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                            <span className="text-xs">Delete</span>
                          </button>
                        )}
                        <div className="flex items-center space-x-3">
                          {OnEye && (
                            <button
                              onClick={() => onEdit(item.id)}
                              className="flex flex-col items-center space-y-1 p-2 py-4 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors"
                              title="Edit"
                            >
                              <img src={Eye} alt="" className='h-[20px]' />

                            </button>
                          )}
                        </div>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      <Pagination data={data} itemsPerPage={itemsPerPage} setCurrentData={setCurrentData} />
    </div>
  );
};

export default Table;