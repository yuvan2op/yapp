import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    status: {
      type: String,
      enum: ["pending", "in_progress", "completed"],
      default: "pending"
    }
  },
  { timestamps: true }
);

export const Task = mongoose.model("Task", taskSchema);
