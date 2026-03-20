import { Response } from 'express';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

export const getConversations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const conversations = await Conversation.find({
      participants: req.user.id
    }).populate('participants', '-password').sort({ updatedAt: -1 });
    
    res.json(conversations);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getMessages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId
    }).sort({ createdAt: 1 });
    
    res.json(messages);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createConversation = async (req: AuthRequest, res: Response): Promise<void> => {
  const { participants, type, groupName } = req.body;
  try {
    let conversation = new Conversation({
      participants: [...participants, req.user.id],
      type: type || 'direct',
      groupName
    });
    const created = await conversation.save();
    res.status(201).json(created);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  const { conversationId, text } = req.body;
  try {
    const message = new Message({
      conversationId,
      senderId: req.user.id,
      text,
      status: 'sent'
    });
    const savedMessage = await message.save();
    
    // Update conversation's lastMessageTime
    await Conversation.findByIdAndUpdate(conversationId, { lastMessageTime: savedMessage.createdAt });
    
    res.status(201).json(savedMessage);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};