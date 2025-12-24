import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import Button from "./Button";

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  onDiscard,
  title,
  children,
  message,
  isLogout,
}) {
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      await onConfirm();
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
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
            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
              <Dialog.Title
                as="h3"
                className="text-lg font-bold leading-6 text-gray-900 flex items-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-yellow-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                {title}
              </Dialog.Title>
              <div className="mt-2">
                <p className="text-sm text-gray-600">{message || children}</p>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                {isLogout ? (
                  <Button
                    label="Login"
                    onClick={() => {
                      localStorage.removeItem("user");
                      localStorage.removeItem("authToken");
                      localStorage.removeItem("client-storage");
                      window.location.href = "/admin/login";
                    }}
                    disabled={isConfirming}
                    textColor="text-gray-700"
                    border="border border-gray-300"
                    width="w-24"
                  />
                ) : (
                  <>
                    <Button
                      label="Leave"
                      onClick={onDiscard || onClose}
                      disabled={isConfirming}
                      bg="bg-red-500"
                      textColor="text-white"
                      width="w-24"
                    />
                    <Button
                      label={isConfirming ? "Saving..." : "Save & Continue"}
                      onClick={handleConfirm}
                      disabled={isConfirming}
                      textColor="text-white"
                      bg="bg-gradient-to-r from-[#2E3D99] to-[#1D97D7]"
                      width="w-40"
                    />
                  </>
                )}
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
