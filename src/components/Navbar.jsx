import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import filter from "../assets/filter.svg";
import { BACKEND_URL } from "../config.js";

export function NavBar({ modalOpen, setModalOpen, setTasks, refreshTasks }) {
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

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
      setIsOpen(false);
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
    <div className="flex flex-row items-center justify-between w-full h-1/5 rounded-2xl m-2 p-2">
      <div
        onClick={() => {
          setModalOpen(() => {false});
          setIsOpen(() => {false});
          refreshTasks();
        }}
        className="text-3xl font-bold text-white m-2 p-5 pl-10 hover:cursor-pointer"
      >
        Task Management App
      </div>
      <div className="flex flex-row justify-center items-center text-nowrap gap-5 m-2 p-2 pr-20">
        <input
          ref={searchRef}
          type="text"
          name="search"
          placeholder="Search"
          className="w-65 h-10 bg-[#e0dede] flex mx-auto my-5 p-3 border-none outline-none rounded-md"
        />
        <button
          type="button"
          className="w-20 h-10 mx-auto block text-white bg-[#573b8a] font-bold text-base rounded-md border-none outline-none transition-colors duration-200 ease-in hover:bg-[#6d44b8] cursor-pointer"
          onClick={(e) => {
            e.preventDefault();
            const searchValue = searchRef.current.value.trim().toLowerCase();

            if (!searchValue) {
              console.log("Search value is empty.");
              return;
            }

            setTasks((prevTasks) =>
              prevTasks.filter((task) => {
                const title =
                  typeof task.title === "string"
                    ? task.title.toLowerCase()
                    : "";

                return title.includes(searchValue);
              })
            );
          }}
        >
          Search
        </button>
        <div className="relative inline-block text-left">
          <div className="text-md font-light text-white hover:text-purple-500 hover:cursor-pointer">
            <img
              onClick={dropDownMenu}
              src={filter}
              alt="Filter"
              className="w-6 h-6"
            />
          </div>
          {isOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg z-10">
              <ul className="py-2 text-sm text-gray-800">
                <li className="px-4 py-2 font-semibold text-gray-500">
                  🕒 Recent Tasks
                </li>
                <li
                  onClick={() => handleFilter("first3")}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  Oldest 3 Tasks
                </li>
                <li
                  onClick={() => handleFilter("last3")}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  Newest 3 Tasks
                </li>
                <li
                  onClick={() => handleFilter("slice5")}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  Top 5 Tasks
                </li>

                <li className="px-4 py-2 font-semibold text-gray-500">
                  🔍 Quick Filters
                </li>
                <li
                  onClick={() => handleFilter("pending")}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  Pending Tasks
                </li>
                <li
                  onClick={() => handleFilter("highPriority")}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  High Priority Only
                </li>
                <li
                  onClick={() => handleFilter("thisWeek")}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  This Week's Tasks
                </li>
                <li
                  onClick={() => handleFilter("importantLabel")}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  High Priority & In Progress Tasks
                </li>

                {/* Group 3: Insights & Stats */}
                <li className="px-4 py-2 font-semibold text-gray-500">
                  📈 Insights & Stats
                </li>
                <li
                  onClick={() => handleFilter("groupByStatus")}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  Pending Tasks by Status
                </li>
                <li
                  onClick={() => handleFilter("tasksDueToday")}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  Tasks Due Today
                </li>
                <li
                  onClick={() => handleFilter("sortedGrouped")}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  Completed Tasks by Status
                </li>

                <li className="px-4 py-2 font-semibold text-gray-500">
                  🧹 Clean-Up Actions
                </li>
                <li
                  onClick={() => handleFilter("deleteCompleted")}
                  className="px-4 py-2 text-red-600 hover:bg-red-100 cursor-pointer"
                >
                  Delete All Completed Tasks
                </li>
                <li
                  onClick={() => handleFilter("deletePastDue")}
                  className="px-4 py-2 text-red-600 hover:bg-red-100 cursor-pointer"
                >
                  Delete Overdue Tasks
                </li>

                <li className="px-4 py-2 font-semibold text-gray-500">
                  📋 Show Everything
                </li>
                <li
                  onClick={() => handleFilter("all")}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  View All Tasks
                </li>
              </ul>
            </div>
          )}
        </div>
        <button
          className="text-md font-light text-white hover:text-purple-500 hover:cursor-pointer"
          onClick={() => {
            setModalOpen(!modalOpen);
          }}
        >
          Create Task
        </button>
        <div
          className="text-md font-light text-white hover:text-purple-500 hover:cursor-pointer"
          onClick={signOut}
        >
          LogOut
        </div>
      </div>
    </div>
  );
}
