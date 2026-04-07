import React, { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { AlertCircle, CheckCircle2, X } from "lucide-react";

const SubmitConfirmationModal = ({ isOpen, onClose, onConfirm, isLoading }) => {
  const [hasConfirmed, setHasConfirmed] = useState(false);

  const handleConfirm = () => {
    if (hasConfirmed) {
      onConfirm();
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[100]" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-[32px] bg-white p-8 text-left align-middle shadow-2xl transition-all border border-slate-100 relative">
                <button
                  onClick={onClose}
                  className="absolute top-6 right-6 p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400 hover:text-slate-600 z-10"
                >
                  <X size={20} />
                </button>

                <div className="flex items-center gap-4 mb-4 pr-8">
                  <div className="p-2.5 bg-amber-50 rounded-xl shrink-0">
                    <AlertCircle className="w-6 h-6 text-amber-600" />
                  </div>
                  <Dialog.Title
                    as="h3"
                    className="text-2xl font-bold text-slate-900 leading-tight whitespace-nowrap"
                  >
                    Confirm Final Submission
                  </Dialog.Title>
                </div>
                
                <p className="text-slate-500 text-sm leading-relaxed mb-8">
                  Once submitted, this form becomes a legal record. You will <span className="font-bold text-slate-900 underline decoration-amber-500/30">not be able to make further changes</span> through this interface. Please ensure all details have been thoroughly reviewed.
                </p>

                <div className="space-y-6">
                  <label className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 cursor-pointer group active:scale-[0.98] transition-all">
                    <div className="relative flex items-center justify-center mt-0.5">
                      <input
                        type="checkbox"
                        checked={hasConfirmed}
                        onChange={(e) => setHasConfirmed(e.target.checked)}
                        className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-slate-300 bg-white checked:border-[#2E3D99] checked:bg-[#2E3D99] transition-all"
                      />
                      <CheckCircle2 className="pointer-events-none absolute h-3.5 w-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                    </div>
                    <span className="text-xs font-semibold text-slate-700 leading-snug group-hover:text-[#2E3D99] transition-colors">
                      I confirm that I have reviewed the details and wish to submit this form as my final version.
                    </span>
                  </label>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={onClose}
                      className="flex-1 px-6 py-3.5 rounded-2xl text-sm font-bold text-slate-500 hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirm}
                      disabled={!hasConfirmed || isLoading}
                      className={`flex-1 px-6 py-3.5 rounded-2xl text-sm font-bold shadow-xl transition-all flex items-center justify-center gap-2 ${
                        hasConfirmed
                          ? "bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white shadow-blue-900/20 hover:scale-[1.02] active:scale-[0.98]"
                          : "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
                      } ${isLoading ? "opacity-80 cursor-wait" : ""}`}
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        "Confirm Submission"
                      )}
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default SubmitConfirmationModal;
