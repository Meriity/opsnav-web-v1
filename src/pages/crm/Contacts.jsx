import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Filter,
  SlidersHorizontal,
  Users,
  UserCheck,
  Building2,
  UserCircle,
  Phone,
  Mail,
  Eye,
  Edit,
  Trash2,
  SquarePlus,
  X,
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import Header from "../../components/layout/Header";
import { useSearchStore } from "../SearchStore/searchStore.js";
import { toast } from "react-toastify";
import crmAPI from "../../api/crmAPI";
import ConfirmationModal from "../../components/ui/ConfirmationModal";

// ─── Helpers ───────────────────────────────────────────────────────────────────

const timeAgo = (date) => {
  if (!date) return null;
  const diff = Date.now() - new Date(date).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

const getInitials = (name = "") =>
  name.trim().split(" ").filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join("");

const AVATAR_COLORS = [
  "bg-blue-500", "bg-violet-500", "bg-teal-500", "bg-amber-500",
  "bg-rose-500",  "bg-indigo-500", "bg-emerald-500", "bg-orange-500",
];
const avatarColor = (name = "") => {
  const code = [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_COLORS[code % AVATAR_COLORS.length];
};

// ─── Sub-components ────────────────────────────────────────────────────────────

const Avatar = ({ name = "", size = "md" }) => {
  const sz  = size === "sm" ? "w-7 h-7 text-[10px]" : "w-9 h-9 text-xs";
  const bg  = avatarColor(name);
  return (
    <div className={`${sz} ${bg} rounded-full flex items-center justify-center text-white font-bold shrink-0`}>
      {getInitials(name) || "?"}
    </div>
  );
};

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

// Type badge colours
// Covers both derived status (Lead/Customer/Prospect) and raw contactType values
const TYPE_STYLES = {
  // Derived from customerFlag
  Customer:   "bg-emerald-50 text-emerald-700 border border-emerald-200",
  Lead:       "bg-blue-50   text-blue-700    border border-blue-200",
  Prospect:   "bg-amber-50  text-amber-700   border border-amber-200",
  // Raw contactType values from API
  Individual: "bg-slate-50  text-slate-600   border border-slate-200",
  Business:   "bg-violet-50 text-violet-700  border border-violet-200",
  Vendor:     "bg-orange-50 text-orange-700  border border-orange-200",
  Referral:   "bg-teal-50   text-teal-700    border border-teal-200",
  Partner:    "bg-indigo-50 text-indigo-700  border border-indigo-200",
};

const FILTER_TABS = ["All", "Customers", "Leads", "Unassigned", "Recently Added"];

const SortIcon = ({ col, sortConfig }) => {
  if (sortConfig.key !== col)
    return <ArrowUpDown size={11} className="text-white/40" />;
  return sortConfig.direction === "asc"
    ? <ChevronUp size={11} className="text-white" />
    : <ChevronDown size={11} className="text-white" />;
};

// ─── New Contact Modal ─────────────────────────────────────────────────────────

const ContactFormModal = ({ isOpen, onClose, onSave, initialData = null }) => {
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    jobTitle: "", contactType: "Individual", type: "Lead",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm(initialData
        ? {
            firstName:   initialData.firstName   || "",
            lastName:    initialData.lastName    || "",
            email:       initialData.email       || "",
            phone:       initialData.phone       || "",
            jobTitle:    initialData.jobTitle    || "",
            contactType: initialData.contactType || "Individual",
            // type is derived from customerFlag (Customer) or contactStatus/type
            type:        initialData.customerFlag ? "Customer"
                           : (initialData.type ?? initialData.contactStatus ?? "Lead"),
          }
        : { firstName: "", lastName: "", email: "", phone: "", jobTitle: "", contactType: "Individual", type: "Lead" });
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.firstName.trim()) { toast.error("First name is required"); return; }
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  };

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
              className="w-full max-w-lg"
            >
              <DialogPanel className="bg-white rounded-2xl shadow-2xl border border-slate-100 p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">
                      {initialData ? "Edit Contact" : "New Contact"}
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {initialData ? "Update contact details" : "Add a new contact to your CRM"}
                    </p>
                  </div>
                  <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">First Name *</label>
                      <input
                        type="text" value={form.firstName}
                        onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))}
                        placeholder="John"
                        className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2E3D99]/30 focus:border-[#2E3D99] transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">Last Name</label>
                      <input
                        type="text" value={form.lastName}
                        onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))}
                        placeholder="Smith"
                        className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2E3D99]/30 focus:border-[#2E3D99] transition-all"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email</label>
                      <input
                        type="email" value={form.email}
                        onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                        placeholder="john@example.com"
                        className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2E3D99]/30 focus:border-[#2E3D99] transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">Phone</label>
                      <input
                        type="tel" value={form.phone}
                        onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                        placeholder="+1 (555) 000-0000"
                        className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2E3D99]/30 focus:border-[#2E3D99] transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Job Title</label>
                    <input
                      type="text" value={form.jobTitle}
                      onChange={e => setForm(p => ({ ...p, jobTitle: e.target.value }))}
                      placeholder="e.g. Project Manager"
                      className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2E3D99]/30 focus:border-[#2E3D99] transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">Contact Type</label>
                      <select
                        value={form.contactType}
                        onChange={e => setForm(p => ({ ...p, contactType: e.target.value }))}
                        className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2E3D99]/30 focus:border-[#2E3D99] transition-all bg-white"
                      >
                        <option value="Individual">Individual</option>
                        <option value="Business">Business</option>
                        <option value="Vendor">Vendor</option>
                        <option value="Referral">Referral</option>
                        <option value="Partner">Partner</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">Status</label>
                      <select
                        value={form.type}
                        onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                        className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2E3D99]/30 focus:border-[#2E3D99] transition-all bg-white"
                      >
                        <option value="Lead">Lead</option>
                        <option value="Customer">Customer</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={onClose}
                      className="flex-1 bg-slate-100 text-slate-700 font-semibold py-2.5 rounded-xl hover:bg-slate-200 transition-all text-sm">
                      Cancel
                    </button>
                    <button type="submit" disabled={saving}
                      className="flex-1 bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white font-semibold py-2.5 rounded-xl hover:opacity-90 transition-all text-sm shadow-sm disabled:opacity-60 flex items-center justify-center gap-2">
                      {saving && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                      {saving ? (initialData ? "Saving…" : "Creating…") : (initialData ? "Save Changes" : "Create Contact")}
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

// ─── API response normalizer ───────────────────────────────────────────────────
// Maps the real GET /crm/contacts response to what the UI expects.
//
// Confirmed response shape:
//   { success, data: { contacts: [...], pagination: { page, limit, total, pages } } }
//
// Each contact has:
//   _id, superadminId,
//   companyId: { _id, companyName, companyType } | null  ← populated object
//   assignedTo: null (not yet populated),
//   contactType: "Individual"|"Business"|"Vendor"|"Referral"|"Partner",
//   firstName, lastName, email, phone, jobTitle,
//   customerFlag (bool), tags, createdBy,
//   linkedAt, linkedBy, isDeleted, deletedAt, createdAt, updatedAt
const normalizeContact = (c) => {
  // companyId is a populated object when linked, null otherwise
  const company = c.companyId?.companyName ?? c.company ?? c.companyName ?? "";

  // Derive Lead/Customer/Prospect from customerFlag
  const type = c.customerFlag ? "Customer" : (c.type ?? c.contactStatus ?? "Lead");

  // assignedTo is null in current responses; populate when backend supports it
  const assignedToName =
    c.assignedToName
    ?? c.assignedTo?.displayName
    ?? c.assignedTo?.name
    ?? null;

  // No contactId field in API — generate a short display ID from _id
  const contactId =
    c.contactId ?? (c._id ? `CT-${String(c._id).slice(-5).toUpperCase()}` : "—");

  return {
    ...c,
    id:             c._id ?? c.id,
    _id:            c._id ?? c.id,
    contactId,
    type,
    contactStatus:  type,
    company,
    companyName:    company,
    assignedToName,
    openLeads:      c.openLeads ?? 0,
    lastActivity:   c.lastActivity ?? c.updatedAt ?? null,
  };
};


// ─── Main Page ─────────────────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 10;

export default function Contacts() {
  const navigate    = useNavigate();
  const searchQuery = useSearchStore(s => s.searchQuery);

  const [contacts,     setContacts]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [tabFilter,    setTabFilter]    = useState("All");
  const [currentPage,  setCurrentPage]  = useState(1);
  const [sortConfig,   setSortConfig]   = useState({ key: "createdAt", direction: "desc" });
  const [formState,    setFormState]    = useState({ isOpen: false, contact: null });
  const [deleteState,  setDeleteState]  = useState({ isOpen: false, contact: null });

  // ── Fetch ──
  const loadContacts = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await crmAPI.getAllContacts();
      // Real response shape: { success, data: { contacts: [...], pagination: {...} } }
      const raw  = Array.isArray(res) ? res
                 : Array.isArray(res?.data?.contacts) ? res.data.contacts
                 : Array.isArray(res?.data) ? res.data
                 : [];
      setContacts(raw.map(normalizeContact));
    } catch (err) {
      console.error("Failed to load contacts:", err);
      setContacts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadContacts(); }, [loadContacts]);

  // ── Stats ──
  const stats = useMemo(() => ({
    total:     contacts.length,
    customers: contacts.filter(c => c.customerFlag === true).length,
    leads:     contacts.filter(c => !c.customerFlag).length,
    // Count unique companies linked (companyId is a populated object when linked)
    companies: new Set(
      contacts.map(c => c.companyId?._id).filter(Boolean)
    ).size,
  }), [contacts]);

  // ── Filter ──
  const filtered = useMemo(() => {
    let list = [...contacts];
    // Tab filter
    if (tabFilter === "Customers")      list = list.filter(c => c.type === "Customer");
    else if (tabFilter === "Leads")     list = list.filter(c => c.type === "Lead");
    else if (tabFilter === "Unassigned") list = list.filter(c => !c.assignedTo);
    else if (tabFilter === "Recently Added")
      list = list.filter(c => {
        const d = new Date(c.createdAt);
        return Date.now() - d.getTime() < 7 * 24 * 3600 * 1000;
      });
    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(c =>
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
        (c.email || "").toLowerCase().includes(q) ||
        (c.company || "").toLowerCase().includes(q) ||
        (c.phone || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [contacts, tabFilter, searchQuery]);

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
  const totalPages = Math.max(1, Math.ceil(sorted.length / ITEMS_PER_PAGE));
  const paginated  = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sorted.slice(start, start + ITEMS_PER_PAGE);
  }, [sorted, currentPage]);

  const handleSort = (key) => {
    setSortConfig(prev =>
      prev.key === key
        ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" }
    );
    setCurrentPage(1);
  };

  // ── Save contact ──
  const handleSaveContact = async (formData) => {
    try {
      // Map form fields to the actual API contract (confirmed from POST response):
      // API accepts: firstName, lastName, contactType, email, phone,
      //              jobTitle, tags, customerFlag
      // API does NOT have: companyName, contactStatus — company is a companyId ref
      const payload = {
        firstName:    formData.firstName,
        lastName:     formData.lastName,
        email:        formData.email       || undefined,
        phone:        formData.phone       || undefined,
        jobTitle:     formData.jobTitle    || "",
        tags:         formData.tags        ?? [],
        // contactType: what kind of entity (Individual/Business/etc.)
        contactType:  formData.contactType ?? "Individual",
        // customerFlag: true = Customer, false = Lead/Prospect
        customerFlag: formData.type === "Customer",
      };

      if (formState.contact) {
        await crmAPI.updateContact(formState.contact._id ?? formState.contact.id, payload);
        toast.success("Contact updated");
      } else {
        await crmAPI.createContact(payload);
        toast.success("Contact created");
      }
      setFormState({ isOpen: false, contact: null });
      loadContacts();
    } catch (err) {
      toast.error(err.message || "Failed to save contact");
    }
  };

  // ── Delete contact ──
  const handleConfirmDelete = async () => {
    if (!deleteState.contact) return;
    try {
      const contactId = deleteState.contact._id ?? deleteState.contact.id;
      await crmAPI.deleteContact(contactId);
      toast.success("Contact deleted");
      setDeleteState({ isOpen: false, contact: null });
      loadContacts();
    } catch (err) {
      toast.error(err.message || "Failed to delete contact");
    }
  };

  // shared cell classes
  const cell  = "px-4 py-3 bg-white border-y border-slate-100 transition-colors group-hover:bg-blue-50/40";
  const cellL = `${cell} rounded-l-xl border-l`;
  const cellR = `${cell} rounded-r-xl border-r`;

  const TABLE_COLS = [
    { key: "contactId",      label: "Contact ID",    sortable: true,  center: false },
    { key: "firstName",      label: "Contact Name",  sortable: true,  center: false },
    { key: "company",        label: "Company",       sortable: true,  center: false },
    { key: "email",          label: "Email",         sortable: false, center: false },
    { key: "phone",          label: "Phone",         sortable: false, center: true  },
    { key: "type",           label: "Type",          sortable: false, center: true  },
    { key: "openLeads",      label: "Open Leads",    sortable: false, center: true  },
    { key: "assignedToName", label: "Owner",         sortable: false, center: true  },
    { key: "lastActivity",   label: "Last Activity", sortable: false, center: true  },
    { key: "actions",        label: "Actions",       sortable: false, center: true  },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="px-6 py-6 max-w-[1600px] mx-auto">

        {/* ── Page Header ─────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Contacts</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Manage people, customer relationships, and lead contacts in one place.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm">
              <Filter size={15} />
              Filter
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm">
              <SlidersHorizontal size={15} />
              Sort
            </button>
            <button
              onClick={() => setFormState({ isOpen: true, contact: null })}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] rounded-xl hover:opacity-90 transition-all shadow-sm"
            >
              <Plus size={16} />
              New Contact
            </button>
          </div>
        </div>

        {/* ── Stat Cards ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={Users}
            title="Total Contacts"
            value={stats.total.toLocaleString()}
            iconBg="bg-blue-50"
            iconColor="text-[#2E3D99]"
            loading={loading}
          />
          <StatCard
            icon={UserCheck}
            title="Customers"
            value={stats.customers.toLocaleString()}
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
            loading={loading}
          />
          <StatCard
            icon={UserCircle}
            title="Lead Contacts"
            value={stats.leads.toLocaleString()}
            iconBg="bg-violet-50"
            iconColor="text-violet-600"
            loading={loading}
          />
          <StatCard
            icon={Building2}
            title="Companies Linked"
            value={stats.companies.toLocaleString()}
            iconBg="bg-amber-50"
            iconColor="text-amber-600"
            loading={loading}
          />
        </div>

        {/* ── Table Card ──────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">

          {/* Table header bar */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-bold text-slate-800">All Contacts</h2>
              <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
                {filtered.length.toLocaleString()} results
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Eye size={13} className="text-slate-300" />
              Click a contact to view full profile
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1.5 px-5 py-3 border-b border-slate-50 overflow-x-auto">
            {FILTER_TABS.map(tab => (
              <button
                key={tab}
                onClick={() => { setTabFilter(tab); setCurrentPage(1); }}
                className={`shrink-0 px-3.5 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                  tabFilter === tab
                    ? "bg-[#2E3D99] text-white border-[#2E3D99] shadow-sm"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="overflow-x-auto px-3 pb-3">
            <table className="w-full text-sm border-separate border-spacing-y-1.5">
              <thead>
                <tr className="bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white">
                  {TABLE_COLS.map((col, idx, arr) => (
                    <th
                      key={col.key}
                      onClick={col.sortable ? () => handleSort(col.key) : undefined}
                      className={[
                        "px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-white/90 whitespace-nowrap",
                        col.center ? "text-center" : "text-left",
                        col.sortable ? "cursor-pointer hover:text-white select-none" : "",
                        idx === 0 ? "rounded-l-xl" : "",
                        idx === arr.length - 1 ? "rounded-r-xl" : "",
                      ].join(" ")}
                    >
                      <div className={`flex items-center gap-1.5 ${col.center ? "justify-center" : ""}`}>
                        {col.label}
                        {col.sortable && <SortIcon col={col.key} sortConfig={sortConfig} />}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {TABLE_COLS.map((col, j) => (
                        <td
                          key={j}
                          className={`px-4 py-3 bg-white border-y border-slate-100 ${
                            j === 0 ? "rounded-l-xl border-l" : ""
                          } ${j === TABLE_COLS.length - 1 ? "rounded-r-xl border-r" : ""}`}
                        >
                          <div className="h-4 bg-slate-100 rounded w-full" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan={TABLE_COLS.length} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                          <Users size={28} className="text-slate-300" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-600">No contacts found</p>
                          <p className="text-xs text-slate-400 mt-1">
                            {searchQuery
                              ? "Try adjusting your search or filters"
                              : "Add your first contact to get started"}
                          </p>
                        </div>
                        {!searchQuery && (
                          <button
                            onClick={() => setFormState({ isOpen: true, contact: null })}
                            className="mt-1 flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] rounded-xl hover:opacity-90 transition-all"
                          >
                            <Plus size={13} />
                            New Contact
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : paginated.map((contact) => {
                  const fullName  = `${contact.firstName || ""} ${contact.lastName || ""}`.trim();
                  const displayId = contact.contactId || `CT-${(contact.id || "").slice(-4).toUpperCase()}`;
                  const typeStyle = TYPE_STYLES[contact.type] || "bg-slate-100 text-slate-500 border border-slate-200";
                  const activity  = timeAgo(contact.lastActivity || contact.updatedAt);

                  return (
                    <tr
                      key={contact.id}
                      className="cursor-pointer group"
                      onClick={() => navigate(`/admin/crm/contacts/${contact._id ?? contact.id}`, { state: { contact } })}
                    >

                      {/* Contact ID */}
                      <td className={cellL} onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => navigate(`/admin/crm/contacts/${contact._id ?? contact.id}`, { state: { contact } })}
                          className="text-[#1D97D7] font-bold text-xs whitespace-nowrap hover:underline"
                        >
                          {displayId}
                        </button>
                      </td>

                      {/* Contact Name */}
                      <td className={cell}>
                        <div className="flex items-center gap-2.5">
                          <Avatar name={fullName} size="sm" />
                          <span className="text-xs font-semibold text-slate-800 whitespace-nowrap">{fullName || "—"}</span>
                        </div>
                      </td>

                      {/* Company */}
                      <td className={cell}>
                        {contact.company ? (
                          <div className="flex items-center gap-1.5">
                            <Building2 size={12} className="text-slate-400 shrink-0" />
                            <span className="text-xs font-medium text-slate-600 whitespace-nowrap">{contact.company}</span>
                          </div>
                        ) : (
                          <span className="text-slate-300 font-medium">—</span>
                        )}
                      </td>

                      {/* Email */}
                      <td className={cell}>
                        <a
                          href={`mailto:${contact.email}`}
                          onClick={e => e.stopPropagation()}
                          className="text-xs font-medium text-slate-600 hover:text-[#1D97D7] hover:underline whitespace-nowrap"
                        >
                          {contact.email || <span className="text-slate-300 font-medium">—</span>}
                        </a>
                      </td>

                      {/* Phone — centered */}
                      <td className={`${cell} text-center`}>
                        <span className="text-xs font-medium text-slate-600 whitespace-nowrap">
                          {contact.phone || <span className="text-slate-300 font-medium">—</span>}
                        </span>
                      </td>

                      {/* Type — centered */}
                      <td className={`${cell} text-center`}>
                        {contact.type ? (
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap ${typeStyle}`}>
                            {contact.type}
                          </span>
                        ) : (
                          <span className="text-slate-300 font-medium">—</span>
                        )}
                      </td>

                      {/* Open Leads — centered */}
                      <td className={`${cell} text-center`}>
                        <span className={`text-xs font-bold ${
                          (contact.openLeads || 0) > 0 ? "text-[#2E3D99]" : "text-slate-300"
                        }`}>
                          {contact.openLeads ?? 0}
                        </span>
                      </td>

                      {/* Owner — centered */}
                      <td className={`${cell} text-center`}>
                        {contact.assignedToName ? (
                          <div className="flex items-center justify-center">
                            <Avatar name={contact.assignedToName} size="sm" />
                          </div>
                        ) : (
                          <span className="text-slate-300 font-medium">—</span>
                        )}
                      </td>

                      {/* Last Activity — centered */}
                      <td className={`${cell} text-center`}>
                        {activity ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                            <span className="text-xs font-medium text-slate-600 whitespace-nowrap">{activity}</span>
                          </div>
                        ) : (
                          <span className="text-slate-300 font-medium">—</span>
                        )}
                      </td>

                      {/* Actions — centered */}
                      <td className={`${cellR} text-center`} onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-0.5">
                          <button
                            onClick={() => navigate(`/admin/crm/contacts/${contact._id ?? contact.id}`, { state: { contact } })}
                            title="View Contact"
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-[#2E3D99] hover:bg-[#2E3D99]/10 transition-colors"
                          >
                            <Eye size={13} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setFormState({ isOpen: true, contact }); }}
                            title="Edit Contact"
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            <Edit size={13} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setDeleteState({ isOpen: true, contact }); }}
                            title="Delete Contact"
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

          {/* ── Pagination ────────────────────────────────────────────── */}
          {!loading && sorted.length > 0 && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
              <p className="text-xs font-medium text-slate-400">
                Showing{" "}
                {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, sorted.length)} to{" "}
                {Math.min(currentPage * ITEMS_PER_PAGE, sorted.length)} of{" "}
                {sorted.length.toLocaleString()} results
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
                        ? "bg-[#2E3D99] text-white"
                        : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
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
                        ? "bg-[#2E3D99] text-white"
                        : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
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

      {/* ── New / Edit Modal ─────────────────────────────────────────── */}
      <ContactFormModal
        isOpen={formState.isOpen}
        onClose={() => setFormState({ isOpen: false, contact: null })}
        onSave={handleSaveContact}
        initialData={formState.contact}
      />

      {/* ── Delete Confirm ───────────────────────────────────────────── */}
      <Dialog
        open={deleteState.isOpen}
        onClose={() => setDeleteState({ isOpen: false, contact: null })}
        className="relative z-[1000]"
      >
        <DialogBackdrop className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <div className="fixed inset-0 z-10 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md"
          >
            <div className="bg-white rounded-2xl p-6 shadow-2xl border border-slate-100 relative">
              <button
                onClick={() => setDeleteState({ isOpen: false, contact: null })}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-all"
              >
                <X size={18} />
              </button>
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-7 h-7 text-rose-500" />
                </div>
                <h2 className="text-lg font-bold text-slate-800 mb-2">Delete Contact</h2>
                <p className="text-sm text-slate-500">
                  Are you sure you want to delete{" "}
                  <span className="font-bold text-slate-800">
                    {deleteState.contact
                      ? `${deleteState.contact.firstName} ${deleteState.contact.lastName}`.trim()
                      : ""}
                  </span>?
                  {" "}This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteState({ isOpen: false, contact: null })}
                  className="flex-1 bg-slate-100 text-slate-700 font-semibold py-2.5 rounded-xl hover:bg-slate-200 transition-all text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 bg-rose-500 text-white font-semibold py-2.5 rounded-xl hover:bg-rose-600 transition-all text-sm"
                >
                  Delete Contact
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </Dialog>
    </div>
  );
}
