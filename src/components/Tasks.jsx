import React, { useEffect, useState } from "react";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { useToast } from "./Toast";
import { getApiErrorMessage } from "../utils/apiError";
import { UserAvatar } from "./UserAvatar";

const STATUS_META = {
  DO: {
    label: "To Do",
    accent: "from-teal-300/50 to-teal-500/25",
    chip: "bg-teal-400/10 text-teal-200 ring-teal-400/20",
    bar: "bg-teal-400/70",
  },
  DOING: {
    label: "Doing",
    accent: "from-amber-400/80 to-amber-500/40",
    chip: "bg-amber-400/15 text-amber-100 ring-amber-400/25",
    bar: "bg-amber-400",
  },
  DONE: {
    label: "Done",
    accent: "from-teal-400/80 to-coral-500/40",
    chip: "bg-teal-400/15 text-teal-200 ring-teal-400/30",
    bar: "bg-teal-400",
  },
};

function formatDueDate(date) {
  if (Number.isNaN(date.getTime())) return "No due date";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function toDateInputValue(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function draftFromTask(task) {
  return {
    name: task.title || "",
    description: task.description || "",
    label: task.label || "",
    dueDate: toDateInputValue(task.dueDate),
    status: task.status || "DO",
    important: Boolean(task.important),
  };
}

export function Tasks({ index, task, refreshTasks }) {
  const toast = useToast();
  const date = new Date(task.dueDate);
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
  const [addingMember, setAddingMember] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState(() => draftFromTask(task));

  const token = localStorage.getItem("token");
  const meta = STATUS_META[status] || STATUS_META.DO;

  useEffect(() => {
    setImp(task.important);
  }, [task.important]);

  useEffect(() => {
    setStatus(task.status);
  }, [task.status]);

  useEffect(() => {
    if (!editing) {
      setDraft(draftFromTask(task));
    }
  }, [task, editing]);

  const startEdit = () => {
    setDraft(draftFromTask(task));
    setAddingMember(false);
    setEditing(true);
  };

  const cancelEdit = () => {
    setDraft(draftFromTask(task));
    setEditing(false);
  };

  const updateDraft = (field, value) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  };

  const saveEdit = async () => {
    const name = draft.name.trim();
    const description = draft.description.trim();
    const label = draft.label.trim();

    if (!name || !description || !label || !draft.dueDate || !draft.status) {
      toast.error("Please fill title, description, label, due date, and status.");
      return;
    }

    try {
      setSaving(true);
      await axios.put(
        `${BACKEND_URL}/updateTask/${task._id}`,
        {
          name,
          description,
          label,
          dueDate: draft.dueDate,
          status: draft.status,
          important: Boolean(draft.important),
        },
        { headers: { token } }
      );
      setStatus(draft.status);
      setImp(Boolean(draft.important));
      setEditing(false);
      toast.success("Task updated.");
      refreshTasks();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not update task."));
    } finally {
      setSaving(false);
    }
  };

  const toggleImportant = async () => {
    if (editing) {
      updateDraft("important", !draft.important);
      return;
    }
    try {
      await axios.post(
        `${BACKEND_URL}/toggleImportant/${task._id}`,
        {},
        { headers: { token } }
      );
      setImp((prevImp) => !prevImp);
      toast.success(imp ? "Removed from important." : "Marked important.");
      refreshTasks();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not update importance."));
    }
  };

  const deleteTask = async () => {
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
        { headers: { token } }
      );
      toast.success("Assignee removed.");
      refreshTasks();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not remove assignee."));
    }
  };

  const changeStatus = async (newStatus) => {
    if (editing) {
      updateDraft("status", newStatus);
      return;
    }
    const previous = status;
    setStatus(newStatus);
    try {
      await axios.post(
        `${BACKEND_URL}/changeStatus/${task._id}`,
        { status: newStatus },
        { headers: { token } }
      );
      toast.success(`Status set to ${STATUS_META[newStatus]?.label || newStatus}.`);
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
        { headers: { token } }
      );
      setNewName("");
      setNewEmail("");
      setAddingMember(false);
      toast.success("Member added.");
      refreshTasks();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not add member."));
    } finally {
      setBusy(false);
    }
  };

  const displayStatus = editing ? draft.status : status;
  const displayImportant = editing ? draft.important : imp;
  const displayMeta = STATUS_META[displayStatus] || STATUS_META.DO;

  return (
    <article
      key={index}
      className={`group relative flex h-full flex-col overflow-hidden rounded-3xl bg-[rgba(255,255,255,0.045)] shadow-[0_18px_40px_rgba(0,0,0,0.28)] backdrop-blur-xl transition-all duration-300 ${
        editing
          ? "shadow-[0_24px_50px_rgba(62,130,247,0.2)] ring-1 ring-teal-400/30"
          : "hover:-translate-y-1 hover:shadow-[0_24px_50px_rgba(0,0,0,0.38)]"
      }`}
    >
      <div className="flex flex-1 flex-col gap-5 p-5 sm:p-6">
        <header className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            {!editing && (
              <div className="mb-2.5 flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide ring-1 ${displayMeta.chip}`}
                >
                  {displayMeta.label}
                </span>
                {task.label && (
                  <span className="inline-flex items-center rounded-full bg-white/5 px-2.5 py-1 text-[11px] font-medium text-stone-300 ring-1 ring-white/10">
                    {task.label}
                  </span>
                )}
                {displayImportant && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/15 px-2.5 py-1 text-[11px] font-semibold text-amber-200 ring-1 ring-amber-400/25">
                    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2l2.4 7.2H22l-6 4.4 2.3 7.2L12 16.8 5.7 20.8 8 13.6 2 9.2h7.6L12 2z" />
                    </svg>
                    Priority
                  </span>
                )}
                {isOverdue && (
                  <span className="inline-flex items-center rounded-full bg-amber-400/15 px-2.5 py-1 text-[11px] font-semibold text-amber-100 ring-1 ring-amber-400/25">
                    Overdue
                  </span>
                )}
              </div>
            )}

            {editing ? (
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                    Title
                  </label>
                  <input
                    type="text"
                    value={draft.name}
                    onChange={(e) => updateDraft("name", e.target.value)}
                    className="tf-input h-11 w-full rounded-xl px-3 text-sm font-medium"
                    placeholder="Task title"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                    Label
                  </label>
                  <input
                    type="text"
                    value={draft.label}
                    onChange={(e) => updateDraft("label", e.target.value)}
                    className="tf-input h-10 w-full rounded-xl px-3 text-sm"
                    placeholder="e.g. Frontend"
                  />
                </div>
              </div>
            ) : (
              <h2 className="font-display text-xl font-semibold leading-snug tracking-tight text-stone-50 line-clamp-2">
                {task.title}
              </h2>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-1">
            {!editing && (
              <button
                type="button"
                onClick={startEdit}
                className="grid h-9 w-9 place-items-center rounded-xl text-stone-400 transition-all duration-200 hover:bg-teal-400/10 hover:text-teal-300"
                title="Edit task"
                aria-label="Edit task"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4 12.5-12.5z"
                  />
                </svg>
              </button>
            )}
            <button
              type="button"
              onClick={toggleImportant}
              className={`grid h-9 w-9 place-items-center rounded-xl transition-all duration-200 ${
                displayImportant
                  ? "bg-amber-400/15 text-amber-300 ring-1 ring-amber-400/30"
                  : "text-stone-400 hover:bg-white/8 hover:text-amber-200"
              }`}
              title={displayImportant ? "Mark as not important" : "Mark as important"}
              aria-label={displayImportant ? "Unmark important" : "Mark important"}
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill={displayImportant ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 3.2l2.1 6.4h6.7l-5.4 3.9 2.1 6.4L12 16.8 6.5 19.9l2.1-6.4-5.4-3.9h6.7L12 3.2z"
                />
              </svg>
            </button>
            {!editing && (
              <button
                type="button"
                onClick={deleteTask}
                className="grid h-9 w-9 place-items-center rounded-xl text-stone-400 transition-all duration-200 hover:bg-rose-400/10 hover:text-rose-300"
                title="Delete task"
                aria-label="Delete task"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 002 2h6a2 2 0 002-2l1-12M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2"
                  />
                </svg>
              </button>
            )}
          </div>
        </header>

        {editing ? (
          <div>
            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-stone-500">
              Description
            </label>
            <textarea
              value={draft.description}
              onChange={(e) => updateDraft("description", e.target.value)}
              rows={4}
              className="tf-input w-full rounded-xl px-3 py-2.5 text-sm leading-relaxed resize-y min-h-[96px]"
              placeholder="What needs to be done?"
            />
          </div>
        ) : (
          <p className="text-sm leading-relaxed text-stone-300/95 line-clamp-3">
            {task.description}
          </p>
        )}

        {editing ? (
          <div>
            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-stone-500">
              Due date
            </label>
            <input
              type="date"
              value={draft.dueDate}
              onChange={(e) => updateDraft("dueDate", e.target.value)}
              className="tf-input h-11 w-full rounded-xl px-3 text-sm"
            />
          </div>
        ) : (
          <div
            className={`flex items-center gap-2.5 rounded-2xl px-3.5 py-3 text-sm ${
              isOverdue
                ? "bg-amber-400/10 ring-1 ring-amber-400/20 text-amber-50"
                : "bg-white/[0.04] ring-1 ring-white/10 text-stone-200"
            }`}
          >
            <span
              className={`grid h-8 w-8 place-items-center rounded-xl ${
                isOverdue ? "bg-amber-400/15 text-amber-200" : "bg-teal-400/10 text-teal-300"
              }`}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 3v2M16 3v2M4.5 9h15M6 5h12a2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2z"
                />
              </svg>
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                Due date
              </p>
              <p className="font-medium truncate">
                {formatDueDate(date)}
                {isOverdue ? " · overdue" : ""}
              </p>
            </div>
          </div>
        )}

        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-stone-500">
            Status
          </p>
          <div className="grid grid-cols-3 gap-1.5 rounded-2xl bg-black/20 p-1 ring-1 ring-white/8">
            {["DO", "DOING", "DONE"].map((s) => {
              const active = displayStatus === s;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => changeStatus(s)}
                  className={`rounded-xl px-2 py-2 text-xs font-semibold transition-all duration-200 ${
                    active
                      ? `${STATUS_META[s].chip} shadow-sm`
                      : "text-stone-400 hover:bg-white/5 hover:text-stone-200"
                  }`}
                >
                  {STATUS_META[s].label}
                </button>
              );
            })}
          </div>
        </div>

        {editing && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={saveEdit}
              disabled={saving}
              className="tf-btn-primary h-10 flex-1 rounded-xl text-sm font-semibold disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
            <button
              type="button"
              onClick={cancelEdit}
              disabled={saving}
              className="h-10 flex-1 rounded-xl text-sm font-semibold text-stone-300 ring-1 ring-white/15 transition-colors hover:bg-white/5 disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        )}

        <div className="mt-auto flex flex-col gap-3 border-t border-white/8 pt-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">
              Assignees
            </p>
            {!editing && (
              <button
                type="button"
                onClick={() => setAddingMember((v) => !v)}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-teal-300 transition-colors hover:bg-teal-400/10"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" d="M12 5v14M5 12h14" />
                </svg>
                {addingMember ? "Cancel" : "Add"}
              </button>
            )}
          </div>

          {task.assignedTo?.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {task.assignedTo.map((person, idx) => (
                <li
                  key={`${person.email}-${idx}`}
                  className="flex items-center gap-3 rounded-2xl bg-white/[0.03] px-2.5 py-2 ring-1 ring-white/8 transition-colors hover:bg-white/[0.06]"
                >
                  <UserAvatar
                    src={person.avatar}
                    name={person.name}
                    size="md"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-stone-50">
                      {person.name}
                    </p>
                    <p className="truncate text-xs text-stone-500">{person.email}</p>
                  </div>
                  {!editing && (
                    <button
                      type="button"
                      onClick={() => removeAssignee(person.email)}
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-stone-500 transition-colors hover:bg-rose-400/10 hover:text-rose-300"
                      title="Remove assignee"
                      aria-label={`Remove ${person.name}`}
                    >
                      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
                      </svg>
                    </button>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-2xl border border-dashed border-white/10 px-3 py-3 text-center text-xs text-stone-500">
              No one assigned yet
            </p>
          )}

          {!editing && addingMember && (
            <div className="flex flex-col gap-2 rounded-2xl bg-gradient-to-br from-teal-400/10 to-violet-500/10 p-3 ring-1 ring-teal-400/20">
              <input
                type="text"
                placeholder="Name"
                className="tf-input h-10 w-full rounded-xl px-3 text-sm"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
              <input
                type="email"
                placeholder="Email"
                className="tf-input h-10 w-full rounded-xl px-3 text-sm"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
              <button
                type="button"
                disabled={busy}
                className="tf-btn-primary h-10 rounded-xl text-sm font-semibold disabled:opacity-60"
                onClick={addMember}
              >
                {busy ? "Adding…" : "Add member"}
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
