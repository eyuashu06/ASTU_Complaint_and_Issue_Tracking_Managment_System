const dotenv = require("dotenv");
dotenv.config({ path: "../.env" });

const express = require("express");
const connectDB = require("./database/db");
const authRoutes = require("./routes/authRoutes");
const errorHandler = require("./middleware/errorMiddleware");
const complaintRoutes = require("./routes/complaintRoutes");
const analytcisRoutes = require("./routes/analyticsRoutes");
const chatbotRoutes = require("./routes/chatbotRoutes");
const app = express();

// middleware
app.use(express.json());

// connect database
connectDB();

// routes
app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/analytics", analytcisRoutes);
app.use("/uploads", express.static("uploads"))
app.use(errorHandler);
app.use("/api/chatbot", chatbotRoutes);
app.get("/", (req, res) => {
  res.send("ASTU Complaint System API is Running");
});

// error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message });
});

// PORT
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
