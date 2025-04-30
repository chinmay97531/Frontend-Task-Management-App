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
    <div className="flex flex-col items-center justify-center bg-gradient-to-b from-[#2d3748] to-[#2d3748] w-2/5 h-full gap-5 rounded-2xl shadow-[5px_20px_50px_rgba(0,0,0,1)] m-5 p-5">
      <h1 className="text-white">Create a new board</h1>

      <input
        type="text"
        name="name"
        value={formData.name}
        onChange={handleInputChange}
        placeholder="Title"
        className="w-4/5 h-8 bg-[#e0dede] flex mx-auto my-5 p-3 border-none outline-none rounded-md"
      />

      <textarea
        name="description"
        value={formData.description}
        onChange={handleInputChange}
        rows="3"
        placeholder="Description"
        className="w-4/5 h-12 bg-[#e0dede] flex mx-auto my-5 p-3 border-none outline-none rounded-md resize-none"
      />

      <input
        type="text"
        name="label"
        value={formData.label}
        onChange={handleInputChange}
        placeholder="Label e.g., bug, urgent or feature"
        className="w-4/5 h-8 bg-[#e0dede] flex mx-auto my-5 p-3 border-none outline-none rounded-md"
      />

      <div className="flex flex-row justify-between items-center gap-10">
        <h1 className="text-white whitespace-nowrap">Due Date:</h1>
        <input
          type="date"
          name="dueDate"
          value={formData.dueDate}
          onChange={handleInputChange}
          className="w-4/5 h-8 bg-[#e0dede] flex mx-auto my-5 p-3 border-none outline-none rounded-md"
        />
      </div>

      <div className="flex flex-row justify-between items-center gap-20">
        <h1 className="text-white">Status:</h1>
        <div className="flex flex-row justify-around items-center gap-3">
          {["DO", "DOING", "DONE"].map((statusOption) => (
            <div key={statusOption}>
              <input
                type="radio"
                name="status"
                value={statusOption}
                checked={formData.status === statusOption}
                onChange={handleInputChange}
                className="mx-2"
              />
              <label className="text-white">{statusOption.toLowerCase()}</label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col w-full items-center">
        <h1 className="text-white my-2">Assign to:</h1>
        <div className="flex flex-row w-full gap-2">
          <input
            type="text"
            name="name"
            value={assignee.name}
            onChange={handleAssigneeChange}
            placeholder="Name"
            className="w-full h-8 bg-[#e0dede] p-3 border-none outline-none rounded-md"
          />
          <input
            type="text"
            name="email"
            value={assignee.email}
            onChange={handleAssigneeChange}
            placeholder="Email"
            className="w-full h-8 bg-[#e0dede] p-3 border-none outline-none rounded-md"
          />
          <button
            onClick={addAssignee}
            className="bg-[#573b8a] text-white px-4 py-2 rounded-md hover:bg-[#6d44b8]"
          >
            Assign
          </button>
        </div>
        {/* Show assigned people */}
        <div className="text-white mt-3">
          {formData.assignedTo.map((person, index) => (
            <p key={index}>
              {person.name} ({person.email})
            </p>
          ))}
        </div>
      </div>

      <button
        onClick={createBoard}
        className="w-4/5 h-10 mx-auto mt-[30px] block text-white bg-[#573b8a] font-bold text-base rounded-md border-none outline-none transition-colors duration-200 ease-in hover:bg-[#6d44b8] cursor-pointer"
      >
        Create Board
      </button>
    </div>
  );
}
