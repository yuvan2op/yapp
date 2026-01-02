import { Item } from "../models/Item.js";

export const getAllItems = async (req, res) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 }).lean();
    res.json(items);
  } catch (err) {
    console.error("Error fetching items", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createItem = async (req, res) => {
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
};

export const deleteItem = async (req, res) => {
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
};

