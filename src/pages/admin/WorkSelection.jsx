import WillsLogo from "../../icons/Button icons/Group 746.png";
import matterLogo from "../../icons/Button icons/Group 746.png";
import { useNavigate } from "react-router-dom";

function WorkSelection() {
  const navigate = useNavigate();

  // Parse localStorage access string into an array
  const accessList = (localStorage.getItem("access") || "")
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

  const handleSubmit = () => {
    const token = localStorage.getItem("authToken");
    const role = localStorage.getItem("role");
try{
     if (!token) {
      navigate("/admin/login");
    } else if (role === "admin" || role==="superadmin") {
      navigate("/admin/dashboard");
    } else if (role === "user") {
      navigate("/user/dashboard");
    }
  }

catch(e){
    console.log(e);
}
  }


  return (
    <>
      <div
        className="min-h-screen flex flex-col items-center justify-center from-sky-200 to-white relative pb-16 md:pb-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/home_bg.jpg')" }}
      >
        {/* Logo */}
        <div className="absolute top-5 left-0 right-0 md:left-8 md:right-auto flex justify-center md:justify-start px-4">
          <img
            src="/Logo.png"
            alt="VK Lawyers Logo"
            className="h-12 md:h-8"
          />
        </div>

        {/* Main content container */}
        <div className="w-full max-w-6xl px-4 sm:px-6 mt-30 md:mt-0">
          {/* Header */}
          <div className="w-full flex justify-center items-center mb-6 md:mb-10 ">
            <h2 className="text-2xl sm:text-xl font-poppins font-bold text-center px-2">
              WHAT WOULD YOU LIKE TO WORK ON TODAY?
            </h2>
          </div>

          {/* Cards container */}
          <div className="flex flex-col md:flex-row flex-wrap items-center justify-center gap-4 sm:gap-6 px-2">
            {accessList.map((item, index) => (
              <div
                key={index}
                className="w-full sm:w-5/6 md:w-1/2 max-w-md"
              >
                <div className="bg-[#F8F7FC] shadow-md rounded-xl p-6 sm:p-8 flex flex-col items-center">
                  <img
                    src={matterLogo}
                    alt={item}
                    className="h-12 sm:h-16 my-3 sm:my-4"
                  />
                  <h4 className="text-xl sm:text-2xl font-poppins font-semibold text-center">
                    {item}
                  </h4>
                  <button
                    type="button"
                    className="w-full cursor-pointer bg-sky-500 text-white py-2 rounded-md hover:bg-sky-600 transition mt-4 mb-2 sm:my-6 text-sm sm:text-base"
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
        <div className="absolute bottom-4 text-xs sm:text-sm text-center w-full text-gray-700 font-semibold px-2">
          Powered By Opsnav™
        </div>
      </div>
    </>
  );
  }

export default WorkSelection;
