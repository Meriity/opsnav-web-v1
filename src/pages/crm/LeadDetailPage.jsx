import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft, Edit, UserCheck, Clock, Calendar, DollarSign,
  Tag, Building2, User, Phone, Mail, ExternalLink, CheckCircle2,
  Plus, Send, Loader2, StickyNote, Trash2,
  Activity, ListTodo, Paperclip, MapPin, ChevronRight,
  Link2, LayoutGrid, GitBranch, ArrowRightLeft, MoveRight, AlertCircle
} from "lucide-react";
import Header from "../../components/layout/Header";
import crmAPI from "../../api/crmAPI";
import AdminAPI from "../../api/adminAPI";
import { toast } from "react-toastify";
import moment from "moment";
import { motion, AnimatePresence } from "framer-motion";
import ConfirmationModal from "../../components/ui/ConfirmationModal";

// ─── Stage Config ─────────────────────────────────────────────────────────────
const PIPELINE_STAGES = [
  {
    key: "New Lead", label: "New Lead",
    dot: "bg-blue-500",
    badge: "bg-blue-100 text-blue-700 border border-blue-200",
    hasValue: false,
  },
  {
    key: "Qualified Lead", label: "Qualified",
    dot: "bg-teal-500",
    badge: "bg-teal-100 text-teal-700 border border-teal-200",
    hasValue: false,
  },
  {
    key: "Opportunity", label: "Opportunity",
    dot: "bg-violet-500",
    badge: "bg-violet-100 text-violet-700 border border-violet-200",
    hasValue: true,
  },
  {
    key: "Proposal", label: "Proposal",
    dot: "bg-indigo-500",
    badge: "bg-indigo-100 text-indigo-700 border border-indigo-200",
    hasValue: true,
  },
  {
    key: "Negotiation", label: "Negotiation",
    dot: "bg-amber-500",
    badge: "bg-amber-100 text-amber-700 border border-amber-200",
    hasValue: true,
  },
  {
    key: "Won", label: "Won",
    dot: "bg-emerald-500",
    badge: "bg-emerald-100 text-emerald-700 border border-emerald-200",
    hasValue: true,
  },
  {
    key: "Lost", label: "Lost",
    dot: "bg-rose-500",
    badge: "bg-rose-100 text-rose-700 border border-rose-200",
    hasValue: true,
  },
];

const PROPOSAL_STATUS_BADGE = {
  Draft:               "bg-slate-100 text-slate-600 border border-slate-200",
  Sent:                "bg-emerald-100 text-emerald-700 border border-emerald-200",
  "Follow-up Required":"bg-amber-100 text-amber-700 border border-amber-200",
  Accepted:            "bg-blue-100 text-blue-700 border border-blue-200",
  Rejected:            "bg-rose-100 text-rose-700 border border-rose-200",
};

const PRIORITY_BADGE = {
  High:   "bg-rose-100 text-rose-700 border border-rose-200",
  Medium: "bg-amber-100 text-amber-700 border border-amber-200",
  Low:    "bg-slate-100 text-slate-600 border border-slate-200",
};

const normalizeStage = (status = "") => {
  const map = {
    "new": "New Lead", "open": "New Lead", "new lead": "New Lead",
    "contacted": "Qualified Lead", "qualified": "Qualified Lead", "qualified lead": "Qualified Lead",
    "opportunity": "Opportunity",
    "proposal": "Proposal",
    "negotiation": "Negotiation",
    "won": "Won", "converted": "Won",
    "lost": "Lost", "closed": "Lost", "unqualified": "Lost",
  };
  return map[status.toLowerCase()] ?? "New Lead";
};

const getStageIndex = (status) =>
  PIPELINE_STAGES.findIndex(s => s.key === normalizeStage(status));

// ─── Stage Badge ──────────────────────────────────────────────────────────────
function StageBadge({ stage }) {
  const cfg = PIPELINE_STAGES.find(s => s.key === normalizeStage(stage));
  if (!cfg) return null;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${cfg.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

// ─── Lead Pipeline Stepper ────────────────────────────────────────────────────
function LeadPipeline({ currentStage, commercialValue, onStageClick }) {
  const activeIdx = getStageIndex(currentStage);

  const VALUE_LABELS = {
    "Opportunity": commercialValue ? `$${Number(commercialValue).toLocaleString()}` : "$0",
    "Proposal":    commercialValue ? `$${Number(commercialValue).toLocaleString()}` : "$0",
    "Negotiation": commercialValue ? `$${Number(commercialValue).toLocaleString()}` : "$0",
    "Won":         commercialValue ? `$${Number(commercialValue).toLocaleString()}` : "$0",
    "Lost":        "$0",
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <GitBranch size={15} className="text-[#2E3D99]" />
          Lead Pipeline
        </h3>
        <span className="text-[10px] text-slate-400 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
          Click a stage to update
        </span>
      </div>

      {/* Pipeline Container (Scrollable on mobile) */}
      <div className="overflow-x-auto pb-4">
        <div className="min-w-[600px]">
          {/* Value labels row */}
          <div className="flex items-center justify-between mb-1 px-0">
            {PIPELINE_STAGES.map((stage) => (
              <div key={stage.key + "-val"} className="flex-1 flex flex-col items-center">
                {stage.hasValue ? (
                  <div className="text-center">
                    <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wide">
                      {stage.label} Value
                    </p>
                    <p className={`text-xs font-bold mt-0.5 ${activeIdx >= PIPELINE_STAGES.findIndex(s => s.key === stage.key) ? "text-slate-700" : "text-slate-200"}`}>
                      {VALUE_LABELS[stage.key] || "—"}
                    </p>
                  </div>
                ) : <div />}
              </div>
            ))}
          </div>

      {/* Stepper */}
      <div className="relative flex items-center justify-between mt-3">
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-100 -translate-y-1/2 z-0" />
        {PIPELINE_STAGES.map((stage, idx) => {
          const isPast    = idx < activeIdx;
          const isCurrent = idx === activeIdx;
          const isFuture  = idx > activeIdx;
          return (
            <div
              key={stage.key}
              className="relative z-10 flex flex-col items-center gap-2 flex-1 cursor-pointer group"
              onClick={() => onStageClick?.(stage.key)}
            >
              <div className={`
                w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all duration-200
                ${isCurrent
                  ? `${stage.dot} border-white shadow-lg ring-2 ring-offset-2 ring-opacity-40 scale-110`
                  : isPast
                    ? `${stage.dot} border-white opacity-90`
                    : "bg-white border-slate-200 group-hover:border-slate-300"
                }
              `}>
                {isPast && (
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {isCurrent && <span className="w-2.5 h-2.5 rounded-full bg-white" />}
                {isFuture && <span className="w-2 h-2 rounded-full bg-slate-200 group-hover:bg-slate-300" />}
              </div>
              <span className={`text-[10px] font-bold text-center leading-tight ${
                isCurrent ? "text-slate-800" : isPast ? "text-slate-500" : "text-slate-300 group-hover:text-slate-400"
              }`}>
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>
        </div>
      </div>
    </div>
  );
}

// ─── Deal Tracker ─────────────────────────────────────────────────────────────
function DealTracker({ isTracked, currentStage, lead, onToggle, className }) {
  const DEAL_COLS = [
    { key: "Proposal",    label: "Proposal",    color: "bg-indigo-500", border: "border-indigo-300",  light: "bg-indigo-50/60" },
    { key: "Negotiation", label: "Negotiation", color: "bg-amber-500",  border: "border-amber-300",   light: "bg-amber-50/60" },
    { key: "Closed Won",  label: "Closed Won",  color: "bg-emerald-500",border: "border-emerald-300", light: "bg-emerald-50/60" },
    { key: "Closed Lost", label: "Closed Lost", color: "bg-rose-500",   border: "border-rose-300",    light: "bg-rose-50/60" },
  ];

  const normalised = normalizeStage(currentStage);
  // Map pipeline stage → deal column
  const dealColKey =
    normalised === "Proposal"    ? "Proposal"    :
    normalised === "Negotiation" ? "Negotiation" :
    normalised === "Won"         ? "Closed Won"  :
    normalised === "Lost"        ? "Closed Lost" :
    "Proposal";

  const displayId = lead?.leadId || (lead?.id ? `LD-${lead.id.slice(-4).toUpperCase()}` : "LD-XXXX");
  const service   = lead?.role || "Lead";
  const value     = lead?.commercialValue ? `$${Number(lead.commercialValue).toLocaleString()}` : "$0";
  const owner     = lead?.assignedToName || "Unassigned";
  const estClose  = lead?.expectedCloseDate ? moment(lead.expectedCloseDate).format("DD/MM/YYYY") : "—";

  return (
    <div className={className || "bg-white rounded-2xl border border-slate-100 shadow-sm p-5"}>
      {/* Header */}
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
        <div className="flex items-start md:items-center gap-2">
          <h3 className="text-sm font-bold text-slate-800 shrink-0">Deal Tracker</h3>
          <span className="hidden md:flex w-4 h-4 rounded-full bg-slate-100 text-slate-400 items-center justify-center text-[10px] cursor-help shrink-0" title="This lead is optionally tracked as a deal in the sales pipeline.">i</span>
          <span className="text-xs text-slate-400 leading-snug">This lead is optionally tracked as a deal in the sales pipeline.</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Tracked as Deal:</span>
            <button
              onClick={onToggle}
              className={`relative w-10 h-5 rounded-full transition-colors shrink-0 ${isTracked ? "bg-emerald-500" : "bg-slate-200"}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${isTracked ? "translate-x-5" : ""}`} />
            </button>
            <span className={`text-xs font-bold shrink-0 ${isTracked ? "text-emerald-600" : "text-slate-400"}`}>
              {isTracked ? "Yes" : "No"}
            </span>
          </div>
          {isTracked && (
            <span className="text-xs text-slate-400 hidden sm:block">Deal stages sync with lead stages automatically.</span>
          )}
        </div>
      </div>

      {/* Deal board */}
      <AnimatePresence>
        {isTracked && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-x-auto hide-scrollbar pb-2"
          >
            <div className="grid grid-cols-4 gap-0 border border-slate-200 rounded-xl overflow-hidden min-w-[650px]">
              {DEAL_COLS.map((col, i) => {
                const isActive = col.key === dealColKey && isTracked;
                return (
                  <div
                    key={col.key}
                    className={`${i !== 0 ? "border-l border-slate-200" : ""} ${isActive ? col.light : "bg-slate-50/40"}`}
                  >
                    {/* Column header */}
                    <div className={`px-3 py-2 border-b ${isActive ? col.border : "border-slate-200"} flex items-center gap-1.5`}>
                      <span className={`w-2 h-2 rounded-full ${col.color}`} />
                      <span className="text-[11px] font-bold text-slate-700">{col.label}</span>
                    </div>

                    {/* Column body */}
                    <div className="p-2.5 min-h-[130px]">
                      {isActive ? (
                        <div className={`bg-white rounded-lg border ${col.border} shadow-sm p-3`}>
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-[11px] font-bold text-slate-700 leading-tight">
                              {displayId} · {service}
                            </p>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                              PIPELINE_STAGES.find(s => s.key === normalised)?.badge || "bg-slate-100 text-slate-600"
                            }`}>
                              {normalised}
                            </span>
                          </div>
                          <div className="space-y-1 text-[10px] text-slate-500">
                            <div className="flex justify-between">
                              <span>Value</span>
                              <span className="font-bold text-slate-700">{value}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Owner</span>
                              <span className="font-bold text-slate-700">{owner}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Est. Close</span>
                              <span className="font-bold text-slate-700">{estClose}</span>
                            </div>
                          </div>
                          <button className="mt-2.5 flex items-center gap-1 text-[10px] font-bold text-[#1D97D7] hover:underline">
                            View Deal <ExternalLink size={10} />
                          </button>
                        </div>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center gap-1.5 py-6">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                            {col.key === "Closed Won" ? (
                              <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
                              </svg>
                            ) : col.key === "Closed Lost" ? (
                              <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                              </svg>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-300 font-medium">No deals</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────
function OverviewTab({ lead, leadId, users, taskCount, onTaskCountChange, onSwitchToTasks }) {
  const leadAge = lead?.createdAt
    ? `${moment().diff(moment(lead.createdAt), "days")} days`
    : "—";

  const [tasks, setTasks]           = useState([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [showAddTask, setShowAddTask]   = useState(false);
  const [submitting, setSubmitting]     = useState(false);
  const [form, setForm] = useState({ title: "", description: "", assignedTo: "", dueDate: "" });

  const loadTasks = useCallback(async () => {
    if (!leadId) return;
    setTasksLoading(true);
    try {
      const res  = await crmAPI.getTasksForLead(leadId);
      const list = Array.isArray(res) ? res : (res.data || res.tasks || []);
      setTasks(list);
      onTaskCountChange?.(list.length);
    } catch { /* silent */ }
    finally { setTasksLoading(false); }
  }, [leadId]);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!form.title || !form.dueDate) return;
    setSubmitting(true);
    try {
      await crmAPI.createTask(leadId, form);
      toast.success("Task created");
      setShowAddTask(false);
      setForm({ title: "", description: "", assignedTo: "", dueDate: "" });
      loadTasks();
    } catch { toast.error("Failed to create task"); }
    finally { setSubmitting(false); }
  };

  const handleToggle = async (task) => {
    const isComplete = task.status === "Completed" || task.status === "Done";
    const newStatus  = isComplete ? "Pending" : "Completed";
    setTasks(prev => prev.map(t => (t._id || t.id) === (task._id || task.id) ? { ...t, status: newStatus } : t));
    try { await crmAPI.editTask(task._id || task.id, { status: newStatus }); }
    catch { setTasks(prev => prev.map(t => (t._id || t.id) === (task._id || task.id) ? { ...t, status: task.status } : t)); }
  };

  const InfoRow = ({ label, value, badge }) => (
    <div className="flex items-center py-2.5 border-b border-slate-50 last:border-0">
      <span className="w-44 text-xs text-slate-400 font-medium shrink-0">{label}</span>
      {badge ? (
        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${badge}`}>{value}</span>
      ) : (
        <span className="text-xs font-semibold text-slate-700">{value || "—"}</span>
      )}
    </div>
  );

  const proposalBadge = lead?.proposalStatus
    ? PROPOSAL_STATUS_BADGE[lead.proposalStatus] || "bg-slate-100 text-slate-600"
    : null;

  return (
    <div className="space-y-0">
      {/* Lead Info + Proposal Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-5 border-b border-slate-100">
        {/* Lead Information */}
        <div>
          <h4 className="text-sm font-bold text-slate-800 mb-3">Lead Information</h4>
          <InfoRow label="Service Type"     value={lead?.role || "—"} />
          <InfoRow label="Created Date"     value={lead?.createdAt ? moment(lead.createdAt).format("DD/MM/YYYY") : "—"} />
          <InfoRow label="Created By"       value={lead?.assignedToName || "—"} />
          <InfoRow label="Last Activity"    value={lead?.updatedAt ? moment(lead.updatedAt).format("DD/MM/YYYY hh:mm A") : "—"} />
          <InfoRow label="Last Activity By" value={lead?.assignedToName || "—"} />
          <InfoRow label="Lead Age"         value={leadAge} />
        </div>

        {/* Proposal Information */}
        <div>
          <h4 className="text-sm font-bold text-slate-800 mb-3">Proposal Information</h4>
          <InfoRow
            label="Proposal Status"
            value={lead?.proposalStatus || "—"}
            badge={proposalBadge}
          />
          <InfoRow
            label="Proposal Sent Date"
            value={lead?.proposalSentDate ? moment(lead.proposalSentDate).format("DD/MM/YYYY") : "—"}
          />
          <InfoRow
            label="Follow-up Required"
            value={lead?.nextFollowUpDate ? "Yes" : "No"}
            badge={lead?.nextFollowUpDate
              ? "bg-amber-100 text-amber-700 border border-amber-200"
              : "bg-slate-100 text-slate-500"}
          />
          {lead?.priority && (
            <InfoRow label="Priority" value={lead.priority} badge={PRIORITY_BADGE[lead.priority]} />
          )}
          {lead?.source && <InfoRow label="Lead Source" value={lead.source} />}
          {lead?.address && <InfoRow label="Address"    value={lead.address} />}
        </div>
      </div>

      {/* ── Tasks & Follow-ups section ───────────────────────────────── */}
      <div className="pt-5">
        {/* Section header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-slate-800">Tasks &amp; Follow-ups</h4>
            {tasks.length > 0 && (
              <span className="min-w-[20px] h-5 px-1.5 bg-slate-100 text-slate-600 rounded-full text-[11px] font-bold flex items-center justify-center">
                {tasks.length}
              </span>
            )}
          </div>
          <button
            onClick={() => setShowAddTask(v => !v)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1D97D7] hover:text-[#2E3D99] transition-colors"
          >
            <Plus size={13} />
            Add Task
          </button>
        </div>

        {/* Inline add form */}
        <AnimatePresence>
          {showAddTask && (
            <motion.form
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              onSubmit={handleAddTask}
              className="mb-4 bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3"
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Task Title *</label>
                  <input required type="text" value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="e.g. Follow up on proposal"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E3D99]/30 bg-white" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Assign To</label>
                  <select value={form.assignedTo}
                    onChange={e => setForm(f => ({ ...f, assignedTo: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E3D99]/30 bg-white">
                    <option value="">Unassigned</option>
                    {users.map(u => <option key={u._id || u.id} value={u._id || u.id}>{u.displayName || u.email}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Due Date *</label>
                  <input required type="datetime-local" value={form.dueDate}
                    onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E3D99]/30 bg-white" />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowAddTask(false)}
                  className="px-4 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white text-xs font-bold rounded-lg hover:opacity-90 disabled:opacity-50">
                  {submitting ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                  Create
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Tasks list */}
        {tasksLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="w-5 h-5 text-[#2E3D99] animate-spin" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-slate-200 rounded-xl">
            <ListTodo size={24} className="mx-auto text-slate-200 mb-2" />
            <p className="text-sm text-slate-400">No tasks yet.</p>
            <button onClick={() => setShowAddTask(true)}
              className="mt-2 text-xs font-semibold text-[#1D97D7] hover:underline">
              + Add the first task
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {tasks.map(task => {
              const isComplete = task.status === "Completed" || task.status === "Done";
              const isOverdue  = task.dueDate && !isComplete && moment(task.dueDate).isBefore(moment());
              return (
                <div key={task._id || task.id}
                  className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all ${
                    isComplete ? "bg-slate-50 border-slate-100 opacity-60" : "bg-white border-slate-100 hover:border-slate-200 hover:shadow-sm"
                  }`}
                >
                  <input type="checkbox" checked={isComplete} onChange={() => handleToggle(task)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#2E3D99] focus:ring-[#2E3D99] cursor-pointer" />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${isComplete ? "line-through text-slate-400" : "text-slate-800"}`}>
                      {task.title}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-[10px] font-semibold">
                      {task.dueDate && (
                        <span className={`flex items-center gap-1 ${isOverdue ? "text-rose-500" : "text-slate-400"}`}>
                          <Clock size={10} />
                          {moment(task.dueDate).format("MMM D, h:mm A")}
                          {isOverdue && " · Overdue"}
                        </span>
                      )}
                      {task.assignedToName && (
                        <span className="flex items-center gap-1 text-slate-400">
                          <User size={10} />
                          {task.assignedToName}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isComplete ? "bg-emerald-100 text-emerald-700"
                      : isOverdue ? "bg-rose-100 text-rose-700"
                        : "bg-amber-100 text-amber-700"
                  }`}>
                    {isComplete ? "Done" : isOverdue ? "Overdue" : "Pending"}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Tasks & Follow-ups Tab ───────────────────────────────────────────────────
function TasksTab({ leadId, users, onCountChange }) {
  const [tasks, setTasks]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", assignedTo: "", dueDate: "", reminderDate: ""
  });

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await crmAPI.getTasksForLead(leadId);
      const list = Array.isArray(res) ? res : (res.data || res.tasks || []);
      setTasks(list);
      onCountChange?.(list.length);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [leadId]);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.title || !form.dueDate) return;
    setSubmitting(true);
    try {
      await crmAPI.createTask(leadId, form);
      toast.success("Task created");
      setShowForm(false);
      setForm({ title: "", description: "", assignedTo: "", dueDate: "", reminderDate: "" });
      loadTasks();
    } catch { toast.error("Failed to create task"); }
    finally { setSubmitting(false); }
  };

  const handleToggle = async (task) => {
    const isComplete = task.status === "Completed" || task.status === "Done";
    const newStatus  = isComplete ? "Pending" : "Completed";
    setTasks(prev => prev.map(t => (t._id || t.id) === (task._id || task.id) ? { ...t, status: newStatus } : t));
    try {
      await crmAPI.editTask(task._id || task.id, { status: newStatus });
    } catch {
      setTasks(prev => prev.map(t => (t._id || t.id) === (task._id || task.id) ? { ...t, status: task.status } : t));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-500">{tasks.length} task{tasks.length !== 1 ? "s" : ""}</p>
        <button
          onClick={() => setShowForm(v => !v)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#2E3D99] bg-[#2E3D99]/8 hover:bg-[#2E3D99]/15 rounded-lg transition-colors border border-[#2E3D99]/20"
        >
          <Plus size={13} />
          Add Task
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            onSubmit={handleAdd}
            className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3"
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Task Title *</label>
                <input required type="text" value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Follow up on proposal"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E3D99]/30 bg-white" />
              </div>
              <div className="col-span-2">
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Description</label>
                <textarea rows={2} value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E3D99]/30 bg-white resize-none" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Assign To</label>
                <select value={form.assignedTo}
                  onChange={e => setForm(f => ({ ...f, assignedTo: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E3D99]/30 bg-white">
                  <option value="">Unassigned</option>
                  {users.map(u => <option key={u._id || u.id} value={u._id || u.id}>{u.displayName || u.email}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Due Date *</label>
                <input required type="datetime-local" value={form.dueDate}
                  onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E3D99]/30 bg-white" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowForm(false)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">
                Cancel
              </button>
              <button type="submit" disabled={submitting}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white text-xs font-bold rounded-lg hover:opacity-90 disabled:opacity-50">
                {submitting ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                Create Task
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 text-[#2E3D99] animate-spin" /></div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-10">
          <ListTodo size={32} className="mx-auto text-slate-200 mb-2" />
          <p className="text-sm text-slate-400">No tasks yet. Create one above.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map(task => {
            const isComplete = task.status === "Completed" || task.status === "Done";
            const isOverdue  = task.dueDate && !isComplete && moment(task.dueDate).isBefore(moment());
            return (
              <div key={task._id || task.id}
                className={`flex items-start gap-3 p-4 rounded-xl border transition-all ${
                  isComplete ? "bg-slate-50 border-slate-100 opacity-60" : "bg-white border-slate-100 hover:border-slate-200 hover:shadow-sm"
                }`}
              >
                <input type="checkbox" checked={isComplete} onChange={() => handleToggle(task)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#2E3D99] focus:ring-[#2E3D99] cursor-pointer" />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold ${isComplete ? "line-through text-slate-400" : "text-slate-800"}`}>{task.title}</p>
                  {task.description && <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{task.description}</p>}
                  <div className="flex items-center gap-3 mt-1.5 text-[10px] font-semibold">
                    {task.dueDate && (
                      <span className={`flex items-center gap-1 ${isOverdue ? "text-rose-500" : "text-slate-400"}`}>
                        <Clock size={11} />
                        {moment(task.dueDate).format("MMM D, h:mm A")}
                        {isOverdue && " · Overdue"}
                      </span>
                    )}
                    {task.assignedToName && (
                      <span className="flex items-center gap-1 text-slate-400">
                        <User size={11} />
                        {task.assignedToName}
                      </span>
                    )}
                  </div>
                </div>
                <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isComplete ? "bg-emerald-100 text-emerald-700"
                    : isOverdue ? "bg-rose-100 text-rose-700"
                      : "bg-amber-100 text-amber-700"
                }`}>
                  {isComplete ? "Done" : isOverdue ? "Overdue" : "Pending"}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Notes & Activity Tab (combined) ─────────────────────────────────────────
function NotesActivityTab({ leadId, lead, onCountChange }) {
  const [notes, setNotes]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [newNote, setNewNote]         = useState("");
  const [visibility, setVisibility]   = useState("Team");
  const [submitting, setSubmitting]   = useState(false);
  const [editId, setEditId]           = useState(null);
  const [editContent, setEditContent] = useState("");
  const [deleteId, setDeleteId]       = useState(null);
  const [view, setView]               = useState("notes"); // "notes" | "activity"

  const loadNotes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await crmAPI.getNotes(leadId);
      const list = res.data || [];
      setNotes(list);
      onCountChange?.(list.length);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [leadId]);

  useEffect(() => { loadNotes(); }, [loadNotes]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setSubmitting(true);
    try {
      const res = await crmAPI.createNote({ relatedLeadId: leadId, note: newNote, visibility });
      setNotes(prev => [res.data, ...prev]);
      setNewNote("");
      onCountChange?.(notes.length + 1);
      toast.success("Note added");
    } catch { toast.error("Failed to add note"); }
    finally { setSubmitting(false); }
  };

  const handleUpdate = async () => {
    if (!editContent.trim()) return;
    try {
      await crmAPI.updateNote(editId, { note: editContent });
      setNotes(prev => prev.map(n => n._id === editId ? { ...n, note: editContent } : n));
      setEditId(null);
      toast.success("Note updated");
    } catch { toast.error("Failed to update note"); }
  };

  const handleDelete = async () => {
    try {
      await crmAPI.deleteNote(deleteId);
      const updated = notes.filter(n => n._id !== deleteId);
      setNotes(updated);
      onCountChange?.(updated.length);
      toast.success("Note deleted");
    } catch { toast.error("Failed to delete note"); }
    finally { setDeleteId(null); }
  };

  // Activity items derived from lead metadata
  const activities = [
    { label: "Lead created", time: lead?.createdAt, color: "bg-blue-100 text-blue-600" },
    lead?.assignedTo && { label: `Lead assigned to ${lead.assignedToName || "team member"}`, time: lead?.createdAt, color: "bg-violet-100 text-violet-600" },
    lead?.status && lead.status !== "New" && { label: `Stage updated to "${lead.status}"`, time: lead?.updatedAt, color: "bg-amber-100 text-amber-600" },
  ].filter(Boolean);

  return (
    <div className="space-y-4">
      {/* Sub-toggle */}
      <div className="flex gap-1 bg-slate-100 p-0.5 rounded-lg w-fit">
        {[{ key: "notes", label: "Notes" }, { key: "activity", label: "Activity" }].map(t => (
          <button key={t.key} onClick={() => setView(t.key)}
            className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
              view === t.key ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {view === "notes" ? (
        <>
          {/* Add note */}
          <form onSubmit={handleAdd} className="space-y-2">
            <textarea rows={3} value={newNote} onChange={e => setNewNote(e.target.value)}
              placeholder="Write a note about this lead..."
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-[#2E3D99]/30 focus:border-[#2E3D99]/50 resize-none bg-slate-50" />
            <div className="flex items-center justify-between">
              <select value={visibility} onChange={e => setVisibility(e.target.value)}
                className="text-xs font-semibold text-slate-500 bg-white border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#2E3D99]/20">
                <option value="Team">Team (Visible to all)</option>
                <option value="Private">Private (Only me)</option>
              </select>
              <button type="submit" disabled={!newNote.trim() || submitting}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white text-xs font-bold rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity">
                {submitting ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                Save Note
              </button>
            </div>
          </form>

          {/* Notes list */}
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 text-[#2E3D99] animate-spin" /></div>
          ) : notes.length === 0 ? (
            <div className="text-center py-8">
              <StickyNote size={28} className="mx-auto text-slate-200 mb-2" />
              <p className="text-sm text-slate-400">No notes yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notes.map(note => (
                <div key={note._id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
                  {editId === note._id ? (
                    <div className="space-y-2">
                      <textarea value={editContent} onChange={e => setEditContent(e.target.value)} rows={3}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2E3D99]/30 resize-none" />
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setEditId(null)} className="px-3 py-1 text-xs font-semibold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-lg">Cancel</button>
                        <button onClick={handleUpdate} className="px-3 py-1 text-xs font-semibold text-white bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] rounded-lg">Save</button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{note.note}</p>
                  )}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        note.visibility === "Private" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                      }`}>
                        {note.visibility || "Team"}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {note.createdBy?.displayName || "User"} · {moment(note.createdAt).format("MMM DD, h:mm A")}
                      </span>
                    </div>
                    {editId !== note._id && (
                      <div className="flex gap-1">
                        <button onClick={() => { setEditId(note._id); setEditContent(note.note); }}
                          className="p-1.5 text-slate-400 hover:text-[#1D97D7] hover:bg-blue-50 rounded-lg transition-colors">
                          <Edit size={13} />
                        </button>
                        <button onClick={() => setDeleteId(note._id)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        /* Activity timeline */
        <div className="relative">
          <div className="absolute left-5 top-5 bottom-0 w-px bg-slate-100" />
          <div className="space-y-4">
            {activities.map((a, i) => (
              <div key={i} className="relative flex items-start gap-4">
                <div className={`relative z-10 w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${a.color}`}>
                  <Activity size={16} />
                </div>
                <div className="flex-1 pt-2">
                  <p className="text-sm font-semibold text-slate-700">{a.label}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {a.time ? moment(a.time).format("MMM D YYYY, h:mm A") : "—"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Note"
        message="Are you sure you want to delete this note? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
      />
    </div>
  );
}

// ─── Files Tab ────────────────────────────────────────────────────────────────
function FilesTab({ onCountChange }) {
  useEffect(() => { onCountChange?.(0); }, []);
  return (
    <div className="text-center py-10">
      <Paperclip size={32} className="mx-auto text-slate-200 mb-2" />
      <p className="text-sm font-semibold text-slate-500">No files attached</p>
      <p className="text-xs text-slate-400 mt-1">File upload will be available soon.</p>
      <button className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 border border-dashed border-slate-300 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-50 transition-colors">
        <Plus size={13} />
        Upload File
      </button>
    </div>
  );
}

// ─── Contact Card ─────────────────────────────────────────────────────────────
function ContactCard({ lead, className }) {
  const name = lead ? `${lead.firstName || ""} ${lead.lastName || ""}`.trim() : "";
  const initials = name
    ? name.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase()
    : "?";

  return (
    <div className={className || "bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"}>
      <div className="px-4 py-3 border-b border-slate-50">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <User size={13} className="text-[#2E3D99]" />
          Contact
        </h4>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2E3D99] to-[#1D97D7] flex items-center justify-center text-white font-bold text-sm shadow">
            {initials}
          </div>
          <div>
            <p className="font-bold text-slate-800 text-sm leading-tight">{name || "—"}</p>
            <p className="text-xs text-slate-400">{lead?.role || "Contact"}</p>
            {lead?.isCustomer && (
              <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold">
                <CheckCircle2 size={9} />
                Customer
              </span>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          {lead?.phone && (
            <a href={`tel:${lead.phone}`}
              className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-100 hover:border-blue-100 transition-colors group">
              <Phone size={12} className="text-slate-400 group-hover:text-[#1D97D7]" />
              <span className="text-xs font-semibold text-slate-700 group-hover:text-[#1D97D7]">{lead.phone}</span>
            </a>
          )}
          {lead?.email && (
            <a href={`mailto:${lead.email}`}
              className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-100 hover:border-blue-100 transition-colors group">
              <Mail size={12} className="text-slate-400 group-hover:text-[#1D97D7]" />
              <span className="text-xs font-semibold text-slate-700 group-hover:text-[#1D97D7] truncate">{lead.email}</span>
            </a>
          )}
        </div>

        <button className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors">
          <ExternalLink size={12} />
          Open Contact
        </button>
      </div>
    </div>
  );
}

// ─── Company Card ─────────────────────────────────────────────────────────────
function CompanyCard({ lead, className }) {
  const company = lead?.company;
  if (!company) return null;

  const initials = company.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();

  return (
    <div className={className || "bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"}>
      <div className="px-4 py-3 border-b border-slate-50">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <Building2 size={13} className="text-[#2E3D99]" />
          Company
        </h4>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm border border-slate-200">
            {initials}
          </div>
          <div>
            <p className="font-bold text-slate-800 text-sm">{company}</p>
            {lead?.address && (
              <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                <MapPin size={10} />
                {lead.address}
              </p>
            )}
            {lead?.industry && (
              <p className="text-[10px] text-slate-400 mt-0.5">Industry: {lead.industry}</p>
            )}
          </div>
        </div>

        {lead?.website && (
          <a href={lead.website} target="_blank" rel="noreferrer"
            className="block text-xs font-semibold text-[#1D97D7] hover:underline mb-3 truncate">
            {lead.website}
          </a>
        )}

        <button className="w-full flex items-center justify-center gap-1.5 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors">
          <ExternalLink size={12} />
          Open Company
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function LeadDetailPage() {
  const { leadId } = useParams();
  const navigate   = useNavigate();
  const location   = useLocation();

  const [lead, setLead]           = useState(location.state?.lead || null);
  const [loading, setLoading]     = useState(!location.state?.lead);
  const [activeTab, setActiveTab] = useState("overview");
  const [users, setUsers]         = useState([]);
  const [isDealTracked, setIsDealTracked] = useState(false);

  // Tab counts
  const [taskCount, setTaskCount] = useState(0);
  const [noteCount, setNoteCount] = useState(0);
  const [fileCount, setFileCount] = useState(0);

  // Load users list
  useEffect(() => {
    const api = new AdminAPI();
    api.getAllUsers().then(res => setUsers(res.users || [])).catch(() => {});
  }, []);

  // Fetch lead from API
  const fetchLead = useCallback(async () => {
    if (!leadId) return;
    setLoading(true);
    try {
      const res = await crmAPI.getLeadById(leadId);
      const raw = res.lead || res.data || res;

      const nameParts = (raw.fullName || "").trim().split(/\s+/);
      const contactFirst = raw.contactId?.firstName || raw.firstName || nameParts[0] || "";
      const contactLast = raw.contactId?.lastName || raw.lastName || nameParts.slice(1).join(" ") || "";
      const prevLead = location.state?.lead || {};
      setLead(current => {
        const fallback = current || prevLead;
        return {
          id:              raw._id || fallback.id,
          firstName:       contactFirst || fallback.firstName || "",
          lastName:        contactLast || fallback.lastName || "",
          company:         raw.companyName || fallback.company || "",
          role:            raw.title || raw.serviceType || fallback.role || "",
          title:           raw.title || fallback.title || "",
          email:           raw.contactId?.email || raw.email || fallback.email || "",
          phone:           raw.contactId?.phone || raw.phone || fallback.phone || "",
          notes:           raw.description || fallback.notes || "",
          status:          raw.status || fallback.status || "New",
          address:         raw.address || fallback.address || "",
          assignedTo:      raw.assignedTo?._id || raw.assignedTo || fallback.assignedTo || "",
          assignedToName:  raw.assignedTo?.displayName || raw.assignedToName || fallback.assignedToName || "—",
          source:          raw.leadSource || raw.enquirySource || raw.source || fallback.source || "Manual",
          leadSource:      raw.leadSource || raw.enquirySource || raw.source || fallback.leadSource || "Manual",
          priority:        raw.priority || fallback.priority || "",
          commercialValue: raw.commercialValue || fallback.commercialValue || "",
          expectedCloseDate:  raw.expectedCloseDate || fallback.expectedCloseDate || "",
        nextFollowUpDate:   raw.nextFollowUpDate || "",
        proposalStatus:     raw.proposalStatus || "",
        proposalSentDate:   raw.proposalSentDate || "",
        leadId:          raw.leadId || `LD-${raw._id?.slice(-4).toUpperCase()}`,
        createdAt:       raw.createdAt,
        updatedAt:       raw.updatedAt,
        isCustomer:      raw.isCustomer || false,
        website:         raw.website || "",
        industry:        raw.industry || "",
        };
      });
    } catch {
      if (!lead) toast.error("Failed to load lead details");
    } finally {
      setLoading(false);
    }
  }, [leadId]);

  useEffect(() => { fetchLead(); }, [leadId]);

  const handleStageChange = async (newStage) => {
    if (!lead) return;
    const prev = lead.status;
    setLead(l => ({ ...l, status: newStage }));
    try {
      await crmAPI.updateLeadStatus(lead.id, newStage);
      toast.success(`Stage updated to ${newStage}`);
    } catch {
      setLead(l => ({ ...l, status: prev }));
      toast.error("Failed to update stage");
    }
  };

  const currentStage  = lead?.status || "New";
  const displayId     = lead?.leadId || (lead?.id ? `LD-${lead.id.slice(-4).toUpperCase()}` : "—");
  const displayName   = lead ? `${lead.firstName} ${lead.lastName}`.trim() : "—";
  const proposalBadge = PROPOSAL_STATUS_BADGE[lead?.proposalStatus] || "bg-slate-100 text-slate-500";
  const priorityBadge = PRIORITY_BADGE[lead?.priority] || "bg-slate-100 text-slate-500";

  // ── Tabs config ──────────────────────────────────────────────────────────
  const TABS = [
    { key: "overview", label: "Overview",          icon: LayoutGrid,   count: null },
    { key: "tasks",    label: "Tasks & Follow-ups", icon: ListTodo,     count: taskCount },
    { key: "notes",    label: "Notes & Activity",   icon: StickyNote,   count: noteCount },
    { key: "files",    label: "Files",              icon: Paperclip,    count: fileCount },
  ];

  if (loading && !lead) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#2E3D99] animate-spin" />
          <p className="text-sm text-slate-500 font-medium">Loading lead details…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] md:bg-slate-50">
      
      {/* ── Mobile Layout ── */}
      <div className="block md:hidden pb-24">
        {/* Mobile Header */}
        <div className="bg-[#F8FAFC] px-5 py-4 flex items-center justify-between sticky top-0 z-10">
          <button onClick={() => navigate("/admin/crm/leads")} className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-[0_4px_20px_rgba(15,23,42,0.08)] text-[#0F172A] border border-[#E5E7EB]/50">
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-5">
            <Phone size={18} className="text-[#0F172A]" />
            <Mail size={18} className="text-[#0F172A]" />
          </div>
        </div>

        {/* Profile Hero */}
        <div className="pt-8 pb-6 px-5 flex flex-col items-center">
          <div className="w-20 h-20 bg-[#2E3D99]/10 rounded-full flex items-center justify-center text-[#2E3D99] text-3xl font-bold mb-4">
            {(lead?.firstName?.[0] || "") + (lead?.lastName?.[0] || "") || "LD"}
          </div>
          <h2 className="text-[22px] font-semibold text-[#0F172A] text-center px-4">{lead?.role || displayId}</h2>
          <span className="mt-2 bg-[#22C55E]/10 text-[#22C55E] px-3 py-1 rounded-full text-[13px] font-medium">
            {currentStage || "Lead"}
          </span>
          <p className="text-[15px] font-medium text-[#1D97D7] mt-2 text-center">{displayName || "—"}</p>
        </div>

        {/* Quick Actions */}
        <div className="px-5 grid grid-cols-4 gap-4 mb-6">
          {[
            { icon: Phone, label: "Call" },
            { icon: Mail, label: "Email" },
            { icon: Edit, label: "Edit" },
            { icon: GitBranch, label: "Stage" },
          ].map(a => (
            <button key={a.label} className="bg-white h-[72px] rounded-[16px] shadow-[0_12px_40px_rgba(15,23,42,0.08)] flex flex-col items-center justify-center gap-2 border border-[#E5E7EB]/50">
              <a.icon size={18} className="text-[#0F172A]" />
              <span className="text-[13px] font-medium text-[#0F172A]">{a.label}</span>
            </button>
          ))}
        </div>

        <div className="px-5 space-y-4">
          
          {/* Pipeline Card */}
          <div className="bg-white rounded-[20px] p-6 shadow-[0_12px_40px_rgba(15,23,42,0.08)] border border-[#E5E7EB]/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-semibold text-[#0F172A]">Lead Pipeline</h3>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${proposalBadge || "bg-slate-100 text-slate-500"}`}>
                {lead?.proposalStatus || "Draft"}
              </span>
            </div>
            
            {/* Value */}
            <div className="mb-6 text-center">
               <p className="text-[11px] font-medium text-[#64748B] mb-1 uppercase tracking-wider">Commercial Value</p>
               <p className="text-[24px] font-bold text-[#0F172A]">{lead?.commercialValue ? `$${Number(lead.commercialValue).toLocaleString()}` : "$0"}</p>
            </div>

            {/* Stepper Mobile */}
            <div className="relative">
              <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-slate-100" />
              <div className="space-y-4 relative z-10">
                {PIPELINE_STAGES.map((stage, idx) => {
                  const activeIdx = getStageIndex(currentStage);
                  const isPast    = idx < activeIdx;
                  const isCurrent = idx === activeIdx;
                  return (
                    <div key={stage.key} className="flex items-center gap-4">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all shrink-0 ${
                        isCurrent
                          ? `${stage.dot} border-white shadow-md scale-110`
                          : isPast
                            ? `${stage.dot} border-white opacity-90`
                            : "bg-white border-slate-200"
                      }`}>
                        {isPast && <CheckCircle2 size={12} className="text-white" />}
                        {isCurrent && <span className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <div className="flex-1 flex justify-between items-center">
                        <p className={`text-[13px] font-bold ${isCurrent ? "text-slate-800" : isPast ? "text-slate-500" : "text-slate-400"}`}>
                          {stage.label}
                        </p>
                        {stage.hasValue && isCurrent && lead?.commercialValue && (
                          <span className="text-[11px] font-bold text-slate-400">
                            ${Number(lead.commercialValue).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Key Information */}
          <div className="bg-white rounded-[20px] p-6 shadow-[0_12px_40px_rgba(15,23,42,0.08)] border border-[#E5E7EB]/50">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[15px] font-semibold text-[#0F172A]">Key Information</h3>
            </div>
            <div className="space-y-4">
              {/* Contact */}
              <div className="flex items-center gap-3 border-b border-slate-50 pb-3">
                <User size={16} className="text-[#64748B]" />
                <div className="flex-1 flex justify-between items-center">
                  <p className="text-[13px] font-medium text-[#64748B]">{displayName || "—"}</p>
                  <p className="text-[11px] font-semibold text-[#64748B]">Contact</p>
                </div>
              </div>
              {/* Company */}
              <div className="flex items-center gap-3 border-b border-slate-50 pb-3">
                <Building2 size={16} className="text-[#64748B]" />
                <div className="flex-1 flex justify-between items-center">
                  <p className="text-[13px] font-medium text-[#64748B]">{lead?.company || "—"}</p>
                  <p className="text-[11px] font-semibold text-[#64748B]">Company</p>
                </div>
              </div>
              {/* Source */}
              <div className="flex items-center gap-3 border-b border-slate-50 pb-3">
                <Tag size={16} className="text-[#64748B]" />
                <div className="flex-1 flex justify-between items-center">
                  <p className="text-[13px] font-medium text-[#64748B]">{lead?.source || "—"}</p>
                  <p className="text-[11px] font-semibold text-[#64748B]">Source</p>
                </div>
              </div>
              {/* Priority */}
              <div className="flex items-center gap-3 border-b border-slate-50 pb-3">
                <AlertCircle size={16} className="text-[#64748B]" />
                <div className="flex-1 flex justify-between items-center">
                  {lead?.priority ? (
                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${priorityBadge}`}>
                      {lead.priority}
                    </span>
                  ) : <span className="text-[13px] font-medium text-[#64748B]">—</span>}
                  <p className="text-[11px] font-semibold text-[#64748B]">Priority</p>
                </div>
              </div>
              {/* Expected Close */}
              <div className="flex items-center gap-3 border-b border-slate-50 pb-3">
                <Calendar size={16} className="text-[#64748B]" />
                <div className="flex-1 flex justify-between items-center">
                  <p className="text-[13px] font-medium text-[#64748B]">{lead?.expectedCloseDate ? moment(lead.expectedCloseDate).format("DD/MM/YYYY") : "—"}</p>
                  <p className="text-[11px] font-semibold text-[#64748B]">Expected Close</p>
                </div>
              </div>
              {/* Next Follow-up */}
              <div className="flex items-center gap-3 border-b border-slate-50 pb-3">
                <Clock size={16} className="text-[#64748B]" />
                <div className="flex-1 flex justify-between items-center">
                  <p className="text-[13px] font-medium text-[#64748B]">{lead?.nextFollowUpDate ? moment(lead.nextFollowUpDate).format("DD/MM/YYYY") : "—"}</p>
                  <p className="text-[11px] font-semibold text-[#64748B]">Next Follow-up</p>
                </div>
              </div>
              {/* Owner */}
              <div className="flex items-center gap-3 pb-1">
                <UserCheck size={16} className="text-[#64748B]" />
                <div className="flex-1 flex justify-between items-center">
                  <p className="text-[13px] font-medium text-[#64748B]">{lead?.assignedToName || "Unassigned"}</p>
                  <p className="text-[11px] font-semibold text-[#64748B]">Owner</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Missing Components (Deal Tracker, Tabs Panel, Contact/Company Cards) */}
        <div className="px-5 space-y-4 pb-8 mt-4">
          <DealTracker
            isTracked={isDealTracked}
            currentStage={currentStage}
            lead={lead}
            onToggle={() => setIsDealTracked(v => !v)}
            className="bg-white rounded-[20px] p-6 shadow-[0_12px_40px_rgba(15,23,42,0.08)] border border-[#E5E7EB]/50"
          />

          <div className="bg-white rounded-[20px] shadow-[0_12px_40px_rgba(15,23,42,0.08)] border border-[#E5E7EB]/50 overflow-hidden">
            {/* Tab headers */}
            <div className="flex overflow-x-auto border-b border-slate-100 px-2 hide-scrollbar">
              {TABS.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-1.5 px-4 py-3.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                      activeTab === tab.key
                        ? "border-[#2E3D99] text-[#2E3D99]"
                        : "border-transparent text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    <Icon size={13} />
                    {tab.label}
                    {tab.count != null && tab.count > 0 && (
                      <span className={`min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center ${
                        activeTab === tab.key ? "bg-[#2E3D99] text-white" : "bg-slate-100 text-slate-500"
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Tab content */}
            <div className="p-5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                >
                  {activeTab === "overview" && (
                    <OverviewTab
                      lead={lead}
                      leadId={lead?.id}
                      users={users}
                      taskCount={taskCount}
                      onTaskCountChange={setTaskCount}
                    />
                  )}
                  {activeTab === "tasks"    && <TasksTab leadId={lead?.id} users={users} onCountChange={setTaskCount} />}
                  {activeTab === "notes"    && <NotesActivityTab leadId={lead?.id} lead={lead} onCountChange={setNoteCount} />}
                  {activeTab === "files"    && <FilesTab onCountChange={setFileCount} />}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
          
          <ContactCard lead={lead} className="bg-white rounded-[20px] shadow-[0_12px_40px_rgba(15,23,42,0.08)] border border-[#E5E7EB]/50 overflow-hidden" />
          <CompanyCard lead={lead} className="bg-white rounded-[20px] shadow-[0_12px_40px_rgba(15,23,42,0.08)] border border-[#E5E7EB]/50 overflow-hidden" />
        </div>

        {/* Sticky Bottom CTA */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#F8FAFC]/90 backdrop-blur-md z-50 pb-safe">
          <button className="w-full h-[56px] bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white rounded-[20px] font-semibold text-[15px] shadow-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity active:scale-[0.98]">
            <Plus size={18} /> Convert to Workflow
          </button>
        </div>
      </div>

      {/* ── Desktop Layout ── */}
      <div className="hidden md:flex flex-1 flex-col min-h-0 bg-slate-50">
        <Header />
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 space-y-5">

          {/* ── Page Header ────────────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-2">
                <button onClick={() => navigate("/admin/crm/leads")} className="hover:text-[#2E3D99] transition-colors">
                  Leads
                </button>
                <ChevronRight size={12} />
                <span className="text-slate-600 font-bold">{displayId}</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900">Lead Details</h1>
              <p className="text-sm text-slate-400 mt-0.5">
                Track lead progress, proposal status, and deal activity.
              </p>
            </div>
            <button
              onClick={() => navigate("/admin/crm/leads")}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-50 shadow-sm transition-colors"
            >
              <ArrowLeft size={15} />
              Back to Leads
            </button>
          </div>

          {/* ── Info Grid ──────────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
              {[
                {
                  label: "Enquiry Type",
                  content: <span className="text-sm font-semibold text-slate-800 line-clamp-2">{lead?.title || "—"}</span>,
                },
                {
                  label: "Current Stage",
                  content: <StageBadge stage={currentStage} />,
                },
                {
                  label: "Proposal Status",
                  content: lead?.proposalStatus ? (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${proposalBadge}`}>
                      {lead.proposalStatus}
                    </span>
                  ) : <span className="text-sm text-slate-300">—</span>,
                },
                {
                  label: "Contact",
                  content: (
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#2E3D99]/10 flex items-center justify-center text-[#2E3D99] text-[10px] font-bold">
                        {(lead?.firstName?.[0] || "") + (lead?.lastName?.[0] || "")}
                      </div>
                      <span className="text-sm font-semibold text-slate-800 truncate">{displayName}</span>
                    </div>
                  ),
                },
                {
                  label: "Company",
                  content: (
                    <div className="flex items-center gap-2">
                      <Building2 size={13} className="text-slate-400 shrink-0" />
                      <span className="text-sm font-semibold text-slate-800">{lead?.company || "—"}</span>
                    </div>
                  ),
                },
                { label: "Assigned To",      icon: UserCheck,    value: lead?.assignedToName || "Unassigned" },
                { label: "Lead Source",      icon: Tag,          value: lead?.leadSource || lead?.source || "Manual" },
                {
                  label: "Priority",
                  content: lead?.priority ? (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${priorityBadge}`}>
                      {lead.priority}
                    </span>
                  ) : <span className="text-sm text-slate-300">—</span>,
                },
                { label: "Commercial Value",   icon: DollarSign, value: lead?.commercialValue ? `$${Number(lead.commercialValue).toLocaleString()}` : null },
                { label: "Expected Close",     icon: Calendar,   value: lead?.expectedCloseDate ? moment(lead.expectedCloseDate).format("DD/MM/YYYY") : null },
                { label: "Next Follow-Up",     icon: Clock,      value: lead?.nextFollowUpDate ? moment(lead.nextFollowUpDate).format("DD/MM/YYYY") : null },
              ].map(({ label, icon: Icon, value, content }) => (
                <div key={label} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col justify-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">{label}</p>
                  {content ?? (
                    <div className="flex items-center gap-1.5">
                      {Icon && <Icon size={13} className="text-slate-400 shrink-0" />}
                      <span className="text-sm font-semibold text-slate-800 truncate">
                        {value || <span className="text-slate-300 font-normal">—</span>}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ── Lead Pipeline ─────────────────────────────────────────── */}
          <LeadPipeline
            currentStage={currentStage}
            commercialValue={lead?.commercialValue}
            onStageClick={handleStageChange}
          />

          {/* ── Two-column layout ─────────────────────────────────────── */}
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-5">

            {/* Left */}
            <div className="space-y-5 min-w-0">

              {/* Deal Tracker */}
              <DealTracker
                isTracked={isDealTracked}
                currentStage={currentStage}
                lead={lead}
                onToggle={() => setIsDealTracked(v => !v)}
              />

              {/* Tabs panel */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {/* Tab headers */}
                <div className="flex overflow-x-auto border-b border-slate-100 px-2 hide-scrollbar">
                  {TABS.map(tab => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center gap-1.5 px-4 py-3.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                          activeTab === tab.key
                            ? "border-[#2E3D99] text-[#2E3D99]"
                            : "border-transparent text-slate-400 hover:text-slate-600"
                        }`}
                      >
                        <Icon size={13} />
                        {tab.label}
                        {tab.count != null && tab.count > 0 && (
                          <span className={`min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center ${
                            activeTab === tab.key ? "bg-[#2E3D99] text-white" : "bg-slate-100 text-slate-500"
                          }`}>
                            {tab.count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Tab content */}
                <div className="p-5">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15 }}
                    >
                      {activeTab === "overview" && (
                        <OverviewTab
                          lead={lead}
                          leadId={lead?.id}
                          users={users}
                          taskCount={taskCount}
                          onTaskCountChange={setTaskCount}
                        />
                      )}
                      {activeTab === "tasks"    && <TasksTab leadId={lead?.id} users={users} onCountChange={setTaskCount} />}
                      {activeTab === "notes"    && <NotesActivityTab leadId={lead?.id} lead={lead} onCountChange={setNoteCount} />}
                      {activeTab === "files"    && <FilesTab onCountChange={setFileCount} />}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Right sidebar */}
            <div className="space-y-4">
              <ContactCard lead={lead} />
              <CompanyCard lead={lead} />

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Quick Actions</p>
                <div className="space-y-1">
                  {[
                    { label: "Edit Lead",            icon: Edit,           action: () => navigate("/admin/crm/leads"), color: "text-slate-600" },
                    { label: "Add Task",             icon: ListTodo,       action: () => setActiveTab("tasks"),   color: "text-emerald-600" },
                    { label: "Add Note",             icon: StickyNote,     action: () => setActiveTab("notes"),   color: "text-amber-600" },
                    { label: "Convert to Workflow",  icon: ArrowRightLeft, action: () => {},                       color: "text-violet-600" },
                    { label: "Move Stage",           icon: MoveRight,      action: () => {},                       color: "text-[#1D97D7]" },
                  ].map(({ label, icon: Icon, action, color }) => (
                    <button key={label} onClick={action}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors text-left">
                      <Icon size={13} className={color} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Record info */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Record Info</p>
                <div className="space-y-2.5">
                  <div>
                    <p className="text-[10px] text-slate-400">Created</p>
                    <p className="text-xs font-semibold text-slate-600">
                      {lead?.createdAt ? moment(lead.createdAt).format("DD MMM YYYY, h:mm A") : "—"}
                    </p>
                  </div>
                  {lead?.updatedAt && (
                    <div>
                      <p className="text-[10px] text-slate-400">Last Updated</p>
                      <p className="text-xs font-semibold text-slate-600">
                        {moment(lead.updatedAt).format("DD MMM YYYY, h:mm A")}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-[10px] text-slate-400">Assigned To</p>
                    <p className="text-xs font-semibold text-slate-600">{lead?.assignedToName || "—"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
