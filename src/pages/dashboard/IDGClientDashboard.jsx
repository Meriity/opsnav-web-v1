import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Loader from "../../components/ui/smallLoader.jsx";
import {
  Package,
  CheckCircle2,
  Camera,
  Clock,
  Calendar,
  User,
  Mail,
  Phone,
  MapPin,
  ChevronRight,
  Info,
  FileText,
} from "lucide-react";

import ClientAPI from "../../api/clientAPI";

export default function IDGClientDashboard() {
  const [selectedJob, setSelectedJob] = useState(null);
  const [viewingImage, setViewingImage] = useState(false);
  const LogoUrl = localStorage.getItem("logo");
  const { orderId: encodedOrderId } = useParams();
  const [orders, setOrders] = useState([]);
  const [unitNumber, setunitNumber] = useState();
  const [isClicked, setIsClicked] = useState(false);
  const [btn, setbtn] = useState("Update");
  const api = new ClientAPI();

  useEffect(() => {
    async function fetchData() {
      try {
        if (!encodedOrderId) {
          console.error("No orderId provided");
          return;
        }
        const decodedOrderId = atob(String(encodedOrderId).trim());

        if (!decodedOrderId || decodedOrderId.trim() === "") {
          console.error("Decoded orderId is empty");
          return;
        }

        const response = await api.getIDGClients(decodedOrderId);

        if (response && response.orders) {
          setOrders(response.orders);
        } else {
          console.error("No orders in response");
        }
      } catch (e) {
        console.error("Error fetching orders:", e);
        console.error("Error details:", {
          message: e.message,
          encodedOrderId,
          stack: e.stack,
        });
      }
    }

    fetchData();
  }, [encodedOrderId]);

  useEffect(() => {
    if (selectedJob) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      setunitNumber(selectedJob.unitNumber || "");
    }
  }, [selectedJob]);

  const getStageStatus = (job, stage) => {
    const stages = ["ordered", "booked", "completed"];
    const currentIndex = stages.indexOf(job.status);
    const stageIndex = stages.indexOf(stage);

    if (stageIndex < currentIndex) return "complete";
    if (stageIndex === currentIndex) return "current";
    return "pending";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleuploadUnitNumber = (unitNumber, orderId) => {
    try {
      setIsClicked(true);
      setbtn("Updating");
      const res = api.updateUnitNumberOrder(unitNumber, orderId);
      console.log(res);
      setunitNumber(unitNumber);
      setTimeout(() => {
        setIsClicked(false);
        setbtn("Updated Successfully ✅");
        setTimeout(() => setbtn("Update"), 2000);
      }, 2000);
    } catch (e) {
      console.log("Error Occured!!", e);
    }
  };

  if (viewingImage && selectedJob?.thumbnail) {
    return (
      <div className="min-h-screen bg-white" id="top">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => setViewingImage(false)}
            className="mb-6 text-[#00AEEF] hover:text-[#0088CC] font-medium flex items-center gap-2 transition-colors"
          >
            <ChevronRight className="rotate-180" size={20} />
            Back to Dashboard
          </button>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-8 border-b border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {selectedJob.orderId}
                  </h1>
                  <p className="text-gray-600 mt-1">
                    {selectedJob.order_details}
                  </p>
                </div>
                <div className="bg-green-50 px-4 py-2 rounded-full">
                  <span className="text-green-700 font-semibold">
                    Completed
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="flex items-start gap-3">
                  <User className="text-[#00AEEF] mt-1" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">Client Name</p>
                    <p className="font-semibold text-gray-900">
                      {localStorage.getItem("name") || "Client"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="text-[#00AEEF] mt-1" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-semibold text-gray-900">
                      {selectedJob.client?.email || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="text-[#00AEEF] mt-1" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-semibold text-gray-900">
                      {selectedJob.client?.phone || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="flex items-center justify-between mb-8">
                  {["ordered", "booked", "completed"].map((stage, index) => {
                    const status = getStageStatus(selectedJob, stage);
                    const isComplete = status === "complete";
                    const isCurrent = status === "current";

                    return (
                      <div key={stage} className="flex items-center flex-1">
                        <div className="flex flex-col items-center flex-1">
                          <div
                            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 ${
                              isComplete || isCurrent
                                ? "bg-[#00AEEF] shadow-lg shadow-[#00AEEF]/30"
                                : "bg-gray-200"
                            }`}
                          >
                            {stage === "ordered" && (
                              <Package
                                className={`${
                                  isComplete || isCurrent
                                    ? "text-white"
                                    : "text-gray-400"
                                }`}
                                size={28}
                              />
                            )}
                            {stage === "booked" && (
                              <Calendar
                                className={`${
                                  isComplete || isCurrent
                                    ? "text-white"
                                    : "text-gray-400"
                                }`}
                                size={28}
                              />
                            )}
                            {stage === "completed" && (
                              <CheckCircle2
                                className={`${
                                  isComplete || isCurrent
                                    ? "text-white"
                                    : "text-gray-400"
                                }`}
                                size={28}
                              />
                            )}
                          </div>
                          <p
                            className={`mt-3 font-semibold capitalize ${
                              isComplete || isCurrent
                                ? "text-gray-900"
                                : "text-gray-400"
                            }`}
                          >
                            {stage === "ordered"
                              ? "Job Ordered"
                              : stage === "booked"
                              ? "Job Booked"
                              : "Job Completed"}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {stage === "ordered" &&
                              formatDate(selectedJob.orderDate)}
                            {stage === "booked" &&
                              formatDate(selectedJob.orderDate)}
                            {stage === "completed" &&
                              selectedJob.deliveryDate &&
                              formatDate(selectedJob.deliveryDate)}
                          </p>
                        </div>
                        {index < 2 && (
                          <div className="flex-1 h-1 -mt-12 mx-4">
                            <div
                              className={`h-full ${
                                getStageStatus(
                                  selectedJob,
                                  ["booked", "completed"][index]
                                ) !== "pending"
                                  ? "bg-[#00AEEF]"
                                  : "bg-gray-200"
                              }`}
                            ></div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Project Photos
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="group relative overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300">
                  <img
                    src={selectedJob.thumbnail}
                    alt="Project"
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-4 left-4 text-white">
                      <p className="font-semibold">High Resolution</p>
                      <p className="text-sm text-gray-200">Click to download</p>
                    </div>
                  </div>
                </div>
                <div className="group relative overflow-hidden rounded-xl border-2 border-dashed border-gray-300 hover:border-[#00AEEF] transition-colors duration-300 flex items-center justify-center h-64">
                  <div className="text-center text-gray-400 group-hover:text-[#00AEEF] transition-colors">
                    <Camera size={48} className="mx-auto mb-2" />
                    <p className="font-medium">More photos coming soon</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ffe2df] to-blue-200">
      <div className="max-w-[1350px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 bg-gradient-to-r from-[#00AEEF] to-[#0088CC] rounded-2xl shadow-lg border border-[#00AEEF]/30 p-8 fixed z-10 top-5 left-20 right-20 overflow-hidden">
          {/* Subtle Pattern Background */}
          <div className="absolute inset-0 opacity-60">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                backgroundSize: "40px 40px",
              }}
            ></div>
          </div>

          {/* Content */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="w-32 h-32 rounded-2xl bg-white flex items-center justify-center shadow-xl border border-white/20 transform hover:scale-105 transition-transform duration-300">
                <img
                  src={LogoUrl}
                  className="h-[85px] object-contain"
                  alt="Company Logo"
                />
              </div>
              <div className="space-y-2">
                <h1 className="text-4xl font-extrabold text-white/95 drop-shadow-lg">
                  Hello {localStorage.getItem("name") || "Client"} 👋
                </h1>
                <h2 className="text-2xl font-bold text-white/90 tracking-tight">
                  Welcome to Your Dashboard
                </h2>
                <p className="text-white/80 text-base font-medium flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-white/90"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                    />
                  </svg>
                  Track your orders and view completed work
                </p>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={() => {
                localStorage.clear();
                window.location.href = "/client/login";
              }}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-semibold px-6 py-3 rounded-xl border border-white/20 transition-all duration-300 hover:scale-105 hover:shadow-xl group"
            >
              <svg
                className="w-5 h-5 transition-transform group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Logout
            </button>
          </div>
        </div>

        {selectedJob ? (
          <div className="mt-55 space-y-6 animate-[fadeIn_0.5s_ease-in-out]">
            <button
              onClick={() => setSelectedJob(null)}
              className="text-[#00AEEF] hover:text-[#0088CC] font-medium flex items-center gap-2 transition-colors"
            >
              <ChevronRight className="rotate-180" size={20} />
              Back to All Jobs
            </button>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-[#00AEEF] to-[#0088CC] p-8 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold">
                      {selectedJob.orderId}
                    </h2>
                    <p className="text-blue-100 mt-2 text-lg">
                      {localStorage.getItem("name")}
                    </p>
                  </div>
                  <div
                    className={`px-6 py-3 rounded-full font-semibold ${
                      selectedJob.status === "completed"
                        ? "bg-green-500"
                        : selectedJob.status === "booked"
                        ? "bg-yellow-500"
                        : "bg-orange-500"
                    }`}
                  >
                    {selectedJob.status === "ordered"
                      ? "Job Ordered"
                      : selectedJob.status === "booked"
                      ? "Job Booked"
                      : "Job Completed"}
                  </div>
                </div>
              </div>

              <div className="p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  Order Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="w-12 h-12 bg-[#00AEEF] rounded-lg flex items-center justify-center flex-shrink-0">
                      <Info className="text-white" size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">
                        Order Details
                      </p>
                      <p className="font-semibold text-gray-900">
                        {selectedJob.order_details}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="w-12 h-12 bg-[#00AEEF] rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="text-white" size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Address</p>
                      <p className="font-semibold text-gray-900">
                        {selectedJob.deliveryAddress}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="w-12 h-12 bg-[#00AEEF] rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="text-white" size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Unit Number</p>
                      <div className="flex gap-3">
                        <input
                          type="text"
                          name="unitNumber"
                          value={unitNumber ?? ""}
                          onChange={(e) => setunitNumber(e.target.value)}
                          className="bg-white border border-gray-200 rounded-2xl p-1 text-xl"
                        />
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            className="border border-gray-200 rounded-2xl p-2 bg-[#00AEEF] text-white transition-colors flex gap-2"
                            onClick={() =>
                              handleuploadUnitNumber(
                                unitNumber,
                                selectedJob.orderId
                              )
                            }
                          >
                            {btn} {isClicked && <Loader></Loader>}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  Job Progress
                </h3>
                <div className="relative">
                  <div className="flex items-center justify-between">
                    {["ordered", "booked", "completed"].map((stage, index) => {
                      const status = getStageStatus(selectedJob, stage);
                      const isComplete = status === "complete";
                      const isCurrent = status === "current";

                      return (
                        <div key={stage} className="flex items-center flex-1">
                          <div className="flex flex-col items-center flex-1">
                            <div
                              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 transform ${
                                isComplete || isCurrent
                                  ? "bg-[#00AEEF] shadow-lg shadow-[#00AEEF]/30 scale-100"
                                  : "bg-gray-200 scale-90"
                              }`}
                            >
                              {stage === "ordered" && (
                                <Package
                                  className={`transition-all duration-300 ${
                                    isComplete || isCurrent
                                      ? "text-white"
                                      : "text-gray-400"
                                  }`}
                                  size={32}
                                />
                              )}
                              {stage === "booked" && (
                                <Calendar
                                  className={`transition-all duration-300 ${
                                    isComplete || isCurrent
                                      ? "text-white"
                                      : "text-gray-400"
                                  }`}
                                  size={32}
                                />
                              )}
                              {stage === "completed" && (
                                <CheckCircle2
                                  className={`transition-all duration-300 ${
                                    isComplete || isCurrent
                                      ? "text-white"
                                      : "text-gray-400"
                                  }`}
                                  size={32}
                                />
                              )}
                            </div>
                            <p
                              className={`mt-4 font-bold capitalize transition-colors text-center ${
                                isComplete || isCurrent
                                  ? "text-gray-900"
                                  : "text-gray-400"
                              }`}
                            >
                              {stage === "ordered"
                                ? "Job Ordered"
                                : stage === "booked"
                                ? "Job Booked"
                                : "Job Completed"}
                            </p>
                            {(stage === "ordered" ||
                              (stage === "booked" && selectedJob.orderDate) ||
                              (stage === "completed" &&
                                selectedJob.deliveryDate)) && (
                              <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                                <Clock size={14} />
                                <span>
                                  {stage === "ordered" &&
                                    formatDate(selectedJob.orderDate)}
                                  {stage === "booked" &&
                                    selectedJob.orderDate &&
                                    formatDate(selectedJob.orderDate)}
                                  {stage === "completed" &&
                                    selectedJob.deliveryDate &&
                                    formatDate(selectedJob.deliveryDate)}
                                </span>
                              </div>
                            )}
                          </div>
                          {index < 2 && (
                            <div className="flex-1 h-2 -mt-16 mx-6 rounded-full overflow-hidden bg-gray-200">
                              <div
                                className={`h-full transition-all duration-700 ease-in-out ${
                                  getStageStatus(
                                    selectedJob,
                                    ["booked", "completed"][index]
                                  ) !== "pending"
                                    ? "bg-[#00AEEF] w-full"
                                    : "bg-gray-200 w-0"
                                }`}
                              ></div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {selectedJob.status === "completed" &&
                  selectedJob.imageUrl &&
                  selectedJob.imageUrl[0] && (
                    <div className="mt-12">
                      <h3 className="text-xl font-bold text-gray-900">
                        Project Photos
                      </h3>
                      <p className="font-bold text-gray-500 mb-4">
                        Click on the image for fullscreen
                      </p>
                      <div className="relative group">
                        <div
                          className="overflow-hidden rounded-2xl shadow-lg cursor-pointer"
                          onClick={() => setViewingImage(true)}
                        >
                          <img
                            src={selectedJob.imageUrl[0]}
                            onClick={() =>
                              window.open(selectedJob.imageUrl[0], "_blank")
                            }
                            alt="Project thumbnail"
                            className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      </div>
                      <div className="text-center mt-10">
                        <p className="text-gray-700 text-lg">
                          ⭐ Love using our service?{" "}
                          <a
                            href="https://share.google/COJKas8ABk3zOKCuC"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#00AEEF] hover:underline"
                          >
                            Rate us on Google!
                          </a>{" "}
                          💙
                        </p>
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="mt-55 space-y-6">
              <h2 className="ml-5 text-2xl font-bold text-gray-800 mb-2 underline decoration-[#00AEEF]">
                Active Orders
              </h2>
              {orders.filter(
                (job) => job.status === "booked" || job.status === "ordered"
              ).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <img
                    src="/undraw_no-data_ig65.svg"
                    alt="No active orders"
                    className="w-20 h-auto mb-4"
                  />
                  <p className="text-gray-600 text-lg">
                    No active orders at the moment.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {orders
                    .filter(
                      (job) =>
                        job.status === "booked" || job.status === "ordered"
                    )
                    .map((job, index) => {
                      const stages = ["ordered", "booked", "completed"];
                      const currentStageIndex = stages.indexOf(job.status);

                      return (
                        <div
                          key={job.id}
                          className="bg-white/90 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-[#00AEEF]/30 transition-all duration-300 overflow-hidden cursor-pointer group"
                          onClick={() => setSelectedJob(job)}
                          style={{
                            animation: `slideIn 0.5s ease-out ${
                              index * 0.1
                            }s backwards`,
                          }}
                        >
                          <div className="p-6">
                            {/* Header Section */}
                            <div className="flex items-start justify-between mb-6">
                              <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-gradient-to-br from-[#00AEEF] to-[#0088CC] rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                                  <Package className="text-white" size={28} />
                                </div>
                                <div>
                                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#00AEEF] transition-colors">
                                    {job.orderId}
                                  </h3>
                                  <p className="text-gray-600">
                                    Delivery Address: {job.deliveryAddress}
                                  </p>
                                  <p className="text-gray-600">
                                    Order Details: {job.order_details}
                                  </p>
                                </div>
                              </div>

                              <div className="flex flex-col items-center">
                                <span
                                  className={`px-4 py-1 rounded-full text-sm font-semibold ${
                                    job.status === "completed"
                                      ? "bg-green-100 text-green-700"
                                      : job.status === "booked"
                                      ? "bg-yellow-100 text-yellow-700"
                                      : "bg-orange-100 text-orange-700"
                                  }`}
                                >
                                  {job.status === "ordered"
                                    ? "Ordered"
                                    : job.status === "booked"
                                    ? "Booked"
                                    : "Completed"}
                                </span>
                                <img
                                  src="/undraw_booked_bb22.svg"
                                  className="mt-4 w-[90px]"
                                  alt="Order Illustration"
                                />
                              </div>
                            </div>

                            {/* Progress Tracker */}
                            <div className="flex items-center justify-between">
                              {stages.map((stage, i) => {
                                const stageActive = i <= currentStageIndex;

                                return (
                                  <div
                                    key={stage}
                                    className="flex items-center flex-1"
                                  >
                                    {/* Stage Circle */}
                                    <div className="flex flex-col items-center flex-1">
                                      <div
                                        className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 transform ${
                                          stageActive
                                            ? "bg-green-500 shadow-lg shadow-[#00AEEF]/30 scale-100"
                                            : "bg-yellow-500 scale-90"
                                        }`}
                                      >
                                        {stage === "ordered" && (
                                          <Package
                                            className={`transition-all duration-300 ${
                                              stageActive
                                                ? "text-white"
                                                : "text-gray-400"
                                            }`}
                                            size={32}
                                          />
                                        )}
                                        {stage === "booked" && (
                                          <Calendar
                                            className={`transition-all duration-300 ${
                                              stageActive
                                                ? "text-white"
                                                : "text-gray-400"
                                            }`}
                                            size={32}
                                          />
                                        )}
                                        {stage === "completed" && (
                                          <CheckCircle2
                                            className={`transition-all duration-300 text-white
                                                                                            }`}
                                            size={32}
                                          />
                                        )}
                                      </div>

                                      {/* Stage Label */}
                                      <p
                                        className={`mt-4 font-bold capitalize transition-colors text-center ${
                                          stageActive
                                            ? "text-gray-900"
                                            : "text-gray-400"
                                        }`}
                                      >
                                        {stage === "ordered"
                                          ? "Job Ordered"
                                          : stage === "booked"
                                          ? "Job Booked"
                                          : "Job Completed"}
                                      </p>

                                      {/* Date Display */}
                                      <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                                        <Calendar size={14} />
                                        <span>
                                          {stage === "ordered" &&
                                            formatDate(job.orderDate)}
                                          {stage === "booked" &&
                                            formatDate(job.deliveryDate)}
                                          {stage === "completed" &&
                                            formatDate(job.deliveryDate)}
                                        </span>
                                      </div>
                                    </div>

                                    {/* Connector Line */}
                                    {i < stages.length - 1 && (
                                      <div className="flex-1 h-2 -mt-16 mx-6 rounded-full overflow-hidden bg-gray-200">
                                        <div
                                          className={`h-full transition-all duration-700 ease-in-out ${
                                            i < currentStageIndex
                                              ? "bg-green-500 w-full"
                                              : "bg-yellow-500 w-full"
                                          }`}
                                        ></div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            <div className="mt-10 space-y-6">
              <h2 className="ml-5 text-2xl font-bold text-gray-800 mb-2 underline decoration-[#00AEEF]">
                Order History
              </h2>
              {orders.filter((job) => job.status === "completed").length ===
              0 ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <img
                    src="/undraw_no-data_ig65.svg"
                    alt="No active orders"
                    className="w-20 h-auto mb-4"
                  />
                  <p className="text-gray-600 text-lg">
                    You don’t have any completed orders yet. Once your jobs are
                    finished, they’ll appear here for your reference.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {orders
                    .filter((job) => job.status === "completed")
                    .map((job, index) => {
                      const stages = ["ordered", "booked", "completed"];
                      const currentStageIndex = stages.indexOf(job.status);

                      return (
                        <div
                          key={job.id}
                          className="bg-white/90 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-[#00AEEF]/30 transition-all duration-300 overflow-hidden cursor-pointer group"
                          onClick={() => setSelectedJob(job)}
                          style={{
                            animation: `slideIn 0.5s ease-out ${
                              index * 0.1
                            }s backwards`,
                          }}
                        >
                          <div className="p-6">
                            {/* Header Section */}
                            <div className="flex items-start justify-between mb-6">
                              <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-gradient-to-br from-[#00AEEF] to-[#0088CC] rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                                  <Package className="text-white" size={28} />
                                </div>
                                <div>
                                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#00AEEF] transition-colors">
                                    {job.orderId}
                                  </h3>
                                  <p className="text-gray-600">
                                    Delivery Address: {job.deliveryAddress}
                                  </p>
                                  <p className="text-gray-600">
                                    Order Details: {job.order_details}
                                  </p>
                                </div>
                              </div>

                              <div className="flex flex-col items-center">
                                <span
                                  className={`px-4 py-1 rounded-full text-sm font-semibold ${
                                    job.status === "completed"
                                      ? "bg-green-100 text-green-700"
                                      : job.status === "booked"
                                      ? "bg-yellow-100 text-yellow-700"
                                      : "bg-orange-100 text-orange-700"
                                  }`}
                                >
                                  {job.status === "ordered"
                                    ? "Ordered"
                                    : job.status === "booked"
                                    ? "Booked"
                                    : "Completed"}
                                </span>
                                <img
                                  src={job.imageUrl[0]}
                                  onClick={() =>
                                    window.open(
                                      selectedJob.imageUrl[0],
                                      "_blank"
                                    )
                                  }
                                  className="mt-4 w-[90px]"
                                  alt="Order Illustration"
                                />
                                <p className="text-gray-600 text-[12px]">
                                  Click to open
                                </p>
                              </div>
                            </div>

                            {/* Progress Tracker */}
                            <div className="flex items-center justify-between">
                              {stages.map((stage, i) => {
                                const stageActive = i <= currentStageIndex;

                                return (
                                  <div
                                    key={stage}
                                    className="flex items-center flex-1"
                                  >
                                    {/* Stage Circle */}
                                    <div className="flex flex-col items-center flex-1">
                                      <div
                                        className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 transform ${
                                          stageActive
                                            ? "bg-[#00AEEF] shadow-lg shadow-[#00AEEF]/30 scale-100"
                                            : "bg-gray-200 scale-90"
                                        }`}
                                      >
                                        {stage === "ordered" && (
                                          <Package
                                            className={`transition-all duration-300 ${
                                              stageActive
                                                ? "text-white"
                                                : "text-gray-400"
                                            }`}
                                            size={32}
                                          />
                                        )}
                                        {stage === "booked" && (
                                          <Calendar
                                            className={`transition-all duration-300 ${
                                              stageActive
                                                ? "text-white"
                                                : "text-gray-400"
                                            }`}
                                            size={32}
                                          />
                                        )}
                                        {stage === "completed" && (
                                          <CheckCircle2
                                            className={`transition-all duration-300 ${
                                              stageActive
                                                ? "text-white"
                                                : "text-gray-400"
                                            }`}
                                            size={32}
                                          />
                                        )}
                                      </div>

                                      {/* Stage Label */}
                                      <p
                                        className={`mt-4 font-bold capitalize transition-colors text-center ${
                                          stageActive
                                            ? "text-gray-900"
                                            : "text-gray-400"
                                        }`}
                                      >
                                        {stage === "ordered"
                                          ? "Job Ordered"
                                          : stage === "booked"
                                          ? "Job Booked"
                                          : "Job Completed"}
                                      </p>

                                      {/* Date Display */}
                                      <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                                        <Calendar size={14} />
                                        <span>
                                          {stage === "ordered" &&
                                            formatDate(job.orderDate)}
                                          {stage === "booked" &&
                                            formatDate(job.deliveryDate)}
                                          {stage === "completed" &&
                                            formatDate(job.deliveryDate)}
                                        </span>
                                      </div>
                                    </div>

                                    {/* Connector Line */}
                                    {i < stages.length - 1 && (
                                      <div className="flex-1 h-2 -mt-16 mx-6 rounded-full overflow-hidden bg-gray-200">
                                        <div
                                          className={`h-full transition-all duration-700 ease-in-out ${
                                            i < currentStageIndex
                                              ? "bg-[#00AEEF] w-full"
                                              : "bg-gray-200 w-0"
                                          }`}
                                        ></div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </>
        )}

        <footer className="text-sm text-slate-500 font-medium mt-8 py-2 flex justify-center gap-2 mx-auto w-fit">
          <p>Powered By </p>
          <img className="w-15 h-auto" src="/Logo.png" alt="Logo" />
        </footer>
      </div>

      <style>{`
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }
                    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }
        @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }

            `}</style>
    </div>
  );
}
