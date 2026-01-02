import express from "express";
import itemRoutes from "./itemRoutes.js";

const router = express.Router();

router.use("/items", itemRoutes);

export default router;

