import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/layout/Header";
import ViewClientsTable from "../../components/ui/ViewClientsTable";
import WillsAPI from "../../api/willsAPI";
import Loader from "../../components/ui/Loader";
import { toast } from "react-toastify";
import { formatDate } from "../../utils/formatters";
import { Search } from "lucide-react";
import ConfirmationModal from "../../components/ui/ConfirmationModal";

export default function ReferenceMatter() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
  const [selectedMatter, setSelectedMatter] = useState(null);
  const [matterNumberInput, setMatterNumberInput] = useState("");

  const navigate = useNavigate();
  const isAdminRoute = window.location.pathname.startsWith("/admin");
  const willsApi = useMemo(() => new WillsAPI(), []);

  useEffect(() => {
    fetchSubmittedForms();
  }, []);

  const fetchSubmittedForms = async () => {
    setLoading(true);
    try {
      const response = await willsApi.getSubmittedForms();
      console.log("Submitted forms response:", response);
      
      let formsArray = [];
      if (Array.isArray(response)) {
        formsArray = response;
      } else if (response && Array.isArray(response.data)) {
        formsArray = response.data;
      } else if (response && Array.isArray(response.forms)) {
        formsArray = response.forms;
      }
      
      const formattedData = formsArray.map((form) => ({
        id: form?._id || form?.id || form?.matterReferenceNumber || Math.random().toString(),
        reference_matter_number: form?.matterReferenceNumber || "N/A",
        client_name: form?.personal?.fullName || form?.clientName || "N/A",
        matter_status: form?.status || "Submitted",
        submitted_at: form?.createdAt ? formatDate(form.createdAt) : "N/A",
        ...form
      }));
      setData(formattedData);
    } catch (error) {
      console.error("Error fetching submitted forms:", error);
      toast.error("Failed to load reference matters");
    } finally {
      setLoading(false);
    }
  };

  const filteredData = useMemo(() => {
    if (!searchQuery) return data;
    const lowerQuery = searchQuery.toLowerCase();
    return data.filter(
      (item) =>
        (item.reference_matter_number || "").toLowerCase().includes(lowerQuery) ||
        (item.client_name || "").toLowerCase().includes(lowerQuery) ||
        (item.matter_status || "").toLowerCase().includes(lowerQuery) ||
        (item.email || "").toLowerCase().includes(lowerQuery)
    );
  }, [data, searchQuery]);

  const columns = [
    { key: "reference_matter_number", title: "Reference Matter Number", width: "22%" },
    { key: "client_name", title: "Client Name", width: "22%" },
    { key: "matter_status", title: "Matter Status", width: "20%" },
    { key: "submitted_at", title: "Submitted At", width: "21%" },
  ];

  const handleEditClick = (item) => {
    const matterNumber = item.reference_matter_number;
    const path = `/wills/form/v1/get-by-reference-number/${matterNumber}`;
    navigate(path);
  };

  const handleConvertClick = (item) => {
    setSelectedMatter(item);
    setMatterNumberInput("");
    setIsConvertModalOpen(true);
  };

  const handleConfirmConvert = async () => {
    if (!matterNumberInput.trim()) {
      toast.error("Please enter a matter number");
      throw new Error("Matter number required");
    }

    try {
      const payload = {
        matterReferenceNumber: selectedMatter.reference_matter_number,
        matterNumber: matterNumberInput.trim()
      };
      
      await willsApi.convertToMatter(payload);
      toast.success("Reference matter converted successfully!");
      setIsConvertModalOpen(false);
      fetchSubmittedForms(); // Refresh the list
    } catch (error) {
      console.error("Error converting matter:", error);
      toast.error(error.message || "Failed to convert reference matter");
      throw error;
    }
  };

  const handleUnlockForm = (item) => {
    setSelectedMatter(item);
    setIsUnlockModalOpen(true);
  };

  const handleConfirmUnlock = async () => {
    const referenceNumber = selectedMatter?.reference_matter_number;
    if (!referenceNumber || referenceNumber === "N/A") {
      toast.error("Reference number not found");
      return;
    }

    try {
      await willsApi.unlockForm(referenceNumber);
      toast.success("Form unlocked successfully!");
      setIsUnlockModalOpen(false);
      fetchSubmittedForms(); // Refresh the list
    } catch (error) {
      console.error("Error unlocking form:", error);
      toast.error(error.message || "Failed to unlock form");
      throw error;
    }
  };

  const handleDownloadDocx = async (item) => {
    const referenceNumber = item.reference_matter_number;
    if (!referenceNumber || referenceNumber === "N/A") {
      toast.error("Reference number not found");
      return;
    }

    const toastId = toast.loading("Preparing DOCX...");
    try {
      await willsApi.downloadDocx(referenceNumber);
      toast.update(toastId, { 
        render: "DOCX downloaded successfully!", 
        type: "success", 
        isLoading: false,
        autoClose: 3000 
      });
    } catch (error) {
      console.error("Error downloading DOCX:", error);
      toast.update(toastId, { 
        render: error.message || "Failed to download DOCX", 
        type: "error", 
        isLoading: false,
        autoClose: 3000 
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <Header />

      <main className="flex-1 space-y-4 p-2 relative z-10">
        <div className="flex flex-col gap-3 p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="max-w-3xl">
            <h1 className="text-base sm:text-lg lg:text-lg xl:text-xl 2xl:text-2xl font-bold text-gray-900 truncate">
              <span className="bg-linear-to-r from-[#2E3D99] to-[#1D97D7] bg-clip-text text-transparent">
                Reference Matter
              </span>
            </h1>
            <p className="text-gray-600 text-xs lg:text-xs xl:text-sm 2xl:text-base mt-1 line-clamp-2 lg:line-clamp-1 wrap-break-word font-sm lg:font-sm">
              Manage and view all Wills reference matters
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between mb-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search reference matters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl w-full md:w-80 focus:outline-none focus:ring-2 focus:ring-[#2E3D99] focus:border-transparent bg-white shadow-sm transition-all text-sm"
            />
          </div>
        </div>

        <div className="overflow-hidden">
          {loading ? (
            <div className="p-20">
              <Loader />
            </div>
          ) : (
            <ViewClientsTable
              data={filteredData}
              columns={columns}
              currentModule="wills"
              itemsPerPage={10}
              showStages={false}
              showTasks={false}
              onEdit={handleEditClick}
              onConvert={handleConvertClick}
              onDownloadDocx={handleDownloadDocx}
              onUnlock={handleUnlockForm}
              editText="Review"
              editTooltip="Review wills form"
            />
          )}
        </div>
      </div>
    </main>

      <ConfirmationModal
        isOpen={isConvertModalOpen}
        onClose={() => setIsConvertModalOpen(false)}
        onConfirm={handleConfirmConvert}
        title="Convert to Matter"
        confirmLabel="Convert Now"
        cancelLabel="Cancel"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            You are about to convert reference matter <span className="font-bold text-gray-900">{selectedMatter?.reference_matter_number}</span> to a permanent matter.
          </p>
          <div className="space-y-1.5">
            <label className="text-xs gap-2 flex items-center font-semibold text-gray-700 uppercase tracking-wider">Matter Number</label>
            <input
              type="text"
              value={matterNumberInput}
              onChange={(e) => setMatterNumberInput(e.target.value)}
              placeholder="e.g. 269590"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2E3D99] focus:border-transparent transition-all shadow-sm text-sm"
              autoFocus
            />
          </div>
        </div>
      </ConfirmationModal>
      
      <ConfirmationModal
        isOpen={isUnlockModalOpen}
        onClose={() => setIsUnlockModalOpen(false)}
        onConfirm={handleConfirmUnlock}
        title="Unlock Form"
        confirmLabel="Unlock Now"
        cancelLabel="Cancel"
      >
        <div className="py-2 space-y-2">
          <p className="text-gray-700">
            Are you sure you want to unlock the form for <span className="font-bold text-[#2E3D99]">{selectedMatter?.client_name}</span>?
          </p>
          <p className="text-gray-500 text-xs">
            This will enable the client to edit and resubmit their information.
          </p>
        </div>
      </ConfirmationModal>
    </div>
  );
}
