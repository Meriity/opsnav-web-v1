import ClientAPI from "../../api/userAPI";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function CreateClientModal({
  isOpen,
  setIsOpen,
  company,
  createType,
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [matterNumberError, setMatterNumberError] = useState("");
  const navigate = useNavigate();

  const isVkl = (company || localStorage.getItem("company")) === "vkl";
  const isIdg = (company || localStorage.getItem("company")) === "idg";
  const todayISO = new Date().toISOString().split("T")[0];

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
  console.log(`${day}/${month}/${year}`);
  return `${day}/${month}/${year}`;
};


export default function CreateClientModal({ isOpen, setIsOpen, companyName, createType }) {
  const [isLoading, setIsLoading] = useState(false);
  const [matterNumberError, setMatterNumberError] = useState("");
  const navigate = useNavigate();

  // State for generated IDs, specific to 'idg' company
  const [id, setId] = useState({ clientId: "", orderId: "" });

  useEffect(() => {
    if (isOpen) {
      // Reset form and errors
      setFormData(initialFormData);
      setMatterNumberError("");

      // Setup IDs for IDG flows only when modal opens (avoid regen on every render)
      if (isIdg) {
        if (createType !== "order") {
          setId({
            clientId: `IDG${Math.floor(10000000 + Math.random() * 90000000)}`,
            orderId: "",
          });
        } else {
          setId({
            clientId: "",
            orderId: `IDGORD${Math.floor(10000000 + Math.random() * 90000000)}`,
          });
        }

        // Default IDG order date to today (preserve previous behaviour)
        if (createType === "order") {
          setFormData((prev) => ({ ...prev, matterDate: todayISO }));
        }
      }
    }
  }, [isOpen, createType, isIdg]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "matterNumber") {
      if (!/^\d*$/.test(value)) return; // Blocks non-numeric input
      setMatterNumberError("");
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
      return false; // assume not exists on error
    }
  }

  async function handleSubmit() {
    // VKL requires matter number
    if (isVkl && !formData.matterNumber) {
      setMatterNumberError("Matter number is required");
      return;
    }

    // Determine required fields by context
    const requiredFields = ["propertyAddress", "matterDate", "settlementDate"];
    if (isVkl) requiredFields.push("clientName", "state", "clientType");
    if (isIdg && createType === "client")
      requiredFields.push("clientName", "contact", "email");

    const missing = requiredFields.some((f) => !formData[f]);
    if (missing) {
      toast.error("Please fill all required fields", {
        position: "bottom-center",
      });
      return;
    }

    setIsLoading(true);

    try {
      // For VKL check matter number uniqueness
      if (isVkl) {
        const exists = await checkMatterNumberExists(formData.matterNumber);
        if (exists) {
          toast.error("A client with this matter number already exists", {
            position: "bottom-center",
          });
          setMatterNumberError("This matter number already exists");
          setIsLoading(false);
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
          console.log("Submitting New IDG Order:", payload);
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
    <Dialog
      open={isOpen}
      onClose={() => setIsOpen(false)}
      className="relative z-10"
    >
      <DialogBackdrop className="fixed inset-0 bg-gray-500/75" />

      <div className="fixed inset-0 z-10 flex items-center justify-center p-4 overflow-y-auto">
        <DialogPanel className="max-w-500 relative transform overflow-hidden rounded-lg bg-[#F3F4FB] text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-3xl data-closed:sm:translate-y-0 data-closed:sm:scale-95 p-6">
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-5 text-red-500 text-xl font-bold hover:scale-110 transition-transform"
          >
            &times;
          </button>

          <h2 className="text-2xl font-bold mb-6 text-center">
            {createType === "order"
              ? "Create Order"
              : createType === "client"
              ? "Create Client"
              : "Create"}
          </h2>

          <form
            className="space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            {/* Matter Number & Client Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {isVkl && (
                <>
                  <div>
                    <label className="block mb-1 font-medium">
                      Matter Number*
                    </label>
                    <input
                      type="text"
                      name="matterNumber"
                      value={formData.matterNumber}
                      onChange={handleChange}
                      pattern="[0-9]*"
                      inputMode="numeric"
                      className={`w-full px-4 py-2 rounded-md border ${
                        matterNumberError ? "border-red-500" : "border-gray-300"
                      } bg-white`}
                      required
                    />
                    {matterNumberError && (
                      <p className="text-red-500 text-sm mt-1">
                        {matterNumberError}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">
                      Client Name*
                    </label>
                    <input
                      type="text"
                      name="clientName"
                      value={formData.clientName}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white"
                      required
                    />
                  </div>
                </>
              )}

              {/* IDG: clientId / orderId shown (disabled) */}
              {isIdg && createType !== "order" && (
                <div>
                  <label className="block mb-1 font-medium">Client ID</label>
                  <input
                    type="text"
                    name="clientId"
                    value={id.clientId}
                    className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white"
                    disabled
                  />
                </div>
              )}

              {isIdg && createType === "order" && (
                <div>
                  <label className="block mb-1 font-medium">Order ID</label>
                  <input
                    type="text"
                    name="orderId"
                    value={id.orderId}
                    className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white"
                    disabled
                  />
                </div>
              )}

              {/* Shared client name for IDG client flow */}
              {(!isVkl || (isIdg && createType === "client")) && (
                <div>
                  <label className="block mb-1 font-medium">Client Name*</label>
                  <input
                    type="text"
                    name="clientName"
                    value={formData.clientName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white"
                    required
                  />
                </div>
              )}

              {/* IDG order: select existing client */}
              {isIdg && createType === "order" && (
                <div>
                  <label className="block mb-1 font-medium">
                    Select Client
                  </label>
                  <select
                    name="client"
                    value={formData.client || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white"
                    required
                  >
                    <option value="">Select</option>
                    <option value="idg_testing">IDG Testing</option>
                  </select>
                </div>
              )}
            </div>

            {/* State & Client Type (VKL) */}
            {isVkl && (
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
            )}

            {/* Order Type (IDG non-client flows) */}
            {isIdg && createType !== "client" && (
              <div>
                <label className="block mb-1 font-medium">Order Type</label>
                <select
                  name="category"
                  value={formData.category || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white"
                  required
                >
                  <option value="">Select</option>
                  <option value="real_estate">Real Estate</option>
                  <option value="vehicle">Vehicle</option>
                  <option value="commercial">Commercial</option>
                  <option value="others">Others</option>
                </select>
              </div>
            )}

            {/* Contact & Email for IDG Client */}
            {isIdg && createType !== "order" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-medium">Contact*</label>
                  <input
                    type="text"
                    name="contact"
                    value={formData.contact}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 font-medium">Billing Address*</label>
                    <input type="text" name="contact" value={formData.address} onChange={handleChange} className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white" required />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Country*</label>
                    <input type="email" name="email" value={formData.country} onChange={handleChange} className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white" required />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 font-medium">State*</label>
                    <input type="text" name="contact" value={formData.state} onChange={handleChange} className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white" required />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Postcode*</label>
                    <input type="email" name="text" value={formData.postcode} onChange={handleChange} className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white" required />
                  </div>
                </div>
                            <div>
              <label className="block mb-1 font-medium">ABN</label>
              <input type="text" value={formData.abn} className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-600" />
            </div>
              </div>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  <div>
                  <label className="block mb-1 font-medium">Priority*</label>
                  <select name="category" value={formData.category} onChange={handleChange} className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white" required >
                    <option value="">Select Order Type</option>
                    <option value="Standard">Standard</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                  </div>
                </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 font-medium">Delivery Address*</label>
                    <input type="text" name="contact" value={formData.address} onChange={handleChange} className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white" required />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Country*</label>
                    <input type="email" name="email" value={formData.country} onChange={handleChange} className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white" required />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 font-medium">State*</label>
                    <input type="text" name="contact" value={formData.state} onChange={handleChange} className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white" required />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Postcode*</label>
                    <input type="email" name="text" value={formData.postcode} onChange={handleChange} className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white" required />
                  </div>
                  </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 font-medium">Order Date*</label>
                    <input type="date" name="orderDate" value={new Date()} onChange={handleChange} className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-500" required readOnly />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Delivery Date*</label>
                    <input type="date" name="settlementDate" value={formData.settlementDate} onChange={handleChange} className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-500" required />
                  </div>
                </div>
              </>
            )}

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

            {/* Submit */}
            <div className="pt-4">
              {isLoading ? (
                <button
                  type="button"
                  disabled
                  className="w-full bg-sky-600 text-white py-2 rounded-md"
                >
                  Creating...
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!!matterNumberError}
                  className={`w-full bg-[#00AEEF] text-white font-semibold py-2 rounded-md ${
                    matterNumberError
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-sky-600"
                  }`}
                >
                  {createType === "order" ? "Create Order" : "Create Client"}
                </button>
              )}
            </div>
          </form>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
