import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";

export default function UploadDialog({ isOpen, onClose }) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Overlay */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        </Transition.Child>

        {/* Centered Panel */}
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
            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-center shadow-xl transition-all">
              <Dialog.Title className="text-lg font-bold text-gray-900">
                Upload Image
              </Dialog.Title>

              {/* Dummy Illustration */}
              <div className="mt-4 flex justify-center">
                <img
                  src="https://www.lifewire.com/thmb/TRGYpWa4KzxUt1Fkgr3FqjOd6VQ=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/cloud-upload-a30f385a928e44e199a62210d578375a.jpg"
                  alt="Dummy Illustration"
                  className="w-40 h-40 object-contain"
                />
              </div>

              {/* Upload Button */}
              <div className="mt-6">
                <input type="file" accept="image/*" id="fileUpload" className="hidden" />
                <label
                  htmlFor="fileUpload"
                  className="cursor-pointer bg-[#00AEEF] text-white px-4 py-2 rounded-lg"
                >
                  Upload
                </label>
              </div>

              {/* Cancel Button */}
              <div className="mt-4">
                <button
                  onClick={onClose}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
