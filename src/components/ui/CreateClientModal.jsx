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

  const initialFormData = {
    matterNumber: "",
    clientName: "",
    state: "",
    clientType: "",
    propertyAddress: "",
    matterDate: "",
    settlementDate: "",
    dataEntryBy: localStorage.getItem("user"),
    // IDG-specific controlled fields
    client: "",
    category: "",
    contact: "",
    email: "",
  };

  const [formData, setFormData] = useState(initialFormData);
  const [id, setId] = useState({ clientId: "", orderId: "" });

  // State for generated IDs, specific to 'idg' company
  const [id, setId] = useState({ clientId: "", orderId: "" });

  // CORRECTED: useState is now called once at the top level
  const [formData, setFormData] = useState(getInitialFormData);
  const [clients, setclients] = useState([]);

  // Effect to generate IDs and reset the form when the modal opens for 'idg'
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

  // --- SUBMIT HANDLER ---
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
    const company = localStorage.getItem("company");
    const api = new ClientAPI();

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
      }

      const api = new ClientAPI();
      const payload = { ...formData, ...id };
      await api.createClient(payload);

      toast.success("Client created successfully!", {
        position: "bottom-center",
      });

      const navigateTo = isVkl
        ? formData.matterNumber
        : id.clientId || id.orderId || formData.matterNumber;

      navigate(`/admin/client/stages/${navigateTo}`);
      setIsOpen(false);
    } catch (e) {
      console.error("Error creating client:", e);
      toast.error(
        "An error occurred. Please check the details and try again.",
        { position: "bottom-center" }
      );

    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-10">
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
            {createType === "order" ? "Create Order" : "Create Client"}
          </h2>
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
                <div>
                  <label className="block mb-1 font-medium">Email*</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white"
                    required
                  />
                </div>
              </div>
            )}

            {/* Property / Billing Address */}
            {createType !== "order" && (
              <div>
                <label className="block mb-1 font-medium">
                  {isVkl ? "Property Address*" : "Billing Address*"}
                </label>
                <input
                  type="text"
                  name="propertyAddress"
                  value={formData.propertyAddress}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white"
                  required
                />
              </div>
            )}

            {/* Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 font-medium">
                  {isVkl ? "Matter Date*" : "Order Date*"}
                </label>
                <input
                  type="date"
                  name="matterDate"
                  value={formData.matterDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-500"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">
                  {isVkl ? "Settlement Date*" : "Delivery Date*"}
                </label>
                <input
                  type="date"
                  name="settlementDate"
                  value={formData.settlementDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-500"
                  required
                />
              </div>
            </div>

            {/* --- Common Fields --- */}
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