import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import useDebounce from "../../hooks/useDebounce";
import { useLocation } from "react-router-dom";
import {
  Search,
  Maximize2,
  Minimize2,
  X,
  ChevronRight,
  Calendar,
  Clock,
  Command,
} from "lucide-react";
import ClientAPI from "../../api/clientAPI";
import { useNavigate } from "react-router-dom";
import { useSearchStore } from "../../pages/SearchStore/searchStore.js";
import { useArchivedClientStore } from "../../pages/ArchivedClientStore/UseArchivedClientStore.js";
import SidebarModuleSwitcher from "../ui/SidebarModuleSwitcher.jsx";
import { motion, AnimatePresence } from "framer-motion";
import CommercialAPI from "../../api/commercialAPI";

export default function Header() {
  const { searchQuery, setSearchQuery } = useSearchStore();
  const debouncedInput = useDebounce(searchQuery, 500);
  const [searchResult, setSearchResult] = useState([]);
  const [showDropdown, setShowDropdown] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isMac, setIsMac] = useState(true);

  const api = new ClientAPI();
  const commercialApi = new CommercialAPI();
  const { archivedClients } = useArchivedClientStore();

  const navigate = useNavigate();
  const currentModule = localStorage.getItem("currentModule");
  const isPrintMedia = currentModule === "print media";

  const searchBoxRef = useRef(null);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  const location = useLocation();
  const isArchivedPage = location.pathname.includes("archived");

  const [dropdownPos, setDropdownPos] = useState({ left: 0, top: 0, width: 0 });
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    setIsMac(userAgent.includes("mac"));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setShowDropdown(true);
        setIsFocused(true);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  }).format(currentTime);

  const formattedTime = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(currentTime);

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
    if (!val) return;
    setShowDropdown(false);
    
    // 1. Robust ID Extraction (Handle inconsistent API response casing)
    const id = 
        val.matterNumber || 
        val.matternumber || 
        val.orderId || 
        val.orderid || 
        val.id || 
        val._id || 
        val.clientId;

    if (!id) {
       console.error("Missing Matter ID for navigation. Object:", val);
       return;
    }

    const role = localStorage.getItem("role") || "admin";
    const basePath = role === "user" ? "/user" : "/admin";
    
    // 2. Robust Archived Check
    const status = (val.status || "").toLowerCase();
    const closeMatter = (val.closeMatter || "").toLowerCase();
    const isArchived = 
      status === "closed" || 
      status === "archived" ||
      closeMatter === "closed" ||
      closeMatter === "cancelled";

    if (isArchived) {
       return navigate(`${basePath}/archived-clients`, {
          state: { val },
       });
    }

    // Active Matters Logic
    
    // 3. Auto-detect Print Media
    if (String(id).toUpperCase().startsWith("IDG")) {
        localStorage.setItem("currentModule", "print media");
    }

    // 4. Construct URL based on Role
    let targetUrl;
    if (role === "user") {
        targetUrl = `/user/client/${id}/stages`;
    } else {
        targetUrl = `/admin/client/stages/${id}`;
    }
    
    // 5. Force full navigation
    // Using href guarantees a fresh page load
    window.location.href = targetUrl;
  }

  const fetchSearchResults = async (value) => {
    setLoading(true);
    setShowDropdown(true);
    try {
      const lowercasedValue = value.toLowerCase();

      let response = [];

      // 🔹 COMMERCIAL (FIX)
      if (currentModule === "commercial") {
        response = isArchivedPage
          ? await commercialApi.getArchivedProjects()
          : await commercialApi.getActiveProjects();
      }

      // 🔹 PRINT MEDIA
      else if (currentModule === "print media") {
         try {
           response = await api.getIDGSearchResult(value);
         } catch (e) {
           console.warn("Error fetching IDG search results, falling back to empty:", e);
           response = [];
         }
      }

      // 🔹 ARCHIVED
      else if (archivedClients && archivedClients.length > 0) {
        response = archivedClients.map((c) => c.__raw || c);
      }
      // 🔹 DEFAULT (Conveyancing)
      else {
        // Fetch all active clients to allow frontend filtering on all fields (including Referral)
        try {
          response = await api.getClients();
        } catch (e) {
          console.warn("Error fetching clients for search, falling back to empty:", e);
          response = [];
        }
      }

      // Normalize
      response = Array.isArray(response)
        ? response
        : response?.data || response?.clients || [];

      const searchWords = lowercasedValue.split(/\s+/).filter(Boolean);

      const getNumericIdentifiers = (item) => {
        const raw = item.__raw || item;

        return [raw.matterNumber, raw.orderId, raw.clientId, raw.id, raw._id]
          .filter(Boolean)
          .map((v) => String(v));
      };

      const filteredResults = (response || []).filter((item) => {
        const raw = item.__raw || item;

        const printMediaIds = [raw.orderId, raw.clientId]
          .filter(Boolean)
          .map((v) => String(v).toLowerCase());

        const numericFields = [raw.matterNumber]
          .filter(Boolean)
          .map((v) => String(v));

        const textFields = [
          raw.clientName || raw.client_name,
          raw.businessName,
          raw.businessAddress || raw.propertyAddress || raw.property_address,
          raw.state,
          raw.clientType || raw.type,
          raw.referral || raw.referralName,
        ]
          .filter(Boolean)
          .map((v) => String(v).toLowerCase());

        return searchWords.every((word) => {
          const lowerWord = word.toLowerCase();
          const numericWord = word.replace(/\D/g, "");
          const isPureNumeric = /^\d+$/.test(word);

          // 🟠 PRINT MEDIA — ALPHANUMERIC SAFE SEARCH
          if (isPrintMedia) {
            return (
              printMediaIds.some((id) => id.includes(lowerWord)) ||
              textFields.some((field) => field.includes(lowerWord))
            );
          }

          // 🔵 COMMERCIAL / CONVEYANCING — STRICT NUMERIC
          if (isPureNumeric) {
            return numericFields.some(
              (field) => field === numericWord || field.startsWith(numericWord)
            );
          }

          // 🔵 TEXT SEARCH
          return textFields.some((field) => field.includes(lowerWord));
        });
      });

      setSearchResult(filteredResults);
    } catch (err) {
      console.error("Error fetching suggestions:", err);
      setSearchResult([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchBoxRef.current) {
      const rect = searchBoxRef.current.getBoundingClientRect();
      setDropdownPos({
        left: rect.left,
        top: rect.bottom + window.scrollY + 12,
        width: rect.width,
      });
    }
  }, [searchQuery, isFocused]);

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
      // Check if click is outside BOTH the search box AND the dropdown
      if (
        searchBoxRef.current &&
        !searchBoxRef.current.contains(event.target) &&
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.2, ease: "easeOut" },
    },
    exit: { opacity: 0, y: -10, transition: { duration: 0.15 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.03, duration: 0.2 },
    }),
  };

  return (
    <>
      <header className="sticky top-0 z-40 mb-6 group transition-all duration-500">
        <div className="absolute inset-0 bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-[0_4px_30px_rgba(0,0,0,0.03)] transition-all duration-300" />
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#2E3D99]/20 to-transparent" />

        <div className="relative px-4 py-3 md:px-6 md:py-4 flex flex-col md:flex-row justify-between items-center gap-3 lg:gap-4">
          <div className="flex flex-row items-center gap-4 w-full md:hidden lg:flex lg:w-auto lg:min-w-[200px]">
            <div className="flex flex-col items-end">
              <img
                className={`h-auto object-contain w-14 transition-all duration-300 ease-in-out`}
                src={localStorage.getItem("logo") || "/Logo.png"}
                alt="Logo"
              />
              
            </div>
            {/* <img src="../public/Logo_vk.png" alt="Logo" className="h-auto object-contain w-14 transition-all duration-300 ease-in-out"/> */}
            <div className="flex flex-col items-start gap-1">
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2"
              >
                <h1 className="text-xl font-bold bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] bg-clip-text text-transparent">
                  Hello, {localStorage.getItem("user") || "Admin"}
                </h1>
                <span className="animate-pulse hidden md:block">👋</span>
              </motion.div>

              <div className="flex items-center gap-3 text-xs font-medium text-gray-500 bg-gray-50/50 px-2 py-1 rounded-md border border-gray-100">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 text-[#2E3D99]" />
                  <span>{formattedDate}</span>
                </div>
                <div className="w-px h-3 bg-gray-300" />
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-[#1D97D7]" />
                  <span className="tabular-nums">{formattedTime}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto justify-end">
            <div className="hidden md:block scale-90 origin-right">
              <SidebarModuleSwitcher />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto relative z-20">
              <button
                onClick={toggleFullScreen}
                className="hidden lg:flex p-2.5 rounded-xl bg-gray-50 text-gray-500 hover:text-[#2E3D99] hover:bg-white hover:shadow-md transition-all duration-300 border border-transparent hover:border-gray-100"
              >
                {isFullScreen ? (
                  <Minimize2 className="w-5 h-5" />
                ) : (
                  <Maximize2 className="w-5 h-5" />
                )}
              </button>

              <div
                ref={searchBoxRef}
                className={`
                  relative transition-all duration-500 ease-out
                  ${
                    isFocused
                      ? "w-full md:w-[300px] lg:w-[380px]"
                      : "w-full md:w-[220px] lg:w-[280px]"
                  }
                `}
              >
                <div
                  className={`
                  absolute -inset-0.5 bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] rounded-2xl opacity-0 transition-opacity duration-300 blur-sm
                  ${isFocused ? "opacity-30" : "opacity-0"}
                `}
                />

                <div
                  className={`
                  relative flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all duration-300 bg-white
                  ${
                    isFocused
                      ? "border-transparent shadow-lg ring-1 ring-[#2E3D99]/10"
                      : "border-gray-200 shadow-sm hover:border-[#2E3D99]/30 hover:shadow-md"
                  }
                `}
                >
                  <Search
                    className={`w-4 h-4 transition-colors duration-300 ${
                      isFocused ? "text-[#2E3D99]" : "text-gray-400"
                    }`}
                  />

                  <input
                    ref={inputRef}
                    type="text"
                    placeholder={
                      currentModule === "print media"
                        ? "Search..."
                        : "Search Matter # or Client..."
                    }
                    className="w-full bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400 font-medium"
                    value={searchQuery}
                    onChange={handleSearchOnchange}
                    onFocus={() => {
                      setShowDropdown(true);
                      setIsFocused(true);
                    }}
                    onBlur={() => {
                      setTimeout(() => setIsFocused(false), 200);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        setShowDropdown(false);
                      }
                    }}
                  />

                  <AnimatePresence>
                    {searchQuery ? (
                      <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        onClick={() => {
                          setSearchQuery("");
                          inputRef.current?.focus();
                        }}
                        className="p-1 rounded-full bg-gray-100 text-gray-500 hover:bg-[#FB4A50] hover:text-white transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </motion.button>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        className="hidden md:flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-gray-200 bg-gray-50 text-[10px] text-gray-400 font-medium cursor-pointer"
                        onClick={() => inputRef.current?.focus()}
                      >
                        {isMac ? (
                          <Command className="w-3 h-3" />
                        ) : (
                          <span className="text-[10px] font-bold">Ctrl</span>
                        )}
                        <span>K</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {createPortal(
        <AnimatePresence>
          {showDropdown && searchQuery.trim() && (
            <motion.div
              ref={dropdownRef}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed z-[99] flex flex-col bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 overflow-hidden"
              style={{
                left: dropdownPos.left,
                top: dropdownPos.top,
                width: dropdownPos.width,
                maxHeight: "450px",
              }}
            >
              <div className="px-4 py-2 bg-gray-50/80 border-b border-gray-100 flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                <span>
                  {loading ? "Searching Database..." : "Best Matches"}
                </span>
                {!loading && (
                  <span className="bg-[#2E3D99]/10 text-[#2E3D99] px-2 py-0.5 rounded-full">
                    {searchResult.length} found
                  </span>
                )}
              </div>

              <div className="overflow-y-auto custom-scrollbar p-2">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3 text-gray-400">
                    <div className="w-6 h-6 border-2 border-[#2E3D99]/20 border-t-[#2E3D99] rounded-full animate-spin" />
                    <span className="text-xs font-medium">Processing...</span>
                  </div>
                ) : searchResult.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Search className="w-5 h-5 text-gray-300" />
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      No results found
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Try searching for a specific ID or name
                    </p>
                  </div>
                ) : (
                  <ul className="space-y-1">
                    {searchResult.map((item, index) => (
                      <motion.li
                        key={`${item.matterNumber || item.orderId}-${index}`}
                        custom={index}
                        variants={itemVariants}
                        onClick={() => handelListClick(item)}
                        className="group relative flex items-center justify-between p-3 rounded-xl cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent transition-all duration-200 border border-transparent hover:border-blue-100"
                      >
                        <div className="flex flex-col gap-1 overflow-hidden">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[#2E3D99] group-hover:scale-125 transition-transform" />
                            <span className="font-bold text-gray-800 text-sm group-hover:text-[#2E3D99] transition-colors">
                              {item?.matterNumber || item?.orderId}
                            </span>
                            {/* Hide status for Print Media as requested */}
                            {item?.status && !isPrintMedia && (
                              <span
                                className={`
                                 text-[10px] font-bold px-1.5 py-0.5 rounded border
                                 ${
                                   item.status === "active"
                                     ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                     : item.status === "closed"
                                     ? "bg-gray-50 text-gray-500 border-gray-200"
                                     : "bg-blue-50 text-blue-600 border-blue-100"
                                 }
                               `}
                              >
                                {item.status.toUpperCase()}
                              </span>
                            )}
                          </div>

                          <div className="pl-4">
                            <p className="text-sm font-medium text-gray-600 truncate">
                              {item?.clientName}
                            </p>
                            <p className="text-xs text-gray-400 truncate max-w-[200px]">
                              {item?.propertyAddress ||
                                item?.deliveryAddress ||
                                item?.businessAddress ||
                                item?.clientEmail ||
                                "No detailed info"}
                            </p>
                          </div>
                        </div>

                        <div className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                          <div className="p-1.5 rounded-lg bg-white shadow-sm border border-gray-100 text-[#2E3D99]">
                            <ChevronRight className="w-4 h-4" />
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </ul>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
