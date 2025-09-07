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

  const handelSubmit = async () => {
    setIsLoading(true);
    if (fromDate && toDate) {
      try {
        await handelSubmitFun(fromDate, toDate);
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
    if (onReset) {
      onReset();
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={() => setIsOpen(false)}
      className="relative z-10"
    >
      <DialogBackdrop className="fixed inset-0 bg-gray-500/75" />
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-7 text-center">
          <DialogPanel className="relative transform overflow-hidden rounded-lg bg-[#F3F4FB] text-left shadow-xl sm:my-8 sm:w-full sm:max-w-lg p-6">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-5 text-red-500 text-2xl font-bold hover:scale-110"
            >
              &times;
            </button>
            <h2 className="text-lg font-bold mb-2">Select Date Range</h2>
            <p className="text-sm text-gray-600 mb-5">{subTitle}</p>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                From Date
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full px-4 py-2 border rounded"
              />
            </div>
            <div className="space-y-4 mt-4">
              <label className="block text-sm font-medium text-gray-700">
                To Date
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full px-4 py-2 border rounded"
              />
            </div>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={handelDateReset}
                className="mr-2 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                <RefreshCcw className="inline-block mr-1" size={16} />
              </button>
              <Button
                label={isLoading ? "Processing..." : "Submit"}
                onClick={handelSubmit}
                disabled={isLoading}
              />
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
