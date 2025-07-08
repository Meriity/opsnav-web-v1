import { useState } from "react";

function ForgetPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(""); // For success message
  const [error, setError] = useState(""); // For error message
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);

    try {
      const res = await fetch("https://opsnav-app-service-871399330172.us-central1.run.app/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      setMessage("You will receive a recovery email shortly.");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-200 to-white">
      <div className="max-w-6xl w-full px-6 flex flex-col md:flex-row items-center justify-between">
        {/* Left Section */}
        <div className="w-full md:w-1/2 text-center md:text-left mb-8 md:mb-0">
          <img src="/Logo.png" alt="VK Lawyers Logo" className="h-24 mx-auto md:mx-0" />
          <h1 className="text-3xl font-bold mt-4 font-poppins">FORGOT PASSWORD</h1>
          <p className="text-gray-600 mt-2 font-poppins">
            Enter your email to receive password reset instructions.
          </p>
        </div>

        {/* Right Section */}
        <div className="w-full md:w-1/2 max-w-md bg-white shadow-md rounded-xl p-8">
          <h2 className="text-xl font-semibold text-center mb-6">Recover Access</h2>

          {error && (
            <div className="bg-red-100 text-red-700 p-2 mb-4 rounded text-sm">
              {error}
            </div>
          )}

          {message && (
            <div className="bg-green-100 text-green-700 p-2 mb-4 rounded text-sm">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 font-medium text-sm text-gray-700">
                Email ID
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-sky-500 text-white py-2 rounded-md hover:bg-sky-600 transition disabled:opacity-50"
            >
              {isSubmitting ? "Sending..." : "Send Recovery Email"}
            </button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 text-sm text-center w-full text-gray-700 font-semibold">
        Powered By Opsnav™
      </div>
    </div>
  );
}

export default ForgetPassword;
