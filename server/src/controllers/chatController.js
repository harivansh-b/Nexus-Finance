import Groq from 'groq-sdk';
import { successResponse } from '../utils/helpers.js';
import { AppError } from '../middleware/errorHandler.js';

let groq = null;

const getGroqClient = () => {
  if (groq) return groq;

  if (!process.env.GROQ_API_KEY) {
    throw new AppError('Groq API Key is not configured', 500);
  }

  groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });
  return groq;
};

export const chatWithAI = async (req, res, next) => {
  try {
    const { message, context } = req.body;
    const client = getGroqClient();

    if (!message) {
      throw new AppError('Message is required', 400);
    }

    const systemPrompt = `
      You are Nexus AI, a highly intelligent financial assistant for the Nexus Finance crypto trading platform.
      Your goal is to help users understand the market, manage their portfolio, and navigate the platform.
      
      User Context:
      - Current Route: ${context?.currentRoute || 'Dashboard'}
      - User Balance: $${context?.userBalance || 'Unknown'}
      - Holdings: ${context?.holdingsCount || 0} assets
      
      Guidelines:
      1. Be concise, professional, and helpful.
      2. If asked about the current page, explain what they can do there.
      3. Provide accurate crypto information but always include a disclaimer that you are not a financial advisor.
      4. Use a friendly, institutional-grade tone.
      5. Keep responses relatively short for a chat interface.
    `;

    const chatCompletion = await client.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 1024,
    });

    const aiResponse = chatCompletion.choices[0]?.message?.content || "I'm sorry, I couldn't process that request.";

    res.json(successResponse({ response: aiResponse }));
  } catch (error) {
    console.error('Groq AI Error:', error);
    next(error);
  }
};
