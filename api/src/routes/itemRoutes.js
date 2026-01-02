import express from "express";
import {
  getAllItems,
  createItem,
  deleteItem
} from "../controllers/itemController.js";

const router = express.Router();

router.get("/", getAllItems);
router.post("/", createItem);
router.delete("/:id", deleteItem);

export default router;

