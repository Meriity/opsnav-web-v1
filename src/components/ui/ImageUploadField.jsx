import { useState } from "react";
import { CloudArrowUpIcon } from "@heroicons/react/24/outline"; // heroicons

export default function ImageUploadField({ field }) {
    const [preview, setPreview] = useState(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPreview(URL.createObjectURL(file));
        }
    };

    return (
        <div className="w-full">
            <label className="block mb-1 text-sm md:text-base font-bold">
                {field.label}
            </label>

            <div className="relative w-full">
                {!preview ? (
                    // Empty state with cloud
                    <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
                        <CloudArrowUpIcon className="w-10 h-10 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-500">
                            <span className="font-semibold text-blue-600">Click to upload</span>{" "}
                            or drag & drop
                        </p>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                    </label>
                ) : (
                    // Image preview
                    <div className="relative">
                        <img
                            src={preview}
                            alt="Uploaded preview"
                            className="w-full h-40 object-cover rounded-lg border"
                        />
                        <button
                            type="button"
                            onClick={() => setPreview(null)}
                            className="absolute top-2 right-2 bg-white text-red-600 rounded-full p-1 shadow hover:bg-red-50"
                        >
                            ✕
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
