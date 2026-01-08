export const WILLS_ENDPOINTS = {
  // Client Management (User Routes - /wills/user)
  CLIENTS: "/wills/user/clients", // POST: Create Client
  ACTIVE_CLIENTS: "/wills/user/clients/active", // GET: List Active Clients
  ARCHIVED_CLIENTS: "/wills/user/clients/archived", // GET: List Archived Clients
  
  // Client details (Client Routes - /wills/clients)
  CLIENT_BY_ID: "/wills/clients", // GET: Get Client (with query param ?matterNumber=...)
  CLIENT_UPDATE: "/wills/clients", // PUT: Update Client (+ /{{matterNumber}})
  CLIENT_ALL_DATA: "/wills/clients/alldata", // GET: Full data (+ /{{matterNumber}})

  // Dashboard
  DASHBOARD: "/wills/dashboard",

  // Stages (Client Routes - /wills/clients)
  STAGE_ONE: "/wills/clients/stage-one",
  STAGE_ONE_BY_ID: "/wills/clients/stage-one", // + /{{matterNumber}}
  
  STAGE_TWO: "/wills/clients/stage-two",
  STAGE_TWO_BY_ID: "/wills/clients/stage-two", // + /{{matterNumber}}
  
  STAGE_THREE: "/wills/clients/stage-three",
  STAGE_THREE_BY_ID: "/wills/clients/stage-three", // + /{{matterNumber}}

  // Costs
  COST: "/wills/clients/costs",
  COST_BY_ID: "/wills/clients/costs", // + /{{matterNumber}}

  // Search
  SEARCH_CLIENTS: "/wills/user/clients/active", // Re-using active list for search filtering on frontend for now, or check if search exists

  // Check Exists
  CHECK_CLIENT_EXISTS: "/wills/clients/check", // + /{{matterNumber}}

  // Client View
  SEND_CLIENT_LINK: "/wills/client-view/send-link",
  CLIENT_SIGNIN: "/wills/client-view/signin",
};
