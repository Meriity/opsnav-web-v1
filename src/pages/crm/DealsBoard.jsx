import React, { useState, useMemo, useEffect } from 'react';
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay
} from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MoreHorizontal, Plus, Search, Filter, Building2, User, DollarSign, Calendar, AlignLeft, Phone, Mail, X, GripHorizontal, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';
import Header from '../../components/layout/Header';
import { useSearchStore } from '../SearchStore/searchStore.js';

// --- BACKGROUND ELEMENTS ---
const FloatingElement = ({ top, left, delay, size = 60 }) => (
  <motion.div
    className="absolute rounded-full bg-gradient-to-r from-[#2E3D99]/10 to-[#1D97D7]/20 opacity-20 hidden sm:block pointer-events-none z-0"
    style={{ width: size, height: size, top: `${top}%`, left: `${left}%` }}
    animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
    transition={{ duration: 3 + delay, repeat: Infinity, ease: "easeInOut" }}
  />
);

// --- MOCK DATA ---
const initialDeals = {
  'deal-1': { id: 'deal-1', title: 'Acme Corp Upgrade', value: 25000, company: 'Acme Corp', priority: 'High', owner: 'JS', description: 'Acme Corp is looking to upgrade their entire fleet. Expected to close by end of Q3.', contactName: 'Jane Doe', contactRole: 'Director of Operations', contactEmail: 'jane@acme.com', contactPhone: '555-0192' },
  'deal-2': { id: 'deal-2', title: 'Globex Initial Setup', value: 10000, company: 'Globex', priority: 'Medium', owner: 'AL', description: 'Initial onboarding and setup for Globex regional offices.', contactName: 'Hank Scorpio', contactRole: 'CEO', contactEmail: 'hank@globex.com', contactPhone: '555-0199' },
  'deal-3': { id: 'deal-3', title: 'Stark Ind. Expansion', value: 75000, company: 'Stark Industries', priority: 'High', owner: 'JS', description: 'Massive expansion project. We are currently in negotiations to finalize the scope of work.', contactName: 'Pepper Potts', contactRole: 'CEO', contactEmail: 'pepper@stark.com', contactPhone: '555-1234' },
  'deal-4': { id: 'deal-4', title: 'Wayne Ent. Renewal', value: 45000, company: 'Wayne Enterprises', priority: 'Low', owner: 'BW', description: 'Standard annual contract renewal. Very low risk.', contactName: 'Lucius Fox', contactRole: 'CTO', contactEmail: 'lfox@wayne.com', contactPhone: '555-0001' },
  'deal-5': { id: 'deal-5', title: 'Oscorp Security Audit', value: 12000, company: 'Oscorp', priority: 'Medium', owner: 'AL', description: 'Full security audit required for their new laboratory wing.', contactName: 'Norman Osborn', contactRole: 'Founder', contactEmail: 'norman@oscorp.com', contactPhone: '555-6666' },
};

const initialColumns = {
  'lead': { id: 'lead', title: 'Lead', dealIds: ['deal-1', 'deal-2'] },
  'proposal': { id: 'proposal', title: 'Proposal Sent', dealIds: ['deal-3', 'deal-5'] },
  'negotiation': { id: 'negotiation', title: 'Negotiation', dealIds: [] },
  'won': { id: 'won', title: 'Closed Won', dealIds: ['deal-4'] },
};

const formatCurrency = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

// --- DEAL CARD COMPONENT ---
function DealCard({ deal, onClick }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: deal.id,
    data: { type: 'Deal', deal },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priorityColors = {
    'High': 'bg-rose-100 text-rose-700 border-rose-200',
    'Medium': 'bg-amber-100 text-amber-700 border-amber-200',
    'Low': 'bg-slate-100 text-slate-700 border-slate-200',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => onClick?.(deal)}
      className={`group relative flex flex-col gap-3 p-4 mb-3 bg-white border border-slate-200 rounded-xl shadow-sm cursor-pointer hover:border-[#2E3D99]/30 hover:shadow-md transition-all ${isDragging ? 'opacity-50 ring-2 ring-[#2E3D99]' : ''}`}
    >
      <div className="flex justify-between items-start">
        <span className={`px-2 py-0.5 text-xs font-semibold rounded-md border ${priorityColors[deal.priority]}`}>
          {deal.priority}
        </span>

        {/* Drag Handle & Actions Wrapper */}
        <div className="flex items-center gap-1 transition-opacity text-slate-400">
          <button
            {...attributes}
            {...listeners}
            onClick={(e) => e.stopPropagation()} // Prevent drawer from opening when dragging
            className="p-1 hover:text-slate-600 hover:bg-slate-100 rounded-md cursor-grab active:cursor-grabbing"
            title="Drag to move"
          >
            <GripHorizontal size={14} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onClick?.(deal, true); }}
            className="p-1 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
            title="Edit Deal"
          >
            <MoreHorizontal size={16} />
          </button>
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-slate-800 text-sm">{deal.title}</h4>
        <p className="text-xs text-slate-500 mt-0.5">{deal.company}</p>
      </div>

      <div className="flex justify-between items-center mt-1">
        <span className="font-bold text-slate-700 text-sm">{formatCurrency(deal.value)}</span>
        <div className="w-6 h-6 rounded-full bg-[#2E3D99]/10 text-[#2E3D99] flex items-center justify-center text-[10px] font-bold border border-[#2E3D99]/20" title={deal.contactName || 'Unassigned'}>
          {deal.contactName ? deal.contactName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '??'}
        </div>
      </div>
    </div>
  );
}

// --- COLUMN COMPONENT ---
function Column({ column, deals, onDealClick, onAddClick }) {
  const { setNodeRef } = useSortable({
    id: column.id,
    data: { type: 'Column', column },
  });

  const totalValue = deals.reduce((sum, deal) => sum + deal.value, 0);

  return (
    <div className="flex flex-col flex-shrink-0 w-80 bg-slate-50/50 rounded-2xl border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-200 bg-white/50 backdrop-blur-sm flex justify-between items-center">
        <div>
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            {column.title}
            <span className="bg-slate-200 text-slate-600 text-xs px-2 py-0.5 rounded-full font-medium">
              {deals.length}
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-1 font-medium">{formatCurrency(totalValue)}</p>
        </div>
        <button
          onClick={() => onAddClick(column.id)}
          className="p-1 hover:bg-slate-200 text-slate-500 rounded-md transition-colors"
          title="Add Deal"
        >
          <Plus size={16} />
        </button>
      </div>

      <div ref={setNodeRef} className="flex-1 p-3 overflow-y-auto min-h-[150px]">
        {deals.length === 0 ? (
          <div className="h-full min-h-[120px] flex flex-col items-center justify-center p-6 text-center border-2 border-dashed border-slate-200/60 rounded-xl bg-slate-50/30">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mb-2 shadow-sm text-slate-300">
              <Building2 size={16} />
            </div>
            <p className="text-xs font-medium text-slate-400">No deals in this stage</p>
          </div>
        ) : (
          <SortableContext items={column.dealIds} strategy={verticalListSortingStrategy}>
            {deals.map((deal) => (
              <DealCard key={deal.id} deal={deal} onClick={onDealClick} />
            ))}
          </SortableContext>
        )}
      </div>
    </div>
  );
}

// --- DEAL DRAWER COMPONENT ---
function DealDrawer({ deal, onClose, onEditClick }) {
  if (!deal) return null;

  return (
    <Dialog open={!!deal} onClose={onClose} className="relative z-[9999]">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200"
      />

      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
            <DialogPanel
              transition
              className="pointer-events-auto w-screen max-w-md transform transition duration-500 ease-in-out data-[closed]:translate-x-full sm:duration-700"
            >
              <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-2xl">
                {/* Header */}
                <div className="px-6 py-6 bg-gradient-to-br from-white to-slate-50 border-b border-slate-100">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">{deal.title}</h2>
                      <p className="text-sm font-medium text-[#2E3D99] mt-1 flex items-center gap-1.5">
                        <Building2 size={14} />
                        {deal.company}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={onClose}
                      className="rounded-lg p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="mt-6 flex items-center gap-4">
                    <div className="flex-1 bg-white border border-slate-200 rounded-xl p-3 flex flex-col gap-1 shadow-sm">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Deal Value</span>
                      <span className="text-lg font-bold text-slate-800">${deal.value.toLocaleString()}</span>
                    </div>
                    <div className="flex-1 bg-white border border-slate-200 rounded-xl p-3 flex flex-col gap-1 shadow-sm">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Priority</span>
                      <span className={`text-sm font-bold ${deal.priority === 'High' ? 'text-rose-600' : deal.priority === 'Medium' ? 'text-amber-600' : 'text-slate-600'}`}>
                        {deal.priority}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="px-6 py-6 space-y-8 flex-1 bg-white">

                  {/* About section */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-slate-800 font-semibold">
                      <AlignLeft size={18} className="text-[#1D97D7]" />
                      <h3>Details</h3>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                      <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                        {deal.description || 'No description provided.'}
                      </p>
                    </div>
                  </div>

                  {/* Contact section */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-slate-800 font-semibold">
                      <User size={18} className="text-[#1D97D7]" />
                      <h3>Primary Contact</h3>
                    </div>
                    <div className="border border-slate-200 rounded-xl p-4 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#2E3D99] to-[#1D97D7] flex items-center justify-center text-white font-bold text-lg shadow-sm">
                        {deal.contactName ? deal.contactName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '??'}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-slate-900">{deal.contactName || 'No Contact Listed'}</h4>
                        <p className="text-xs text-slate-500">{deal.contactRole || 'Role not specified'}</p>
                      </div>
                      <div className="flex gap-2">
                        {deal.contactEmail && (
                          <a href={`mailto:${deal.contactEmail}`} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-[#2E3D99] hover:bg-[#2E3D99]/10 transition-colors" title={deal.contactEmail}>
                            <Mail size={14} />
                          </a>
                        )}
                        {deal.contactPhone && (
                          <a href={`tel:${deal.contactPhone}`} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-[#2E3D99] hover:bg-[#2E3D99]/10 transition-colors" title={deal.contactPhone}>
                            <Phone size={14} />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                </div>

                {/* Footer */}
                <div className="border-t border-slate-200 px-6 py-4 bg-slate-50 flex gap-3">
                  <button
                    onClick={() => onEditClick?.(deal, true)}
                    className="flex-1 bg-white border border-slate-200 text-slate-700 font-semibold py-2.5 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
                  >
                    Edit Deal
                  </button>
                  <button className="flex-1 bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white font-semibold py-2.5 rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-[#2E3D99]/20">
                    Mark as Won
                  </button>
                </div>
              </div>
            </DialogPanel>
          </div>
        </div>
      </div>
    </Dialog>
  );
}

// --- DEAL FORM MODAL ---
function DealFormModal({ isOpen, onClose, onSave, initialData, initialStage }) {
  const [formData, setFormData] = useState({
    title: '', company: '', value: '', priority: 'Medium', owner: 'JS', stage: 'lead',
    description: '', contactName: '', contactRole: '', contactEmail: '', contactPhone: ''
  });
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      if (initialData) {
        setFormData({ ...initialData });
      } else {
        setFormData({
          title: '', company: '', value: '', priority: 'Medium', owner: 'JS', stage: initialStage || 'lead',
          description: '', contactName: '', contactRole: '', contactEmail: '', contactPhone: ''
        });
      }
    }
  }, [isOpen, initialData, initialStage]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.company) return;
    onSave({
      ...(initialData || { id: `deal-${Date.now()}` }),
      ...formData,
      value: Number(formData.value) || 0
    });
  };

  const stageNames = {
    'lead': 'Lead',
    'proposal': 'Proposal',
    'negotiation': 'Negotiation',
    'won': 'Closed Won'
  };
  const modalTitle = initialData ? 'Edit Deal' : `Create ${stageNames[formData.stage] || 'Deal'}`;

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
              <form id="new-deal-form" onSubmit={handleSubmit} className="space-y-4">

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
                    <span className={`text-[11px] mt-1.5 font-semibold ${step >= 2 ? 'text-[#1D97D7]' : 'text-slate-400'}`}>Contact Details</span>
                  </div>
                </div>

                {step === 1 && (
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Deal Title</label>
                      <input required type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2E3D99]/50" placeholder="e.g. Acme Corp Upgrade" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Company</label>
                      <input required type="text" value={formData.company} onChange={e => setFormData({ ...formData, company: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2E3D99]/50" placeholder="e.g. Acme Corp" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Value ($)</label>
                        <input required type="number" value={formData.value} onChange={e => setFormData({ ...formData, value: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2E3D99]/50" placeholder="0" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Priority</label>
                        <select value={formData.priority} onChange={e => setFormData({ ...formData, priority: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2E3D99]/50">
                          <option>High</option>
                          <option>Medium</option>
                          <option>Low</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Details / Description</label>
                      <textarea rows="3" value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2E3D99]/50 resize-none" placeholder="Provide background on the deal..."></textarea>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Pipeline Stage</label>
                      <select value={formData.stage} onChange={e => setFormData({ ...formData, stage: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2E3D99]/50">
                        <option value="lead">Lead</option>
                        <option value="proposal">Proposal Sent</option>
                        <option value="negotiation">Negotiation</option>
                        <option value="won">Closed Won</option>
                      </select>
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                    <div className="pt-2">
                      <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2"><User size={16} className="text-[#1D97D7]" /> Primary Contact Details</h4>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name</label>
                          <input type="text" value={formData.contactName || ''} onChange={e => setFormData({ ...formData, contactName: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2E3D99]/50" placeholder="Jane Doe" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">Role / Job Title</label>
                          <input type="text" value={formData.contactRole || ''} onChange={e => setFormData({ ...formData, contactRole: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2E3D99]/50" placeholder="CEO" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">Email</label>
                          <input type="email" value={formData.contactEmail || ''} onChange={e => setFormData({ ...formData, contactEmail: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2E3D99]/50" placeholder="jane@example.com" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">Phone</label>
                          <input type="tel" value={formData.contactPhone || ''} onChange={e => setFormData({ ...formData, contactPhone: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2E3D99]/50" placeholder="555-0199" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </form>
            </div>
            <div className="bg-slate-50 px-4 py-4 sm:flex sm:flex-row-reverse sm:px-6">
              {step === 1 ? (
                <button type="button" onClick={(e) => {
                  e.preventDefault();
                  // simple validation before next
                  if (!formData.title || !formData.company) {
                    alert("Please fill in the Deal Title and Company before proceeding.");
                    return;
                  }
                  setStep(2);
                }} className="inline-flex w-full justify-center rounded-xl bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#2E3D99]/20 hover:opacity-90 sm:ml-3 sm:w-auto transition-opacity">
                  Next Step
                </button>
              ) : (
                <button type="submit" form="new-deal-form" className="inline-flex w-full justify-center rounded-xl bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#2E3D99]/20 hover:opacity-90 sm:ml-3 sm:w-auto transition-opacity">
                  {initialData ? 'Save Changes' : 'Create Deal'}
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

// --- MAIN BOARD COMPONENT ---
export default function DealsBoard() {
  const [columns, setColumns] = useState(initialColumns);
  const [deals, setDeals] = useState(initialDeals);
  const [activeId, setActiveId] = useState(null);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [dealFormState, setDealFormState] = useState({ isOpen: false, deal: null, stage: null });
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ priority: 'All' });
  const { searchQuery } = useSearchStore();

  const handleDealClick = (deal, isEdit = false) => {
    if (isEdit) {
      // Find the stage this deal currently belongs to
      const stage = Object.values(columns).find(c => c.dealIds.includes(deal.id))?.id || 'lead';

      if (selectedDeal) {
        // Close drawer first, wait for transition, then open modal
        setSelectedDeal(null);
        setTimeout(() => {
          setDealFormState({ isOpen: true, deal, stage });
        }, 150);
      } else {
        setDealFormState({ isOpen: true, deal, stage });
      }
    } else {
      setSelectedDeal(deal);
    }
  };

  const filteredDeals = useMemo(() => {
    let result = deals;

    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      result = Object.fromEntries(
        Object.entries(result).filter(([id, deal]) =>
          deal.title.toLowerCase().includes(lowercasedQuery) ||
          deal.company.toLowerCase().includes(lowercasedQuery)
        )
      );
    }

    if (filters.priority !== 'All') {
      result = Object.fromEntries(
        Object.entries(result).filter(([id, deal]) => deal.priority === filters.priority)
      );
    }

    return result;
  }, [deals, searchQuery, filters]);

  const handleSaveDeal = (dealData) => {
    if (dealFormState.deal) {
      // Editing existing deal
      setDeals(prev => ({ ...prev, [dealData.id]: dealData }));

      const oldStage = dealFormState.stage;
      if (oldStage && oldStage !== dealData.stage) {
        setColumns(prev => {
          const oldStageDealIds = prev[oldStage].dealIds.filter(id => id !== dealData.id);
          const newStageDealIds = [...prev[dealData.stage].dealIds, dealData.id];
          return {
            ...prev,
            [oldStage]: { ...prev[oldStage], dealIds: oldStageDealIds },
            [dealData.stage]: { ...prev[dealData.stage], dealIds: newStageDealIds }
          };
        });
      }
    } else {
      // Creating new deal
      setDeals(prev => ({ ...prev, [dealData.id]: dealData }));
      setColumns(prev => ({
        ...prev,
        [dealData.stage]: {
          ...prev[dealData.stage],
          dealIds: [...prev[dealData.stage].dealIds, dealData.id]
        }
      }));
    }
    setDealFormState({ isOpen: false, deal: null, stage: null });
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragOver = (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    // Find the columns
    const activeColumnId = Object.keys(columns).find(key => columns[key].dealIds.includes(activeId));
    const overColumnId = Object.keys(columns).find(key => columns[key].dealIds.includes(overId)) || overId;

    if (!activeColumnId || !overColumnId || activeColumnId === overColumnId) {
      return;
    }

    setColumns((prev) => {
      const activeItems = [...prev[activeColumnId].dealIds];
      const overItems = prev[overColumnId] ? [...prev[overColumnId].dealIds] : [];

      const activeIndex = activeItems.indexOf(activeId);
      const overIndex = overItems.indexOf(overId);

      activeItems.splice(activeIndex, 1);

      let newIndex = overIndex >= 0 ? overIndex : overItems.length;

      overItems.splice(newIndex, 0, activeId);

      return {
        ...prev,
        [activeColumnId]: { ...prev[activeColumnId], dealIds: activeItems },
        [overColumnId]: { ...prev[overColumnId], dealIds: overItems },
      };
    });
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) {
      setActiveId(null);
      return;
    }

    const activeId = active.id;
    const overId = over.id;

    const activeColumnId = Object.keys(columns).find(key => columns[key].dealIds.includes(activeId));

    if (activeColumnId) {
      const activeItems = [...columns[activeColumnId].dealIds];
      const activeIndex = activeItems.indexOf(activeId);
      const overIndex = activeItems.indexOf(overId);

      if (activeIndex !== overIndex && overIndex !== -1) {
        setColumns((prev) => ({
          ...prev,
          [activeColumnId]: {
            ...prev[activeColumnId],
            dealIds: arrayMove(activeItems, activeIndex, overIndex),
          }
        }));
      }
    }

    setActiveId(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#2E3D99]/5 to-[#1D97D7]/10 relative overflow-hidden flex flex-col">
      {/* Background floating elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <FloatingElement top={10} left={10} delay={0} />
        <FloatingElement top={20} left={85} delay={1} size={80} />
        <FloatingElement top={70} left={5} delay={2} size={40} />
        <FloatingElement top={80} left={90} delay={1.5} size={100} />

        {/* Grid Background */}
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

      <div className="relative z-10 w-full flex-1 flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col p-3 sm:p-4 md:p-6 px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 w-full max-w-full overflow-hidden">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 lg:mb-4 xl:mb-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-base sm:text-lg lg:text-lg xl:text-xl 2xl:text-2xl font-bold text-gray-900 truncate">
                  <span className="bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] bg-clip-text text-transparent">
                    Deals Pipeline
                  </span>
                </h1>
                <p className="text-gray-600 text-[10px] sm:text-xs lg:text-xs xl:text-sm mt-1 truncate">
                  Manage and track your active revenue opportunities
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                <div className="relative">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-2 px-3 py-2 bg-white border ${showFilters || filters.priority !== 'All' ? 'border-[#2E3D99] text-[#2E3D99] bg-blue-50/50' : 'border-slate-200 text-slate-700'} rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm`}
                  >
                    <Filter size={16} />
                    <span className="hidden sm:inline">Filters</span>
                    {filters.priority !== 'All' && (
                      <span className="w-2 h-2 rounded-full bg-[#FB4A50] absolute top-1.5 right-1.5"></span>
                    )}
                  </button>

                  <AnimatePresence>
                    {showFilters && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full mt-2 left-0 lg:left-auto lg:right-0 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden"
                      >
                        <div className="p-3 border-b border-slate-100 bg-slate-50">
                          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Priority Filter</h4>
                        </div>
                        <div className="p-2 space-y-1">
                          {['All', 'High', 'Medium', 'Low'].map(p => (
                            <button
                              key={p}
                              onClick={() => { setFilters({ priority: p }); setShowFilters(false); }}
                              className="w-full flex items-center justify-between px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors text-left"
                            >
                              {p}
                              {filters.priority === p && <Check size={14} className="text-[#2E3D99]" />}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setDealFormState({ isOpen: true, deal: null, stage: null })}
                  className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white rounded-xl text-[10px] sm:text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-[#2E3D99]/20 whitespace-nowrap"
                >
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>New Deal</span>
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Kanban Board */}
          <div className="flex-1 overflow-x-auto pb-4">
            <div className="flex gap-6 h-full items-start">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
              >
                {Object.values(columns).map((column) => {
                  const columnDeals = column.dealIds
                    .map(id => filteredDeals[id])
                    .filter(Boolean);

                  return (
                    <Column
                      key={column.id}
                      column={column}
                      deals={columnDeals}
                      onDealClick={handleDealClick}
                      onAddClick={(stage) => setDealFormState({ isOpen: true, deal: null, stage })}
                    />
                  );
                })}
                <DragOverlay>
                  {activeId ? <DealCard deal={deals[activeId]} /> : null}
                </DragOverlay>
              </DndContext>
            </div>
          </div>
        </main>
      </div>
      <DealDrawer deal={selectedDeal} onClose={() => setSelectedDeal(null)} onEditClick={handleDealClick} />
      <DealFormModal
        isOpen={dealFormState.isOpen}
        onClose={() => setDealFormState({ isOpen: false, deal: null, stage: null })}
        onSave={handleSaveDeal}
        initialData={dealFormState.deal}
        initialStage={dealFormState.stage}
      />
    </div>
  );
}
