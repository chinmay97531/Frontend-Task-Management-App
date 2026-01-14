import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import filter from "../assets/filter.svg";
import { BACKEND_URL } from "../config.js";
import TaskFlowLogo from "../assets/TaskFlow.png";

export function NavBar({ modalOpen, setModalOpen, setTasks, refreshTasks }) {
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [allTasks, setAllTasks] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    fetchAllTasks();
  }, []);

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
      const titleMatch = task.title?.toLowerCase().includes(searchValue) || false;

      const assigneeMatch = task.assignedTo?.some(
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

      const response = await axios.post(
        BACKEND_URL + "/filter",
        { filterType },
        {
          headers: {
            token: token,
          },
        }
      );
      setTasks(response.data.tasks);
      setAllTasks(response.data.tasks);
      setIsOpen(false);
      setIsSearching(false);
      if (searchRef.current) {
        searchRef.current.value = "";
      }
      
      if (filterType == "deleteCompleted" || filterType == "deletePastDue") {
        window.location.reload();
        refreshTasks();
      }
    } catch (error) {
      console.error(error);
    }
  };

  function signOut() {
    localStorage.removeItem("token");
    navigate("/");
  }

  function dropDownMenu() {
    setIsOpen(!isOpen);
  }

  return (
    <div className="flex flex-row items-center justify-between w-full bg-gradient-to-r from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl shadow-lg m-2 p-4">
      <div
        onClick={() => {
          setModalOpen(() => {false});
          setIsOpen(() => {false});
          refreshTasks();
          fetchAllTasks();
          setIsSearching(false);
          if (searchRef.current) {
            searchRef.current.value = "";
          }
        }}
        className="flex items-center gap-3 hover:cursor-pointer group"
      >
        <img
          src={TaskFlowLogo}
          alt="TaskFlow Logo"
          className="h-10 w-10 object-contain group-hover:scale-110 transition-transform duration-200"
        />
        <span className="text-3xl font-bold bg-gradient-to-r from-cyan-200 to-indigo-200 bg-clip-text text-transparent group-hover:from-cyan-100 group-hover:to-indigo-100 transition-all">
          TaskFlow
        </span>
      </div>
      
      <div className="flex flex-row justify-center items-center gap-4 m-2">
        {/* Search Bar */}
        <div className="relative flex items-center">
          <div className="absolute left-3 pointer-events-none">
            <svg
              className="w-5 h-5 text-gray-400"
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
            className="w-64 h-11 bg-white/10 border border-white/20 text-white placeholder:text-gray-400 pl-10 pr-10 rounded-xl outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all backdrop-blur-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
          />
          {isSearching && (
            <button
              onClick={clearSearch}
              className="absolute right-3 text-gray-400 hover:text-white transition-colors text-xl font-bold leading-none w-5 h-5 flex items-center justify-center rounded-full hover:bg-white/10"
              title="Clear search"
            >
              ×
            </button>
          )}
        </div>

        {/* Search Button */}
        <button
          type="button"
          className="h-11 px-6 bg-gradient-to-r from-cyan-500/80 to-indigo-500/80 hover:from-cyan-500 hover:to-indigo-500 text-white font-semibold text-sm rounded-xl border-none outline-none transition-all duration-200 shadow-lg hover:shadow-cyan-500/25 cursor-pointer hover:scale-105 active:scale-95"
          onClick={handleSearch}
        >
          Search
        </button>

        {/* Filter Dropdown */}
        <div className="relative inline-block text-left">
          <button
            onClick={dropDownMenu}
            className="flex items-center gap-2 h-11 px-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white transition-all duration-200 hover:scale-105 active:scale-95"
            title="Filter tasks"
          >
            <img
              src={filter}
              alt="Filter"
              className="w-5 h-5"
            />
            <span className="text-sm font-medium hidden sm:inline">Filter</span>
          </button>
          {isOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-gradient-to-br from-slate-900 to-slate-800 border border-white/20 rounded-xl shadow-2xl z-50 backdrop-blur-xl">
              <ul className="py-2 text-sm">
                <li className="px-4 py-2 font-semibold text-cyan-300 uppercase text-xs tracking-wider">
                  🕒 Recent Tasks
                </li>
                <li
                  onClick={() => handleFilter("first3")}
                  className="px-4 py-2 hover:bg-white/10 cursor-pointer text-white transition-colors"
                >
                  Oldest 3 Tasks
                </li>
                <li
                  onClick={() => handleFilter("last3")}
                  className="px-4 py-2 hover:bg-white/10 cursor-pointer text-white transition-colors"
                >
                  Newest 3 Tasks
                </li>
                <li
                  onClick={() => handleFilter("slice5")}
                  className="px-4 py-2 hover:bg-white/10 cursor-pointer text-white transition-colors"
                >
                  Top 5 Tasks
                </li>

                <li className="px-4 py-2 font-semibold text-cyan-300 uppercase text-xs tracking-wider mt-2">
                  🔍 Quick Filters
                </li>
                <li
                  onClick={() => handleFilter("pending")}
                  className="px-4 py-2 hover:bg-white/10 cursor-pointer text-white transition-colors"
                >
                  Pending Tasks
                </li>
                <li
                  onClick={() => handleFilter("highPriority")}
                  className="px-4 py-2 hover:bg-white/10 cursor-pointer text-white transition-colors"
                >
                  High Priority Only
                </li>
                <li
                  onClick={() => handleFilter("thisWeek")}
                  className="px-4 py-2 hover:bg-white/10 cursor-pointer text-white transition-colors"
                >
                  This Week's Tasks
                </li>
                <li
                  onClick={() => handleFilter("importantLabel")}
                  className="px-4 py-2 hover:bg-white/10 cursor-pointer text-white transition-colors"
                >
                  High Priority & In Progress Tasks
                </li>

                <li className="px-4 py-2 font-semibold text-cyan-300 uppercase text-xs tracking-wider mt-2">
                  📈 Insights & Stats
                </li>
                <li
                  onClick={() => handleFilter("groupByStatus")}
                  className="px-4 py-2 hover:bg-white/10 cursor-pointer text-white transition-colors"
                >
                  Pending Tasks by Status
                </li>
                <li
                  onClick={() => handleFilter("tasksDueToday")}
                  className="px-4 py-2 hover:bg-white/10 cursor-pointer text-white transition-colors"
                >
                  Tasks Due Today
                </li>
                <li
                  onClick={() => handleFilter("sortedGrouped")}
                  className="px-4 py-2 hover:bg-white/10 cursor-pointer text-white transition-colors"
                >
                  Completed Tasks by Status
                </li>

                <li className="px-4 py-2 font-semibold text-cyan-300 uppercase text-xs tracking-wider mt-2">
                  🧹 Clean-Up Actions
                </li>
                <li
                  onClick={() => handleFilter("deleteCompleted")}
                  className="px-4 py-2 text-red-400 hover:bg-red-500/20 cursor-pointer transition-colors"
                >
                  Delete All Completed Tasks
                </li>
                <li
                  onClick={() => handleFilter("deletePastDue")}
                  className="px-4 py-2 text-red-400 hover:bg-red-500/20 cursor-pointer transition-colors"
                >
                  Delete Overdue Tasks
                </li>

                <li className="px-4 py-2 font-semibold text-cyan-300 uppercase text-xs tracking-wider mt-2">
                  📋 Show Everything
                </li>
                <li
                  onClick={() => handleFilter("all")}
                  className="px-4 py-2 hover:bg-white/10 cursor-pointer text-white transition-colors"
                >
                  View All Tasks
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Create Task Button */}
        <button
          className="h-11 px-6 bg-gradient-to-r from-cyan-500/80 to-indigo-500/80 hover:from-cyan-500 hover:to-indigo-500 text-white font-semibold text-sm rounded-xl transition-all duration-200 shadow-lg hover:shadow-cyan-500/25 cursor-pointer hover:scale-105 active:scale-95"
          onClick={() => {
            setModalOpen(!modalOpen);
          }}
        >
          <span className="hidden sm:inline">Create Task</span>
          <span className="sm:hidden">+</span>
        </button>

        {/* Logout Button */}
        <button
          className="h-11 px-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white font-medium text-sm transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95"
          onClick={signOut}
        >
          <span className="hidden sm:inline">Logout</span>
          <span className="sm:hidden">↪</span>
        </button>
      </div>
    </div>
  );
}