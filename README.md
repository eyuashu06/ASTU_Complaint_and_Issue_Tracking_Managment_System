# ASTU Complaint and Ticketing System

## System Overview

The **ASTU Complaint and Ticketing System** allows students to submit complaints to various departments, track their progress, and receive notifications. Departments and administrators manage and respond to complaints through the backend system.  

- **Students** can submit complaints and view the status and department responses.  
- **Departments** can view complaints, update statuses, and respond with remarks.  
- **Admins** have full access to review complaints, reply, and delete resolved complaints.  

## Access & Authentication

Students and admins must register and log in to access the system. Authentication is handled via **JWT** with role-based access control.

### Endpoints:

- **POST `/api/auth/register`** – Register a student account.  
  **Body:** `name`, `email`, `password`, `role`  

- **POST `/api/auth/login`** – Log in to the system.  
  **Body:** `email`, `password`  
  **Returns:** JWT token for authorization

> Roles are enforced: `student`, `department`, `admin`.

## Complaint Submission

### Endpoint:  
**POST `/api/complaints`**

### Fields:

 Field                Type          Required                   Notes 

 title                String          Yes                  Title of the complaint            
 description          String          Yes                  Detailed description              
 category             String          Yes                  Complaint category                
 priority             String          Yes                  e.g., Low, Medium, High          
 location             String          Yes                  Location related to complaint     
 contactPreference    String          Yes                  Email, phone, etc.                
 attachments     File[.png, pdf ,...]    No(Optional)     Optional email attachments        

=> Upon submission, an email notification is sent to the student and the admin via Mailtrap.

## Complaint Statuses

 Status           Description                                         

 Open             Complaint submitted, not yet addressed             
 In Progress      Complaint is being handled by a department         
 Resolved         Complaint has been completed and resolved          

## Update & Reply

- **PATCH `/api/complaints/:id`** – Update complaint status or add remarks  
  - Departments and Admins can update status and reply.  
  - Automatically sends email notification to the student including the department’s message.  
  - If `remarkMessage` is not provided:
    - `In Progress` → "Department started working on the issue"  
    - `Resolved` → "Issue resolved by the department"

## Delete Complaint

- **DELETE `/api/complaints/:id`** – Delete a complaint  
  - Only Admins can delete complaints.  
  - Typically applied to resolved complaints.  

## Notifications

- Email notifications are triggered:
  - When a complaint is submitted  
  - When a complaint status is updated  
- Currently tested with **Mailtrap** for development.  
- Optional Gmail configuration is supported for production.

## Chatbot (Backend Only)

The system includes a **rule-based / AI-assisted chatbot** to guide users:

- **Purpose:** Help students and admins understand endpoints, roles, and complaint procedures.  
- **Implementation:**  
  - Rule-based chatbot uses conditional logic for simple questions.  
  - AI-enhanced chatbot uses **Google Gemini** to answer questions specifically about the ASTU Complaint System.
- **Example Questions:**  
  - "How do I submit a complaint?"  
  - "What is the status of my complaint?"  
  - "Who can delete complaints?"  
- **Behavior:**  
  - Replies are concise, accurate, and specific to the ASTU system.  
  - Can explain endpoints, required fields, and status transitions.  

### Chatbot Endpoint:

- **POST `/api/chatbot`**  
  **Body:** `{ "message": "Your question here" }`  
  **Response:** `{ "reply": "The answer based on system and roles" }`  

## Rules & Permissions

 Role         Permissions                                                
 
 Student      Submit complaints, view own complaints, receive notifications 
 Department   View all complaints, update status, add remarks, reply     
 Admin        View all complaints, update status, add remarks, delete complaints 

## System Behavior & Usage

1. **Submitting a Complaint**  
   - Students log in → submit complaint → receive email confirmation.  

2. **Reviewing / Updating a Complaint**  
   - Departments log in → view complaints → update status → add remark → student notified by email.  

3. **Deleting a Complaint**  
   - Admin logs in → delete resolved complaints.  

4. **Chatbot Interaction**  
   - Send a question to `/api/chatbot` → receive guidance based on system rules and backend logic.

## Technology Stack

- **Backend:** Node.js, Express.js  
- **Database:** MongoDB  
- **Authentication:** JWT  
- **Email:** Mailtrap / Gmail (SMTP)  
- **Chatbot:** Rule-based logic + optional Google Gemini API  

## Testing

- API endpoints tested with **Postman**  
- Email notifications confirmed using **Mailtrap**  
- Chatbot tested with backend-only requests  

## Notes

- File attachments are stored in the `uploads` folder and linked to complaints.  
- Validation and file limits can be added in future improvements.  
- The AI chatbot can be extended to fetch real-time complaint data from MongoDB for enhanced functionality.
- 

**ASTU Complaint and Ticketing System** provides a complete backend service for managing complaints and automating notifications, along with a chatbot to assist users in navigating the system effectively.
