import { useEffect, useState, useRef } from 'react';
import { Dialog, DialogPanel } from '@headlessui/react';
import ClientAPI from "../../api/userAPI";
import { formatDate } from '../../utils/formatters';
import Loader from './Loader';

export default function OutstandingTasksModal({ open, onClose }) {
    const api = new ClientAPI();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        if (open) {
            fetchData(currentPage);
        }
    }, [open, currentPage]);

    const fetchData = async (page) => {
        setLoading(true);
        try {
            const response = await api.getAllOutstandingTasks();
            setData(response.results || []);
            setTotalPages(response.totalPages || 1);
        } catch (error) {
            console.error('Failed to fetch data:', error);
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

    return (
        <Dialog open={open} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 text-center overflow-hidden">
                <DialogPanel className="w-full max-w-6xl h-[90vh] flex flex-col transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all">
                    <div className="flex-grow overflow-y-auto">
                        <h2 className="text-2xl font-bold mb-4">Outstanding Tasks Report</h2>

                        <div className="mb-4">
                            <label className="text-sm font-semibold block mb-1">Matters Settling In</label>
                            <select className="w-[150px] px-3 py-2 rounded-md border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400">
                                <option>None</option>
                                <option>Two Weeks</option>
                                <option>Four Weeks</option>
                            </select>
                        </div>

                        {loading ? (
                            <Loader height={40} />
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm text-left border">
                                    <thead className="bg-blue-600 text-white">
                                        <tr>
                                            <th className="px-6 py-3 border">Matter No. and Client</th>
                                            <th className="px-6 py-3 border">Settlement Date</th>
                                            <th className="px-6 py-3 border">Stage</th>
                                            <th className="px-6 py-3 border">Tasks</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.length > 0 ? (
                                            data.map((item, idx) => {
                                                const stages = Object.entries(item.outstandingTasks || {}).filter(([_, tasks]) => tasks.length > 0);
                                                return stages.map(([stage, tasks], stageIdx) => (
                                                    <tr key={`${idx}-${stage}`} className="border">
                                                        {stageIdx === 0 && (
                                                            <>
                                                                <td rowSpan={stages.length} className="px-6 py-4 border align-top">
                                                                    {item.matterNumber} - {item.clientName}
                                                                </td>
                                                                <td rowSpan={stages.length} className="px-6 py-4 border align-top">
                                                                    {formatDate(item.settlementDate)}
                                                                </td>
                                                            </>
                                                        )}
                                                        <td className="px-6 py-4 border align-top">{stage}</td>
                                                        <td className="px-6 py-4 border align-top">
                                                            <ul className="list-disc list-inside space-y-1">
                                                                {tasks.map((task, i) => <li key={i}>{task}</li>)}
                                                            </ul>
                                                        </td>
                                                    </tr>
                                                ));
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan={4} className="text-center text-gray-500 py-6">No data available</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    <div className="mt-4 flex justify-between items-center">
                        <span className="text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
                        <div className="space-x-2">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="px-4 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                            >
                                Prev
                            </button>
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="px-4 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-2">
                        <button
                            onClick={onClose}
                            className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600"
                        >
                            Close
                        </button>
                        <button
                            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
                        >
                            Download
                        </button>
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    );
}
