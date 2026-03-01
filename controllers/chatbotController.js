const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.chatbot = async (req, res) => {
  try{
    const { message } = req.body;
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash"
    });

      const prompt = `
        You are an AI assistant for the ASTU Complaint and Ticketing System.

        System Overview:
            Students submit complaints to departments.
            Departments can view complaints, respond by updating status with a response, and manage ongoing complaints.
            Admins review complaints, reply, and can delete complaints that are resolved.
          Access:
            Students must register and login to use the system.
            POST /api/auth/register register a student account
            POST /api/auth/login login to access the system
          Complaint Submission:
            Endpoint: POST /api/complaints
            Fields: title, description, category, priority, location, contactPreference
            Optional attachments: emailAttachments
          Notifications:
            Email notifications are sent via Mailtrap when complaints are submitted or updated.
          Complaint Statuses:
            Open : complaint submitted but not yet addressed
            In Progress : complaint is being handled
            Resolved : complaint has been completed
          Rules & Permissions:
            Only Admin can delete resolved complaints.
            Departments and Admin can reply at any stage.
            Students can submit complaints and view status/response only.
          Behavior for AI:
            Explain endpoints, fields, and statuses clearly.
            Provide step-by-step instructions for submitting, updating, or reviewing complaints.
            Clarify rules for roles, status changes, and deletion.
            Keep answers concise, accurate, and user-friendly.ess, Resolved

        Answer based on this system only.

        Question: ${message}`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    return res.json({
      reply: response
    });
  } catch (error) {
  res.status(500).json({error: error.message});
  }
};