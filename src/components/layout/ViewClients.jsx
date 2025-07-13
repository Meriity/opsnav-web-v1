import { Search, Plus } from "lucide-react";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import Button from "../ui/Button";
import userplus from "../../icons/Button icons/Group 313 (1).png";
import remove from "../../icons/Button icons/remove.png";
import ViewClientsTable from "../ui/ViewClientsTable";
import { useEffect, useState } from "react";
import ClientAPI from "../../api/userAPI";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import Header from "../layout/Header"
import { toast } from 'react-toastify';
import DatePicker from "react-datepicker";
import { useNavigate } from "react-router-dom";

// ⬇ Zustand Store Definition (inline)
const useClientStore = create(
  persist(
    (set, get) => ({
      clients: [],
      loading: false,
      error: null,
      api: new ClientAPI(),

      fetchClients: async () => {
        set({ loading: true, error: null });
        const api = new ClientAPI();
        try {
          const response = await api.getClients();
          const formattedClients = response.map((client) => {
            return (
              {
                id: client._id,
                matternumber: client.matterNumber || "N/A",
                dataentryby: client.dataEntryBy || "N/A",
                client_name: client.clientName || "N/A",
                property_address: client.propertyAddress || "N/A",
                state: client.state || "N/A",
                client_type: client.clientType || "N/A",
                settlement_date: client.settlementDate
                  ? client.settlementDate.split("T")[0]
                  : "N/A",
                final_approval: client.matterDate
                  ? client.matterDate.split("T")[0]
                  : "N/A",
                building_pestinspect: "N/A",
                close_matter: client.closeMatter || "Active",
              }
            )
          })
          set({ clients: formattedClients });
        } catch (err) {
          console.error("Error fetching clients:", err);
          set({
            error: err.message,
            clients: [],
          });
        } finally {
          set({ loading: false });
        }
      },
    }),
    {
      name: "client-storage", // localStorage key
    }
  )
);

// ⬇ Component Start
const ViewClients = () => {
  // Dialogs and states
  const api = new ClientAPI();
  const [createuser, setcreateuser] = useState(false);
  const [outstandingTask, setOutstandingTask] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [shareDetails, setShareDetails] = useState({
    matterNumber: "",
    reshareEmail: "",
  });
  const [email, setemail] = useState("");
  const [isClicked, setIsClicked] = useState(false) // especially for send mail.
  const [outstandingTaskData, setOutstandingTaskData] = useState(null)
  const [settlementDate, setSettlementDate] = useState(null);
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const [clientList, setClientList] = useState(null)
    const navigate = useNavigate();
  

  const [formData, setFormData] = useState({
    matterNumber: "",
    clientName: "",
    state: "",
    clientType: "",
    propertyAddress: "",
    matterDate: "",
    settlementDate: "",
    dataEntryBy: localStorage.getItem("user")
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

   async function handleSubmit() {
    const matterNumber = formData.matterNumber;
    try {
      const api = new ClientAPI();
      await api.createClient(formData);
      toast.success("User created successfully!", {
        position: "bottom-center",
      });
      setcreateuser(false);
      navigate(`/admin/client/stages/${matterNumber}`);
    } catch(e) {
      console.log("Error", e);
      toast.error("User not created", {
        position: "bottom-center",
      });
    }
    console.log("Submitted Client Data:", formData);
  };


  // Zustand Store
  const {
    clients: Clients,
    fetchClients,
    loading,
    error,
  } = useClientStore();

  useEffect(() => {
    if (Clients.length === 0) fetchClients();
  }, []);

  useEffect(() => {
    setClientList(Clients || []);
  }, [Clients])

  useEffect(() => {
    if (!settlementDate) {
      setClientList(Clients);
      return;
    }

    const filtered = Clients.filter(client => {
      console.log('hi', client?.settlement_date, settlementDate, client?.settlement_date?.toString() == formatDate(settlementDate))
      if (client?.settlement_date?.toString() == formatDate(settlementDate)) return client
    });

    setClientList(filtered);
  }, [settlementDate, Clients])

  useEffect(() => {
    if (outstandingTask) {
      getAllOutstandingTasks()
    }
  }, [outstandingTask])

  async function getAllOutstandingTasks() {
    const response = await api.getAllOutstandingTasks();
    setOutstandingTaskData(response);
  }

  const columns = [
    { key: "matternumber", title: "Matter Number" },
    { key: "dataentryby", title: "Data Entry By" },
    { key: "client_name", title: "Client Name" },
    { key: "property_address", title: "Property Address" },
    { key: "state", title: "State" },
    { key: "client_type", title: "Client Type" },
    { key: "settlement_date", title: "Settlement Date" },
    { key: "final_approval", title: "Matter Date" },
    { key: "building_pestinspect", title: "Close Matter" },
  ];

  // Dummy task data
  const reportData = [
    {
      matterNumber: "3485348",
      clientName: "Warren Getten",
      settlementDate: "06-12-2024",
      stage: "Stage 5",
      tasks: ["dts", "duty online", "soa"],
    },
    {
      matterNumber: "3485333",
      clientName: "Emma Davis",
      settlementDate: "15-12-2024",
      stage: "Stage 4",
      tasks: ["form submission", "contract review"],
    },
    {
      matterNumber: "3485322",
      clientName: "John Smith",
      settlementDate: "20-12-2024",
      stage: "Stage 3",
      tasks: ["final payment", "title transfer"],
    },
  ];


  async function handelReShareEmail() {
    try {
      setIsClicked((prev) => !prev)
      await api.resendLinkToClient(email, shareDetails?.matterNumber);
      toast.success('Email send successfully.');
      handelShareEmailModalClose()
    } catch (error) {
      toast.error(error.message);
    }
  }

  const formatDate = (date) => {
    let newDate = new Date(date);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const handelShareEmailModalClose = () => {
    setShowShareDialog(false)
    setIsClicked(false)
    setemail("")
    setShareDetails({
      matterNumber: "",
      reshareEmail: "",
    })
  }

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

      <Dialog open={showShareDialog} onClose={() => handelShareEmailModalClose()} className="relative z-10">
        <DialogBackdrop className="fixed inset-0 bg-gray-500/75 transition-opacity" />

        <div className="fixed inset-0 z-10 flex items-center justify-center p-4">
          <DialogPanel className="w-full max-w-md bg-white rounded-lg shadow-xl p-6 relative">
            {/* Close button */}
            <button
              onClick={() => handelShareEmailModalClose()}
              className="absolute top-4 right-4 text-red-500 text-xl font-bold hover:scale-110 transition-transform"
            >
              &times;
            </button>

            {/* Title */}
            <h2 className="text-xl font-semibold mb-2 text-center">Share to Client</h2>

            {/* Description */}
            <p className="text-sm text-center text-gray-700 mb-4">
              Please enter the client email for matter No. :{" "}
              <span className="text-blue-500 underline cursor-pointer">{shareDetails?.matterNumber}</span>
            </p >

            {/* Email input with icon */}
            < div className="relative mb-4" >
              <input
                type="email"
                placeholder="Enter email address"
                value={email}
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
            </div >

            {/* Reshare notice */}
            {/* <p className="text-center text-sm text-gray-600 mb-4">
              Reshare link to <strong className="text-black">vinukumaraws@gmail.com</strong>
            </p> */}

            {/* Send Link button */}
            {
              isClicked ? <button
                className="w-full bg-[#00AEEF] text-white font-semibold py-2 rounded-md transition mb-3"
              >
                Sending...
              </button> : <button
                className="w-full bg-[#00AEEF] text-white font-semibold py-2 rounded-md hover:bg-sky-600 active:bg-sky-700 transition mb-3"
                onClick={handelReShareEmail}
              >
                Send Link
              </button>
            }


            {/* Manage Access */}
            <button
              className="w-full bg-[#EAF7FF] text-gray-700 font-medium py-2 rounded-md hover:bg-[#d1efff] transition"
            >
              Manage Access
            </button>
          </DialogPanel >
        </div >
      </Dialog >

        <Dialog open={createuser} onClose={() => setcreateuser(false)} className="relative z-10">
          <DialogBackdrop className="fixed inset-0 bg-gray-500/75" />
    
          <div className="fixed inset-0 z-10 flex items-center justify-center p-4 overflow-y-auto">
            <DialogPanel
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
    
              <form className="space-y-5" onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}>
                {/* Form fields remain the same as before */}
                {/* Matter Number & Client Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 font-medium">Matter Number</label>
                    <input
                      type="text"
                      name="matterNumber"
                      value={formData.matterNumber}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Client Name</label>
                    <input
                      type="text"
                      name="clientName"
                      value={formData.clientName}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white"
                    />
                  </div>
                </div>

                {/* State & Client Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 font-medium">State</label>
                    <div className="flex gap-4 flex-wrap">
                      {["VIC", "NSW", "QLD", "SA"].map((stateOption) => (
                        <label key={stateOption} className="inline-flex items-center gap-1">
                          <input
                            type="radio"
                            name="state"
                            value={stateOption}
                            checked={formData.state === stateOption}
                            onChange={handleChange}
                            className="w-4 h-4"
                          />
                          <span>{stateOption}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Client Type</label>
                    <div className="flex gap-4 flex-wrap">
                      {["Buyer", "Seller", "Transfer"].map((type) => (
                        <label key={type} className="inline-flex items-center gap-1">
                          <input
                            type="radio"
                            name="clientType"
                            value={type}
                            checked={formData.clientType === type}
                            onChange={handleChange}
                            className="w-4 h-4"
                          />
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
                    name="propertyAddress"
                    value={formData.propertyAddress}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white"
                  />
                </div>

                {/* Matter Date & Settlement Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 font-medium">Matter Date</label>
                    <input
                      type="date"
                      name="matterDate"
                      value={formData.matterDate}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Settlement Date</label>
                    <input
                      type="date"
                      name="settlementDate"
                      value={formData.settlementDate}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-500"
                    />
                  </div>
                </div>

                {/* Data Entry By */}
                <div>
                  <label className="block mb-1 font-medium">Data Entry By</label>
                  <input
                    type="text"
                    value={formData.dataEntryBy}
                    readOnly
                    className="w-full px-4 py-2 rounded-md border border-gray-300 bg-gray-100 text-gray-600"
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full bg-[#00AEEF] text-white font-semibold py-2 rounded-md hover:bg-sky-600"
                  >
                    Add New Client
                  </button>
                </div>
              </form>
            </DialogPanel>
          </div>
        </Dialog>

      {/* View Clients Layout */}
      <div className="min-h-screen w-full bg-gray-100 overflow-hidden">
        <main className="w-full max-w-7xl mx-auto space-y-6">

          {/* Header */}
          <Header />

          <div className="flex justify-between items-center w-full mb-[15]">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-semibold">View Clients</h2>
            </div>
            <div className="shrink-0 flex gap-7.5">
              <Button
                label="Create Client"
                bg="bg-[#00A506]"
                bghover="text-green-700"
                bgactive="text-green-900"
                Icon1={userplus}
                onClick={() => setcreateuser(true)}
              />
              <Button label="Outstanding Tasks" onClick={() => setOutstandingTask(true)} />
              <div className="relative inline-block">

                <Button
                  label={settlementDate ? formatDate(settlementDate) : 'Select Date'}
                  onClick={() => setOpenDatePicker(true)} bg="bg-[#FB4A52]"
                  bghover="text-red-800"
                  bgactive="text-red-950"
                  Icon2={remove}
                />

                {openDatePicker && (
                  <DatePicker
                    selected={settlementDate}
                    onChange={(date) => {
                      setSettlementDate(date);
                      setOpenDatePicker(false);
                    }}
                    onClickOutside={() => setOpenDatePicker(false)}
                    open={openDatePicker}
                    className="hidden"
                    popperPlacement="bottom-start"
                  />
                )}
              </div>
            </div >
          </div >

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              Error loading clients: {error}
            </div>
          )}

          {
            loading || !clientList ? (
              <div className="flex justify-center items-center py-8">
                <div className="text-lg">Loading clients...</div>
              </div>
            ) : clientList?.length == 0 ? (<div className="flex justify-center items-center py-8">
              <div className="text-lg">Data not found</div>
            </div>) : (
              <div className="w-full">
                <ViewClientsTable
                  data={clientList}
                  columns={columns}
                  onEdit={() => console.log("Edit hits")}
                  onDelete={() => console.log("Delete hits")}
                  itemsPerPage={5}
                  onShare={
                    (matterNumber, reshareEmail) => {
                      setShareDetails({ matterNumber, reshareEmail });
                      setShowShareDialog(true);
                    }
                  }
                  status={true}
                  ot={true}
                />
              </div>
            )
          }
        </main >
      </div >
    </>
  );
};

export default ViewClients;
