import ClientAPI from "../../api/userAPI";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

// Helper function to determine the initial form state based on the company
// This ensures useState is called at the top level of the component
const getInitialFormData = () => {
  const company = localStorage.getItem("company");
  const user = localStorage.getItem("user");
  // const api = new ClientApiz();

  if (company === "vkl") {
    return {
      matterNumber: "",
      clientName: "",
      state: "",
      clientType: "",
      propertyAddress: "",
      matterDate: "",
      settlementDate: "",
      dataEntryBy: user,
    };
  } else if (company === "idg") {
    return {
      clientId: "", // This will be populated from the 'id' state on submit
      clientName: "",
      contact: "",
      email: "",
      billingAddress: "",
      // Fields for 'order' type
      client: "", // The selected client for an order
      category: "", // Order type
      orderDate: getFormattedDate(), // Defaults to today
      settlementDate: "", // Delivery date
      dataEntryBy: user,
    };
  }
  return {}; // Default empty state
};

// Helper function to format the date as DD/MM/YYYY
const getFormattedDate = () => {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const year = today.getFullYear();
  return `${day}/${month}/${year}`;
};


export default function CreateClientModal({ isOpen, setIsOpen, companyName, createType }) {
  const [isLoading, setIsLoading] = useState(false);
  const [matterNumberError, setMatterNumberError] = useState("");
  const navigate = useNavigate();

  // State for generated IDs, specific to 'idg' company
  const [id, setId] = useState({ clientId: "", orderId: "" });

  // CORRECTED: useState is now called once at the top level
  const [formData, setFormData] = useState(getInitialFormData);
  const [clients, setclients] = useState([]);

  // Effect to generate IDs and reset the form when the modal opens for 'idg'
  useEffect(() => {
    if (isOpen) {
      // CORRECTED: Reset form to its proper initial state, not an empty object
      setFormData(getInitialFormData());

      if (localStorage.getItem("company") === "idg") {
        const randomId = Math.floor(10000000 + Math.random() * 90000000);
        if (createType === "order") {
          setId({ clientId: "", orderId: randomId });
        } else {
          setId({ clientId: randomId, orderId: "" });
        }
      }
      // Fetch clients for 'idg' company
      const fetchClients = async () => {
      const api = new ClientAPI();
      const response = await api.getIDGClients();
            setclients(response.data);
            console.log("Clients fetched:", response.data);
      }
      fetchClients();

    }
  }, [isOpen, createType]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "matterNumber") {
      if (!/^\d*$/.test(value)) return; // Blocks non-numeric input
      setMatterNumberError(""); // Clear error when user types
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  async function checkMatterNumberExists(number) {
    try {
      const api = new ClientAPI();
      const response = await api.checkClientExists(number);
      return response.exists;
    } catch (error) {
      console.error("Error checking matter number:", error);
      return false;
    }
  }

  // --- SUBMIT HANDLER ---
  async function handleSubmit() {
    setIsLoading(true);
    const company = localStorage.getItem("company");
    const api = new ClientAPI();

    try {
      if (company === "vkl") {
        // --- VKL Submission Logic ---
        const requiredFields = [
          "matterNumber", "clientName", "state", "clientType",
          "propertyAddress", "matterDate", "settlementDate"
        ];
        if (requiredFields.some(field => !formData[field])) {
          toast.error("Please fill all required fields");
          return;
        }

        const exists = await checkMatterNumberExists(formData.matterNumber);
        if (exists) {
          setMatterNumberError("This matter number already exists");
          toast.error("A client with this matter number already exists");
          return;
        }

        await api.createClient(formData);
        toast.success("Client created successfully!");
        navigate(`/admin/client/stages/${formData.matterNumber}`);
        setIsOpen(false);

      } else if (company === "idg") {
        // --- IDG Submission Logic (Client or Order) ---
        if (createType === "client") {
          const requiredFields = ["clientName", "contact", "email", "billingAddress"];
          if (requiredFields.some(field => !formData[field])) {
            toast.error("Please fill all required fields");
            return;
          }

          const payload = {
            clientId: id.clientId,
            name: formData.clientName,
            contact: formData.contact,
            email: formData.email,
            billingAddress: formData.billingAddress,
          };

          await api.createIDGClient(payload);
          console.log("Submitting New IDG Client:", payload);
          // await api.createIdgClient(payload); // Replace with your actual API call
          toast.success("Client created successfully!");

        } else if (createType === "order") {
          const requiredFields = ["client", "category", "settlementDate"];
          if (requiredFields.some(field => !formData[field])) {
            toast.error("Please fill all required fields");
            return;
          }

          const payload = {
            orderId: id.orderId,
            clientId: formData.client,
            orderType: formData.category,
            deliveryDate: formData.settlementDate,
          };
          await api.createIDGOrder(payload);

          console.log("Submitting New IDG Order:", payload);
          // await api.createIdgOrder(payload); // Replace with your actual API call
          toast.success("Order created successfully!");
        }
        setIsOpen(false); // Close modal on success
      }
    } catch (error) {
      console.error("Error during submission:", error);
      toast.error(error.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-10">
      <DialogBackdrop className="fixed inset-0 bg-gray-500/75" />
      <div className="fixed inset-0 z-10 flex items-center justify-center p-4 overflow-y-auto">
        <DialogPanel className="max-w-500 relative transform overflow-hidden rounded-lg bg-[#F3F4FB] text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-3xl p-6">
          <button onClick={() => setIsOpen(false)} className="absolute top-4 right-5 text-red-500 text-xl font-bold hover:scale-110 transition-transform">
            &times;
          </button>
          <h2 className="text-2xl font-bold mb-6 text-center">
            {createType === "order" ? "Create Order" : "Create Client"}
          </h2>

          <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
            {/* --- Conditional Fields for VKL --- */}
            {companyName === "vkl" && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 font-medium">Matter Number*</label>
                    <input type="text" name="matterNumber" value={formData.matterNumber} onChange={handleChange} pattern="[0-9]*" inputMode="numeric" className={`w-full px-4 py-2 rounded-md border ${matterNumberError ? "border-red-500" : "border-gray-300"} bg-white`} required />
                    {matterNumberError && <p className="text-red-500 text-sm mt-1">{matterNumberError}</p>}
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Client Name*</label>
                    <input type="text" name="clientName" value={formData.clientName} onChange={handleChange} className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white" required />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 font-medium">State*</label>
                    <div className="flex gap-4 flex-wrap">
                      {["VIC", "NSW", "QLD", "SA"].map((stateOption) => (
                        <label
                          key={stateOption}
                          className="inline-flex items-center gap-1"
                        >
                          <input
                            type="radio"
                            name="state"
                            value={stateOption}
                            checked={formData.state === stateOption}
                            onChange={handleChange}
                            className="w-4 h-4"
                            required
                          />
                          <span>{stateOption}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Client Type*</label>
                    <div className="flex gap-4 flex-wrap">
                      {["Buyer", "Seller", "Transfer"].map((type) => (
                        <label
                          key={type}
                          className="inline-flex items-center gap-1"
                        >
                          <input
                            type="radio"
                            name="clientType"
                            value={type}
                            checked={formData.clientType === type}
                            onChange={handleChange}
                            className="w-4 h-4"
                            required
                          />
                          <span>{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block mb-1 font-medium">Property Address*</label>
                  <input type="text" name="propertyAddress" value={formData.propertyAddress} onChange={handleChange} className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white" required />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 font-medium">Matter Date*</label>
                    <input type="date" name="matterDate" value={formData.matterDate} onChange={handleChange} className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-500" required />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Settlement Date*</label>
                    <input type="date" name="settlementDate" value={formData.settlementDate} onChange={handleChange} className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-500" required />
                  </div>
                </div>
              </>
            )}

            {/* --- Conditional Fields for IDG --- */}
            {companyName === "idg" && createType === "client" && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 font-medium">Client ID</label>
                    <input type="text" name="clientId" value={id.clientId} className="w-full px-4 py-2 rounded-md border border-gray-300 bg-gray-100" disabled />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Client Name*</label>
                    <input type="text" name="clientName" value={formData.clientName} onChange={handleChange} className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white" required />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 font-medium">Contact*</label>
                    <input type="text" name="contact" value={formData.contact} onChange={handleChange} className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white" required />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Email*</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white" required />
                  </div>
                </div>
                <div>
                  <label className="block mb-1 font-medium">Billing Address*</label>
                  <input type="text" name="billingAddress" value={formData.billingAddress} onChange={handleChange} className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white" required />
                </div>
              </>
            )}

            {companyName === "idg" && createType === "order" && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 font-medium">Order ID</label>
                    <input type="text" name="orderId" value={id.orderId} className="w-full px-4 py-2 rounded-md border border-gray-300 bg-gray-100" disabled />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Select Client*</label>
                    <select name="client" value={formData.client} onChange={handleChange} className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white" required >
                      <option value="">Select a Client</option>
                      {clients.map((client) => (
                        <option key={client.id} value={client._id}>
                          {client.name}
                        </option>
                      ))}

                    </select>
                  </div>
                </div>
                <div>
                  <label className="block mb-1 font-medium">Order Type*</label>
                  <select name="category" value={formData.category} onChange={handleChange} className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white" required >
                    <option value="">Select Order Type</option>
                    <option value="Real Estate">Real Estate</option>
                    <option value="Vehicle">Vehicle</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Others">Others</option>
                  </select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 font-medium">Order Date*</label>
                    <input type="date" name="orderDate" value={formData.orderDate} onChange={handleChange} className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-500" required readOnly />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Delivery Date*</label>
                    <input type="date" name="settlementDate" value={formData.settlementDate} onChange={handleChange} className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-500" required />
                  </div>
                </div>
              </>
            )}

            {/* --- Common Fields --- */}
            <div>
              <label className="block mb-1 font-medium">Data Entry By</label>
              <input type="text" value={localStorage.getItem("user") || ""} readOnly className="w-full px-4 py-2 rounded-md border border-gray-300 bg-gray-100 text-gray-600" />
            </div>

            {/* --- Submit Button --- */}
            <div className="pt-4">
              <button type="submit" disabled={isLoading || !!matterNumberError} className="w-full bg-[#00AEEF] text-white font-semibold py-2 rounded-md hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed" >
                {isLoading ? "Submitting..." : (createType === "order" ? "Create Order" : "Create Client")}
              </button>
            </div>
          </form>
        </DialogPanel>
      </div>
    </Dialog>
  );
}