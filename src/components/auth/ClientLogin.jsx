import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthAPI from "../../api/authAPI";
import { toast } from "react-toastify";

function LoginForm() {
  const api = new AuthAPI();
  const [matterNumber, setmatterNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true)
    try {
      const response = await api.signInClient(matterNumber, password);
      if (response.matterNumber) {
        localStorage.setItem("matterNumber", response.matterNumber);
        navigate(`/client/dashboard/${btoa(response.matterNumber)}`);
      }
    } catch (err) {
      toast.error(err.message || "Authentication failed! Please check your credentials and try again.")
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-200 to-white">
      <div className="max-w-6xl w-full px-6 flex flex-col md:flex-row items-center justify-between">
        {/* Left Section - Welcome Message */}
        <div className="w-full md:w-1/2 text-center md:text-left mb-8 md:mb-0">
          <img src="/Logo.png" alt="VK Lawyers Logo" className="h-24 mx-auto md:mx-0" />
          <h1 className="text-3xl font-bold mt-4 font-poppins">WELCOME TO OPSNAV</h1>
          <p className="text-gray-600 mt-2 font-poppins">
            Track Your Property Matter Status Anytime, Anywhere
          </p>
        </div>

        {/* Right Section - Login Box */}
        <div className="w-full md:w-1/2 max-w-md bg-white shadow-md rounded-xl p-8">
          <h2 className="text-xl font-semibold text-center mb-6">CLIENT LOG-IN</h2>



          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 font-medium text-sm text-gray-700">
                Matter Number
              </label>
              <input
                type="matternumber"
                value={matterNumber}
                onChange={(e) => setmatterNumber(e.target.value)}
                required
                className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium text-sm text-gray-700">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <button
              type={isLoading ? "button" : "submit"}
              disabled={isLoading}
              className="w-full bg-sky-600 cursor-pointer text-white py-2 rounded-md hover:bg-sky-700 transition"
            >
              {isLoading ? "Processing..." : "Sign In"}
            </button>
          </form>
          {error && (
            <div className="bg-red-100 text-red-700 p-2 mb-4 rounded text-sm">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 text-sm text-center w-full text-gray-700 font-semibold">
        Powered By Opsnav™
      </div>
    </div>
  );
}

export default LoginForm;
