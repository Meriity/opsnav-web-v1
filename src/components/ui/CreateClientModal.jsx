import ClientAPI from "../../api/userAPI";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function CreateClientModal({ isOpen, setIsOpen }) {
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        matterNumber: "",
        clientName: "",
        state: "",
        clientType: "",
        propertyAddress: "",
        matterDate: "",
        settlementDate: "",
        dataEntryBy: localStorage.getItem("user")
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    async function handleSubmit() {
        setIsLoading(true)
        const matterNumber = formData.matterNumber;
        try {
            const api = new ClientAPI();
            await api.createClient(formData);
            toast.success("Client created successfully!", {
                position: "bottom-center",
            });
            navigate(`/admin/client/stages/${matterNumber}`);
        } catch (e) {
            toast.error("User not created", {
                position: "bottom-center",
            });
        } finally {
            setIsOpen();
            setIsLoading(false)
        }
    };

    return (
        <Dialog open={isOpen} onClose={setIsOpen} className="relative z-10">
            <DialogBackdrop className="fixed inset-0 bg-gray-500/75" />

            <div className="fixed inset-0 z-10 flex items-center justify-center p-4 overflow-y-auto">
                <DialogPanel
                    className="max-w-500 relative transform overflow-hidden rounded-lg bg-[#F3F4FB] text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-3xl data-closed:sm:translate-y-0 data-closed:sm:scale-95 p-6"
                >
                    {/* Close Button */}
                    <button
                        onClick={setIsOpen}
                        className="absolute top-4 right-5 text-red-500 text-xl font-bold hover:scale-110 transition-transform"
                    >
                        &times;
                    </button>

                    {/* Title */}
                    <h2 className="text-2xl font-bold mb-6 text-center">Create Client</h2>

                    <form className="space-y-5" onSubmit={(e) => {
                        e.preventDefault();
                        handleSubmit();
                    }}>
                        {/* Form fields remain the same as before */}
                        {/* Matter Number & Client Name */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block mb-1 font-medium">Matter Number</label>
                                <input
                                    type="text"
                                    name="matterNumber"
                                    value={formData.matterNumber}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white"
                                />
                            </div>
                            <div>
                                <label className="block mb-1 font-medium">Client Name</label>
                                <input
                                    type="text"
                                    name="clientName"
                                    value={formData.clientName}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white"
                                />
                            </div>
                        </div>

                        {/* State & Client Type */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block mb-1 font-medium">State</label>
                                <div className="flex gap-4 flex-wrap">
                                    {["VIC", "NSW", "QLD", "SA"].map((stateOption) => (
                                        <label key={stateOption} className="inline-flex items-center gap-1">
                                            <input
                                                type="radio"
                                                name="state"
                                                value={stateOption}
                                                checked={formData.state === stateOption}
                                                onChange={handleChange}
                                                className="w-4 h-4"
                                            />
                                            <span>{stateOption}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block mb-1 font-medium">Client Type</label>
                                <div className="flex gap-4 flex-wrap">
                                    {["Buyer", "Seller", "Transfer"].map((type) => (
                                        <label key={type} className="inline-flex items-center gap-1">
                                            <input
                                                type="radio"
                                                name="clientType"
                                                value={type}
                                                checked={formData.clientType === type}
                                                onChange={handleChange}
                                                className="w-4 h-4"
                                            />
                                            <span>{type}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Property Address */}
                        <div>
                            <label className="block mb-1 font-medium">Property Address</label>
                            <input
                                type="text"
                                name="propertyAddress"
                                value={formData.propertyAddress}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white"
                            />
                        </div>

                        {/* Matter Date & Settlement Date */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block mb-1 font-medium">Matter Date</label>
                                <input
                                    type="date"
                                    name="matterDate"
                                    value={formData.matterDate}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-500"
                                />
                            </div>
                            <div>
                                <label className="block mb-1 font-medium">Settlement Date</label>
                                <input
                                    type="date"
                                    name="settlementDate"
                                    value={formData.settlementDate}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-500"
                                />
                            </div>
                        </div>

                        {/* Data Entry By */}
                        <div>
                            <label className="block mb-1 font-medium">Data Entry By</label>
                            <input
                                type="text"
                                value={formData.dataEntryBy}
                                readOnly
                                className="w-full px-4 py-2 rounded-md border border-gray-300 bg-gray-100 text-gray-600"
                            />
                        </div>

                        {/* Submit Button */}
                        <div className="pt-4">
                            {
                                isLoading ? (<button
                                    type="button"
                                    disabled={true}
                                    className="w-full bg-sky-600 text-white py-2 rounded-md"
                                >
                                    Sending...
                                </button>) : (
                                    <button
                                        type="submit"
                                        className="w-full bg-[#00AEEF] text-white font-semibold py-2 rounded-md hover:bg-sky-600"
                                    >
                                        Add New Client
                                    </button>
                                )
                            }
                        </div>
                    </form>
                </DialogPanel>
            </div>
        </Dialog>
    )
}