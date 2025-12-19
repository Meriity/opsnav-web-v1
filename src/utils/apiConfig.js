export const getApiBaseUrl = (module = null) => {
  const currentModule = +(
    module ||
    localStorage.getItem("currentModule") ||
    ""
  ).toLowerCase();

  if (currentModule === "commercial") {
    return (
      import.meta.env.VITE_COMMERCIAL_API_BASE_URL ||
      import.meta.env.VITE_API_BASE_URL + "/commercial"
    );
  }

  if (currentModule === "print media") {
    return (
      import.meta.env.VITE_IDG_API_BASE_URL ||
      import.meta.env.VITE_API_BASE_URL + "/idg"
    );
  }

  return import.meta.env.VITE_API_BASE_URL;
};

export const getApiHeaders = () => {
  const token = localStorage.getItem("authToken");
  const currentModule = localStorage.getItem("currentModule");

  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (currentModule) {
    headers["X-Current-Module"] = currentModule;
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
  const currentModule = (
    localStorage.getItem("currentModule") || ""
  ).toLowerCase();

  return {
    module: currentModule,
    workType: localStorage.getItem("workType"),
    isCommercial: currentModule === "commercial",
    isPrintMedia: currentModule === "print media",
  };
};

// Helper to validate if user has access to current module
export const validateModuleAccess = () => {
  const currentModule = (
    localStorage.getItem("currentModule") || ""
  ).toLowerCase();
  const accessList = (localStorage.getItem("access") || "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter((item) => item.length > 0);

  return !currentModule || accessList.includes(currentModule);
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
    localStorage.setItem("workType", moduleKey.replace(" ", "_").toUpperCase());
    return true;
  }

  return false;
};
