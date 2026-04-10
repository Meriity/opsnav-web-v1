import React, { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X, Send, User, Mail, Copy, Check, Link2 } from "lucide-react";

const SendWillsFormModal = ({ isOpen, onClose, onSend, isLoading }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });
  const [copied, setCopied] = useState(false);

  // Dynamic URL logic
  const baseUrl = window.location.origin;
  const firmId = localStorage.getItem("userID") || "68941092d977824d21bdec46";
  const link = `${baseUrl}/wills/form?firmId=${firmId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSend(formData);
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-100" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-4xl bg-white p-8 text-left align-middle shadow-2xl transition-all border border-gray-100">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-linear-to-br from-[#2E3D99]/10 to-[#1D97D7]/10 rounded-2xl">
                      <Send className="w-6 h-6 text-[#2E3D99]" />
                    </div>
                    <div>
                      <Dialog.Title
                        as="h3"
                        className="text-xl font-bold text-gray-900"
                      >
                        Send Wills Form
                      </Dialog.Title>
                      <p className="text-xs text-gray-500 font-medium mt-0.5">
                        Send preparation link to client
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div className="relative group">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-1.5 block">
                        Client Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#2E3D99] transition-colors" />
                        <input
                          type="text"
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Enter client name"
                          className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-2xl text-sm focus:bg-white focus:border-[#2E3D99]/20 focus:ring-4 focus:ring-[#2E3D99]/5 outline-none transition-all placeholder:text-gray-400 font-medium"
                        />
                      </div>
                    </div>

                    <div className="relative group">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-1.5 block">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#2E3D99] transition-colors" />
                        <input
                          type="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="example@email.com"
                          className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-2xl text-sm focus:bg-white focus:border-[#2E3D99]/20 focus:ring-4 focus:ring-[#2E3D99]/5 outline-none transition-all placeholder:text-gray-400 font-medium"
                        />
                      </div>
                    </div>

                    <div className="relative">
                      <div
                        className="absolute inset-0 flex items-center"
                        aria-hidden="true"
                      >
                        <div className="w-full border-t border-gray-100"></div>
                      </div>
                      <div className="relative flex justify-center">
                        <div className="bg-white px-4 py-1.5 rounded-full border border-gray-100 shadow-sm flex items-center gap-2.5">
                          <div className="w-1 h-1 rounded-full bg-[#2E3D99]/40"></div>
                          <span className="text-[9px] font-black text-[#2E3D99] uppercase">
                            or
                          </span>
                          <div className="w-1 h-1 rounded-full bg-[#2E3D99]/40"></div>
                        </div>
                      </div>
                    </div>

                    <div className="relative group">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-1.5 block">
                        Form Link
                      </label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            readOnly
                            value={link}
                            className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-2xl text-sm outline-none transition-all text-gray-500 font-medium cursor-default"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleCopy}
                          className={`px-4 rounded-2xl border transition-all flex items-center justify-center gap-2 min-w-[100px] ${
                            copied
                              ? "bg-green-50 border-green-200 text-green-600"
                              : "bg-gray-50 border-transparent hover:bg-gray-100 text-gray-600"
                          } cursor-pointer`}
                        >
                          {copied ? (
                            <>
                              <Check size={16} />
                              <span className="text-xs font-bold uppercase tracking-wider">
                                Copied
                              </span>
                            </>
                          ) : (
                            <>
                              <Copy size={16} />
                              <span className="text-xs font-bold uppercase tracking-wider">
                                Copy
                              </span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 px-6 py-3.5 rounded-2xl text-sm font-bold text-gray-500 hover:bg-gray-50 border border-gray-100 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-[1.5] px-6 py-3.5 bg-linear-to-r from-[#2E3D99] to-[#1D97D7] text-white rounded-2xl text-sm font-bold shadow-lg shadow-blue-900/10 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Send size={16} />
                          <span>SEND FORM</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default SendWillsFormModal;
