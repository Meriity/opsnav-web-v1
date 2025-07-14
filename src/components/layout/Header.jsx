import { useState, useEffect, useCallback } from "react"
import useDebounce from "../../hooks/useDebounce";
import { Search } from "lucide-react";
import ClientAPI from "../../api/clientAPI";
import { useNavigate } from 'react-router-dom';

export default function Header() {
    const [searchQuery, setSearchQuery] = useState("")
    const [searchResult, setSearchResult] = useState([])
    const debouncedInput = useDebounce(searchQuery, 500);
    const [showDropdown, setShowDropdown] = useState(true);
    const [loading, setLoading] = useState(false);
    const api = new ClientAPI()
    const navigate = useNavigate();

    useEffect(() => {
        if (debouncedInput.trim()) {
            fetchSearchResults(debouncedInput);
        } else {
            setSearchResult([]);
        }
    }, [debouncedInput]);

    const handleSearchOnchange = useCallback((e) => {
        setSearchQuery(e.target.value);
    }, []);

    function handelListClick(val) {
        return navigate(`/admin/client/stages/${val.matterNumber}`, { state: { val } });
    }

    const fetchSearchResults = async (value) => {
        setLoading(true);
        setShowDropdown(true);
        try {
            const response = await api.getSearchResult(value);
            setSearchResult(response);
        } catch (err) {
            console.error("Error fetching suggestions:", err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <div className="flex sticky justify-between items-center bg-white p-2 mb-2">
                <h2 className="text-xl font-semibold">Hello {localStorage.getItem("user")}</h2>
                <div className="relative w-fit">
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm">
                        <Search className="w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search by Matter Number, Client Name"
                            className="outline-none text-sm bg-transparent"
                            style={{ width: "250px", height: "25px" }}
                            value={searchQuery}
                            onChange={handleSearchOnchange}
                        />
                    </div>
                    {showDropdown && (
                        <div className="absolute left-0 top-full mt-1 w-full bg-white rounded-md shadow-md z-50 max-h-60 overflow-y-auto">
                            {loading ? (
                                <div className="p-3 text-gray-500 text-sm">Loading...</div>
                            ) : searchQuery.trim() && searchResult.length === 0 ? (
                                <div className="p-3 text-gray-400 text-sm">No results found</div>
                            ) : (
                                <ul className="divide-y divide-gray-100">
                                    {searchResult.map((item, index) => (
                                        <li
                                            key={index}
                                            className="p-3 hover:bg-blue-50 cursor-pointer text-sm"
                                            onClick={() => handelListClick(item)}
                                        >
                                            <span className="font-medium text-gray-800">{item?.matterNumber}</span>
                                            <span className="text-gray-500 ml-2">— {item?.clientName}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}