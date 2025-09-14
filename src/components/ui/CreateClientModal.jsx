import ClientAPI from "../../api/userAPI";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

// Helper function to get the initial form structure based on company
const getInitialFormData = (company, user) => {
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
      clientId: "",
      clientName: "",
      contact: "",
      email: "",
      billingAddress: "",
      country: "",
      state: "",
      postcode: "",
      abn: "",
      // Fields for 'order' type
      client: "", // The selected client for an order
      category: "", // Order type
      priority: "",
      orderDate: new Date().toISOString().split("T")[0], // Defaults to today
      deliveryAddress: "",
      settlementDate: "", // Delivery date
      dataEntryBy: user,
    };
  }
  return {}; // Default empty state
};

export default function CreateClientModal({
  isOpen,
  setIsOpen,
  companyName,
  createType,
}) {
  // --- STATE MANAGEMENT ---
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({});
  const [matterNumberError, setMatterNumberError] = useState("");
  const [clients, setClients] = useState([]); // For IDG order client list
  const [id, setId] = useState({ clientId: "", orderId: "" });
  const navigate = useNavigate();

  // Assume user is available from context or props
  const user = "Current User"; // Replace with actual user data logic

  // --- DERIVED STATE & CONSTANTS ---
  const isVkl = companyName === "vkl";
  const isIdg = companyName === "idg";
  const todayISO = new Date().toISOString().split("T")[0];
  const api = new ClientAPI();

  // --- EFFECTS ---
  // Effect to initialize and reset the form when the modal opens
  useEffect(() => {
    if (isOpen) {
      // Reset form data and errors
      setFormData(getInitialFormData(companyName, user));
      setMatterNumberError("");

      // Generate IDs for IDG flows
      if (isIdg) {
        if (createType === "client") {
          setId({
            clientId: `IDG${Math.floor(10000000 + Math.random() * 90000000)}`,
            orderId: "",
          });
        } else if (createType === "order") {
          setId({
            clientId: "",
            orderId: `IDGORD${Math.floor(10000000 + Math.random() * 90000000)}`,
          });
          // Fetch existing clients for the dropdown
          const fetchClients = async () => {
            try {
              const fetchedClients = await api.getIDGClients(); 
              setClients(fetchedClients);
            } catch (error) {
              console.error("Failed to fetch clients:", error);
              toast.error("Could not load clients for selection.");
            }
          };
          fetchClients();
        }
      }
    }
  }, [isOpen, companyName, createType, isIdg]); // eslint-disable-line react-hooks/exhaustive-deps

  // --- HANDLERS ---
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "matterNumber") {
      if (!/^\d*$/.test(value)) return; // Allow only numeric input
      setMatterNumberError("");
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const checkMatterNumberExists = async (number) => {
    try {
      const response = await api.checkClientExists(number);
      return response.exists;
    } catch (error) {
      console.error("Error checking matter number:", error);
      return false; // Assume not exists on error to prevent blocking user
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isVkl) {
        // --- VKL Submission Logic ---
        const requiredFields = ["matterNumber", "clientName", "state", "clientType", "propertyAddress", "matterDate", "settlementDate"];
        if (requiredFields.some((field) => !formData[field])) {
          toast.error("Please fill all required fields.");
          setIsLoading(false);
          return;
        }

        const exists = await checkMatterNumberExists(formData.matterNumber);
        if (exists) {
          setMatterNumberError("This matter number already exists");
          toast.error("A client with this matter number already exists.");
          setIsLoading(false);
          return;
        }

        await api.createClient(formData);
        toast.success("Client created successfully!");
        navigate(`/admin/client/stages/${formData.matterNumber}`);

      } else if (isIdg) {
        // --- IDG Submission Logic ---
        if (createType === "client") {
          const requiredFields = ["clientName", "contact", "email", "billingAddress", "country", "state", "postcode","abn"];
          if (requiredFields.some((field) => !formData[field])) {
            toast.error("Please fill all required fields.");
            setIsLoading(false);
            return;
          }

          const payload = {
            clientId: id.clientId,
            name: formData.clientName,
            contact: formData.contact,
            email: formData.email,
            billingAddress: formData.billingAddress,
            country: formData.country,
            state: formData.state,
            postcode: formData.postcode,
            abn: formData.abn,
          };
          await api.createIDGClient(payload);
          toast.success("Client created successfully!");

        } else if (createType === "order") {
          // const requiredFields = ["orderId", "clientId", "orderType", "deliveryAddress","priority", "country", "state", "postCode","orderDate", "deliveryDate"];
          // if (requiredFields.some((field) => !formData[field])) {
          //   console.log(formData[field]);
          //   toast.error("Please fill all required fields.");
          //   setIsLoading(false);
          //   return;
          // }

          const payload = {
            orderId: id.orderId,
            clientId: formData.clientId,
            orderType: formData.orderType,
            priority: formData.priority,
            deliveryAddress: formData.deliveryAddress,
            country: formData.country,
            state: formData.state,
            postcode: formData.postCode,
            orderDate: formData.orderDate,
            deliveryDate: formData.deliveryDate,
          };
          await api.createIDGOrder(payload);
          toast.success("Order created successfully!");
        }
      }
      setIsOpen(false);
    } catch (error) {
      console.error("Error during submission:", error);
      toast.error(error.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- RENDER ---
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
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* VKL Fields */}
            {isVkl && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 font-medium">Matter Number*</label>
                    <input type="text" name="matterNumber" value={formData.matterNumber || ""} onChange={handleChange} pattern="[0-9]*" inputMode="numeric" className={`w-full px-4 py-2 rounded-md border ${matterNumberError ? "border-red-500" : "border-gray-300"} bg-white`} required />
                    {matterNumberError && <p className="text-red-500 text-sm mt-1">{matterNumberError}</p>}
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Client Name*</label>
                    <input type="text" name="clientName" value={formData.clientName || ""} onChange={handleChange} className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white" required />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 font-medium">State*</label>
                    <div className="flex gap-4 flex-wrap">
                      {["VIC", "NSW", "QLD", "SA"].map((stateOption) => (
                        <label key={stateOption} className="inline-flex items-center gap-1">
                          <input type="radio" name="state" value={stateOption} checked={formData.state === stateOption} onChange={handleChange} className="w-4 h-4" required />
                          <span>{stateOption}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Client Type*</label>
                    <div className="flex gap-4 flex-wrap">
                      {["Buyer", "Seller", "Transfer"].map((type) => (
                        <label key={type} className="inline-flex items-center gap-1">
                          <input type="radio" name="clientType" value={type} checked={formData.clientType === type} onChange={handleChange} className="w-4 h-4" required />
                          <span>{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                 {/* ... other VKL specific fields */}
              </>
            )}

            {/* IDG Client Fields */}
            {isIdg && createType === "client" && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 font-medium">Client ID</label>
                    <input type="text" value={id.clientId} className="w-full px-4 py-2 rounded-md border border-gray-300 bg-gray-100" disabled />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Client Name*</label>
                    <input type="text" name="clientName" value={formData.clientName || ""} onChange={handleChange} className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white" required />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 font-medium">Contact*</label>
                    <input type="text" name="contact" value={formData.contact || ""} onChange={handleChange} className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white" required />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Email*</label>
                    <input type="email" name="email" value={formData.email || ""} onChange={handleChange} className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white" required />
                  </div>
                </div>
                 <div>
                    <label className="block mb-1 font-medium">Billing Address*</label>
                    <input type="text" name="billingAddress" value={formData.billingAddress || ""} onChange={handleChange} className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white" required />
                  </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block mb-1 font-medium">Country*</label>
                    <input type="text" name="country" value={formData.country || ""} onChange={handleChange} className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white" required />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">State*</label>
                    <input type="text" name="state" value={formData.state || ""} onChange={handleChange} className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white" required />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Postcode*</label>
                    <input type="text" name="postcode" value={formData.postcode || ""} onChange={handleChange} className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white" required />
                  </div>
                </div>
                <div>
                  <label className="block mb-1 font-medium">ABN</label>
                  <input type="text" name="abn" value={formData.abn || ""} onChange={handleChange} className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white" />
                </div>
              </>
            )}

            {/* IDG Order Fields */}
            {isIdg && createType === "order" && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 font-medium">Order ID</label>
                    <input type="text" name="orderId" value={id.orderId} className="w-full px-4 py-2 rounded-md border border-gray-300 bg-gray-100" disabled />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Select Client*</label>
                    <select name="clientId" value={formData.clientId || ""} onChange={handleChange} className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white" required>
                      <option value="">Select a Client</option>
                      {clients.map((client) => (
                        <option key={client._id} value={client._id}>{client.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 font-medium">Order Type*</label>
                    <select name="orderType" value={formData.orderType || ""} onChange={handleChange} className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white" required>
                      <option value="">Select Order Type</option>
                      <option value="Real Estate">Real Estate</option>
                      <option value="Vehicle">Vehicle</option>
                      <option value="Commercial">Commercial</option>
                      <option value="Others">Others</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Priority*</label>
                    <select name="priority" value={formData.priority || ""} onChange={handleChange} className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white" required>
                      <option value="">Select Priority</option>
                      <option value="Standard">Standard</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>
                </div>
                <div>
                    <label className="block mb-1 font-medium">Delivery Address*</label>
                    <input type="text" name="deliveryAddress" value={formData.deliveryAddress || ""} onChange={handleChange} className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white" required />
                  </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block mb-1 font-medium">Country*</label>
                    <input type="text" name="country" value={formData.country || ""} onChange={handleChange} className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white" required />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">State*</label>
                    <input type="text" name="state" value={formData.state || ""} onChange={handleChange} className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white" required />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Postcode*</label>
                    <input type="text" name="postCode" value={formData.postCode || ""} onChange={handleChange} className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white" required />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 font-medium">Order Date*</label>
                    <input type="date" name="orderDate" value={formData.orderDate || todayISO} className="w-full px-4 py-2 rounded-md border border-gray-300 bg-gray-100 text-gray-500" readOnly />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Delivery Date*</label>
                    <input type="date" name="deliveryDate" value={formData.deliveryDate || ""} onChange={handleChange} className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-500" required />
                  </div>
                </div>
              </>
            )}

            {/* Shared Fields */}
            <div>
              <label className="block mb-1 font-medium">Data Entry By</label>
              <input type="text" value={localStorage.getItem("user")} readOnly className="w-full px-4 py-2 rounded-md border border-gray-300 bg-gray-100 text-gray-600" />
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button type="submit" disabled={isLoading || !!matterNumberError} className={`w-full bg-[#00AEEF] text-white font-semibold py-2 rounded-md transition-opacity ${isLoading || matterNumberError ? "opacity-50 cursor-not-allowed" : "hover:bg-sky-600"}`}>
                {isLoading ? "Creating..." : (createType === "order" ? "Create Order" : "Create Client")}
              </button>
            </div>
          </form>
        </DialogPanel>
      </div>
    </Dialog>
  );
}