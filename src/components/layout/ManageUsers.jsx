import { useState } from "react";
import { Search , Plus} from "lucide-react";
import Button from "../ui/Button";
import Table from "../ui/Table";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'

const ManageUsers = () => {
    const users = [
      {
    id: 1,
    displayName: "Vinu Kumar",
    email: "admin@vklawyers.com",
    status: "admin",
    role: "user",
    createdAt: "10-06-2025"
  },
  {
    id: 2,
    displayName: "Ananya Sharma",
    email: "ananya.sharma@example.com",
    status: "inactive",
    role: "admin",
    createdAt: "05-06-2025"
  },
  {
    id: 3,
    displayName: "Ravi Nair",
    email: "ravi.nair@domain.com",
    status: "active",
    role: "user",
    createdAt: "08-06-2025"
  },
  {
    id: 4,
    displayName: "Priya Menon",
    email: "priya.menon@example.org",
    status: "active",
    role: "admin",
    createdAt: "11-06-2025"
  },
  {
    id: 5,
    displayName: "Karthik Rao",
    email: "karthik.rao@company.in",
    status: "inactive",
    role: "user",
    createdAt: "06-06-2025"
  },
  {
    id: 6,
    displayName: "Meera Krishnan",
    email: "meera.krishnan@workspace.com",
    status: "active",
    role: "user",
    createdAt: "07-06-2025"
  },
  {
    id: 7,
    displayName: "Arjun Verma",
    email: "arjun.verma@mail.com",
    status: "active",
    role: "admin",
    createdAt: "09-06-2025"
  }
  ];

  const [openUser, setOpenUser] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  
  const columns = [
    { key: 'displayName', title: 'Display Name' },
    { key: 'email', title: 'Email' },
    { key: 'status', title: 'Status' },
    { key: 'role', title: 'Role' },
    { key: 'createdAt', title: 'Created At' },
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
    <div className="flex justify-between items-center mb-[15]">
      <h2 className="text-xl font-semibold">Hello Vinu</h2>
      <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm">
        <Search className="w-4 h-4 text-gray-500" />
        <input
          type="text"
          placeholder="Search by Matter Number, Client Name"
          className="outline-none text-sm bg-transparent"
          style={{ width: "250px", height: "25px" }}
        />
      </div>
    </div>

    {/* Manage Users Header */}
<div className="flex justify-between items-center w-full mb-[15]">
  <h2 className="text-2xl font-semibold">Manage Users</h2>
  <div className="shrink-0">
    <Button label="Create new user" icon={Plus} onClick={()=> setOpenUser(true)} />
  </div>
</div>


    {/* Table */}
    <div className="w-full">
      <Table
        data={users}
        columns={columns}
        onEdit={()=>setOpenEdit(true)}
        onDelete={()=>setOpenDelete(true)}
        itemsPerPage={5}
      />
    </div>
  </main>
      <Dialog open={openUser} onClose={setOpenUser} className="relative z-10">
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
          onClick={() => setOpenUser(false)}
          className="absolute top-4 right-5 text-red-500 text-3xl font-bold hover:scale-105 transition-transform"
        >
          &times;
        </button>

        {/* Title */}
        <h2 className="text-lg font-bold mb-4">Create User</h2>

        {/* Email input */}
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
        <Button label="Create user"></Button>
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

export default ManageUsers;