import React, { useState, useEffect } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { useNavigate } from "react-router-dom";
import Feed from "./Feed";
import { mdiLogout, mdiDelete } from '@mdi/js';
import Icon from '@mdi/react';

interface Tasks {
  id: string;
  taskName: string;
  taskDescription: string;
  status: string;
}

interface TaskProps {
  onLogout: () => void;
}

const Task: React.FC<TaskProps> = ({ onLogout }) => {
  const [tasks, setTasks] = useState<{ [key: string]: Tasks[] }>({});
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");
  const token = localStorage.getItem("authToken");
  const navigate = useNavigate();

  const fetchUserDetails = async () => {
    try {
      const response = await fetch("https://affworld-services-1.onrender.com/api/v1/user/user-detail", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      setUserName(data.result[0].username);
    } catch (error) {
      console.error("Failed to fetch user details:", error);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await fetch("https://affworld-services-1.onrender.com/api/v1/task/getTasks", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setTasks(data.result);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    onLogout();
    navigate("/");
  };

  const addTask = async () => {
    if (name && description) {
      try {
        const response = await fetch("https://affworld-services-1.onrender.com/api/v1/task/createTask", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            task_name: name,
            task_description: description,
          }),
        });

        if (response.ok) {
          setName("");
          setDescription("");
          await fetchTasks();
        } else {
          console.error("Failed to create task.");
        }
      } catch (error) {
        console.error("Error creating task:", error);
      }
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`https://affworld-services-1.onrender.com/api/v1/task/deleteTask/${taskId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        await fetchTasks();
        setDeleteTaskId(null);
      } else {
        console.error("Failed to delete task.");
      }
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      const response = await fetch(`https://affworld-services-1.onrender.com/api/v1/task/updateTaskStatus/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        await fetchTasks();
      } else {
        console.error("Failed to update task status.");
      }
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  const onDragEnd = async (result: any) => {
    const { source, destination } = result;
    if (!destination) return;

    const sourceList = tasks[source.droppableId];
    const destinationList = tasks[destination.droppableId];
    const [movedTask] = sourceList.splice(source.index, 1);
    destinationList.splice(destination.index, 0, movedTask);

    setTasks({ ...tasks, [source.droppableId]: sourceList, [destination.droppableId]: destinationList });

    await updateTaskStatus(movedTask.id, destination.droppableId);
  };

  useEffect(() => {
    fetchUserDetails();
    fetchTasks()
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-gradient-to-r from-purple-600 to-purple-800 text-white p-6">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-4xl font-bold">Affworld Technologies</h1>
          <button
            onClick={handleLogout}
            className="flex items-center bg-red-600 py-2 px-4 rounded-full shadow-lg hover:bg-red-700 transition-all duration-300 ease-in-out"
          >
            <Icon path={mdiLogout} size={1.5} className="mr-3" />
            <span className="font-semibold">{userName}</span>
          </button>
        </div>
      </header>

      <main className="flex-grow  pt-6 pb-6 px-0">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Task Management</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Task Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2"
              />
              <textarea
                placeholder="Task Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2"
              />
            </div>
            <button
              onClick={addTask}
              className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
            >
              Add Task
            </button>
          </div>

          <DragDropContext onDragEnd={onDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.keys(tasks).map((status) => (
                <Droppable key={status} droppableId={status}>
                  {(provided: any) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="bg-white shadow-md rounded-lg p-4 min-h-[300px]"
                    >
                      <h2 className="text-lg font-semibold mb-4 capitalize">{status}</h2>
                      {tasks[status].map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                          {(provided: any) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="bg-gray-100 border border-gray-300 rounded-lg p-2 mb-4 flex justify-between items-center"
                            >
                              <div>
                                <h3 className="font-semibold">{task.taskName}</h3>
                                <p className="text-sm text-gray-600">{task.taskDescription}</p>
                              </div>
                              <button
                                onClick={() => setDeleteTaskId(task.id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Icon path={mdiDelete} size={1} />
                              </button>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              ))}
            </div>
          </DragDropContext>

          <Feed />
        </div>
      </main>

      <footer className="bg-gradient-to-l from-purple-600 to-purple-800 text-white p-6">
        <div className="max-w-4xl mx-auto flex justify-center">
          <span className="text-lg">&copy; 2025 Affworld Technologies. All rights reserved.</span>
        </div>
      </footer>

      {deleteTaskId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Are you sure you want to delete this task?</h2>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setDeleteTaskId(null)}
                className="bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteTask(deleteTaskId)}
                className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Task;
