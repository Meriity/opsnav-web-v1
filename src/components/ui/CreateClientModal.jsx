import ClientAPI from "../../api/userAPI";
import CommercialAPI from "../../api/commercialAPI";
import WillsAPI from "../../api/willsAPI";
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

// Helper function to get the initial form structure based on company and module
const getInitialFormData = (user, currentModule) => {
  if (currentModule === "commercial") {
    return {
      matterNumber: "",
      clientName: "",
      businessName: "",
      state: "",
      clientType: "",
      propertyAddress: "",
      businessAddress: "",
      postcode: "",
      matterDate: "",
      settlementDate: "",
      dataEntryBy: user,
    };
  } else if (currentModule === "conveyancing") {
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
  } else if (currentModule === "print media") {
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
      dataEntryBy: user,
    };
  } else if (currentModule === "wills") {
     return {
         matterNumber: "",
         clientName: "",
         clientType: "",
         state: "",
         postcode: "",
         email: "",
         phone: "",
         dataEntryBy: user
     }
  }
  return {};
};

export default function CreateClientModal({
  isOpen,
  setIsOpen,
  createType,
  onClose,
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
const idgDeliveryAddressRef = useRef(null);
const idgBillingAddressRef = useRef(null);
const conveyancingPropertyAddressRef = useRef(null);
const commercialBusinessAddressRef = useRef(null);

  const user = localStorage.getItem("user") || "";
  const currentModule = localStorage.getItem("currentModule");

  // --- DERIVED STATE & CONSTANTS ---
  const isCommercial = currentModule === "commercial";
  const isConveyancing = currentModule === "conveyancing";
  const isPrintMedia = currentModule === "print media";
  const isWills = currentModule === "wills";
  const api = new ClientAPI();
  const commercialApi = new CommercialAPI();
  const willsApi = new WillsAPI();

  // Replace with your actual Google Maps API key
  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GMAPS_APIKEY;

  // --- LOAD GOOGLE MAPS SCRIPT ---
  useEffect(() => {
    if ((isPrintMedia && (createType === "order" || createType === "client")) || isConveyancing || isCommercial) {
      loadGoogleMapsScript(GOOGLE_MAPS_API_KEY)
        .then(() => {
          setIsGoogleMapsLoaded(true);
        })
        .catch((error) => {
          console.error("Error loading Google Maps:", error);
          toast.error("Failed to load Google Maps. Please check your API key.");
        });
    }
  }, [isPrintMedia, isConveyancing, isCommercial, createType, GOOGLE_MAPS_API_KEY]);

  // --- INITIALIZE GOOGLE MAPS AUTOCOMPLETE FOR ADDRESS FIELDS ---
  const initializeAutocomplete = (inputRef, onPlaceSelected) => {
    if (!inputRef.current || !window.google) return null;

    const autocomplete = new window.google.maps.places.Autocomplete(
      inputRef.current,
      {
        types: ["address"],
        componentRestrictions: { country: ["au", "us", "gb", "ca"] },
      }
    );

    const listener = autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (place.geometry && place.address_components) {
        onPlaceSelected(place);
      }
    });

    return { autocomplete, listener };
  };

  // --- GOOGLE MAPS AUTOCOMPLETE INITIALIZATION ---
  useEffect(() => {
    // Only run this effect for the IDG order form.
    if (!isPrintMedia || createType !== "order") {
      return;
    }

    let autocompleteInstance = null;
    let placeChangedListener = null;

    loadGoogleMapsScript(GOOGLE_MAPS_API_KEY)
      .then(() => {
        // Ensure the input element is mounted before initializing.
        if (idgDeliveryAddressRef.current && window.google) {
          autocompleteInstance = new window.google.maps.places.Autocomplete(
            idgDeliveryAddressRef.current,
            {
              types: ["address"],
              // componentRestrictions: { country: ["au", "us", "gb", "ca"] },
            }
          );

          // Add a listener for when the user selects a place.
          placeChangedListener = autocompleteInstance.addListener(
            "place_changed",
            () => {
              const place = autocompleteInstance.getPlace();

              if (!place.geometry || !place.address_components) {
                toast.warning(
                  "Please select a valid address from the dropdown."
                );
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
                if (types.includes("street_number"))
                  streetNumber = component.long_name;
                if (types.includes("route")) route = component.long_name;
                if (types.includes("locality")) locality = component.long_name;
                if (types.includes("administrative_area_level_1"))
                  state = component.short_name;
                if (types.includes("country")) country = component.long_name;
                if (types.includes("postal_code"))
                  postalCode = component.long_name;
              });

              const fullAddress =
                `${streetNumber} ${route}, ${locality}`.trim();

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
        toast.error(
          "Could not load address suggestions. Please check your API key."
        );
      });

    // --- Cleanup function ---
      return () => {
      if (placeChangedListener) {
        window.google.maps.event.removeListener(placeChangedListener);
      }
      if (autocompleteInstance && window.google) {
        window.google.maps.event.clearInstanceListeners(autocompleteInstance);
      }
    };
  }, [isOpen, isPrintMedia, createType]);

  // --- GOOGLE MAPS AUTOCOMPLETE FOR IDG CLIENT BILLING ADDRESS ---
  useEffect(() => {
    // Only run for IDG client form
    if (!isPrintMedia || createType !== "client") return;

    let autocompleteInstance = null;
    let placeChangedListener = null;

    loadGoogleMapsScript(GOOGLE_MAPS_API_KEY)
      .then(() => {
        if (idgBillingAddressRef.current && window.google) {
          autocompleteInstance = new window.google.maps.places.Autocomplete(
            idgBillingAddressRef.current,
            {
              types: ["address"],
              // componentRestrictions: { country: ["au", "us", "gb", "ca"] },
            }
          );

          placeChangedListener = autocompleteInstance.addListener(
            "place_changed",
            () => {
              const place = autocompleteInstance.getPlace();

              if (!place.geometry || !place.address_components) {
                toast.warning(
                  "Please select a valid address from the dropdown."
                );
                return;
              }

              let state = "";
              let country = "";
              let postalCode = "";

              place.address_components.forEach((component) => {
                const types = component.types;
                if (types.includes("administrative_area_level_1"))
                  state = component.short_name;
                if (types.includes("country")) country = component.long_name;
                if (types.includes("postal_code"))
                  postalCode = component.long_name;
              });

              setFormData((prev) => ({
                ...prev,
                billingAddress: place.formatted_address,
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
      });

    return () => {
      if (placeChangedListener) {
        window.google.maps.event.removeListener(placeChangedListener);
      }
      if (autocompleteInstance && window.google) {
        window.google.maps.event.clearInstanceListeners(autocompleteInstance);
      }
    };
  }, [isOpen, isPrintMedia, createType]);

  // --- GOOGLE MAPS AUTOCOMPLETE FOR CONVEYANCING PROPERTY ADDRESS ---
useEffect(() => {
  if (!isConveyancing || !isOpen) return;

  let autocompleteInstance = null;
  let placeChangedListener = null;

  loadGoogleMapsScript(GOOGLE_MAPS_API_KEY)
    .then(() => {
      if (conveyancingPropertyAddressRef.current && window.google) {
        autocompleteInstance = new window.google.maps.places.Autocomplete(
          conveyancingPropertyAddressRef.current,
          { types: ["address"], componentRestrictions: { country: ["au"] } }
        );

        placeChangedListener = autocompleteInstance.addListener(
          "place_changed",
          () => {
            const place = autocompleteInstance.getPlace();
            if (!place.geometry || !place.address_components) return;

            let postcode = "";
            let state = "";

            place.address_components.forEach((component) => {
              if (component.types.includes("postal_code"))
                postcode = component.long_name;
              if (component.types.includes("administrative_area_level_1"))
                state = component.short_name;
            });

            setFormData((prev) => ({
              ...prev,
              propertyAddress: place.formatted_address,
              postcode,
              state,
            }));
          }
        );
      }
    });

  return () => {
    if (placeChangedListener)
      window.google.maps.event.removeListener(placeChangedListener);
  };
}, [isOpen, isConveyancing]);

  // --- GOOGLE MAPS AUTOCOMPLETE FOR COMMERCIAL BUSINESS ADDRESS ---

useEffect(() => {
  if (!isCommercial || !isOpen) return;

  let autocompleteInstance = null;
  let placeChangedListener = null;

  loadGoogleMapsScript(GOOGLE_MAPS_API_KEY)
    .then(() => {
      if (commercialBusinessAddressRef.current && window.google) {
        autocompleteInstance = new window.google.maps.places.Autocomplete(
          commercialBusinessAddressRef.current,
          { types: ["address"], componentRestrictions: { country: ["au"] } }
        );

        placeChangedListener = autocompleteInstance.addListener(
          "place_changed",
          () => {
            const place = autocompleteInstance.getPlace();
            if (!place.geometry || !place.address_components) return;

            let postcode = "";
            let state = "";

            place.address_components.forEach((component) => {
              if (component.types.includes("postal_code"))
                postcode = component.long_name;
              if (component.types.includes("administrative_area_level_1"))
                state = component.short_name;
            });

            setFormData((prev) => ({
              ...prev,
              businessAddress: place.formatted_address,
              postcode,
              state,
            }));
          }
        );
      }
    });

  return () => {
    if (placeChangedListener)
      window.google.maps.event.removeListener(placeChangedListener);
  };
}, [isOpen, isCommercial]);


  // --- EFFECTS ---
  useEffect(() => {
    if (isOpen) {
      setFormData(getInitialFormData(user, currentModule));
      setMatterNumberError("");

      if (isPrintMedia) {
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
  }, [isOpen, createType, isPrintMedia, currentModule, user]);

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
    console.log(`Checking if matter number ${number} exists...`);

    if (currentModule === "commercial") {
      try {
        const response = await commercialApi.checkProjectExists(number);
        return response.exists || false;
      } catch (error) {
        // For commercial, 404 means project doesn't exist
        if (error.response?.status === 404 || error.message.includes("404")) {
          return false;
        }
        // For other errors, assume it exists to be safe
        return true;
      }
    } else if (currentModule === "wills") {
        try {
            const response = await willsApi.checkClientExists(number);
            return response.exists || false;
        } catch (error) {
            return false;
        }
    } else {
      try {
        const response = await api.checkClientExists(number);
        console.log("Raw API response:", response);
        console.log("Response type:", typeof response);
        console.log("Response keys:", Object.keys(response || {}));

        // Handle different response structures
        if (response && typeof response.exists === "boolean") {
          return response.exists;
        }

        // If response doesn't have exists property, check for other indicators
        if (response && response.message) {
          return (
            response.message.includes("exists") ||
            response.message.includes("already")
          );
        }

        return false;
      } catch (error) {
        console.error("Error checking matter number:", error);
        console.log("Error response:", error.response);

        // For conveyancing, handle specific error cases
        if (error.response?.status === 404) {
          return false; // 404 means doesn't exist
        }

        if (error.response?.status === 400) {
          // 400 might mean "already exists" in some APIs
          const message = error.response.data?.message || error.message || "";
          const exists =
            message.includes("exists") || message.includes("already");
          console.log("400 error - client exists:", exists);
          return exists;
        }

        console.log("Other error - assuming client doesn't exist to be safe");
        // For other errors, be conservative and assume it exists
        return false;
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    console.log("Form data before validation:", formData);

    try {
      if (isCommercial) {
        const requiredFields = [
          "matterNumber",
          "clientName",
          "businessName",
          "state",
          "clientType",
          "businessAddress",
          "postcode",
          "matterDate",
          "settlementDate",
        ];

        console.log(
          "Checking required fields:",
          requiredFields.map((field) => ({ field, value: formData[field] }))
        );

        if (requiredFields.some((field) => !formData[field])) {
          toast.error("Please fill all required fields.");
          setIsLoading(false);
          return;
        }

        // Check if project exists - handle 404 gracefully
        let exists = false;
        try {
          exists = await checkMatterNumberExists(formData.matterNumber);
        } catch (error) {
          // For commercial, 404 means project doesn't exist (which is good)
          if (error.response?.status === 404) {
            exists = false;
          } else {
            throw error;
          }
        }

        if (exists) {
          setMatterNumberError("This project number already exists");
          toast.error("A project with this number already exists.");
          setIsLoading(false);
          return;
        }

        try {
          const payload = {
            matterNumber: formData.matterNumber,
            clientName: formData.clientName,
            businessName: formData.businessName,
            state: formData.state,
            clientType: formData.clientType,
            businessAddress: formData.businessAddress,
            postcode: formData.postcode,
            matterDate: formData.matterDate,
            settlementDate: formData.settlementDate,
            dataEntryBy: formData.dataEntryBy,
          };

          console.log("Creating commercial project with payload:", payload);

          const response = await commercialApi.createProject(payload);
          console.log("Project creation response:", response);

          toast.success("Project created successfully!");

          // Navigate to the project stages
          setTimeout(() => {
            navigate(`/admin/client/stages/${formData.matterNumber}`);
          }, 1000);
        } catch (err) {
          console.error("Project creation error:", err);
          const msg = err?.response?.data?.message || err?.message || "";

          // SPECIFIC error for 500
          if (err?.response?.status === 500) {
            toast.error("Backend server error. Please contact support.");
          } else if (err?.response?.status === 400 || /exist/i.test(msg)) {
            setMatterNumberError("This project number already exists");
            toast.error("A project with this number already exists.");
          } else {
            throw err;
          }
        }
      } else if (isConveyancing) {
        // VKL CLIENT CREATION
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
        console.log("Matter number exists check result:", exists);

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
          console.log("Creating VKL client with payload:", payload);
          await api.createClient(payload);
          toast.success("Client created successfully!");
          navigate(`/admin/client/stages/${formData.matterNumber}`);
        } catch (err) {
          console.error("VKL client creation error:", err);
          const msg = err?.response?.data?.message || err?.message || "";
          if (err?.response?.status === 400 || /exist/i.test(msg)) {
            setMatterNumberError("This matter number already exists");
            toast.error("A client with this matter number already exists.");
          } else {
            throw err;
          }
        }
      } else if (isPrintMedia) {
        // IDG CLIENT/ORDER CREATION
        if (createType === "client") {
          const requiredFields = [
            "clientName",
            "contact",
            "password",
            "email",
            "billingAddress",
            "state",
            "postcode",
            "abn",
          ];
          console.log(formData);
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
            country: "Australia",
            state: formData.state,
            postcode: formData.postcode,
            abn: formData.abn,
          };
          await api.createIDGClient(payload);
          toast.success("Client created successfully!");
          navigate(`/admin/manage-clients`);
          if (typeof onClose === "function") onClose();
          
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
          if (typeof onClose === "function") onClose();
        }
      } else if (isWills) {
           const requiredFields = ["matterNumber", "clientName", "state", "postcode"];
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
               await willsApi.createProject(formData);
               toast.success("Client created successfully!");
               navigate(`/admin/client/stages/${formData.matterNumber}`);
               if (typeof onClose === "function") onClose();
           } catch {
               toast.error("Failed to create Wills client");
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

  // Get the appropriate title based on module and create type
  const getModalTitle = () => {
    if (isCommercial) return "Create Project";
    if (createType === "order") return "Create Order";
    if (createType === "order") return "Create Order";
    if (isWills) return "Create Wills Client";
    return "Create Client";
  };

  // --- RENDER ---
  return (
    <Dialog
      open={isOpen}
      onClose={() => setIsOpen(false)}
      className="relative z-[1000]"
    >
      {/* Glass morphism backdrop */}
      <DialogBackdrop className="fixed inset-0 bg-black/20 backdrop-blur-sm " />

      <div className="fixed inset-0 z-10 flex items-center justify-center p-4">
        {/* Glass morphism modal panel */}
        <DialogPanel className="relative bg-white/90 backdrop-blur-md rounded-xl w-full max-w-3xl shadow-2xl border border-white/20 max-h-[90vh] overflow-y-auto">
          {/* Close button */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 text-red-500 text-xl font-bold hover:scale-110 transition-transform z-10"
          >
            &times;
          </button>

          {/* Modal content */}
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6 text-center">
              {getModalTitle()}
            </h2>

            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* COMMERCIAL & VKL & WILLS FIELDS */}
              {(isCommercial || isConveyancing || isWills) && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1 font-medium">
                        {isCommercial ? "Project Number*" : "Matter Number*"}
                      </label>
                      <input
                        type="text"
                        name="matterNumber"
                        value={formData.matterNumber || ""}
                        onChange={handleChange}
                        pattern="[0-9]*"
                        inputMode="numeric"
                        className={`w-full px-4 py-2 rounded-md border ${
                          matterNumberError
                            ? "border-red-500"
                            : "border-gray-300"
                        } bg-white/80 backdrop-blur-sm`}
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
                        className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white/80 backdrop-blur-sm"
                        required
                      />
                    </div>
                  </div>
                  {isCommercial && (
                    <div>
                      <label className="block mb-1 font-medium">
                        Business Name*
                      </label>
                      <input
                        type="text"
                        name="businessName"
                        value={formData.businessName || ""}
                        onChange={handleChange}
                        className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white/80 backdrop-blur-sm"
                        required
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* <div>
                      <label className="block mb-1 font-medium">State*</label>
                      <div className="flex gap-2 flex-wrap">
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
                    </div> */}

                    {/* Show Client Type for Commercial and Conveyancing/VKL but maybe not Wills if not needed, else include */}
                    {(isCommercial || isConveyancing || isWills) && (
                    <div>
                      <label className="block mb-1 font-medium">Client Type*</label>
                      <div className="flex gap-4 mt-2">
                        {["Seller", "Buyer"].map((type) => (
                          <label key={type} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="clientType"
                              value={type}
                              checked={formData.clientType === type}
                              onChange={handleChange}
                            />
                            {type}
                          </label>
                        ))}
                      </div>
                    </div>
                    )}
                    <div>
                      <label className="block mb-1 font-medium">
                        Is purchaser a trustee?
                      </label>
                      <div className="flex gap-3 flex-wrap">
                        {["Yes", "No"].map((type) => (
                          <label
                            key={type}
                            className="inline-flex items-center gap-1"
                          >
                            <input
                              type="radio"
                              name="isTrustee"
                              value={type}
                              checked={formData.isTrustee === type}
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
                      {isCommercial ? "Business Address*" : "Property Address*"}
                    </label>
                    <input
                      type="text"
                      name={
                        isCommercial ? "businessAddress" : "propertyAddress"
                      }
                      value={
                        isCommercial
                          ? formData.businessAddress || ""
                          : formData.propertyAddress || ""
                      }
                      onChange={handleChange}
                      ref={
                        isCommercial
                          ? commercialBusinessAddressRef
                          : conveyancingPropertyAddressRef
                      }
                      className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white/80 backdrop-blur-sm"
                      required
                    />
                     <p className="text-xs text-gray-500 mt-1">
                      (Start typing to see suggestions)
                    </p>
                  </div>
                  
<div>
  <label className="block mb-1 font-medium">
    State*
    <span className="text-xs text-gray-500 ml-1">(Auto-filled)</span>
  </label>
  <input
    type="text"
    name="state"
    value={formData.state || ""}
    onChange={handleChange}
    className="w-full px-4 py-2 rounded-md border border-gray-300 bg-gray-100"
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
                      className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white/80 backdrop-blur-sm"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1 font-medium">
                        {isCommercial ? "Project Date*" : "Matter Date*"}
                      </label>
                      <input
                        type="date"
                        name="matterDate"
                        value={formData.matterDate || ""}
                        onChange={handleChange}
                        className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white/80 backdrop-blur-sm text-gray-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block mb-1 font-medium">
                        {isCommercial ? "Completion Date*" : "Settlement Date*"}
                      </label>
                      <input
                        type="date"
                        name="settlementDate"
                        value={formData.settlementDate || ""}
                        onChange={handleChange}
                        className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white/80 backdrop-blur-sm text-gray-500"
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              {/* IDG Client Fields */}
              {isPrintMedia && createType === "client" && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block mb-1 font-medium">
                        Client ID
                      </label>
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
                  {/* Add extra fields for Wills if needed, like Email/Phone */}
                  {isWills && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                              <label className="block mb-1 font-medium">Email</label>
                              <input
                                  type="email"
                                  name="email"
                                  value={formData.email || ""}
                                  onChange={handleChange}
                                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
                              />
                          </div>
                          <div>
                              <label className="block mb-1 font-medium">Phone</label>
                              <input
                                  type="tel"
                                  name="phone"
                                  value={formData.phone || ""}
                                  onChange={handleChange}
                                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
                              />
                          </div>
                      </div>
                  )}

                  {(isConveyancing) && (
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="isTrustee"
                      checked={formData.isTrustee || false}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          isTrustee: e.target.checked,
                        }))
                      }
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <label className="font-medium">Acting as Trustee?</label>
                  </div>
                  )}
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
                      <span className="text-xs text-gray-500 ml-2">
                          (Start typing to see suggestions)
                        </span>
                    </label>
                    <input
                      type="text"
                      name="billingAddress"
                      ref={idgBillingAddressRef}
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
                        value={formData.country || "Australia"}
                        readOnly
                        // onChange={handleChange}
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

              {/* IDG ORDER FIELDS */}
              {isPrintMedia && createType === "order" && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1 font-medium">Order ID</label>
                      <input
                        type="text"
                        value={id.orderId}
                        className="w-full px-4 py-2 rounded-md border border-gray-300 bg-gray-100/80 backdrop-blur-sm"
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
                        className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white/80 backdrop-blur-sm"
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
                        className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white/80 backdrop-blur-sm"
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
                      <label className="block mb-1 font-medium">
                        Priority*
                      </label>
                      <select
                        name="priority"
                        value={formData.priority || ""}
                        onChange={handleChange}
                        className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white/80 backdrop-blur-sm"
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
                        ref={idgDeliveryAddressRef}
                        type="text"
                        name="deliveryAddress"
                        value={formData.deliveryAddress || ""}
                        onChange={handleChange}
                        placeholder="Enter delivery address"
                        className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                        className="w-full px-4 py-2 rounded-md border bg-white/80 backdrop-blur-sm border-gray-300"
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
                        className="w-full px-4 py-2 rounded-md border bg-white/80 backdrop-blur-sm border-gray-300"
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
                        className="w-full px-4 py-2 rounded-md border bg-white/80 backdrop-blur-sm border-gray-300"
                      />
                    </div>
                  </div>

                  <div>
                    <div>
                      <label className="block mb-1 font-medium">
                        Order Date*
                      </label>
                      <input
                        type="date"
                        name="orderDate"
                        value={formData.orderDate || ""}
                        onChange={handleChange}
                        className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white/80 backdrop-blur-sm text-gray-500"
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
                        className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white/80 backdrop-blur-sm text-gray-500"
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
                        className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white/80 backdrop-blur-sm"
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
                  className={`w-full bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white font-semibold py-2 rounded-md transition-all ${
                    isLoading || matterNumberError
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-sky-600 hover:shadow-lg"
                  }`}
                >
                  {isLoading ? "Creating..." : getModalTitle()}
                </button>
              </div>
            </form>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
