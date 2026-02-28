const OpenAI =require("openai");

exports.chatbot = (req, res) => {
  const { message } = req.body;
  const text = message.toLowerCase();

  if (text.includes("complaint")) {
    return res.json({
      reply: "To create a complaint use POST /api/complaints."
    });
  }

  if (text.includes("status")) {
    return res.json({
      reply: "You can check complaint status from the complaints dashboard."
    });
  }

  if(text.includes("register")){
    return res.json({
        reply: "You can register to the complaint system by POST /ap/auth/register."
    });
  }

  if(text.includes("login")){
    return res.json({
        reply: "You can login to the complaint system by POST /ap/auth/login."
    })
  }

  return res.json({
    reply: "Please contact the department."
  });
};