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
      className="flex flex-col gap-2 items-center justify-center bg-gradient-to-b from-[#2d3748] to-[#2d3748] w-4/5 h-full rounded-2xl shadow-[5px_10px_50px_rgba(0,0,0,1)] m-5 ml-15 p-5"
    >
      <div className="text-white flex flex-row gap-50 justify-between">
        <div className="text-white font-bold">{task.title}</div>
        <div className="flex flex-row gap-2">
          <div className="cursor-pointer hover:scale-110 transition-transform duration-200">
            <img
              src={imp ? fillimportant : important}
              alt="Important"
              className="w-6 h-6 hover:cursor-pointer"
              onClick={toggleImportant}
            />
          </div>
          <div className="cursor-pointer hover:scale-110 transition-transform duration-200">
            <img
              src={del}
              alt="Delete"
              className="w-6 h-6"
              onClick={deleteTask}
            />
          </div>
        </div>
      </div>
      <div className="text-white flex flex-row gap-2 justify-between">
        <div>Description:</div>
        <div>{task.description}</div>
      </div>
      <div className="text-white flex flex-row gap-2 justify-between">
        <div>Label: </div>
        <div>{task.label}</div>
      </div>
      <div className="text-white flex flex-row gap-2 justify-between">
        <div>Due Date: </div>
        <div>{`${day.toString().padStart(2, "0")}-${month
          .toString()
          .padStart(2, "0")}-${year.toString()}`}</div>
      </div>

      <div className="text-white flex flex-row gap-10">
        <div>Status:</div>
        <div className="flex flex-row gap-4">
          {["DO", "DOING", "DONE"].map((s) => (
            <label key={s} className="flex gap-1 items-center">
              <input
                type="radio"
                name={`status-${task._id}`}
                value={s}
                checked={status === s}
                onChange={(e) => changeStatus(e.target.value)}
              />
              {s}
            </label>
          ))}
        </div>
      </div>

      <div className="text-white flex flex-row gap-10">
        <div>Assigned to:</div>
        <div className="flex flex-col gap-2">
          {task.assignedTo.length > 0 ? (
            task.assignedTo.map((person, idx) => (
              <div key={idx} className="flex gap-3 items-center">
                <div>
                  {person.name} ({person.email})
                </div>
                <button
                  className="text-red-400 underline"
                  onClick={() => removeAssignee(person.email)}
                >
                  <img
                    src={remove}
                    alt="Remove"
                    className="w-4 h-4 hover:scale-110"
                  />
                </button>
              </div>
            ))
          ) : (
            <div>No one</div>
          )}
        </div>
      </div>
      <div className="text-black flex flex-col gap-2">
        <h4 className="text-white">Assign to new member:</h4>
        <div className="flex flex-row gap-2">
          <input
            type="text"
            placeholder="Name"
            className="w-2/5 h-8 bg-[#e0dede] p-3 border-none outline-none rounded-md"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <input
            type="email"
            placeholder="Email"
            className="w-2/5 h-8 bg-[#e0dede] p-3 border-none outline-none rounded-md"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
          />
          <button
            className="bg-[#573b8a] text-white text-nowrap p-4 h-8 flex items-center justify-center rounded-md hover:bg-[#6d44b8]"
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
