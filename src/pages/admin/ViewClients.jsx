// ⬇ Imports
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import Button from "../../components/ui/Button";
import userplus from "../../icons/Button icons/Group 313 (1).png";
import ViewClientsTable from "../../components/ui/ViewClientsTable";
import { useEffect, useState } from "react";
import ClientAPI from "../../api/userAPI";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import Header from "../../components/layout/Header"
import { toast } from 'react-toastify';
import OutstandingTasksModal from "../../components/ui/OutstandingTasksModal";
import Loader from "../../components/ui/Loader";
import CreateClientModal from "../../components/ui/CreateClientModal";
import DatePicker from "react-datepicker";
import moment from "moment";
import DateRangeModal from "../../components/ui/DateRangeModal";

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
                stages: client?.stages || []
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
  const [showOutstandingTask, setShowOutstandingTask] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [shareDetails, setShareDetails] = useState({
    matterNumber: "",
    reshareEmail: "",
  });
  const [email, setemail] = useState("");
  const [isClicked, setIsClicked] = useState(false) // especially for send mail.
  const [clientList, setClientList] = useState(null)
  const [otActiveMatterNumber, setOTActiveMatterNumber] = useState(null)
  const [settlementDate, setSettlementDate] = useState(["", ""]);
  const [showDateRange, setShowDateRange] = useState(false);
  const [startDate, endDate] = settlementDate;

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
    if (!startDate && !endDate) {
      setClientList(Clients);
    } else if (startDate !== "" && endDate !== "") {
      const filtered = Clients.filter(client => {
        const clientDate = moment(new Date(client?.settlement_date));
        return clientDate.isBetween(startDate, endDate, 'day', '[]');
      });
      setClientList(filtered);
    }

  }, [startDate, endDate, Clients])

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


  async function handelReShareEmail() {
    try {
      setIsClicked((prev) => !prev)
      await api.resendLinkToClient(email, shareDetails?.matterNumber);
      toast.success('Email send successfully.');
    } catch (error) {
      toast.error(error.message);
    } finally {
      handelShareEmailModalClose()
    }
  }

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
      <OutstandingTasksModal open={showOutstandingTask} onClose={(prev) => { setShowOutstandingTask(!prev), setOTActiveMatterNumber(null) }} activeMatter={otActiveMatterNumber} />

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

      {/* Create Client Modal */}
      <CreateClientModal isOpen={createuser} setIsOpen={() => setcreateuser(false)} />

      {/* Date Range Modal */}
      <DateRangeModal
        isOpen={showDateRange}
        setIsOpen={() => setShowDateRange(false)}
        subTitle="Select the date range to filter clients."
        handelSubmitFun={(fromDate, toDate) => {
          setSettlementDate([fromDate, toDate]);
          setShowDateRange(false);
        }}
      />

      {/* View Clients Layout */}
      <div className="min-h-screen w-full bg-gray-100 overflow-hidden">
        <main className="w-full max-w-8xl mx-auto">

          <Header />

          <div className="flex justify-between items-center w-full mb-[15] p-2">
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
              <Button label="Outstanding Tasks" onClick={() => setShowOutstandingTask(true)} />

              <Button label="Select Date Range" onClick={() => setShowDateRange(true)} />
            </div >
          </div >

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              Error loading clients: {error}
            </div>
          )}

          {
            loading || !clientList ? (
              <Loader />
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
                  handelOTOpen={() => setShowOutstandingTask(true)}
                  handelOT={setOTActiveMatterNumber}
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
