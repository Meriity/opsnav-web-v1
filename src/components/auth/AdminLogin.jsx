import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthAPI from "../../api/authAPI";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";

function LoginForm() {
  const api = new AuthAPI();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.signIn(email, password);

      if (response.token) {
        localStorage.setItem("authToken", response.token);
        localStorage.setItem("user", response.user.displayName);
        localStorage.setItem("access", response.user.access);
        localStorage.setItem("role", response.user.role);
        localStorage.setItem("company", response.user.company);
        localStorage.setItem("logo", response.user.logo);

        toast.success("Logging in...", {
          position: "bottom-center",
        });

        setTimeout(() => {
          if (response.role === "admin") {
            navigate("/admin/work-selection");
          } else {
            navigate("/user/work-selection");
          }
        }, 1500);
      }
    } catch (err) {
      toast.error(err.message || "Something went wrong. Please try again.", {
        position: "bottom-center",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center from-sky-200 to-white bg-cover bg-center p-4"
      style={{ backgroundImage: "url('/home_bg.jpg')" }}
    >
      <div className="max-w-6xl w-full flex flex-col md:flex-row items-center justify-center md:justify-between">
        {/* Text/Logo Content */}
        <div className="w-full md:w-1/2 text-center md:text-left mb-8 md:mb-0">
          <img
            src="/Logo.png"
            alt="OpsNav Logo"
            className="h-16 sm:h-24 mx-auto md:mx-0"
          />
          <h1 className="text-2xl sm:text-3xl font-bold mt-4 font-poppins">
            WELCOME TO Opsnav
          </h1>
          <p className="text-gray-600 mt-2 font-poppins">
            Streamline with Precision. Scale Your Operations without
            bottlenecks.
          </p>
        </div>

        {/* Form Card */}
        <div className="w-full md:w-1/2  max-w-md bg-white shadow-md rounded-xl p-6 sm:p-6">
          <h2 className="text-xl font-semibold text-center mb-6">SIGN IN</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-medium text-sm text-gray-700">
                Email ID
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-gray-300 px-2 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
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
              className="w-full bg-sky-600 text-white py-2 rounded-md hover:bg-sky-700 transition cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="w-4 h-4 animate-spin text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    ></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>
      </div>

      <div className="absolute bottom-1 md:text-md text-xs text-center w-full text-gray-700 font-semibold">
        Powered By Opsnav™
      </div>
    </div>
  );
}

export default LoginForm;
