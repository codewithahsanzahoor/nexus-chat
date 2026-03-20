
export type UserStatus = 'online' | 'offline' | 'typing';

export interface User {
  _id: string;
  name: string;
  email?: string;
  avatar: string;
  status: UserStatus;
  lastSeen?: string;
  role?: string;
  location?: string;
}

export interface Message {
  _id: string;
  conversationId?: string;
  senderId: string;
  text: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
}

export interface Conversation {
  _id: string;
  type: 'direct' | 'group';
  participants: User[];
  messages: Message[];
  unreadCount: number;
  lastMessageTime: string;
  groupName?: string;
}

export interface AppState {
  currentUser: User | null;
  conversations: Conversation[];
  activeConversationId: string | null;
  isSettingsOpen: boolean;
  isCreateGroupOpen: boolean;
  isLoggedIn: boolean;
  theme: 'light' | 'dark';
  token: string | null;
  isLoading: boolean;
  error: string | null;
}
