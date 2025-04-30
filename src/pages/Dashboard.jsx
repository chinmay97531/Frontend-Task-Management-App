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
    <div className="flex items-center flex-col font-sans-serif min-h-screen bg-gradient-to-r from-[#4a5568] to-[#4a5568] pb-4">
        <NavBar modalOpen={modalOpen} setModalOpen={setModalOpen} setTasks={setTasks} refreshTasks={fetchTasks} />
        <CreatingBoard modalOpen={modalOpen} setModalOpen={setModalOpen} refreshTasks={fetchTasks} />
        <div className="grid grid-cols-2 gap-10 items-center justify-center w-full h-full">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center bg-[#2d3748] w-4/5 h-full rounded-2xl shadow-[5px_20px_50px_rgba(0,0,0,1)] m-5 p-5">
            <h1 className="text-white">No tasks available</h1>
          </div>
        ) : (
          tasks.map((task, index) => (
            <Tasks key={index} index={index} task={task} refreshTasks={fetchTasks} />
          ))
        )}
        </div>
    </div>
  );
}