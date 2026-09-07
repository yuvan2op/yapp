import mongoose from "mongoose";
import { Task } from "../models/Task.js";

const isValidId = (id) => mongoose.isValidObjectId(id);

export const getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 }).lean();
    res.json(tasks);
  } catch (err) {
    console.error("Error fetching tasks", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createTask = async (req, res) => {
  try {
    const { title, description, status } = req.body;
    if (!title || typeof title !== "string" || !title.trim()) {
      return res.status(400).json({ message: "Title is required" });
    }

    const task = await Task.create({ title, description, status });
    res.status(201).json(task);
  } catch (err) {
    console.error("Error creating task", err);
    if (err.name === "ValidationError") {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({ message: "Invalid task id" });
    }

    const updates = {};
    for (const field of ["title", "description", "status"]) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (updates.title !== undefined &&
        (typeof updates.title !== "string" || !updates.title.trim())) {
      return res.status(400).json({ message: "Title is required" });
    }

    const task = await Task.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true
    }).lean();

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.json(task);
  } catch (err) {
    console.error("Error updating task", err);
    if (err.name === "ValidationError") {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({ message: "Invalid task id" });
    }

    const deleted = await Task.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.status(204).send();
  } catch (err) {
    console.error("Error deleting task", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
