import React, { useState, useEffect } from "react";
import axios from "axios";

import { CreatingBoard } from "../components/CreateBoard.jsx";
import { NavBar } from "../components/Navbar.jsx";
import { BACKEND_URL } from "../config.js";
import { Tasks } from "../components/Tasks.jsx";

export function Dashboard() {
  const [modalOpen, setModalOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTasks = async () => {
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

      setTasks(response.data.tasks);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Error fetching tasks.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen tf-app-bg font-sans">
        <div className="h-10 w-10 rounded-full border-2 border-teal-400/30 border-t-teal-400 animate-spin mb-4" />
        <h2 className="text-stone-600 font-medium">Loading your tasks...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen tf-app-bg font-sans px-4">
        <div className="rounded-2xl border border-rose-100/40 bg-rose-50/80 px-6 py-5 text-rose-700 shadow-sm">
          <h2 className="font-semibold">{error}</h2>
          <button
            onClick={() => {
              setError(null);
              setLoading(true);
              fetchTasks();
            }}
            className="mt-3 text-sm font-medium text-teal-400 underline underline-offset-2 hover:text-teal-300"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center tf-app-bg text-stone-50 font-sans">
      <NavBar
        modalOpen={modalOpen}
        setModalOpen={setModalOpen}
        setTasks={setTasks}
        refreshTasks={fetchTasks}
      />
      <CreatingBoard
        modalOpen={modalOpen}
        setModalOpen={setModalOpen}
        refreshTasks={fetchTasks}
      />

      <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {tasks.length > 0 && (
          <div className="mb-8 flex items-end justify-between gap-4 tf-animate-fade-up">
            <div>
              <h2 className="font-display text-3xl font-semibold tracking-tight bg-gradient-to-r from-teal-300 via-teal-400 to-coral-400 bg-clip-text text-transparent">
                Your Tasks
              </h2>
              <p className="mt-1 text-sm text-stone-500">
                {tasks.length} {tasks.length === 1 ? "task" : "tasks"} total
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.length === 0 ? (
            <div className="md:col-span-2 lg:col-span-3 rounded-3xl tf-glass shadow-[0_16px_40px_rgba(0,0,0,0.25)] p-12 sm:p-16 tf-animate-fade-up">
              <div className="flex flex-col items-center text-center">
                <div className="mb-6 grid h-20 w-20 place-items-center rounded-2xl bg-gradient-to-br from-teal-400/20 to-coral-500/20 ring-1 ring-white/15 shadow-sm">
                  <svg
                    className="h-10 w-10 text-teal-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                    />
                  </svg>
                </div>

                <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-stone-50 mb-3">
                  No tasks yet
                </h1>

                <p className="mt-2 max-w-md text-base text-stone-500 leading-relaxed">
                  Get started by creating your first task. Organize your work,
                  set deadlines, and track progress all in one place.
                </p>

                <button
                  onClick={() => setModalOpen(true)}
                  className="tf-btn-primary mt-8 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-base font-semibold hover:scale-105 active:scale-95"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Create your first task
                </button>
              </div>
            </div>
          ) : (
            tasks.map((task, index) => (
              <div
                key={task._id || index}
                className="tf-animate-fade-up"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <Tasks index={index} task={task} refreshTasks={fetchTasks} />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
