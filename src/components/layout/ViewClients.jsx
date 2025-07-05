import { Search , Plus} from "lucide-react";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import Button from "../ui/Button";
import userplus from "../../icons/Button icons/Group 313 (1).png";
import dropdownicon from "../../icons/Button icons/Group 320.png";
import ViewClientsTable from "../ui/ViewClientsTable";
import { useState } from "react";


const ViewClients = () => {
  const [createuser,setcreateuser]=useState(false);
  const[outstandingTask,setOutstandingTask]=useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
const [shareDetails, setShareDetails] = useState({ matterNumber: '', reshareEmail: '' });
const [email,setemail]=useState("");

      const Clients = [
      {
    id: 1,
    matternumber: "3485348",
    dataentryby: "Vinu Kumar",
    client_name: "Lemon Hughes",
    property_address: "1/14 Phelan Drive,Cranbourne North",
    state: "NSW",
    client_type:"Buyer",
    settlement_date:"10-03-2025",
    final_approval:"10-03-2025",
    building_pestinspect:"10-03-2025",
  },
  {
    id: 2,
    matternumber: "9847323",
    dataentryby: "Aarav Sharma",
    client_name: "Olivia Thompson",
    property_address: "25 York Street, Sydney",
    state: "NSW",
    client_type: "Buyer",
    settlement_date: "15-03-2025",
    final_approval: "13-03-2025",
    building_pestinspect: "10-03-2025",
  },
  {
    id: 3,
    matternumber: "3289572",
    dataentryby: "Sneha Rao",
    client_name: "Daniel White",
    property_address: "5 Garden Grove, Melbourne",
    state: "VIC",
    client_type: "Seller",
    settlement_date: "12-03-2025",
    final_approval: "11-03-2025",
    building_pestinspect: "09-03-2025",
  },
  {
    id: 4,
    matternumber: "7458320",
    dataentryby: "John Mathew",
    client_name: "Emma Davis",
    property_address: "77 Hillside Road, Brisbane",
    state: "QLD",
    client_type: "Buyer",
    settlement_date: "20-03-2025",
    final_approval: "18-03-2025",
    building_pestinspect: "15-03-2025",
  },
  {
    id: 5,
    matternumber: "1983746",
    dataentryby: "Lakshmi Krishnan",
    client_name: "Mason Lee",
    property_address: "12 Ocean Blvd, Perth",
    state: "WA",
    client_type: "Buyer",
    settlement_date: "25-03-2025",
    final_approval: "22-03-2025",
    building_pestinspect: "20-03-2025",
  },
  {
    id: 6,
    matternumber: "5462731",
    dataentryby: "Ravi Menon",
    client_name: "Sophia Clark",
    property_address: "9 Baker Street, Adelaide",
    state: "SA",
    client_type: "Seller",
    settlement_date: "18-03-2025",
    final_approval: "16-03-2025",
    building_pestinspect: "14-03-2025",
  },
  {
    id: 7,
    matternumber: "8374652",
    dataentryby: "Nisha Patel",
    client_name: "Liam Hall",
    property_address: "88 Victoria Ave, Canberra",
    state: "ACT",
    client_type: "Buyer",
    settlement_date: "22-03-2025",
    final_approval: "20-03-2025",
    building_pestinspect: "17-03-2025",
  },
  {
    id: 8,
    matternumber: "6235981",
    dataentryby: "Karan Singh",
    client_name: "Ava King",
    property_address: "36 Pine Street, Darwin",
    state: "NT",
    client_type: "Seller",
    settlement_date: "28-03-2025",
    final_approval: "26-03-2025",
    building_pestinspect: "24-03-2025",
  },
  {
    id: 9,
    matternumber: "9023847",
    dataentryby: "Meera Joseph",
    client_name: "Noah Wright",
    property_address: "14 Maple Crescent, Hobart",
    state: "TAS",
    client_type: "Buyer",
    settlement_date: "30-03-2025",
    final_approval: "28-03-2025",
    building_pestinspect: "25-03-2025",
  },
  {
    id: 10,
    matternumber: "5739201",
    dataentryby: "Prakash Rao",
    client_name: "Isabella Green",
    property_address: "101 Sunset Blvd, Gold Coast",
    state: "QLD",
    client_type: "Buyer",
    settlement_date: "05-04-2025",
    final_approval: "03-04-2025",
    building_pestinspect: "01-04-2025",
  },
  {
    id: 11,
    matternumber: "6129834",
    dataentryby: "Anjali Mehta",
    client_name: "James Scott",
    property_address: "45 Dune Street, Newcastle",
    state: "NSW",
    client_type: "Seller",
    settlement_date: "07-04-2025",
    final_approval: "05-04-2025",
    building_pestinspect: "02-04-2025",
  }
];
    const columns = [
    { key: 'matternumber', title: 'Matter Number' },
    { key: 'dataentryby', title: 'Data Entry By' },
    { key: 'client_name', title: 'Client Name' },
    { key: 'property_address', title: 'Property Address' },
    { key: 'state', title: 'State' },
    { key: 'client_type', title: 'Client type' },
    { key: 'settlement_date', title: 'Settlement Date' },
    { key: 'final_approval', title: 'Final Approval' },
    { key: 'building_pestinspect', title: 'Building & Pest Inspect' },
  ];

  const reportData = [
  {
    matterNumber: "3485348",
    clientName: "Warren Getten",
    settlementDate: "06-12-2024",
    stage: "Stage 5",
    tasks: ["dts", "duty online", "soa"]
  },
  {
    matterNumber: "3485333",
    clientName: "Emma Davis",
    settlementDate: "15-12-2024",
    stage: "Stage 4",
    tasks: ["form submission", "contract review"]
  },
  {
    matterNumber: "3485322",
    clientName: "John Smith",
    settlementDate: "20-12-2024",
    stage: "Stage 3",
    tasks: ["final payment", "title transfer"]
  },
    {
    matterNumber: "3485322",
    clientName: "John Smith",
    settlementDate: "20-12-2024",
    stage: "Stage 3",
    tasks: ["final payment", "title transfer"]
  },
    {
    matterNumber: "3485322",
    clientName: "John Smith",
    settlementDate: "20-12-2024",
    stage: "Stage 3",
    tasks: ["final payment", "title transfer"]
  },
];


  return (
    <>
<Dialog open={outstandingTask} onClose={setOutstandingTask} className="relative z-10 max-h-[400px] overflow-hidden">
      <DialogBackdrop className="fixed inset-0 bg-gray-500/75 transition-opacity" />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center">
          <DialogPanel
        transition
        className="max-w-500 relative transform overflow-hidden rounded-lg bg-[#F3F4FB] text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-3xl data-closed:sm:translate-y-0 data-closed:sm:scale-95 p-6"
      >
  <div className="max-h-[500px] overflow-y-auto pr-2">
    {/* Close button */}

    {/* Title */}
    <h2 className="text-2xl font-bold mb-4">Outstanding Task Report</h2>

    {/* Matter Settling In Dropdown */}
    <div className="mb-4">
      <label className="text-sm font-semibold block mb-1">Matter Settling In</label>
      <div className="relative">
        <select
          className="w-[150px] px-3 py-2 rounded-md border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option>Select</option>
          <option>Two Weeks</option>
          <option>Four Weeks</option>
        </select>
      </div>
    </div>

    {/* Table */}
    <div className="mt-4 bg-[#F3F4FB] rounded-lg">
      <table className="min-w-full text-sm text-left">
        <thead className="bg-[#D5F3FF] text-black font-semibold">
          <tr>
            <th className="px-6 py-3">Matter Number & Client</th>
            <th className="px-6 py-3">Settlement Date</th>
            <th className="px-6 py-3">Stage</th>
            <th className="px-6 py-3">Tasks</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {reportData.length > 0 ? (
            reportData.map((item, index) => (
              <tr key={index} className="border-t">
                <td className="px-6 py-4">{item.matterNumber} – {item.clientName}</td>
                <td className="px-6 py-4">{item.settlementDate}</td>
                <td className="px-6 py-4">{item.stage}</td>
                <td className="px-6 py-4">
                  <ul className="list-disc list-inside space-y-1">
                    {item.tasks.map((task, idx) => (
                      <li key={idx}>{task}</li>
                    ))}
                  </ul>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className="text-center text-gray-500 py-6">No data available</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>

  {/* Download Button */}
  <div className="mt-6 flex justify-end gap-2">
     <button
      onClick={() => setOutstandingTask(false)}
      className="bg-[#FB4A52] text-white px-6 py-2 rounded-md hover:bg-red-800 active:bg-red-900 transition flex items-center gap-2"
    >
      Close
    </button>
    <button
      className="bg-[#00A506] text-white px-6 py-2 rounded-md hover:bg-green-700 active:bg-green-900 transition flex items-center gap-2"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        className="w-4 h-4"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
      </svg>
      Download
    </button>
    
  </div>
</DialogPanel>

        </div>
      </div>
    </Dialog>

        <Dialog open={showShareDialog} onClose={() => setShowShareDialog(false)} className="relative z-10">
      <DialogBackdrop className="fixed inset-0 bg-gray-500/75 transition-opacity" />

      <div className="fixed inset-0 z-10 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-md bg-white rounded-lg shadow-xl p-6 relative">
          
          {/* Close button */}
          <button
            onClick={() => setShowShareDialog(false)}
            className="absolute top-4 right-4 text-red-500 text-xl font-bold hover:scale-110 transition-transform"
          >
            &times;
          </button>

          {/* Title */}
          <h2 className="text-xl font-semibold mb-2 text-center">Share to Client</h2>

          {/* Description */}
          <p className="text-sm text-center text-gray-700 mb-4">
            Please enter the client email for matter No. :{" "}
            <span className="text-blue-500 underline cursor-pointer">{shareDetails.matterNumber}</span>
          </p>

          {/* Email input with icon */}
          <div className="relative mb-4">
            <input
              type="email"
              placeholder="Enter email address"
              value={shareDetails.reshareEmail}
              onChange={(e) => setemail(e.target.value)}
              className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400"
            />
            <span className="absolute inset-y-0 right-3 flex items-center text-gray-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M20 4H4C2.9 4 2 4.9 2 6v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2Zm0 4-8 5-8-5V6l8 5 8-5v2Z" />
              </svg>
            </span>
          </div>

          {/* Reshare notice */}
          <p className="text-center text-sm text-gray-600 mb-4">
            Reshare link to <strong className="text-black">vinukumaraws@gmail.com</strong>
          </p>

          {/* Send Link button */}
          <button
            className="w-full bg-[#00AEEF] text-white font-semibold py-2 rounded-md hover:bg-sky-600 active:bg-sky-700 transition mb-3"
          >
            Send Link
          </button>

          {/* Manage Access */}
          <button
            className="w-full bg-[#EAF7FF] text-gray-700 font-medium py-2 rounded-md hover:bg-[#d1efff] transition"
          >
            Manage Access
          </button>
        </DialogPanel>
      </div>
    </Dialog>

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

<div className="min-h-screen w-full bg-gray-100 overflow-hidden">
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
    <div className="flex justify-between items-center w-full mb-[15]">
      <h2 className="text-2xl font-semibold">View Clients</h2>
      <div className="shrink-0 flex gap-7.5">
        <Button label="Create Client" bg="bg-[#00A506]" bghover="text-green-700" bgactive="text-green-900" Icon1={userplus} onClick={()=> setcreateuser(true)} />
        <Button label="Outstanding Tasks"  onClick={()=>setOutstandingTask(true)} />
        <Button label="Settlement Date" bg="bg-[#FB4A52]" Icon2={dropdownicon} bghover="text-red-800" bgactive="text-red-950"  />
      </div>
    </div>
        {/* Table */}
        <div className="w-full">
          <ViewClientsTable
            data={Clients}
            columns={columns}
            onEdit={()=>console.log("Edit hits")}
            onDelete={()=>console.log("Delete hits")}
            itemsPerPage={5}
              onShare={(matterNumber, reshareEmail) => {
    setShareDetails({ matterNumber, reshareEmail });
    setShowShareDialog(true);
  }}
            status={true}
            ot={true}
          />
        </div>
    </main>
    </div>
    </>
  );
};

export default ViewClients;
