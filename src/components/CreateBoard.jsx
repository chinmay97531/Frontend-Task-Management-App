import React, { useState } from "react";
import axios from "axios";
import { BACKEND_URL } from "../config";

export function CreatingBoard({ modalOpen, setModalOpen, refreshTasks }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    label: "",
    dueDate: "",
    status: "",
    assignedTo: [],
  });

  const [assignee, setAssignee] = useState({ name: "", email: "" });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAssigneeChange = (e) => {
    const { name, value } = e.target;
    setAssignee((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addAssignee = () => {
    if (assignee.name && assignee.email) {
      setFormData((prev) => ({
        ...prev,
        assignedTo: [...prev.assignedTo, assignee],
      }));
      setAssignee({ name: "", email: "" });
    }
  };

  const createBoard = async () => {
    try {
      const token = localStorage.getItem("token");

      const payload = {
        ...formData,
      };

      const res = await axios.post(BACKEND_URL + "/CreateTask", payload, {
        headers: {
          token: token,
        },
      }
    );
      console.log(res.data);

      setModalOpen(false);
      setFormData({
        name: "",
        description: "",
        label: "",
        dueDate: "",
        status: "",
        assignedTo: [],
      });
      refreshTasks();
    } catch (error) {
      console.error("Error creating board:", error);
    }
  };

  if (!modalOpen) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center bg-gradient-to-br from-[#1a202c] via-[#2d3748] to-[#1a202c] w-full max-w-2xl mx-auto gap-6 rounded-3xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.5)] p-8 backdrop-blur-sm">
      <h1 className="text-2xl font-semibold text-white mb-2">Create a new board</h1>

      <div className="w-full space-y-5">
        <div>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Title"
            className="w-full h-12 bg-white/10 border border-white/20 text-white placeholder:text-gray-400 px-4 rounded-xl outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all"
          />
        </div>

        <div>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows="4"
            placeholder="Description"
            className="w-full min-h-[100px] bg-white/10 border border-white/20 text-white placeholder:text-gray-400 px-4 py-3 rounded-xl resize-none outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all"
          />
        </div>

        <div>
          <input
            type="text"
            name="label"
            value={formData.label}
            onChange={handleInputChange}
            placeholder="Label (e.g., bug, urgent, feature)"
            className="w-full h-12 bg-white/10 border border-white/20 text-white placeholder:text-gray-400 px-4 rounded-xl outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all"
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
          <label className="text-white font-medium text-sm sm:text-base">Due Date:</label>
          <input
            type="date"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleInputChange}
            className="w-full sm:w-auto h-12 bg-white/10 border border-white/20 text-white px-4 rounded-xl outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all [color-scheme:dark]"
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
          <label className="text-white font-medium text-sm sm:text-base">Status:</label>
          <div className="flex flex-row justify-start items-center gap-6">
            {["DO", "DOING", "DONE"].map((statusOption) => (
              <label key={statusOption} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="status"
                  value={statusOption}
                  checked={formData.status === statusOption}
                  onChange={handleInputChange}
                  className="w-4 h-4 accent-cyan-400 cursor-pointer"
                />
                <span className="text-white text-sm group-hover:text-cyan-200 transition-colors">
                  {statusOption.toLowerCase()}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex flex-col w-full gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
          <h2 className="text-white font-medium text-sm sm:text-base">Assign to:</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              name="name"
              value={assignee.name}
              onChange={handleAssigneeChange}
              placeholder="Name"
              className="flex-1 h-12 bg-white/10 border border-white/20 text-white placeholder:text-gray-400 px-4 rounded-xl outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all"
            />
            <input
              type="email"
              name="email"
              value={assignee.email}
              onChange={handleAssigneeChange}
              placeholder="Email"
              className="flex-1 h-12 bg-white/10 border border-white/20 text-white placeholder:text-gray-400 px-4 rounded-xl outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all"
            />
            <button
              onClick={addAssignee}
              className="bg-gradient-to-r from-cyan-500/80 to-indigo-500/80 hover:from-cyan-500 hover:to-indigo-500 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-lg hover:shadow-cyan-500/25 whitespace-nowrap"
            >
              Add
            </button>
          </div>
          
          {/* Show assigned people */}
          {formData.assignedTo.length > 0 && (
            <div className="mt-3 space-y-2">
              <p className="text-gray-400 text-xs mb-2">Assigned members:</p>
              <div className="flex flex-wrap gap-2">
                {formData.assignedTo.map((person, index) => (
                  <div
                    key={index}
                    className="inline-flex items-center gap-2 bg-cyan-500/20 border border-cyan-400/30 text-cyan-100 px-3 py-1.5 rounded-lg text-sm"
                  >
                    <span className="font-medium">{person.name}</span>
                    <span className="text-cyan-300/70">({person.email})</span>
                    <button
                      onClick={() => {
                        const updated = formData.assignedTo.filter((_, i) => i !== index);
                        setFormData({ ...formData, assignedTo: updated });
                      }}
                      className="ml-1 text-cyan-300 hover:text-white transition-colors"
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
          onClick={createBoard}
          className="w-full h-12 mt-4 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-white font-semibold text-base rounded-xl border-none outline-none transition-all duration-200 shadow-lg hover:shadow-cyan-500/30 cursor-pointer transform hover:scale-[1.02] active:scale-[0.98]"
        >
          Create Board
        </button>
      </div>
    </div>
  );
}
