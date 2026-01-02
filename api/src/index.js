import dotenv from "dotenv";
import { connectDB } from "./config/database.js";
import app from "./app.js";

dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://mongo:27017/yapp_db";

// Connect to MongoDB and start server
connectDB(MONGODB_URI).then(() => {
  app.listen(PORT, () => {
    console.log(`API server listening on port ${PORT}`);
  });
});
