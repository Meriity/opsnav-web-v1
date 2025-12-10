import { useState } from "react";

import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";

import Button from "./Button";

import { RefreshCcw } from "lucide-react";

import { toast } from "react-toastify";

export default function DateRangeModal({
  isOpen,

  setIsOpen,

  subTitle = "",

  handelSubmitFun,

  onReset,
}) {
  const [isLoading, setIsLoading] = useState(false);

  const [fromDate, setFromDate] = useState("");

  const [toDate, setToDate] = useState("");

  const [dateType, setDateType] = useState("settlement_date"); // default

  const handelSubmit = async () => {
    setIsLoading(true);

    if (fromDate && toDate) {
      try {
        // Pass dateType along with range

        await handelSubmitFun(fromDate, toDate, dateType);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setIsLoading(false);

        setIsOpen(false);
      }
    } else {
      toast.error("Please select a valid date range");

      setIsLoading(false);
    }
  };

  const handelDateReset = () => {
    setFromDate("");

    setToDate("");

    setDateType("settlement_date");

    if (onReset) {
      onReset();
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={() => setIsOpen(false)}
      className="relative z-[100]"
    >
      <DialogBackdrop className="fixed inset-0 bg-black/20 backdrop-blur-sm" />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-7 text-center">
          <DialogPanel className="relative transform overflow-hidden rounded-xl bg-white/90 backdrop-blur-md text-left shadow-2xl border border-white/20 sm:my-8 sm:w-full sm:max-w-lg p-6">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-red-500 text-xl font-bold hover:scale-110 transition-transform p-1 rounded-full hover:bg-white/50"
            >
              &times;
            </button>

            <h2 className="text-lg font-bold mb-2 text-gray-900">
              Select Date Range
            </h2>
            <p className="text-sm text-gray-600 mb-5">{subTitle}</p>

            {/* Select which date type */}

            {localStorage.getItem("company") === "idg" && (
              <div className="space-y-2 mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Filter By
                </label>
                <select
                  value={dateType}
                  onChange={(e) => setDateType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white/80 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="delivery_date">Delivery Date</option>
                  <option value="order_date">Order Date</option>
                  <option value="both_date">Both date</option>
                </select>
              </div>
            )}

            {/* From / To Dates */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                From Date
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="space-y-2 mt-4">
              <label className="block text-sm font-medium text-gray-700">
                To Date
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />  
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={handelDateReset}
                className="px-4 py-2 bg-gray-300/80 text-gray-700 rounded-lg hover:bg-gray-400/80 transition-colors flex items-center gap-2 backdrop-blur-sm"
                title="Reset dates"
              >
                <RefreshCcw size={16} />
                Reset
              </button>

              <Button
                label={isLoading ? "Processing..." : "Submit"}
                onClick={handelSubmit}
                disabled={isLoading}
                className="bg-[#00AEEF] hover:bg-sky-600 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
              />
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
