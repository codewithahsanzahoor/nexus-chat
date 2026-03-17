
export type UserStatus = 'online' | 'offline' | 'typing';

export interface User {
  id: string;
  name: string;
  avatar: string;
  status: UserStatus;
  lastSeen?: string;
  role?: string;
  location?: string;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
}

export interface Conversation {
  id: string;
  type: 'direct' | 'group';
  participants: User[];
  messages: Message[];
  unreadCount: number;
  lastMessageTime: string;
}

export interface AppState {
  currentUser: User;
  conversations: Conversation[];
  activeConversationId: string | null;
  isSettingsOpen: boolean;
  isCreateGroupOpen: boolean;
  isLoggedIn: boolean;
  theme: 'light' | 'dark';
}
