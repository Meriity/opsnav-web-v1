import { useState } from "react";
import { Search, Plus, FileSpreadsheetIcon } from "lucide-react";
import Button from "../ui/Button";
import Table from "../ui/Table";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import userplus from "../../icons/Button icons/Group 313 (1).png";
import Header from "./Header";

const ArchievedClients = () => {
  const users = [
    {
      id: 1,
      matternumber: "2580824",
      client_name: "Vinu Kumar",
      property_address: "VIC Australia",
      state: "VIC",
      type: "Buyer",
      matter_date: "2025-07-03",
      settlement_date: "2025-07-04",
      email: "admin@vklawyers.com",
      status: "admin",
      role: "user",
      createdAt: "10-06-2025"
    },
    {
      id: 2,
      matternumber: "2580824",
      client_name: "Ananya Sharma",
      property_address: "VIC Australia",
      state: "VIC",
      type: "Buyer",
      matter_date: "2025-07-03",
      settlement_date: "2025-07-04",
      email: "ananya.sharma@example.com",
      status: "inactive",
      role: "admin",
      createdAt: "05-06-2025"
    },
    {
      id: 3,
      matternumber: "2580824",
      client_name: "Ravi Nair",
      property_address: "VIC Australia",
      state: "VIC",
      type: "Buyer",
      matter_date: "2025-07-03",
      settlement_date: "2025-07-04",
      email: "ravi.nair@domain.com",
      status: "active",
      role: "user",
      createdAt: "08-06-2025"
    },
    {
      id: 4,
      matternumber: "2580824",
      client_name: "Priya Menon",
      property_address: "VIC Australia",
      state: "VIC",
      type: "Buyer",
      matter_date: "2025-07-03",
      settlement_date: "2025-07-04",
      email: "priya.menon@example.org",
      status: "active",
      role: "admin",
      createdAt: "11-06-2025"
    },
    {
      id: 5,
      matternumber: "2580824",
      client_name: "Karthik Rao",
      property_address: "VIC Australia",
      state: "VIC",
      type: "Buyer",
      matter_date: "2025-07-03",
      settlement_date: "2025-07-04",
      email: "karthik.rao@company.in",
      status: "inactive",
      role: "user",
      createdAt: "06-06-2025"
    },
    {
      id: 6,
      matternumber: "2580824",
      client_name: "Meera Krishnan",
      property_address: "VIC Australia",
      state: "VIC",
      type: "Buyer",
      matter_date: "2025-07-03",
      settlement_date: "2025-07-04",
      email: "meera.krishnan@workspace.com",
      status: "active",
      role: "user",
      createdAt: "07-06-2025"
    },
    {
      id: 7,
      matternumber: "2580824",
      client_name: "Arjun Verma",
      property_address: "VIC Australia",
      state: "VIC",
      type: "Buyer",
      matter_date: "2025-07-03",
      settlement_date: "2025-07-04",
      email: "arjun.verma@mail.com",
      status: "active",
      role: "admin",
      createdAt: "09-06-2025"
    }
  ];

  const [openExcel, setOpenExcel] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openEye, setOpenEye] = useState(false);

  const columns = [
    { key: 'matternumber', title: 'Matter Number' },
    { key: 'client_name', title: 'Client Name' },
    { key: 'property_address', title: 'Property Address' },
    { key: 'state', title: 'State' },
    { key: 'type', title: 'Client Type' },
    { key: 'matter_date', title: 'Matter Date' },
    { key: 'settlement_date', title: 'Settlement Date' },
    { key: 'status', title: 'Status' },
  ];

  // const handleEdit = (id) => {
  //   console.log('Edit user:', id);
  // };

  const handleDelete = (id) => {
    console.log('Delete user:', id);
  };

  return (
    <div className="min-h-screen w-full bg-gray-100">
      <main className="w-full max-w-7xl mx-auto space-y-6">
        {/* Header */}

        <Header />

        {/* Manage Users Header */}
        <div className="flex justify-between items-center w-full mb-[15]">
          <h2 className="text-2xl font-semibold">Archived Clients</h2>
          <div className="shrink-0 flex gap-7.5">
            <Button label="Export to Excel" onClick={() => setOpenExcel(true)} />
            <Button label="Settlement Date" bg="bg-[#FB4A52]" Icon2={dropdownicon} bghover="text-red-800" bgactive="text-red-950" />
          </div>
        </div>


        {/* Table */}
        <div className="w-full">
          <Table
            data={users}
            columns={columns}
            OnEye={() => setOpenEye()}
            itemsPerPage={5}
          />
        </div>
      </main>
      <Dialog open={openExcel} onClose={setOpenExcel} className="relative z-10">
        <DialogBackdrop transition className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in" />

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-7 text-center">
            <DialogPanel
              transition
              className="relative transform overflow-hidden rounded-lg bg-[#F3F4FB] text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg data-closed:sm:translate-y-0 data-closed:sm:scale-95 p-6"
            >
              {/* Close button */}
              <button
                onClick={() => setOpenExcel(false)}
                className="absolute top-4 right-5 text-red-500 text-2xl font-bold hover:scale-110 transition-transform"
              >
                &times;
              </button>

              {/* Title */}
              <h2 className="text-lg font-bold mb-2">Export to Excel</h2>
              <p className="text-sm text-gray-600 mb-5">Matters settled in:</p>

              {/* Date Inputs */}
              <div className="space-y-4">
                <input
                  type="date"
                  placeholder="From"
                  className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-500"
                />
                <input
                  type="date"
                  placeholder="To"
                  className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-500"
                />
              </div>

              {/* Download Button */}
              <div className="mt-6">
                <button
                  className="w-full bg-[#00AEEF] text-white font-semibold py-2 rounded-md hover:bg-sky-600 active:bg-sky-700 transition"
                >
                  Download Excel
                </button>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>







      <Dialog open={openEdit} onClose={setOpenEdit} className="relative z-10">
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
        />

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel
              transition
              className="relative transform overflow-hidden rounded-lg bg-[#F3F4FB] text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg data-closed:sm:translate-y-0 data-closed:sm:scale-95 p-6"
            >
              {/* Close button */}
              <button
                onClick={() => setOpenEdit(false)}
                className="absolute top-4 right-5 text-red-500 text-3xl font-bold hover:scale-105 transition-transform"
              >
                &times;
              </button>

              {/* Title */}
              <h2 className="text-lg font-bold mb-4">Edit User</h2>

              {/* Email input */}
              <div className="relative mb-6">
                <input
                  type="name"
                  placeholder="Display name "
                  className="w-full px-4 py-3 pr-12 rounded-md bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div className="relative mb-6">
                <input
                  type="email"
                  placeholder="Enter email address"
                  className="w-full px-4 py-3 pr-12 rounded-md bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <span className="absolute inset-y-0 right-4 flex items-center text-gray-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M20 4H4C2.9 4 2 4.9 2 6v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2Zm0 4-8 5-8-5V6l8 5 8-5v2Z" />
                  </svg>
                </span>
              </div>

              {/* Role selection */}
              <div className="mb-6">
                <label className="block font-medium mb-2">Role</label>
                <div className="flex items-center gap-6">
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-5 h-5 border-gray-400" />
                    <span className="text-black font-medium">User</span>
                  </label>
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-5 h-5 border-gray-400" />
                    <span className="text-black font-medium">Admin</span>
                  </label>
                </div>
              </div>

              {/* Create button */}
              <Button label="Update"></Button>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
      <Dialog open={openDelete} onClose={setOpenDelete} className="relative z-10">
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
        />

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel
              transition
              className="relative transform overflow-hidden rounded-lg bg-[#F3F4FB] text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-md data-closed:sm:translate-y-0 data-closed:sm:scale-95 p-6"
            >
              {/* Close button */}
              <button
                onClick={() => setOpenDelete(false)}
                className="absolute top-4 right-5 text-red-500 text-3xl font-bold hover:scale-105 transition-transform"
              >
                &times;
              </button>

              {/* Title */}
              <h2 className="text-lg font-bold mb-4">Delete User</h2>

              {/* Message */}
              <p className="text-base font-medium mb-6">Are You Sure You Want To Delete User</p>

              {/* Delete Button */}
              <button
                onClick={handleDelete} // Replace with your actual delete handler
                className="w-full bg-red-600 text-white font-semibold py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </DialogPanel>
          </div>
        </div>
      </Dialog>



    </div>
  );
};

export default ArchievedClients;