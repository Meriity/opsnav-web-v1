import Sidebar from "../../components/ui/Sidebar";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

import { User, Users, Archive, Search, Plus } from "lucide-react";
import ManageUsersIcon from "../../icons/Sidebar icons/Manage_users.svg";
import ViewClientsIcon from "../../icons/Sidebar icons/ViewClients.svg";
import ArchivedChatsIcon from "../../icons/Sidebar icons/ArchievedClients.svg";

function Dashboard () {

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
      <main className="flex-grow h-full px-4 space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Hello Vinu</h2>
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm">
            <Search className="w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search by Matter Number, Client Name"
              className="outline-none text-sm bg-transparent"
              style={{ width: "400px", height: "25px" }}
            />
          </div>
        </div>

        {/* Welcome Card */}
        <div className="bg-sky-200 p-6 rounded-md border border-sky-400">
          <h1 className="text-xl font-bold">Welcome to VK LAWYERS</h1>
          <p className="text-sm mt-1 text-gray-800 max-w-5xl">
            We are a client-focused law firm committed to delivering expert legal solutions with integrity, professionalism, and personalized care.
          </p>
          <button className="mt-4 px-4 py-2 bg-white text-sky-600 border border-sky-400 rounded-md font-medium hover:bg-sky-100 transition inline-flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add New Client
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
    </div>
  );
};
export default Dashboard;
