
import { User, Conversation } from './types';

export const MOCK_CURRENT_USER: User = {
  id: 'me',
  name: 'Alex Rivera',
  avatar: 'https://picsum.photos/seed/alex/200',
  status: 'online',
  role: 'Full Stack Developer',
  location: 'SF, California'
};

export const MOCK_USERS: User[] = [
  {
    id: 'user1',
    name: 'Sarah Jenkins',
    avatar: 'https://picsum.photos/seed/sarah/200',
    status: 'offline',
    lastSeen: '12:20 PM'
  },
  {
    id: 'user2',
    name: 'Jordan Vance',
    avatar: 'https://picsum.photos/seed/jordan/200',
    status: 'online'
  },
  {
    id: 'user3',
    name: 'Nexus Bot',
    avatar: 'https://picsum.photos/seed/bot/200',
    status: 'online',
    role: 'AI Assistant'
  }
];

export const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv1',
    type: 'direct',
    participants: [MOCK_USERS[0]],
    messages: [
      {
        id: 'm1',
        senderId: 'user1',
        text: "Let's sync up on the PR review tomorrow.",
        timestamp: '12:20 PM',
        status: 'read'
      }
    ],
    unreadCount: 0,
    lastMessageTime: '12:20 PM'
  },
  {
    id: 'conv2',
    type: 'direct',
    participants: [MOCK_USERS[1]],
    messages: [
      {
        id: 'm2',
        senderId: 'user2',
        text: 'Attached the updated UI designs for the dashboard.',
        timestamp: 'Yesterday',
        status: 'read'
      }
    ],
    unreadCount: 0,
    lastMessageTime: 'Yesterday'
  },
  {
    id: 'conv3',
    type: 'direct',
    participants: [MOCK_USERS[2]],
    messages: [
      {
        id: 'm3',
        senderId: 'user3',
        text: 'Hello! I am Nexus Bot. How can I help you today?',
        timestamp: '9:00 AM',
        status: 'read'
      }
    ],
    unreadCount: 0,
    lastMessageTime: '9:00 AM'
  }
];
