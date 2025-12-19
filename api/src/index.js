import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// Basic middleware
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://mongo:27017/yapp_db";

// Simple Item model
const itemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" }
  },
  { timestamps: true }
);

const Item = mongoose.model("Item", itemSchema);

// Root landing page - simple professional HTML output
app.get("/", (req, res) => {
  res.type("html").send(`
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>Yapp API • Service Status</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>
          body {
            margin: 0;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            background: radial-gradient(circle at top left, #020617, #0f172a);
            color: #e5e7eb;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
          }
          .card {
            background: rgba(15, 23, 42, 0.9);
            border-radius: 1rem;
            padding: 1.8rem 2rem;
            box-shadow: 0 18px 45px rgba(15, 23, 42, 0.8);
            border: 1px solid rgba(148, 163, 184, 0.25);
            max-width: 540px;
          }
          h1 {
            margin: 0 0 0.35rem;
            font-size: 1.6rem;
          }
          p {
            margin: 0.25rem 0;
            color: #9ca3af;
          }
          .badge {
            display: inline-flex;
            align-items: center;
            gap: 0.4rem;
            border-radius: 999px;
            padding: 0.25rem 0.7rem;
            font-size: 0.8rem;
            background: rgba(22, 163, 74, 0.18);
            color: #bbf7d0;
            border: 1px solid rgba(22, 163, 74, 0.7);
            margin-bottom: 0.75rem;
          }
          .dot {
            width: 8px;
            height: 8px;
            border-radius: 999px;
            background: #22c55e;
          }
          .meta {
            margin-top: 1rem;
            font-size: 0.8rem;
            color: #6b7280;
          }
          code {
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
            background: rgba(15, 23, 42, 0.9);
            padding: 0.15rem 0.35rem;
            border-radius: 0.35rem;
            border: 1px solid rgba(55, 65, 81, 0.9);
          }
        </style>
      </head>
      <body>
        <main class="card">
          <span class="badge">
            <span class="dot"></span>
            API Online
          </span>
          <h1>Yapp API Service</h1>
          <p>Node.js + Express + MongoDB backend is running on <code>PORT=${PORT}</code>.</p>
          <p>Use this service from the React client or directly from tools like Postman.</p>
          <p class="meta">
            Health endpoint: <code>GET /api/health</code><br/>
            Items endpoint: <code>GET /api/items</code>, <code>POST /api/items</code>
          </p>
        </main>
      </body>
    </html>
  `);
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Get all items
app.get("/api/items", async (req, res) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 }).lean();
    res.json(items);
  } catch (err) {
    console.error("Error fetching items", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Create an item
app.post("/api/items", async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }
    const item = await Item.create({ title, description });
    res.status(201).json(item);
  } catch (err) {
    console.error("Error creating item", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Delete a single item
app.delete("/api/items/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Item.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.status(204).send();
  } catch (err) {
    console.error("Error deleting item", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Connect to Mongo and start server
mongoose
  .connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 30000
  })
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`API server listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
  });


