
import { User, Conversation } from './types';

export const MOCK_CURRENT_USER: User = {
  _id: 'me',
  name: 'Alex Rivera',
  avatar: 'https://picsum.photos/seed/alex/200',
  status: 'online',
  role: 'Full Stack Developer',
  location: 'SF, California'
};

export const MOCK_USERS: User[] = [
  {
    _id: 'user1',
    name: 'Sarah Jenkins',
    avatar: 'https://picsum.photos/seed/sarah/200',
    status: 'offline',
    lastSeen: '12:20 PM'
  },
  {
    _id: 'user2',
    name: 'Jordan Vance',
    avatar: 'https://picsum.photos/seed/jordan/200',
    status: 'online'
  },
  {
    _id: 'user3',
    name: 'Nexus Bot',
    avatar: 'https://picsum.photos/seed/bot/200',
    status: 'online',
    role: 'AI Assistant'
  }
];

export const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    _id: 'conv1',
    type: 'direct',
    participants: [MOCK_USERS[0]],
    messages: [
      {
        _id: 'm1',
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
    _id: 'conv2',
    type: 'direct',
    participants: [MOCK_USERS[1]],
    messages: [
      {
        _id: 'm2',
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
    _id: 'conv3',
    type: 'direct',
    participants: [MOCK_USERS[2]],
    messages: [
      {
        _id: 'm3',
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
