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
          <div className="flex justify-center items-center min-h-screen">
            <h2 className="text-white">Loading tasks...</h2>
          </div>
        );
      }
    
      if (error) {
        return (
          <div className="flex justify-center items-center min-h-screen">
            <h2 className="text-white">{error}</h2>
          </div>
        );
      }    

    return (
      <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white">
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

        <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* Header Section */}
          {tasks.length > 0 && (
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-200 to-indigo-200 bg-clip-text text-transparent">
                  Your Tasks
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'} total
                </p>
              </div>
            </div>
          )}

          {/* Tasks Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasks.length === 0 ? (
              <div className="md:col-span-2 lg:col-span-3 rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.55)] p-12 sm:p-16 animate-in fade-in duration-500">
                <div className="flex flex-col items-center text-center">
                  {/* Icon Container */}
                  <div className="mb-6 grid h-20 w-20 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400/20 via-indigo-400/20 to-purple-400/20 ring-1 ring-white/10 shadow-lg animate-pulse">
                    <svg
                      className="h-10 w-10 text-cyan-200"
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

                  {/* Title */}
                  <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-3">
                    No tasks yet
                  </h1>
                  
                  {/* Description */}
                  <p className="mt-2 max-w-md text-base text-slate-400 leading-relaxed">
                    Get started by creating your first task. Organize your work, set deadlines, and track progress all in one place.
                  </p>

                  {/* CTA Button */}
                  <button
                    onClick={() => setModalOpen(true)}
                    className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 hover:from-cyan-500/30 hover:to-indigo-500/30 px-6 py-3 text-base font-medium text-cyan-100 ring-1 ring-cyan-300/30 transition-all duration-200 hover:ring-cyan-300/50 hover:scale-105 active:scale-95 shadow-lg hover:shadow-cyan-500/20"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create your first task
                    <span className="text-cyan-200">→</span>
                  </button>
                </div>
              </div>
            ) : (
              tasks.map((task, index) => (
                <div
                  key={index}
                  className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                  style={{ animationDelay: `${index * 100}ms` }}
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