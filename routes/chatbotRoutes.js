const express = require("express");
const router = express.Router();
const { chatbot } = require("../controllers/chatbotController");

router.post("/chat", chatbot);

module.exports = router;