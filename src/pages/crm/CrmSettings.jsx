import React, { useState, useEffect } from "react";
import { Plus, Trash2, Settings2, ShieldAlert } from "lucide-react";
import { toast } from "react-toastify";
import crmAPI from "../../api/crmAPI";
import { motion, AnimatePresence } from "framer-motion";
import Header from "../../components/layout/Header";

// Floating background elements
const FloatingElement = ({ top, left, delay, size = 60 }) => (
  <motion.div
    className="absolute rounded-full bg-gradient-to-r from-[#2E3D99]/10 to-[#1D97D7]/20 opacity-20 pointer-events-none"
    style={{ width: size, height: size, top: `${top}%`, left: `${left}%` }}
    animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
    transition={{ duration: 3 + delay, repeat: Infinity, ease: "easeInOut" }}
  />
);

export default function CrmSettings() {
  const [enquiryTypes, setEnquiryTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newType, setNewType] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchEnquiryTypes();
  }, []);

  const fetchEnquiryTypes = async () => {
    try {
      setLoading(true);
      const types = await crmAPI.getEnquiryTypes();
      setEnquiryTypes(Array.isArray(types) ? types : (types?.data || types?.enquiryTypes || []));
    } catch (error) {
      console.error("Failed to fetch enquiry types", error);
      toast.error("Failed to load settings data");
    } finally {
      setLoading(false);
    }
  };

  const handleAddType = async (e) => {
    e.preventDefault();
    if (!newType.trim()) return;

    try {
      setIsSubmitting(true);
      await crmAPI.createEnquiryType({ enquiryType: newType.trim() });
      await fetchEnquiryTypes();
      setNewType("");
      toast.success("Enquiry type added successfully!");
    } catch (error) {
      console.error("Failed to add enquiry type", error);
      toast.error(error.message || "Failed to add enquiry type");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteType = async (id) => {
    try {
      await crmAPI.deleteEnquiryType(id);
      await fetchEnquiryTypes();
      toast.success("Enquiry type deleted successfully!");
    } catch (error) {
      console.error("Failed to delete enquiry type", error);
      toast.error(error.message || "Failed to delete enquiry type");
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-white via-[#2E3D99]/5 to-[#1D97D7]/10 flex flex-col">
      {/* Floating Background Elements */}
      <div className="hidden sm:block absolute inset-0 overflow-hidden pointer-events-none">
        <FloatingElement top={10} left={10} delay={0} />
        <FloatingElement top={20} left={85} delay={1} size={80} />
        <FloatingElement top={70} left={5} delay={2} size={40} />
        <FloatingElement top={80} left={90} delay={1.5} size={100} />
      </div>

      {/* Grid Background */}
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(to right, #000 1px, transparent 1px),
                              linear-gradient(to bottom, #000 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      <div className="relative z-10 w-full">
        <Header />

        <main className="px-6 py-6 max-w-4xl mx-auto mt-4">
          <div className="mb-8 flex flex-col">
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Settings2 className="w-6 h-6 text-[#2E3D99]" />
              CRM Settings
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Configure system preferences, drop-downs, and lead forms.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-800">Enquiry Types</h2>
              <p className="text-xs text-slate-500 mt-1">
                These options will appear in the "Enquiry Type" dropdown when creating a new lead.
              </p>
            </div>

            <div className="p-6">
              <form onSubmit={handleAddType} className="mb-8">
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Add New Enquiry Type
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    placeholder="e.g. Consulting, Software Development..."
                    className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#2E3D99] focus:ring-4 focus:ring-[#2E3D99]/10 shadow-sm transition-all bg-white"
                    disabled={isSubmitting}
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting || !newType.trim()}
                    className="px-6 py-2.5 bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white font-bold text-sm rounded-xl hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2 shadow-md shadow-[#2E3D99]/20"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>
              </form>

              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-700">Existing Types</h3>
                
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-14 bg-slate-100/50 rounded-xl animate-pulse"></div>
                    ))}
                  </div>
                ) : enquiryTypes.length === 0 ? (
                  <div className="text-center py-10 bg-white/50 rounded-xl border border-slate-200 border-dashed">
                    <ShieldAlert className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-medium text-slate-500">No enquiry types found</p>
                    <p className="text-xs text-slate-400 mt-1">Add one above to get started</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <AnimatePresence>
                      {enquiryTypes.map((type, index) => {
                        const typeName = typeof type === "string" ? type : (type.name || type.enquiryType);
                        const typeKey = typeof type === "string" ? type : (type.id || type._id || index);
                        
                        return (
                          <motion.div
                            key={typeKey}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white hover:border-[#1D97D7] hover:shadow-sm transition-all group"
                          >
                            <span className="text-sm font-semibold text-slate-700">
                              {typeName}
                            </span>
                            <button
                              onClick={() => handleDeleteType(typeKey)}
                              className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Delete Type"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
