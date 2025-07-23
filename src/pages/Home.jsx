import dashboard from "../assets/images/dashboard.png";
import clientDetails from "../assets/images/clientDetails.png";
import {
  Lock,
  User,
  RefreshCw,
  BadgeCheck,
  Facebook,
  Instagram,
  Twitter,
  Bitcoin,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/admin/login");
  };
  
  return (
    <>
      <div
        className="relative min-h-screen bg-cover bg-center text-black"
        style={{ backgroundImage: "url('/src/assets/images/home_bg.jpg')" }}
      >
        {/* <div className="absolute inset-0 bg-black/60" /> */}

        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 py-24 md:py-32">
          <h1 className="text-3xl md:text-3xl lg:text-5xl font-bold pt-20 max-w-7xl">
            Streamline with Precision. Scale Your Operations without bottlenecks.
          </h1>

          <p className="mt-6 text-base md:text-lg max-w-4xl">
            OpsNav brings clarity and control to your most complex workflows — with centralised task tracking, automated processes, and real-time insights that keep your team aligned, productive, and moving forward with confidence.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <button className="bg-sky-500 hover:bg-sky-600 text-white font-semibold px-6 py-3 rounded-md shadow">
              Get Started For Free
            </button>
            <button className="border border-sky-500 text-sky-500 hover:bg-sky-500 hover:text-white font-semibold px-6 py-3 rounded-md">
              Book A Demo
            </button>
          </div>
        </div>

        <div className="absolute top-4 right-4 z-20 flex gap-2">
          <button className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-md font-medium" onClick={handleLogin}>
            Login
          </button>
          <button className="border border-sky-500 text-sky-500 hover:bg-sky-500 hover:text-white px-4 py-2 rounded-md font-medium">
            Signup
          </button>
        </div>

        <div className="absolute top-6 left-6 z-20 text-xl font-bold">
          {/* OPSNAV */}
          <img src="/Logo.png" alt="VK Lawyers Logo" className="h-8 mx-auto sm:h-8 md:h-12 md:mx-0 lg:h-12" />
        </div>
      </div>

      {/* features section */}
      <div className="flex flex-col items-center px-4 py-16 md:py-16">
        <h2 className="text-2xl md:text-4xl font-bold text-center mb-4">
          KEY FEATURES
        </h2>
        <div className="w-24 h-1 bg-sky-500 mb-12 border-b-4 border-black rounded-full" />

        <div className="mt-8 flex flex-col lg:flex-row items-center justify-center gap-10 w-full max-w-6xl">
          <div className="bg-sky-100 p-4 rounded-xl shadow-lg w-full lg:w-1/2 hidden lg:block">
            <img
              src={dashboard}
              alt="Role-Based Dashboard Screenshot"
              className="rounded-lg w-full lg:h-[300px] md:h-auto"
            />
          </div>

          <div className="text-center lg:text-left w-full lg:w-1/2">
            <h3 className="text-xl md:text-2xl font-semibold mb-2">
              Role-Based Dashboards
            </h3>
            <p className="text-md md:text-base text-gray-700">
              Tailored views and permissions for Super Admins, Staff, and
              Clients.
            </p>
          </div>
          <div className="bg-sky-100 p-4 rounded-xl shadow-lg w-full lg:w-1/2 lg:hidden md:block">
           <img
              src={dashboard}
              alt="Role-Based Dashboard Screenshot"
              className="rounded-lg w-full lg:h-[300px] md:h-auto "
            />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row items-center justify-center gap-10 w-full max-w-6xl mt-26">
          <div className="text-center lg:text-left w-full lg:w-1/2">
            <h3 className="text-xl md:text-2xl font-semibold mb-2">
              Matter Management
            </h3>
            <p className="text-md md:text-base text-gray-700">
              Track every case and it's 5-Stage progress with visual indicators.
            </p>
          </div>
          <div className="bg-sky-100 p-4 rounded-xl shadow-lg w-full lg:w-1/2">
            <img
              src={clientDetails}
              alt="Role-Based Dashboard Screenshot"
              className="rounded-lg w-full lg:h-[300px] md:h-auto"
            />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row items-center justify-center gap-10 w-full max-w-6xl mt-26">
          <div className="bg-sky-100 p-4 rounded-xl shadow-lg w-full lg:w-1/2 lg:block hidden">
            <img
              src={clientDetails}
              alt="Role-Based Dashboard Screenshot"
              className="rounded-lg w-full lg:h-[300px] md:h-auto"
            />
          </div>

          <div className="text-center lg:text-left w-full lg:w-1/2">
            <h3 className="text-xl md:text-2xl font-semibold mb-2">
              Shareable Client Status
            </h3>
            <p className="text-md md:text-base text-gray-700">
              Tailored views and permissions for Super Admins, Staff, and
              Clients.
            </p>
          </div>
          <div className="bg-sky-100 p-4 rounded-xl shadow-lg w-full lg:w-1/2 lg:hidden md:block">
            <img
              src={clientDetails}
              alt="Role-Based Dashboard Screenshot"
              className="rounded-lg w-full lg:h-[300px] md:h-auto"
            />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row items-center justify-center gap-10 w-full max-w-6xl mt-26">
          <div className="text-center lg:text-left w-full lg:w-1/2">
            <h3 className="text-xl md:text-2xl font-semibold mb-2">
              Wills Module
            </h3>
            <p className="text-md md:text-base text-gray-700">
              Track every case and it's 5-Stage progress with visual indicators.
            </p>
          </div>
          <div className="bg-sky-100 p-4 rounded-xl shadow-lg w-full lg:w-1/2">
            <img
              src={clientDetails}
              alt="Role-Based Dashboard Screenshot"
              className="rounded-lg w-full lg:h-[300px] md:h-auto"
            />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row items-center justify-center gap-10 w-full max-w-6xl mt-26">
          <div className="bg-sky-100 p-4 rounded-xl shadow-lg w-full lg:w-1/2 lg:block hidden">
            <img
              src={clientDetails}
              alt="Role-Based Dashboard Screenshot"
              className="rounded-lg w-full lg:h-[300px] md:h-auto"
            />
          </div>

          <div className="text-center lg:text-left w-full lg:w-1/2">
            <h3 className="text-xl md:text-2xl font-semibold mb-2">
              Automated Reporting & Notifications
            </h3>
            <p className="text-md md:text-base text-gray-700">
              Tailored views and permissions for Super Admins, Staff, and
              Clients.
            </p>
          </div>
          <div className="bg-sky-100 p-4 rounded-xl shadow-lg w-full lg:w-1/2 lg:hidden md:block">
            <img
              src={clientDetails}
              alt="Role-Based Dashboard Screenshot"
              className="rounded-lg w-full lg:h-[300px] md:h-auto"
            />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row items-center justify-center gap-10 w-full max-w-6xl mt-26">
          <div className="text-center lg:text-left w-full lg:w-1/2">
            <h3 className="text-xl md:text-2xl font-semibold mb-2">
              Fully Cloud Hosted on GCP
            </h3>
            <p className="text-md md:text-base text-gray-700">
              Track every case and it's 5-Stage progress with visual indicators.
            </p>
          </div>
          <div className="bg-sky-100 p-4 rounded-xl shadow-lg w-full lg:w-1/2">
            <img
              src={clientDetails}
              alt="Role-Based Dashboard Screenshot"
              className="rounded-lg w-full lg:h-[300px] md:h-auto"
            />
          </div>
        </div>
      </div>

      {/* Key Features */}

      <div className="flex flex-col items-center px-4 py-16 md:py-16">
        <div className="w-full flex flex-col items-center">
          <h2 className="text-2xl md:text-4xl font-bold text-center mb-4">
            WHO IS IT FOR ?
          </h2>
          <div className="w-24 h-1 bg-sky-500 mb-12 border-b-4 border-black rounded-full" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl w-full">
            <div className="rounded-lg overflow-hidden shadow-lg">
              <img
                src="/s3-1.png"
                alt="Law Firms"
                className="w-full h-64 object-cover"
              />
              <div className="bg-black text-white text-sm p-4">
                Law Firms handling property & estate transactions
              </div>
            </div>

            <div className="rounded-lg overflow-hidden shadow-lg">
              <img
                src="/s3-2.png"
                alt="Legal Ops Teams"
                className="w-full h-64 object-cover"
              />
              <div className="bg-black text-white text-sm p-4">
                Legal Ops teams seeking clarity and control
              </div>
            </div>

            <div className="rounded-lg overflow-hidden shadow-lg">
              <img
                src="/s3-3.png"
                alt="Firms Scaling Digital Ops"
                className="w-full h-64 object-cover"
              />
              <div className="bg-black text-white text-sm p-4">
                Firms ready to scale their digital operations securely
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Why Choose */}
      <div className="mt-24 w-full flex flex-col items-center px-4">
        <h2 className="text-2xl md:text-4xl font-bold text-center mb-4">
          WHY CHOOSE OPSNAV ?
        </h2>
        <div className="w-24 h-1 bg-sky-500 mb-12 border-b-4 border-black rounded-full" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl w-full justify-items-center">
          <div className="bg-gray-100 p-6 rounded-lg text-center shadow w-full max-w-xs">
            <img
              src="/s4-1.png"
              alt="No More Chaos"
              className="mx-auto mb-4 h-16"
            />
            <p className="text-sm font-medium">
              No more spreadsheets, emails, and tracking chaos
            </p>
          </div>
          <div className="bg-gray-100 p-6 rounded-lg text-center shadow w-full max-w-xs">
            <img
              src="/s4-2.png"
              alt="Collaboration"
              className="mx-auto mb-4 h-16"
            />
            <p className="text-sm font-medium">
              Enable seamless collaboration between staff and clients
            </p>
          </div>
          <div className="bg-gray-100 p-6 rounded-lg text-center shadow w-full max-w-xs">
            <img
              src="/s4-3.png"
              alt="Compliance"
              className="mx-auto mb-4 h-16"
            />
            <p className="text-sm font-medium">
              Stay on top of compliance with clear progress indicators
            </p>
          </div>
          <div className="bg-gray-100 p-6 rounded-lg text-center shadow w-full max-w-xs">
            <img
              src="/s4-4.png"
              alt="Work From Anywhere"
              className="mx-auto mb-4 h-16"
            />
            <p className="text-sm font-medium">
              Work from anywhere — securely hosted on GCP
            </p>
          </div>
          <div className="bg-gray-100 p-6 rounded-lg text-center shadow w-full max-w-xs">
            <img
              src="/s4-5.png"
              alt="Legal Built"
              className="mx-auto mb-4 h-16"
            />
            <p className="text-sm font-medium">
              Built by legal teams, for legal teams
            </p>
          </div>
        </div>
      </div>

      <div className="mt-24 w-full flex flex-col items-center px-4">
        <h2 className="text-2xl md:text-4xl font-bold text-center mb-4">
          SECURITY & COMPLIANCE
        </h2>
        <div className="w-24 h-1 bg-sky-500 mb-12 border-b-4 border-black rounded-full" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-4xl w-full">
          <div className="bg-blue-100 p-6 rounded-lg text-center shadow">
            <Lock className="mx-auto mb-4 h-10 w-10" />
            <p className="text-sm font-semibold">END TO END ENCRYPTED</p>
          </div>
          <div className="bg-blue-100 p-6 rounded-lg text-center shadow">
            <User className="mx-auto mb-4 h-10 w-10" />
            <p className="text-sm font-semibold">ROLE-BASED ACCESS CONTROL</p>
          </div>
          <div className="bg-blue-100 p-6 rounded-lg text-center shadow">
            <RefreshCw className="mx-auto mb-4 h-10 w-10" />
            <p className="text-sm font-semibold">DAILY AUTOMATED BACKUPS</p>
          </div>
          <div className="bg-blue-100 p-6 rounded-lg text-center shadow">
            <BadgeCheck className="mx-auto mb-4 h-10 w-10" />
            <p className="text-sm font-semibold">
              GDPR & INDUSTRY-STANDARD COMPLIANT
            </p>
          </div>
        </div>
      </div>

      <footer className="mt-24 w-full bg-black text-white py-10 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div className="text-lg font-semibold mb-6 sm:mb-0">OPSNAV</div>
          <div className="flex flex-col sm:items-end">
            <p className="mb-2">Connect with us:</p>
            <div className="flex gap-4">
              <Facebook className="w-6 h-6" />
              <Instagram className="w-6 h-6" />
              <Twitter className="w-6 h-6" />
              <Bitcoin className="w-6 h-6" />
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
