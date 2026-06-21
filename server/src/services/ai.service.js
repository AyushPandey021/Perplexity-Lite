import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatMistralAI } from "@langchain/mistralai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

const geminiModel = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash-lite",
  apiKey: process.env.GEMINI_API_KEY,
});

const mistralModel = new ChatMistralAI({
  model: "mistral-small-latest",
  apiKey: process.env.MISTRAL_API_KEY,
});

function extractContent(response) {
  if (!response) return "";

  if (typeof response.content === "string") {
    return response.content.trim();
  }

  if (Array.isArray(response.content)) {
    return response.content
      .map((item) => {
        if (typeof item === "string") return item;
        if (item?.text) return item.text;
        return "";
      })
      .join("")
      .trim();
  }

  return "";
}

export async function generateResponse(message) {
  try {
    if (!message?.trim()) {
      throw new Error("Message is required");
    }

    const response = await geminiModel.invoke([
      new HumanMessage(message),
    ]);

    return extractContent(response);
  } catch (error) {
    console.error("Gemini response error:", error);
    throw new Error("Failed to generate AI response");
  }
}

export async function generateChatTitle(message) {
  try {
    if (!message?.trim()) {
      return "New Conversation";
    }

    const response = await mistralModel.invoke([
      new SystemMessage(`
You are an expert chat title generator.

Generate a concise title for a conversation.

Rules:
- Maximum 10 words
- Minimum 2 words
- Clear and descriptive
- No emojis
- No quotation marks
- No punctuation
- Return ONLY the title
- Do not explain your answer

Examples:

User: How do I build a RAG chatbot?
Title: Building a RAG Chatbot

User: Create a visitor management system
Title: Visitor Management System

User: Help me learn FastAPI
Title: FastAPI Learning Guide
      `),

      new HumanMessage(message),
    ]);

    const title = extractContent(response);

    return title || "New Conversation";
  } catch (error) {
    console.error("Title generation error:", error);
    return "New Conversation";
  }
}