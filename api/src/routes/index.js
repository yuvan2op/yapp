import express from "express";
import itemRoutes from "./itemRoutes.js";
import taskRoutes from "./taskRoutes.js";

const router = express.Router();

router.use("/items", itemRoutes);
router.use("/tasks", taskRoutes);

export default router;

