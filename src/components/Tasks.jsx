import React, { useEffect, useState } from "react";
import important from "../assets/important.svg";
import fillimportant from "../assets/fillimportant.svg";
import del from "../assets/delete.svg";
import remove from "../assets/removeMem.svg";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { useToast } from "./Toast";
import { getApiErrorMessage } from "../utils/apiError";

const statusStyles = {
  DO: "bg-rose-50/80 text-rose-700 ring-rose-100/50",
  DOING: "bg-amber-100/20 text-amber-100 ring-amber-500/30",
  DONE: "bg-teal-400/15 text-teal-300 ring-teal-400/30",
};

export function Tasks({ index, task, refreshTasks }) {
  const toast = useToast();
  const date = new Date(task.dueDate);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const dueEnd = new Date(task.dueDate);
  if (!Number.isNaN(dueEnd.getTime())) {
    dueEnd.setHours(23, 59, 59, 999);
  }
  const isOverdue =
    !Number.isNaN(dueEnd.getTime()) &&
    task.status !== "DONE" &&
    dueEnd.getTime() < Date.now();

  const [imp, setImp] = useState(task.important);
  const [status, setStatus] = useState(task.status);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [busy, setBusy] = useState(false);

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
      toast.success(imp ? "Removed from important." : "Marked important.");
      refreshTasks();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not update importance."));
    }
  };

  const deleteTask = async () => {
    if (!window.confirm(`Delete “${task.title}”? This cannot be undone.`)) {
      return;
    }
    try {
      await axios.delete(`${BACKEND_URL}/deleteTask/${task._id}`, {
        headers: { token },
      });
      toast.success("Task deleted.");
      refreshTasks();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not delete task."));
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
      toast.success("Assignee removed.");
      refreshTasks();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not remove assignee."));
    }
  };

  const changeStatus = async (newStatus) => {
    const previous = status;
    setStatus(newStatus);
    try {
      await axios.post(
        `${BACKEND_URL}/changeStatus/${task._id}`,
        { status: newStatus },
        {
          headers: { token },
        }
      );
      toast.success(`Status set to ${newStatus}.`);
    } catch (error) {
      setStatus(previous);
      toast.error(getApiErrorMessage(error, "Could not update status."));
    }
  };

  const addMember = async () => {
    const name = newName.trim();
    const email = newEmail.trim();
    if (!name || !email) {
      toast.error("Enter name and email.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Enter a valid email.");
      return;
    }

    try {
      setBusy(true);
      await axios.put(
        `${BACKEND_URL}/${task._id}/add-assignee`,
        { name, email },
        {
          headers: { token },
        }
      );
      setNewName("");
      setNewEmail("");
      toast.success("Member added.");
      refreshTasks();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not add member."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      key={index}
      className="flex flex-col gap-4 tf-glass rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.2)] p-6 tf-card-lift"
    >
      <div className="flex flex-row items-start justify-between gap-4 pb-4 border-b border-white/10">
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-semibold text-stone-50 line-clamp-2">
            {task.title}
          </h2>
          <span
            className={`mt-2 inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ring-1 ${
              statusStyles[status] || statusStyles.DO
            }`}
          >
            {status}
          </span>
        </div>
        <div className="flex flex-row gap-2">
          <button
            onClick={toggleImportant}
            className="p-2 rounded-lg hover:bg-amber-100/10 transition-all duration-200 hover:scale-110 active:scale-95"
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
            className="p-2 rounded-lg hover:bg-rose-50/40 transition-all duration-200 hover:scale-110 active:scale-95"
            title="Delete task"
          >
            <img src={del} alt="Delete" className="w-5 h-5 brightness-0 invert opacity-80" />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="text-xs font-semibold text-stone-500 uppercase tracking-wide">
          Description
        </div>
        <div className="text-stone-100/90 text-sm leading-relaxed bg-white/5 rounded-lg p-3 border border-white/10">
          {task.description}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <div className="text-xs font-semibold text-stone-500 uppercase tracking-wide">
            Label
          </div>
          <div className="inline-flex items-center px-3 py-1.5 rounded-lg bg-teal-400/15 border border-teal-400/30 text-teal-300 text-sm font-medium w-fit">
            {task.label}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="text-xs font-semibold text-stone-500 uppercase tracking-wide">
            Due Date
          </div>
          <div
            className={`text-sm font-medium rounded-lg p-3 border ${
              isOverdue
                ? "bg-rose-50/15 border-rose-400/30 text-rose-100"
                : "bg-white/5 border-white/10 text-stone-100"
            }`}
          >
            {Number.isNaN(date.getTime())
              ? "No due date"
              : `${day.toString().padStart(2, "0")}-${month
                  .toString()
                  .padStart(2, "0")}-${year.toString()}`}
            {isOverdue ? " · Overdue" : ""}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
        <div className="text-xs font-semibold text-stone-500 uppercase tracking-wide">
          Status
        </div>
        <div className="flex flex-row flex-wrap gap-3">
          {["DO", "DOING", "DONE"].map((s) => (
            <label
              key={s}
              className={`flex items-center gap-2 cursor-pointer rounded-lg px-3 py-2 border transition-all ${
                status === s
                  ? "border-teal-400/40 bg-white/10 shadow-sm"
                  : "border-transparent hover:bg-white/5"
              }`}
            >
              <input
                type="radio"
                name={`status-${task._id}`}
                value={s}
                checked={status === s}
                onChange={(e) => changeStatus(e.target.value)}
                className="w-4 h-4 accent-teal-400 cursor-pointer"
              />
              <span
                className={`text-sm font-medium transition-colors ${
                  status === s ? "text-teal-300" : "text-stone-500"
                }`}
              >
                {s}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
        <div className="text-xs font-semibold text-stone-500 uppercase tracking-wide">
          Assigned To
        </div>
        <div className="flex flex-col gap-2">
          {task.assignedTo.length > 0 ? (
            task.assignedTo.map((person, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between gap-3 bg-white/5 rounded-lg p-3 border border-white/10 hover:border-teal-400/30 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-stone-50 font-medium text-sm truncate">
                    {person.name}
                  </div>
                  <div className="text-stone-500 text-xs truncate">
                    {person.email}
                  </div>
                </div>
                <button
                  onClick={() => removeAssignee(person.email)}
                  className="p-1.5 rounded-lg hover:bg-rose-50/40 transition-all duration-200 hover:scale-110 active:scale-95"
                  title="Remove assignee"
                >
                  <img
                    src={remove}
                    alt="Remove"
                    className="w-4 h-4 brightness-0 invert opacity-80"
                  />
                </button>
              </div>
            ))
          ) : (
            <div className="text-stone-500 text-sm italic py-2">
              No one assigned
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3 p-4 bg-gradient-to-br from-teal-400/10 to-coral-500/10 rounded-xl border border-teal-400/20">
        <div className="text-xs font-semibold text-teal-300 uppercase tracking-wide mb-1">
          Assign to new member
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full">
          <input
            type="text"
            placeholder="Name"
            className="tf-input flex-1 min-w-0 h-11 px-4 rounded-lg text-sm"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <input
            type="email"
            placeholder="Email"
            className="tf-input flex-1 min-w-0 h-11 px-4 rounded-lg text-sm"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
          />
          <button
            type="button"
            disabled={busy}
            className="bg-teal-500 hover:bg-teal-400 disabled:opacity-60 text-white px-4 sm:px-6 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-sm whitespace-nowrap h-11 hover:scale-105 active:scale-95 text-sm sm:text-base flex-shrink-0"
            onClick={addMember}
          >
            {busy ? "Adding..." : "Add Member"}
          </button>
        </div>
      </div>
    </div>
  );
}
