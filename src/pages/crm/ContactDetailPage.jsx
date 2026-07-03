import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft, Edit, Plus, Phone, Mail, MoreVertical, ExternalLink,
  CheckCircle2, Clock, AlertCircle, Building2, User, ChevronRight,
  Tag, MapPin, Globe, Star, Zap, MessageSquare, FileText,
  CalendarDays, Trash2, X, CheckSquare, Square, Search, Link2, Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import Header from "../../components/layout/Header";
import crmAPI from "../../api/crmAPI";

// ─── Helpers ───────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  "bg-violet-500","bg-blue-500","bg-teal-500","bg-amber-500",
  "bg-rose-500","bg-indigo-500","bg-emerald-500","bg-orange-500",
];
const avatarBg = (name = "") => {
  const code = [...(name || "")].reduce((a, c) => a + c.charCodeAt(0), 0);
  return AVATAR_COLORS[code % AVATAR_COLORS.length];
};
const initials = (name = "") =>
  name.trim().split(" ").filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join("");

const timeAgo = (date) => {
  if (!date) return null;
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 2)   return "just now";
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "yesterday";
  return `${days} days ago`;
};

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

// ─── Badge colour maps ─────────────────────────────────────────────────────────
const TYPE_STYLES = {
  Customer: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  Lead:     "bg-blue-50   text-blue-700    border border-blue-200",
  Prospect: "bg-amber-50  text-amber-700   border border-amber-200",
};
const LEAD_STAGE_STYLES = {
  "New Lead":    "bg-blue-50    text-blue-700    border border-blue-200",
  "Qualified":   "bg-teal-50    text-teal-700    border border-teal-200",
  "Opportunity": "bg-violet-50  text-violet-700  border border-violet-200",
  "Proposal":    "bg-indigo-50  text-indigo-700  border border-indigo-200",
  "Negotiation": "bg-amber-50   text-amber-700   border border-amber-200",
  "Won":         "bg-emerald-50 text-emerald-700 border border-emerald-200",
  "Lost":        "bg-rose-50    text-rose-700    border border-rose-200",
};
const PRIORITY_DOT = {
  High:   "bg-rose-400",
  Medium: "bg-amber-400",
  Low:    "bg-emerald-400",
};
const ACTIVITY_ICON_CONFIG = {
  "Phone Call":        { bg: "bg-emerald-100", color: "text-emerald-600", icon: Phone },
  "Email Sent":        { bg: "bg-blue-100",    color: "text-blue-600",    icon: Mail },
  "Note Added":        { bg: "bg-amber-100",   color: "text-amber-600",   icon: FileText },
  "Proposal Sent":     { bg: "bg-indigo-100",  color: "text-indigo-600",  icon: FileText },
  "Follow-up Scheduled":{ bg:"bg-teal-100",   color: "text-teal-600",    icon: CalendarDays },
  "Lead Created":      { bg: "bg-violet-100",  color: "text-violet-600",  icon: Zap },
  "Customer Enquiry":  { bg: "bg-slate-100",   color: "text-slate-600",   icon: MessageSquare },
};

// ─── Small sub-components ──────────────────────────────────────────────────────

const Avatar = ({ name = "", size = "md", className = "" }) => {
  const s = { sm: "w-7 h-7 text-[10px]", md: "w-9 h-9 text-xs", lg: "w-16 h-16 text-2xl", xl: "w-20 h-20 text-3xl" }[size] || "w-9 h-9 text-xs";
  return (
    <div className={`${s} ${avatarBg(name)} rounded-full flex items-center justify-center text-white font-bold shrink-0 ${className}`}>
      {initials(name) || "?"}
    </div>
  );
};

const SectionCard = ({ title, action, children, className = "" }) => (
  <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm ${className}`}>
    {title && (
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <h3 className="text-sm font-bold text-slate-800">{title}</h3>
        {action}
      </div>
    )}
    {children}
  </div>
);

const InfoRow = ({ label, value }) => (
  <div className="flex items-start gap-2 py-2 border-b border-slate-50 last:border-0">
    <span className="text-xs font-medium text-slate-400 w-36 shrink-0">{label}</span>
    <span className="text-xs font-semibold text-slate-700 flex-1">{value || "—"}</span>
  </div>
);

// ─── Link Company Modal ────────────────────────────────────────────────────────

const AVATAR_BG = [
  "bg-violet-500","bg-blue-500","bg-teal-500","bg-amber-500",
  "bg-rose-500","bg-indigo-500","bg-emerald-500","bg-orange-500",
];
const companyAvatarBg = (name = "") => {
  const code = [...(name||"")].reduce((a,c) => a + c.charCodeAt(0), 0);
  return AVATAR_BG[code % AVATAR_BG.length];
};

function LinkCompanyModal({ contactId, currentCompanyId, onClose, onLinked }) {
  const [query,      setQuery]      = useState("");
  const [companies,  setCompanies]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [linking,    setLinking]    = useState(false);
  const [selected,   setSelected]   = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await crmAPI.getAllCompanies();
        const raw = Array.isArray(res?.data?.companies) ? res.data.companies
                  : Array.isArray(res?.data)            ? res.data
                  : Array.isArray(res)                  ? res : [];
        setCompanies(raw);
      } catch {
        toast.error("Failed to load companies");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = companies.filter(c => {
    const q = query.toLowerCase();
    return (c.companyName ?? "").toLowerCase().includes(q)
        || (c.industry   ?? "").toLowerCase().includes(q);
  });

  const handleLink = async () => {
    if (!selected) return;
    setLinking(true);
    try {
      // If contact is already linked to a company, unlink first
      if (currentCompanyId) {
        await crmAPI.unlinkContactFromCompany(currentCompanyId, contactId);
      }
      // Then link to the newly selected company
      await crmAPI.linkContactToCompany(selected._id, contactId);
      toast.success(`Company changed to ${selected.companyName}`);
      onLinked(selected);
      onClose();
    } catch (err) {
      toast.error(err.message || "Failed to change company");
    } finally {
      setLinking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[80vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Link to Company</h2>
            <p className="text-xs text-slate-400 mt-0.5">Select a company to associate with this contact</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 transition text-slate-400">
            <X size={16} />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 py-3 border-b border-slate-100">
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl">
            <Search size={14} className="text-slate-400 shrink-0" />
            <input
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search by company name or industry…"
              className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none"
            />
            {query && <button onClick={() => setQuery("")} className="text-slate-400 hover:text-slate-600"><X size={12} /></button>}
          </div>
        </div>

        {/* Company list */}
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-1.5">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-6 h-6 text-[#2E3D99] animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-10">
              <Building2 size={32} className="text-slate-200 mx-auto mb-2" />
              <p className="text-sm text-slate-400">{query ? "No companies match your search" : "No companies found"}</p>
            </div>
          ) : filtered.map(co => {
            const isSelected  = selected?._id === co._id;
            const isCurrent   = currentCompanyId && (co._id === currentCompanyId);
            const initials    = (co.companyName || "?").slice(0, 2).toUpperCase();
            return (
              <button
                key={co._id}
                disabled={isCurrent}
                onClick={() => setSelected(isSelected ? null : co)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all text-left ${
                  isCurrent   ? "bg-slate-50 border-slate-100 opacity-50 cursor-not-allowed"
                  : isSelected ? "bg-[#2E3D99]/5 border-[#2E3D99]/30"
                  : "bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50"
                }`}
              >
                {/* Radio */}
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                  isSelected ? "bg-[#2E3D99] border-[#2E3D99]" : "border-slate-300"
                }`}>
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white block" />}
                </div>
                {/* Avatar */}
                <div className={`w-8 h-8 ${companyAvatarBg(co.companyName)} rounded-lg flex items-center justify-center text-white text-[11px] font-bold shrink-0`}>
                  {initials}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800 truncate">
                    {co.companyName}
                    {isCurrent && <span className="ml-2 text-[10px] text-slate-400">(Currently linked)</span>}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">{co.industry || co.companyType || "—"}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <span className="text-xs text-slate-400">
            {selected ? `Selected: ${selected.companyName}` : "No company selected"}
          </span>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition">
              Cancel
            </button>
            <button
              onClick={handleLink}
              disabled={!selected || linking}
              className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] rounded-xl hover:opacity-90 transition disabled:opacity-40"
            >
              {linking && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {linking ? (currentCompanyId ? "Changing…" : "Linking…") : (currentCompanyId ? "Change Company" : "Link Company")}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function ContactDetailPage() {
  const { contactId } = useParams();
  const navigate      = useNavigate();
  const location      = useLocation();

  const [contact,         setContact]         = useState(location.state?.contact || null);
  const [loading,         setLoading]         = useState(!location.state?.contact);
  const [activeNote,      setActiveNote]      = useState(null);
  const [showLinkCompany, setShowLinkCompany] = useState(false);

  // Fetch contact if not passed via state
  const loadContact = useCallback(async () => {
    if (contact) return;
    setLoading(true);
    try {
      const res = await crmAPI.getContactById(contactId);
      setContact(res?.contact ?? res);
    } catch (err) {
      console.error("Failed to load contact:", err);
      toast.error("Could not load contact details");
    } finally {
      setLoading(false);
    }
  }, [contactId, contact]);

  useEffect(() => { loadContact(); }, [loadContact]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="flex items-center justify-center h-[70vh]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[#2E3D99]/20 border-t-[#2E3D99] rounded-full animate-spin mx-auto" />
            <p className="text-sm text-slate-500 mt-4">Loading contact...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="flex items-center justify-center h-[70vh]">
          <div className="text-center">
            <p className="text-slate-500 font-semibold">Contact not found</p>
            <button onClick={() => navigate("/admin/crm/contacts")}
              className="mt-4 px-4 py-2 bg-[#2E3D99] text-white rounded-xl text-sm font-semibold hover:opacity-90 transition">
              Back to Contacts
            </button>
          </div>
        </div>
      </div>
    );
  }

  const fullName      = `${contact.firstName || ""} ${contact.lastName || ""}`.trim();
  const displayId     = contact.contactId || `CT-${(contact.id || "").slice(-4).toUpperCase()}`;
  const typeStyle     = TYPE_STYLES[contact.type] || "bg-slate-100 text-slate-500 border border-slate-200";
  const healthScore   = contact.healthScore ?? 85;
  const healthColor   = healthScore >= 70 ? "text-emerald-600" : healthScore >= 40 ? "text-amber-600" : "text-rose-600";
  const healthBg      = healthScore >= 70 ? "bg-emerald-400" : healthScore >= 40 ? "bg-amber-400" : "bg-rose-400";
  const healthLabel   = healthScore >= 70 ? "Green" : healthScore >= 40 ? "Average" : "At Risk";
  const leads         = contact.leads || [];
  const tasks         = contact.tasks || [];
  const notes         = contact.notes || [];
  const activities    = contact.activities || [];

  return (
    <div className="min-h-screen bg-slate-50 md:bg-slate-50">
      
      {/* ── Mobile Layout ── */}
      <div className="block md:hidden pb-24 bg-[#F8FAFC]">
        {/* Top Navigation */}
        <div className="h-16 bg-white px-6 flex items-center justify-between border-b border-[#E5E7EB]">
          <button onClick={() => navigate("/admin/crm/contacts")} className="flex items-center gap-1.5 text-[15px] font-medium text-[#0F172A]">
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-5">
            <Phone size={18} className="text-[#0F172A]" />
            <Mail size={18} className="text-[#0F172A]" />
          </div>
        </div>

        {/* Profile Hero */}
        <div className="pt-8 pb-6 px-5 flex flex-col items-center">
          <Avatar name={fullName} size="xl" className="w-20 h-20 text-3xl mb-4" />
          <h2 className="text-[22px] font-semibold text-[#0F172A]">{fullName}</h2>
          <span className="mt-2 bg-[#22C55E]/10 text-[#22C55E] px-3 py-1 rounded-full text-[13px] font-medium">
            {contact.type || "Lead"}
          </span>
          <p className="text-[15px] font-medium text-[#1D97D7] mt-2">{contact.company || "—"}</p>
        </div>

        {/* Quick Actions */}
        <div className="px-5 grid grid-cols-4 gap-4 mb-6">
          {[
            { icon: Phone, label: "Call" },
            { icon: Mail, label: "Email" },
            { icon: Edit, label: "Edit" },
            { icon: MoreVertical, label: "More" },
          ].map(a => (
            <button key={a.label} className="bg-white h-[72px] rounded-[16px] shadow-[0_12px_40px_rgba(15,23,42,0.08)] flex flex-col items-center justify-center gap-2 border border-[#E5E7EB]/50">
              <a.icon size={18} className="text-[#0F172A]" />
              <span className="text-[13px] font-medium text-[#0F172A]">{a.label}</span>
            </button>
          ))}
        </div>

        <div className="px-5 space-y-4">
          {/* Contact Health Card */}
          <div className="bg-white rounded-[20px] p-6 shadow-[0_12px_40px_rgba(15,23,42,0.08)] border border-[#E5E7EB]/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-semibold text-[#0F172A]">Contact Health</h3>
              <span className="bg-[#22C55E]/10 text-[#22C55E] px-2.5 py-0.5 rounded-full text-[13px] font-medium">{healthLabel}</span>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
                <div className="h-full bg-[#22C55E] rounded-full" style={{ width: `${healthScore}%` }} />
              </div>
              <span className="text-[13px] font-semibold text-[#0F172A]">{healthScore} / 100</span>
            </div>
            <div className="space-y-3">
              {(contact.healthChecks || [
                { label: "Recent interaction: 2 days ago" },
                { label: "No overdue tasks" },
                { label: `${leads.length || 2} active leads` },
              ]).map((chk, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <CheckCircle2 size={16} className="text-[#22C55E]" />
                  <span className="text-[13px] font-medium text-[#0F172A]">{chk.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Key Information */}
          <div className="bg-white rounded-[20px] p-6 shadow-[0_12px_40px_rgba(15,23,42,0.08)] border border-[#E5E7EB]/50 cursor-pointer">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[15px] font-semibold text-[#0F172A]">Key Information</h3>
              <ChevronRight size={18} className="text-[#64748B]" />
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-50 pb-3">
                <Mail size={16} className="text-[#64748B]" />
                <div className="flex-1 flex justify-between items-center">
                  <p className="text-[13px] font-medium text-[#64748B]">{contact.email || "—"}</p>
                  <p className="text-[11px] font-semibold text-[#64748B]">Email</p>
                </div>
              </div>
              <div className="flex items-center gap-3 border-b border-slate-50 pb-3">
                <Phone size={16} className="text-[#64748B]" />
                <div className="flex-1 flex justify-between items-center">
                  <p className="text-[13px] font-medium text-[#64748B]">{contact.phone || "—"}</p>
                  <p className="text-[11px] font-semibold text-[#64748B]">Mobile</p>
                </div>
              </div>
              <div className="flex items-center gap-3 pb-1">
                <User size={16} className="text-[#64748B]" />
                <div className="flex-1 flex justify-between items-center">
                  <p className="text-[13px] font-medium text-[#64748B]">{contact.type || "—"}</p>
                  <p className="text-[11px] font-semibold text-[#64748B]">Status</p>
                </div>
              </div>
            </div>
          </div>

          {/* Company Information */}
          <div className="bg-white rounded-[20px] p-6 shadow-[0_12px_40px_rgba(15,23,42,0.08)] border border-[#E5E7EB]/50 cursor-pointer">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[15px] font-semibold text-[#0F172A]">Company Information</h3>
              <ChevronRight size={18} className="text-[#64748B]" />
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-50 pb-3">
                <Building2 size={16} className="text-[#64748B]" />
                <div className="flex-1 flex justify-between items-center">
                  <p className="text-[13px] font-medium text-[#64748B]">{contact.companyId?.companyName || contact.company || "—"}</p>
                  <p className="text-[11px] font-semibold text-[#64748B]">{contact.companyId?.companyType || "Client"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 border-b border-slate-50 pb-3">
                <Tag size={16} className="text-[#64748B]" />
                <div className="flex-1 flex justify-between items-center">
                  <p className="text-[11px] font-semibold text-[#64748B]">Industry</p>
                  <p className="text-[13px] font-medium text-[#64748B]">{contact.companyId?.industry || "—"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 pb-1">
                <Globe size={16} className="text-[#64748B]" />
                <div className="flex-1 flex justify-between items-center">
                  <p className="text-[11px] font-semibold text-[#64748B]">Website</p>
                  <p className="text-[13px] font-medium text-[#64748B] truncate ml-4">{contact.companyId?.website || "—"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-[20px] p-6 shadow-[0_12px_40px_rgba(15,23,42,0.08)] border border-[#E5E7EB]/50 cursor-pointer">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-[15px] font-semibold text-[#0F172A]">Recent Activity</h3>
              <ChevronRight size={18} className="text-[#64748B]" />
            </div>
            <p className="text-[13px] font-medium text-[#64748B] mb-5">{activities.length} recent events</p>
            
            <div className="space-y-4">
              {activities.slice(0, 3).map((act, i) => {
                const IconC = ACTIVITY_ICON_CONFIG[act.type]?.icon || MessageSquare;
                return (
                  <div key={i} className="flex gap-3 items-center">
                    <div className="w-8 h-8 rounded-full bg-[#F8FAFC] flex items-center justify-center shrink-0">
                      <IconC size={14} className="text-[#22C55E]" />
                    </div>
                    <div>
                      <p className="text-[15px] font-semibold text-[#0F172A]">{act.type}</p>
                      <p className="text-[13px] font-medium text-[#64748B]">{fmtDate(act.date)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Leads */}
          <div className="bg-white rounded-[20px] p-6 shadow-[0_12px_40px_rgba(15,23,42,0.08)] border border-[#E5E7EB]/50 cursor-pointer">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-[15px] font-semibold text-[#0F172A]">Leads</h3>
              <ChevronRight size={18} className="text-[#64748B]" />
            </div>
            <p className="text-[13px] font-medium text-[#64748B] mb-5">{leads.length} open leads</p>
            <div className="space-y-4">
              {leads.slice(0, 2).map((lead, i) => (
                <div key={i} className="flex gap-3 border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                  <div className="w-8 h-8 rounded-full bg-[#22C55E]/10 flex items-center justify-center shrink-0">
                    <Zap size={14} className="text-[#22C55E]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[15px] font-semibold text-[#0F172A]">{lead.title}</p>
                    <div className="flex gap-2 items-center mt-1">
                      <span className="text-[#64748B] text-[13px] font-medium">{lead.value ? `$${Number(lead.value).toLocaleString()}` : "—"}</span>
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${LEAD_STAGE_STYLES[lead.status] || "bg-slate-100 text-slate-500"}`}>{lead.status}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tasks */}
          <div className="bg-white rounded-[20px] p-6 shadow-[0_12px_40px_rgba(15,23,42,0.08)] border border-[#E5E7EB]/50 cursor-pointer">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-[15px] font-semibold text-[#0F172A]">Tasks</h3>
              <ChevronRight size={18} className="text-[#64748B]" />
            </div>
            <p className="text-[13px] font-medium text-[#64748B] mb-5">{tasks.length} tasks</p>
            {tasks.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-[15px] font-semibold text-[#0F172A]">No tasks yet</p>
                <p className="text-[13px] text-[#64748B] mt-1 mb-4">Create a task to follow up with this contact.</p>
                <button className="text-[#1D97D7] text-[13px] font-semibold flex items-center gap-1 justify-center w-full">
                  <Plus size={14} /> Add New Task
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {tasks.slice(0, 2).map((task, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#F8FAFC] flex items-center justify-center shrink-0 mt-0.5">
                      <CheckSquare size={14} className="text-[#64748B]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[15px] font-semibold text-[#0F172A]">{task.title}</p>
                      <p className="text-[13px] font-medium text-[#64748B] mt-0.5">{fmtDate(task.dueDate)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="bg-white rounded-[20px] p-6 shadow-[0_12px_40px_rgba(15,23,42,0.08)] border border-[#E5E7EB]/50 cursor-pointer">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-[15px] font-semibold text-[#0F172A]">Notes</h3>
              <ChevronRight size={18} className="text-[#64748B]" />
            </div>
            <p className="text-[13px] font-medium text-[#64748B] mb-5">{notes.length} notes</p>
            <div className="space-y-4">
              {notes.slice(0, 3).map((note, i) => (
                <div key={i} className="flex gap-3 border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                  <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center shrink-0 mt-0.5">
                    <FileText size={14} className="text-amber-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[13px] font-medium text-[#0F172A] line-clamp-2">{note.content}</p>
                    <p className="text-[11px] font-medium text-[#64748B] mt-1.5">{fmtDate(note.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sticky Bottom CTA */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#F8FAFC]/90 backdrop-blur-md z-50 pb-safe">
          <button className="w-full h-[56px] bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white rounded-[20px] font-semibold text-[15px] shadow-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity active:scale-[0.98]">
            <Plus size={18} /> Create Lead
          </button>
        </div>
      </div>

      {/* ── Desktop Layout ── */}
      <div className="hidden md:block">
        <Header />
        <main className="px-6 py-5 max-w-[1600px] mx-auto">

        {/* ── Breadcrumb / Actions ─────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Contact Profile</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              View complete contact information, company details, interactions, leads, and activity history.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/admin/crm/contacts")}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm active:scale-[0.98]"
            >
              <ArrowLeft size={13} />
              <span className="hidden xl:inline">Back to Contacts</span>
              <span className="inline xl:hidden">Back</span>
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm active:scale-[0.98]">
              <Edit size={13} />
              Edit<span className="hidden xl:inline">&nbsp;Contact</span>
            </button>
            <button className="hidden xl:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm active:scale-[0.98]">
              <Plus size={13} />
              Add Note
            </button>
            <button className="hidden xl:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm active:scale-[0.98]">
              <Zap size={13} />
              Create Lead
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] rounded-xl hover:opacity-90 transition-all shadow-sm active:scale-[0.98]">
              <Phone size={13} />
              Call
            </button>
            <button className="hidden xl:flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] rounded-xl hover:opacity-90 transition-all shadow-sm active:scale-[0.98]">
              <Mail size={13} />
              Email
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-500 hover:bg-white hover:border hover:border-slate-200 transition-all shadow-sm active:scale-[0.98]">
              <MoreVertical size={15} />
            </button>
          </div>
        </div>

        {/* ── Profile Header Card ──────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_12px_40px_rgba(15,23,42,0.08)] p-5 mb-5 md:mb-6">
          <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] xl:grid-cols-[auto_1fr_auto] items-start gap-6 md:gap-8">
            
            {/* Avatar + Name */}
            <div className="flex items-center gap-4 min-w-[200px] xl:min-w-[220px]">
              <Avatar name={fullName} size="xl" />
              <div>
                <h2 className="text-xl font-bold text-slate-900">{fullName}</h2>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[11px] font-bold mt-1 ${typeStyle}`}>
                  {contact.type || "Lead"}
                </span>
                <p className="text-xs text-slate-500 mt-1.5">{contact.designation || "—"}</p>
                <p className="text-xs font-semibold text-[#1D97D7] mt-0.5 hover:underline cursor-pointer">
                  {contact.company || "—"}
                </p>
              </div>
            </div>

            {/* Contact quick-info */}
            <div className="flex-1 grid grid-cols-2 gap-x-4 md:gap-x-6 gap-y-4 md:border-l md:border-slate-100 md:pl-6 xl:border-none xl:pl-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center shrink-0">
                  <Phone size={14} className="text-slate-500" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">{contact.phone || "—"}</p>
                  <p className="text-[10px] text-slate-400">Mobile</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center shrink-0">
                  <User size={14} className="text-slate-500" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Preferred Contact</p>
                  <p className="text-xs font-bold text-slate-800">{contact.preferredContact || "Email"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center shrink-0">
                  <Mail size={14} className="text-slate-500" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">{contact.email || "—"}</p>
                  <p className="text-[10px] text-slate-400">Email</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center shrink-0">
                  <Clock size={14} className="text-slate-500" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Local Time</p>
                  <p className="text-xs font-bold text-slate-800">{contact.localTime || "—"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 md:col-span-2 xl:col-span-1 xl:mt-2">
                <Avatar name={contact.assignedToName || "Unassigned"} size="sm" />
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Owner</p>
                  <p className="text-xs font-bold text-slate-800">{contact.assignedToName || "Unassigned"}</p>
                </div>
              </div>
            </div>

            {/* Contact Health (Desktop Only) */}
            <div className="hidden xl:block min-w-[200px] border-l border-slate-100 pl-8">
              <div className="flex items-center gap-2 mb-2">
                <p className="text-xs font-bold text-slate-700">Contact Health</p>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  healthScore >= 70 ? "bg-emerald-100 text-emerald-700" : healthScore >= 40 ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"
                }`}>
                  • {healthLabel}
                </span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${healthBg}`}
                    style={{ width: `${healthScore}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-slate-600">{healthScore} / 100</span>
              </div>
              <div className="space-y-1.5">
                {(contact.healthChecks || [
                  { label: "Recent interaction: 2 days ago", ok: true },
                  { label: "No overdue tasks",               ok: true },
                  { label: `${leads.length || 2} active leads`, ok: true },
                ]).map((chk, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                    <span className="text-[11px] text-slate-600">{chk.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Responsive Content Grid ───────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-[20px] xl:gap-4 mb-4 pb-12">

          {/* Key Information */}
          <SectionCard
            title="Key Information"
            action={
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#2E3D99] bg-[#2E3D99]/5 border border-[#2E3D99]/20 rounded-lg hover:bg-[#2E3D99]/10 transition-colors">
                <Edit size={11} />
                Edit
              </button>
            }
          >
            <div className="px-5 py-3">
              <InfoRow label="Contact ID"              value={displayId} />
              <InfoRow label="First Name"              value={contact.firstName} />
              <InfoRow label="Last Name"               value={contact.lastName} />
              <InfoRow label="Mobile / Phone"          value={contact.phone} />
              <InfoRow label="Email"                   value={contact.email} />
              <InfoRow label="Role / Designation"      value={contact.designation} />
              <InfoRow label="Company"                 value={
                <span className="text-[#1D97D7] font-semibold cursor-pointer hover:underline">{contact.company || "—"}</span>
              } />
              <InfoRow label="Customer Status"         value={
                contact.type ? (
                  <span className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-bold ${typeStyle}`}>{contact.type}</span>
                ) : "—"
              } />
              <InfoRow label="Preferred Contact"       value={contact.preferredContact || "Email"} />
              <InfoRow label="Contact Health"          value={
                <span className="text-emerald-600 font-bold">{healthLabel} ({healthScore}/100)</span>
              } />
              {contact.tags?.length > 0 && (
                <div className="flex items-start gap-2 py-2">
                  <span className="text-xs font-medium text-slate-400 w-36 shrink-0">Tags</span>
                  <div className="flex flex-wrap gap-1.5">
                    {contact.tags.map(tag => (
                      <span key={tag} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-semibold rounded-md">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <InfoRow label="Address" value={contact.address} />
            </div>
          </SectionCard>

          {/* Company Information */}
          <SectionCard title="Company Information">
            {(() => {
              const co = contact.companyId;
              const hasCompany = co && (co._id || co.companyName);
              return (
                <>
                  <div className="px-5 py-3">
                    {hasCompany ? (
                      <>
                        <InfoRow label="Company Name" value={
                          <span
                            className="text-[#1D97D7] font-semibold cursor-pointer hover:underline"
                            onClick={() => navigate(`/admin/crm/companies/${co._id}`)}
                          >
                            {co.companyName || "—"}
                          </span>
                        } />
                        <InfoRow label="Company Type" value={co.companyType} />
                        <InfoRow label="Industry"     value={co.industry} />
                        <InfoRow label="Website"      value={
                          co.website ? (
                            <a href={co.website.startsWith("http") ? co.website : `https://${co.website}`}
                              target="_blank" rel="noreferrer"
                              className="text-[#1D97D7] hover:underline flex items-center gap-1">
                              {co.website.replace(/^https?:\/\//, "")}
                              <ExternalLink size={10} />
                            </a>
                          ) : null
                        } />
                        <InfoRow label="Phone"   value={co.phone} />
                        <InfoRow label="Email"   value={
                          co.email ? <a href={`mailto:${co.email}`} className="text-[#1D97D7] hover:underline">{co.email}</a> : null
                        } />
                        <InfoRow label="Address" value={co.address} />
                      </>
                    ) : (
                      <div className="text-center py-6">
                        <Building2 size={28} className="text-slate-200 mx-auto mb-2" />
                        <p className="text-xs text-slate-400">No company linked yet</p>
                      </div>
                    )}
                  </div>
                  <div className="px-5 pb-4 flex gap-2">
                    {hasCompany ? (
                      <>
                        <button
                          onClick={() => navigate(`/admin/crm/companies/${co._id}`)}
                          className="flex-1 py-2 text-xs font-bold text-[#1D97D7] border border-[#1D97D7]/30 bg-[#1D97D7]/5 rounded-xl hover:bg-[#1D97D7]/10 transition-colors"
                        >
                          View Company
                        </button>
                        <button
                          onClick={() => setShowLinkCompany(true)}
                          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 border border-slate-200 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                        >
                          <Link2 size={11} />
                          Change
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setShowLinkCompany(true)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-white bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] rounded-xl hover:opacity-90 transition-colors"
                      >
                        <Link2 size={11} />
                        Link to Company
                      </button>
                    )}
                  </div>
                </>
              );
            })()}
          </SectionCard>

          {/* Contact Health (Tablet Only) */}
          <div className="block xl:hidden">
            <SectionCard title="Contact Health">
              <div className="px-5 py-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${healthBg}`}
                      style={{ width: `${healthScore}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-600">{healthScore} / 100</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {(contact.healthChecks || [
                    { label: "Recent interaction: 2 days ago", ok: true },
                    { label: "No overdue tasks",               ok: true },
                    { label: `${leads.length || 2} active leads`, ok: true },
                  ]).map((chk, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 size={13} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-[11px] text-slate-600 font-medium leading-snug">{chk.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </SectionCard>
          </div>

          {/* Leads */}
          <SectionCard
            title={`Leads (${leads.length})`}
            action={
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] rounded-lg hover:opacity-90 transition-all shadow-sm">
                <Plus size={11} />
                Create New Lead
              </button>
            }
          >
            <div className="px-5 py-3">
              {leads.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">No leads associated yet</p>
              ) : (
                <div className="space-y-2">
                  {/* Mini table header */}
                  <div className="grid grid-cols-[80px_1fr_80px_90px_28px] gap-2 pb-1 border-b border-slate-100">
                    {["Lead ID","Lead Title","Status","Commercial Value",""].map(h => (
                      <span key={h} className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{h}</span>
                    ))}
                  </div>
                  {leads.map(lead => (
                    <div key={lead.id}
                      className="grid grid-cols-[80px_1fr_80px_90px_28px] gap-2 items-center py-2 border-b border-slate-50 last:border-0 hover:bg-slate-50 rounded-lg px-1 -mx-1 cursor-pointer"
                      onClick={() => navigate(`/admin/crm/leads/${lead.id}`, { state: { lead } })}
                    >
                      <span className="text-[#1D97D7] font-bold text-[11px] whitespace-nowrap">{lead.leadId || `LD-${(lead.id||"").slice(-4).toUpperCase()}`}</span>
                      <span className="text-[11px] font-semibold text-slate-700 truncate">{lead.title}</span>
                      <span className={`inline-flex px-1.5 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap ${LEAD_STAGE_STYLES[lead.status] || "bg-slate-100 text-slate-500"}`}>
                        {lead.status}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-700">
                        {lead.value ? `$${Number(lead.value).toLocaleString()}` : "—"}
                      </span>
                      <Avatar name={lead.assignedToName || ""} size="sm" />
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="px-5 pb-4">
              <button className="flex items-center gap-1 text-xs font-semibold text-[#1D97D7] hover:underline">
                View all leads <ChevronRight size={12} />
              </button>
            </div>
          </SectionCard>

          {/* Interactions & Activity */}
          <SectionCard
            title="Interactions & Activity"
            action={
              <button className="flex items-center gap-1 text-xs font-semibold text-[#1D97D7] hover:underline">
                View All Activity <ChevronRight size={12} />
              </button>
            }
          >
            <div className="px-5 py-3 space-y-3">
              {activities.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No activity yet</p>
              ) : activities.slice(0, 7).map((act, i) => {
                const cfg = ACTIVITY_ICON_CONFIG[act.type] || { bg: "bg-slate-100", color: "text-slate-500", icon: MessageSquare };
                const IconC = cfg.icon;
                return (
                  <div key={i} className="flex items-start gap-3">
                    <div className={`w-8 h-8 ${cfg.bg} rounded-full flex items-center justify-center shrink-0 mt-0.5`}>
                      <IconC size={14} className={cfg.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-slate-800">{act.type}</p>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[10px] text-slate-400">{fmtDate(act.date)}</span>
                          <Avatar name={act.userName || ""} size="sm" />
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{act.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionCard>

          {/* Tasks & Follow-ups */}
          <SectionCard
            title={`Tasks & Follow-ups (${tasks.length})`}
            action={
              <button className="flex items-center gap-1 text-xs font-semibold text-[#1D97D7] hover:underline">
                View All Tasks <ChevronRight size={12} />
              </button>
            }
          >
            <div className="px-5 py-3 space-y-3">
              {tasks.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No tasks yet</p>
              ) : tasks.map((task, i) => (
                <div key={i} className="flex items-start gap-3 group">
                  <button className="mt-0.5 shrink-0">
                    {task.done
                      ? <CheckSquare size={15} className="text-emerald-500" />
                      : <Square size={15} className="text-slate-300 group-hover:text-slate-400" />
                    }
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-xs font-semibold ${task.done ? "line-through text-slate-400" : "text-slate-800"}`}>
                        {task.title}
                      </p>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Avatar name={task.assignedToName || ""} size="sm" />
                        <button className="text-slate-300 hover:text-slate-500 transition-colors">
                          <MoreVertical size={13} />
                        </button>
                      </div>
                    </div>
                    {task.description && (
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate">{task.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1 text-[10px] text-slate-400">
                        <CalendarDays size={10} />
                        {fmtDate(task.dueDate)}
                      </div>
                      {task.priority && (
                        <div className="flex items-center gap-1">
                          <span className={`w-1.5 h-1.5 rounded-full ${PRIORITY_DOT[task.priority] || "bg-slate-300"}`} />
                          <span className={`text-[10px] font-semibold ${
                            task.priority === "High" ? "text-rose-600" : task.priority === "Medium" ? "text-amber-600" : "text-emerald-600"
                          }`}>{task.priority}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-5 pb-4">
              <button className="w-full py-2 text-xs font-bold text-[#2E3D99] border border-dashed border-[#2E3D99]/30 bg-[#2E3D99]/5 rounded-xl hover:bg-[#2E3D99]/10 transition-colors flex items-center justify-center gap-1.5">
                <Plus size={13} />
                Add New Task
              </button>
            </div>
          </SectionCard>

          {/* Notes */}
          <div className="md:col-span-2 xl:col-span-1">
            <SectionCard
            title={`Notes (${notes.length})`}
            action={
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#2E3D99] bg-[#2E3D99]/5 border border-[#2E3D99]/20 rounded-lg hover:bg-[#2E3D99]/10 transition-colors">
                  <Plus size={11} />
                  Add Note
                </button>
              </div>
            }
          >
            <div className="px-5 py-3 space-y-3">
              {notes.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No notes yet</p>
              ) : notes.map((note, i) => (
                <div key={i} className="bg-amber-50/60 border border-amber-100 rounded-xl p-3.5 relative">
                  <button className="absolute top-2 right-2 text-slate-300 hover:text-slate-500 transition-colors">
                    <MoreVertical size={13} />
                  </button>
                  <p className="text-[11px] text-slate-700 leading-relaxed pr-5">{note.content}</p>
                  <div className="flex items-center justify-between mt-2.5">
                    <span className="text-[10px] text-slate-400">Added by {note.addedBy}</span>
                    <span className="text-[10px] text-slate-400">{fmtDate(note.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-5 pb-4">
              <button className="flex items-center gap-1 text-xs font-semibold text-[#1D97D7] hover:underline">
                View All Notes <ChevronRight size={12} />
              </button>
            </div>
          </SectionCard>
          </div>
        </div>
      </main>
      </div>

      {/* ── Link Company Modal ───────────────────────────────────────── */}
      <AnimatePresence>
        {showLinkCompany && (
          <LinkCompanyModal
            contactId={contact._id ?? contact.id}
            currentCompanyId={contact.companyId?._id}
            onClose={() => setShowLinkCompany(false)}
            onLinked={(company) => {
              setContact(prev => ({ ...prev, companyId: company }));
              setShowLinkCompany(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
