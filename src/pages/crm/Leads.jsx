import React, { useState, useMemo, useEffect } from 'react';
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
  Send
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
const StatCard = ({
  icon: Icon,
  title,
  value,
  color = "blue",
  loading = false,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      className="relative overflow-hidden rounded-2xl p-3 lg:p-3 xl:p-5 bg-white/90 backdrop-blur-lg border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300"
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${color === "blue"
            ? "from-[#2E3D99]/5 to-[#1D97D7]/10"
            : color === "green"
              ? "from-emerald-500/5 to-teal-500/10"
              : color === "purple"
                ? "from-violet-500/5 to-purple-500/10"
                : "from-amber-500/5 to-orange-500/10"
          }`}
      />
      <div
        className={`absolute top-0 right-0 w-24 h-24 rounded-full -translate-y-8 translate-x-8 opacity-10 bg-gradient-to-r ${color === "blue"
            ? "from-[#2E3D99] to-[#1D97D7]"
            : color === "green"
              ? "from-emerald-500 to-teal-500"
              : color === "purple"
                ? "from-violet-500 to-purple-500"
                : "from-amber-500 to-orange-500"
          }`}
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className={`p-2 lg:p-2 xl:p-3 rounded-xl bg-gradient-to-br ${color === "blue"
                ? "from-[#2E3D99]/20 to-[#1D97D7]/30"
                : color === "green"
                  ? "from-emerald-500/20 to-teal-500/30"
                  : color === "purple"
                    ? "from-violet-500/20 to-purple-500/30"
                    : "from-amber-500/20 to-orange-500/30"
              }`}
          >
            <Icon
              className={`w-4 h-4 lg:w-4 lg:h-4 xl:w-5 xl:h-6 ${color === "blue"
                  ? "text-[#2E3D99]"
                  : color === "green"
                    ? "text-emerald-600"
                    : color === "purple"
                      ? "text-violet-600"
                      : "text-amber-600"
                }`}
            />
          </motion.div>
        </div>

        <div className="space-y-0.5 lg:space-y-0.5 xl:space-y-1">
          <h3 className="text-[10px] lg:text-[10px] xl:text-sm font-medium text-gray-500 uppercase tracking-wide">
            {title}
          </h3>
          {loading ? (
            <div className="h-6 lg:h-6 xl:h-8 w-16 lg:w-16 xl:w-20 bg-gray-200 animate-pulse rounded-lg" />
          ) : (
            <p className="text-lg lg:text-lg xl:text-2xl font-bold text-gray-900">{value}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
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

// --- LEAD FORM MODAL ---
function LeadFormModal({ isOpen, onClose, onSave, initialData }) {
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', company: '', role: '', email: '', phone: '', notes: '', status: 'New'
  });
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setIsSubmitting(false);
      if (initialData) {
        setFormData({ ...initialData });
      } else {
        setFormData({
          firstName: '', lastName: '', company: '', role: '', email: '', phone: '', notes: '', status: 'New'
        });
      }
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.company) return;
    setIsSubmitting(true);
    try {
      await onSave({
        ...(initialData || {}),
        ...formData
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalTitle = initialData ? 'Edit Lead' : 'Create New Lead';

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-[9999]">
      <DialogBackdrop transition className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200" />
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
          <DialogPanel transition className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 sm:my-8 sm:w-full sm:max-w-lg">
            <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4 border-b border-slate-100">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-slate-900">{modalTitle}</h3>
                <button type="button" onClick={onClose} className="text-slate-400 hover:bg-slate-100 hover:text-slate-600 p-1.5 rounded-lg transition-colors"><X size={18} /></button>
              </div>
              <form id="lead-form" onSubmit={handleSubmit} className="space-y-4">

                {/* STEP INDICATOR */}
                <div className="flex items-center justify-center mb-6">
                  {/* Step 1 */}
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step >= 1 ? 'bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white shadow-md shadow-[#2E3D99]/30' : 'bg-slate-200 text-slate-500'}`}>1</div>
                    <span className={`text-[11px] mt-1.5 font-semibold ${step >= 1 ? 'text-[#1D97D7]' : 'text-slate-400'}`}>Basic Info</span>
                  </div>
                  {/* Connector */}
                  <div className={`h-0.5 w-20 mx-2 mb-5 rounded-full transition-colors ${step >= 2 ? 'bg-gradient-to-r from-[#2E3D99] to-[#1D97D7]' : 'bg-slate-200'}`}></div>
                  {/* Step 2 */}
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step >= 2 ? 'bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white shadow-md shadow-[#2E3D99]/30' : 'bg-slate-200 text-slate-500'}`}>2</div>
                    <span className={`text-[11px] mt-1.5 font-semibold ${step >= 2 ? 'text-[#1D97D7]' : 'text-slate-400'}`}>Lead Details</span>
                  </div>
                </div>

                {step === 1 && (
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">First Name</label>
                        <input required type="text" value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2E3D99]/50" placeholder="Jane" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Last Name</label>
                        <input required type="text" value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2E3D99]/50" placeholder="Doe" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Company</label>
                      <input required type="text" value={formData.company} onChange={e => setFormData({ ...formData, company: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2E3D99]/50" placeholder="e.g. Tutur" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Enquiry Title</label>
                      <input required type="text" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2E3D99]/50" placeholder="e.g. Conveyancing module enquiry" />
                    </div>
                    {initialData && (
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
                        <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2E3D99]/50 bg-white">
                          <option value="New">New</option>
                          <option value="Open">Open</option>
                          <option value="Contacted">Contacted</option>
                          <option value="Qualified">Qualified</option>
                          <option value="Closed">Closed</option>
                          <option value="Unqualified">Unqualified</option>
                        </select>
                      </div>
                    )}
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Email</label>
                        <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2E3D99]/50" placeholder="jane@example.com" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Phone</label>
                        <input type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2E3D99]/50" placeholder="8122970891" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Description</label>
                      <textarea rows="3" value={formData.notes || ''} onChange={e => setFormData({ ...formData, notes: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2E3D99]/50 resize-none" placeholder="Provide extra background..."></textarea>
                    </div>
                  </motion.div>
                )}
              </form>
            </div>
            <div className="bg-slate-50 px-4 py-4 sm:flex sm:flex-row-reverse sm:px-6">
              {step === 1 ? (
                <button type="button" onClick={(e) => {
                  e.preventDefault();
                  if (!formData.firstName || !formData.lastName || !formData.company) {
                    alert("Please fill in first name, last name, and company.");
                    return;
                  }
                  setStep(2);
                }} className="inline-flex w-full justify-center rounded-xl bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#2E3D99]/20 hover:opacity-90 sm:ml-3 sm:w-auto transition-opacity">
                  Next Step
                </button>
              ) : (
                <button 
                  type="submit" 
                  form="lead-form" 
                  disabled={isSubmitting}
                  className="inline-flex w-full justify-center items-center gap-2 rounded-xl bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#2E3D99]/20 hover:opacity-90 disabled:opacity-50 sm:ml-3 sm:w-auto transition-opacity"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    initialData ? 'Save Changes' : 'Create Lead'
                  )}
                </button>
              )}

              {step === 2 && (
                <button type="button" onClick={() => setStep(1)} className="mt-3 inline-flex w-full justify-center rounded-xl bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 sm:mt-0 sm:ml-3 sm:w-auto transition-colors">
                  Back
                </button>
              )}

              <button type="button" onClick={onClose} className="mt-3 inline-flex w-full justify-center rounded-xl bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 sm:mt-0 sm:w-auto transition-colors">
                Cancel
              </button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
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
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-300"
                      placeholder="8122970891"
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
    <Dialog open={isOpen} onClose={onClose} className="relative z-[9999]">
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
    <Dialog open={isOpen} onClose={onClose} className="relative z-[9999]">
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

  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentMobilePageData, setCurrentMobilePageData] = useState([]);

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
        const nameParts = lead.fullName ? lead.fullName.trim().split(/\s+/) : [""];
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";
        const assignedUser = allUsers.find(u => (u.id || u._id) === lead.assignedTo);
        return {
          id: lead._id,
          firstName,
          lastName,
          company: lead.companyName || "",
          role: lead.title || "",
          email: lead.email || "",
          phone: lead.phone || "",
          notes: lead.description || "",
          status: lead.status || "New",
          address: lead.address || "",
          assignedTo: lead.assignedTo || "",
          assignedToName: assignedUser ? (assignedUser.displayName || assignedUser.email) : "Unassigned",
          source: lead.source || "Manual",
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
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">{lead.role}</p>
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
      setSelectedLead(lead);
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

        const originalTitle = original.role || "";
        const newTitle = leadData.role || "";
        if (newTitle !== originalTitle) {
          updatedFields.title = newTitle;
        }

        const originalDesc = original.notes || "";
        const newDesc = leadData.notes || "";
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

        // Only call update API if there's at least one updated field
        if (Object.keys(updatedFields).length > 0) {
          await crmAPI.updateLead(original.id, updatedFields);
          toast.success("Lead updated successfully!");
          fetchLeads();
        } else {
          toast.info("No changes were made.");
        }
      } else {
        const leadPayload = {
          title: leadData.role || "Lead Enquiry",
          description: leadData.notes || "",
          fullName: `${leadData.firstName} ${leadData.lastName}`.trim(),
          email: leadData.email || "",
          phone: leadData.phone || "",
          companyName: leadData.company || "",
          assignedTo: leadData.assignedTo || ""
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

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      // Search Match
      const matchesSearch = searchQuery
        ? `${lead.firstName} ${lead.lastName} ${lead.company} ${lead.email}`.toLowerCase().includes(searchQuery.toLowerCase())
        : true;

      // Status Filter
      const matchesStatus = filters.status === 'All' || lead.status === filters.status;

      return matchesSearch && matchesStatus;
    });
  }, [leads, searchQuery, filters]);

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

  // Floating circles background helper
  const FloatingElement = ({ top, left, delay, size = 60 }) => (
    <motion.div
      className="absolute rounded-full bg-gradient-to-r from-[#2E3D99]/10 to-[#1D97D7]/20 opacity-20 hidden sm:block"
      style={{ width: size, height: size, top: `${top}%`, left: `${left}%` }}
      animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
      transition={{ duration: 3 + delay, repeat: Infinity, ease: "easeInOut" }}
    />
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#2E3D99]/5 to-[#1D97D7]/10 relative overflow-hidden">
      {/* Background floating elements and grid from ManageUsers */}
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

      <div className="relative z-10 max-w-full">
        <Header />

        <main className="p-3 sm:p-4 md:p-6 px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 w-full max-w-full">

          {/* Top Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 lg:mb-4 xl:mb-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-base sm:text-lg lg:text-lg xl:text-xl 2xl:text-2xl font-bold text-gray-900 truncate">
                  <span className="bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] bg-clip-text text-transparent">
                    Lead Management
                  </span>
                </h1>
                <p className="text-gray-600 text-[10px] sm:text-xs lg:text-xs xl:text-sm mt-1 truncate">
                  Manage and track your business leads and potential partners
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                {/* Filters Button */}
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-2 px-3 lg:px-2.5 xl:px-4 py-2 lg:py-1.5 xl:py-3 rounded-xl text-[10px] lg:text-[9px] xl:text-sm font-bold transition-all border shadow-sm ${filters.status !== 'All'
                        ? 'bg-[#2E3D99]/10 border-[#2E3D99] text-[#2E3D99]'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                  >
                    <Filter size={15} />
                    <span>Filters</span>
                    {filters.status !== 'All' && (
                      <span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
                    )}
                  </motion.button>

                  <AnimatePresence>
                    {showFilters && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute left-0 lg:left-auto lg:right-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 z-50"
                      >
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Filter by Status</h4>
                        <select
                          value={filters.status}
                          onChange={e => setFilters({ ...filters, status: e.target.value })}
                          className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2E3D99]/50 bg-white"
                        >
                          <option value="All">All</option>
                          <option value="New">New</option>
                          <option value="Open">Open</option>
                          <option value="Contacted">Contacted</option>
                          <option value="Qualified">Qualified</option>
                          <option value="Closed">Closed</option>
                          <option value="Unqualified">Unqualified</option>
                        </select>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Add Lead Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFormState({ isOpen: true, lead: null })}
                  className="flex items-center gap-1 lg:gap-1 sm:gap-2 px-3 lg:px-2.5 xl:px-4 py-2 lg:py-1.5 xl:py-3 bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white rounded-xl font-semibold text-[10px] lg:text-[9px] xl:text-sm shadow-lg hover:shadow-xl transition-all whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Lead</span>
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* STATS SECTION */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 w-full">
            <StatCard icon={Users} title="Total Leads" value={leads.length} color="blue" loading={loading} />
            <StatCard icon={UserPlus} title="Active / Open" value={leads.filter(c => ["New", "Open", "Contacted", "Qualified"].includes(c.status)).length} color="green" loading={loading} />
            <StatCard icon={UserX} title="Converted / Won" value={leads.filter(c => c.status === 'Converted').length} color="purple" loading={loading} />
            <StatCard icon={Building2} title="Companies" value={new Set(leads.map(c => c.company).filter(Boolean)).size} color="orange" loading={loading} />
          </div>

              {/* DESKTOP TABLE SECTION */}
              <div className="hidden lg:block bg-white/90 backdrop-blur-lg border border-white/50 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 w-full max-w-full">
                <div className="p-4 lg:p-5 xl:p-8">
                  <Table
                    data={sortedLeads}
                    columns={columns}
                    showActions={false}
                    onEdit={(lead) => handleLeadClick(lead, true)}
                    onDelete={handleDeleteLead}
                    OnEye={(lead) => handleLeadClick(lead, false)}
                    showReset={false}
                    sortedColumn={sortConfig.key}
                    sortDirection={sortConfig.direction}
                    handleSort={handleSort}
                    headerBgColor="bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white"
                    itemsPerPage={5}
                    compact={true}
                    hideActionLabels={true}
                    isLoading={loading}
                  />
                </div>
              </div>

              {/* MOBILE/TABLET CARD SECTION */}
              <div className="lg:hidden space-y-4 w-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {loading ? (
                    <div className="col-span-full flex justify-center items-center h-32">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2E3D99]"></div>
                    </div>
                  ) : currentMobilePageData.length === 0 ? (
                    <div className="col-span-full text-center py-8 text-gray-500 font-medium">
                      No leads available
                    </div>
                  ) : currentMobilePageData.map((lead) => {
                    const initials = `${lead.firstName[0] || ''}${lead.lastName[0] || ''}`.toUpperCase();
                    return (
                      <motion.div
                        key={lead.id}
                        whileHover={{ y: -4 }}
                        className="bg-white/90 backdrop-blur-lg border border-white/50 rounded-2xl p-4 sm:p-5 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden"
                      >
                        <div className="flex justify-between items-start space-x-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-full bg-[#2E3D99]/10 text-[#2E3D99] flex items-center justify-center font-bold text-sm border border-[#2E3D99]/20 shrink-0">
                              {initials}
                            </div>
                            <div className="min-w-0">
                              <h3 className="text-sm font-bold text-gray-800 truncate">
                                {lead.firstName} {lead.lastName}
                              </h3>
                              <p className="text-[11px] text-gray-400 font-semibold truncate">
                                {lead.role || "No Role"}
                              </p>
                            </div>
                          </div>
                          <select
                            value={lead.status}
                            onChange={async (e) => {
                              const newStatus = e.target.value;
                              if (newStatus === lead.status) return;

                              // Optimistically update
                              setLeads(prev => prev.map(c => c.id === lead.id ? { ...c, status: newStatus } : c));

                              try {
                                await crmAPI.updateLeadStatus(lead.id, newStatus);
                                toast.success(`Lead status updated to ${newStatus}`);
                                fetchLeads();
                              } catch (err) {
                                console.error("Failed to update status", err);
                                toast.error(err.message || "Failed to update status");
                                fetchLeads();
                              }
                            }}
                            className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#2E3D99]/40 pr-5 appearance-none bg-no-repeat ${lead.status === 'New' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                                lead.status === 'Open' ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' :
                                  lead.status === 'Contacted' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                                    lead.status === 'Qualified' ? 'bg-teal-100 text-teal-800 border border-teal-200' :
                                      lead.status === 'Converted' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                                        lead.status === 'Closed' ? 'bg-slate-100 text-slate-800 border border-slate-200' :
                                          'bg-rose-100 text-rose-800 border border-rose-200'
                              }`}
                            style={{
                              backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%234B5563' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                              backgroundPosition: 'right 0.15rem center',
                              backgroundSize: '1em 1em',
                              paddingRight: '1.2rem'
                            }}
                          >
                            <option value="New">New</option>
                            <option value="Open">Open</option>
                            <option value="Contacted">Contacted</option>
                            <option value="Qualified">Qualified</option>
                            <option value="Closed">Closed</option>
                            <option value="Unqualified">Unqualified</option>
                          </select>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-100/50 space-y-2.5">
                          <div className="flex items-center gap-2.5 text-xs text-gray-600">
                            <Building2 size={14} className="text-[#2E3D99]/70 shrink-0" />
                            <span className="font-semibold text-gray-700 truncate">{lead.company}</span>
                          </div>
                          <div className="flex items-center gap-2.5 text-xs text-gray-600">
                            <Mail size={14} className="text-[#1D97D7] shrink-0" />
                            <a href={`mailto:${lead.email}`} className="hover:underline text-gray-700 font-medium truncate">
                              {lead.email}
                            </a>
                          </div>
                          <div className="flex items-center gap-2.5 text-xs text-gray-600">
                            <Phone size={14} className="text-[#1D97D7] shrink-0" />
                            <a href={`tel:${lead.phone}`} className="hover:underline text-gray-700 font-medium truncate">
                              {lead.phone}
                            </a>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-gray-100/50 flex justify-end items-center gap-2 flex-wrap">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleLeadClick(lead, false)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2E3D99]/5 text-[#2E3D99] rounded-lg font-bold text-xs hover:bg-[#2E3D99]/10 transition-colors"
                          >
                            <span>View</span>
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleLeadClick(lead, true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg font-bold text-xs hover:bg-blue-100 transition-colors"
                          >
                            <Edit size={12} />
                            <span>Edit</span>
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDeleteLead(lead)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-600 rounded-lg font-bold text-xs hover:bg-rose-100 transition-colors"
                          >
                            <Trash2 size={12} />
                            <span>Delete</span>
                          </motion.button>
                          {lead.status !== 'Converted' && (
                            <>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setConvertState({ isOpen: true, lead })}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg font-bold text-xs hover:bg-emerald-100 transition-colors"
                              >
                                <ArrowRightLeft size={12} />
                                <span>Convert</span>
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setAssignState({ isOpen: true, lead })}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 text-violet-700 rounded-lg font-bold text-xs hover:bg-violet-100 transition-colors"
                              >
                                <UserCheck size={12} />
                                <span>Assign</span>
                              </motion.button>
                            </>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                <Pagination
                  data={sortedLeads}
                  itemsPerPage={5}
                  setCurrentData={setCurrentMobilePageData}
                />
              </div>

        </main>
      </div>

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

      {/* Custom Delete Dialog */}
      <Dialog
        open={deleteState.isOpen}
        onClose={() => setDeleteState({ isOpen: false, lead: null })}
        className="relative z-[1000]"
      >
        <DialogBackdrop className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-md"
            >
              <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/50 relative">
                <button
                  onClick={() => setDeleteState({ isOpen: false, lead: null })}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-all font-semibold"
                >
                  &times;
                </button>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 flex items-center justify-center mx-auto mb-4">
                    <Trash2 className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800 mb-2">
                    Delete Lead
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Are you sure you want to delete <span className="font-bold text-gray-900">{deleteState.lead ? `${deleteState.lead.firstName} ${deleteState.lead.lastName}` : ''}</span>? This action cannot be undone.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteState({ isOpen: false, lead: null })}
                    className="flex-1 bg-slate-100 text-slate-700 font-semibold py-2.5 rounded-xl hover:bg-slate-200 transition-all cursor-pointer text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmDelete}
                    className="flex-1 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold py-2.5 rounded-xl hover:shadow-lg transition-all cursor-pointer text-sm"
                  >
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
