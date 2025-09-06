import useAutoLogout from "../hooks/useAutoLogout";

const AutoLogoutWrapper = ({ children }) => {
  useAutoLogout(3600000); // 1 hour
  return children;
};

export default AutoLogoutWrapper;