import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState, useRef } from "react";
import { CloudArrowUpIcon, XMarkIcon, DocumentArrowUpIcon } from "@heroicons/react/24/outline";
import Loader from "./Loader";
import { toast } from "react-toastify";

export default function ExcelUploadDialog({ isOpen, onClose, onUpload }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    const validTypes = [
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/csv",
    ];
    if (validTypes.includes(selectedFile.type) || selectedFile.name.endsWith(".csv") || selectedFile.name.endsWith(".xlsx") || selectedFile.name.endsWith(".xls")) {
        setFile(selectedFile);
    } else {
      toast.error("Please upload a valid Excel or CSV file.");
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    try {
      await onUpload(file);
      setFile(null);
      onClose();
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = () => {
      setFile(null);
      if(inputRef.current) inputRef.current.value = "";
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[9999]" onClose={!uploading ? onClose : () => {}}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left shadow-xl transition-all border border-gray-100">
              <div className="flex justify-between items-start mb-4">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-bold leading-6 text-gray-900 flex items-center gap-2"
                >
                  Upload Excel File
                </Dialog.Title>
                {!uploading && (
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500 transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                )}
              </div>

              <div className="mt-2">
                {!file ? (
                  <div
                    className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                      dragActive
                        ? "border-[#1D97D7] bg-blue-50"
                        : "border-gray-300 hover:border-[#1D97D7] hover:bg-gray-50"
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <input
                      ref={inputRef}
                      type="file"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={handleChange}
                      accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                      disabled={uploading}
                    />
                    <div className="flex flex-col items-center justify-center gap-2 pointer-events-none">
                      <CloudArrowUpIcon className={`w-12 h-12 ${dragActive ? "text-[#1D97D7]" : "text-gray-400"}`} />
                      <p className="text-sm font-medium text-gray-900">
                        Click or drag file to upload
                      </p>
                      <p className="text-xs text-gray-500">
                        XLSX, XLS, or CSV files only
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 relative">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-green-600 font-bold text-xs">XLS</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                                {file.name}
                            </p>
                            <p className="text-xs text-gray-500">
                                {(file.size / 1024).toFixed(2)} KB
                            </p>
                        </div>
                        {!uploading && (
                             <button
                             onClick={handleRemoveFile}
                             className="text-gray-400 hover:text-red-500 transition-colors p-1"
                           >
                             <XMarkIcon className="w-5 h-5" />
                           </button>
                        )}
                    </div>
                    {uploading && (
                        <div className="mt-4">
                             <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-medium text-[#2E3D99]">Uploading...</span>
                             </div>
                             <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div className="bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] h-1.5 rounded-full w-2/3 animate-pulse"></div>
                             </div>
                        </div>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-6 flex gap-3 justify-end">
                <button
                  type="button"
                  className="inline-flex justify-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-[rgba(46,61,153,0.05)] focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={onClose}
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="inline-flex justify-center rounded-lg border border-transparent bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] px-4 py-2 text-sm font-medium text-white hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed items-center gap-2 shadow-sm"
                  onClick={handleUpload}
                  disabled={!file || uploading}
                >
                  {uploading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Uploading...
                      </>
                  ) : "Upload File"}
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
