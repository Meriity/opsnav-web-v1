import React, { useState, useEffect } from "react";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { X, Clock, User, CheckCircle2, FileText, Calendar, Building2 } from "lucide-react";
import moment from "moment";
import crmAPI from "../../api/crmAPI";
import AdminAPI from "../../api/adminAPI";
import { toast } from "react-toastify";

export default function TaskDetailsDrawer({ task, isOpen, onClose }) {
  const [relatedLeadName, setRelatedLeadName] = useState("");
  const [assignedUserName, setAssignedUserName] = useState("Unassigned");
  const [users, setUsers] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (isOpen && task?.relatedLeadId) {
      const fetchLeadDetails = async () => {
        try {
          const res = await crmAPI.getAllLeads();
          const leads = Array.isArray(res) ? res : (res.data || res.leads || []);
          const lead = leads.find(l => (l._id || l.id) === task.relatedLeadId);
          if (lead) {
            const name = lead.fullName || `${lead.firstName || ''} ${lead.lastName || ''}`.trim();
            const company = lead.companyName || lead.company || "No Company";
            setRelatedLeadName(`${name} (${company})`);
          } else {
            setRelatedLeadName("Unknown Lead");
          }
        } catch (e) {
          console.error("Failed to fetch related lead details", e);
          setRelatedLeadName("Error loading lead details");
        }
      };
      fetchLeadDetails();
    } else {
      setRelatedLeadName("");
    }

    if (isOpen) {
      const fetchAssignee = async () => {
        try {
          const api = new AdminAPI();
          const res = await api.getAllUsers();
          const usersList = Array.isArray(res) ? res : (res.data || res.users || []);
          setUsers(usersList);
          
          if (task?.assignedTo) {
            const user = usersList.find(u => (u.id || u._id) === task.assignedTo);
            if (user) {
              const name = user.displayName || user.fullName || user.username || (user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : null);
              setAssignedUserName(name || user.email || "Unknown User");
            } else {
              setAssignedUserName("Unknown User");
            }
          } else {
            setAssignedUserName("Unassigned");
          }
        } catch (e) {
          console.error("Failed to fetch assignee", e);
          setAssignedUserName("Error loading assignee");
        }
      };
      fetchAssignee();
    }
  }, [isOpen, task]);

  const handleAssigneeChange = async (e) => {
    const newAssigneeId = e.target.value;
    if (!task) return;
    
    setIsUpdating(true);
    try {
      await crmAPI.editTask(task._id || task.id, { assignedTo: newAssigneeId });
      toast.success("Assignee updated successfully!");
      // Re-resolve the user name
      const user = users.find(u => (u.id || u._id) === newAssigneeId);
      if (user) {
        const name = user.displayName || user.fullName || user.username || (user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : null);
        setAssignedUserName(name || user.email || "Unknown User");
      } else {
        setAssignedUserName("Unassigned");
      }
    } catch (error) {
      console.error("Failed to update assignee", error);
      toast.error(error.message || "Failed to update assignee.");
    } finally {
      setIsUpdating(false);
    }
  };


  if (!task) return null;

  const formatDate = (date) => {
    if (!date) return "N/A";
    return moment(date).format("DD MMM YYYY, hh:mm A");
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "done":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "overdue":
        return "bg-rose-100 text-rose-700 border-rose-200";
      default:
        return "bg-amber-100 text-amber-700 border-amber-200";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high": return "bg-rose-50 text-rose-600 border-rose-100";
      case "medium": return "bg-amber-50 text-amber-600 border-amber-100";
      case "low": return "bg-blue-50 text-blue-600 border-blue-100";
      default: return "bg-slate-50 text-slate-600 border-slate-100";
    }
  };

  const isCompleted = task.status === "Completed" || task.status === "Done";

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
              className="pointer-events-auto w-screen sm:max-w-[30vw] transform transition duration-500 ease-in-out data-[closed]:translate-x-full sm:duration-700"
            >
              <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-2xl">
                {/* Header */}
                <div className="px-6 py-6 bg-gradient-to-br from-white to-slate-50 border-b border-slate-100">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 leading-tight pr-4">{task.title}</h2>
                      <div className="mt-3 flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(task.status)}`}>
                          {isCompleted ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                          {task.status || "Pending"}
                        </span>
                        {task.priority && (
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getPriorityColor(task.priority)}`}>
                            {task.priority} Priority
                          </span>
                        )}
                      </div>
                    </div>
                    <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Body */}
                <div className="flex-1 p-6 space-y-6">
                  {/* Key Info Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Clock size={12} /> Due Date
                      </p>
                      <p className={`text-sm font-semibold ${task.status === 'Overdue' ? 'text-rose-600' : 'text-slate-700'}`}>
                        {formatDate(task.dueDate)}
                      </p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Clock size={12} /> Reminder
                      </p>
                      <p className="text-sm font-semibold text-slate-700">
                        {formatDate(task.reminderDate)}
                      </p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <User size={12} /> Assignee
                      </p>
                      <select
                        value={task.assignedTo || ""}
                        onChange={handleAssigneeChange}
                        disabled={isUpdating}
                        className="text-sm font-semibold text-slate-700 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-[#2E3D99] focus:outline-none w-full pb-0.5 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <option value="">Unassigned</option>
                        {users.map(u => {
                          const name = u.displayName || u.fullName || u.username || (u.firstName ? `${u.firstName} ${u.lastName || ''}`.trim() : null) || u.email;
                          return (
                            <option key={u.id || u._id} value={u.id || u._id}>{name}</option>
                          );
                        })}
                      </select>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Calendar size={12} /> Created On
                      </p>
                      <p className="text-sm font-semibold text-slate-700">
                        {formatDate(task.createdAt)}
                      </p>
                    </div>
                    
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Calendar size={12} /> Last Updated
                      </p>
                      <p className="text-sm font-semibold text-slate-700">
                        {formatDate(task.updatedAt)}
                      </p>
                    </div>
                    
                    {task.relatedLeadId && (
                      <div className="col-span-2 p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                            <Building2 size={12} /> Related Lead
                          </p>
                          <p className="text-sm font-semibold text-slate-700 mt-0.5">
                            {relatedLeadName || (
                                <span className="flex items-center gap-2 text-slate-400">
                                  <span className="w-3 h-3 border-2 border-[#2E3D99] border-t-transparent rounded-full animate-spin"></span>
                                  Loading lead details...
                                </span>
                            )}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText size={14} /> Description
                    </h3>
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                      <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                        {task.description || "No additional details provided."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </DialogPanel>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
