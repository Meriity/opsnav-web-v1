import { useState, useEffect, useCallback } from "react";
import useDebounce from "../../hooks/useDebounce";
import { Search } from "lucide-react";
import ClientAPI from "../../api/clientAPI";
import { useNavigate } from "react-router-dom";
import { useSearchStore } from "../../pages/SearchStore/SearchStore";

export default function Header() {
  const { searchQuery, setSearchQuery } = useSearchStore(); 
  const debouncedInput = useDebounce(searchQuery, 500);
  const [searchResult, setSearchResult] = useState([]);
  const [showDropdown, setShowDropdown] = useState(true);
  const [loading, setLoading] = useState(false);
  const api = new ClientAPI();
  const navigate = useNavigate();

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
    return navigate(`/admin/client/stages/${val.matterNumber}`, {
      state: { val },
    });
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
  };

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

  return (
    <>
      <div className="sticky top-0 z-10 bg-white p-2 mb-2 block md:flex justify-between items-center">
        <h2 className="text-xl font-semibold py-3">
          Hello {localStorage.getItem("user")}
        </h2>

        <div className="flex justify-center items-center relative w-full md:w-fit px-4 md:px-0">
          <div
            onClick={toggleFullScreen}
            className="relative right-6 text-[#00AEE5] hover:text-blue-500 cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M8 2H3a1 1 0 0 0-1 1v5a1 1 0 0 0 2 0V4h4a1 1 0 0 0 0-2m0 18H4v-4a1 1 0 0 0-2 0v5a1 1 0 0 0 1 1h5a1 1 0 0 0 0-2M21 2h-5a1 1 0 0 0 0 2h4v4a1 1 0 0 0 2 0V3a1 1 0 0 0-1-1m0 13a1 1 0 0 0-1 1v4h-4a1 1 0 0 0 0 2h5a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1"
              />
            </svg>
          </div>
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm w-full md:max-w-xs">
            <Search className="w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search by Matter Number, Client Name"
              className="outline-none text-sm bg-transparent w-full"
              value={searchQuery}
              onChange={handleSearchOnchange}
            />
          </div>
          {showDropdown && (
            <div className="absolute left-0 top-full mt-1 w-full bg-white rounded-md shadow-md z-50 max-h-60 overflow-y-auto">
              {loading ? (
                <div className="p-3 text-gray-500 text-sm">Loading...</div>
              ) : searchQuery.trim() && searchResult.length === 0 ? (
                <div className="p-3 text-gray-400 text-sm">
                  No results found
                </div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {searchResult.map((item, index) => (
                    <li
                      key={index}
                      className="p-3 hover:bg-blue-50 cursor-pointer text-sm"
                      onClick={() => handelListClick(item)}
                    >
                      <span className="font-medium text-gray-800">
                        {item?.matterNumber}
                      </span>
                      <span className="text-gray-500 ml-2">
                        — {item?.clientName}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
