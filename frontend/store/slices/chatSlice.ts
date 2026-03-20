import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Conversation, Message } from "../../types";

interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ChatState = {
  conversations: [],
  activeConversationId: null,
  isLoading: false,
  error: null,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setConversations: (state, action: PayloadAction<Conversation[]>) => {
      state.conversations = action.payload.map((conv) => ({
        ...conv,
        messages: conv.messages || [],
      }));
    },
    setMessages: (
      state,
      action: PayloadAction<{ conversationId: string; messages: Message[] }>,
    ) => {
      const conv = state.conversations.find(
        (c) => c._id === action.payload.conversationId,
      );
      if (conv) {
        conv.messages = action.payload.messages;
      }
    },
    setActiveConversation: (state, action: PayloadAction<string | null>) => {
      state.activeConversationId = action.payload;
    },
    addMessage: (
      state,
      action: PayloadAction<{ conversationId: string; message: Message }>,
    ) => {
      const conv = state.conversations.find(
        (c) => c._id === action.payload.conversationId,
      );
      if (conv) {
        if (!conv.messages) conv.messages = [];
        conv.messages.push(action.payload.message);
        conv.lastMessageTime = action.payload.message.timestamp;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    updateUserStatus: (
      state,
      action: PayloadAction<{ userId: string; status: "online" | "offline" }>,
    ) => {
      state.conversations.forEach((conv) => {
        conv.participants.forEach((p) => {
          if (p._id === action.payload.userId) {
            p.status = action.payload.status;
          }
        });
      });
    },
  },
});

export const {
  setConversations,
  setMessages,
  setActiveConversation,
  addMessage,
  setLoading,
  setError,
  updateUserStatus,
} = chatSlice.actions;

export default chatSlice.reducer;
