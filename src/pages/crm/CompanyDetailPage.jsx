import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft, Edit, Plus, Phone, Mail, MoreVertical, ExternalLink,
  CheckCircle2, Clock, Building2, User, ChevronRight,
  Globe, Star, Zap, MessageSquare, FileText,
  CalendarDays, Trash2, X, CheckSquare, Square, Check,
  MapPin, Briefcase, TrendingUp, DollarSign, Users,
  AlertTriangle, AlertCircle, Activity, Loader2, Search, Link2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import Header from "../../components/layout/Header";
import Loader from "../../components/ui/Loader";
import crmAPI from "../../api/crmAPI";

// ─── Helpers ───────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  "bg-violet-500", "bg-blue-500", "bg-teal-500", "bg-amber-500",
  "bg-rose-500",   "bg-indigo-500", "bg-emerald-500", "bg-orange-500",
  "bg-cyan-500",   "bg-pink-500",
];

const avatarBg = (name = "") => {
  const code = [...(name || "")].reduce((a, c) => a + c.charCodeAt(0), 0);
  return AVATAR_COLORS[code % AVATAR_COLORS.length];
};

const initials = (name = "") =>
  name.trim().split(/\s+/).filter(Boolean).slice(0, 2)
    .map((w) => w[0].toUpperCase()).join("");

const timeAgo = (date) => {
  if (!date) return null;
  const diff  = Date.now() - new Date(date).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 2)    return "Just now";
  if (mins < 60)   return `${mins}m ago`;
  if (hours < 24)  return `${hours}h ago`;
  if (days === 1)  return "Yesterday";
  return `${days} days ago`;
};

const daysAgo = (date) => {
  if (!date) return null;
  return Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
};

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-AU", { month: "short", day: "numeric", year: "numeric" }) : "—";

const fmtCurrency = (v) =>
  v != null && v !== "" ? `$${Number(v).toLocaleString()}` : "—";

// ─── Health ────────────────────────────────────────────────────────────────────

const deriveHealth = (lastActivity) => {
  const days = daysAgo(lastActivity);
  if (days === null) return "Good";
  if (days <= 7)  return "Good";
  if (days <= 14) return "Needs Attention";
  return "At Risk";
};

const HEALTH_CONFIG = {
  Good:              { dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700 border border-emerald-200", icon: CheckCircle2, iconColor: "text-emerald-500" },
  "Needs Attention": { dot: "bg-amber-500",   badge: "bg-amber-50  text-amber-700  border border-amber-200",   icon: AlertTriangle, iconColor: "text-amber-500"   },
  "At Risk":         { dot: "bg-rose-500",    badge: "bg-rose-50   text-rose-700   border border-rose-200",    icon: AlertCircle,  iconColor: "text-rose-500"    },
};

// ─── Sub-components ────────────────────────────────────────────────────────────

const Avatar = ({ name = "", size = "md", className = "" }) => {
  const s = {
    sm: "w-7 h-7 text-[10px]",
    md: "w-9 h-9 text-xs",
    lg: "w-14 h-14 text-xl",
    xl: "w-20 h-20 text-3xl",
  }[size] || "w-9 h-9 text-xs";
  return (
    <div className={`${s} ${avatarBg(name)} rounded-full flex items-center justify-center text-white font-bold shrink-0 ${className}`}>
      {initials(name) || <Building2 size={size === "xl" ? 32 : size === "lg" ? 22 : 14} />}
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

const StatPill = ({ label, value, color = "text-slate-800" }) => (
  <div className="text-center px-4">
    <p className={`text-xl font-bold ${color}`}>{value}</p>
    <p className="text-[10px] font-medium text-slate-400 mt-0.5 whitespace-nowrap">{label}</p>
  </div>
);

const ACTIVITY_ICON_CONFIG = {
  "Phone Call":          { bg: "bg-emerald-100", color: "text-emerald-600", icon: Phone },
  "Email Sent":          { bg: "bg-blue-100",    color: "text-blue-600",    icon: Mail },
  "Note Added":          { bg: "bg-amber-100",   color: "text-amber-600",   icon: FileText },
  "Proposal Sent":       { bg: "bg-indigo-100",  color: "text-indigo-600",  icon: FileText },
  "Follow-up Scheduled": { bg: "bg-teal-100",    color: "text-teal-600",    icon: CalendarDays },
  "Company Created":     { bg: "bg-violet-100",  color: "text-violet-600",  icon: Building2 },
  "Customer Enquiry":    { bg: "bg-slate-100",   color: "text-slate-600",   icon: MessageSquare },
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

// ─── Edit Modal ────────────────────────────────────────────────────────────────

const INDUSTRIES = [
  "Legal Services", "Construction", "Accounting", "Manufacturing",
  "Technology", "Logistics", "Design", "Print & Signage",
  "Healthcare", "Finance", "Retail", "Education", "Real Estate", "Other",
];

const COMPANY_TYPES = [
  "Client", "Builder", "Developer", "Law Firm",
  "Bank", "Vendor", "Referral Partner", "Other",
];

function EditCompanyModal({ company, onClose, onSaved }) {
  const [form, setForm]     = useState({
    companyName:  company.companyName ?? "",
    industry:     company.industry    ?? "",
    companySize:  company.companySize ?? "",
    email:        company.email       ?? "",
    phone:        company.phone       ?? "",
    website:      company.website     ?? "",
    address:      company.address     ?? "",
    companyType:  company.companyType ?? "Client",
    tags:         company.tags        ?? [],
  });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = async () => {
    if (!form.companyName.trim()) { toast.error("Company name is required"); return; }
    setSaving(true);
    try {
      await crmAPI.updateCompany(company._id, form);
      toast.success("Company updated successfully");
      onSaved({ ...company, ...form });
      onClose();
    } catch (err) {
      toast.error(err.message || "Failed to update company");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Edit Company</h2>
            <p className="text-xs text-slate-400 mt-0.5">Update company information</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 transition text-slate-400 hover:text-slate-600">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* Company Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Company Name <span className="text-rose-500">*</span></label>
            <input
              value={form.companyName}
              onChange={(e) => set("companyName", e.target.value)}
              placeholder="Acme Corporation"
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2E3D99]/30 focus:border-[#2E3D99]/60"
            />
          </div>

          {/* Industry + Company Type + Company Size */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Industry</label>
              <select
                value={form.industry}
                onChange={(e) => set("industry", e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2E3D99]/30 focus:border-[#2E3D99]/60 bg-white"
              >
                <option value="">Select industry</option>
                {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Company Size</label>
              <select
                value={form.companySize}
                onChange={(e) => set("companySize", e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2E3D99]/30 focus:border-[#2E3D99]/60 bg-white"
              >
                <option value="">Select size</option>
                <option value="1-10">1-10</option>
                <option value="11-50">11-50</option>
                <option value="51-200">51-200</option>
                <option value="201-500">201-500</option>
                <option value="500+">500+</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Company Type</label>
              <select
                value={form.companyType}
                onChange={(e) => set("companyType", e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2E3D99]/30 focus:border-[#2E3D99]/60 bg-white"
              >
                <option value="">Select type</option>
                {COMPANY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Phone</label>
            <input
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="+61 4xx xxx xxx"
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2E3D99]/30 focus:border-[#2E3D99]/60"
            />
          </div>

          {/* Email + Website */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="info@company.com"
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2E3D99]/30 focus:border-[#2E3D99]/60"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Website</label>
              <input
                value={form.website}
                onChange={(e) => set("website", e.target.value)}
                placeholder="https://company.com"
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2E3D99]/30 focus:border-[#2E3D99]/60"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Address</label>
            <input
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
              placeholder="123 Main St, Sydney NSW 2000"
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2E3D99]/30 focus:border-[#2E3D99]/60"
            />
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] rounded-xl hover:opacity-90 transition disabled:opacity-50"
          >
            {saving ? (
              <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Saving…</>
            ) : "Save Changes"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Link Contact Modal ────────────────────────────────────────────────────────

function LinkContactModal({ companyId, alreadyLinked = [], onClose, onLinked }) {
  const [query,        setQuery]        = useState("");
  const [allContacts,  setAllContacts]  = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [selected,     setSelected]     = useState(new Set());
  const [linking,      setLinking]      = useState(false);

  // Fetch all contacts once on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await crmAPI.getAllContacts();
        const raw = Array.isArray(res?.data?.contacts) ? res.data.contacts
                  : Array.isArray(res?.data)           ? res.data
                  : Array.isArray(res)                 ? res
                  : [];
        // Filter out already linked ones
        const linkedIds = new Set(alreadyLinked.map(c => c._id ?? c.id));
        setAllContacts(raw.filter(c => !linkedIds.has(c._id ?? c.id)));
      } catch {
        toast.error("Failed to load contacts");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = allContacts.filter(c => {
    const name = `${c.firstName ?? ""} ${c.lastName ?? ""}`.toLowerCase();
    const q    = query.toLowerCase();
    return name.includes(q) || (c.email ?? "").toLowerCase().includes(q) || (c.phone ?? "").includes(q);
  });

  const toggle = (id) =>
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const handleLink = async () => {
    if (selected.size === 0) return;
    setLinking(true);
    const ids    = [...selected];
    const errors = [];
    for (const contactId of ids) {
      try {
        await crmAPI.linkContactToCompany(companyId, contactId);
      } catch {
        errors.push(contactId);
      }
    }
    setLinking(false);
    if (errors.length === 0) {
      toast.success(`${ids.length} contact${ids.length > 1 ? "s" : ""} linked successfully`);
    } else {
      toast.warning(`${ids.length - errors.length} linked, ${errors.length} failed`);
    }
    onLinked();
    onClose();
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
            <h2 className="text-base font-bold text-slate-900">Link Contacts</h2>
            <p className="text-xs text-slate-400 mt-0.5">Search and select contacts to link to this company</p>
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
              placeholder="Search by name, email or phone…"
              className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none"
            />
            {query && (
              <button onClick={() => setQuery("")} className="text-slate-400 hover:text-slate-600">
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Contact list */}
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-1.5">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-6 h-6 text-[#2E3D99] animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-10">
              <Users size={32} className="text-slate-200 mx-auto mb-2" />
              <p className="text-sm text-slate-400">
                {query ? "No contacts match your search" : "All contacts are already linked"}
              </p>
            </div>
          ) : (
            filtered.map(c => {
              const id   = c._id ?? c.id;
              const name = `${c.firstName ?? ""} ${c.lastName ?? ""}`.trim() || "Unknown";
              const checked = selected.has(id);
              return (
                <button
                  key={id}
                  onClick={() => toggle(id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all text-left ${
                    checked
                      ? "bg-[#2E3D99]/5 border-[#2E3D99]/30"
                      : "bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {/* Checkbox */}
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                    checked ? "bg-[#2E3D99] border-[#2E3D99]" : "border-slate-300"
                  }`}>
                    {checked && <CheckSquare size={10} className="text-white fill-white" />}
                  </div>
                  {/* Avatar */}
                  <div className={`w-8 h-8 ${avatarBg(name)} rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0`}>
                    {initials(name)}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800 truncate">{name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{c.email || c.phone || c.jobTitle || "—"}</p>
                  </div>
                  {/* Badge */}
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${
                    c.customerFlag
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-blue-50 text-blue-700 border-blue-200"
                  }`}>
                    {c.customerFlag ? "Customer" : "Lead"}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <span className="text-xs text-slate-400">
            {selected.size > 0 ? `${selected.size} contact${selected.size > 1 ? "s" : ""} selected` : "Select contacts above"}
          </span>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition">
              Cancel
            </button>
            <button
              onClick={handleLink}
              disabled={selected.size === 0 || linking}
              className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] rounded-xl hover:opacity-90 transition disabled:opacity-40"
            >
              {linking && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {linking ? "Linking…" : `Link ${selected.size > 0 ? selected.size : ""} Contact${selected.size !== 1 ? "s" : ""}`}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Create & Link Contact Modal ───────────────────────────────────────────────

const CONTACT_TYPES = ["Individual", "Company"];

const EMPTY_CONTACT_FORM = {
  firstName:   "",
  lastName:    "",
  contactType: "Individual",
  email:       "",
  phone:       "",
  jobTitle:    "",
  tags:        [],
  customerFlag: false,
};

function CreateContactModal({ companyId, onClose, onCreated }) {
  const [form,   setForm]   = useState(EMPTY_CONTACT_FORM);
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!form.firstName.trim()) { toast.error("First name is required"); return; }
    setSaving(true);
    try {
      const res = await crmAPI.createAndLinkContact(companyId, form);
      toast.success("Contact created and linked successfully");
      onCreated(res);
      onClose();
    } catch (err) {
      toast.error(err.message || "Failed to create contact");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Create New Contact</h2>
            <p className="text-xs text-slate-400 mt-0.5">Create a new contact and link them to this company</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 transition text-slate-400 hover:text-slate-600">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

          {/* First + Last Name */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">First Name <span className="text-rose-500">*</span></label>
              <input
                value={form.firstName}
                onChange={(e) => set("firstName", e.target.value)}
                placeholder="John"
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2E3D99]/30 focus:border-[#2E3D99]/60"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Last Name</label>
              <input
                value={form.lastName}
                onChange={(e) => set("lastName", e.target.value)}
                placeholder="Smith"
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2E3D99]/30 focus:border-[#2E3D99]/60"
              />
            </div>
          </div>

          {/* Contact Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Contact Type</label>
            <select
              value={form.contactType}
              onChange={(e) => set("contactType", e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2E3D99]/30 focus:border-[#2E3D99]/60 bg-white"
            >
              {CONTACT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Email + Phone */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="john@example.com"
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2E3D99]/30 focus:border-[#2E3D99]/60"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Phone</label>
              <input
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="+61 4xx xxx xxx"
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2E3D99]/30 focus:border-[#2E3D99]/60"
              />
            </div>
          </div>

          {/* Job Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Job Title</label>
            <input
              value={form.jobTitle}
              onChange={(e) => set("jobTitle", e.target.value)}
              placeholder="e.g. Project Manager"
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2E3D99]/30 focus:border-[#2E3D99]/60"
            />
          </div>

          {/* Customer Flag */}
          <button
            type="button"
            onClick={() => set("customerFlag", !form.customerFlag)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left ${
              form.customerFlag
                ? "border-[#2E3D99] bg-[#2E3D99]/5"
                : "border-slate-200 bg-slate-50 hover:border-slate-300"
            }`}
          >
            {/* Toggle */}
            <div className={`w-10 h-6 rounded-full relative transition-colors shrink-0 ${
              form.customerFlag ? "bg-[#2E3D99]" : "bg-slate-300"
            }`}>
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${
                form.customerFlag ? "left-5" : "left-1"
              }`} />
            </div>
            <div>
              <p className={`text-xs font-semibold transition-colors ${form.customerFlag ? "text-[#2E3D99]" : "text-slate-600"}`}>
                Mark as Customer
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {form.customerFlag ? "This contact will be tagged as Customer" : "This contact will be tagged as Lead"}
              </p>
            </div>
            {form.customerFlag && (
              <div className="ml-auto w-5 h-5 bg-[#2E3D99] rounded-full flex items-center justify-center shrink-0">
                <Check size={11} className="text-white" strokeWidth={3} />
              </div>
            )}
          </button>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] rounded-xl hover:opacity-90 transition disabled:opacity-50"
          >
            {saving ? (
              <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Creating…</>
            ) : "Create & Link"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function CompanyDetailPage() {
  const { companyId } = useParams();
  const navigate      = useNavigate();
  const location      = useLocation();

  const [company,     setCompany]     = useState(location.state?.company || null);
  const [loading,     setLoading]     = useState(!location.state?.company);
  const [showEdit,          setShowEdit]          = useState(false);
  const [showLinkContact,   setShowLinkContact]   = useState(false);
  const [showCreateContact, setShowCreateContact] = useState(false);
  const [unlinkingId,       setUnlinkingId]       = useState(null);
  const [activeTab,   setActiveTab]   = useState("overview"); // overview | contacts | leads | activity

  const loadCompany = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch company details and linked contacts in parallel
      const [companyRes, contactsRes] = await Promise.allSettled([
        crmAPI.getCompanyById(companyId),
        crmAPI.getCompanyContacts(companyId),
      ]);

      const raw = companyRes.status === "fulfilled"
        ? (companyRes.value?.data ?? companyRes.value?.company ?? companyRes.value)
        : null;

      if (!raw) throw new Error("Company not found");

      // Unwrap contacts — API returns { contactLists: { contacts: [...] } }
      const contactsRaw = contactsRes.status === "fulfilled"
        ? (contactsRes.value?.contactLists?.contacts
          ?? contactsRes.value?.data?.contacts
          ?? contactsRes.value?.contacts
          ?? (Array.isArray(contactsRes.value) ? contactsRes.value : []))
        : [];

      setCompany({ ...raw, contacts: contactsRaw });
    } catch (err) {
      console.error("Failed to load company:", err);
      toast.error("Could not load company details");
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => { loadCompany(); }, [loadCompany]);

  const handleUnlink = async (e, contactId) => {
    e.stopPropagation();
    setUnlinkingId(contactId);
    try {
      await crmAPI.unlinkContactFromCompany(companyId, contactId);
      toast.success("Contact unlinked");
      // Remove from local state immediately without full reload
      setCompany(prev => ({
        ...prev,
        contacts: (prev.contacts || []).filter(c => (c._id ?? c.id) !== contactId),
      }));
    } catch (err) {
      toast.error(err.message || "Failed to unlink contact");
    } finally {
      setUnlinkingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <Loader />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="flex items-center justify-center h-[70vh]">
          <div className="text-center">
            <Building2 size={40} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-semibold">Company not found</p>
            <button
              onClick={() => navigate("/admin/crm/companies")}
              className="mt-4 px-4 py-2 bg-[#2E3D99] text-white rounded-xl text-sm font-semibold hover:opacity-90 transition"
            >
              Back to Companies
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Derived data ──────────────────────────────────────────────────────────
  const lastActivity   = company.lastActivity ?? company.updatedAt ?? null;
  const health         = company.companyHealth ?? company.health ?? deriveHealth(lastActivity);
  const healthCfg      = HEALTH_CONFIG[health] || HEALTH_CONFIG["Good"];
  const HealthIcon     = healthCfg.icon;
  const days           = daysAgo(lastActivity);
  const contactsList   = Array.isArray(company.contacts)   ? company.contacts   : [];
  const leadsList      = Array.isArray(company.leads)       ? company.leads       : [];
  const dealsList      = Array.isArray(company.deals)       ? company.deals       : [];
  const activities     = Array.isArray(company.activities)  ? company.activities  : [];
  const tasks          = Array.isArray(company.tasks)        ? company.tasks        : [];
  const notes          = Array.isArray(company.notes)        ? company.notes        : [];
  const companyName    = company.companyName ?? company.name ?? "—";
  const assignedName   = company.assignedToName ?? company.assignedTo?.displayName ?? company.assignedTo?.name ?? "Unassigned";

  const TABS = [
    { key: "overview",  label: "Overview" },
    { key: "contacts",  label: `Contacts (${contactsList.length || (company.contacts ?? 0)})` },
    { key: "leads",     label: `Leads (${leadsList.length || (company.openLeads ?? 0)})` },
    { key: "activity",  label: "Activity & Notes" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="px-6 py-5 max-w-[1600px] mx-auto">

        {/* ── Page Title + Actions ─────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Company Profile</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              View company details, contacts, leads, deals, and activity history.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/admin/crm/companies")}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm"
            >
              <ArrowLeft size={13} />
              Back to Companies
            </button>
            <button
              onClick={() => setShowEdit(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm"
            >
              <Edit size={13} />
              Edit Company
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm">
              <Plus size={13} />
              Add Note
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] rounded-xl hover:opacity-90 transition-all shadow-sm">
              <Phone size={13} />
              Call
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] rounded-xl hover:opacity-90 transition-all shadow-sm">
              <Mail size={13} />
              Email
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-500 hover:bg-white hover:border hover:border-slate-200 transition-all shadow-sm">
              <MoreVertical size={15} />
            </button>
          </div>
        </div>

        {/* ── Profile Header Card ──────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-4">
          <div className="flex items-start gap-8">

            {/* Logo / Avatar + Name */}
            <div className="flex items-center gap-4 min-w-[240px]">
              <div className={`w-20 h-20 ${avatarBg(companyName)} rounded-2xl flex items-center justify-center text-white font-bold text-3xl shrink-0`}>
                {initials(companyName) || <Building2 size={32} />}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-bold text-slate-900">{companyName}</h2>
                  {company.isVip && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-600 border border-amber-200 rounded-lg text-[10px] font-bold">
                      <Star size={10} className="fill-amber-400 text-amber-400" />
                      VIP
                    </span>
                  )}
                </div>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-bold mt-1 border ${healthCfg.badge}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${healthCfg.dot}`} />
                  {health}
                </span>
                {company.industry && (
                  <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1">
                    <Briefcase size={11} className="text-slate-400" />
                    {company.industry}
                  </p>
                )}
                {company.companyType && (
                  <p className="text-xs text-slate-400 mt-0.5">{company.companyType}</p>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="w-px self-stretch bg-slate-100 mx-1" />

            {/* Quick Info */}
            <div className="flex-1 grid grid-cols-2 gap-x-10 gap-y-3">
              {/* Phone */}
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center shrink-0">
                  <Phone size={13} className="text-slate-500" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">{company.phone || "—"}</p>
                  <p className="text-[10px] text-slate-400">Phone</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center shrink-0">
                  <Mail size={13} className="text-slate-500" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 truncate max-w-[150px]">{company.email || "—"}</p>
                  <p className="text-[10px] text-slate-400">Email</p>
                </div>
              </div>

              {/* Website */}
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center shrink-0">
                  <Globe size={13} className="text-slate-500" />
                </div>
                <div>
                  {company.website ? (
                    <a
                      href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
                      target="_blank" rel="noreferrer"
                      className="text-xs font-bold text-[#1D97D7] hover:underline flex items-center gap-1"
                    >
                      {company.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                      <ExternalLink size={10} />
                    </a>
                  ) : (
                    <p className="text-xs font-bold text-slate-800">—</p>
                  )}
                  <p className="text-[10px] text-slate-400">Website</p>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center shrink-0">
                  <MapPin size={13} className="text-slate-500" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 truncate max-w-[150px]">{company.address || "—"}</p>
                  <p className="text-[10px] text-slate-400">Address</p>
                </div>
              </div>

              {/* Assigned To */}
              <div className="flex items-center gap-2.5">
                <Avatar name={assignedName} size="sm" />
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Account Owner</p>
                  <p className="text-xs font-bold text-slate-800">{assignedName}</p>
                </div>
              </div>

              {/* Last Activity */}
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center shrink-0">
                  <Activity size={13} className="text-slate-500" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">{timeAgo(lastActivity) || "—"}</p>
                  <p className="text-[10px] text-slate-400">Last Activity</p>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="w-px self-stretch bg-slate-100 mx-1" />

            {/* Stats Pills */}
            <div className="min-w-[200px] flex flex-col justify-center">
              <p className="text-xs font-bold text-slate-500 mb-3 text-center uppercase tracking-wider">Account Summary</p>
              <div className="grid grid-cols-2 gap-y-4">
                <StatPill
                  label="Total Contacts"
                  value={contactsList.length || company.contacts || 0}
                  color="text-[#2E3D99]"
                />
                <StatPill
                  label="Open Leads"
                  value={leadsList.length || company.openLeads || 0}
                  color="text-amber-600"
                />
                <StatPill
                  label="Open Deals"
                  value={dealsList.length || company.openDeals || 0}
                  color="text-teal-600"
                />
                <StatPill
                  label="Pipeline"
                  value={company.pipelineValue ? `$${Number(company.pipelineValue).toLocaleString()}` : "$0"}
                  color="text-emerald-600"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Tabs ─────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-1 mb-4 bg-white rounded-2xl border border-slate-100 shadow-sm p-1 w-fit">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
                activeTab === tab.key
                  ? "bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Tab Content ───────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >

            {/* ════════════════ OVERVIEW TAB ════════════════ */}
            {activeTab === "overview" && (
              <div className="grid grid-cols-3 gap-4">

                {/* Key Information */}
                <SectionCard
                  title="Key Information"
                  action={
                    <button
                      onClick={() => setShowEdit(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#2E3D99] bg-[#2E3D99]/5 border border-[#2E3D99]/20 rounded-lg hover:bg-[#2E3D99]/10 transition-colors"
                    >
                      <Edit size={11} />
                      Edit
                    </button>
                  }
                >
                  <div className="px-5 py-3">
                    <InfoRow label="Company Name"  value={companyName} />
                    <InfoRow label="Industry"      value={company.industry} />
                    <InfoRow label="Company Type"  value={company.companyType} />
                    <InfoRow label="Company Size"  value={company.companySize} />
                    <InfoRow label="ABN"           value={company.abn} />
                    <InfoRow label="Phone"         value={company.phone} />
                    <InfoRow label="Email"         value={
                      company.email
                        ? <a href={`mailto:${company.email}`} className="text-[#1D97D7] hover:underline">{company.email}</a>
                        : null
                    } />
                    <InfoRow label="Website"       value={
                      company.website
                        ? <a href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
                            target="_blank" rel="noreferrer"
                            className="text-[#1D97D7] hover:underline flex items-center gap-1">
                            {company.website.replace(/^https?:\/\//, "")}
                            <ExternalLink size={10} />
                          </a>
                        : null
                    } />
                    <InfoRow label="Address"       value={company.address} />
                    <InfoRow label="Account Owner" value={assignedName} />
                    <InfoRow label="Company Health" value={
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold border ${healthCfg.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${healthCfg.dot}`} />
                        {health}
                      </span>
                    } />
                    {company.isVip && (
                      <InfoRow label="VIP Status" value={
                        <span className="inline-flex items-center gap-1 text-amber-600 font-bold text-xs">
                          <Star size={11} className="fill-amber-400 text-amber-400" /> VIP Account
                        </span>
                      } />
                    )}
                    <InfoRow label="Last Activity" value={
                      lastActivity ? (
                        <span>
                          {timeAgo(lastActivity)}
                          <span className="text-slate-400 font-normal ml-1">({fmtDate(lastActivity)})</span>
                        </span>
                      ) : null
                    } />
                    <InfoRow label="Created"       value={fmtDate(company.createdAt)} />
                  </div>
                </SectionCard>

                {/* Recent Contacts */}
                <SectionCard
                  title={`Contacts (${contactsList.length || company.contacts || 0})`}
                  action={
                    <button
                      onClick={() => setActiveTab("contacts")}
                      className="flex items-center gap-1 text-xs font-semibold text-[#1D97D7] hover:underline"
                    >
                      View all <ChevronRight size={12} />
                    </button>
                  }
                >
                  <div className="px-5 py-3">
                    {contactsList.length === 0 ? (
                      <div className="text-center py-8">
                        <Users size={28} className="text-slate-200 mx-auto mb-2" />
                        <p className="text-xs text-slate-400">No contacts associated yet</p>
                        <div className="mt-3 flex items-center gap-2 justify-center">
                          <button onClick={() => setShowCreateContact(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#2E3D99] bg-[#2E3D99]/5 border border-[#2E3D99]/20 rounded-lg hover:bg-[#2E3D99]/10 transition-colors">
                            <Plus size={11} />
                            New Contact
                          </button>
                          <button onClick={() => setShowLinkContact(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors">
                            <Link2 size={11} />
                            Link Existing
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {contactsList.slice(0, 6).map((c, i) => {
                          const name = `${c.firstName || ""} ${c.lastName || ""}`.trim() || c.name || "Unknown";
                          const cId  = c._id ?? c.id;
                          return (
                            <div
                              key={cId || i}
                              className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0 hover:bg-slate-50 rounded-lg px-1 -mx-1 cursor-pointer transition group"
                              onClick={() => navigate(`/admin/crm/contacts/${cId}`, { state: { contact: c } })}
                            >
                              <Avatar name={name} size="sm" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-slate-800 truncate">{name}</p>
                                <p className="text-[11px] text-slate-400 truncate">{c.jobTitle || c.designation || c.email || "—"}</p>
                              </div>
                              {c.customerFlag
                                ? <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold rounded-md shrink-0">Customer</span>
                                : <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold rounded-md shrink-0">Lead</span>
                              }
                              <button
                                onClick={(e) => handleUnlink(e, cId)}
                                disabled={unlinkingId === cId}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-rose-50 text-slate-300 hover:text-rose-500 shrink-0"
                                title="Unlink contact"
                              >
                                {unlinkingId === cId
                                  ? <span className="w-3.5 h-3.5 border-2 border-rose-300 border-t-rose-500 rounded-full animate-spin block" />
                                  : <X size={13} />
                                }
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  {contactsList.length > 0 && (
                    <div className="px-5 pb-4">
                      <button
                        onClick={() => setActiveTab("contacts")}
                        className="flex items-center gap-1 text-xs font-semibold text-[#1D97D7] hover:underline"
                      >
                        View all contacts <ChevronRight size={12} />
                      </button>
                    </div>
                  )}
                </SectionCard>

                {/* Recent Leads */}
                <SectionCard
                  title={`Open Leads (${leadsList.length || company.openLeads || 0})`}
                  action={
                    <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] rounded-lg hover:opacity-90 transition-all shadow-sm">
                      <Plus size={11} />
                      New Lead
                    </button>
                  }
                >
                  <div className="px-5 py-3">
                    {leadsList.length === 0 ? (
                      <div className="text-center py-8">
                        <TrendingUp size={28} className="text-slate-200 mx-auto mb-2" />
                        <p className="text-xs text-slate-400">No leads associated yet</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="grid grid-cols-[1fr_80px_90px] gap-2 pb-1 border-b border-slate-100">
                          {["Lead Title", "Status", "Value"].map((h) => (
                            <span key={h} className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{h}</span>
                          ))}
                        </div>
                        {leadsList.slice(0, 5).map((lead, i) => (
                          <div
                            key={lead._id || lead.id || i}
                            className="grid grid-cols-[1fr_80px_90px] gap-2 items-center py-2 border-b border-slate-50 last:border-0 hover:bg-slate-50 rounded-lg px-1 -mx-1 cursor-pointer transition"
                            onClick={() => navigate(`/admin/crm/leads/${lead._id || lead.id}`, { state: { lead } })}
                          >
                            <span className="text-[11px] font-semibold text-slate-700 truncate">{lead.title || lead.leadTitle || "—"}</span>
                            <span className={`inline-flex px-1.5 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap ${LEAD_STAGE_STYLES[lead.status] || "bg-slate-100 text-slate-500"}`}>
                              {lead.status || "—"}
                            </span>
                            <span className="text-[11px] font-semibold text-slate-700">
                              {lead.value ? `$${Number(lead.value).toLocaleString()}` : "—"}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {leadsList.length > 0 && (
                    <div className="px-5 pb-4">
                      <button
                        onClick={() => setActiveTab("leads")}
                        className="flex items-center gap-1 text-xs font-semibold text-[#1D97D7] hover:underline"
                      >
                        View all leads <ChevronRight size={12} />
                      </button>
                    </div>
                  )}
                </SectionCard>
              </div>
            )}

            {/* ════════════════ CONTACTS TAB ════════════════ */}
            {activeTab === "contacts" && (
              <SectionCard
                title={`All Contacts (${contactsList.length})`}
                action={
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowCreateContact(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#2E3D99] bg-[#2E3D99]/5 border border-[#2E3D99]/20 rounded-lg hover:bg-[#2E3D99]/10 transition-colors"
                    >
                      <Plus size={11} />
                      New Contact
                    </button>
                    <button onClick={() => setShowLinkContact(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] rounded-lg hover:opacity-90 transition-all shadow-sm">
                      <Link2 size={11} />
                      Link Existing
                    </button>
                  </div>
                }
              >
                {contactsList.length === 0 ? (
                  <div className="text-center py-16">
                    <Users size={40} className="text-slate-200 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-slate-400">No contacts yet</p>
                    <p className="text-xs text-slate-400 mt-1">Add contacts to link them to this company.</p>
                  </div>
                ) : (
                  <div className="px-5 pb-4">
                    {/* Table header */}
                    <div className="grid grid-cols-[2fr_2fr_1.5fr_1fr_1fr_120px] gap-4 py-3 border-b border-slate-100">
                      {["Name", "Email", "Phone", "Role", "Status", "Actions"].map((h) => (
                        <span key={h} className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{h}</span>
                      ))}
                    </div>
                    {contactsList.map((c, i) => {
                      const name = `${c.firstName || ""} ${c.lastName || ""}`.trim() || c.name || "Unknown";
                      const cId  = c._id ?? c.id;
                      return (
                        <div
                          key={cId || i}
                          className="grid grid-cols-[2fr_2fr_1.5fr_1fr_1fr_120px] gap-4 items-center py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition cursor-pointer"
                          onClick={() => navigate(`/admin/crm/contacts/${cId}`, { state: { contact: c } })}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Avatar name={name} size="sm" />
                            <span className="text-xs font-semibold text-slate-800 truncate">{name}</span>
                          </div>
                          <span className="text-xs text-slate-600 truncate">{c.email || "—"}</span>
                          <span className="text-xs text-slate-600">{c.phone || "—"}</span>
                          <span className="text-xs text-slate-600 truncate">{c.jobTitle || c.designation || "—"}</span>
                          <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold w-fit ${
                            c.customerFlag
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-blue-50 text-blue-700 border border-blue-200"
                          }`}>
                            {c.customerFlag ? "Customer" : "Lead"}
                          </span>
                          <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                            <button
                              className="text-xs font-semibold text-[#1D97D7] hover:underline"
                              onClick={() => navigate(`/admin/crm/contacts/${cId}`, { state: { contact: c } })}
                            >
                              View
                            </button>
                            <span className="text-slate-200">|</span>
                            <button
                              onClick={(e) => handleUnlink(e, cId)}
                              disabled={unlinkingId === cId}
                              className="flex items-center gap-1 text-xs font-semibold text-rose-500 hover:text-rose-700 disabled:opacity-50 transition-colors"
                            >
                              {unlinkingId === cId
                                ? <span className="w-3 h-3 border-2 border-rose-300 border-t-rose-500 rounded-full animate-spin" />
                                : <X size={11} />
                              }
                              Unlink
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </SectionCard>
            )}

            {/* ════════════════ LEADS TAB ════════════════ */}
            {activeTab === "leads" && (
              <SectionCard
                title={`All Leads (${leadsList.length})`}
                action={
                  <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] rounded-lg hover:opacity-90 transition-all shadow-sm">
                    <Plus size={11} />
                    New Lead
                  </button>
                }
              >
                {leadsList.length === 0 ? (
                  <div className="text-center py-16">
                    <TrendingUp size={40} className="text-slate-200 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-slate-400">No leads yet</p>
                  </div>
                ) : (
                  <div className="px-5 pb-4">
                    <div className="grid grid-cols-[80px_2fr_1fr_1fr_1fr_80px] gap-4 py-3 border-b border-slate-100">
                      {["Lead ID", "Title", "Status", "Value", "Due Date", ""].map((h) => (
                        <span key={h} className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{h}</span>
                      ))}
                    </div>
                    {leadsList.map((lead, i) => (
                      <div
                        key={lead._id || lead.id || i}
                        className="grid grid-cols-[80px_2fr_1fr_1fr_1fr_80px] gap-4 items-center py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition cursor-pointer"
                        onClick={() => navigate(`/admin/crm/leads/${lead._id || lead.id}`, { state: { lead } })}
                      >
                        <span className="text-[#1D97D7] font-bold text-[11px]">
                          {lead.leadId || `LD-${(lead._id || lead.id || "").slice(-4).toUpperCase()}`}
                        </span>
                        <span className="text-xs font-semibold text-slate-800 truncate">{lead.title || lead.leadTitle || "—"}</span>
                        <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold w-fit ${LEAD_STAGE_STYLES[lead.status] || "bg-slate-100 text-slate-500"}`}>
                          {lead.status || "—"}
                        </span>
                        <span className="text-xs font-semibold text-slate-700">
                          {lead.value ? `$${Number(lead.value).toLocaleString()}` : "—"}
                        </span>
                        <span className="text-xs text-slate-500">{fmtDate(lead.dueDate)}</span>
                        <button className="text-xs font-semibold text-[#1D97D7] hover:underline">View →</button>
                      </div>
                    ))}
                  </div>
                )}
              </SectionCard>
            )}

            {/* ════════════════ ACTIVITY TAB ════════════════ */}
            {activeTab === "activity" && (
              <div className="grid grid-cols-3 gap-4">

                {/* Activity Feed */}
                <SectionCard
                  title="Interactions & Activity"
                  action={
                    <button className="flex items-center gap-1 text-xs font-semibold text-[#1D97D7] hover:underline">
                      View All <ChevronRight size={12} />
                    </button>
                  }
                  className="col-span-1"
                >
                  <div className="px-5 py-3 space-y-3">
                    {activities.length === 0 ? (
                      <div className="text-center py-8">
                        <Activity size={28} className="text-slate-200 mx-auto mb-2" />
                        <p className="text-xs text-slate-400">No activity recorded yet</p>
                      </div>
                    ) : activities.slice(0, 8).map((act, i) => {
                      const cfg   = ACTIVITY_ICON_CONFIG[act.type] || { bg: "bg-slate-100", color: "text-slate-500", icon: MessageSquare };
                      const IconC = cfg.icon;
                      return (
                        <div key={i} className="flex items-start gap-3">
                          <div className={`w-8 h-8 ${cfg.bg} rounded-full flex items-center justify-center shrink-0 mt-0.5`}>
                            <IconC size={14} className={cfg.color} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-xs font-semibold text-slate-800">{act.type}</p>
                              <span className="text-[10px] text-slate-400 shrink-0">{fmtDate(act.date)}</span>
                            </div>
                            <p className="text-[11px] text-slate-500 truncate mt-0.5">{act.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </SectionCard>

                {/* Tasks */}
                <SectionCard
                  title={`Tasks & Follow-ups (${tasks.length})`}
                  action={
                    <button className="flex items-center gap-1 text-xs font-semibold text-[#1D97D7] hover:underline">
                      View All <ChevronRight size={12} />
                    </button>
                  }
                >
                  <div className="px-5 py-3 space-y-3">
                    {tasks.length === 0 ? (
                      <div className="text-center py-8">
                        <CheckSquare size={28} className="text-slate-200 mx-auto mb-2" />
                        <p className="text-xs text-slate-400">No tasks yet</p>
                      </div>
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
                            <button className="text-slate-300 hover:text-slate-500 transition-colors shrink-0">
                              <MoreVertical size={13} />
                            </button>
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
                <SectionCard
                  title={`Notes (${notes.length})`}
                  action={
                    <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#2E3D99] bg-[#2E3D99]/5 border border-[#2E3D99]/20 rounded-lg hover:bg-[#2E3D99]/10 transition-colors">
                      <Plus size={11} />
                      Add Note
                    </button>
                  }
                >
                  <div className="px-5 py-3 space-y-3">
                    {notes.length === 0 ? (
                      <div className="text-center py-8">
                        <FileText size={28} className="text-slate-200 mx-auto mb-2" />
                        <p className="text-xs text-slate-400">No notes yet</p>
                      </div>
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
            )}

          </motion.div>
        </AnimatePresence>
      </main>

      {/* ── Edit Modal ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showEdit && (
          <EditCompanyModal
            company={company}
            onClose={() => setShowEdit(false)}
            onSaved={(updated) => setCompany((prev) => ({ ...prev, ...updated }))}
          />
        )}
      </AnimatePresence>

      {/* ── Link Contact Modal ───────────────────────────────────────── */}
      <AnimatePresence>
        {showLinkContact && (
          <LinkContactModal
            companyId={companyId}
            alreadyLinked={contactsList}
            onClose={() => setShowLinkContact(false)}
            onLinked={loadCompany}
          />
        )}
      </AnimatePresence>

      {/* ── Create & Link Contact Modal ──────────────────────────────── */}
      <AnimatePresence>
        {showCreateContact && (
          <CreateContactModal
            companyId={companyId}
            onClose={() => setShowCreateContact(false)}
            onCreated={loadCompany}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
