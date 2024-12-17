import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import OpenAI from 'openai';
import { User } from "../models/user.model.js";

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_KEY,
  baseURL: 'https://integrate.api.nvidia.com/v1',
});

// Use a Map to store conversation history for each user
const conversationHistories = new Map();

const llamaGenerate = asyncHandler(async (req, res) => {
  try {
    const { userResponse,question } = req.body;
    const prompt = userResponse;
    
    const completion = await openai.chat.completions.create({
      model: "meta/llama-3.1-405b-instruct",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
      top_p: 1,
      max_tokens: 1024,
      stream: false,
    });

    return res.status(200).json(
      new ApiResponse(200, completion.choices[0].message, "Content generated")
    );
  } catch (error) {
    throw new ApiError(500, error, "Something went wrong while generating content");
  }
});

const jobChatBot = asyncHandler(async (req, res) => {
  try {
    const { message } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const userId = req.user._id;
    let conversationHistory = conversationHistories.get(userId) || [];

    const skillsArray = user.skills;
    console.log(skillsArray);

    // Add user's message to conversation history
    conversationHistory.push({ role: "user", content: message });

    // Construct the jobPrompt
    let jobPrompt = `
      The user has skills in: ${skillsArray.join(", ")}.
      Based on these skills, ask the user a series of Yes/No questions to understand their job preferences.
      After gathering their preferences, recommend a top 5 list of jobs.
      Previous conversation:
    `;

    conversationHistory.forEach((entry) => {
      jobPrompt += `\n${entry.role}: ${entry.content}`;
    });

    jobPrompt += `\nBot:`;

    // Generate bot response using OpenAI
    const completion = await openai.chat.completions.create({
      model: "meta/llama3-8b-instruct",
      messages: [{ role: "user", content: jobPrompt }],
      temperature: 0.5,
      top_p: 1,
      max_tokens: 1024,
      stream: false,
    });

    const botMessage = completion.choices[0].message.content;

    conversationHistory.push({ role: "bot", content: botMessage });

    conversationHistories.set(userId, conversationHistory);

    console.log("Conversation History:", conversationHistories);
    return res.status(200).json(
      new ApiResponse(200, botMessage, "Chatbot response generated")
    );
  } catch (error) {
    throw new ApiError(500, error, "Something went wrong while processing the chatbot request");
  }
});

export {
  llamaGenerate,
  jobChatBot
};
