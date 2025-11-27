import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import useDebounce from "../../hooks/useDebounce";
import { Search, Maximize2, Minimize2, X } from "lucide-react";
import ClientAPI from "../../api/clientAPI";
import { useNavigate } from "react-router-dom";
import { useSearchStore } from "../../pages/SearchStore/searchStore.js";
// import NotificationBell from "../ui/NotificationBell.jsx";
import SidebarModuleSwitcher from "../ui/SidebarModuleSwitcher.jsx";

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

  const [isFullScreen, setIsFullScreen] = useState(false);

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

      const lowercasedValue = value.toLowerCase();
      const filteredResults = response.filter(
        (item) =>
          String(item.matterNumber || item.orderId)
            .toLowerCase()
            .includes(lowercasedValue) ||
          String(item.clientName).toLowerCase().includes(lowercasedValue) ||
          String(item.propertyAddress || item.property_address)
            .toLowerCase()
            .includes(lowercasedValue) ||
          String(item.state).toLowerCase().includes(lowercasedValue) ||
          String(item.referral || item.referralName)
            .toLowerCase()
            .includes(lowercasedValue)
      );

      setSearchResult(filteredResults);
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

  useEffect(() => {
    const handleFullScreenChange = () => {
      const doc = window.document;
      const isCurrentlyFullScreen = !!(
        doc.fullscreenElement ||
        doc.mozFullScreenElement ||
        doc.webkitFullscreenElement ||
        doc.msFullscreenElement
      );
      setIsFullScreen(isCurrentlyFullScreen);
    };

    document.addEventListener("fullscreenchange", handleFullScreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullScreenChange);
    document.addEventListener("mozfullscreenchange", handleFullScreenChange);
    document.addEventListener("msfullscreenchange", handleFullScreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullScreenChange
      );
      document.removeEventListener(
        "mozfullscreenchange",
        handleFullScreenChange
      );
      document.removeEventListener(
        "msfullscreenchange",
        handleFullScreenChange
      );
    };
  }, []);

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
      <div className="top-0 p-4 bg-white mb-2 block md:flex justify-between items-center rounded-lg z-40">
        <h2 className="text-xl font-semibold py-3">
          Hello {localStorage.getItem("user")}
        </h2>

        <div className="flex items-center gap-8">
          <SidebarModuleSwitcher />

          <div
            className="flex justify-center items-center relative w-full md:w-fit px-4 md:px-0"
            ref={searchBoxRef}
          >
            <button
              onClick={toggleFullScreen}
              className="relative right-6 text-gray-500 hover:text-blue-500 cursor-pointer transition-all duration-200 hover:scale-110"
              title={isFullScreen ? "Exit Fullscreen" : "Toggle Fullscreen"}
            >
              {isFullScreen ? (
                <Minimize2 className="w-5 h-5" strokeWidth={2} />
              ) : (
                <Maximize2 className="w-5 h-5" strokeWidth={2} />
              )}
            </button>

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

              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <X className="w-4 h-4" strokeWidth={2} />
                </button>
              )}
            </div>
          </div>
          {/* <NotificationBell /> */}
        </div>
      </div>

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
