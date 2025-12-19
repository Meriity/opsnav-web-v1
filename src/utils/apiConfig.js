export const getApiBaseUrl = (module = null) => {
  const currentModule = module || localStorage.getItem("currentModule");
  const company = localStorage.getItem("company");

  // Handle different companies and their modules
  if (company === "vkl") {
    if (currentModule === "commercial") {
      return (
        import.meta.env.VITE_COMMERCIAL_API_BASE_URL ||
        import.meta.env.VITE_API_BASE_URL + "/commercial"
      );
    }
    // VKL other modules use base URL
    return import.meta.env.VITE_API_BASE_URL;
  } else if (company === "idg") {
    // IDG specific API endpoints
    return (
      import.meta.env.VITE_IDG_API_BASE_URL ||
      import.meta.env.VITE_API_BASE_URL + "/idg"
    );
  }

  // Default fallback
  return import.meta.env.VITE_API_BASE_URL;
};

export const getApiHeaders = () => {
  const token = localStorage.getItem("authToken");
  const company = localStorage.getItem("company");
  const currentModule = localStorage.getItem("currentModule");

  const headers = {
    "Content-Type": "application/json", 
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // Add module and company context for better server-side handling
  if (currentModule) {
    headers["X-Current-Module"] = currentModule;
  }

  if (company) {
    headers["X-Company"] = company;
  }

  // Add work type if available
  const workType = localStorage.getItem("workType");
  if (workType) {
    headers["X-Work-Type"] = workType;
  }

  return headers;
};

// Helper function to get module-specific configuration
export const getModuleConfig = () => {
  const currentModule = localStorage.getItem("currentModule");
  const company = localStorage.getItem("company");

  return {
    module: currentModule,
    company: company,
    workType: localStorage.getItem("workType"),
    isCommercial: currentModule === "commercial",
    isIDG: company === "idg",
    isVKL: company === "vkl",
  };
};

// Helper to validate if user has access to current module
export const validateModuleAccess = () => {
  const currentModule = localStorage.getItem("currentModule");
  const accessList = (localStorage.getItem("access") || "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter((item) => item.length > 0);

  return !currentModule || accessList.includes(currentModule.toLowerCase());
};

// Helper to switch modules safely
export const switchModule = (newModule) => {
  if (!newModule) return false;

  const accessList = (localStorage.getItem("access") || "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter((item) => item.length > 0);

  const moduleKey = newModule.toLowerCase();

  if (accessList.includes(moduleKey)) {
    localStorage.setItem("currentModule", moduleKey);
    localStorage.setItem("workType", newModule.toUpperCase());
    return true;
  }

  return false;
};
