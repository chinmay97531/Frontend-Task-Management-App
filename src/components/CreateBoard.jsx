import React, { useEffect, useState } from "react";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { useToast } from "./Toast";
import { getApiErrorMessage } from "../utils/apiError";

const emptyForm = {
  name: "",
  description: "",
  label: "",
  dueDate: "",
  status: "DO",
  assignedTo: [],
};

export function CreatingBoard({ modalOpen, setModalOpen, refreshTasks }) {
  const toast = useToast();
  const [formData, setFormData] = useState(emptyForm);
  const [assignee, setAssignee] = useState({ name: "", email: "" });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    if (!modalOpen) return undefined;
    const onKeyDown = (e) => {
      if (e.key === "Escape" && !submitting) setModalOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [modalOpen, submitting, setModalOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFormError(null);
  };

  const handleAssigneeChange = (e) => {
    const { name, value } = e.target;
    setAssignee((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addAssignee = () => {
    const name = assignee.name.trim();
    const email = assignee.email.trim();

    if (!name || !email) {
      toast.error("Enter both name and email for the assignee.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Enter a valid assignee email.");
      return;
    }
    if (formData.assignedTo.some((person) => person.email === email)) {
      toast.info("That person is already assigned.");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      assignedTo: [...prev.assignedTo, { name, email }],
    }));
    setAssignee({ name: "", email: "" });
  };

  const validateForm = () => {
    if (!formData.name.trim()) return "Title is required.";
    if (!formData.description.trim()) return "Description is required.";
    if (!formData.label.trim()) return "Label is required.";
    if (!formData.dueDate) return "Due date is required.";
    if (!formData.status) return "Pick a status.";
    if (formData.assignedTo.length === 0) {
      return "Add at least one assignee.";
    }
    return null;
  };

  const createBoard = async () => {
    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      toast.error(validationError);
      return;
    }

    try {
      setSubmitting(true);
      setFormError(null);
      const token = localStorage.getItem("token");

      await axios.post(
        BACKEND_URL + "/CreateTask",
        {
          ...formData,
          name: formData.name.trim(),
          description: formData.description.trim(),
          label: formData.label.trim(),
        },
        {
          headers: {
            token: token,
          },
        }
      );

      setModalOpen(false);
      setFormData(emptyForm);
      setAssignee({ name: "", email: "" });
      toast.success("Task created.");
      refreshTasks();
    } catch (error) {
      const message = getApiErrorMessage(error, "Could not create task.");
      setFormError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!modalOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0b1220]/70 backdrop-blur-sm tf-animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget && !submitting) setModalOpen(false);
      }}
    >
      <div className="flex flex-col w-full max-w-2xl max-h-[90vh] overflow-y-auto gap-5 rounded-3xl tf-glass shadow-[0_24px_60px_rgba(0,0,0,0.45)] p-6 sm:p-8 tf-animate-fade-up">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-semibold text-stone-50">
              Create a new task
            </h1>
            <p className="mt-1 text-sm text-stone-500">
              Add details, set a status, and invite assignees.
            </p>
          </div>
          <button
            type="button"
            onClick={() => !submitting && setModalOpen(false)}
            className="h-9 w-9 rounded-xl border border-white/15 text-stone-500 hover:bg-white/10 hover:text-stone-50 transition-colors"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {formError && (
          <div className="rounded-xl border border-rose-400/30 bg-rose-50/20 px-4 py-3 text-sm text-rose-100">
            {formError}
          </div>
        )}

        <div className="w-full space-y-5">
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1.5">
              Title
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="What needs to get done?"
              className="tf-input w-full h-12 px-4 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1.5">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="4"
              placeholder="Add context or acceptance criteria"
              className="tf-input w-full min-h-[100px] px-4 py-3 rounded-xl resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1.5">
              Label
            </label>
            <input
              type="text"
              name="label"
              value={formData.label}
              onChange={handleInputChange}
              placeholder="e.g., bug, urgent, feature"
              className="tf-input w-full h-12 px-4 rounded-xl"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
            <label className="text-stone-100 font-medium text-sm sm:text-base">
              Due Date
            </label>
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleInputChange}
              className="tf-input w-full sm:w-auto h-12 px-4 rounded-xl [color-scheme:dark]"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
            <label className="text-stone-100 font-medium text-sm sm:text-base">
              Status
            </label>
            <div className="flex flex-row justify-start items-center gap-4 flex-wrap">
              {["DO", "DOING", "DONE"].map((statusOption) => (
                <label
                  key={statusOption}
                  className={`flex items-center gap-2 cursor-pointer rounded-lg px-3 py-2 border transition-all ${
                    formData.status === statusOption
                      ? "border-teal-400/40 bg-white/10 shadow-sm"
                      : "border-transparent hover:bg-white/5"
                  }`}
                >
                  <input
                    type="radio"
                    name="status"
                    value={statusOption}
                    checked={formData.status === statusOption}
                    onChange={handleInputChange}
                    className="w-4 h-4 accent-teal-400 cursor-pointer"
                  />
                  <span className="text-stone-100 text-sm font-medium">
                    {statusOption}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-col w-full gap-4 p-4 bg-gradient-to-br from-teal-400/10 to-coral-500/10 rounded-xl border border-teal-400/20">
            <h2 className="text-teal-300 font-medium text-sm sm:text-base">
              Assign to
            </h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                name="name"
                value={assignee.name}
                onChange={handleAssigneeChange}
                placeholder="Name"
                className="tf-input flex-1 h-12 px-4 rounded-xl"
              />
              <input
                type="email"
                name="email"
                value={assignee.email}
                onChange={handleAssigneeChange}
                placeholder="Email"
                className="tf-input flex-1 h-12 px-4 rounded-xl"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addAssignee();
                  }
                }}
              />
              <button
                type="button"
                onClick={addAssignee}
                className="bg-teal-500 hover:bg-teal-400 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-sm whitespace-nowrap hover:scale-105 active:scale-95"
              >
                Add
              </button>
            </div>

            {formData.assignedTo.length > 0 && (
              <div className="mt-1 space-y-2">
                <p className="text-stone-500 text-xs mb-2">Assigned members</p>
                <div className="flex flex-wrap gap-2">
                  {formData.assignedTo.map((person, index) => (
                    <div
                      key={index}
                      className="inline-flex items-center gap-2 bg-white/10 border border-teal-400/30 text-teal-100 px-3 py-1.5 rounded-lg text-sm"
                    >
                      <span className="font-medium">{person.name}</span>
                      <span className="text-teal-300/70">({person.email})</span>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = formData.assignedTo.filter(
                            (_, i) => i !== index
                          );
                          setFormData({ ...formData, assignedTo: updated });
                        }}
                        className="ml-1 text-stone-500 hover:text-rose-700 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={createBoard}
            disabled={submitting}
            className="tf-btn-primary w-full h-12 mt-2 rounded-xl font-semibold text-base hover:scale-[1.015]"
          >
            {submitting ? "Creating..." : "Create Task"}
          </button>
        </div>
      </div>
    </div>
  );
}
