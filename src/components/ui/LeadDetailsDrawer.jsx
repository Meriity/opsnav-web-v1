import React from "react";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { 
  X, 
  Mail, 
  Phone, 
  Briefcase, 
  Building2, 
  Calendar, 
  Tag, 
  MapPin, 
  Info,
  Clock,
  User,
  ExternalLink,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import moment from "moment";

const LeadDetailsDrawer = ({ lead, isOpen, onClose, MODULE_ICONS, onTaskClick }) => {
  if (!lead) return null;

  const formatDate = (date) => {
    if (!date) return "N/A";
    return moment(date).format("DD MMM YYYY, hh:mm A");
  };

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "converted":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "qualified":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "new":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "lost":
        return "bg-rose-100 text-rose-700 border-rose-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-[9999]">
      <DialogBackdrop 
        transition 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200" 
      />
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
            <DialogPanel 
              transition 
              className="pointer-events-auto w-screen sm:max-w-md lg:max-w-lg transform transition duration-500 ease-in-out data-[closed]:translate-x-full sm:duration-700"
            >
              <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-2xl">
                {/* Header */}
                <div className="px-6 py-6 bg-gradient-to-br from-[#2E3D99]/5 to-[#1D97D7]/5 border-b border-slate-100">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2E3D99] to-[#1D97D7] flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-[#2E3D99]/20">
                        {lead.fullName?.charAt(0) || <User />}
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-slate-900">{lead.fullName || "Unnamed Lead"}</h2>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getStatusStyle(lead.status)}`}>
                            {lead.status || "New"}
                          </span>
                          {lead.isConverted && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                              <CheckCircle2 size={12} />
                              Converted
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={onClose} 
                      className="rounded-xl p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Body */}
                <div className="px-6 py-6 space-y-8 flex-1">
                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Source</p>
                      <p className="text-sm font-semibold text-slate-700">{lead.source || "Manual"}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Assigned To</p>
                      <p className="text-sm font-semibold text-slate-700">{lead.assignedToName || "Unassigned"}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Created At</p>
                      <p className="text-sm font-semibold text-slate-700">{moment(lead.createdAt).format("DD MMM YYYY")}</p>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-[#2E3D99] uppercase tracking-wider flex items-center gap-2">
                      <Info size={14} />
                      Contact Details
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 group transition-all hover:bg-white hover:shadow-md hover:border-[#1D97D7]/30">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#1D97D7] shadow-sm border border-slate-100 group-hover:bg-[#1D97D7] group-hover:text-white transition-colors">
                          <Mail size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">Email Address</p>
                          <a href={`mailto:${lead.email}`} className="text-sm font-semibold text-slate-700 truncate block hover:text-[#1D97D7] transition-colors">
                            {lead.email || "N/A"}
                          </a>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 group transition-all hover:bg-white hover:shadow-md hover:border-[#1D97D7]/30">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#1D97D7] shadow-sm border border-slate-100 group-hover:bg-[#1D97D7] group-hover:text-white transition-colors">
                          <Phone size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">Phone Number</p>
                          <a href={`tel:${lead.phone}`} className="text-sm font-semibold text-slate-700 truncate block hover:text-[#1D97D7] transition-colors">
                            {lead.phone || "N/A"}
                          </a>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 group transition-all hover:bg-white hover:shadow-md hover:border-[#1D97D7]/30">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#1D97D7] shadow-sm border border-slate-100 group-hover:bg-[#1D97D7] group-hover:text-white transition-colors">
                          <Building2 size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">Company</p>
                          <p className="text-sm font-semibold text-slate-700 truncate">
                            {lead.companyName || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Modules Requested */}
                  {lead.modulesRequestedRaw && lead.modulesRequestedRaw.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-xs font-bold text-[#2E3D99] uppercase tracking-wider flex items-center gap-2">
                        <Tag size={14} />
                        Modules Requested
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {lead.modulesRequestedRaw.map((moduleKey, idx) => {
                          const config = MODULE_ICONS[moduleKey.toLowerCase()];
                          if (!config) return null;
                          const Icon = config.icon;
                          return (
                            <div
                              key={idx}
                              className={`flex items-center gap-2 px-3 py-2 rounded-xl ${config.color} text-white shadow-sm transition-transform hover:scale-105`}
                            >
                              <Icon className="w-4 h-4" />
                              <span className="text-xs font-bold whitespace-nowrap">{config.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Additional Details */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-[#2E3D99] uppercase tracking-wider flex items-center gap-2">
                      <Briefcase size={14} />
                      Additional Information
                    </h3>
                    <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">State</p>
                          <p className="text-sm font-semibold text-slate-700">{lead.state || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Address</p>
                          <p className="text-sm font-semibold text-slate-700 break-words">{lead.address || "N/A"}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Title/Inquiry</p>
                        <p className="text-sm font-semibold text-slate-700">{lead.title || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Comments</p>
                        <p className="text-sm text-slate-600 leading-relaxed italic">
                          {lead.comments ? `"${lead.comments}"` : "No comments provided."}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* History */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-[#2E3D99] uppercase tracking-wider flex items-center gap-2">
                      <Clock size={14} />
                      Audit Trail
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="mt-1 w-2 h-2 rounded-full bg-[#1D97D7]"></div>
                        <div>
                          <p className="text-xs font-bold text-slate-700">Created</p>
                          <p className="text-[10px] text-slate-400">{formatDate(lead.createdAt)}</p>
                        </div>
                      </div>
                      {lead.updatedAt && lead.updatedAt !== lead.createdAt && (
                        <div className="flex items-start gap-3">
                          <div className="mt-1 w-2 h-2 rounded-full bg-slate-300"></div>
                          <div>
                            <p className="text-xs font-bold text-slate-700">Last Updated</p>
                            <p className="text-[10px] text-slate-400">{formatDate(lead.updatedAt)}</p>
                          </div>
                        </div>
                      )}
                      {lead.isConverted && (
                        <div className="flex items-start gap-3">
                          <div className="mt-1 w-2 h-2 rounded-full bg-emerald-500"></div>
                          <div>
                            <p className="text-xs font-bold text-slate-700">Converted to Matter</p>
                            <p className="text-[10px] text-slate-400">{formatDate(lead.convertedAt)}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t border-slate-100 px-6 py-4 bg-slate-50 flex flex-col gap-3">
                  <div className="flex gap-3 w-full">
                    <button 
                      onClick={() => { onClose(); onTaskClick?.(lead); }}
                      className="flex-1 bg-amber-50 border border-amber-200 text-amber-700 font-semibold py-2.5 rounded-xl hover:bg-amber-100 transition-colors shadow-sm text-sm flex items-center justify-center gap-1.5"
                    >
                      <Clock size={14} />
                      New Task
                    </button>
                  </div>
                  <button 
                    onClick={onClose}
                    className="w-full bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white font-bold py-3 rounded-2xl hover:opacity-90 transition-all shadow-lg shadow-[#2E3D99]/20 text-sm"
                  >
                    Close Details
                  </button>
                </div>
              </div>
            </DialogPanel>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default LeadDetailsDrawer;
