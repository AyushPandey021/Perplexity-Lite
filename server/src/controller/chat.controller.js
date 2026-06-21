import { generateResponse, generateChatTitle } from "../services/ai.service.js";
import chatModel from "../models/chat.model.js";
import messageModel from "../models/message.model.js";

export async function sendMessage(req, res) {
    try {
        const { message } = req.body;

        if (!message?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Message is required",
            });
        }

        // Generate title from first message
        const title = await generateChatTitle(message);

        // Generate AI response
        const aiResponse = await generateResponse(message);

        const currentUserId = req.userId || req.user?.id;

        if (!currentUserId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: user not authenticated",
            });
        }

        // Create chat
        const chat = await chatModel.create({
            user: currentUserId,
            title,
            lastMessage: message,
        });

        // Save user message
        const userMessage = await messageModel.create({
            chat: chat._id,
            content: message,
            role: "user",
        });

        // Save AI message
        const aiMessage = await messageModel.create({
            chat: chat._id,
            content: aiResponse,
            role: "ai",
        });

        res.status(201).json({
            success: true,
            title,
            chat,
            userMessage,
            aiMessage,
            response: aiResponse,
        });
    } catch (error) {
        console.error("Send Message Error:", error);

        res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error",
        });
    }
}