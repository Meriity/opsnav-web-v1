import WillsLogo from "../../icons/Button icons/Group 746.png";
import matterLogo from "../../icons/Button icons/Group 746.png";
import { useNavigate } from "react-router-dom";

function WorkSelection() {
  const navigate = useNavigate();

  const accessList = (localStorage.getItem("access") || "")
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

  const handleSubmit = () => {
    const token = localStorage.getItem("authToken");
    const role = localStorage.getItem("role");
    try {
      if (!token) {
        navigate("/admin/login");
      } else if (role === "admin" || role === "superadmin") {
        navigate("/admin/dashboard");
      } else if (role === "user") {
        navigate("/user/dashboard");
      }
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center from-sky-200 to-white relative pb-20 bg-cover bg-center"
      style={{ backgroundImage: "url('/home_bg.jpg')" }}
    >
      {/* Logo */}
      <div className="absolute top-5 left-0 right-0 md:left-8 md:right-auto flex justify-center md:justify-start px-4">
        <img
          src="/Logo.png"
          alt="VK Lawyers Logo"
          className="h-10 sm:h-12 md:h-8"
        />
      </div>

      {/* Main content */}
      <div className="w-full max-w-6xl px-4 sm:px-6 mt-24 md:mt-24">
        {/* Header */}
        <div className="w-full flex justify-center items-center mb-2 md:mb-12">
          <h2 className="text-xl sm:text-2xl md:text-xl font-poppins font-bold text-center px-2 leading-snug">
            WHAT WOULD YOU LIKE TO WORK ON TODAY?
          </h2>
        </div>

        {/* Cards */}
        <div className="flex flex-col md:flex-row  items-center justify-center gap-2 sm:gap-6 px-2">
          {accessList.map((item, index) => (
            <div
              key={index}
              className="w-full xs:w-11/12 sm:w-5/6 md:w-1/2 max-w-md"
            >
              <div className="bg-[#F8F7FC] shadow-md rounded-xl p-5 sm:p-8 flex flex-col items-center">
                <img
                  src={matterLogo}
                  alt={item}
                  className="h-10 sm:h-14 md:h-16 my-3 sm:my-4"
                />
                <h4 className="text-lg sm:text-xl md:text-2xl font-poppins font-semibold text-center">
                  {item}
                </h4>
                <button
                  type="button"
                  className="w-full bg-sky-500 text-white py-2 rounded-md hover:bg-sky-600 transition mt-4 mb-2 sm:my-6 text-sm sm:text-base"
                  onClick={() => handleSubmit()}
                >
                  Next
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 text-[10px] sm:text-xs md:text-sm text-center w-full text-gray-700 font-semibold px-2">
        Powered By Opsnav™
      </div>
    </div>
  );
}

export default WorkSelection;
