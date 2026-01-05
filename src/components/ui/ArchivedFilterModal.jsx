import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import Button from "./Button";
import { RefreshCcw } from "lucide-react";
import { useState, useEffect } from "react";

export default function ArchivedFilterModal({
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
    onApply(localFilters);
    setIsOpen(false);
  };

  const handleReset = () => {
    const emptyFilters = {
      state: "",
      clientType: "",
      closeMatter: "",
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
                  State
                </label>
                <input
                  type="text"
                  name="state"
                  value={localFilters.state || ""}
                  onChange={handleChange}
                  placeholder="e.g. VIC"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white/80 focus:ring-2 focus:ring-[#2E3D99] focus:border-[#2E3D99] transition-all"
                />
              </div>

              {/* Client/Order Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {currentModule === "print media"
                    ? "Order Type"
                    : "Client Type"}
                </label>
                <select
                  name="clientType"
                  value={localFilters.clientType || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white/80 focus:ring-2 focus:ring-[#2E3D99] focus:border-[#2E3D99] transition-all"
                >
                  <option value="">
                    {currentModule === "print media"
                      ? "All Order Types"
                      : "All Client Types"}
                  </option>
                  {currentModule === "print media" ? (
                    <>
                      <option value="Real Estate">Real Estate</option>
                      <option value="Vehicle">Vehicle</option>
                      <option value="Commercial">Commercial</option>
                      <option value="Others">Others</option>
                    </>
                  ) : (
                    <>
                      <option value="Buyer">Buyer</option>
                      <option value="Seller">Seller</option>
                      <option value="Transfer">Transfer</option>
                    </>
                  )}
                </select>
              </div>

              {/* Close Matter/Order Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {currentModule === "print media"
                    ? "Order Status"
                    : "Close Matter Status"}
                </label>
                <select
                  name="closeMatter"
                  value={localFilters.closeMatter || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white/80 focus:ring-2 focus:ring-[#2E3D99] focus:border-[#2E3D99] transition-all"
                >
                  <option value="">All Statuses</option>
                  <option value="closed">
                    {currentModule === "print media" ? "Completed" : "Closed"}
                  </option>
                  <option value="open">Cancelled</option>
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
