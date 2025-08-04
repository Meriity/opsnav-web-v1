import useAutoLogout from "../hooks/useAutoLogout";

const AutoLogoutWrapper = ({ children }) => {
  useAutoLogout(3600000); // 1 minute
  return children;
};

export default AutoLogoutWrapper;