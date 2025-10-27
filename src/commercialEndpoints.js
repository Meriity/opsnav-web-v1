export const COMMERCIAL_ENDPOINTS = {
  // User Profile
  USER_CURRENT: "/user/current",
  USER_PROFILE: "/user/profile",
  USER_CHANGE_PASSWORD: "/user/change-password",

  // Client Management
  CLIENTS: "/user/clients",
  ACTIVE_CLIENTS: "/user/clients/active",
  ARCHIVED_CLIENTS: "/user/clients/archived",
  CLIENT_DATES: "/user/clients/dates",
  CLIENT_BY_ID: "/user/clients", // Use with /:id

  // Stage Operations
  STAGE_ONE: "/clients/stage-one",
  STAGE_ONE_BY_ID: "/clients/stage-one", // Use with /:matterNumber
  STAGE_TWO: "/clients/stage-two",
  STAGE_TWO_BY_ID: "/clients/stage-two", // Use with /:matterNumber
  STAGE_THREE: "/clients/stage-three",
  STAGE_THREE_BY_ID: "/clients/stage-three", // Use with /:matterNumber
  STAGE_FOUR: "/clients/stage-four",
  STAGE_FOUR_BY_ID: "/clients/stage-four", // Use with /:matterNumber
  STAGE_FIVE: "/clients/stage-five",
  STAGE_FIVE_BY_ID: "/clients/stage-five", // Use with /:matterNumber
  STAGE_SIX: "/clients/stage-six",
  STAGE_SIX_BY_ID: "/clients/stage-six", // Use with /:matterNumber

  // Cost Operations
  COST: "/clients/cost",
  COST_BY_ID: "/clients/cost", // Use with /:matterNumber

  // Client View Access
  SEND_CLIENT_LINK: "/client-view/send-link",
  CLIENT_SIGNIN: "/client-view/signin",
  CLIENT_EMAILS: "/client-view/emails",
  REMOVE_CLIENT_ACCESS: "/client-view/remove-access",

  // Dashboard & Reports
  DASHBOARD: "/dashboard",
  OUTSTANDING_TASKS: "/user/tasks/outstanding",

  // Search & Utilities
  SEARCH_CLIENTS: "/client/search",
  CLIENT_FULL_DATA: "/client/full-data", // Use with /:matterNumber
  STAGE_COLORS: "/client/stage-colors",
  CHECK_CLIENT_EXISTS: "/client/check-exists", // Use with /:matterNumber
};
