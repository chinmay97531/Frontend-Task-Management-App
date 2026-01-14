import React, { useEffect, useState } from "react";
import important from "../assets/important.svg";
import fillimportant from "../assets/fillimportant.svg";
import del from "../assets/delete.svg";
import remove from "../assets/removeMem.svg";
import axios from "axios";
import { BACKEND_URL } from "../config";

export function Tasks({ index, task, refreshTasks }) {
  const date = new Date(task.dueDate);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  const [imp, setImp] = useState(task.important);
  const [status, setStatus] = useState(task.status);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    setImp(task.important);
  }, [task.important]);

  useEffect(() => {
    setStatus(task.status);
  }, [task.status]);
  
  

  const toggleImportant = async () => {
    try {
      await axios.post(
        `${BACKEND_URL}/toggleImportant/${task._id}`,
        {},
        {
          headers: { token },
        }
      );
      setImp((prevImp) => !prevImp);
      refreshTasks();
    } catch (error) {
      console.error(error);
    }
  };

  const deleteTask = async () => {
    try {
      await axios.delete(`${BACKEND_URL}/deleteTask/${task._id}`, {
        headers: { token },
      });
      refreshTasks();
    } catch (error) {
      console.error(error);
    }
  };

  const removeAssignee = async (email) => {
    try {
      await axios.post(
        `${BACKEND_URL}/removeAssignee/${task._id}`,
        { email },
        {
          headers: { token },
        }
      );
      refreshTasks();
    } catch (error) {
      console.error(error);
    }
  };

  const changeStatus = async (newStatus) => {
    try {
      await axios.post(
        `${BACKEND_URL}/changeStatus/${task._id}`,
        { status: newStatus },
        {
          headers: { token },
        }
      );
      setStatus(newStatus);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div
      key={index}
      className="flex flex-col gap-4 bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.3)] p-6 hover:border-white/20 transition-all duration-300 backdrop-blur-sm"
    >
      {/* Header with Title and Actions */}
      <div className="flex flex-row items-start justify-between gap-4 pb-4 border-b border-white/10">
        <h2 className="text-xl font-bold text-white flex-1 line-clamp-2">
          {task.title}
        </h2>
        <div className="flex flex-row gap-3">
          <button
            onClick={toggleImportant}
            className="p-2 rounded-lg hover:bg-white/10 transition-all duration-200 hover:scale-110 active:scale-95"
            title={imp ? "Mark as not important" : "Mark as important"}
          >
            <img
              src={imp ? fillimportant : important}
              alt="Important"
              className="w-5 h-5"
            />
          </button>
          <button
            onClick={deleteTask}
            className="p-2 rounded-lg hover:bg-red-500/20 transition-all duration-200 hover:scale-110 active:scale-95"
            title="Delete task"
          >
            <img
              src={del}
              alt="Delete"
              className="w-5 h-5"
            />
          </button>
        </div>
      </div>

      {/* Description */}
      <div className="flex flex-col gap-2">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Description</div>
        <div className="text-white/90 text-sm leading-relaxed bg-white/5 rounded-lg p-3 border border-white/10">
          {task.description}
        </div>
      </div>

      {/* Label and Due Date Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Label</div>
          <div className="inline-flex items-center px-3 py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-400/30 text-cyan-200 text-sm font-medium w-fit">
            {task.label}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Due Date</div>
          <div className="text-white/90 text-sm font-medium bg-white/5 rounded-lg p-3 border border-white/10">
            {`${day.toString().padStart(2, "0")}-${month.toString().padStart(2, "0")}-${year.toString()}`}
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="flex flex-col gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Status</div>
        <div className="flex flex-row gap-4">
          {["DO", "DOING", "DONE"].map((s) => (
            <label
              key={s}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <input
                type="radio"
                name={`status-${task._id}`}
                value={s}
                checked={status === s}
                onChange={(e) => changeStatus(e.target.value)}
                className="w-4 h-4 accent-cyan-400 cursor-pointer"
              />
              <span className={`text-sm font-medium transition-colors ${
                status === s
                  ? "text-cyan-300"
                  : "text-slate-400 group-hover:text-slate-300"
              }`}>
                {s}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Assigned To */}
      <div className="flex flex-col gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Assigned To</div>
        <div className="flex flex-col gap-2">
          {task.assignedTo.length > 0 ? (
            task.assignedTo.map((person, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between gap-3 bg-white/5 rounded-lg p-3 border border-white/10 hover:bg-white/10 transition-colors"
              >
                <div className="flex-1">
                  <div className="text-white font-medium text-sm">{person.name}</div>
                  <div className="text-slate-400 text-xs">{person.email}</div>
                </div>
                <button
                  onClick={() => removeAssignee(person.email)}
                  className="p-1.5 rounded-lg hover:bg-red-500/20 transition-all duration-200 hover:scale-110 active:scale-95"
                  title="Remove assignee"
                >
                  <img
                    src={remove}
                    alt="Remove"
                    className="w-4 h-4"
                  />
                </button>
              </div>
            ))
          ) : (
            <div className="text-slate-500 text-sm italic py-2">No one assigned</div>
          )}
        </div>
      </div>

      {/* Add New Member */}
      <div className="flex flex-col gap-3 p-4 bg-gradient-to-br from-cyan-500/10 to-indigo-500/10 rounded-xl border border-cyan-400/20">
        <div className="text-xs font-semibold text-cyan-300 uppercase tracking-wide mb-1">
          Assign to new member
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full">
          <input
            type="text"
            placeholder="Name"
            className="flex-1 min-w-0 h-11 bg-white/10 border border-white/20 text-white placeholder:text-gray-400 px-4 rounded-lg outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all text-sm"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <input
            type="email"
            placeholder="Email"
            className="flex-1 min-w-0 h-11 bg-white/10 border border-white/20 text-white placeholder:text-gray-400 px-4 rounded-lg outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all text-sm"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
          />
          <button
            className="bg-gradient-to-r from-cyan-500/80 to-indigo-500/80 hover:from-cyan-500 hover:to-indigo-500 text-white px-4 sm:px-6 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-cyan-500/25 whitespace-nowrap h-11 hover:scale-105 active:scale-95 text-sm sm:text-base flex-shrink-0"
            onClick={async () => {
              try {
                await axios.put(
                  `${BACKEND_URL}/${task._id}/add-assignee`,
                  { name: newName, email: newEmail },
                  {
                    headers: { token },
                  }
                );
                setNewName("");
                setNewEmail("");
                refreshTasks();
              } catch (error) {
                console.error(error);
              }
            }}
          >
            Add Member
          </button>
        </div>
      </div>
    </div>
  );
}
