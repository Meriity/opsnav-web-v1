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
  Power,
} from "lucide-react";

import ClientAPI from "../../api/clientAPI";

const FloatingElement = ({ top, left, delay, size = 60 }) => (
  <div
    className="absolute rounded-full bg-gradient-to-r from-[#2E3D99]/10 to-[#1D97D7]/20 opacity-20 hidden sm:block animate-float"
    style={{
      width: size,
      height: size,
      top: `${top}%`,
      left: `${left}%`,
      animationDelay: `${delay}s`,
    }}
  />
);

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
        if (!encodedOrderId) return;
        const decodedOrderId = atob(String(encodedOrderId).trim());
        if (!decodedOrderId || decodedOrderId.trim() === "") return;

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

  useEffect(() => {
    if (selectedJob) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      setunitNumber(selectedJob.unitNumber || "");
      
      window.history.pushState({ jobOpen: true }, "", `#job-${selectedJob.orderId}`);
    } else {
      if (window.location.hash) {
        window.history.back(); 
        window.history.replaceState(null, "", window.location.pathname);
      }
    }

    const handlePopState = (event) => {
      if (!event.state?.jobOpen && selectedJob) {
         setSelectedJob(null);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
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
      api.updateUnitNumberOrder(unitNumber, orderId);
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

  // Status Badge Component
  const StatusBadge = ({ status }) => {
    let styles = "";
    let label = "";
    
    switch (status) {
      case "ordered":
        styles = "bg-orange-100 text-orange-700 border-orange-200";
        label = "Ordered";
        break;
      case "booked":
        styles = "bg-yellow-100 text-yellow-700 border-yellow-200";
        label = "Booked";
        break;
      case "completed":
        styles = "bg-green-100 text-green-700 border-green-200";
        label = "Completed";
        break;
      default:
        styles = "bg-gray-100 text-gray-700 border-gray-200";
        label = status;
    }

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${styles}`}>
        {label}
      </span>
    );
  };

  if (viewingImage && selectedJob?.imageUrl && selectedJob.imageUrl[0]) {
    return (
      <div 
        className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
        onClick={() => setViewingImage(false)}
      >
          <button className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors">
            <ChevronRight size={32} className="rotate-45" /> {/* Close Icon */}
          </button>
          <img 
            src={selectedJob.imageUrl[0]} 
            alt="Fullscreen" 
            className="max-w-full max-h-[90vh] rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#2E3D99]/5 to-[#1D97D7]/10 relative overflow-hidden font-sans">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <FloatingElement top={10} left={10} delay={0} />
        <FloatingElement top={20} left={85} delay={1} size={80} />
        <FloatingElement top={70} left={5} delay={2} size={40} />
        <FloatingElement top={80} left={90} delay={1.5} size={100} />
        <div className="absolute inset-0 opacity-[0.06]">
           <div
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(to right, #000 1px, transparent 1px),
                              linear-gradient(to bottom, #000 1px, transparent 1px)`,
              backgroundSize: "30px 30px",
            }}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8 sm:mb-12">
           <div className="flex items-center gap-4 w-full md:w-auto">
              <img
                src="/Logo.png" 
                alt="OpsNav" 
                className="h-8 sm:h-10 w-auto object-contain"
              />
              <div className="h-8 w-px bg-gray-300 mx-2 hidden sm:block"></div>
              {LogoUrl && (
                  <img
                    src={LogoUrl}
                    alt="Client Logo"
                    className="h-8 sm:h-10 w-auto object-contain"
                  />
              )}
           </div>
           
           <div className="flex items-center gap-4 w-full md:w-auto justify-end">
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.href = "/client/login";
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 shadow-sm transition-all duration-200 active:scale-95"
              >
                <Power size={18} />
                <span>Sign Out</span>
              </button>
           </div>
        </div>

        {/* Welcome Block */}
        <div className="mb-10 sm:mb-12 text-center md:text-left">
           <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 tracking-tight mb-3">
             Hello, <span className="bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] bg-clip-text text-transparent">{localStorage.getItem("name") || "Client"}</span> <span className="inline-block animate-wave origin-[70%_70%]">👋</span>
           </h1>
           <p className="text-lg text-gray-600 max-w-2xl">
             Welcome back to your project dashboard. Track your active orders and view history below.
           </p>
        </div>

        {selectedJob ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <button
              onClick={() => setSelectedJob(null)}
              className="mb-8 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 hover:border-gray-300 hover:shadow-md transition-all duration-200 flex items-center gap-2 group shadow-sm w-fit"
            >
              <div className="p-1 rounded-full bg-gray-100 group-hover:bg-white transition-colors">
                 <ChevronRight className="rotate-180 w-4 h-4 text-gray-600" />
              </div>
              Back to Dashboard
            </button>

            <div className="bg-white/90 backdrop-blur-xl border border-white/50 rounded-3xl shadow-xl overflow-hidden">
               {/* Job Header */}
               <div className={`p-6 sm:p-8 md:p-10 border-b border-gray-100 ${
                  selectedJob.status === "completed" ? "bg-gradient-to-r from-emerald-50/80 via-white to-white" :
                  selectedJob.status === "booked" ? "bg-gradient-to-r from-amber-50/80 via-white to-white" :
                  "bg-gradient-to-r from-orange-50/80 via-white to-white"
               }`}>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                     <div>
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                           <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 break-all">{selectedJob.orderId}</h2>
                           <StatusBadge status={selectedJob.status} />
                        </div>
                        <p className="text-gray-500 flex items-center gap-2 text-sm sm:text-base">
                           <Clock size={16} />
                           Updated {formatDate(new Date().toISOString())}
                        </p>
                     </div>
                     <div className="flex items-center gap-2">
                        {/* Actions if needed */}
                     </div>
                  </div>

                  {/* Large Status Tracker */}
                  <div className="relative py-8 md:px-12">
                    <div className="hidden md:block absolute top-[64px] left-0 w-full h-1 bg-gray-100 -translate-y-1/2 z-0"></div>
                    
                     {/* Progress Line */}
                     <div className="hidden md:block absolute top-[64px] left-0 h-1 bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] -translate-y-1/2 z-0 transition-all duration-1000"
                        style={{
                           width: selectedJob.status === "ordered" ? "15%" : selectedJob.status === "booked" ? "50%" : "100%"
                        }}
                     ></div>

                    <div className="relative z-10 flex flex-col md:flex-row justify-between gap-8 md:gap-0">
                       {["ordered", "booked", "completed"].map((stage, idx) => {
                          const status = getStageStatus(selectedJob, stage);
                          const isComplete = status === "complete";
                          const isCurrent = status === "current";
                          const isActive = isComplete || isCurrent;

                          return (
                             <div key={stage} className="flex md:flex-col items-center gap-4 md:gap-4 md:text-center group">
                                <div className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-lg ${
                                   isActive 
                                   ? "bg-gradient-to-br from-[#2E3D99] to-[#1D97D7] text-white scale-110" 
                                   : "bg-white text-gray-300 border-2 border-dashed border-gray-200"
                                }`}>
                                   {stage === "ordered" && <Package size={24} />}
                                   {stage === "booked" && <Calendar size={24} />}
                                   {stage === "completed" && <CheckCircle2 size={24} />}
                                </div>
                                <div>
                                   <p className={`font-bold text-base md:text-lg capitalize ${isActive ? "text-gray-900" : "text-gray-400"}`}>
                                      Job {stage}
                                   </p>
                                   <p className="text-sm text-gray-500 mt-1">
                                      {stage === "ordered" && formatDate(selectedJob.orderDate)}
                                      {stage === "booked" && selectedJob.orderDate && formatDate(selectedJob.deliveryDate)}
                                      {stage === "completed" && selectedJob.deliveryDate && formatDate(selectedJob.deliveryDate)}
                                   </p>
                                </div>
                             </div>
                          );
                       })}
                    </div>
                  </div>
               </div>

               {/* Job Details Grid */}
               <div className="p-6 sm:p-8 md:p-10 bg-gray-50/50">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                     
                     {/* Info Card */}
                     <div className="space-y-6">
                        <h3 className="text-lg font-bold text-gray-900 border-l-4 border-[#2E3D99] pl-3">Order Details</h3>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                           <div className="flex gap-4">
                              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-[#2E3D99]">
                                 <Info size={20} />
                              </div>
                              <div>
                                 <p className="text-sm text-gray-500 font-medium">Description</p>
                                 <p className="text-gray-900 font-medium mt-1">{selectedJob.order_details}</p>
                              </div>
                           </div>

                           <div className="flex gap-4">
                              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-[#2E3D99]">
                                 <MapPin size={20} />
                              </div>
                              <div>
                                 <p className="text-sm text-gray-500 font-medium">Delivery Address</p>
                                 <p className="text-gray-900 font-medium mt-1">{selectedJob.deliveryAddress}</p>
                              </div>
                           </div>
                           
                           <div className="flex gap-4">
                             <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-[#2E3D99]">
                                <FileText size={20} />
                             </div>
                             <div className="w-full">
                                <p className="text-sm text-gray-500 font-medium">Unit Number</p>
                                <div className="flex flex-col sm:flex-row gap-2 mt-2 w-full">
                                  <input 
                                    type="text" 
                                    value={unitNumber ?? ""}
                                    onChange={(e) => setunitNumber(e.target.value)}
                                    className="w-full sm:flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E3D99]/20 focus:border-[#2E3D99]"
                                    placeholder="Enter Unit No."
                                  />
                                  <button
                                    onClick={() => handleuploadUnitNumber(unitNumber, selectedJob.orderId)}
                                    className="w-full sm:w-auto bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors whitespace-nowrap"
                                  >
                                    {btn}
                                  </button>
                                </div>
                             </div>
                           </div>
                        </div>
                     </div>

                     {/* Photos Section */}
                     <div className="space-y-6">
                        <h3 className="text-lg font-bold text-gray-900 border-l-4 border-[#2E3D99] pl-3">Project Photos</h3>
                        
                        {selectedJob.imageUrl && selectedJob.imageUrl[0] ? (
                           <div className="grid grid-cols-1 xs:grid-cols-2 gap-4">
                              <div 
                                className="group relative aspect-video bg-gray-100 rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-lg transition-all"
                                onClick={() => setViewingImage(true)}
                              >
                                 <img 
                                   src={selectedJob.imageUrl[0]} 
                                   alt="Project" 
                                   className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                 />
                                 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <span className="text-white font-medium flex items-center gap-2">
                                       <Camera size={16} /> View Fullscreen
                                    </span>
                                 </div>
                              </div>
                              
                              <div className="hidden"></div>
                           </div>
                        ) : (
                           <div className="bg-white p-8 rounded-2xl border border-gray-100 text-center">
                              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                                 <Camera size={32} />
                              </div>
                              <p className="text-gray-500 font-medium">No photos uploaded yet</p>
                              <p className="text-sm text-gray-400 mt-1">Photos will appear here once the job starts.</p>
                           </div>
                        )}
                        
                        {/* Rating Banner */}
                        <div className="bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] rounded-2xl p-6 text-white text-center mt-6">
                           <p className="font-medium mb-3">Love our service? Rate us!</p>
                           <a
                              href="https://share.google/COJKas8ABk3zOKCuC"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block bg-white text-[#2E3D99] px-6 py-2 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors shadow-lg shadow-blue-900/20"
                           >
                              Review on Google
                           </a>
                        </div>
                     </div>

                  </div>
               </div>
            </div>
            
            {/* Image Modal */}
            {viewingImage && selectedJob.imageUrl && (
              <div 
                className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
                onClick={() => setViewingImage(false)}
              >
                 <button className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors">
                    <ChevronRight size={32} className="rotate-45" /> {/* Close Icon */}
                 </button>
                 <img 
                   src={selectedJob.imageUrl[0]} 
                   alt="Fullscreen" 
                   className="max-w-full max-h-[90vh] rounded-lg shadow-2xl"
                 />
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-12 animate-in fade-in duration-500">
             
             {/* Active Orders Section */}
             <div>
                <div className="flex items-center gap-3 mb-6">
                   <div className="w-1 h-6 bg-[#FB4A50] rounded-full"></div>
                   <h2 className="text-xl font-bold text-gray-900">Active Orders</h2>
                </div>

                {orders.filter(j => ["ordered", "booked"].includes(j.status)).length === 0 ? (
                   <div className="bg-white/50 border border-dashed border-gray-300 rounded-3xl p-12 text-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                         <Package size={32} />
                      </div>
                      <p className="text-gray-500 font-medium text-lg">No active orders right now.</p>
                   </div>
                ) : (
                   <div className="grid grid-cols-1 gap-4">
                      {orders.filter(j => ["ordered", "booked"].includes(j.status)).map((job) => (
                         <div 
                           key={job.id}
                           onClick={() => setSelectedJob(job)}
                           className="group bg-white/80 backdrop-blur-md border border-white/60 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                         >
                            <div className="flex flex-col md:flex-row gap-6 justify-between items-center">
                               {/* Icon & Title */}
                               <div className="flex items-center gap-4 w-full md:w-auto">
                                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2E3D99] to-[#1D97D7] flex items-center justify-center text-white shadow-lg shadow-blue-900/10 group-hover:scale-110 transition-transform">
                                      {job.status === "ordered" ? <Package size={20} /> : <Calendar size={20} />}
                                  </div>
                                  <div>
                                     <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#2E3D99] transition-colors">{job.orderId}</h3>
                                     <p className="text-sm text-gray-500 truncate max-w-[200px]">{job.order_details}</p>
                                  </div>
                               </div>

                                {/* Progress Bar (Mini) */}
                               <div className="w-full md:max-w-md">
                                  <div className="flex justify-between text-xs text-gray-400 mb-2 font-medium px-1">
                                     <span className={["ordered", "booked", "completed"].includes(job.status) ? "text-[#2E3D99]" : ""}>Ordered</span>
                                     <span className={["booked", "completed"].includes(job.status) ? "text-[#2E3D99]" : ""}>Booked</span>
                                     <span className={job.status === "completed" ? "text-[#2E3D99]" : ""}>Completed</span>
                                  </div>
                                  <div className="flex items-center gap-2 w-full">
                                    {["ordered", "booked", "completed"].map((stage, i) => {
                                       const status = getStageStatus(job, stage);
                                       const isActive = status === "complete" || status === "current";
                                       return (
                                          <div key={i} className={`h-2 rounded-full flex-1 transition-colors ${isActive ? "bg-[#2E3D99]" : "bg-gray-200"}`} />
                                       );
                                    })}
                                  </div>
                               </div>

                               {/* Status Pill */}
                               <div className="w-full md:w-auto flex justify-end">
                                  <StatusBadge status={job.status} />
                               </div>
                            </div>
                         </div>
                      ))}
                   </div>
                )}
             </div>

             {/* Order History Section */}
             <div>
                <div className="flex items-center gap-3 mb-6">
                   <div className="w-1 h-6 bg-gray-300 rounded-full"></div>
                   <h2 className="text-xl font-bold text-gray-900">Order History</h2>
                </div>

                {orders.filter(j => j.status === "completed").length === 0 ? (
                   <div className="bg-white/50 border border-dashed border-gray-300 rounded-3xl p-12 text-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                         <CheckCircle2 size={32} />
                      </div>
                      <p className="text-gray-500 font-medium text-lg">No completed orders yet.</p>
                   </div>
                ) : (
                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {orders.filter(j => j.status === "completed").map((job) => (
                         <div 
                           key={job.id}
                           onClick={() => setSelectedJob(job)}
                           className="bg-white/60 backdrop-blur-sm border border-white/60 rounded-2xl p-6 hover:bg-white hover:shadow-lg transition-all duration-300 cursor-pointer group flex justify-between gap-4"
                         >
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-4">
                                   <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-green-600 group-hover:bg-green-100 transition-colors shadow-sm">
                                      <CheckCircle2 size={20} />
                                   </div>
                                   <span className="text-xs font-medium text-gray-500 bg-white/50 px-2 py-1 rounded-md backdrop-blur-sm border border-white/50">{job.deliveryDate ? formatDate(job.deliveryDate) : "Completed"}</span>
                                </div>
                                <h3 className="font-bold text-gray-900 mb-1 truncate">{job.orderId}</h3>
                                <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
                                   <MapPin size={12} className="flex-shrink-0" />
                                   <span className="truncate w-full">{job.deliveryAddress || "No address provided"}</span>
                                </div>
                                <p className="text-sm text-gray-500 line-clamp-2">{job.order_details}</p>
                                <div className="mt-4 pt-4 border-t border-gray-100/50 flex items-center text-xs font-medium text-[#2E3D99] opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all transform translate-y-0 lg:translate-y-2 lg:group-hover:translate-y-0 duration-300">
                                   View Details <ChevronRight size={14} className="ml-1" />
                                </div>
                            </div>

                            {/* Thumbnail Preview */}
                            {job.imageUrl && job.imageUrl[0] && (
                              <div className="flex flex-col items-center gap-2 flex-shrink-0">
                                <div className="w-20 h-20 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                  <img 
                                    src={job.imageUrl[0]} 
                                    alt="Preview" 
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              </div>
                            )}
                         </div>
                      ))}
                   </div>
                )}
             </div>

          </div>
        )}

        {/* Footer */}
        <footer className="text-sm text-slate-500 font-medium mt-8 py-2 flex justify-center items-center gap-2 mx-auto w-fit">
          <p>Powered By </p>{" "}
          <img 
            className="h-5 w-auto" 
            src="https://storage.googleapis.com/opsnav_web_image/opsnav%20logo%20(3).png" 
            alt="OpsNav Logo" 
          />
        </footer>
      </div>

       <style>{`
         @keyframes wave {
            0% { transform: rotate(0deg); }
            10% { transform: rotate(14deg); }
            20% { transform: rotate(-8deg); }
            30% { transform: rotate(14deg); }
            40% { transform: rotate(-4deg); }
            50% { transform: rotate(10deg); }
            60% { transform: rotate(0deg); }
            100% { transform: rotate(0deg); }
         }
         .animate-wave {
            animation: wave 2.5s infinite;
            transform-origin: 70% 70%; 
         } 
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-20px) translateX(10px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

