import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {OpenAI} from 'openai';
import { User } from "../models/user.model.js";
import{GoogleGenerativeAI,HarmCategory, HarmBlockThreshold} from "@google/generative-ai";

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_KEY
});

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash-8b",
});

const llamaGenerate = asyncHandler(async (req, res) => {
  try {
    const { userResponse, userId } = req.body;

    if (!userResponse || !userId) {
      return res.status(400).json({ error: "User response and user ID are required" });
    }
    const prompt = `
      Here is an essay written by the user: "${userResponse.replace(/"/g, "'")}"
      Task: 
      - Find and highlight grammatical, spelling, or punctuation mistakes.
      - Provide corrections and suggestions for improvement.
      - Rate the essay out of 10 based on grammar, structure, and clarity.
      - Give brief feedback on how to improve the essay overall.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [ { role: "system", content: prompt}]
    });

    return res.status(200).json({
      status: 200,
      data: completion.data.choices[0].message.content,
      message: "Content generated successfully"
    });

  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
    return res.status(500).json({
      error: "Something went wrong while generating content",
      details: error.message || "API Error"
    });
  }
});

const googleGenerativeAI = asyncHandler(async (req, res) => {
 
    const { userResponse } = req.body;
        const prompt = `
        Here is an essay written by the user: "${userResponse}
        Task:
        - Find and highlight grammatical, spelling, or punctuation mistakes.
        - Provide corrections and suggestions for improvement.
        - Rate the essay out of 10 based on grammar, structure, and clarity.
        - Give brief feedback on how to improve the essay overall.
        - Provide a rewritten version of the essay with corrections and suggestions applied.
        `;
        const generationConfig = {
          temperature: 1,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 2000,
          responseMimeType: "text/plain",
        };

        const chatSession = model.startChat({
          generationConfig,
          history: [
          ],
        });
      
        const result = await chatSession.sendMessage(prompt);
        return res.status(200).json({
          status: 200,
          message: "Content generated successfully",
          data: result.response.candidates[0].content.parts[0].text
        });

  
});

const jobChatBot = asyncHandler(async (req, res) => {
  try {
    const { message } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const userId = req.user._id;
   

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
  jobChatBot,
  googleGenerativeAI
};
