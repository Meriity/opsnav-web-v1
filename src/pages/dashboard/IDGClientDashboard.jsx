import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Loader from "../../components/ui/smallLoader.jsx";
import {
  Package,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Info,
  FileText,
  Camera,
  ChevronRight,
} from "lucide-react";

import ClientAPI from "../../api/clientAPI";

export default function IDGClientDashboard() {
  const [orders, setOrders] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [unitNumber, setUnitNumber] = useState("");
  const [updatingUnit, setUpdatingUnit] = useState(false);
  const [updateLabel, setUpdateLabel] = useState("Update");
  const [viewingImage, setViewingImage] = useState(false);

  const api = new ClientAPI();
  const { orderId: encodedOrderId } = useParams();

  const LogoUrl = localStorage.getItem("logo");
  const clientName = localStorage.getItem("name") || "Client";

  // ============================================================
  // FETCH ORDERS
  // ============================================================
  useEffect(() => {
    async function fetchData() {
      try {
        if (!encodedOrderId) return;

        const decodedOrderId = atob(String(encodedOrderId).trim());
        if (!decodedOrderId) return;

        const response = await api.getIDGClients(decodedOrderId);
        if (response && response.orders) {
          setOrders(response.orders);
        }
      } catch (e) {
        console.error("Error fetching orders:", e);
      }
    }

    fetchData();
  }, [encodedOrderId]);

  // ============================================================
  // WHEN SELECTED JOB CHANGES, SET UNIT NUMBER
  // ============================================================
  useEffect(() => {
    if (selectedJob) {
      setUnitNumber(selectedJob.unitNumber || "");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [selectedJob]);

  // ============================================================
  // DATE FORMATTER
  // ============================================================
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // ============================================================
  // STAGE STATUS (ORDERED -> BOOKED -> COMPLETED)
  // ============================================================
  const getStageStatus = (job, stage) => {
    const stages = ["ordered", "booked", "completed"];
    const currentIndex = stages.indexOf(job.status);
    const stageIndex = stages.indexOf(stage);

    if (stageIndex < currentIndex) return "complete";
    if (stageIndex === currentIndex) return "current";
    return "pending";
  };

  // ============================================================
  // UPDATE UNIT NUMBER
  // ============================================================
  const handleUnitUpdate = async () => {
    if (!selectedJob) return;
    try {
      setUpdatingUnit(true);
      setUpdateLabel("Updating...");
      await api.updateUnitNumberOrder(unitNumber, selectedJob.orderId);

      setTimeout(() => {
        setUpdatingUnit(false);
        setUpdateLabel("Updated ✅");
        setTimeout(() => setUpdateLabel("Update"), 1500);
      }, 1000);
    } catch (e) {
      console.error("Error updating unit number:", e);
      setUpdatingUnit(false);
      setUpdateLabel("Failed");
      setTimeout(() => setUpdateLabel("Update"), 1500);
    }
  };

  // ============================================================
  // FULLSCREEN IMAGE VIEW
  // ============================================================
  if (viewingImage && selectedJob?.imageUrl?.[0]) {
    return (
      <div className="min-h-screen bg-white p-6">
        <button
          onClick={() => setViewingImage(false)}
          className="flex items-center gap-2 text-blue-600 mb-4 font-medium"
        >
          <ChevronRight className="rotate-180" size={18} />
          Back to Dashboard
        </button>

        <img
          src={selectedJob.imageUrl[0]}
          alt="Project"
          className="w-full max-h-[80vh] object-contain rounded-xl shadow"
        />
      </div>
    );
  }

  // ============================================================
  // MAIN RENDER
  // ============================================================
  const activeOrders = orders.filter(
    (job) => job.status === "ordered" || job.status === "booked"
  );
  const completedOrders = orders.filter((job) => job.status === "completed");

  const getStatusLabel = (status) => {
    if (status === "ordered") return "Ordered";
    if (status === "booked") return "Booked";
    if (status === "completed") return "Completed";
    return status;
  };

  const getStatusClasses = (status) => {
    if (status === "completed") return "bg-green-100 text-green-700";
    if (status === "booked") return "bg-yellow-100 text-yellow-700";
    return "bg-orange-100 text-orange-700";
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-16">
      {/* HEADER */}
      <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-4">
          {LogoUrl && (
            <img
              src={LogoUrl}
              alt="Logo"
              className="w-12 h-12 object-contain rounded-md"
            />
          )}
          <div>
            <h1 className="text-xl font-bold">Hello, {clientName}</h1>
            <p className="text-gray-600 text-sm">
              Track your jobs and see completed work.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            localStorage.clear();
            window.location.href = "/client/login";
          }}
          className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600"
        >
          Logout
        </button>
      </header>

      <div className="max-w-5xl mx-auto px-4 pt-8">
        {/* IF A JOB IS SELECTED – DETAIL VIEW */}
        {selectedJob ? (
          <div className="space-y-6">
            <button
              onClick={() => setSelectedJob(null)}
              className="flex items-center gap-2 text-blue-600 mb-2 text-sm"
            >
              <ChevronRight className="rotate-180" size={16} />
              Back to all jobs
            </button>

            {/* JOB HEADER CARD */}
            <div className="bg-white rounded-xl shadow p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold mb-1">
                    Order ID: {selectedJob.orderId}
                  </h2>
                  <p className="text-gray-600 text-sm mb-2">
                    {selectedJob.order_details}
                  </p>
                  <p className="text-gray-500 text-xs">
                    Placed on: {formatDate(selectedJob.orderDate)}
                  </p>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusClasses(
                    selectedJob.status
                  )}`}
                >
                  {getStatusLabel(selectedJob.status)}
                </span>
              </div>
            </div>

            {/* ORDER INFO */}
            <div className="bg-white rounded-xl shadow p-5 space-y-5">
              <h3 className="text-lg font-semibold mb-3">Order Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Details */}
                <div className="flex items-start gap-3 bg-gray-50 rounded-lg p-3">
                  <div className="w-10 h-10 rounded-md bg-blue-500 flex items-center justify-center">
                    <Info size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Order Details</p>
                    <p className="text-sm font-semibold">
                      {selectedJob.order_details}
                    </p>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start gap-3 bg-gray-50 rounded-lg p-3">
                  <div className="w-10 h-10 rounded-md bg-blue-500 flex items-center justify-center">
                    <MapPin size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Delivery Address</p>
                    <p className="text-sm font-semibold">
                      {selectedJob.deliveryAddress}
                    </p>
                  </div>
                </div>

                {/* Unit Number */}
                <div className="flex items-start gap-3 bg-gray-50 rounded-lg p-3">
                  <div className="w-10 h-10 rounded-md bg-blue-500 flex items-center justify-center">
                    <FileText size={20} className="text-white" />
                  </div>
                  <div className="w-full">
                    <p className="text-xs text-gray-500 mb-1">Unit Number</p>
                    <div className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={unitNumber}
                        onChange={(e) => setUnitNumber(e.target.value)}
                        className="border border-gray-300 rounded-lg px-2 py-1 text-sm flex-1"
                        placeholder="Enter unit number"
                      />
                      <button
                        type="button"
                        onClick={handleUnitUpdate}
                        disabled={updatingUnit}
                        className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-1.5 rounded-lg disabled:opacity-60"
                      >
                        {updateLabel}
                        {updatingUnit && <Loader />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* JOB PROGRESS */}
            <div className="bg-white rounded-xl shadow p-5">
              <h3 className="text-lg font-semibold mb-4">Job Progress</h3>
              <div className="flex items-center justify-between">
                {["ordered", "booked", "completed"].map((stage, index) => {
                  const status = getStageStatus(selectedJob, stage);
                  const isComplete = status === "complete";
                  const isCurrent = status === "current";

                  return (
                    <div key={stage} className="flex items-center flex-1">
                      <div className="flex flex-col items-center flex-1">
                        <div
                          className={`w-16 h-16 rounded-full flex items-center justify-center ${isComplete || isCurrent
                              ? "bg-blue-500 text-white"
                              : "bg-gray-200 text-gray-500"
                            }`}
                        >
                          {stage === "ordered" && <Package size={26} />}
                          {stage === "booked" && <Calendar size={26} />}
                          {stage === "completed" && <CheckCircle2 size={26} />}
                        </div>
                        <p className="mt-2 text-xs font-semibold text-center">
                          {stage === "ordered"
                            ? "Job Ordered"
                            : stage === "booked"
                              ? "Job Booked"
                              : "Job Completed"}
                        </p>
                        <div className="flex items-center gap-1 mt-1 text-[11px] text-gray-600">
                          <Clock size={12} />
                          <span>
                            {stage === "ordered" &&
                              formatDate(selectedJob.orderDate)}
                            {stage === "booked" &&
                              formatDate(selectedJob.orderDate)}
                            {stage === "completed" &&
                              formatDate(selectedJob.deliveryDate)}
                          </span>
                        </div>
                      </div>

                      {index < 2 && (
                        <div className="flex-1 h-[2px] bg-gray-300 mx-2">
                          <div
                            className={`h-full ${getStageStatus(selectedJob, [
                              "booked",
                              "completed",
                            ][index]) !== "pending"
                                ? "bg-blue-500"
                                : "bg-gray-300"
                              }`}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* PROJECT PHOTOS (only if completed) */}
            {selectedJob.status === "completed" &&
              selectedJob.imageUrl &&
              selectedJob.imageUrl[0] && (
                <div className="bg-white rounded-xl shadow p-5">
                  <h3 className="text-lg font-semibold mb-2">Project Photos</h3>
                  <p className="text-xs text-gray-500 mb-3">
                    Click on the image to view fullscreen
                  </p>
                  <div
                    className="rounded-xl overflow-hidden border cursor-pointer max-w-xl"
                    onClick={() => setViewingImage(true)}
                  >
                    <img
                      src={selectedJob.imageUrl[0]}
                      alt="Project"
                      className="w-full h-64 object-cover"
                    />
                  </div>

                  <div className="text-center mt-6">
                    <p className="text-sm text-gray-700">
                      ⭐ Liked our work?{" "}
                      <a
                        href="https://share.google/COJKas8ABk3zOKCuC"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        Rate us on Google
                      </a>
                      .
                    </p>
                  </div>
                </div>
              )}
          </div>
        ) : (
          <>
            {/* ACTIVE ORDERS */}
            <section className="mt-2 mb-8">
              <h2 className="text-lg font-semibold mb-3">Active Orders</h2>
              {activeOrders.length === 0 ? (
                <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
                  <img
                    src="/undraw_no-data_ig65.svg"
                    alt="No active orders"
                    className="w-24 mb-3"
                  />
                  <p className="text-gray-600 text-sm">
                    You don’t have any active orders right now.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeOrders.map((job) => {
                    const stages = ["ordered", "booked", "completed"];
                    const currentStageIndex = stages.indexOf(job.status);

                    return (
                      <div
                        key={job.id}
                        className="bg-white rounded-xl shadow p-5 cursor-pointer hover:shadow-md transition"
                        onClick={() => setSelectedJob(job)}
                      >
                        <div className="flex items-start justify-between mb-4 gap-4">
                          <div>
                            <h3 className="text-md font-bold">
                              Order ID: {job.orderId}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {job.order_details}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Delivery: {job.deliveryAddress}
                            </p>
                          </div>
                          <div className="flex flex-col items-end">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusClasses(
                                job.status
                              )}`}
                            >
                              {getStatusLabel(job.status)}
                            </span>
                            <Camera className="mt-4 w-8 h-8 text-gray-300" />
                          </div>
                        </div>

                        {/* Progress (compact) */}
                        <div className="flex items-center justify-between">
                          {stages.map((stage, index) => {
                            const active = index <= currentStageIndex;
                            return (
                              <div
                                key={stage}
                                className="flex items-center flex-1"
                              >
                                <div className="flex flex-col items-center flex-1">
                                  <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${active
                                        ? "bg-blue-500 text-white"
                                        : "bg-gray-200 text-gray-500"
                                      }`}
                                  >
                                    {stage === "ordered" && "1"}
                                    {stage === "booked" && "2"}
                                    {stage === "completed" && "3"}
                                  </div>
                                  <p className="mt-1 text-[11px] text-gray-600">
                                    {stage === "ordered"
                                      ? "Ordered"
                                      : stage === "booked"
                                        ? "Booked"
                                        : "Completed"}
                                  </p>
                                </div>
                                {index < stages.length - 1 && (
                                  <div className="flex-1 h-[2px] bg-gray-200 mx-2">
                                    <div
                                      className={`h-full ${index < currentStageIndex
                                          ? "bg-blue-500"
                                          : "bg-gray-200"
                                        }`}
                                    />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* ORDER HISTORY */}
            <section>
              <h2 className="text-lg font-semibold mb-3">Order History</h2>
              {completedOrders.length === 0 ? (
                <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
                  <img
                    src="/undraw_no-data_ig65.svg"
                    alt="No completed orders"
                    className="w-24 mb-3"
                  />
                  <p className="text-gray-600 text-sm text-center">
                    You don’t have any completed orders yet. Once your jobs are
                    finished, they’ll appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {completedOrders.map((job) => {
                    const stages = ["ordered", "booked", "completed"];
                    return (
                      <div
                        key={job.id}
                        className="bg-white rounded-xl shadow p-5 cursor-pointer hover:shadow-md transition"
                        onClick={() => setSelectedJob(job)}
                      >
                        <div className="flex items-start justify-between mb-4 gap-4">
                          <div>
                            <h3 className="text-md font-bold">
                              Order ID: {job.orderId}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {job.order_details}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Delivered on: {formatDate(job.deliveryDate)}
                            </p>
                          </div>

                          <div className="flex flex-col items-end">
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                              Completed
                            </span>
                            {job.imageUrl?.[0] ? (
                              <>
                                <img
                                  src={job.imageUrl[0]}
                                  alt="Project"
                                  className="mt-3 w-20 h-20 object-cover rounded-md border cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(job.imageUrl[0], "_blank");
                                  }}
                                />
                                <p className="text-[11px] text-gray-500 mt-1">
                                  Click to open
                                </p>
                              </>
                            ) : (
                              <Camera className="mt-4 w-8 h-8 text-gray-300" />
                            )}
                          </div>
                        </div>

                        {/* Static progress (all completed) */}
                        <div className="flex items-center justify-between">
                          {stages.map((stage, index) => (
                            <div
                              key={stage}
                              className="flex items-center flex-1"
                            >
                              <div className="flex flex-col items-center flex-1">
                                <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">
                                  {index + 1}
                                </div>
                                <p className="mt-1 text-[11px] text-gray-700">
                                  {stage === "ordered"
                                    ? "Ordered"
                                    : stage === "booked"
                                      ? "Booked"
                                      : "Completed"}
                                </p>
                              </div>
                              {index < stages.length - 1 && (
                                <div className="flex-1 h-[2px] bg-blue-500 mx-2" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}

        {/* FOOTER */}
        <footer className="text-xs text-gray-500 mt-10 flex items-center justify-center gap-2">
          <span>Powered by</span>
          <img src="/Logo.png" alt="Logo" className="h-5 w-auto" />
        </footer>
      </div>
    </div>
  );
}
