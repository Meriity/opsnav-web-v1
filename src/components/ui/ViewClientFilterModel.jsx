import React from 'react'
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import Button from "./Button";
import { RefreshCcw } from "lucide-react";
import { useState, useEffect } from "react";

export default function ViewClientFilterModel({
    isOpen,
    setIsOpen,
    onApply,
    initialFilters,
    onReset,
    currentModule,
}) {

    const [localFilters, setLocalFilters] = useState(initialFilters);

    useEffect(() => {
        setLocalFilters(initialFilters);
    }, [initialFilters, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setLocalFilters((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = () => {
        console.log("Filter send")
        onApply(localFilters);
        setIsOpen(false);
    };

    const handleReset = () => {
        const emptyFilters = {
            matterStatus: "",
            legalCostsApplicationNumber: "",
        };
        setLocalFilters(emptyFilters);
        onReset();
        setIsOpen(false);
    };




    return (
        <Dialog
            open={isOpen}
            onClose={() => setIsOpen(false)}
            className="relative z-[100]"
        >
            <DialogBackdrop className="fixed inset-0 bg-black/20 backdrop-blur-sm" />

            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4 text-center">
                    <DialogPanel className="relative transform overflow-hidden rounded-xl bg-white/90 backdrop-blur-md text-left shadow-2xl border border-white/20 sm:my-8 w-full max-w-md p-6">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            &times;
                        </button>

                        <h2 className="text-xl font-bold mb-6 text-gray-900">
                            Filter Clients
                        </h2>

                        <div className="space-y-4">
                            {/* State Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Legal Costs Application Number
                                </label>
                                <input
                                    type="text"
                                    name="legalCostsApplicationNumber"
                                    value={localFilters.legalCostsApplicationNumber || ""}
                                    onChange={handleChange}
                                    placeholder="e.g. 26361079"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white/80 focus:ring-2 focus:ring-[#2E3D99] focus:border-[#2E3D99] transition-all"
                                />
                            </div>

                            {/* Client/Order Type Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Matter Status
                                </label>
                                <select
                                    name="matterStatus"
                                    value={localFilters.matterStatus || ""}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white/80 focus:ring-2 focus:ring-[#2E3D99] focus:border-[#2E3D99] transition-all"
                                >
                                    <option value="">Select Option</option>
                                    {["Not Submitted", "Submitted", "Triage", "Assessment", "Notice of decision available", "Transition to FAS Complete"].map((opt) => (
                                        <option key={opt} value={opt}>
                                            {opt}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={handleReset}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                            >
                                <RefreshCcw size={16} />
                                Reset
                            </button>

                            <Button
                                label="Apply Filters"
                                onClick={handleSubmit}
                                className="bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] hover:bg-sky-600 text-white font-semibold px-6 py-2 rounded-lg transition-colors shadow-md hover:shadow-lg"
                            />
                        </div>
                    </DialogPanel>
                </div>
            </div>
        </Dialog>
    );
}
