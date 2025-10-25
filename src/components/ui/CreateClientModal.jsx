import ClientAPI from "../../api/userAPI";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";


// Helper function to load Google Maps script
const loadGoogleMapsScript = (apiKey) => {
  return new Promise((resolve, reject) => {
    // Check if script already exists
    if (window.google && window.google.maps) {
      resolve();
      return;
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector(
      'script[src*="maps.googleapis.com"]'
    );
    if (existingScript) {
      existingScript.addEventListener("load", resolve);
      existingScript.addEventListener("error", reject);
      return;
    }

    // Create and load script
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.addEventListener("load", resolve);
    script.addEventListener("error", reject);
    document.head.appendChild(script);
  });
};

// Helper function to get the initial form structure based on company
const getInitialFormData = (company, user) => {
  if (company === "vkl") {
    return {
      matterNumber: "",
      clientName: "",
      state: "",
      clientType: "",
      propertyAddress: "",
      postcode: "",
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
      client: "",
      category: "",
      priority: "",
      orderDate: new Date().toISOString().split("T")[0],
      deliveryAddress: "",
      settlementDate: "",
      dataEntryBy: user,
    };
  }
  return {};
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
  const [clients, setClients] = useState([]);
  const [id, setId] = useState({ clientId: "", orderId: "" });
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
  const navigate = useNavigate();

  // Google Maps Autocomplete refs
  const addressInputRef = useRef(null);

  const user = localStorage.getItem("user") || "";

  // --- DERIVED STATE & CONSTANTS ---
  const isVkl = companyName === "vkl";
  const isIdg = companyName === "idg";
  const todayISO = new Date().toISOString().split("T")[0];
  const api = new ClientAPI();

  // Replace with your actual Google Maps API key
  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GMAPS_APIKEY;

  // --- LOAD GOOGLE MAPS SCRIPT ---
  useEffect(() => {
    if (isIdg && createType === "order") {
      console.log("Hello");
      loadGoogleMapsScript(GOOGLE_MAPS_API_KEY)
        .then(() => {
          setIsGoogleMapsLoaded(true);
        })
        .catch((error) => {
          console.error("Error loading Google Maps:", error);
          toast.error("Failed to load Google Maps. Please check your API key.");
        });
    }
  }, [isIdg, createType, GOOGLE_MAPS_API_KEY]);

  // --- GOOGLE MAPS AUTOCOMPLETE INITIALIZATION ---
  useEffect(() => {
    // Only run this effect for the IDG order form.
    if (!isIdg || createType !== "order") {
      return;
    }

    let autocompleteInstance = null;
    let placeChangedListener = null;

    loadGoogleMapsScript(GOOGLE_MAPS_API_KEY)
      .then(() => {
        // Ensure the input element is mounted before initializing.
        if (addressInputRef.current && window.google) {
          autocompleteInstance = new window.google.maps.places.Autocomplete(
            addressInputRef.current,
            {
              types: ["address"],
              componentRestrictions: { country: ["au", "us", "gb", "ca"] },
            }
          );

          // Add a listener for when the user selects a place.
          placeChangedListener = autocompleteInstance.addListener(
            "place_changed",
            () => {
              const place = autocompleteInstance.getPlace();

              if (!place.geometry || !place.address_components) {
                toast.warning("Please select a valid address from the dropdown.");
                return;
              }

              // Extract address components.
              let streetNumber = "";
              let route = "";
              let locality = "";
              let state = "";
              let country = "";
              let postalCode = "";

              place.address_components.forEach((component) => {
                const types = component.types;
                if (types.includes("street_number")) streetNumber = component.long_name;
                if (types.includes("route")) route = component.long_name;
                if (types.includes("locality")) locality = component.long_name;
                if (types.includes("administrative_area_level_1")) state = component.short_name;
                if (types.includes("country")) country = component.long_name;
                if (types.includes("postal_code")) postalCode = component.long_name;
              });
              
              const fullAddress = `${streetNumber} ${route}, ${locality}`.trim();

              // Update form data.
              setFormData((prev) => ({
                ...prev,
                deliveryAddress: fullAddress,
                state: state,
                country: country,
                postcode: postalCode,
              }));
            }
          );
        }
      })
      .catch((error) => {
        console.error("Error loading Google Maps:", error);
        toast.error("Could not load address suggestions. Please check your API key.");
      });

    // --- Cleanup function ---
    // This runs when the component unmounts to prevent memory leaks.
    return () => {
      if (placeChangedListener) {
        window.google.maps.event.removeListener(placeChangedListener);
      }
      if (autocompleteInstance && window.google) {
        window.google.maps.event.clearInstanceListeners(autocompleteInstance);
      }
    };
  }, [isOpen, isIdg, createType]);

  // --- EFFECTS ---
  useEffect(() => {
    if (isOpen) {
      setFormData(getInitialFormData(companyName, user));
      setMatterNumberError("");

      if (isIdg) {
        if (createType === "client") {
          setId({
            clientId: `IDG${Math.floor(10000000 + Math.random() * 90000000)}`,
            orderId: "",
          });
        } else if (createType === "order") {
          setId({
            clientId: "",
            orderId: `IDGORD${Math.floor(
              10000000 + Math.random() * 90000000
            )}`,
          });
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
  }, [isOpen, companyName, createType, isIdg]);

  // --- HANDLERS ---
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "matterNumber") {
      if (!/^\d*$/.test(value)) return;
      setMatterNumberError("");
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const checkMatterNumberExists = async (number) => {
    try {
      const response = await api.checkClientExists(number);
      if (response && typeof response.exists === "boolean")
        return response.exists;
      return false;
    } catch (error) {
      const serverMsg = error?.response?.data?.message;
      if (serverMsg && /exist/i.test(serverMsg)) {
        return true;
      }
      console.error("Error checking matter number:", error);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isVkl) {
        const requiredFields = [
          "matterNumber",
          "clientName",
          "state",
          "clientType",
          "propertyAddress",
          "postcode",
          "matterDate",
          "settlementDate",
        ];
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

        try {
          const payload = {
            ...formData,
            dataentryby: localStorage.getItem("user") || user,
          };
          await api.createClient(payload);
          toast.success("Client created successfully!");
        } catch (err) {
          const msg = err?.response?.data?.message || err?.message || "";
          if (err?.response?.status === 400 || /exist/i.test(msg)) {
            setMatterNumberError("This matter number already exists");
            toast.error("A client with this matter number already exists.");
          } else {
            throw err;
          }
        }
        navigate(`/admin/client/stages/${formData.matterNumber}`);
      } else if (isIdg) {
        if (createType === "client") {
          const requiredFields = [
            "clientName",
            "contact",
            "password",
            "email",
            "billingAddress",
            "country",
            "state",
            "postcode",
            "abn",
          ];
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
            password: formData.password,
            billingAddress: formData.billingAddress,
            country: formData.country,
            state: formData.state,
            postcode: formData.postcode,
            abn: formData.abn,
          };
          await api.createIDGClient(payload);
          toast.success("Client created successfully!");
        } else if (createType === "order") {
          const requiredFields = [
            "client",
            "orderType",
            "priority",
            "deliveryAddress",
            "orderDate",
            "deliveryDate",
            "order_details",
          ];
          if (requiredFields.some((field) => !formData[field])) {
            toast.error("Please fill all required fields.");
            setIsLoading(false);
            return;
          }

          const payload = {
            orderId: id.orderId,
            clientId: formData.client,
            orderType: formData.orderType,
            priority: formData.priority,
            deliveryAddress: formData.deliveryAddress,
            country: formData.country || "",
            state: formData.state || "",
            postcode: formData.postcode || "",
            orderDate: formData.orderDate,
            deliveryDate: formData.deliveryDate,
            order_details: formData.order_details,
          };
          console.log(payload);
          await api.createIDGOrder(payload);
          toast.success("Order created successfully!");
        }
      }
      setIsOpen(false);
    } catch (error) {
      console.error("Error during submission:", error);
      const serverMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        (typeof error?.message === "string" ? error.message : null);

      if (serverMessage) {
        if (/http error! status: 400/i.test(serverMessage)) {
          toast.error("A client with this matter number already exists.");
        } else {
          toast.error(serverMessage);
        }
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // --- RENDER ---
  return (
    <Dialog
      open={isOpen}
      onClose={() => setIsOpen(false)}
      className="relative z-10"
    >
      <DialogBackdrop className="fixed inset-0 bg-gray-500/75" />
      <div className="fixed inset-0 z-10 flex items-center justify-center p-4">
        <DialogPanel className="max-w-500 relative transform rounded-lg bg-[#F3F4FB] text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-3xl p-6 overflow-y-auto max-h-[90vh] xl:overflow-visible xl:max-h-none">
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-6 sm:top-4 right-5 text-red-500 text-xl font-bold hover:scale-110 transition-transform"
          >
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
                    <label className="block mb-1 font-medium">
                      Matter Number*
                    </label>
                    <input
                      type="text"
                      name="matterNumber"
                      value={formData.matterNumber || ""}
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
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">
                      Client Name*
                    </label>
                    <input
                      type="text"
                      name="clientName"
                      value={formData.clientName || ""}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white"
                      required
                    />
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
                    <label className="block mb-1 font-medium">
                      Client Type*
                    </label>
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
                  <label className="block mb-1 font-medium">
                    Property Address*
                  </label>
                  <input
                    type="text"
                    name="propertyAddress"
                    value={formData.propertyAddress || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium">Post code*</label>
                  <input
                    type="text"
                    name="postcode"
                    value={formData.postcode || ""}
                    onChange={handleChange}
                    pattern="^[0-9]{4}$"
                    maxLength={4}
                    inputMode="numeric"
                    className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 font-medium">
                      Matter Date*
                    </label>
                    <input
                      type="date"
                      name="matterDate"
                      value={formData.matterDate || ""}
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
                      value={formData.settlementDate || ""}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-500"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            {/* IDG Client Fields */}
            {isIdg && createType === "client" && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block mb-1 font-medium">Client ID</label>
                    <input
                      type="text"
                      value={id.clientId}
                      className="w-full px-4 py-2 rounded-md border border-gray-300 bg-gray-100"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">
                      Client Name*
                    </label>
                    <input
                      type="text"
                      name="clientName"
                      value={formData.clientName || ""}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">
                      Password*
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password || ""}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white"
                      required
                    />
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 font-medium">Contact*</label>
                    <input
                      type="text"
                      name="contact"
                      value={formData.contact || ""}
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
                      value={formData.email || ""}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block mb-1 font-medium">
                    Billing Address*
                  </label>
                  <input
                    type="text"
                    name="billingAddress"
                    value={formData.billingAddress || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block mb-1 font-medium">Country</label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country || ""}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">State</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state || ""}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Postcode</label>
                    <input
                      type="text"
                      name="postcode"
                      value={formData.postcode || ""}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block mb-1 font-medium">ABN</label>
                  <input
                    type="text"
                    name="abn"
                    value={formData.abn || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white"
                  />
                </div>
              </>
            )}

            {/* IDG Order Fields */}
            {isIdg && createType === "order" && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 font-medium">Order ID</label>
                    <input
                      type="text"
                      value={id.orderId}
                      className="w-full px-4 py-2 rounded-md border border-gray-300 bg-gray-100"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">
                      Select Client*
                    </label>
                    <select
                      name="client"
                      value={formData.client || ""}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white"
                      required
                    >
                      <option value="">Select a Client</option>
                      {clients.map((client) => (
                        <option key={client._id} value={client._id}>
                          {client.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 font-medium">
                      Order Type*
                    </label>
                    <select
                      name="orderType"
                      value={formData.orderType || ""}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white"
                      required
                    >
                      <option value="">Select Order Type</option>
                      <option value="Real Estate">Real Estate</option>
                      <option value="Vehicle">Vehicle</option>
                      <option value="Commercial">Commercial</option>
                      <option value="Others">Others</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Priority*</label>
                    <select
                      name="priority"
                      value={formData.priority || ""}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white"
                      required
                    >
                      <option value="">Select Priority</option>
                      <option value="Standard">Standard</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>
                </div>
                <div>
                  <div>
                    <label className="block mb-1 font-medium">
                      Delivery Address*
                      <span className="text-xs text-gray-500 ml-2">
                        (Start typing to see suggestions)
                      </span>
                    </label>
                    <input
                      ref={addressInputRef}
                      type="text"
                      name="deliveryAddress"
                      value={formData.deliveryAddress || ""}
                      onChange={handleChange}
                      placeholder="Enter delivery address"
                      className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                      autoComplete="off"
                    />
                  </div>
                  {!isGoogleMapsLoaded && (
                    <p className="text-xs text-gray-500 mt-1">
                      Loading address suggestions...
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block mb-1 font-medium">
                      Country
                      <span className="text-xs text-gray-500 ml-1">
                        (Auto-filled)
                      </span>
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country || ""}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-md border bg-white border-gray-300"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">
                      State
                      <span className="text-xs text-gray-500 ml-1">
                        (Auto-filled)
                      </span>
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state || ""}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-md border bg-white border-gray-300"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">
                      Postcode
                      <span className="text-xs text-gray-500 ml-1">
                        (Auto-filled)
                      </span>
                    </label>
                    <input
                      type="text"
                      name="postcode"
                      value={formData.postcode || ""}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-md border bg-white border-gray-300"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 font-medium">
                      Order Date*
                    </label>
                    <input
                      type="date"
                      name="orderDate"
                      value={formData.orderDate || ""}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">
                      Delivery Date*
                    </label>
                    <input
                      type="date"
                      name="deliveryDate"
                      value={formData.deliveryDate || ""}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-500"
                      required
                    />
                  </div>
                </div>
                <div>
                  <div>
                    <label className="block mb-1 font-medium">
                      Order Details*
                    </label>
                    <textarea
                      name="order_details"
                      value={formData.order_details || ""}
                      onChange={handleChange}
                      maxLength={200}
                      rows={2}
                      className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white"
                      required
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      {formData.order_details?.length || 0}/200 characters
                    </p>
                  </div>
                </div>
              </>
            )}

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading || !!matterNumberError}
                className={`w-full bg-[#00AEEF] text-white font-semibold py-2 rounded-md transition-opacity ${isLoading || matterNumberError
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-sky-600"
                  }`}
              >
                {isLoading
                  ? "Creating..."
                  : createType === "order"
                    ? "Create Order"
                    : "Create Client"}
              </button>
            </div>
          </form>
        </DialogPanel>
      </div>
    </Dialog>
  );
}