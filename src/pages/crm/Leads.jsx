import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  Building2,
  User,
  Phone,
  Mail,
  X,
  MoreHorizontal,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  UserPlus,
  UserX,
  Briefcase,
  Trash2,
  Edit,
  DollarSign,
  TrendingUp,
  Users,
  ArrowRightLeft,
  UserCheck,
  Loader2,
  CheckCircle2,
  Eye,
  Clock,
  Tag,
  StickyNote,
  Send,
  Trophy,
  FileText,
  ArrowUpDown,
  SlidersHorizontal,
  ListFilter,
  CalendarDays,
  SquarePlus,
  Globe,
  MessageCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';
import Header from "../../components/layout/Header";
import Table from "../../components/ui/Table";
import Pagination from "../../components/ui/Pagination";
import { useSearchStore } from "../SearchStore/searchStore.js";
import { toast } from "react-toastify";
import crmAPI from "../../api/crmAPI";
import AdminApi from "../../api/adminAPI";
import ConfirmationModal from "../../components/ui/ConfirmationModal";
import moment from "moment";


// --- STAT CARD COMPONENT ---
const StatCard = ({ icon: Icon, title, value, iconBg, iconColor, loading = false }) => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
      <Icon className={`w-6 h-6 ${iconColor}`} />
    </div>
    <div>
      <p className="text-xs font-medium text-slate-500">{title}</p>
      {loading
        ? <div className="h-7 w-12 bg-slate-100 animate-pulse rounded mt-1" />
        : <p className="text-2xl font-bold text-slate-900 mt-0.5">{value}</p>
      }
    </div>
  </div>
);

// --- STAGE CONFIG ---
const STAGE_DISPLAY = {
  "New Lead":     { label: "New Lead",     badge: "bg-blue-50 text-blue-700 border border-blue-200" },
  "Qualified":    { label: "Qualified",    badge: "bg-teal-50 text-teal-700 border border-teal-200" },
  "Opportunity":  { label: "Opportunity",  badge: "bg-violet-50 text-violet-700 border border-violet-200" },
  "Proposal":     { label: "Proposal",     badge: "bg-indigo-50 text-indigo-700 border border-indigo-200" },
  "Negotiation":  { label: "Negotiation",  badge: "bg-amber-50 text-amber-700 border border-amber-200" },
  "Won":          { label: "Won",          badge: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
  "Lost":         { label: "Lost",         badge: "bg-rose-50 text-rose-700 border border-rose-200" },
};

const STAGE_NORMALIZE = {
  "new": "New Lead", "open": "New Lead", "new lead": "New Lead",
  "contacted": "Qualified", "qualified": "Qualified", "qualified lead": "Qualified",
  "opportunity": "Opportunity",
  "proposal": "Proposal",
  "negotiation": "Negotiation",
  "won": "Won", "converted": "Won",
  "lost": "Lost", "closed": "Lost", "unqualified": "Lost", "unqualified lead": "Lost",
};

const getDisplayStage = (status = "") =>
  STAGE_NORMALIZE[status.toLowerCase()] ?? "New Lead";

const PROPOSAL_STATUS_STYLES = {
  "Sent":                "bg-emerald-50 text-emerald-700 border border-emerald-200",
  "Follow-up Required":  "bg-amber-50 text-amber-700 border border-amber-200",
  "Accepted":            "bg-blue-50 text-blue-700 border border-blue-200",
  "Draft":               "bg-slate-100 text-slate-600 border border-slate-200",
  "Rejected":            "bg-rose-50 text-rose-700 border border-rose-200",
};

const PRIORITY_STYLES = {
  "High":   "bg-rose-50 text-rose-700 border border-rose-200",
  "Medium": "bg-amber-50 text-amber-700 border border-amber-200",
  "Low":    "bg-emerald-50 text-emerald-700 border border-emerald-200",
};

// --- LEAD DRAWER COMPONENT ---
function LeadDrawer({ lead, onClose, onEditClick, onConvertClick, onAssignClick, onTaskClick, onEditTaskClick }) {
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [notes, setNotes] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState("");
  const [newNoteVisibility, setNewNoteVisibility] = useState("Team");
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingNoteContent, setEditingNoteContent] = useState("");

  useEffect(() => {
    if (lead) {
      const loadTasks = async () => {
        setLoadingTasks(true);
        try {
          const response = await crmAPI.getTasksForLead(lead.id || lead._id);
          const tasksData = Array.isArray(response) ? response : (response.data || response.tasks || []);
          setTasks(tasksData);
        } catch (error) {
          console.error("Failed to load tasks", error);
        } finally {
          setLoadingTasks(false);
        }
      };

      const loadNotes = async () => {
        setLoadingNotes(true);
        try {
          const response = await crmAPI.getNotes(lead.id || lead._id);
          const notesData = response.data || [];
          setNotes(notesData);
        } catch (error) {
          console.error("Failed to load notes", error);
        } finally {
          setLoadingNotes(false);
        }
      };

      loadTasks();
      loadNotes();
    } else {
      setTasks([]);
      setNotes([]);
      setNewNoteContent("");
    }
  }, [lead]);

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNoteContent.trim()) return;
    setIsSubmittingNote(true);
    try {
      const noteData = {
        relatedLeadId: lead.id || lead._id,
        note: newNoteContent,
        visibility: newNoteVisibility,
      };
      const response = await crmAPI.createNote(noteData);
      setNotes([response.data, ...notes]);
      setNewNoteContent("");
      setNewNoteVisibility("Team");
      toast.success("Note added successfully");
    } catch (error) {
      console.error("Failed to add note", error);
      toast.error("Failed to add note");
    } finally {
      setIsSubmittingNote(false);
    }
  };

  const handleUpdateNoteVisibility = async (noteId, newVisibility) => {
    try {
      const response = await crmAPI.updateNote(noteId, { visibility: newVisibility });
      setNotes(prevNotes => prevNotes.map(n => n._id === noteId ? { ...n, visibility: newVisibility } : n));
      toast.success("Note visibility updated");
    } catch (error) {
      console.error("Failed to update note visibility", error);
      toast.error(error.message || "Failed to update note visibility");
    }
  };

  const confirmDeleteNote = async () => {
    if (!noteToDelete) return;
    try {
      await crmAPI.deleteNote(noteToDelete);
      setNotes(prevNotes => prevNotes.filter(n => n._id !== noteToDelete));
      toast.success("Note deleted successfully");
    } catch (error) {
      console.error("Failed to delete note", error);
      toast.error(error.message || "Failed to delete note");
    } finally {
      setNoteToDelete(null);
    }
  };

  const handleUpdateNoteContent = async () => {
    if (!editingNoteContent.trim() || !editingNoteId) return;
    try {
      const response = await crmAPI.updateNote(editingNoteId, { note: editingNoteContent });
      setNotes(prevNotes => prevNotes.map(n => n._id === editingNoteId ? { ...n, note: editingNoteContent } : n));
      toast.success("Note updated successfully");
      setEditingNoteId(null);
      setEditingNoteContent("");
    } catch (error) {
      console.error("Failed to update note", error);
      toast.error(error.message || "Failed to update note");
    }
  };

  const handleToggleTask = async (taskId) => {
    const task = tasks.find(t => (t._id || t.id) === taskId);
    if (!task) return;
    
    const isCompleted = task.status === "Completed" || task.status === "Done";
    const newStatus = isCompleted ? "Pending" : "Completed";

    // Optimistic update
    setTasks(prev => prev.map(t => ((t._id || t.id) === taskId ? { ...t, status: newStatus } : t)));

    try {
      await crmAPI.editTask(taskId, { status: newStatus });
    } catch (error) {
      console.error("Failed to toggle task status", error);
      // Revert on failure
      setTasks(prev => prev.map(t => ((t._id || t.id) === taskId ? { ...t, status: task.status } : t)));
    }
  };

  if (!lead) return null;
  const initials = `${lead.firstName[0] || ''}${lead.lastName[0] || ''}`.toUpperCase();

  return (
    <Dialog open={!!lead} onClose={onClose} className="relative z-[9999]">
      <DialogBackdrop transition className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200" />
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
            <DialogPanel transition className="pointer-events-auto w-screen sm:max-w-[35vw] transform transition duration-500 ease-in-out data-[closed]:translate-x-full sm:duration-700">
              <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-2xl">
                {/* Header */}
                <div className="px-6 py-6 bg-gradient-to-br from-white to-slate-50 border-b border-slate-100">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#2E3D99] to-[#1D97D7] flex items-center justify-center text-white font-bold text-xl shadow-md shadow-[#2E3D99]/20">
                        {initials}
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-slate-900">{lead.firstName} {lead.lastName}</h2>
                        <p className="text-xs font-semibold text-[#2E3D99] flex items-center gap-1.5 mt-0.5">
                          <Building2 size={12} />
                          {lead.company}
                        </p>
                      </div>
                    </div>
                    <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Body */}
                <div className="px-6 py-6 space-y-6 flex-1 bg-white">
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Lead Info</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <Mail className="text-[#1D97D7]" size={16} />
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Email</p>
                          <a href={`mailto:${lead.email}`} className="text-sm font-semibold text-slate-700 hover:underline">{lead.email}</a>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <Phone className="text-[#1D97D7]" size={16} />
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Phone</p>
                          <a href={`tel:${lead.phone}`} className="text-sm font-semibold text-slate-700 hover:underline">{lead.phone}</a>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <Briefcase className="text-[#1D97D7]" size={16} />
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Job Title</p>
                          <p className="text-sm font-semibold text-slate-700">{lead.role}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tracking & Assignment</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
                        <UserCheck className="text-violet-500" size={16} />
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Assigned To</p>
                          <p className="text-sm font-semibold text-slate-700">{lead.assignedToName || 'Unassigned'}</p>
                        </div>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
                        <Tag className="text-amber-500" size={16} />
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Source</p>
                          <p className="text-sm font-semibold text-slate-700">{lead.source || 'Manual'}</p>
                        </div>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3 col-span-full">
                        <Clock className="text-slate-500" size={16} />
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Created On</p>
                          <p className="text-sm font-semibold text-slate-700">
                            {lead.createdAt ? moment(lead.createdAt).format("DD MMM YYYY, hh:mm A") : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Lead Description</h3>
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                      <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                        {lead.notes || 'No description provided.'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      <StickyNote size={14} />
                      Team Notes
                    </h3>
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-4">
                      {/* Notes List */}
                      {loadingNotes ? (
                        <div className="flex justify-center p-2">
                          <Loader2 className="w-5 h-5 text-[#2E3D99] animate-spin" />
                        </div>
                      ) : notes.length > 0 ? (
                        <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                          {notes.map((note) => (
                            <div key={note._id} className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                              {editingNoteId === note._id ? (
                                <div className="space-y-2">
                                  <textarea
                                    value={editingNoteContent}
                                    onChange={(e) => setEditingNoteContent(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2E3D99]/50 resize-none bg-white"
                                    rows="3"
                                  />
                                  <div className="flex justify-end gap-2">
                                    <button
                                      onClick={() => setEditingNoteId(null)}
                                      className="px-2 py-1 text-xs font-semibold text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      onClick={handleUpdateNoteContent}
                                      className="px-2 py-1 text-xs font-semibold text-white bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] rounded-md transition-opacity hover:opacity-90"
                                    >
                                      Save
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-sm text-slate-700 whitespace-pre-wrap">{note.note}</p>
                              )}
                              
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-[10px] text-slate-400 font-semibold">
                                  {note.createdBy?.displayName || 'User'} • {moment(note.createdAt).format("MMM DD, hh:mm A")}
                                </span>
                                <div className="flex items-center gap-1.5">
                                  <select 
                                    value={note.visibility}
                                    onChange={(e) => handleUpdateNoteVisibility(note._id, e.target.value)}
                                    className={`text-xs px-2 py-1 rounded-md font-bold cursor-pointer appearance-none border-none focus:outline-none focus:ring-2 focus:ring-offset-1 transition-colors ${note.visibility === 'Private' ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 focus:ring-amber-400' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 focus:ring-emerald-400'}`}
                                  >
                                    <option value="Team">Team</option>
                                    <option value="Private">Private</option>
                                  </select>
                                  {editingNoteId !== note._id && (
                                    <button
                                      onClick={() => {
                                        setEditingNoteId(note._id);
                                        setEditingNoteContent(note.note);
                                      }}
                                      className="p-1.5 text-slate-400 hover:text-[#1D97D7] hover:bg-[#1D97D7]/10 rounded-lg transition-colors"
                                      title="Edit Note"
                                    >
                                      <Edit size={14} />
                                    </button>
                                  )}
                                  <button
                                    onClick={() => setNoteToDelete(note._id)}
                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                    title="Delete Note"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 text-center py-2">No notes added yet.</p>
                      )}

                      {/* Add Note Form */}
                      <form onSubmit={handleAddNote} className="relative">
                        <textarea
                          rows="2"
                          value={newNoteContent}
                          onChange={(e) => setNewNoteContent(e.target.value)}
                          placeholder="Write a note..."
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2E3D99]/50 resize-none bg-white mb-2"
                        />
                        <div className="flex items-center justify-between">
                          <select
                            value={newNoteVisibility}
                            onChange={(e) => setNewNoteVisibility(e.target.value)}
                            className="text-[11px] font-semibold text-slate-500 bg-white border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#2E3D99]/30"
                          >
                            <option value="Team">Team (Visible to all)</option>
                            <option value="Private">Private (Only me)</option>
                          </select>
                          <button
                            type="submit"
                            disabled={!newNoteContent.trim() || isSubmittingNote}
                            className="px-3 py-1.5 bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white text-xs font-bold rounded-lg transition-opacity hover:opacity-90 disabled:opacity-50 flex items-center gap-1.5"
                          >
                            {isSubmittingNote ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                            Save
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      <Clock size={14} />
                      Pending Tasks
                    </h3>
                    {loadingTasks ? (
                      <div className="flex justify-center p-4">
                        <Loader2 className="w-5 h-5 text-[#2E3D99] animate-spin" />
                      </div>
                    ) : tasks.length > 0 ? (
                      <div className="space-y-3">
                        {tasks.map((task) => {
                          const isCompleted = task.status === "Completed" || task.status === "Done";
                          return (
                          <div key={task._id || task.id} className={`p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-start justify-between gap-3 transition-colors ${isCompleted ? 'opacity-60' : 'hover:border-[#1D97D7]/30'}`}>
                            <div className="pt-0.5">
                              <input
                                type="checkbox"
                                checked={isCompleted}
                                onChange={() => handleToggleTask(task._id || task.id)}
                                className="h-4 w-4 rounded border-slate-300 text-[#2E3D99] focus:ring-[#2E3D99] cursor-pointer"
                              />
                            </div>
                            <div className="flex-1">
                              <p className={`text-sm font-bold leading-tight ${isCompleted ? 'line-through text-slate-400' : 'text-slate-800'}`}>{task.title}</p>
                              <p className="text-xs text-slate-500 mt-1 line-clamp-2">{task.description || "No description."}</p>
                              <div className="flex items-center gap-3 mt-3 text-[10px] font-semibold text-slate-400">
                                {task.dueDate && (
                                  <span className="flex items-center gap-1 text-rose-500">
                                    <Clock size={12} />
                                    Due: {moment(task.dueDate).format("MMM DD, hh:mm A")}
                                  </span>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => { onClose(); onEditTaskClick?.(lead, task); }}
                              className="p-1.5 text-slate-400 hover:text-[#1D97D7] hover:bg-[#1D97D7]/10 rounded-lg transition-colors"
                              title="Edit Task"
                            >
                              <Edit size={14} />
                            </button>
                          </div>
                        )})}
                      </div>
                    ) : (
                      <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-center">
                        <p className="text-xs text-slate-400">No tasks created yet.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t border-slate-200 px-6 py-4 bg-slate-50 space-y-3">
                  <div className="flex gap-3">
                    <button
                      onClick={() => onEditClick?.(lead, true)}
                      className="flex-1 bg-white border border-slate-200 text-slate-700 font-semibold py-2.5 rounded-xl hover:bg-slate-50 transition-colors shadow-sm text-sm flex items-center justify-center gap-1.5"
                    >
                      <Edit size={14} />
                      Edit
                    </button>
                    <button
                      onClick={onClose}
                      className="flex-1 bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white font-semibold py-2.5 rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-[#2E3D99]/20 text-sm"
                    >
                      Close
                    </button>
                  </div>
                  {!lead.isConverted && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => { onClose(); onConvertClick?.(lead); }}
                        className="flex-1 bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold py-2.5 rounded-xl hover:bg-emerald-100 transition-colors shadow-sm text-sm flex items-center justify-center gap-1.5"
                      > 
                        <ArrowRightLeft size={14} />
                        Convert to Client
                      </button>
                      <button
                        onClick={() => { onClose(); onAssignClick?.(lead); }}
                        className="flex-1 bg-violet-50 border border-violet-200 text-violet-700 font-semibold py-2.5 rounded-xl hover:bg-violet-100 transition-colors shadow-sm text-sm flex items-center justify-center gap-1.5"
                      >
                        <UserCheck size={14} />
                        Assign
                      </button>
                      <button
                        onClick={() => { onClose(); onTaskClick?.(lead); }}
                        className="flex-1 bg-amber-50 border border-amber-200 text-amber-700 font-semibold py-2.5 rounded-xl hover:bg-amber-100 transition-colors shadow-sm text-sm flex items-center justify-center gap-1.5"
                      >
                        <Clock size={14} />
                        Task
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </DialogPanel>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={!!noteToDelete}
        onClose={() => setNoteToDelete(null)}
        onConfirm={confirmDeleteNote}
        title="Delete Note"
        message="Are you sure you want to delete this note? This action cannot be undone."
        confirmLabel="Delete Note"
        cancelLabel="Cancel"
      />
    </Dialog>
  );
}

export const getAvailableStatuses = (current) => {
  switch (current) {
    case "New Lead":
    case "New":
    case undefined:
    case null:
    case "":
      return ["New Lead", "Qualified Lead", "Unqualified Lead"];
    case "Qualified Lead":
      return ["Qualified Lead", "Opportunity", "Unqualified Lead"];
    case "Opportunity":
      return ["Opportunity", "Proposal", "Unqualified Lead"];
    case "Proposal":
      return ["Proposal", "Negotiation", "Unqualified Lead"];
    case "Negotiation":
      return ["Negotiation", "Won", "Lost", "Unqualified Lead"];
    case "Won":
      return ["Won"];
    case "Lost":
      return ["Lost"];
    case "Unqualified Lead":
      return ["Unqualified Lead"];
    default:
      return [
        "New Lead", "Qualified Lead", "Unqualified Lead",
        "Opportunity", "Proposal", "Negotiation", "Won", "Lost"
      ];
  }
};

// --- LEAD FORM MODAL ---
export function LeadFormModal({ isOpen, onClose, onSave, initialData }) {
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', company: '', title: '', email: '', phone: '', description: '', status: 'New Lead',
    serviceTypes: [], enquirySource: '', referrerName: '', referrerEmail: '', referrerPhone: '', priority: 'Medium', proposalStatus: 'Not Required',
    leadTemperature: '', assignedTo: '', unqualifiedReason: '', customReason: '', commercialValue: '', lostReason: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusConfirmState, setStatusConfirmState] = useState(false);
  const [saveAnother, setSaveAnother] = useState(false);
  const [users, setUsers] = useState([]);
  const [enquiryTypes, setEnquiryTypes] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const [companySearch, setCompanySearch] = useState('');
  const [isCreatingCompany, setIsCreatingCompany] = useState(false);
  const companyDropdownRef = React.useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (companyDropdownRef.current && !companyDropdownRef.current.contains(event.target)) {
        setShowCompanyDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setIsSubmitting(false);
      if (initialData) {
        setFormData({ ...initialData, leadTemperature: initialData.leadTemperature || '', assignedTo: initialData.assignedTo || '' });
        setCompanySearch(initialData.company || '');
      } else {
        setFormData({
          firstName: '', lastName: '', company: '', title: '', email: '', phone: '', description: '', status: 'New',
          serviceTypes: [], enquirySource: '', referrerName: '', referrerEmail: '', referrerPhone: '', priority: 'Medium', proposalStatus: 'Not Required',
          leadTemperature: '', assignedTo: '', commercialValue: '', lostReason: ''
        });
        setCompanySearch('');
      }
      const fetchUsersList = async () => {
        try {
          const api = new AdminApi();
          const res = await api.getAllUsers();
          const usersArray = Array.isArray(res) ? res : (res.users || res.data || []);
          setUsers(usersArray);
        } catch (err) {
          console.error("Failed to load users for Lead Modal", err);
        }
      };
      
      const fetchEnquiryTypes = async () => {
        try {
          const types = await crmAPI.getEnquiryTypes();
          setEnquiryTypes(Array.isArray(types) ? types : (types?.data || types?.enquiryTypes || []));
        } catch (err) {
          console.error("Failed to load enquiry types for Lead Modal", err);
        }
      };

      const fetchCompaniesList = async () => {
        try {
          const res = await crmAPI.getAllCompanies();
          let companiesArray = [];
          if (Array.isArray(res)) companiesArray = res;
          else if (res && Array.isArray(res.companies)) companiesArray = res.companies;
          else if (res && Array.isArray(res.data)) companiesArray = res.data;
          else if (res?.data && Array.isArray(res.data.companies)) companiesArray = res.data.companies;
          setCompanies(companiesArray);
        } catch (err) {
          console.error("Failed to load companies for Lead Modal", err);
          setCompanies([]);
        }
      };

      fetchUsersList();
      fetchEnquiryTypes();
      fetchCompaniesList();
    }
  }, [isOpen, initialData]);

  const handleCreateCompanyInline = async () => {
    if (!companySearch.trim() || isCreatingCompany) return;
    
    if (!formData.email || !formData.phone) {
      toast.error("Please fill in both Email and Phone before creating a company.");
      return;
    }

    setIsCreatingCompany(true);
    try {
      const res = await crmAPI.createCompany({
        companyName: companySearch,
        companyType: "Client",
        email: formData.email,
        phone: formData.phone
      });
      const newCompany = res.company || res.data || res;
      setCompanies(prev => [...prev, newCompany]);
      setFormData({ ...formData, company: newCompany.companyName || companySearch });
      setCompanySearch(newCompany.companyName || companySearch);
      setShowCompanyDropdown(false);
      toast.success(`Company "${companySearch}" created successfully!`);
    } catch (err) {
      console.error("Failed to create company inline", err);
      // Fallback: Just set the string locally if API fails
      setFormData({ ...formData, company: companySearch });
      setShowCompanyDropdown(false);
      toast.error(err?.message || "Failed to create company via API, using text only.");
    } finally {
      setIsCreatingCompany(false);
    }
  };

  const handleFinalSave = async () => {
    setIsSubmitting(true);
    setStatusConfirmState(false);
    try {
      await onSave({
        ...(initialData || {}),
        ...formData
      });
      if (saveAnother && !initialData) {
        setFormData({
          firstName: '', lastName: '', company: '', title: '', email: '', phone: '', description: '', status: 'New Lead',
          serviceTypes: [], enquirySource: '', referrerName: '', referrerEmail: '', referrerPhone: '', priority: 'Medium', proposalStatus: 'Not Required',
          leadTemperature: '', assignedTo: '', unqualifiedReason: '', customReason: '', commercialValue: '', lostReason: ''
        });
        setCompanySearch('');
      } else {
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.title || !formData.enquirySource || !formData.leadTemperature) return;
    
    // Check if status changed in edit mode, prompt for confirmation
    if (initialData && initialData.status !== formData.status) {
      setStatusConfirmState(true);
      return;
    }

    handleFinalSave();
  };

  const modalTitle = initialData ? 'Edit Lead' : 'Create Lead';
  const modalSub = initialData ? 'Update lead details' : 'Capture a new lead quickly';
  const currentUser = localStorage.getItem("user") || "OpsNav Admin";

  return (
    <>
      <Dialog open={isOpen} onClose={onClose} className="relative z-[999]">
      <DialogBackdrop transition className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200" />
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
          <DialogPanel transition className="relative transform overflow-hidden rounded-3xl bg-white text-left shadow-2xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 sm:my-8 w-full max-w-4xl">
            
            {/* Header */}
            <div className="bg-white px-6 pt-5 pb-4 border-b border-slate-100 flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center border border-blue-100">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{modalTitle}</h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">{modalSub}</p>
                </div>
              </div>
              <button type="button" onClick={onClose} className="text-slate-400 hover:bg-slate-100 hover:text-slate-600 p-2 rounded-xl transition-colors">
                <X size={20} />
              </button>
            </div>

            <form id="lead-form" onSubmit={handleSubmit} className="px-6 pt-4 pb-6 space-y-4 bg-slate-50/50">
              
              {/* SECTION 1: Contact Information */}
              <div className="border border-slate-100 rounded-2xl p-5 bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="mb-4 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                      <Globe className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex items-center gap-3">
                      <h4 className="text-sm font-bold text-slate-800">1. Contact Information</h4>
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Provided by enquirer</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 ml-11">Information entered by the enquirer (website form, QR code, API, etc.)</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">First Name <span className="text-rose-500">*</span></label>
                    <div className="relative">
                      <input required type="text" value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} className="w-full pl-3 pr-10 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" placeholder="e.g. John" />
                      <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Last Name <span className="text-rose-500">*</span></label>
                    <div className="relative">
                      <input required type="text" value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} className="w-full pl-3 pr-10 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" placeholder="e.g. Smith" />
                      <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Email <span className="text-rose-500">*</span></label>
                    <div className="relative">
                      <input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full pl-3 pr-10 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" placeholder="e.g. john@abc.com" />
                      <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div ref={companyDropdownRef}>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Company</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={companySearch} 
                        onChange={e => {
                          setCompanySearch(e.target.value);
                          setFormData({ ...formData, company: e.target.value });
                          setShowCompanyDropdown(true);
                        }} 
                        onFocus={() => setShowCompanyDropdown(true)}
                        className="w-full pl-3 pr-10 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" 
                        placeholder="Search or enter company..." 
                      />
                      <Building2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      
                      <AnimatePresence>
                        {showCompanyDropdown && (
                          <motion.div 
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-56 overflow-y-auto"
                          >
                            {(Array.isArray(companies) ? companies : []).filter(c => (c.companyName || c.name || '').toLowerCase().includes((companySearch || '').toLowerCase())).map(company => (
                              <div 
                                key={company._id || company.id} 
                                className="px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 cursor-pointer transition-colors border-b border-slate-50 last:border-0"
                                onClick={() => {
                                  const name = company.companyName || company.name || '';
                                  setFormData({ ...formData, company: name });
                                  setCompanySearch(name);
                                  setShowCompanyDropdown(false);
                                }}
                              >
                                {company.companyName || company.name || ''}
                              </div>
                            ))}
                            {companySearch && !(Array.isArray(companies) ? companies : []).some(c => (c.companyName || c.name || '').toLowerCase() === (companySearch || '').toLowerCase()) && (
                              <div 
                                className={`px-4 py-2.5 text-sm font-semibold border-t border-slate-100 flex items-center gap-2 transition-colors sticky bottom-0 bg-white ${isCreatingCompany ? 'text-slate-400 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-50 cursor-pointer'}`}
                                onClick={isCreatingCompany ? undefined : handleCreateCompanyInline}
                              >
                                {isCreatingCompany ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} 
                                {isCreatingCompany ? 'Creating...' : `Create "${companySearch}"`}
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Phone</label>
                    <div className="relative">
                      <input type="tel" maxLength={10} value={formData.phone} onChange={e => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        setFormData({ ...formData, phone: val });
                      }} className="w-full pl-3 pr-10 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" placeholder="e.g. 0412 345 678" />
                      <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: Enquiry Information */}
              <div className="border border-slate-100 rounded-2xl p-5 bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="mb-4 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                      <MessageCircle className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="flex items-center gap-3">
                      <h4 className="text-sm font-bold text-slate-800">2. Enquiry Information</h4>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">Provided by enquirer</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 ml-11">Details about the enquiry entered by the enquirer.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="col-span-1">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Enquiry Type <span className="text-rose-500">*</span></label>
                    <select required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-sm transition-all bg-white">
                      <option value="" disabled>Select enquiry type</option>
                      {enquiryTypes.length > 0 ? (
                        enquiryTypes.map((type, idx) => {
                          const typeName = typeof type === "string" ? type : (type.name || type.enquiryType);
                          const typeKey = typeof type === "string" ? type : (type.id || type._id || idx);
                          return (
                            <option key={typeKey} value={typeName}>{typeName}</option>
                          );
                        })
                      ) : (
                        <>
                          <option value="Conveyancing">Conveyancing</option>
                          <option value="Wills">Wills</option>
                          <option value="Commercial">Commercial</option>
                          <option value="VOCAT">VOCAT</option>
                          <option value="Print Media">Print Media</option>
                          <option value="General Enquiry">General Enquiry</option>
                        </>
                      )}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Enquiry Details</label>
                    <p className="text-[11px] text-slate-500 mb-2 mt-0.5">Tell us more about your enquiry (optional)</p>
                    <div className="relative">
                      <textarea maxLength={1000} rows="4" value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-sm transition-all resize-none bg-white" placeholder="e.g. I would like to prepare a Will for myself and my wife."></textarea>
                      <div className="absolute bottom-2 right-2 text-[10px] font-medium text-slate-400 bg-white px-1">
                        {(formData.description || '').length} / 1000 
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 3: Internal Information */}
              <div className="border border-slate-100 rounded-2xl p-5 bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="mb-4 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                      <Users className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="flex items-center gap-3">
                      <h4 className="text-sm font-bold text-slate-800">3. Internal Information</h4>
                      <span className="text-[10px] font-bold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full">For internal use only</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 ml-11">Information added by your team (only shown when creating lead inside OpsNav).</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Lead Status <span className="text-rose-500">*</span></label>
                    <select 
                      required 
                      value={formData.status || 'New Lead'} 
                      onChange={e => setFormData({ ...formData, status: e.target.value })} 
                      className={`w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-sm transition-all font-medium ${!initialData ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'}`}
                      disabled={!initialData}
                    >
                      {(!initialData ? ["New Lead"] : Array.from(new Set([initialData.status, ...getAvailableStatuses(formData.status)]))).map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Lead Source <span className="text-rose-500">*</span></label>
                    <select required value={formData.enquirySource} onChange={e => setFormData({ ...formData, enquirySource: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-sm transition-all bg-white">
                      <option value="" disabled>Select source</option>
                      <option value="Website">Website</option>
                      <option value="Referral">Referral</option>
                      <option value="Walk-in">Walk-in</option>
                      <option value="Cold Call">Cold Call</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Lead Temperature <span className="text-rose-500">*</span></label>
                    <select required value={formData.leadTemperature} onChange={e => setFormData({ ...formData, leadTemperature: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-sm transition-all bg-white font-medium">
                      <option value="" disabled>Select temp</option>
                      <option value="Hot">🔥 Hot</option>
                      <option value="Warm">☀️ Warm</option>
                      <option value="Cold">❄️ Cold</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Priority</label>
                    <select value={formData.priority} onChange={e => setFormData({ ...formData, priority: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-sm transition-all bg-white">
                      <option value="High">🔴 High</option>
                      <option value="Medium">🟡 Medium</option>
                      <option value="Low">🟢 Low</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Assigned To</label>
                    <select value={formData.assignedTo} onChange={e => setFormData({ ...formData, assignedTo: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-sm transition-all bg-white">
                      <option value="">Select user</option>
                      {users.map(u => (
                        <option key={u.id || u._id} value={u.id || u._id}>{u.displayName || u.display_name || u.email || 'Unknown User'}</option>
                      ))}
                    </select>
                  </div>
                  {initialData && formData.status === "Proposal" && (
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Proposal Status</label>
                        <select value={formData.proposalStatus || 'Not Required'} onChange={e => setFormData({ ...formData, proposalStatus: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-sm transition-all bg-white">
                          <option value="Not Required">Not Required</option>
                          <option value="Pending">Pending</option>
                          <option value="Sent">Sent</option>
                          <option value="Accepted">Accepted</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </div>
                  )}
                  {['Proposal', 'Negotiation', 'Won'].includes(formData.status) && (
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Commercial Value ($)</label>
                        <input 
                          type="number" 
                          min="0"
                          step="0.01"
                          value={formData.commercialValue || ''} 
                          onChange={e => setFormData({ ...formData, commercialValue: e.target.value })} 
                          className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-sm transition-all bg-white" 
                          placeholder="e.g. 5000"
                        />
                      </div>
                  )}
                  {initialData && (
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Next Follow Up</label>
                        <input 
                          type="date" 
                          value={formData.nextFollowUpDate ? formData.nextFollowUpDate.split('T')[0] : ''} 
                          onChange={e => setFormData({ ...formData, nextFollowUpDate: e.target.value })} 
                          className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-sm transition-all bg-white" 
                        />
                      </div>
                  )}
                  {formData.status === 'Unqualified Lead' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Unqualified Reason {(!initialData || !initialData.unqualifiedReason) && <span className="text-rose-500">*</span>}</label>
                      <select required disabled={!!(initialData && initialData.unqualifiedReason)} value={formData.unqualifiedReason || ''} onChange={e => setFormData({ ...formData, unqualifiedReason: e.target.value })} className={`w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-sm transition-all font-medium ${initialData && initialData.unqualifiedReason ? 'bg-slate-50 cursor-not-allowed text-slate-500' : 'bg-white'}`}>
                        <option value="" disabled>Select reason</option>
                        <option value="No Budget">No Budget</option>
                        <option value="Not Interested">Not Interested</option>
                        <option value="Duplicate Enquiry">Duplicate Enquiry</option>
                        <option value="Wrong Contact">Wrong Contact</option>
                        <option value="Outside Service Area">Outside Service Area</option>
                        <option value="Lost to Competitor">Lost to Competitor</option>
                        <option value="No Response">No Response</option>
                        <option value="Others">Others</option>
                      </select>
                    </div>
                  )}
                  {formData.status === 'Unqualified Lead' && formData.unqualifiedReason === 'Others' && (
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Reason Details {(!initialData || !initialData.customReason) && <span className="text-rose-500">*</span>}</label>
                      <input required type="text" readOnly={!!(initialData && initialData.customReason)} value={formData.customReason || ''} onChange={e => setFormData({ ...formData, customReason: e.target.value })} className={`w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-sm transition-all ${initialData && initialData.customReason ? 'bg-slate-50 cursor-not-allowed text-slate-500' : 'bg-white'}`} placeholder="Please specify the reason" />
                    </div>
                  )}
                  {formData.status === 'Lost' && (
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Lost Reason {(!initialData || !initialData.lostReason) && <span className="text-rose-500">*</span>}</label>
                      <input required type="text" readOnly={!!(initialData && initialData.lostReason)} value={formData.lostReason || ''} onChange={e => setFormData({ ...formData, lostReason: e.target.value })} className={`w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-sm transition-all ${initialData && initialData.lostReason ? 'bg-slate-50 cursor-not-allowed text-slate-500' : 'bg-white'}`} placeholder="Please specify why this deal was lost" />
                    </div>
                  )}
                </div>

                <div className="mt-4 p-4 bg-orange-100/80 rounded-lg">
                  <p className="text-xs font-medium text-slate-600 mb-3 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Lead Temperature helps you prioritise follow-ups. You can update this later.
                  </p>
                  <div className="flex flex-wrap gap-x-8 gap-y-2 text-[11px] font-medium ml-1">
                    <div className="flex items-center gap-2 text-slate-500">
                      <div className="w-2 h-2 rounded-full bg-rose-500 shrink-0"></div>
                      <div><span className="font-bold text-slate-700">Hot</span> – Ready to buy / Immediate need</div>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500">
                      <div className="w-2 h-2 rounded-full bg-orange-500 shrink-0"></div>
                      <div><span className="font-bold text-slate-700">Warm</span> – Interested / Needs follow-up</div>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500">
                      <div className="w-2 h-2 rounded-full bg-blue-600 shrink-0"></div>
                      <div><span className="font-bold text-slate-700">Cold</span> – Just exploring / Future need</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 4: Lead Created By */}
              <div className="border border-slate-100 rounded-2xl p-5 bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                      <User className="w-5 h-5 text-slate-600" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-800">4. Lead Created By</h4>
                  </div>
                </div>

                <div>
                  <div className="relative flex items-center gap-3 p-2.5 bg-slate-50 border border-slate-200 rounded-lg opacity-80 cursor-not-allowed w-full md:w-1/3">
                    <div className="w-6 h-6 rounded-full bg-slate-300 flex items-center justify-center overflow-hidden">
                       <User className="w-4 h-4 text-slate-50" />
                    </div>
                    <span className="text-sm font-medium text-slate-700">{currentUser} (You)</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                </div>
              </div>

            </form>

            <div className="bg-white px-6 py-4 border-t border-slate-100 flex items-center justify-between">
              {initialData ? (
                <div /> // Empty spacer for flex layout
              ) : (
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input type="checkbox" checked={saveAnother} onChange={(e) => setSaveAnother(e.target.checked)} className="peer appearance-none w-4 h-4 border-2 border-slate-300 rounded cursor-pointer checked:bg-blue-600 checked:border-blue-600 transition-colors" />
                    <svg className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <span className="text-sm font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">Save and create another</span>
                </label>
              )}

              <div className="flex items-center gap-3">
                <button type="button" onClick={onClose} className="px-5 py-2.5 text-[#2E3D99] border border-[#2E3D99] rounded-xl hover:text-white hover:border-[#FB4A50] hover:bg-[#FB4A50] text-sm font-bold transition-all duration-300">
                  Cancel
                </button>
                <button 
                  type="submit" 
                  form="lead-form" 
                  disabled={isSubmitting}
                  className="inline-flex justify-center items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg hover:opacity-95 disabled:opacity-50 transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    initialData ? 'Save Changes' : 'Create Lead'
                  )}
                </button>
              </div>
            </div>

          </DialogPanel>
        </div>
      </div>
    </Dialog>
      <ConfirmationModal
        isOpen={statusConfirmState}
        onClose={() => setStatusConfirmState(false)}
        onConfirm={handleFinalSave}
        title="Confirm Status Change"
        message={`Are you sure you want to change the lead status from "${initialData?.status}" to "${formData.status}"?`}
        confirmLabel="Update Status"
        cancelLabel="Cancel"
      />
    </>
  );
}

// --- CONVERT LEAD MODAL ---
function ConvertLeadModal({ isOpen, onClose, onConvert, lead }) {
  const [formData, setFormData] = useState({ email: '', phone: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && lead) {
      setFormData({
        email: lead.email || '',
        phone: lead.phone || ''
      });
    }
  }, [isOpen, lead]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.phone) return;
    setIsSubmitting(true);
    try {
      await onConvert(lead.id, formData.phone, formData.email);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!lead) return null;

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-[9999]">
      <DialogBackdrop transition className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200" />
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
          <DialogPanel transition className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 sm:my-8 sm:w-full sm:max-w-md">
            <div className="bg-white px-6 pb-4 pt-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/30">
                    <ArrowRightLeft className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Convert to Client</h3>
                    <p className="text-xs text-slate-500">Converting <span className="font-semibold text-slate-700">{lead.firstName} {lead.lastName}</span></p>
                  </div>
                </div>
                <button type="button" onClick={onClose} className="text-slate-400 hover:bg-slate-100 hover:text-slate-600 p-1.5 rounded-lg transition-colors">
                  <X size={18} />
                </button>
              </div>

              {/* Info Banner */}
              <div className="mb-5 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-xs text-amber-800 font-medium">⚠️ This will convert this lead into a client. Please verify the contact details below before proceeding.</p>
              </div>

              <form id="convert-form" onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      required
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-300"
                      placeholder="client@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      required
                      type="tel"
                      value={formData.phone}
                      maxLength={10}
                      onChange={e => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        setFormData({ ...formData, phone: val });
                      }}
                      className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-300"
                      placeholder="0412345678"
                    />
                  </div>
                </div>
              </form>
            </div>
            <div className="bg-slate-50 px-6 py-4 flex gap-3 justify-end border-t border-slate-100">
              <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl bg-white text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button
                type="submit"
                form="convert-form"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-sm font-semibold text-white shadow-md shadow-emerald-500/20 hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Converting...</>
                ) : (
                  <><CheckCircle2 className="w-4 h-4" /> Convert Lead</>
                )}
              </button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}

// --- ASSIGN LEAD MODAL ---
function AssignLeadModal({ isOpen, onClose, onAssign, lead }) {
  const [assignedTo, setAssignedTo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAssignedTo(lead?.assignedTo || '');
      setLoadingUsers(true);

      const fetchUsersList = async () => {
        try {
          const api = new AdminApi();
          const res = await api.getAllUsers();
          const usersList = res.users || [];

          // Get the current logged-in module and the current user's allowed modules
          const currentModule = (localStorage.getItem("currentModule") || "").toUpperCase();
          const userAccessString = localStorage.getItem("access") || "";
          const userAllowedModules = userAccessString
            .split(",")
            .map(m => m.trim().toUpperCase())
            .filter(Boolean);

          // Filter users who are active
          let filtered = usersList.filter(u => u.status === 'active');

          if (currentModule === "CRM") {
            // If in CRM, list users who have access to any of the modules the current user can access
            // This ensures we only see relevant team members
            filtered = filtered.filter(u =>
              u.access && u.access.some(mod => userAllowedModules.includes(mod.toUpperCase()))
            );
          } else if (currentModule) {
            // If in a specific module, filter users who have access to that module
            filtered = filtered.filter(u =>
              u.access && u.access.map(m => m.toUpperCase()).includes(currentModule)
            );
          }

          setUsers(filtered);
        } catch (err) {
          console.error("Failed to load users", err);
          toast.error("Failed to load team members for assignment");
        } finally {
          setLoadingUsers(false);
        }
      };

      fetchUsersList();
    }
  }, [isOpen, lead]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!assignedTo) {
      toast.warning("Please select a team member");
      return;
    }
    setIsSubmitting(true);
    try {
      await onAssign(lead.id, assignedTo);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!lead) return null;

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-[999]">
      <DialogBackdrop transition className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200" />
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
          <DialogPanel transition className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 sm:my-8 sm:w-full sm:max-w-md">
            <div className="bg-white px-6 pb-4 pt-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/30">
                    <UserCheck className="w-5 h-5 text-violet-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Assign Lead</h3>
                    <p className="text-xs text-slate-500">Assigning <span className="font-semibold text-slate-700">{lead.firstName} {lead.lastName}</span></p>
                  </div>
                </div>
                <button type="button" onClick={onClose} className="text-slate-400 hover:bg-slate-100 hover:text-slate-600 p-1.5 rounded-lg transition-colors">
                  <X size={18} />
                </button>
              </div>

              <form id="assign-form" onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Assign To Team Member</label>
                  <div className="relative">
                    <UserCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10 pointer-events-none" />

                    {loadingUsers ? (
                      <div className="flex items-center gap-2 text-slate-500 text-xs py-2.5 pl-10 border border-slate-200 rounded-xl bg-slate-50/50">
                        <Loader2 className="w-4 h-4 animate-spin text-[#2E3D99]" />
                        <span>Loading team members...</span>
                      </div>
                    ) : (
                      <select
                        required
                        value={assignedTo}
                        onChange={e => setAssignedTo(e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-300 appearance-none bg-no-repeat bg-white cursor-pointer"
                        style={{
                          backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                          backgroundPosition: 'right 0.75rem center',
                          backgroundSize: '1.25em 1.25em'
                        }}
                      >
                        <option value="">Select a team member</option>
                        {users.map(u => (
                          <option key={u._id || u.id} value={u._id || u.id}>
                            {u.displayName || u.email} ({u.role})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1.5">Only active users with module access are listed here.</p>
                </div>
              </form>
            </div>
            <div className="bg-slate-50 px-6 py-4 flex gap-3 justify-end border-t border-slate-100">
              <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl bg-white text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button
                type="submit"
                form="assign-form"
                disabled={isSubmitting || loadingUsers}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-sm font-semibold text-white shadow-md shadow-[#2E3D99]/20 hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {isSubmitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Assigning...</>
                ) : (
                  <><UserCheck className="w-4 h-4" /> Assign Lead</>
                )}
              </button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
// --- TASK FORM MODAL ---
function TaskFormModal({ isOpen, onClose, onSave, users, initialData }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [reminderDate, setReminderDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTitle(initialData.title || "");
        setDescription(initialData.description || "");
        setAssignedTo(initialData.assignedTo || "");
        setDueDate(initialData.dueDate ? moment(initialData.dueDate).format("YYYY-MM-DDTHH:mm") : "");
        setReminderDate(initialData.reminderDate ? moment(initialData.reminderDate).format("YYYY-MM-DDTHH:mm") : "");
      } else {
        setTitle("");
        setDescription("");
        setAssignedTo("");
        setDueDate("");
        setReminderDate("");
      }
      setIsSubmitting(false);
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !dueDate) return;
    setIsSubmitting(true);
    await onSave({ 
      id: initialData?._id || initialData?.id,
      title, 
      description, 
      assignedTo, 
      dueDate, 
      reminderDate 
    });
    setIsSubmitting(false);
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-[999]">
      <DialogBackdrop transition className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" />
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <DialogPanel className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-[#2E3D99] to-[#1D97D7]">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-white/80" />
                {initialData ? "Edit Task" : "Create New Task"}
              </h2>
              <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <form id="task-form" onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Task Title *</label>
                  <input required type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2E3D99]/50 focus:border-[#2E3D99]/50" placeholder="e.g. Presentation with customer" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Description</label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2E3D99]/50 focus:border-[#2E3D99]/50" placeholder="Additional details..." rows={3}></textarea>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Assign To</label>
                  <select value={assignedTo} onChange={e => setAssignedTo(e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2E3D99]/50 focus:border-[#2E3D99]/50">
                    <option value="">Unassigned</option>
                    {users.map(u => (
                      <option key={u._id || u.id} value={u._id || u.id}>
                        {u.displayName || u.email}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Due Date *</label>
                    <input required type="datetime-local" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2E3D99]/50 focus:border-[#2E3D99]/50" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Reminder</label>
                    <input type="datetime-local" value={reminderDate} onChange={e => setReminderDate(e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2E3D99]/50 focus:border-[#2E3D99]/50" />
                  </div>
                </div>
              </form>
            </div>
            <div className="bg-slate-50 px-6 py-4 flex gap-3 justify-end border-t border-slate-100">
              <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl bg-white text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button type="submit" form="task-form" disabled={isSubmitting} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-sm font-semibold text-white shadow-md shadow-[#2E3D99]/20 hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-60">
                {isSubmitting ? "Saving..." : (initialData ? "Save Changes" : "Create Task")}
              </button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}


// --- MAIN LEADS PAGE ---
export default function Leads() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState(null);
  const [formState, setFormState] = useState({ isOpen: false, lead: null });
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ status: 'All' });
  const { searchQuery } = useSearchStore();
  const [deleteState, setDeleteState] = useState({ isOpen: false, lead: null });
  const [convertState, setConvertState] = useState({ isOpen: false, lead: null });
  const [assignState, setAssignState] = useState({ isOpen: false, lead: null });
  const [taskState, setTaskState] = useState({ isOpen: false, lead: null, task: null });

  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [currentMobilePageData, setCurrentMobilePageData] = useState([]);
  const [stageFilter, setStageFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const api = new AdminApi();
      const [res, usersRes] = await Promise.all([
        crmAPI.getAllLeads(),
        api.getAllUsers().catch(() => ({ users: [] }))
      ]);

      const allUsers = usersRes.users || [];
      setUsersList(allUsers);

      // Robustly handle different possible response structures
      let leadsList = [];
      if (Array.isArray(res)) {
        leadsList = res;
      } else if (res && res.leads) {
        leadsList = res.leads;
      } else if (res && res.data) {
        leadsList = Array.isArray(res.data) ? res.data : (res.data.leads || []);
      }

      const transformed = leadsList.map(lead => {
        const firstName = lead.contactId?.firstName || lead.firstName || (lead.fullName ? lead.fullName.trim().split(/\s+/)[0] : "");
        const lastName = lead.contactId?.lastName || lead.lastName || (lead.fullName ? lead.fullName.trim().split(/\s+/).slice(1).join(" ") : "");
        const assignedUserId = typeof lead.assignedTo === 'object' ? lead.assignedTo?._id : lead.assignedTo;
        const assignedUser = allUsers.find(u => (u.id || u._id) === assignedUserId);
        return {
          id: lead._id,
          firstName,
          lastName,
          company: lead.companyId?.companyName || lead.companyId?.name || lead.companyName || "",
          title: lead.title || "",
          email: lead.contactId?.email || lead.email || "",
          phone: lead.contactId?.phone || lead.phone || "",
          description: lead.description || "",
          status: lead.status || "New",
          address: lead.address || "",
          assignedTo: assignedUserId || "",
          assignedToName: assignedUser ? (assignedUser.displayName || assignedUser.email) : (typeof lead.assignedTo === 'object' ? lead.assignedTo?.displayName : "Unassigned"),
          source: lead.leadSource || lead.enquirySource || lead.source || "Manual",
          leadSource: lead.leadSource || lead.enquirySource || lead.source || "Manual",
          enquirySource: lead.enquirySource || lead.leadSource || "Website",
          priority: lead.priority || "Medium",
          leadTemperature: lead.leadTemperature || "",
          serviceTypes: lead.serviceTypes || [],
          referrerName: lead.referrerName || "",
          referrerEmail: lead.referrerEmail || "",
          referrerPhone: lead.referrerPhone || "",
          commercialValue: lead.commercialValue || 0,
          proposalStatus: lead.proposalStatus || "Not Required",
          nextFollowUpDate: lead.nextFollowUpDate || null,
          createdAt: lead.createdAt
        };
      });
      setLeads(transformed);
    } catch (error) {
      console.error("Failed to load leads", error);
      toast.error("Failed to load leads from database");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const columns = useMemo(() => [
    {
      key: "displayName",
      title: "Name",
      width: "18%",
      render: (lead) => {
        const initials = `${lead.firstName[0] || ''}${lead.lastName[0] || ''}`.toUpperCase();
        return (
          <div className="flex items-center gap-3 pl-3">
            <div className="w-8 h-8 rounded-full bg-[#2E3D99]/10 text-[#2E3D99] flex items-center justify-center font-bold text-xs border border-[#2E3D99]/20">
              {initials}
            </div>
            <div className="text-left">
              <p className="font-bold text-slate-800 text-xs sm:text-sm leading-tight">{lead.firstName} {lead.lastName}</p>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">{lead.title}</p>
            </div>
          </div>
        );
      }
    },
    {
      key: "company",
      title: "Company",
      width: "12%",
      render: (lead) => (
        <span className="font-semibold text-slate-600 text-xs sm:text-sm">{lead.company}</span>
      )
    },
    {
      key: "leadEmail",
      title: "Email",
      width: "16%",
      render: (lead) => (
        <span className="text-slate-500 font-medium text-xs sm:text-sm truncate block">{lead.email}</span>
      )
    },
    {
      key: "phone",
      title: "Phone",
      width: "10%",
      render: (lead) => (
        <span className="text-slate-500 font-medium text-xs sm:text-sm">{lead.phone}</span>
      )
    },
    {
      key: "assignedToName",
      title: "Assigned To",
      width: "12%",
      render: (lead) => (
        <span className={`text-xs sm:text-sm font-medium break-words ${lead.assignedTo ? "text-slate-700" : "text-slate-400 italic"}`}>
          {lead.assignedToName || "Unassigned"}
        </span>
      )
    },
    {
      key: "source",
      title: "Source",
      width: "8%",
      render: (lead) => (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <Tag size={10} />
          {lead.source || "Manual"}
        </span>
      )
    },
    {
      key: "status",
      title: "Status",
      width: "10%",
      render: (lead) => {
        const statusColors = {
          "New": "bg-blue-100 text-blue-800 border border-blue-200",
          "Open": "bg-indigo-100 text-indigo-800 border border-indigo-200",
          "Contacted": "bg-amber-100 text-amber-800 border border-amber-200",
          "Qualified": "bg-teal-100 text-teal-800 border border-teal-200",
          "Converted": "bg-emerald-100 text-emerald-800 border border-emerald-200",
          "Closed": "bg-slate-100 text-slate-800 border border-slate-200",
          "Unqualified": "bg-rose-100 text-rose-800 border border-rose-200",
        };
        const colorClass = statusColors[lead.status] || "bg-slate-100 text-slate-500 border border-slate-250";

        const handleStatusChange = async (e) => {
          const newStatus = e.target.value;
          if (newStatus === lead.status) return;

          // Optimistically update status
          setLeads(prev => prev.map(c => c.id === lead.id ? { ...c, status: newStatus } : c));

          try {
            await crmAPI.updateLeadStatus(lead.id, newStatus);
            toast.success(`Lead status updated to ${newStatus}`);
            // No need to fetchLeads() immediately if optimistic update was successful, 
            // but doing it to ensure sync with DB
            fetchLeads();
          } catch (err) {
            console.error("Failed to update status", err);
            toast.error(err.message || "Failed to update status");
            fetchLeads();
          }
        };

        return (
          <select
            value={lead.status}
            onChange={handleStatusChange}
            className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${colorClass} cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#2E3D99]/40 pr-6 appearance-none bg-no-repeat`}
            style={{
              backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%234B5563' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
              backgroundPosition: 'right 0.25rem center',
              backgroundSize: '1.25em 1.25em',
              paddingRight: '1.5rem'
            }}
          >
            <option value="New">New</option>
            <option value="Open">Open</option>
            <option value="Contacted">Contacted</option>
            <option value="Qualified">Qualified</option>
            <option value="Closed">Closed</option>
            <option value="Unqualified">Unqualified</option>
          </select>
        );
      }
    },
    {
      key: "actions",
      title: "Actions",
      width: "14%",
      render: (lead) => {
        const isConverted = lead.status === "Converted";
        return (
          <div className="flex items-center justify-center gap-1.5">
            {/* View Details */}
            <button
              onClick={() => handleLeadClick(lead, false)}
              className="p-1 text-slate-500 hover:text-[#2E3D99] hover:bg-slate-100 rounded transition-colors"
              title="View Details"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>

            {/* Edit */}
            <button
              onClick={() => handleLeadClick(lead, true)}
              className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
              title="Edit Lead"
            >
              <Edit className="w-3.5 h-3.5" />
            </button>

            {/* Delete */}
            <button
              onClick={() => handleDeleteLead(lead)}
              className="p-1 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded transition-colors"
              title="Delete Lead"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>

            {!isConverted && (
              <>
                {/* Convert */}
                <button
                  onClick={() => setConvertState({ isOpen: true, lead })}
                  className="p-1 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded transition-colors"
                  title="Convert to Client"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                </button>

                {/* Assign */}
                <button
                  onClick={() => setAssignState({ isOpen: true, lead })}
                  className="p-1 text-violet-600 hover:text-violet-800 hover:bg-violet-50 rounded transition-colors"
                  title="Assign Lead"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                </button>

                {/* Task */}
                <button
                  onClick={() => setTaskState({ isOpen: true, lead, task: null })}
                  className="p-1 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded transition-colors"
                  title="New Task"
                >
                  <Clock className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        );
      }
    }
  ], []);

  const handleLeadClick = (lead, isEdit = false) => {
    if (isEdit) {
      setFormState({ isOpen: true, lead });
      setSelectedLead(null);
    } else {
      // Navigate to full-page lead detail view
      navigate(`/admin/crm/leads/${lead.id}`, { state: { lead } });
    }
  };

  const handleDeleteLead = (lead) => {
    setDeleteState({ isOpen: true, lead });
  };

  const handleConfirmDelete = async () => {
    if (deleteState.lead) {
      try {
        await crmAPI.deleteLead(deleteState.lead.id);
        toast.success("Lead deleted successfully!");
        fetchLeads();
      } catch (error) {
        console.error("Error deleting lead", error);
        toast.error(error.message || "Failed to delete lead.");
      }
    }
    setDeleteState({ isOpen: false, lead: null });
  };

  const handleSaveLead = async (leadData) => {
    try {
      if (formState.lead) {
        // Determine only updated/changed values to send to backend PATCH
        const original = formState.lead;
        const updatedFields = {};

        const originalFullName = `${original.firstName || ""} ${original.lastName || ""}`.trim();
        const newFullName = `${leadData.firstName || ""} ${leadData.lastName || ""}`.trim();
        if (newFullName !== originalFullName) {
          updatedFields.fullName = newFullName;
        }

        const originalTitle = original.title || "";
        const newTitle = leadData.title || "";
        if (newTitle !== originalTitle) {
          updatedFields.title = newTitle;
        }

        const originalDesc = original.description || "";
        const newDesc = leadData.description || "";
        if (newDesc !== originalDesc) {
          updatedFields.description = newDesc;
        }

        const originalEmail = original.email || "";
        const newEmail = leadData.email || "";
        if (newEmail !== originalEmail) {
          updatedFields.email = newEmail;
        }

        const originalPhone = original.phone || "";
        const newPhone = leadData.phone || "";
        if (newPhone !== originalPhone) {
          updatedFields.phone = newPhone;
        }

        const originalCompany = original.company || "";
        const newCompany = leadData.company || "";
        if (newCompany !== originalCompany) {
          updatedFields.companyName = newCompany;
        }

        const originalAssignedTo = original.assignedTo || "";
        const newAssignedTo = leadData.assignedTo || "";
        if (newAssignedTo !== originalAssignedTo) {
          updatedFields.assignedTo = newAssignedTo || null;
        }

        const originalNextFollowUpDate = original.nextFollowUpDate ? original.nextFollowUpDate.split('T')[0] : "";
        const newNextFollowUpDate = leadData.nextFollowUpDate ? leadData.nextFollowUpDate.split('T')[0] : "";
        if (newNextFollowUpDate !== originalNextFollowUpDate) {
          updatedFields.nextFollowUpDate = newNextFollowUpDate || null;
        }

        // New Dropdown Fields Handling
        if (leadData.status && leadData.status !== original.status) {
          updatedFields.status = leadData.status;
        }
        if (leadData.enquirySource && leadData.enquirySource !== original.enquirySource) {
          updatedFields.enquirySource = leadData.enquirySource;
          updatedFields.leadSource = leadData.enquirySource; // Backend requires this for some endpoints
        }
        if (leadData.leadTemperature && leadData.leadTemperature !== original.leadTemperature) {
          updatedFields.leadTemperature = leadData.leadTemperature;
        }
        if (leadData.priority && leadData.priority !== original.priority) {
          updatedFields.priority = leadData.priority;
        }
        
        // Referrer Fields
        if (leadData.referrerName !== original.referrerName) updatedFields.referrerName = leadData.referrerName;
        if (leadData.referrerEmail !== original.referrerEmail) updatedFields.referrerEmail = leadData.referrerEmail;
        if (leadData.referrerPhone !== original.referrerPhone) updatedFields.referrerPhone = leadData.referrerPhone;

        // Unqualified Reasons
        if (leadData.status === "Unqualified Lead") {
          if (leadData.unqualifiedReason !== original.unqualifiedReason) updatedFields.unqualifiedReason = leadData.unqualifiedReason;
          if (leadData.customReason !== original.customReason) updatedFields.customReason = leadData.customReason;
        }

        if (leadData.status === "Lost") {
          if (leadData.lostReason !== original.lostReason) updatedFields.lostReason = leadData.lostReason;
          if (leadData.lostReason !== original.customReason) updatedFields.customReason = leadData.lostReason;
        }

        // Proposal Status Handling (API expects specific route)
        const originalProposalStatus = original.proposalStatus || "Not Required";
        const newProposalStatus = leadData.proposalStatus || "Not Required";
        if (newProposalStatus !== originalProposalStatus) {
          await crmAPI.updateProposalStatus(original.id, newProposalStatus);
        }

        const originalCommercialValue = original.commercialValue || "";
        const newCommercialValue = leadData.commercialValue || "";
        if (newCommercialValue !== originalCommercialValue) {
          updatedFields.commercialValue = newCommercialValue;
        }

        // Only call update API if there's at least one updated field in the main body
        if (Object.keys(updatedFields).length > 0 || newProposalStatus !== originalProposalStatus) {
          if (Object.keys(updatedFields).length > 0) {
            await crmAPI.updateLead(original.id, updatedFields);
          }
          toast.success("Lead updated successfully!");
          fetchLeads();
        } else {
          toast.info("No changes were made.");
        }
      } else {
        const leadPayload = {
          title: leadData.title || "Lead Enquiry",
          description: leadData.description || "",
          serviceTypes: leadData.serviceTypes || [],
          enquirySource: leadData.enquirySource || "Website",
          leadSource: leadData.enquirySource || "Website",
          leadTemperature: leadData.leadTemperature || "Warm",
          referrerName: leadData.referrerName || "",
          referrerEmail: leadData.referrerEmail || "",
          referrerPhone: leadData.referrerPhone || "",
          priority: leadData.priority || "Medium",
          email: leadData.email || "",
          firstName: leadData.firstName || "",
          lastName: leadData.lastName || "",
          companyName: leadData.company || "",
          phone: leadData.phone || "",
          assignedTo: leadData.assignedTo || "",
          commercialValue: leadData.commercialValue || null,
          lostReason: leadData.lostReason || null
        };

        await crmAPI.createLead(leadPayload);
        toast.success("New lead created successfully!");
        fetchLeads();
      }
    } catch (error) {
      console.error("Error saving lead", error);
      toast.error(error.message || "Failed to save lead.");
    }
    setFormState({ isOpen: false, lead: null });
  };

  // --- CONVERT LEAD HANDLER ---
  const handleConvertLead = async (leadId, phone, email) => {
    try {
      await crmAPI.convertLeadToClient(leadId, phone, email);
      toast.success("Lead converted to client successfully!");
      setConvertState({ isOpen: false, lead: null });
      fetchLeads();
    } catch (error) {
      console.error("Error converting lead", error);
      toast.error(error.message || "Failed to convert lead.");
    }
  };

  // --- ASSIGN LEAD HANDLER ---
  const handleAssignLead = async (leadId, assignedTo) => {
    try {
      await crmAPI.assignLead(leadId, assignedTo);
      toast.success("Lead assigned successfully!");
      setAssignState({ isOpen: false, lead: null });
      fetchLeads();
    } catch (error) {
      console.error("Error assigning lead", error);
      toast.error(error.message || "Failed to assign lead.");
    }
  };

  // --- CREATE/EDIT TASK HANDLER ---
  const handleSaveTask = async (taskData) => {
    if (!taskState.lead) return;
    try {
      const payload = {
        ...taskData,
        superadminId: localStorage.getItem("userId") || ""
      };
      
      // Convert to UTC ISO format for backend
      if (payload.dueDate) payload.dueDate = new Date(payload.dueDate).toISOString();
      if (payload.reminderDate) payload.reminderDate = new Date(payload.reminderDate).toISOString();
      
      if (taskState.task) {
        await crmAPI.editTask(taskState.task._id || taskState.task.id, payload);
        toast.success("Task updated successfully!");
      } else {
        await crmAPI.createTask(taskState.lead.id, payload);
        toast.success("Task created successfully!");
      }
      
      setTaskState({ isOpen: false, lead: null, task: null });
      fetchLeads(); // refresh to show task count if tracked

    } catch (error) {
      console.error("Error creating task", error);
      toast.error(error.message || "Failed to create task.");
    }
  };

  // handleSort defined later with new pagination-aware version

  const currentUserId = localStorage.getItem("userId") || "";

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchesSearch = searchQuery
        ? `${lead.firstName} ${lead.lastName} ${lead.company} ${lead.email} ${lead.title || ""}`.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      const matchesStatus = filters.status === 'All' || lead.status === filters.status;
      const displayStage  = getDisplayStage(lead.status);
      const matchesStage  =
        stageFilter === 'All' ? true :
        stageFilter === 'Mine' ? lead.assignedTo === currentUserId :
        displayStage === stageFilter;
      return matchesSearch && matchesStatus && matchesStage;
    });
  }, [leads, searchQuery, filters, stageFilter]);

  const sortedLeads = useMemo(() => {
    const list = [...filteredLeads];
    if (sortConfig.key) {
      list.sort((a, b) => {
        let valA = a[sortConfig.key] || '';
        let valB = b[sortConfig.key] || '';
        if (sortConfig.key === 'displayName') {
          valA = `${a.firstName} ${a.lastName}`;
          valB = `${b.firstName} ${b.lastName}`;
        } else if (sortConfig.key === 'leadEmail') {
          valA = a.email || '';
          valB = b.email || '';
        }
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return list;
  }, [filteredLeads, sortConfig]);

  // kept for compat — unused in new design
  const FloatingElement = ({ top, left, delay, size = 60 }) => (
    <motion.div
      className="hidden"
      style={{ width: size, height: size, top: `${top}%`, left: `${left}%` }}
      animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
      transition={{ duration: 3 + delay, repeat: Infinity, ease: "easeInOut" }}
    />
  );

  // ── Pagination ────────────────────────────────────────────────────────────
  const totalPages    = Math.ceil(sortedLeads.length / ITEMS_PER_PAGE);
  const paginatedLeads = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedLeads.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedLeads, currentPage]);

  const handleSort = (key) => {
    setSortConfig(prev =>
      prev.key === key
        ? { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: 'asc' }
    );
  };

  const SortIcon = ({ col }) => {
    if (sortConfig.key !== col) return <ArrowUpDown size={12} className="text-slate-300" />;
    return sortConfig.direction === 'asc'
      ? <ChevronUp size={12} className="text-white" />
      : <ChevronDown size={12} className="text-white" />;
  };

  // Avatar helper
  const Avatar = ({ name = "", size = "sm" }) => {
    const initials = name.split(" ").filter(Boolean).slice(0, 2).map(n => n[0]).join("").toUpperCase() || "?";
    const colors   = ["bg-[#2E3D99]","bg-teal-600","bg-violet-600","bg-amber-600","bg-rose-600","bg-emerald-600","bg-indigo-600"];
    const color    = colors[initials.charCodeAt(0) % colors.length];
    const dim      = size === "sm" ? "w-6 h-6 text-[9px]" : "w-8 h-8 text-xs";
    return (
      <div className={`${dim} ${color} rounded-full flex items-center justify-center text-white font-bold shrink-0`}>
        {initials}
      </div>
    );
  };

  const STAGE_PILLS = ['All','Mine','New Lead','Qualified','Opportunity','Proposal','Negotiation','Won','Lost'];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-full">
        <Header />

        <main className="px-6 py-6 max-w-[1600px] mx-auto">

          {/* ── Page Header ─────────────────────────────────────────────────── */}
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-slate-900 truncate">Leads</h1>
              <p className="text-sm text-slate-500 mt-0.5 truncate md:whitespace-normal">Track, manage, and action all leads in one place.</p>
            </div>
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0">
              {/* Filter */}
              <div className="relative">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl border shadow-sm transition-all ${
                    filters.status !== 'All'
                      ? 'bg-[#2E3D99]/10 border-[#2E3D99]/30 text-[#2E3D99]'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <ListFilter size={16} />
                  Filter
                  {filters.status !== 'All' && <span className="w-2 h-2 bg-rose-500 rounded-full" />}
                </button>
                <AnimatePresence>
                  {showFilters && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 z-50"
                    >
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Filter by Status</p>
                      <select
                        value={filters.status}
                        onChange={e => { setFilters({ ...filters, status: e.target.value }); setCurrentPage(1); }}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2E3D99]/30 bg-white"
                      >
                        {['All','New','Open','Contacted','Qualified','Closed','Unqualified','Converted'].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Sort */}
              <button
                onClick={() => handleSort('createdAt')}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl shadow-sm transition-all"
              >
                <ArrowUpDown size={16} />
                Sort
              </button>

              {/* New Lead */}
              <button
                onClick={() => setFormState({ isOpen: true, lead: null })}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg hover:opacity-95 transition-all"
              >
                <Plus size={16} />
                New Lead
              </button>
            </div>
          </div>

          {/* ── Stat Cards ───────────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              icon={Users}
              title="New Leads"
              value={leads.filter(l => getDisplayStage(l.status) === 'New Lead').length}
              iconBg="bg-blue-50"
              iconColor="text-[#2E3D99]"
              loading={loading}
            />
            <StatCard
              icon={UserCheck}
              title="Qualified Leads"
              value={leads.filter(l => getDisplayStage(l.status) === 'Qualified').length}
              iconBg="bg-teal-50"
              iconColor="text-teal-600"
              loading={loading}
            />
            <StatCard
              icon={FileText}
              title="Open Proposals"
              value={leads.filter(l => getDisplayStage(l.status) === 'Proposal').length}
              iconBg="bg-violet-50"
              iconColor="text-violet-600"
              loading={loading}
            />
            <StatCard
              icon={Trophy}
              title="Won This Month"
              value={leads.filter(l => {
                const d = getDisplayStage(l.status);
                const isWon = d === 'Won';
                const isThisMonth = l.createdAt
                  ? new Date(l.createdAt).getMonth() === new Date().getMonth() &&
                    new Date(l.createdAt).getFullYear() === new Date().getFullYear()
                  : false;
                return isWon;
              }).length}
              iconBg="bg-amber-50"
              iconColor="text-amber-600"
              loading={loading}
            />
          </div>

          {/* ── Table Card ────────────────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">

            {/* Table header bar */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <h2 className="text-sm font-bold text-slate-800">All Leads</h2>
                <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
                  {filteredLeads.length} results
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Eye size={13} className="text-slate-300" />
                Click a lead to view full details
              </div>
            </div>

            {/* Stage filter pills */}
            <div className="flex items-center gap-1.5 px-5 py-3 border-b border-slate-50 overflow-x-auto">
              {STAGE_PILLS.map(pill => (
                <button
                  key={pill}
                  onClick={() => { setStageFilter(pill); setCurrentPage(1); }}
                  className={`shrink-0 px-3.5 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                    stageFilter === pill
                      ? 'bg-[#2E3D99] text-white border-[#2E3D99] shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {pill}
                </button>
              ))}
            </div>

            {/* Table */}
            <div className="hidden md:block overflow-x-auto px-3 pb-3">
              <table className="w-full text-sm border-separate border-spacing-y-1.5">
                <thead>
                  <tr className="bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white">
                    {[
                      { key: 'title',          label: 'Enquiry Type',      sortable: true,  center: false },
                      { key: 'displayName',    label: 'Contact',         sortable: true,  center: false },
                      { key: 'company',        label: 'Company',         sortable: true,  center: false },
                      { key: 'status',         label: 'Stage',           sortable: false, center: false },
                      { key: 'proposalStatus', label: 'Proposal Status', sortable: false, center: true  },
                      { key: 'assignedToName', label: 'Owner',           sortable: true,  center: false },
                      { key: 'source',         label: 'Source',          sortable: false, center: true  },
                      { key: 'value',          label: 'Value',           sortable: false, center: true  },
                      { key: 'nextFollowUp',   label: 'Next Follow-Up',  sortable: false, center: true  },
                      { key: 'priority',       label: 'Priority',        sortable: false, center: true  },
                      { key: 'actions',        label: 'Actions',         sortable: false, center: true  },
                    ].map((col, colIdx, arr) => (
                      <th
                        key={col.key}
                        className={[
                          'px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-white/90 whitespace-nowrap',
                          col.center ? 'text-center' : 'text-left',
                          col.sortable ? 'cursor-pointer hover:text-white select-none' : '',
                          colIdx === 0 ? 'rounded-l-xl' : '',
                          colIdx === arr.length - 1 ? 'rounded-r-xl' : '',
                        ].join(' ')}
                        onClick={col.sortable ? () => handleSort(col.key) : undefined}
                      >
                        <div className={`flex items-center gap-1.5 ${col.center ? 'justify-center' : ''}`}>
                          {col.label}
                          {col.sortable && <SortIcon col={col.key} />}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <tr key={i} className="animate-pulse bg-white rounded-xl">
                        {Array.from({ length: 11 }).map((_, j) => (
                          <td
                            key={j}
                            className={`px-4 py-3.5 bg-white border-y border-slate-100 ${j === 0 ? 'rounded-l-xl border-l' : ''} ${j === 10 ? 'rounded-r-xl border-r' : ''}`}
                          >
                            <div className="h-4 bg-slate-100 rounded w-full" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : paginatedLeads.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="text-center py-16 text-slate-400">
                        <Users size={32} className="mx-auto mb-3 text-slate-200" />
                        <p className="text-sm font-semibold">No leads found</p>
                        <p className="text-xs text-slate-300 mt-1">Try adjusting your filters or add a new lead</p>
                      </td>
                    </tr>
                  ) : paginatedLeads.map((lead) => {
                    const displayStage  = getDisplayStage(lead.status);
                    const stageStyle    = STAGE_DISPLAY[displayStage]?.badge || "bg-slate-100 text-slate-500";
                    const proposalStyle = PROPOSAL_STATUS_STYLES[lead.proposalStatus] || null;
                    const priorityStyle = PRIORITY_STYLES[lead.priority] || null;
                    const displayId     = lead.leadId || `LD-${(lead.id || "").slice(-4).toUpperCase()}`;
                    const fullName      = `${lead.firstName} ${lead.lastName}`.trim();

                    // shared cell base classes
                    const cell  = 'px-4 py-3 bg-white border-y border-slate-100 transition-colors group-hover:bg-blue-50/40';
                    const cellL = `${cell} rounded-l-xl border-l`;
                    const cellR = `${cell} rounded-r-xl border-r`;

                    return (
                      <tr
                        key={lead.id}
                        className="cursor-pointer group"
                        onClick={() => handleLeadClick(lead, false)}
                      >
                        {/* Lead Title */}
                        <td className={`${cellL} max-w-[160px]`}>
                          <span className="text-xs font-semibold text-slate-800 line-clamp-2">{lead.title || "—"}</span>
                        </td>

                        {/* Contact */}
                        <td className={cell}>
                          <div className="flex items-center gap-2">
                            <Avatar name={fullName} size="sm" />
                            <span className="text-xs font-semibold text-slate-700 whitespace-nowrap">{fullName}</span>
                          </div>
                        </td>

                        {/* Company */}
                        <td className={cell}>
                          <span className="text-xs font-medium text-slate-600 whitespace-nowrap">{lead.company || "—"}</span>
                        </td>

                        {/* Stage */}
                        <td className={cell}>
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap ${stageStyle}`}>
                            {displayStage}
                          </span>
                        </td>

                        {/* Proposal Status — centered */}
                        <td className={`${cell} text-center`}>
                          {proposalStyle ? (
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap ${proposalStyle}`}>
                              {lead.proposalStatus}
                            </span>
                          ) : (
                            <span className="text-slate-300 font-medium">—</span>
                          )}
                        </td>

                        {/* Owner */}
                        <td className={cell}>
                          <div className="flex items-center gap-2">
                            <Avatar name={lead.assignedToName} size="sm" />
                            <span className="text-xs font-medium text-slate-600 whitespace-nowrap">{lead.assignedToName || "Unassigned"}</span>
                          </div>
                        </td>

                        {/* Source — centered */}
                        <td className={`${cell} text-center`}>
                          <span className="text-xs font-medium text-slate-600 whitespace-nowrap">{lead.leadSource || lead.source || <span className="text-slate-300 font-medium">—</span>}</span>
                        </td>

                        {/* Value — centered */}
                        <td className={`${cell} text-center`}>
                          <span className="text-xs font-semibold text-slate-700 whitespace-nowrap">
                            {lead.commercialValue ? `$${Number(lead.commercialValue).toLocaleString()}` : <span className="text-slate-300 font-medium">—</span>}
                          </span>
                        </td>

                        {/* Next Follow-Up — centered */}
                        <td className={`${cell} text-center`}>
                          <span className="text-xs font-medium text-slate-600 whitespace-nowrap">
                            {lead.nextFollowUpDate
                              ? new Date(lead.nextFollowUpDate).toLocaleDateString("en-GB")
                              : <span className="text-slate-300 font-medium">—</span>}
                          </span>
                        </td>

                        {/* Priority — centered */}
                        <td className={`${cell} text-center`}>
                          {priorityStyle ? (
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap ${priorityStyle}`}>
                              {lead.priority}
                            </span>
                          ) : (
                            <span className="text-slate-300 font-medium">—</span>
                          )}
                        </td>

                        {/* Actions — centered */}
                        <td className={`${cellR} text-center`} onClick={e => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-0.5">
                            {/* View */}
                            <button
                              onClick={() => handleLeadClick(lead, false)}
                              title="View Details"
                              className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-[#2E3D99] hover:bg-[#2E3D99]/10 transition-colors"
                            >
                              <Eye size={13} />
                            </button>
                            {/* Edit */}
                            <button
                              onClick={() => handleLeadClick(lead, true)}
                              title="Edit Lead"
                              className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            >
                              <Edit size={13} />
                            </button>
                            {/* Add Task */}
                            <button
                              onClick={() => setTaskState({ isOpen: true, lead, task: null })}
                              title="Add Task"
                              className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                            >
                              <SquarePlus size={13} />
                            </button>
                            {/* Divider */}
                            <span className="w-px h-4 bg-slate-200 mx-0.5" />
                            {/* Assign */}
                            <button
                              onClick={() => setAssignState({ isOpen: true, lead })}
                              title="Assign Lead"
                              className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition-colors"
                            >
                              <UserPlus size={13} />
                            </button>
                            {/* Delete */}
                            <button
                              onClick={() => setDeleteState({ isOpen: true, lead })}
                              title="Delete Lead"
                              className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="block md:hidden px-4 pb-4 mt-2">
              {loading ? (
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-32 bg-slate-100 animate-pulse rounded-2xl" />
                  ))}
                </div>
              ) : paginatedLeads.length === 0 ? (
                <div className="py-12 text-center bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-sm font-semibold text-slate-600 mb-1">No leads found</p>
                  <p className="text-xs text-slate-400">
                    {searchQuery ? "Try adjusting your filters" : "Add your first lead"}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {paginatedLeads.map((lead) => {
                    const displayStage  = getDisplayStage(lead.status);
                    const stageStyle    = STAGE_DISPLAY[displayStage]?.badge || "bg-slate-100 text-slate-500";
                    const fullName      = `${lead.firstName} ${lead.lastName}`.trim();

                    return (
                      <div
                        key={lead.id}
                        onClick={() => handleLeadClick(lead, false)}
                        className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow relative overflow-hidden"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <Avatar name={fullName} size="md" />
                            <div>
                              <p className="font-bold text-slate-800 text-sm leading-snug line-clamp-1">{lead.title || fullName}</p>
                              <p className="text-[11px] text-[#1D97D7] font-bold mt-0.5">{fullName}</p>
                            </div>
                          </div>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold whitespace-nowrap ${stageStyle}`}>
                            {displayStage}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-y-3 gap-x-2 mt-4 pt-3 border-t border-slate-50/50">
                          <div>
                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Company</p>
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                              <Building2 size={12} className="text-slate-400" />
                              <span className="truncate">{lead.company || "—"}</span>
                            </div>
                          </div>
                          <div>
                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Owner</p>
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                              <User size={12} className="text-slate-400" />
                              <span className="truncate">{lead.assignedToName || "Unassigned"}</span>
                            </div>
                          </div>
                          <div>
                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Value</p>
                            <span className="text-xs font-bold text-slate-700">
                              {lead.commercialValue ? `$${Number(lead.commercialValue).toLocaleString()}` : "—"}
                            </span>
                          </div>
                          <div>
                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Next Follow-Up</p>
                            <span className="text-xs font-bold text-slate-700 block">
                              {lead.nextFollowUpDate ? new Date(lead.nextFollowUpDate).toLocaleDateString("en-GB") : "—"}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ── Pagination ────────────────────────────────────────────── */}
            {!loading && filteredLeads.length > 0 && (
              <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
                <p className="text-xs font-medium text-slate-400">
                  Showing {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredLeads.length)} to{" "}
                  {Math.min(currentPage * ITEMS_PER_PAGE, filteredLeads.length)} of{" "}
                  {filteredLeads.length} results
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Prev
                  </button>
                  {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`w-8 h-8 text-xs font-bold rounded-lg transition-colors ${
                        currentPage === p
                          ? 'bg-[#2E3D99] text-white'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  {totalPages > 4 && <span className="text-slate-300 px-1">…</span>}
                  {totalPages > 3 && (
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      className={`w-8 h-8 text-xs font-bold rounded-lg transition-colors ${
                        currentPage === totalPages
                          ? 'bg-[#2E3D99] text-white'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {totalPages}
                    </button>
                  )}
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>

        </main>
      </div>

      {/* ── Modals ───────────────────────────────────────────────────────── */}
      <LeadDrawer
        lead={selectedLead}
        onClose={() => setSelectedLead(null)}
        onEditClick={handleLeadClick}
        onConvertClick={(lead) => setConvertState({ isOpen: true, lead })}
        onAssignClick={(lead) => setAssignState({ isOpen: true, lead })}
        onTaskClick={(lead) => setTaskState({ isOpen: true, lead, task: null })}
        onEditTaskClick={(lead, task) => setTaskState({ isOpen: true, lead, task })}
      />
      <LeadFormModal isOpen={formState.isOpen} onClose={() => setFormState({ isOpen: false, lead: null })} onSave={handleSaveLead} initialData={formState.lead} />
      <ConvertLeadModal
        isOpen={convertState.isOpen}
        onClose={() => setConvertState({ isOpen: false, lead: null })}
        onConvert={handleConvertLead}
        lead={convertState.lead}
      />
      <AssignLeadModal
        isOpen={assignState.isOpen}
        onClose={() => setAssignState({ isOpen: false, lead: null })}
        onAssign={handleAssignLead}
        lead={assignState.lead}
      />
      <TaskFormModal
        isOpen={taskState.isOpen}
        onClose={() => setTaskState({ isOpen: false, lead: null, task: null })}
        onSave={handleSaveTask}
        users={usersList}
        initialData={taskState.task}
      />
      <Dialog
        open={deleteState.isOpen}
        onClose={() => setDeleteState({ isOpen: false, lead: null })}
        className="relative z-[1000]"
      >
        <DialogBackdrop className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md">
              <div className="bg-white rounded-2xl p-6 shadow-2xl border border-slate-100 relative">
                <button onClick={() => setDeleteState({ isOpen: false, lead: null })}
                  className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-all">
                  <X size={18} />
                </button>
                <div className="text-center mb-6">
                  <div className="w-14 h-14 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-4">
                    <Trash2 className="w-7 h-7 text-rose-500" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-800 mb-2">Delete Lead</h2>
                  <p className="text-sm text-slate-500">
                    Are you sure you want to delete{" "}
                    <span className="font-bold text-slate-800">
                      {deleteState.lead ? `${deleteState.lead.firstName} ${deleteState.lead.lastName}` : ''}
                    </span>?
                    This action cannot be undone.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setDeleteState({ isOpen: false, lead: null })}
                    className="flex-1 bg-slate-100 text-slate-700 font-semibold py-2.5 rounded-xl hover:bg-slate-200 transition-all text-sm">
                    Cancel
                  </button>
                  <button onClick={handleConfirmDelete}
                    className="flex-1 bg-rose-500 text-white font-semibold py-2.5 rounded-xl hover:bg-rose-600 transition-all text-sm">
                    Delete Lead
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
