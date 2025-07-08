import Sidebar from "../../components/ui/Sidebar";
import Plus from "../../icons/Button icons/🔹Icon-Color.png"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { User, Users, Archive, Search} from "lucide-react";
import ManageUsersIcon from "../../icons/Sidebar icons/Manage_users.svg";
import ViewClientsIcon from "../../icons/Sidebar icons/ViewClients.svg";
import ArchivedChatsIcon from "../../icons/Sidebar icons/ArchievedClients.svg";
import { useState } from "react";

function Dashboard () {
  const [createuser,setcreateuser]=useState(false);

  const StatCard = ({ icon,label, value }) => (
  <div className="flex items-center p-4 bg-white rounded-md shadow-sm w-full space-between">
   <img src={icon} alt={label} className="h-10 w-30" />

    <div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-gray-600">{label}</p>
    </div>
  </div>
);

  const chartData = [
  { name: "jan", value: 450 },
  { name: "feb", value: 460 },
  { name: "mar", value: 520 },
  { name: "apr", value: 530 },
  { name: "may", value: 540 },
  { name: "jun", value: 500 },
  { name: "jul", value: 580 },
  { name: "aug", value: 510 },
  { name: "sep", value: 570 },
  { name: "oct", value: 650 },
];


  return (
    
    <div className="flex w-full h-full bg-gray-100">
      {/* Main Content */}
      <main className="flex-grow h-full space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Hello {localStorage.getItem("user")}</h2>
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

        {/* Welcome Card */}
        <div className="bg-[#A6E7FF] p-6 rounded-md h-[190px]">
          <h1 className="text-xl font-bold mt-3 font-poppins">Welcome to VK LAWYERS</h1>
          <p className="font-poppins text-sm mt-1 text-gray-800 max-w-5xl">
            We are a client-focused law firm committed to delivering expert legal solutions with integrity, professionalism, and personalized care.
          </p>

<button 
  className="mt-4 px-4 py-2 bg-white rounded-md font-medium hover:bg-sky-100 transition inline-flex items-center gap-2" 
  onClick={() => { 
    setcreateuser(true); 
  }}
>
  <img src={Plus} alt="" className="w-5" /> 
  <p>Add New Client</p>
</button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard icon={ManageUsersIcon} label="Total Users" value="20" />
          <StatCard icon={ViewClientsIcon} label="Total Clients" value="232" />
          <StatCard icon={ArchivedChatsIcon} label="Total Archives" value="502" />
        </div>

        {/* Chart */}
        <div className="bg-white p-6 rounded-md shadow-sm">
          <h2 className="text-base font-medium mb-4">Pending Matters</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#00AEEF" barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Footer Summary */}
        <p className="text-lg font-semibold mt-2">
          243 Matters Solved In Last Month
        </p>
      </main>
        <Dialog open={createuser} onClose={() => setcreateuser(false)} className="relative z-10">
            <DialogBackdrop className="fixed inset-0 bg-gray-500/75" />
      
            <div className="fixed inset-0 z-10 flex items-center justify-center p-4 overflow-y-auto">
                 <DialogPanel
              transition
              className="max-w-500 relative transform overflow-hidden rounded-lg bg-[#F3F4FB] text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-3xl data-closed:sm:translate-y-0 data-closed:sm:scale-95 p-6"
            >
                
                {/* Close Button */}
                <button
                  onClick={() => setcreateuser(false)}
                  className="absolute top-4 right-5 text-red-500 text-xl font-bold hover:scale-110 transition-transform"
                >
                  &times;
                </button>
      
                {/* Title */}
                <h2 className="text-2xl font-bold mb-6 text-center">Create Client</h2>
      
                <form className="space-y-5">
                  {/* Matter Number & Client Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1 font-medium">Matter Number</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white focus:ring-2 focus:ring-blue-400"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 font-medium">Client Name</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white focus:ring-2 focus:ring-blue-400"
                      />
                    </div>
                  </div>
      
                  {/* State & Client Type */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1 font-medium">State:</label>
                      <div className="flex gap-4 flex-wrap">
                        {['VIC', 'NSW', 'QLD', 'SA'].map((state) => (
                          <label key={state} className="inline-flex items-center gap-1">
                            <input type="checkbox" className="border-gray-300 w-4 h-4" />
                            <span>{state}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block mb-1 font-medium">Client Type:</label>
                      <div className="flex gap-4 flex-wrap">
                        {['Buyer', 'Seller', 'Transfer'].map((type) => (
                          <label key={type} className="inline-flex items-center gap-1">
                            <input type="checkbox" className="border-gray-300 w-4 h-4" />
                            <span>{type}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
      
                  {/* Property Address */}
                  <div>
                    <label className="block mb-1 font-medium">Property Address</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
      
                  {/* Matter Date & Settlement Date */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1 font-medium">Matter Date</label>
                      <input
                        type="date"
                        className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-500 focus:ring-2 focus:ring-blue-400"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 font-medium">Settlement Date</label>
                      <input
                        type="date"
                        className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-500 focus:ring-2 focus:ring-blue-400"
                      />
                    </div>
                  </div>
      
                  {/* Data Entry By */}
                  <div>
                    <label className="block mb-1 font-medium">Data Entry By</label>
                    <input
                      type="text"
                      value="Super Admin"
                      readOnly
                      className="w-full px-4 py-2 rounded-md border border-gray-300 bg-gray-100 text-gray-600"
                    />
                  </div>
      
                  {/* Add Client Button */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      className="w-full bg-[#00AEEF] text-white font-semibold py-2 rounded-md hover:bg-sky-600 active:bg-sky-700 transition"
                    >
                      Add New Client
                    </button>
                  </div>
                </form>
              </DialogPanel>
            </div>
          </Dialog>
    </div>
  );
};
export default Dashboard;
