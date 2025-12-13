import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import AuthAPI from "../../api/authAPI";
import { toast } from "react-toastify";
import Footer from "../../components/layout/Footer";


function SetPassword() {
  const api = new AuthAPI();
  const [password, setPassword] = useState("");
  const [confirmpassword, setconfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get("token");
  const [isLoading, setIsLoading] = useState(false);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true)
    if (!password) {
      setError("Please enter the password");
      toast.error("Please enter the password");
      return;
    }

    if (password !== confirmpassword) {
      setError("Both Password and Confirm Password must be the same");
      toast.error("Check both the passwords are same");
      return;
    }

    try {
      const response = await api.setPassword(token, password);
      if (response) {
        toast.success("Password Set Success!");
        navigate("/admin/login");
      }
    } catch (err) {
      toast.error("Password Set Failed!");
    } finally {
      setIsLoading(true)
    }
  };



  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-200 to-white">

      <div className="max-w-6xl w-full px-6 flex flex-col md:flex-row items-center justify-between">
        <div className="w-full md:w-1/2 text-center md:text-left mb-8 md:mb-0">
          <img src="/Logo.png" alt="VK Lawyers Logo" className="h-24 mx-auto md:mx-0" />
          <h1 className="text-3xl font-bold mt-4 font-poppins">WELCOME TO OPSNAV</h1>
          <p className="text-gray-600 mt-2 font-poppins">
            Secure. Simple. Seamless conveyancing.
          </p>
        </div>

        <div className="w-full md:w-1/2 max-w-md bg-white shadow-md rounded-xl p-8">
          <h2 className="text-xl font-semibold text-center mb-6">SET PASSWORD</h2>



          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 font-medium text-sm text-gray-700">New Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium text-sm text-gray-700">Confirm Password</label>
              <input
                type="password"
                value={confirmpassword}
                onChange={(e) => setconfirmPassword(e.target.value)}
                required
                className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <button
              type={isLoading ? "button" : "submit"}
              disabled={isLoading}
              className="w-full bg-sky-600 text-white py-2 rounded-md hover:bg-sky-700 transition"
            >
              {isLoading ? "Processing..." : "Set Password"}
            </button>
            {error && (
              <div className="bg-red-100 text-red-700 p-2 mb-4 rounded text-sm mt-2">
                {error}
              </div>
            )}
          </form>
        </div>
      </div>

      <div className="absolute bottom-4 text-sm text-center w-full text-gray-700 font-semibold">
        Powered By OpsNav™
      </div>
      <Footer />
    </div>
  );
}

export default SetPassword;
