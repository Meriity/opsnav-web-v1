import {
  Lock,
  User,
  RefreshCw,
  BadgeCheck,
  Facebook,
  Instagram,
  Twitter,
  Bitcoin,
  Zap,
  Users,
  Shield,
  Cloud,
  Building,
  CheckCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const ScrollIndicator = "/down-arrow.png";

export default function Home() {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/admin/login");
  };

  const handleClientLogin = () => {
    navigate("/client/login");
  };

  const handleLoginlegacy = () => {
    window.location.href = "https://legacy.opsnav.com";
  };

  const handleScrollToFeatures = () => {
    const el = document.getElementById("features");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollBy({ top: window.innerHeight, behavior: "smooth" });
    }
  };

  const handleKeyDownIndicator = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleScrollToFeatures();
    }
  };

  return (
    <>
      <div
        className="relative min-h-screen bg-cover bg-center text-black"
        style={{ backgroundImage: "url('/home_bg.jpg')" }}
      >
        <style>{`
  /* gentle vertical float for the arrow itself */
  @keyframes floatUpDown {
    0%   { transform: translateY(0) scale(1); opacity: 1; }
    50%  { transform: translateY(-10px) scale(1.03); opacity: 0.98; }
    100% { transform: translateY(0) scale(1); opacity: 1; }
  }

  /* soft scale + opacity pulse for the wrapper (no box-shadow to avoid artifacts) */
  @keyframes softPulse {
    0%   { transform: scale(1); opacity: 1; }
    50%  { transform: scale(1.08); opacity: 0.98; }
    100% { transform: scale(1); opacity: 1; }
  }

  /* arrow image */
  .scroll-indicator {
    animation: floatUpDown 2.6s ease-in-out infinite;
    cursor: pointer;
    transition: transform .18s ease, opacity .18s ease;
    display: block;
    will-change: transform, opacity;
    -webkit-backface-visibility: hidden; /* avoids blurry rendering on some mobile browsers */
    backface-visibility: hidden;
  }
  .scroll-indicator:active {
    transform: translateY(2px) scale(.98);
  }

  /* wrapper around the arrow */
  .scroll-indicator-wrapper {
    animation: softPulse 2.6s ease-in-out infinite;
    border-radius: 9999px;
    padding: 6px;
    background: transparent;        /* ensure no background bleed */
    box-shadow: none !important;    /* explicitly remove any shadow that might create a line */
    display: inline-flex;
    align-items: center;
    justify-content: center;
    will-change: transform, opacity;
  }

  /* accessible focus ring when keyboard navigating */
  .scroll-indicator-wrapper:focus-visible {
    outline: 3px solid rgba(59,130,246,0.18);
    outline-offset: 4px;
    border-radius: 9999px;
  }

  /* size helpers (keeps arrow smaller) */
  .scroll-indicator-small { width: 2.5rem; height: 2.5rem; } /* ~40px */
  .scroll-indicator-medium { width: 3rem; height: 3rem; }   /* ~48px */

  /* optional: remove image smoothing artifacts on some devices */
  img.scroll-indicator { image-rendering: -webkit-optimize-contrast; }
`}</style>

        <header className="absolute top-2 left-2 right-0 z-20 flex flex-col items-center gap-3 p-4 sm:flex-row sm:justify-between">
          {/* Logo */}
          <div className="flex-shrink-0 mb-2">
            <img src="/Logo.png" alt="OpsNav Logo" className="h-12 md:h-14" />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            <div>
              <button
                className="cursor-pointer bg-sky-500 hover:bg-sky-600 text-white text-md px-3 py-1.5 sm:text-sm sm:px-4 sm:py-2 rounded-md font-medium"
                onClick={handleClientLogin}
              >
                Client Portal
              </button>
            </div>
            <div className="flex items-center gap-1">
              <button
                className="cursor-pointer bg-sky-500 hover:bg-sky-600 text-white text-md px-3 py-1.5 sm:text-sm sm:px-4 sm:py-2 rounded-md font-medium"
                onClick={handleLogin}
              >
                Login
              </button>
              <button className="border border-sky-500 text-sky-500 hover:bg-sky-500 hover:text-white text-md px-2.5 py-[5px] sm:text-sm sm:px-4 sm:py-2 rounded-md font-medium">
                Signup
              </button>
            </div>
          </div>
        </header>
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 min-h-screen pt-32 sm:pt-0">
          <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold max-w-7xl">
            Streamline with Precision. Scale Your Operations without
            bottlenecks.
          </h1>

          <p className="mt-6 text-base md:text-lg max-w-4xl">
            OpsNav brings clarity and control to your most complex workflows —
            with centralised task tracking, automated processes, and real-time
            insights that keep your team aligned, productive, and moving forward
            with confidence.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <button className="cursor-pointer bg-sky-500 hover:bg-sky-600 text-white font-semibold px-5 py-2 rounded-md shadow">
              Get Started For Free
            </button>
            <button className="cursor-pointer border border-sky-500 text-sky-500 hover:bg-sky-500 hover:text-white font-semibold px-5 py-1.5 rounded-md">
              Book A Demo
            </button>
          </div>
          <div
            role="button"
            tabIndex={0}
            aria-label="Scroll to features"
            onClick={handleScrollToFeatures}
            onKeyDown={handleKeyDownIndicator}
            className="absolute right-4 bottom-6 z-30 md:left-1/2 md:transform md:-translate-x-1/2"
            title="Scroll down"
          >
            <div
              className="scroll-indicator-wrapper rounded-full flex items-center justify-center"
              aria-hidden
            >
              <img
                src={ScrollIndicator}
                alt="Scroll down"
                className="w-8 h-8 md:w-10 md:h-10 scroll-indicator" /* reduced arrow size */
                style={{ display: "block", pointerEvents: "none" }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* features section */}
      <div className="flex flex-col items-center px-4 py-16 md:py-16">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-4">
          KEY FEATURES
        </h2>
        <div className="w-24 h-1 bg-sky-500 mb-12 border-b-4 border-black rounded-full" />

        {/* Role-Based Dashboards */}
        <div className="mt-8 flex flex-col lg:flex-row items-center justify-center gap-8 w-full max-w-6xl">
          <div className="bg-gradient-to-br from-blue-50 to-cyan-100 p-6 rounded-2xl shadow-lg w-full lg:w-1/2 hidden lg:block">
            <div className="bg-white rounded-xl p-4 shadow-inner h-full min-h-[350px] flex items-center justify-center">
              <img
                src="https://storage.googleapis.com/opsnav_web_image/Screenshot%202025-10-18%20113423.png"
                alt="Role-Based Dashboard Screenshot"
                className="w-full h-full object-contain rounded-lg"
              />
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-cyan-100 p-3 rounded-lg shadow-lg w-full lg:w-1/2 hidden md:block lg:hidden">
            <div className="bg-white rounded-lg p-2 shadow-inner h-full min-h-[150px] flex items-center justify-center">
              <img
                src="https://storage.googleapis.com/opsnav_web_image/dashboard-tablet.png"
                alt="Role-Based Dashboard Tablet Screenshot"
                className="w-full h-full object-contain rounded"
              />
            </div>
          </div>

          <div className="text-center lg:text-left w-full lg:w-1/2">
            <h3 className="text-xl md:text-2xl font-semibold mb-4 lg:text-left">
              Role-Based Dashboards
            </h3>
            <p className="text-md md:text-lg text-gray-700 leading-relaxed lg:text-left">
              Tailored views and permissions for Super Admins, Staff, and
              Clients.
            </p>
            <div className="mt-6 space-y-3 lg:text-left">
              <div className="flex items-start">
                <div className="bg-sky-500 rounded-full p-1 mt-1 mr-3">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <span className="text-gray-700">
                  Customized views for different user roles
                </span>
              </div>
              <div className="flex items-start">
                <div className="bg-sky-500 rounded-full p-1 mt-1 mr-3">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <span className="text-gray-700">
                  Granular permission controls
                </span>
              </div>
              <div className="flex items-start">
                <div className="bg-sky-500 rounded-full p-1 mt-1 mr-3">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <span className="text-gray-700">Role-specific workflows</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-cyan-100 p-3 rounded-lg shadow-lg w-full lg:w-1/2 md:hidden">
            <div className="bg-white rounded-lg p-2 shadow-inner h-full min-h-[120px] flex items-center justify-center">
              <img
                src="https://storage.googleapis.com/opsnav_web_image/dashboards-mobile.png"
                alt="Role-Based Dashboard Mobile Screenshot"
                className="w-full h-full object-contain rounded"
              />
            </div>
          </div>
        </div>

        {/* Matter Management */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 w-full max-w-6xl mt-16 sm:mt-24">
          <div className="text-center lg:text-left w-full lg:w-1/2">
            <h3 className="text-xl md:text-2xl font-semibold mb-4 lg:text-left">
              Matter Management
            </h3>
            <p className="text-md md:text-lg text-gray-700 leading-relaxed lg:text-left">
              Track every case and its 5-Stage progress with visual indicators.
            </p>
            <div className="mt-6 space-y-3 lg:text-left">
              <div className="flex items-start">
                <div className="bg-sky-500 rounded-full p-1 mt-1 mr-3">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <span className="text-gray-700">5-stage progress tracking</span>
              </div>
              <div className="flex items-start">
                <div className="bg-sky-500 rounded-full p-1 mt-1 mr-3">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <span className="text-gray-700">
                  Visual progress indicators
                </span>
              </div>
              <div className="flex items-start">
                <div className="bg-sky-500 rounded-full p-1 mt-1 mr-3">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <span className="text-gray-700">Real-time status updates</span>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-green-100 p-6 rounded-2xl shadow-lg w-full lg:w-1/2 hidden lg:block">
            <div className="bg-white rounded-xl p-4 shadow-inner h-full min-h-[350px] flex items-center justify-center">
              <img
                src="https://storage.googleapis.com/opsnav_web_image/Screenshot%20(946).png"
                alt="Matter Management Desktop Screenshot"
                className="w-full h-full object-contain rounded-lg"
              />
            </div>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-green-100 p-3 rounded-lg shadow-lg w-full lg:w-1/2 hidden md:block lg:hidden">
            <div className="bg-white rounded-lg p-2 shadow-inner h-full min-h-[150px] flex items-center justify-center">
              <img
                src="https://storage.googleapis.com/opsnav_web_image/view-clients-tablet.png"
                alt="Matter Management Tablet Screenshot"
                className="w-full h-full object-contain rounded"
              />
            </div>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-green-100 p-3 rounded-lg shadow-lg w-full lg:w-1/2 md:hidden">
            <div className="bg-white rounded-lg p-2 shadow-inner h-full min-h-[120px] flex items-center justify-center">
              <img
                src="https://storage.googleapis.com/opsnav_web_image/view-clients-mobile.png"
                alt="Matter Management Mobile Screenshot"
                className="w-full h-full object-contain rounded"
              />
            </div>
          </div>
        </div>

        {/* Shareable Client Status */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 w-full max-w-6xl mt-16 sm:mt-24">
          <div className="bg-gradient-to-br from-purple-50 to-indigo-100 p-6 rounded-2xl shadow-lg w-full lg:w-1/2 hidden lg:block">
            <div className="bg-white rounded-xl p-4 shadow-inner h-full min-h-[350px] flex items-center justify-center">
              <img
                src="https://storage.googleapis.com/opsnav_web_image/Screenshot%20(946).png"
                alt="Shareable Client Status Desktop Screenshot"
                className="w-full h-full object-contain rounded-lg"
              />
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-indigo-100 p-3 rounded-lg shadow-lg w-full lg:w-1/2 hidden md:block lg:hidden">
            <div className="bg-white rounded-lg p-2 shadow-inner h-full min-h-[150px] flex items-center justify-center">
              <img
                src="https://storage.googleapis.com/opsnav_web_image/view-clients-tablet.png"
                alt="Shareable Client Status Tablet Screenshot"
                className="w-full h-full object-contain rounded"
              />
            </div>
          </div>

          <div className="text-center lg:text-left w-full lg:w-1/2">
            <h3 className="text-xl md:text-2xl font-semibold mb-4 lg:text-left">
              Shareable Client Status
            </h3>
            <p className="text-md md:text-lg text-gray-700 leading-relaxed lg:text-left">
              Tailored views and permissions for Super Admins, Staff, and
              Clients.
            </p>
            <div className="mt-6 space-y-3 lg:text-left">
              <div className="flex items-start">
                <div className="bg-sky-500 rounded-full p-1 mt-1 mr-3">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <span className="text-gray-700">Real-time status sharing</span>
              </div>
              <div className="flex items-start">
                <div className="bg-sky-500 rounded-full p-1 mt-1 mr-3">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <span className="text-gray-700">Secure client portals</span>
              </div>
              <div className="flex items-start">
                <div className="bg-sky-500 rounded-full p-1 mt-1 mr-3">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <span className="text-gray-700">Automated status updates</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-indigo-100 p-3 rounded-lg shadow-lg w-full lg:w-1/2 md:hidden">
            <div className="bg-white rounded-lg p-2 shadow-inner h-full min-h-[120px] flex items-center justify-center">
              <img
                src="https://storage.googleapis.com/opsnav_web_image/view-clients-mobile.png"
                alt="Shareable Client Status Mobile Screenshot"
                className="w-full h-full object-contain rounded"
              />
            </div>
          </div>
        </div>

        {/* Wills Module */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 w-full max-w-6xl mt-16 sm:mt-24">
          <div className="text-center lg:text-left w-full lg:w-1/2">
            <h3 className="text-xl md:text-2xl font-semibold mb-4 lg:text-left">
              Wills Module
            </h3>
            <p className="text-md md:text-lg text-gray-700 leading-relaxed lg:text-left">
              Track every case and its 5-Stage progress with visual indicators.
            </p>
            <div className="mt-6 space-y-3 lg:text-left">
              <div className="flex items-start">
                <div className="bg-sky-500 rounded-full p-1 mt-1 mr-3">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <span className="text-gray-700">Specialized will tracking</span>
              </div>
              <div className="flex items-start">
                <div className="bg-sky-500 rounded-full p-1 mt-1 mr-3">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <span className="text-gray-700">Document management</span>
              </div>
              <div className="flex items-start">
                <div className="bg-sky-500 rounded-full p-1 mt-1 mr-3">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <span className="text-gray-700">Beneficiary tracking</span>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-orange-100 p-6 rounded-2xl shadow-lg w-full lg:w-1/2 hidden lg:block">
            <div className="bg-white rounded-xl p-4 shadow-inner h-full min-h-[350px] flex items-center justify-center">
              <img
                src="https://storage.googleapis.com/opsnav_web_image/Screenshot%20(946).png"
                alt="Wills Module Desktop Screenshot"
                className="w-full h-full object-contain rounded-lg"
              />
            </div>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-orange-100 p-3 rounded-lg shadow-lg w-full lg:w-1/2 hidden md:block lg:hidden">
            <div className="bg-white rounded-lg p-2 shadow-inner h-full min-h-[150px] flex items-center justify-center">
              <img
                src="https://storage.googleapis.com/opsnav_web_image/view-clients-tablet.png"
                alt="Wills Module Tablet Screenshot"
                className="w-full h-full object-contain rounded"
              />
            </div>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-orange-100 p-3 rounded-lg shadow-lg w-full lg:w-1/2 md:hidden">
            <div className="bg-white rounded-lg p-2 shadow-inner h-full min-h-[120px] flex items-center justify-center">
              <img
                src="https://storage.googleapis.com/opsnav_web_image/view-clients-mobile.png"
                alt="Wills Module Mobile Screenshot"
                className="w-full h-full object-contain rounded"
              />
            </div>
          </div>
        </div>

        {/* Automated Reporting & Notifications */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 w-full max-w-6xl mt-16 sm:mt-24">
          <div className="bg-gradient-to-br from-rose-50 to-pink-100 p-6 rounded-2xl shadow-lg w-full lg:w-1/2 hidden lg:block">
            <div className="bg-white rounded-xl p-4 shadow-inner h-full min-h-[350px] flex items-center justify-center">
              <img
                src="https://storage.googleapis.com/opsnav_web_image/Screenshot%20(946).png"
                alt="Automated Reporting Desktop Screenshot"
                className="w-full h-full object-contain rounded-lg"
              />
            </div>
          </div>
          <div className="bg-gradient-to-br from-rose-50 to-pink-100 p-3 rounded-lg shadow-lg w-full lg:w-1/2 hidden md:block lg:hidden">
            <div className="bg-white rounded-lg p-2 shadow-inner h-full min-h-[150px] flex items-center justify-center">
              <img
                src="https://storage.googleapis.com/opsnav_web_image/view-clients-tablet.png"
                alt="Automated Reporting Tablet Screenshot"
                className="w-full h-full object-contain rounded"
              />
            </div>
          </div>

          <div className="text-center lg:text-left w-full lg:w-1/2">
            <h3 className="text-xl md:text-2xl font-semibold mb-4 lg:text-left">
              Automated Reporting & Notifications
            </h3>
            <p className="text-md md:text-lg text-gray-700 leading-relaxed lg:text-left">
              Tailored views and permissions for Super Admins, Staff, and
              Clients.
            </p>
            <div className="mt-6 space-y-3 lg:text-left">
              <div className="flex items-start">
                <div className="bg-sky-500 rounded-full p-1 mt-1 mr-3">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <span className="text-gray-700">
                  Automated report generation
                </span>
              </div>
              <div className="flex items-start">
                <div className="bg-sky-500 rounded-full p-1 mt-1 mr-3">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <span className="text-gray-700">Real-time notifications</span>
              </div>
              <div className="flex items-start">
                <div className="bg-sky-500 rounded-full p-1 mt-1 mr-3">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <span className="text-gray-700">Customizable alerts</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-rose-50 to-pink-100 p-3 rounded-lg shadow-lg w-full lg:w-1/2 md:hidden">
            <div className="bg-white rounded-lg p-2 shadow-inner h-full min-h-[120px] flex items-center justify-center">
              <img
                src="https://storage.googleapis.com/opsnav_web_image/view-clients-mobile.png"
                alt="Automated Reporting Mobile Screenshot"
                className="w-full h-full object-contain rounded"
              />
            </div>
          </div>
        </div>

        {/* Fully Cloud Hosted on GCP */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 w-full max-w-6xl mt-16 sm:mt-24">
          <div className="text-center lg:text-left w-full lg:w-1/2">
            <h3 className="text-xl md:text-2xl font-semibold mb-4 lg:text-left">
              Fully Cloud Hosted on GCP
            </h3>
            <p className="text-md md:text-lg text-gray-700 leading-relaxed lg:text-left">
              Track every case and its 5-Stage progress with visual indicators.
            </p>
            <div className="mt-6 space-y-3 lg:text-left">
              <div className="flex items-start">
                <div className="bg-sky-500 rounded-full p-1 mt-1 mr-3">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <span className="text-gray-700">
                  Google Cloud Platform hosting
                </span>
              </div>
              <div className="flex items-start">
                <div className="bg-sky-500 rounded-full p-1 mt-1 mr-3">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <span className="text-gray-700">Enterprise-grade security</span>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-slate-50 to-gray-100 p-6 rounded-2xl shadow-lg w-full lg:w-1/2 hidden lg:block">
            <div className="bg-white rounded-xl p-4 shadow-inner h-full min-h-[350px] flex items-center justify-center">
              <img
                src="https://storage.googleapis.com/opsnav_web_image/Screenshot%20(946).png"
                alt="GCP Hosting Desktop Screenshot"
                className="w-full h-full object-contain rounded-lg"
              />
            </div>
          </div>
          <div className="bg-gradient-to-br from-slate-50 to-gray-100 p-3 rounded-lg shadow-lg w-full lg:w-1/2 hidden md:block lg:hidden">
            <div className="bg-white rounded-lg p-2 shadow-inner h-full min-h-[150px] flex items-center justify-center">
              <img
                src="https://storage.googleapis.com/opsnav_web_image/view-clients-tablet.png"
                alt="GCP Hosting Tablet Screenshot"
                className="w-full h-full object-contain rounded"
              />
            </div>
          </div>
          <div className="bg-gradient-to-br from-slate-50 to-gray-100 p-3 rounded-lg shadow-lg w-full lg:w-1/2 md:hidden">
            <div className="bg-white rounded-lg p-2 shadow-inner h-full min-h-[120px] flex items-center justify-center">
              <img
                src="https://storage.googleapis.com/opsnav_web_image/view-clients-mobile.png"
                alt="GCP Hosting Mobile Screenshot"
                className="w-full h-full object-contain rounded"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Who is it for? section */}
      <div className="flex flex-col items-center px-4 py-16 md:py-16">
        <div className="w-full flex flex-col items-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-4">
            WHO IS IT FOR ?
          </h2>
          <div className="w-24 h-1 bg-sky-500 mb-12 border-b-4 border-black rounded-full" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-7xl w-full">
            {/* Law Firms Card */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="h-48 sm:h-56 md:h-64 bg-gradient-to-br from-blue-50 to-cyan-100 flex items-center justify-center p-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-sky-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    Law Firms
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Handling property & estate transactions
                  </p>
                </div>
              </div>
              <div className="bg-black text-white p-6">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-sky-400 rounded-full mr-3"></div>
                    Property law specialists
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-sky-400 rounded-full mr-3"></div>
                    Estate transaction management
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-sky-400 rounded-full mr-3"></div>
                    Legal documentation handling
                  </li>
                </ul>
              </div>
            </div>

            {/* Legal Ops Teams Card */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="h-48 sm:h-56 md:h-64 bg-gradient-to-br from-emerald-50 to-green-100 flex items-center justify-center p-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    Legal Ops Teams
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Seeking clarity and control
                  </p>
                </div>
              </div>
              <div className="bg-black text-white p-6">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                    Process optimization
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                    Workflow automation
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                    Performance tracking
                  </li>
                </ul>
              </div>
            </div>

            {/* Scaling Digital Ops Card */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="h-48 sm:h-56 md:h-64 bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center p-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    Scaling Digital Ops
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Ready to scale securely
                  </p>
                </div>
              </div>
              <div className="bg-black text-white p-6">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                    Digital transformation
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                    Secure cloud operations
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                    Scalable infrastructure
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Why Choose section */}
      <div className="mt-24 w-full flex flex-col items-center px-4">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-4">
          WHY CHOOSE OPSNAV ?
        </h2>
        <div className="w-24 h-1 bg-sky-500 mb-12 border-b-4 border-black rounded-full" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl w-full">
          {/* No More Chaos */}
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 flex flex-col items-center text-center border border-gray-100">
            <div className="w-32 h-32 mb-6 rounded-2xl bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              No More Chaos
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Eliminate spreadsheets, emails, and tracking chaos with our
              streamlined platform
            </p>
          </div>

          {/* Collaboration */}
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 flex flex-col items-center text-center border border-gray-100">
            <div className="w-32 h-32 mb-6 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-100 flex items-center justify-center p-4">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                <Users className="w-8 h-8 text-white" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Seamless Collaboration
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Enable seamless collaboration between staff and clients with
              real-time updates
            </p>
          </div>

          {/* Compliance */}
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 flex flex-col items-center text-center border border-gray-100">
            <div className="w-32 h-32 mb-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8 text-white" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Stay Compliant
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Stay on top of compliance with clear progress indicators and
              automated tracking
            </p>
          </div>

          {/* Work From Anywhere */}
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 flex flex-col items-center text-center border border-gray-100">
            <div className="w-32 h-32 mb-6 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center p-4">
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center">
                <Cloud className="w-8 h-8 text-white" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Work Anywhere
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Work from anywhere — securely hosted on Google Cloud Platform with
              99.9% uptime
            </p>
          </div>

          {/* Legal Built */}
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 flex flex-col items-center text-center border border-gray-100">
            <div className="w-32 h-32 mb-6 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4">
              <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center">
                <Building className="w-8 h-8 text-white" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Built by Experts
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Built by legal teams, for legal teams with deep industry expertise
            </p>
          </div>

          {/* Lightning Fast */}
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 flex flex-col items-center text-center border border-gray-100">
            <div className="w-32 h-32 mb-6 rounded-2xl bg-gradient-to-br from-sky-50 to-blue-100 flex items-center justify-center p-4">
              <div className="w-16 h-16 bg-sky-500 rounded-full flex items-center justify-center">
                <Zap className="w-8 h-8 text-white" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Lightning Fast
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Get started in minutes with our intuitive interface and rapid
              setup process
            </p>
          </div>
        </div>
      </div>

      {/* Security & Compliance section */}
      <div className="mt-24 w-full flex flex-col items-center px-4">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-4">
          SECURITY & COMPLIANCE
        </h2>
        <div className="w-24 h-1 bg-sky-500 mb-12 border-b-4 border-black rounded-full" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 max-w-4xl w-full">
          <div className="bg-blue-100 p-4 sm:p-6 rounded-lg text-center shadow">
            <Lock className="mx-auto mb-3 sm:mb-4 h-8 w-8 sm:h-10 sm:w-10" />
            <p className="text-xs sm:text-sm font-semibold">
              END TO END ENCRYPTED
            </p>
          </div>
          <div className="bg-blue-100 p-4 sm:p-6 rounded-lg text-center shadow">
            <User className="mx-auto mb-3 sm:mb-4 h-8 w-8 sm:h-10 sm:w-10" />
            <p className="text-xs sm:text-sm font-semibold">
              ROLE-BASED ACCESS CONTROL
            </p>
          </div>
          <div className="bg-blue-100 p-4 sm:p-6 rounded-lg text-center shadow">
            <RefreshCw className="mx-auto mb-3 sm:mb-4 h-8 w-8 sm:h-10 sm:w-10" />
            <p className="text-xs sm:text-sm font-semibold">
              DAILY AUTOMATED BACKUPS
            </p>
          </div>
          <div className="bg-blue-100 p-4 sm:p-6 rounded-lg text-center shadow">
            <BadgeCheck className="mx-auto mb-3 sm:mb-4 h-8 w-8 sm:h-10 sm:w-10" />
            <p className="text-xs sm:text-sm font-semibold">
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
              <Facebook className="w-6 h-6 cursor-pointer" />
              <Instagram className="w-6 h-6 cursor-pointer" />
              <Twitter className="w-6 h-6 cursor-pointer" />
              <Bitcoin className="w-6 h-6 cursor-pointer" />
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
