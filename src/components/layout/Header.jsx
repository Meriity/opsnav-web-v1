import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import useDebounce from "../../hooks/useDebounce";
import { Search } from "lucide-react";
import ClientAPI from "../../api/clientAPI";
import { useNavigate } from "react-router-dom";
import { useSearchStore } from "../../pages/SearchStore/searchStore.js";
import NotificationBell from "../ui/NotificationBell.jsx";
import ModuleSwitcher from "../ui/ModuleSwitcher.jsx";
import ModernModuleSwitcher from "../ui/ModernModuleSwitcher.jsx";
import SidebarModuleSwitcher from "../ui/SidebarModuleSwitcher.jsx";
import FloatingModuleSwitcher from "../ui/FloatingModuleSwitcher.jsx";

export default function Header() {
  const { searchQuery, setSearchQuery } = useSearchStore();
  const debouncedInput = useDebounce(searchQuery, 500);
  const [searchResult, setSearchResult] = useState([]);
  const [showDropdown, setShowDropdown] = useState(true);
  const [loading, setLoading] = useState(false);
  const api = new ClientAPI();
  const navigate = useNavigate();
  const company = localStorage.getItem("company");

  const searchBoxRef = useRef(null);
  const [dropdownPos, setDropdownPos] = useState({
    left: 0,
    top: 0,
    width: 0,
  });

  useEffect(() => {
    if (debouncedInput.trim()) {
      fetchSearchResults(debouncedInput);
    } else {
      setSearchResult([]);
    }
  }, [debouncedInput]);

  const handleSearchOnchange = useCallback(
    (e) => {
      setSearchQuery(e.target.value);
    },
    [setSearchQuery]
  );

  function handelListClick(val) {
    setShowDropdown(false);
    return navigate(`/admin/client/stages/${val.matterNumber || val.orderId}`, {
      state: { val },
    });
  }

  const fetchSearchResults = async (value) => {
    setLoading(true);
    setShowDropdown(true);
    try {
      const response =
        company === "vkl"
          ? await api.getSearchResult(value)
          : company === "idg"
          ? await api.getIDGSearchResult(value)
          : "";
      setSearchResult(response);
      console.log(response);
    } catch (err) {
      console.error("Error fetching suggestions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchBoxRef.current) {
      const rect = searchBoxRef.current.getBoundingClientRect();
      setDropdownPos({
        left: rect.left,
        top: rect.bottom + window.scrollY,
        width: rect.width,
      });
    }
  }, [searchQuery]);

  const toggleFullScreen = () => {
    const doc = window.document;
    const docEl = doc.documentElement;

    const requestFullScreen =
      docEl.requestFullscreen ||
      docEl.mozRequestFullScreen ||
      docEl.webkitRequestFullScreen ||
      docEl.msRequestFullscreen;

    const cancelFullScreen =
      doc.exitFullscreen ||
      doc.mozCancelFullScreen ||
      doc.webkitExitFullscreen ||
      doc.msExitFullscreen;

    if (
      !doc.fullscreenElement &&
      !doc.mozFullScreenElement &&
      !doc.webkitFullscreenElement &&
      !doc.msFullscreenElement
    ) {
      requestFullScreen.call(docEl);
    } else {
      cancelFullScreen.call(doc);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchBoxRef.current &&
        !searchBoxRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <div className="sticky top-0 p-4 bg-white mb-2 block md:flex justify-between items-center rounded-lg z-40">
        <h2 className="text-xl font-semibold py-3">
          Hello {localStorage.getItem("user")}
        </h2>

        <div className="flex items-center gap-8">
          {/* Module Switcher */}

          {/* <ModuleSwitcher /> */}
          {/* <ModernModuleSwitcher /> */}
          <SidebarModuleSwitcher />
          {/* <FloatingModuleSwitcher /> */}

          {/* Fullscreen and Search */}
          <div
            className="flex justify-center items-center relative w-full md:w-fit px-4 md:px-0"
            ref={searchBoxRef}
          >
            {/* Fullscreen Toggle */}
            <div
              onClick={toggleFullScreen}
              className="relative right-6 text-[#00AEE5] hover:text-blue-500 cursor-pointer transition-colors duration-200"
              title="Toggle Fullscreen"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                className="hover:scale-110 transition-transform duration-200"
              >
                <path
                  fill="currentColor"
                  d="M8 2H3a1 1 0 0 0-1 1v5a1 1 0 0 0 2 0V4h4a1 1 0 0 0 0-2m0 18H4v-4a1 1 0 0 0-2 0v5a1 1 0 0 0 1 1h5a1 1 0 0 0 0-2M21 2h-5a1 1 0 0 0 0 2h4v4a1 1 0 0 0 2 0V3a1 1 0 0 0-1-1m0 13a1 1 0 0 0-1 1v4h-4a1 1 0 0 0 0 2h5a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1"
                />
              </svg>
            </div>

            {/* Search Box */}
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm w-full md:max-w-xs border border-gray-200 hover:border-gray-300 transition-colors duration-200">
              <Search className="w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder={
                  company === "vkl"
                    ? "Search by Matter Number, Client Name"
                    : "Search by OrderId, Name"
                }
                className="outline-none text-sm bg-transparent w-full placeholder-gray-400"
                value={searchQuery}
                onChange={handleSearchOnchange}
                onFocus={() => setShowDropdown(true)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setShowDropdown(false);
                  }
                }}
              />

              {/* Clear search button */}
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
            <NotificationBell />
        </div>
      </div>

      {/* Search Results Dropdown */}
      {showDropdown &&
        searchQuery.trim() &&
        createPortal(
          <div
            className="fixed bg-white rounded-md shadow-lg z-50 max-h-60 overflow-y-auto border border-gray-200"
            style={{
              left: dropdownPos.left,
              top: dropdownPos.top,
              width: dropdownPos.width,
            }}
          >
            {loading ? (
              <div className="p-3 text-gray-500 text-sm flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                Searching...
              </div>
            ) : searchResult.length === 0 ? (
              <div className="p-3 text-gray-400 text-sm">
                No results found for "{searchQuery}"
              </div>
            ) : (
              <>
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 border-b border-gray-100">
                  Found {searchResult.length} result
                  {searchResult.length !== 1 ? "s" : ""}
                </div>
                <ul className="divide-y divide-gray-100">
                  {searchResult.map((item, index) => (
                    <li
                      key={`${item.matterNumber || item.orderId}-${index}`}
                      className="p-3 hover:bg-blue-50 cursor-pointer transition-colors duration-150"
                      onClick={() => handelListClick(item)}
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-medium text-gray-800 text-sm">
                          {item?.matterNumber || item?.orderId}
                        </span>
                        {item?.status && (
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              item.status === "active"
                                ? "bg-green-100 text-green-800"
                                : item.status === "closed"
                                ? "bg-gray-100 text-gray-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {item.status}
                          </span>
                        )}
                      </div>
                      <div className="text-gray-500 text-sm mt-1">
                        {item?.clientName}
                      </div>
                      {item?.clientEmail && (
                        <div className="text-gray-400 text-xs mt-1 truncate">
                          {item.clientEmail}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>,
          document.body
        )}
    </>
  );
}
