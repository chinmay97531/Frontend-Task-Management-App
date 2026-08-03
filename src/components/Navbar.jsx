import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { FaSearch, FaFilter } from "react-icons/fa";
import axios from "axios";


import { BACKEND_URL } from "../config.js";
import TaskFlowLogo from "../assets/TaskFlow.png";
import { useToast } from "./Toast.jsx";
import { getApiErrorMessage } from "../utils/apiError.js";
import { UserAvatar } from "./UserAvatar.jsx";

export function NavBar({
  setModalOpen,
  setTasks,
  refreshTasks,
  filterOpen,
  setFilterOpen,
}) {
  const searchRef = useRef(null);
  const profileRef = useRef(null);
  const filterRef = useRef(null);
  const navigate = useNavigate();
  const toast = useToast();
  const [profileOpen, setProfileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [allTasks, setAllTasks] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    fetchAllTasks();
    fetchProfile();
  }, []);

  useEffect(() => {
    if (!profileOpen) return undefined;
    const onPointerDown = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [profileOpen]);

  useEffect(() => {
    if (!filterOpen) return undefined;
    const onPointerDown = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [filterOpen, setFilterOpen]);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const response = await axios.get(BACKEND_URL + "/me", {
        headers: { token },
      });
      setUser(response.data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const fetchAllTasks = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        BACKEND_URL + "/GetTask",
        {},
        {
          headers: {
            token: token,
          },
        }
      );
      setAllTasks(response.data.tasks);
    } catch (error) {
      console.error("Error fetching tasks for search:", error);
    }
  };

  const handleSearch = () => {
    const searchValue = searchRef.current.value.trim().toLowerCase();

    if (!searchValue) {
      refreshTasks();
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    const filtered = allTasks.filter((task) => {
      const titleMatch =
        task.title?.toLowerCase().includes(searchValue) || false;

      const assigneeMatch =
        task.assignedTo?.some(
          (assignee) =>
            assignee.name?.toLowerCase().includes(searchValue) ||
            assignee.email?.toLowerCase().includes(searchValue)
        ) || false;

      return titleMatch || assigneeMatch;
    });

    setTasks(filtered);
  };

  const clearSearch = () => {
    searchRef.current.value = "";
    setIsSearching(false);
    refreshTasks();
    fetchAllTasks();
  };

  const handleFilter = async (filterType) => {
    try {
      const token = localStorage.getItem("token");
      const isCleanup =
        filterType === "deleteCompleted" || filterType === "deletePastDue";

      const response = await axios.post(
        BACKEND_URL + "/filter",
        { filterType },
        {
          headers: {
            token: token,
          },
        }
      );

      setFilterOpen(false);
      setIsSearching(false);
      if (searchRef.current) {
        searchRef.current.value = "";
      }

      if (isCleanup) {
        // Prefer tasks from API; fall back to a silent refresh if omitted
        if (Array.isArray(response.data.tasks)) {
          setTasks(response.data.tasks);
          setAllTasks(response.data.tasks);
        } else {
          await refreshTasks();
          await fetchAllTasks();
        }
        toast.success("Cleanup complete.");
        return;
      }

      const nextTasks = Array.isArray(response.data.tasks)
        ? response.data.tasks
        : [];
      setTasks(nextTasks);
      setAllTasks(nextTasks);
      toast.success("Filter applied.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not apply filter."));
    }
  };

  function signOut() {
    localStorage.removeItem("token");
    setProfileOpen(false);
    toast.info("Signed out.");
    navigate("/");
  }

  function dropDownMenu() {
    setFilterOpen(!filterOpen);
    setProfileOpen(false);
  }

  const filterItemClass =
    "px-4 py-2.5 hover:bg-white/10 cursor-pointer text-stone-100 transition-colors text-sm";
  const filterSectionClass =
    "px-4 py-2 font-semibold text-teal-300 uppercase text-[11px] tracking-wider mt-1";

  return (
    <div className="sticky top-0 z-40 w-full px-3 sm:px-4 pt-3">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 w-full max-w-7xl mx-auto tf-glass rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.25)] px-4 py-3 sm:px-5">
        <div
          onClick={() => {
            setModalOpen(false);
            setFilterOpen(false);
            refreshTasks();
            fetchAllTasks();
            setIsSearching(false);
            if (searchRef.current) {
              searchRef.current.value = "";
            }
          }}
          className="flex items-center gap-3 hover:cursor-pointer group shrink-0"
        >
          <img
            src={TaskFlowLogo}
            alt="TaskFlow Logo"
            className="h-9 w-9 object-contain group-hover:scale-110 transition-transform duration-200"
          />
          <span className="font-display text-2xl sm:text-3xl font-semibold bg-gradient-to-r from-teal-300 via-teal-400 to-coral-400 bg-clip-text text-transparent">
            TaskFlow
          </span>
        </div>

        <div className="flex flex-wrap lg:flex-nowrap items-center gap-2 sm:gap-3">
          <div className="relative flex items-center flex-1 min-w-[12rem]">
            <div className="absolute left-3 pointer-events-none">
              <svg
                className="w-5 h-5 text-stone-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              ref={searchRef}
              type="text"
              name="Search with name of assignee"
              placeholder="Search tasks or assignees..."
              className="tf-input w-full sm:w-64 h-11 pl-10 pr-10 rounded-xl"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
            />
            {isSearching && (
              <button
                onClick={clearSearch}
                className="absolute right-3 text-stone-500 hover:text-stone-50 transition-colors text-xl font-bold leading-none w-5 h-5 flex items-center justify-center rounded-full hover:bg-white/10"
                title="Clear search"
              >
                ×
              </button>
            )}
          </div>

          <button
            type="button"
            className="h-11 px-5 bg-teal-500/90 hover:bg-teal-400 text-white font-semibold text-sm rounded-xl transition-all duration-200 shadow-sm cursor-pointer hover:scale-105 active:scale-95"
            onClick={handleSearch}
          >
            <FaSearch />
          </button>

          <div className="relative inline-block text-left" ref={filterRef}>
            <button
              onClick={dropDownMenu}
              className="relative z-[60] flex items-center gap-2 h-11 px-4 bg-white/5 hover:bg-white/10 border border-white/15 rounded-xl text-stone-100 transition-all duration-200 hover:scale-105 active:scale-95"
              title="Filter tasks"
            >
              <FaFilter />
            </button>
            {filterOpen && (
              <div className="absolute right-0 mt-2 w-72 tf-glass rounded-xl shadow-2xl z-[60] max-h-[70vh] overflow-y-auto tf-animate-fade-in">
                <ul className="py-2 text-sm">
                  <li className={filterSectionClass}>Recent Tasks</li>
                  <li
                    onClick={() => handleFilter("first3")}
                    className={filterItemClass}
                  >
                    Oldest 3 Tasks
                  </li>
                  <li
                    onClick={() => handleFilter("last3")}
                    className={filterItemClass}
                  >
                    Newest 3 Tasks
                  </li>
                  <li
                    onClick={() => handleFilter("slice5")}
                    className={filterItemClass}
                  >
                    Top 5 Tasks
                  </li>

                  <li className={filterSectionClass}>Quick Filters</li>
                  <li
                    onClick={() => handleFilter("pending")}
                    className={filterItemClass}
                  >
                    Pending Tasks
                  </li>
                  <li
                    onClick={() => handleFilter("highPriority")}
                    className={filterItemClass}
                  >
                    High Priority Only
                  </li>
                  <li
                    onClick={() => handleFilter("thisWeek")}
                    className={filterItemClass}
                  >
                    This Week&apos;s Tasks
                  </li>
                  <li
                    onClick={() => handleFilter("importantLabel")}
                    className={filterItemClass}
                  >
                    High Priority &amp; In Progress Tasks
                  </li>

                  <li className={filterSectionClass}>Insights &amp; Stats</li>
                  <li
                    onClick={() => handleFilter("groupByStatus")}
                    className={filterItemClass}
                  >
                    Pending Tasks by Status
                  </li>
                  <li
                    onClick={() => handleFilter("tasksDueToday")}
                    className={filterItemClass}
                  >
                    Tasks Due Today
                  </li>
                  <li
                    onClick={() => handleFilter("sortedGrouped")}
                    className={filterItemClass}
                  >
                    Completed Tasks by Status
                  </li>

                  <li className={filterSectionClass}>Clean-Up Actions</li>
                  <li
                    onClick={() => handleFilter("deleteCompleted")}
                    className="px-4 py-2.5 text-rose-700 hover:bg-rose-50/50 cursor-pointer transition-colors text-sm"
                  >
                    Delete All Completed Tasks
                  </li>
                  <li
                    onClick={() => handleFilter("deletePastDue")}
                    className="px-4 py-2.5 text-rose-700 hover:bg-rose-50/50 cursor-pointer transition-colors text-sm"
                  >
                    Delete Overdue Tasks
                  </li>

                  <li className={filterSectionClass}>Show Everything</li>
                  <li
                    onClick={() => handleFilter("all")}
                    className={filterItemClass}
                  >
                    View All Tasks
                  </li>
                </ul>
              </div>
            )}
          </div>

          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => {
                setProfileOpen((open) => !open);
                setFilterOpen(false);
              }}
              className="h-11 w-11 grid place-items-center rounded-full bg-white/5 hover:bg-white/10 border border-white/15 transition-all duration-200 hover:scale-[1.03] active:scale-95"
              title={user?.username || "Account"}
              aria-label="Account"
            >
              <UserAvatar
                src={user?.avatar}
                name={user?.username || user?.email || "U"}
                size="sm"
              />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-64 tf-glass rounded-xl shadow-2xl z-50 tf-animate-fade-in overflow-hidden">
                <div className="px-4 py-3 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <UserAvatar
                      src={user?.avatar}
                      name={user?.username || user?.email || "U"}
                      size="lg"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-stone-50 truncate">
                        {user?.username || "User"}
                      </p>
                      <p className="text-xs text-stone-500 truncate">
                        {user?.email || ""}
                      </p>
                      {user?.authProvider === "google" && (
                        <p className="mt-1 text-[10px] uppercase tracking-wider text-teal-300/90">
                          Google account
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={signOut}
                  className="w-full text-left px-4 py-3 text-sm text-rose-200 hover:bg-rose-50/10 transition-colors"
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
