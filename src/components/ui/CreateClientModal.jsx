import ClientAPI from "../../api/userAPI";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function CreateClientModal({ isOpen, setIsOpen, companyName, createType }) {
  const [isLoading, setIsLoading] = useState(false);
  const [matterNumberError, setMatterNumberError] = useState("");
  const navigate = useNavigate();
  const [id,setId] = useState("");
  const [formData, setFormData] = useState({
    matterNumber: "",
    clientName: "",
    state: "",
    clientType: "",
    propertyAddress: "",
    matterDate: "",
    settlementDate: "",
    dataEntryBy: localStorage.getItem("user"),
  });

  useEffect(() => {
    if (isOpen && localStorage.getItem("company") === "idg") {
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
      setFormData({}); 
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
      return false; // Assume it doesn't exist if there's an error
    }
  }

  async function handleSubmit() {
    // Validate matter number first
    if (!formData.matterNumber) {
      setMatterNumberError("Matter number is required");
      return;
    }

    // Validate other required fields
    if (
      !formData.clientName ||
      !formData.state ||
      !formData.clientType ||
      !formData.propertyAddress ||
      !formData.matterDate ||
      !formData.settlementDate
    ) {
      toast.error("Please fill all required fields", {
        position: "bottom-center",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Check if matter number exists
      const exists = await checkMatterNumberExists(formData.matterNumber);
      if (exists) {
        toast.error("A client with this matter number already exists", {
          position: "bottom-center",
        });
        setMatterNumberError("This matter number already exists");
        return;
      }

      // If matter number doesn't exist, proceed with creation
      const api = new ClientAPI();
      await api.createClient(formData);
      toast.success("Client created successfully!", {
        position: "bottom-center",
      });
      navigate(`/admin/client/stages/${formData.matterNumber}`);
      setIsOpen(false); // Close the modal on success
    } catch (e) {
      console.error("Error creating client:", e);
      toast.error("This matter number already exists", {
        position: "bottom-center",
      });
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
          {/* Close Button */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-5 text-red-500 text-xl font-bold hover:scale-110 transition-transform"
          >
            &times;
          </button>

          {/* Title */}
          <h2 className="text-2xl font-bold mb-6 text-center">{createType === "order" ? "Create Order" : createType === "client" ? "Create Client" : "Create"}</h2>

          <form
            className="space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            {/* Matter Number & Client Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {localStorage.getItem("company") === "vkl" && <div>
                <label className="block mb-1 font-medium">Matter Number*</label>
                <input
                  type="text"
                  name="matterNumber"
                  value={formData.matterNumber}
                  onChange={handleChange}
                  pattern="[0-9]*"
                  inputMode="numeric"
                  className={`w-full px-4 py-2 rounded-md border ${matterNumberError ? "border-red-500" : "border-gray-300"
                    } bg-white`}
                  required
                />
                {matterNumberError && (
                  <p className="text-red-500 text-sm mt-1">
                    {matterNumberError}
                  </p>
                )}
              </div>}

              {localStorage.getItem("company") === "idg" && createType != "order" && <div>
                <label className="block mb-1 font-medium">Client ID</label>
                <input
                  type="text"
                  name="clientId"
                  value={id.clientId}
                  className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white"
                  disabled
                />
              </div>
              }

              {localStorage.getItem("company") === "idg" && createType === "order" && <div>
                <label className="block mb-1 font-medium">Order ID</label>
                <input
                  type="text"
                  name="clientId"
                  value={id.orderId}
                  className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white"
                  disabled
                />
              </div>
              }
              {localStorage.getItem("company") === "idg" && createType === "order" &&
                <div>
                  <label className="block mb-1 font-medium">Select Client</label>
                  <select
                    name="client"
                    value={formData.client || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        client: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white"
                    required
                  >
                    <option value="">Select</option>
                    <option value="idg_testing">IDG Testing</option>
                  </select>
                </div>
              }
              {localStorage.getItem("company") === "idg" && createType === "client" &&
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
              }
            </div>

            {/* State & Client Type */}
            {localStorage.getItem("company") === "vkl" &&
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
            }
            {localStorage.getItem("company") === "idg" && createType != "client" &&
              <div>
                <label className="block mb-1 font-medium">Order Type</label>
                <select
                  name="category"
                  value={formData.category || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white"
                  required
                >
                  <option value="">
                    Select
                  </option>
                  <option value="real_estate">Real Estate</option>
                  <option value="vehicle">Vehicle</option>
                  <option value="commercial">Commercial</option>
                  <option value="others">Others</option>
                </select>
              </div>
            }




            {localStorage.getItem("company") === "idg" && createType != "order" &&
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-medium">
                    Contact*
                  </label>
                  <input
                    type="text"
                    name="contact"
                    // value={formData.propertyAddress}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium">
                    Email*
                  </label>
                  <input
                    type="email"
                    name="contact"
                    // value={formData.propertyAddress}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white"
                    required
                  />
                </div>
              </div>
            }
            {/* Property Address */}
            {localStorage.getItem("company") === "vkl" &&
              <div>
                <label className="block mb-1 font-medium">
                  Property Address*
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
            }

            {createType != "order" && localStorage.getItem("company") === "idg" &&
              <div>
                <label className="block mb-1 font-medium">
                  Billing Address*
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
            }

            {/* Matter Date & Settlement Date */}
            {localStorage.getItem("company") === "idg" && createType != "client" &&
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-medium">Order Date*</label>
                  <input
                    type="date"
                    name="matterDate"
                    value={new Date().toISOString().split("T")[0]}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-500"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium">
                    Delivery Date*
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
            }

            {/* Matter Date & Settlement Date */}
            {localStorage.getItem("company") === "vkl" &&
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-medium">Matter Date*</label>
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
                    Settlement Date*
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
            }

            {/* Data Entry By */}
            <div>
              <label className="block mb-1 font-medium">Data Entry By</label>
              <input
                type="text"
                value={localStorage.getItem("user")}
                readOnly
                className="w-full px-4 py-2 rounded-md border border-gray-300 bg-gray-100 text-gray-600"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              {isLoading ? (
                <button
                  type="button"
                  disabled={true}
                  className="w-full bg-sky-600 text-white py-2 rounded-md"
                >
                  Creating...
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!!matterNumberError}
                  className={`w-full bg-[#00AEEF] text-white font-semibold py-2 rounded-md ${matterNumberError
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-sky-600"
                    }`}
                >
                  {createType === "client"
                    ? companyName === "idg"
                      ? "Create Client"
                      : "Create Client"
                    : createType === "order"
                      ? companyName === "idg"
                        ? "Create Order"
                        : "Create Order"
                      : "Add new Client"}
                </button>
              )}
            </div>
          </form>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
