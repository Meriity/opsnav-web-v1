import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus, Search, Filter, Download, Eye, Edit, Trash2,
  Building2, Users, TrendingUp, AlertTriangle, AlertCircle,
  ChevronUp, ChevronDown, ArrowUpDown, ChevronLeft, ChevronRight,
  X, MoreVertical, Tag, Briefcase, CheckCircle2, Clock,
  Phone, Mail, MapPin, Globe, Star, ChevronDown as ChevronDownIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import Header from "../../components/layout/Header";
import { toast } from "react-toastify";
import crmAPI from "../../api/crmAPI";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const timeAgo = (date) => {
  if (!date) return null;
  const diff  = Date.now() - new Date(date).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 1)  return "Just now";
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

const daysAgo = (date) => {
  if (!date) return null;
  return Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
};

const getInitials = (name = "") =>
  name.trim().split(/\s+/).filter(Boolean).slice(0, 2)
    .map((w) => w[0].toUpperCase()).join("");

const AVATAR_COLORS = [
  "bg-blue-500", "bg-violet-500", "bg-teal-500", "bg-amber-500",
  "bg-rose-500",  "bg-indigo-500", "bg-emerald-500", "bg-orange-500",
  "bg-cyan-500",  "bg-pink-500",
];
const avatarColor = (name = "") => {
  const code = [...name].reduce((a, c) => a + c.charCodeAt(0), 0);
  return AVATAR_COLORS[code % AVATAR_COLORS.length];
};

// Company health derived from last activity
const deriveHealth = (lastActivity) => {
  const days = daysAgo(lastActivity);
  if (days === null) return "Good";
  if (days <= 7)  return "Good";
  if (days <= 14) return "Needs Attention";
  return "At Risk";
};

// ─── Normalizer ───────────────────────────────────────────────────────────────

const normalizeCompany = (c) => {
  const lastActivity = c.lastActivity ?? c.updatedAt ?? null;
  const health       = c.companyHealth ?? c.health ?? deriveHealth(lastActivity);
  return {
    ...c,
    id:            c._id ?? c.id,
    _id:           c._id ?? c.id,
    companyName:   c.companyName ?? c.name ?? "",
    industry:      c.industry    ?? "",
    abn:           c.abn         ?? c.ABN ?? "",
    isVip:         c.isVip       ?? c.vip ?? false,
    health,
    contacts:      c.contacts    ?? c.contactCount ?? 0,
    openLeads:     c.openLeads   ?? 0,
    openDeals:     c.openDeals   ?? 0,
    pipelineValue: c.pipelineValue ?? 0,
    assignedTo:    c.assignedTo  ?? null,
    assignedToName: c.assignedToName
                    ?? c.assignedTo?.displayName
                    ?? c.assignedTo?.name
                    ?? null,
    lastActivity,
    createdAt:     c.createdAt   ?? null,
  };
};

// ─── Constants ────────────────────────────────────────────────────────────────

const HEALTH_CONFIG = {
  Good:            { dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700 border-emerald-200",  label: "Good",            sub: "Active" },
  "Needs Attention":{ dot: "bg-amber-500",  badge: "bg-amber-50  text-amber-700  border-amber-200",  label: "Needs Attention", sub: (days) => `No activity ${days}d` },
  "At Risk":       { dot: "bg-rose-500",    badge: "bg-rose-50   text-rose-700   border-rose-200",   label: "At Risk",         sub: (days) => `No activity ${days}d` },
};

const INDUSTRIES = [
  "All", "Legal Services", "Construction", "Accounting", "Manufacturing",
  "Technology", "Logistics", "Design", "Print & Signage", "Healthcare",
  "Finance", "Retail", "Education", "Real Estate", "Other",
];

const COMPANY_TYPES = [
  "Client", "Builder", "Developer", "Law Firm",
  "Bank", "Vendor", "Referral Partner", "Other",
];

const HEALTH_OPTIONS = ["All", "Good", "Needs Attention", "At Risk"];

const ITEMS_PER_PAGE_OPTIONS = [10, 20, 50];

const TABLE_COLS = [
  { key: "companyName",   label: "Company Name",    sortable: true,  center: false },
  { key: "industry",      label: "Industry",         sortable: true,  center: false, hideOn: "lg" },
  { key: "companySize",   label: "Company Size",     sortable: true,  center: false, hideOn: "lg" },
  { key: "health",        label: "Company Health",   sortable: false, center: false },
  { key: "contacts",      label: "Contacts",         sortable: true,  center: true  },
  { key: "openLeads",     label: "Open Leads",       sortable: true,  center: true,  hideOn: "xl" },
  { key: "openDeals",     label: "Open Deals",       sortable: true,  center: true,  hideOn: "xl" },
  { key: "pipelineValue", label: "Pipeline Value",   sortable: true,  center: true,  hideOn: "xl" },
  { key: "lastActivity",  label: "Last Activity",    sortable: true,  center: true,  hideOn: "xl" },
  { key: "assignedTo",    label: "Assigned To",      sortable: false, center: true,  hideOn: "lg" },
  { key: "actions",       label: "Actions",          sortable: false, center: true  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const Avatar = ({ name = "", size = "md", className = "" }) => {
  const sz = size === "sm" ? "w-7 h-7 text-[10px]" : size === "lg" ? "w-10 h-10 text-sm" : "w-9 h-9 text-xs";
  return (
    <div className={`${sz} ${avatarColor(name)} rounded-xl flex items-center justify-center text-white font-bold shrink-0 ${className}`}>
      {getInitials(name) || "?"}
    </div>
  );
};

const StatCard = ({ icon: Icon, title, value, sub, iconBg, iconColor, barColor, barWidth, loading, className = "" }) => (
  <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-5 flex flex-col sm:flex-row items-start gap-3 sm:gap-4 hover:shadow-md transition-shadow h-full ${className}`}>
    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
      <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${iconColor}`} />
    </div>
    <div className="flex-1 min-w-0 w-full">
      <p className="text-[11px] sm:text-xs font-medium text-slate-500 truncate">{title}</p>
      {loading
        ? <div className="h-7 w-16 bg-slate-100 animate-pulse rounded mt-1" />
        : <p className="text-2xl font-bold text-slate-900 mt-0.5">{value}</p>
      }
      {sub && !loading && (
        <div className="mt-2">
          {barColor && (
            <div className="h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
              <div className={`h-full rounded-full ${barColor}`} style={{ width: barWidth ?? "0%" }} />
            </div>
          )}
          <p className={`text-[10px] sm:text-[11px] font-medium mt-1 truncate ${barColor ? "text-slate-500" : "text-emerald-600"}`}>{sub}</p>
        </div>
      )}
    </div>
  </div>
);

const HealthBadge = ({ health, lastActivity }) => {
  const cfg  = HEALTH_CONFIG[health] ?? HEALTH_CONFIG["Good"];
  const days = daysAgo(lastActivity);
  const sub  = typeof cfg.sub === "function" ? cfg.sub(days ?? 0) : cfg.sub;
  return (
    <div className="flex flex-col gap-0.5">
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${cfg.badge}`}>
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
        {cfg.label}
      </span>
      <span className="text-[10px] text-slate-400 pl-1">{sub}</span>
    </div>
  );
};

const SortIcon = ({ col, sortConfig }) => {
  if (sortConfig.key !== col) return <ArrowUpDown size={11} className="text-white/40" />;
  return sortConfig.direction === "asc"
    ? <ChevronUp size={11} className="text-white" />
    : <ChevronDown size={11} className="text-white" />;
};

// ─── FilterDropdown ───────────────────────────────────────────────────────────

const FilterDropdown = ({ label, value, options, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition-all ${
          value !== "All" && value !== ""
            ? "bg-[#2E3D99]/10 text-[#2E3D99] border-[#2E3D99]/30"
            : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
        }`}
      >
        {label}{value !== "All" && value !== "" ? `: ${value}` : ""}
        <ChevronDownIcon size={12} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute top-full left-0 mt-1 w-48 bg-white rounded-xl border border-slate-100 shadow-xl z-50 py-1 overflow-hidden"
          >
            {options.map(opt => (
              <button
                key={opt}
                onClick={() => { onChange(opt); setOpen(false); }}
                className={`w-full text-left px-3 py-2 text-xs font-medium transition-colors ${
                  value === opt
                    ? "bg-[#2E3D99] text-white"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                {opt}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Add / Edit Modal ─────────────────────────────────────────────────────────

const CompanyFormModal = ({ isOpen, onClose, onSave, initialData = null }) => {
  const [form, setForm] = useState({
    companyName: "", industry: "", companySize: "", email: "",
    phone: "", website: "", address: "", companyType: "Client", tags: [],
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm(initialData ? {
        companyName: initialData.companyName || "",
        industry:    initialData.industry    || "",
        companySize: initialData.companySize || "",
        email:       initialData.email       || "",
        phone:       initialData.phone       || "",
        website:     initialData.website     || "",
        address:     initialData.address     || "",
        companyType: initialData.companyType || "Client",
        tags:        initialData.tags        || [],
      } : { companyName: "", industry: "", companySize: "", email: "", phone: "", website: "", address: "", companyType: "Client", tags: [] });
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.companyName.trim()) { toast.error("Company name is required"); return; }
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  };

  const field = (label, key, type = "text", placeholder = "") => (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1.5">{label}</label>
      <input
        type={type} value={form[key]} placeholder={placeholder}
        onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
        className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2E3D99]/30 focus:border-[#2E3D99] transition-all"
      />
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onClose={onClose} className="relative z-[1000]">
          <DialogBackdrop className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="fixed inset-0 z-10 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-xl"
            >
              <DialogPanel className="bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">
                      {initialData ? "Edit Company" : "Add Company"}
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {initialData ? "Update company details" : "Create a new company in your CRM"}
                    </p>
                  </div>
                  <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Company Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Company Name *</label>
                    <input
                      type="text" value={form.companyName} placeholder="e.g. NFNLabs Pty Ltd"
                      onChange={e => setForm(p => ({ ...p, companyName: e.target.value }))}
                      className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2E3D99]/30 focus:border-[#2E3D99] transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {/* Industry */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">Industry</label>
                      <select
                        value={form.industry}
                        onChange={e => setForm(p => ({ ...p, industry: e.target.value }))}
                        className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2E3D99]/30 focus:border-[#2E3D99] transition-all bg-white"
                      >
                        <option value="">Select industry</option>
                        {INDUSTRIES.filter(i => i !== "All").map(i => <option key={i}>{i}</option>)}
                      </select>
                    </div>
                    {/* Company Size */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">Company Size</label>
                      <select
                        value={form.companySize}
                        onChange={e => setForm(p => ({ ...p, companySize: e.target.value }))}
                        className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2E3D99]/30 focus:border-[#2E3D99] transition-all bg-white"
                      >
                        <option value="">Select size</option>
                        <option value="1-10">1-10</option>
                        <option value="11-50">11-50</option>
                        <option value="51-200">51-200</option>
                        <option value="201-500">201-500</option>
                        <option value="500+">500+</option>
                      </select>
                    </div>
                    {/* Company Type */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">Company Type</label>
                      <select
                        value={form.companyType}
                        onChange={e => setForm(p => ({ ...p, companyType: e.target.value }))}
                        className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2E3D99]/30 focus:border-[#2E3D99] transition-all bg-white"
                      >
                        {COMPANY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {field("Email", "email", "email", "info@company.com")}
                    {field("Phone", "phone", "tel",   "+61 4xx xxx xxx")}
                  </div>

                  {field("Website", "website", "text", "https://company.com")}
                  {field("Address", "address", "text", "Street, City, State, Postcode")}

                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={onClose}
                      className="flex-1 bg-slate-100 text-slate-700 font-semibold py-2.5 rounded-xl hover:bg-slate-200 transition-all text-sm">
                      Cancel
                    </button>
                    <button type="submit" disabled={saving}
                      className="flex-1 bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white font-semibold py-2.5 rounded-xl hover:opacity-90 transition-all text-sm shadow-sm disabled:opacity-60 flex items-center justify-center gap-2">
                      {saving && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                      {saving ? (initialData ? "Saving…" : "Adding…") : (initialData ? "Save Changes" : "Add Company")}
                    </button>
                  </div>
                </form>
              </DialogPanel>
            </motion.div>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  );
};

// ─── Delete Confirm ───────────────────────────────────────────────────────────

const DeleteModal = ({ company, onClose, onConfirm }) => (
  <Dialog open={!!company} onClose={onClose} className="relative z-[1000]">
    <DialogBackdrop className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
    <div className="fixed inset-0 z-10 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md">
        <DialogPanel className="bg-white rounded-2xl p-6 shadow-2xl border border-slate-100">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-7 h-7 text-rose-500" />
            </div>
            <h2 className="text-lg font-bold text-slate-800 mb-2">Delete Company</h2>
            <p className="text-sm text-slate-500">
              Are you sure you want to delete{" "}
              <span className="font-bold text-slate-800">{company?.companyName}</span>?
              {" "}This action cannot be undone.
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={onClose}
              className="flex-1 bg-slate-100 text-slate-700 font-semibold py-2.5 rounded-xl hover:bg-slate-200 transition-all text-sm">
              Cancel
            </button>
            <button onClick={onConfirm}
              className="flex-1 bg-rose-500 text-white font-semibold py-2.5 rounded-xl hover:bg-rose-600 transition-all text-sm">
              Delete Company
            </button>
          </div>
        </DialogPanel>
      </motion.div>
    </div>
  </Dialog>
);

// ─── Main Page ────────────────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 10;

export default function Companies() {
  const navigate = useNavigate();

  const [companies,    setCompanies]    = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");
  const [healthFilter, setHealthFilter] = useState("All");
  const [industryFilter, setIndustryFilter] = useState("All");
  const [sortConfig,   setSortConfig]   = useState({ key: "companyName", direction: "asc" });
  const [currentPage,  setCurrentPage]  = useState(1);
  const [perPage,      setPerPage]      = useState(ITEMS_PER_PAGE);
  const [selected,     setSelected]     = useState(new Set());
  const [formState,    setFormState]    = useState({ isOpen: false, company: null });
  const [deleteCompany, setDeleteCompany] = useState(null);

  // ── Fetch ──
  const loadCompanies = useCallback(async () => {
    setLoading(true);
    try {
      const res = await crmAPI.getAllCompanies();
      // Handle: bare array | { data: { companies: [...] } } | { data: [...] }
      const raw = Array.isArray(res) ? res
                : Array.isArray(res?.data?.companies) ? res.data.companies
                : Array.isArray(res?.data) ? res.data
                : [];
      setCompanies(raw.map(normalizeCompany));
    } catch (err) {
      console.error("Failed to load companies:", err);
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadCompanies(); }, [loadCompanies]);

  // ── Stats ──
  const stats = useMemo(() => {
    const total          = companies.length;
    const good           = companies.filter(c => c.health === "Good").length;
    const needsAttention = companies.filter(c => c.health === "Needs Attention").length;
    const atRisk         = companies.filter(c => c.health === "At Risk").length;
    const totalContacts  = companies.reduce((s, c) => s + (c.contacts ?? 0), 0);
    return { total, good, needsAttention, atRisk, totalContacts };
  }, [companies]);

  // ── Filter & Search ──
  const filtered = useMemo(() => {
    let list = [...companies];
    if (healthFilter !== "All")   list = list.filter(c => c.health === healthFilter);
    if (industryFilter !== "All") list = list.filter(c => c.industry === industryFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c =>
        (c.companyName || "").toLowerCase().includes(q) ||
        (c.abn         || "").toLowerCase().includes(q) ||
        (c.phone       || "").toLowerCase().includes(q) ||
        (c.email       || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [companies, healthFilter, industryFilter, search]);

  // ── Sort ──
  const sorted = useMemo(() => {
    const list = [...filtered];
    list.sort((a, b) => {
      let av = a[sortConfig.key] ?? "";
      let bv = b[sortConfig.key] ?? "";
      if (typeof av === "string") av = av.toLowerCase();
      if (typeof bv === "string") bv = bv.toLowerCase();
      if (av < bv) return sortConfig.direction === "asc" ? -1 :  1;
      if (av > bv) return sortConfig.direction === "asc" ?  1 : -1;
      return 0;
    });
    return list;
  }, [filtered, sortConfig]);

  // ── Paginate ──
  const totalPages = Math.max(1, Math.ceil(sorted.length / perPage));
  const paginated  = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return sorted.slice(start, start + perPage);
  }, [sorted, currentPage, perPage]);

  const handleSort = (key) => {
    setSortConfig(prev =>
      prev.key === key
        ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" }
    );
    setCurrentPage(1);
  };

  // ── Select all on page ──
  const allPageSelected = paginated.length > 0 && paginated.every(c => selected.has(c.id));
  const toggleSelectAll = () => {
    setSelected(prev => {
      const next = new Set(prev);
      if (allPageSelected) paginated.forEach(c => next.delete(c.id));
      else                  paginated.forEach(c => next.add(c.id));
      return next;
    });
  };

  // ── Save (create / edit) ──
  const handleSave = async (formData) => {
    try {
      if (formState.company) {
        await crmAPI.updateCompany(formState.company._id, formData);
        toast.success("Company updated");
      } else {
        await crmAPI.createCompany(formData);
        toast.success("Company added");
      }
      setFormState({ isOpen: false, company: null });
      loadCompanies();
    } catch (err) {
      toast.error(err.message || "Failed to save company");
      throw err;
    }
  };

  // ── Delete ──
  const handleDelete = async () => {
    if (!deleteCompany) return;
    try {
      await crmAPI.deleteCompany(deleteCompany._id);
      toast.success("Company deleted");
      setDeleteCompany(null);
      loadCompanies();
    } catch (err) {
      toast.error(err.message || "Failed to delete company");
    }
  };

  // clear all filters
  const clearFilters = () => { setSearch(""); setHealthFilter("All"); setIndustryFilter("All"); setCurrentPage(1); };
  const hasFilter    = search || healthFilter !== "All" || industryFilter !== "All";

  // shared cell classes
  const cell  = "px-4 py-3 bg-white border-y border-slate-100 transition-colors group-hover:bg-blue-50/40";
  const cellL = `${cell} rounded-l-xl border-l`;
  const cellR = `${cell} rounded-r-xl border-r`;

  // Page numbers
  const pageNums = useMemo(() => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3)          pages.push("...");
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  }, [totalPages, currentPage]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="px-6 py-6 max-w-[1600px] mx-auto">

        {/* ── Page Header ─────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2 truncate">
              Companies
            </h1>
            <p className="text-sm text-slate-500 mt-0.5 truncate md:whitespace-normal">Manage all companies and their contacts</p>
          </div>
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0">
            <button className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm">
              <Filter size={14} />
              Filters
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm">
              <Download size={14} />
              Export
            </button>
            <button
              onClick={() => setFormState({ isOpen: true, company: null })}
              className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] rounded-xl hover:opacity-90 transition-all shadow-sm"
            >
              <Plus size={16} />
              Add Company
            </button>
          </div>
        </div>

        {/* ── Stat Cards ──────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 mb-6">
          <StatCard
            icon={Building2} title="Total Companies"
            value={stats.total.toLocaleString()}
            iconBg="bg-blue-50" iconColor="text-[#2E3D99]"
            loading={loading}
          />
          <StatCard
            icon={CheckCircle2} title="Active / Good"
            value={`${stats.good} (${stats.total ? Math.round(stats.good / stats.total * 100) : 0}%)`}
            sub="Healthy"
            barColor="bg-emerald-500"
            barWidth={`${stats.total ? (stats.good / stats.total * 100) : 0}%`}
            iconBg="bg-emerald-50" iconColor="text-emerald-600"
            loading={loading}
          />
          <StatCard
            icon={AlertTriangle} title="Needs Attention"
            value={`${stats.needsAttention} (${stats.total ? Math.round(stats.needsAttention / stats.total * 100) : 0}%)`}
            sub="Focus Required"
            barColor="bg-amber-400"
            barWidth={`${stats.total ? (stats.needsAttention / stats.total * 100) : 0}%`}
            iconBg="bg-amber-50" iconColor="text-amber-600"
            loading={loading}
          />
          <StatCard
            icon={AlertCircle} title="At Risk"
            value={`${stats.atRisk} (${stats.total ? Math.round(stats.atRisk / stats.total * 100) : 0}%)`}
            sub="Immediate Action"
            barColor="bg-rose-500"
            barWidth={`${stats.total ? (stats.atRisk / stats.total * 100) : 0}%`}
            iconBg="bg-rose-50" iconColor="text-rose-600"
            loading={loading}
          />
          <StatCard
            className="col-span-2 lg:col-span-2 xl:col-span-1"
            icon={Users} title="Total Contacts"
            value={stats.totalContacts.toLocaleString()}
            sub="Across all companies"
            iconBg="bg-violet-50" iconColor="text-violet-600"
            loading={loading}
          />
        </div>

        {/* ── Table Card ──────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">

          {/* Search + Filter bar */}
          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 px-5 py-4 border-b border-slate-100">
            {/* Search */}
            <div className="relative flex-1 w-full sm:min-w-[220px] sm:max-w-sm">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text" value={search}
                onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                placeholder="Search companies, ABN, phone..."
                className="w-full pl-8 pr-3 py-2 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2E3D99]/20 focus:border-[#2E3D99] bg-slate-50 transition-all"
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-3">

            <FilterDropdown label="Company Health" value={healthFilter}   options={HEALTH_OPTIONS} onChange={v => { setHealthFilter(v);   setCurrentPage(1); }} />
            <FilterDropdown label="Industry"       value={industryFilter} options={INDUSTRIES}     onChange={v => { setIndustryFilter(v); setCurrentPage(1); }} />
            </div>

            {hasFilter && (
              <button onClick={clearFilters}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 border border-rose-200 rounded-xl hover:bg-rose-50 transition-all">
                <X size={12} />
                Clear
              </button>
            )}

            {/* Results count pushed to right */}
            <div className="ml-auto text-xs text-slate-400 font-medium hidden sm:block">
              Showing {Math.min((currentPage - 1) * perPage + 1, sorted.length || 0)} to{" "}
              {Math.min(currentPage * perPage, sorted.length)} of {sorted.length.toLocaleString()} companies
            </div>
          </div>

          {/* Table (Hidden on Mobile) */}
          <div className="hidden md:block overflow-x-auto px-3 pb-3">
            <table className="w-full text-sm border-separate border-spacing-y-1.5">
              <thead>
                <tr className="bg-gradient-to-r from-[#2E3D99] to-[#1D97D7]">
                  {/* Checkbox */}
                  <th className="pl-4 pr-2 py-3 rounded-l-xl w-8">
                    <input
                      type="checkbox" checked={allPageSelected && paginated.length > 0}
                      onChange={toggleSelectAll}
                      className="w-3.5 h-3.5 accent-white cursor-pointer"
                    />
                  </th>
                  {TABLE_COLS.map((col, idx) => {
                    const hiddenClass = col.hideOn ? `hidden ${col.hideOn}:table-cell` : "";
                    return (
                      <th
                        key={col.key}
                        onClick={col.sortable ? () => handleSort(col.key) : undefined}
                        className={[
                          "px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-white/90 whitespace-nowrap",
                          col.center ? "text-center" : "text-left",
                          col.sortable ? "cursor-pointer hover:text-white select-none" : "",
                          idx === TABLE_COLS.length - 1 ? "rounded-r-xl" : "",
                          hiddenClass
                        ].filter(Boolean).join(" ")}
                      >
                        <div className={`flex items-center gap-1.5 ${col.center ? "justify-center" : ""}`}>
                          {col.label}
                          {col.sortable && <SortIcon col={col.key} sortConfig={sortConfig} />}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="pl-4 pr-2 py-3 bg-white border-y border-l border-slate-100 rounded-l-xl w-8">
                        <div className="h-3.5 w-3.5 bg-slate-100 rounded" />
                      </td>
                      {TABLE_COLS.map((col, j) => {
                        const hiddenClass = col.hideOn ? `hidden ${col.hideOn}:table-cell` : "";
                        return (
                          <td key={j} className={`px-4 py-3 bg-white border-y border-slate-100 ${j === TABLE_COLS.length - 1 ? "rounded-r-xl border-r" : ""} ${hiddenClass}`}>
                            <div className="h-4 bg-slate-100 rounded w-full" />
                          </td>
                        );
                      })}
                    </tr>
                  ))
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan={TABLE_COLS.length + 1} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                          <Building2 size={28} className="text-slate-300" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-600">No companies found</p>
                          <p className="text-xs text-slate-400 mt-1">
                            {hasFilter ? "Try adjusting your search or filters" : "Add your first company to get started"}
                          </p>
                        </div>
                        {!hasFilter && (
                          <button
                            onClick={() => setFormState({ isOpen: true, company: null })}
                            className="mt-1 flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] rounded-xl hover:opacity-90 transition-all"
                          >
                            <Plus size={13} />
                            Add Company
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : paginated.map((company) => {
                  const days = daysAgo(company.lastActivity);
                  const isSelected = selected.has(company.id);

                  return (
                    <tr
                      key={company.id}
                      className={`cursor-pointer group ${isSelected ? "ring-1 ring-[#2E3D99]/20 rounded-xl" : ""}`}
                      onClick={() => navigate(`/admin/crm/companies/${company.id}`)}
                    >
                      {/* Checkbox */}
                      <td
                        className={`${cellL} w-8 pl-4 pr-2`}
                        onClick={e => { e.stopPropagation(); setSelected(prev => { const n = new Set(prev); n.has(company.id) ? n.delete(company.id) : n.add(company.id); return n; }); }}
                      >
                        <input
                          type="checkbox" checked={isSelected} onChange={() => {}}
                          className="w-3.5 h-3.5 accent-[#2E3D99] cursor-pointer"
                        />
                      </td>

                      {/* Company Name */}
                      <td className={cell}>
                        <div className="flex items-center gap-3 min-w-[180px]">
                          <Avatar name={company.companyName} size="md" className="rounded-xl" />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-slate-800 whitespace-nowrap">
                                {company.companyName || "—"}
                              </span>
                              {company.isVip && (
                                <span className="px-1.5 py-0.5 bg-amber-50 border border-amber-200 text-amber-600 text-[9px] font-black rounded-md tracking-wide">VIP</span>
                              )}
                              {company.health === "At Risk" && (
                                <span className="px-1.5 py-0.5 bg-rose-50 border border-rose-200 text-rose-600 text-[9px] font-black rounded-md tracking-wide">At Risk</span>
                              )}
                            </div>
                            {company.abn && (
                              <p className="text-[10px] text-slate-400 mt-0.5">ABN {company.abn}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Industry */}
                      <td className={`${cell} hidden lg:table-cell`}>
                        {company.industry ? (
                          <div className="flex items-center gap-1.5">
                            <Briefcase size={11} className="text-slate-400 shrink-0" />
                            <span className="text-xs font-medium text-slate-600 whitespace-nowrap">{company.industry}</span>
                          </div>
                        ) : <span className="text-slate-300">—</span>}
                      </td>

                      {/* Company Size */}
                      <td className={`${cell} hidden lg:table-cell`}>
                        {company.companySize ? (
                          <span className="text-xs font-medium text-slate-600 whitespace-nowrap">{company.companySize}</span>
                        ) : <span className="text-slate-300">—</span>}
                      </td>

                      {/* Company Health */}
                      <td className={cell}>
                        <HealthBadge health={company.health} lastActivity={company.lastActivity} />
                      </td>

                      {/* Contacts */}
                      <td className={`${cell} text-center`}>
                        <span className="text-xs font-bold text-slate-700">{company.contacts ?? 0}</span>
                      </td>

                      {/* Open Leads */}
                      <td className={`${cell} text-center hidden xl:table-cell`}>
                        <span className={`text-xs font-bold ${(company.openLeads ?? 0) > 0 ? "text-[#2E3D99]" : "text-slate-300"}`}>
                          {company.openLeads ?? 0}
                        </span>
                      </td>

                      {/* Open Deals */}
                      <td className={`${cell} text-center hidden xl:table-cell`}>
                        <span className={`text-xs font-bold ${(company.openDeals ?? 0) > 0 ? "text-[#2E3D99]" : "text-slate-300"}`}>
                          {company.openDeals ?? 0}
                        </span>
                      </td>

                      {/* Pipeline Value */}
                      <td className={`${cell} text-center hidden xl:table-cell`}>
                        <span className="text-xs font-bold text-slate-700">
                          {company.pipelineValue
                            ? `$${Number(company.pipelineValue).toLocaleString()}`
                            : <span className="text-slate-300 font-medium">—</span>}
                        </span>
                      </td>

                      {/* Last Activity */}
                      <td className={`${cell} text-center hidden xl:table-cell`}>
                        {company.lastActivity ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                              (days ?? 0) <= 1  ? "bg-emerald-400"
                            : (days ?? 0) <= 7  ? "bg-emerald-400"
                            : (days ?? 0) <= 14 ? "bg-amber-400"
                            :                    "bg-rose-400"
                            }`} />
                            <span className="text-xs font-medium text-slate-600 whitespace-nowrap">{timeAgo(company.lastActivity)}</span>
                          </div>
                        ) : <span className="text-slate-300 text-xs">—</span>}
                      </td>

                      {/* Assigned To */}
                      <td className={`${cell} text-center hidden lg:table-cell`}>
                        {company.assignedToName ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <div className={`w-6 h-6 rounded-full ${avatarColor(company.assignedToName)} flex items-center justify-center text-white text-[9px] font-bold shrink-0`}>
                              {getInitials(company.assignedToName)}
                            </div>
                            <span className="text-xs font-medium text-slate-600 whitespace-nowrap hidden xl:inline">{company.assignedToName}</span>
                          </div>
                        ) : <span className="text-slate-300 text-xs">—</span>}
                      </td>

                      {/* Actions */}
                      <td className={`${cellR} text-center`} onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-0.5">
                          <button
                            onClick={() => navigate(`/admin/crm/companies/${company.id}`)}
                            title="View" className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-[#2E3D99] hover:bg-[#2E3D99]/10 transition-colors">
                            <Eye size={13} />
                          </button>
                          <button
                            onClick={() => setFormState({ isOpen: true, company })}
                            title="Edit" className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                            <Edit size={13} />
                          </button>
                          <button
                            onClick={() => setDeleteCompany(company)}
                            title="Delete" className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors">
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

          {/* ── Mobile Card View ── */}
          <div className="block md:hidden border-t border-slate-100 bg-slate-50/50">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="p-4 border-b border-slate-100 bg-white animate-pulse">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 bg-slate-200 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-200 rounded w-1/2" />
                      <div className="h-3 bg-slate-200 rounded w-1/3" />
                    </div>
                  </div>
                </div>
              ))
            ) : paginated.length === 0 ? (
              <div className="p-8 text-center bg-white">
                <p className="text-sm font-semibold text-slate-600">No companies found</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {paginated.map((company) => {
                  const days = daysAgo(company.lastActivity);
                  return (
                    <div 
                      key={company.id}
                      onClick={() => navigate(`/admin/crm/companies/${company.id}`)}
                      className="p-4 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={company.companyName} size="md" className="rounded-xl" />
                          <div>
                            <h3 className="text-sm font-bold text-slate-800">{company.companyName || "—"}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              {company.industry && (
                                <span className="text-[11px] font-medium text-slate-500">{company.industry}</span>
                              )}
                              {company.isVip && (
                                <span className="px-1.5 py-0.5 bg-amber-50 border border-amber-200 text-amber-600 text-[9px] font-black rounded-md tracking-wide">VIP</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <button className="text-slate-400 hover:text-[#2E3D99]">
                          <ChevronRight size={18} />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="bg-slate-50 rounded-lg p-2.5">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Health</p>
                          <HealthBadge health={company.health} lastActivity={company.lastActivity} />
                        </div>
                        <div className="bg-slate-50 rounded-lg p-2.5">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Contacts & Leads</p>
                          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                            <span className="flex items-center gap-1"><Users size={12} className="text-slate-400"/> {company.contacts ?? 0}</span>
                            <span className="text-slate-300">|</span>
                            <span className="flex items-center gap-1"><TrendingUp size={12} className="text-[#2E3D99]"/> {company.openLeads ?? 0}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-100">
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-400 font-medium">Owner:</span>
                          <span className="font-bold text-slate-700">{company.assignedToName || "Unassigned"}</span>
                        </div>
                        {company.lastActivity && (
                          <div className="flex items-center gap-1 text-slate-500 font-medium">
                            <Clock size={12} />
                            {timeAgo(company.lastActivity)}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Pagination ─────────────────────────────────────── */}
          {!loading && sorted.length > 0 && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
              <div className="flex items-center gap-3">
                <p className="text-xs font-medium text-slate-400">
                  Showing {Math.min((currentPage - 1) * perPage + 1, sorted.length)} to{" "}
                  {Math.min(currentPage * perPage, sorted.length)} of {sorted.length.toLocaleString()} companies
                </p>
                {/* Per-page selector */}
                <select
                  value={perPage}
                  onChange={e => { setPerPage(Number(e.target.value)); setCurrentPage(1); }}
                  className="text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#2E3D99]/20"
                >
                  {ITEMS_PER_PAGE_OPTIONS.map(n => <option key={n} value={n}>{n} per page</option>)}
                </select>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-8 h-8 flex items-center justify-center text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={14} />
                </button>
                {pageNums.map((p, i) =>
                  p === "..." ? (
                    <span key={`dots-${i}`} className="px-1 text-slate-300 text-xs">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`w-8 h-8 text-xs font-bold rounded-lg transition-colors ${
                        currentPage === p
                          ? "bg-[#2E3D99] text-white"
                          : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="w-8 h-8 flex items-center justify-center text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ── Add / Edit Modal ────────────────────────────────────── */}
      <CompanyFormModal
        isOpen={formState.isOpen}
        onClose={() => setFormState({ isOpen: false, company: null })}
        onSave={handleSave}
        initialData={formState.company}
      />

      {/* ── Delete Confirm ───────────────────────────────────────── */}
      <DeleteModal
        company={deleteCompany}
        onClose={() => setDeleteCompany(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
