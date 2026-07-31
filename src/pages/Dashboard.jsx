import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";

import { CreatingBoard } from "../components/CreateBoard.jsx";
import { NavBar } from "../components/Navbar.jsx";
import { BACKEND_URL } from "../config.js";
import { Tasks } from "../components/Tasks.jsx";
import { getApiErrorMessage } from "../utils/apiError.js";
import { useToast } from "../components/Toast.jsx";

export function Dashboard() {
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const [modalOpen, setModalOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  const fetchTasks = useCallback(async () => {
    try {
      setError(null);
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/", { replace: true });
        return;
      }

      const response = await axios.post(
        BACKEND_URL + "/GetTask",
        {},
        {
          headers: {
            token: token,
          },
        }
      );

      setTasks(response.data.tasks || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem("token");
        toast.error("Session expired. Please sign in again.");
        navigate("/", { replace: true });
        return;
      }
      setError(getApiErrorMessage(err, "Could not load your tasks."));
      setLoading(false);
    }
  }, [navigate, toast]);

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      localStorage.setItem("token", token);
      toast.success("Signed in with Google.");
      navigate("/home", { replace: true });
    }
    setAuthReady(true);
  }, [searchParams, navigate, toast]);

  useEffect(() => {
    if (!authReady) return;
    if (searchParams.get("token")) return;
    setLoading(true);
    fetchTasks();
  }, [authReady, searchParams, fetchTasks]);

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
        <div className="rounded-2xl border border-rose-400/30 bg-rose-50/15 px-6 py-5 text-rose-100 shadow-sm max-w-md text-center">
          <h2 className="font-semibold">{error}</h2>
          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              onClick={() => {
                setLoading(true);
                fetchTasks();
              }}
              className="text-sm font-medium rounded-lg bg-teal-500/90 hover:bg-teal-400 px-4 py-2 text-white transition-colors"
            >
              Try again
            </button>
            <button
              onClick={() => {
                localStorage.removeItem("token");
                navigate("/", { replace: true });
              }}
              className="text-sm font-medium text-stone-400 hover:text-stone-200 underline underline-offset-2"
            >
              Back to login
            </button>
          </div>
        </div>
      </div>
    );
  }

  const doneCount = tasks.filter((t) => t.status === "DONE").length;
  const doingCount = tasks.filter((t) => t.status === "DOING").length;

  return (
    <div className="min-h-screen flex flex-col items-center tf-app-bg text-stone-50 font-sans">
      <NavBar
        modalOpen={modalOpen}
        setModalOpen={setModalOpen}
        setTasks={setTasks}
        refreshTasks={fetchTasks}
        filterOpen={filterOpen}
        setFilterOpen={setFilterOpen}
      />
      <CreatingBoard
        modalOpen={modalOpen}
        setModalOpen={setModalOpen}
        refreshTasks={fetchTasks}
      />

      <div className="relative w-full flex-1">
        {filterOpen && (
          <button
            type="button"
            aria-label="Close filter"
            onClick={() => setFilterOpen(false)}
            className="absolute inset-0 z-30 bg-[#0b1220]/40 backdrop-blur-md tf-animate-fade-in"
          />
        )}

      <div className="relative z-0 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {tasks.length > 0 && (
          <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 tf-animate-fade-up">
            <div>
              <h2 className="font-display text-3xl font-semibold tracking-tight bg-gradient-to-r from-teal-300 via-teal-400 to-coral-400 bg-clip-text text-transparent">
                Your Tasks
              </h2>
              <p className="mt-1 text-sm text-stone-500">
                {tasks.length} total · {doingCount} in progress · {doneCount}{" "}
                done
              </p>
            </div>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="tf-btn-primary h-11 px-5 rounded-xl text-sm font-semibold self-start sm:self-auto"
            >
              + New task
            </button>
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
                  Your board is ready
                </h1>

                <p className="mt-2 max-w-md text-base text-stone-500 leading-relaxed">
                  Create a task, assign someone, set a due date, and move it from
                  To Do → Doing → Done. TaskFlow keeps the work clear and moving.
                </p>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-lg text-left">
                  {[
                    "Write a clear title & label",
                    "Assign an owner",
                    "Track status as you go",
                  ].map((tip) => (
                    <div
                      key={tip}
                      className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-xs text-stone-300"
                    >
                      {tip}
                    </div>
                  ))}
                </div>

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
                style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
              >
                <Tasks index={index} task={task} refreshTasks={fetchTasks} />
              </div>
            ))
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
