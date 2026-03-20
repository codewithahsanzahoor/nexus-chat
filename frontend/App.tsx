import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from './store/store';
import { loginStart, loginSuccess, loginFail, logout } from './store/slices/authSlice';
import { setConversations, setMessages, setActiveConversation, addMessage, setLoading, updateUserStatus } from './store/slices/chatSlice';
import api from './services/api';
import socket from './services/socket';
import { Message, Conversation, User } from './types';
import SettingsModal from './components/SettingsModal';
import CreateGroupModal from './components/CreateGroupModal';

const App: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user: currentUser, isLoggedIn, isLoading: authLoading } = useSelector((state: RootState) => state.auth);
  const { conversations, activeConversationId, isLoading: chatLoading } = useSelector((state: RootState) => state.chat);

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('name@example.com');
  const [password, setPassword] = useState('password123');
  const [name, setName] = useState('');
  const [allUsers, setAllUsers] = useState<User[]>([]);

  const scrollRef = useRef<HTMLDivElement>(null);

  const activeConversation = conversations.find(c => c._id === activeConversationId);
  const otherParticipant = activeConversation?.participants.find(p => p._id !== currentUser?._id);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    if (isLoggedIn && currentUser) {
      socket.connect();
      socket.emit('join_user', currentUser._id);
      fetchConversations();
      fetchAllUsers();
    } else {
      socket.disconnect();
    }
  }, [isLoggedIn, currentUser]);

  useEffect(() => {
    socket.on('receive_message', (data: { conversationId: string; message: Message }) => {
      console.log('Message Received:', data);
      dispatch(addMessage(data));
    });

    socket.on('user_typing', (data: { conversationId: string; isTyping: boolean }) => {
      if (data.conversationId === activeConversationId) {
        setIsTyping(data.isTyping);
      }
    });

    socket.on('user_status_changed', (data: { userId: string; status: 'online' | 'offline' }) => {
      console.log('Status Changed:', data);
      dispatch(updateUserStatus(data));
      setAllUsers(prev => prev.map(u => u._id === data.userId ? { ...u, status: data.status } : u));
    });

    return () => {
      socket.off('receive_message');
      socket.off('user_typing');
      socket.off('user_status_changed');
    };
  }, [dispatch, activeConversationId]);

  useEffect(() => {
    // Join all conversation rooms
    if (conversations.length > 0) {
      conversations.forEach(conv => {
        socket.emit('join_conversation', conv._id);
      });
    }
  }, [conversations]);

  useEffect(() => {
    if (activeConversationId) {
      fetchMessages(activeConversationId);
    }
  }, [activeConversationId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversations, activeConversationId]);

  const fetchConversations = async () => {
    try {
      dispatch(setLoading(true));
      const { data } = await api.get('/chat/conversations');
      dispatch(setConversations(data));
      if (data.length > 0 && !activeConversationId) {
        dispatch(setActiveConversation(data[0]._id));
      }
      dispatch(setLoading(false));
    } catch (error) {
      dispatch(setLoading(false));
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const { data } = await api.get(`/chat/messages/${conversationId}`);
      const formattedMessages = data.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }));
      dispatch(setMessages({ conversationId, messages: formattedMessages }));
    } catch (error) {
      console.error('Failed to fetch messages');
    }
  };

  const fetchAllUsers = async () => {
    try {
      const { data } = await api.get('/auth/users');
      setAllUsers(data.filter((u: User) => u._id !== currentUser?._id));
    } catch (error) {
      console.error('Failed to fetch users');
    }
  };

  const handleAuth = async () => {
    dispatch(loginStart());
    try {
      const endpoint = authMode === 'login' ? '/auth/login' : '/auth/register';
      const payload = authMode === 'login' ? { email, password } : { name, email, password };
      const { data } = await api.post(endpoint, payload);
      dispatch(loginSuccess({ user: data, token: data.token }));
    } catch (error: any) {
      dispatch(loginFail(error.response?.data?.message || 'Auth failed'));
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || !activeConversationId || !currentUser) return;

    try {
      const { data: savedMessage } = await api.post('/chat/messages', {
        conversationId: activeConversationId,
        text: inputText
      });

      const messageData = {
        ...savedMessage,
        timestamp: new Date(savedMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      socket.emit('send_message', {
        conversationId: activeConversationId,
        message: messageData
      });

      setInputText('');
    } catch (error) {
      console.error('Failed to send message');
    }
  };

  const handleCreateGroup = async (groupName: string, members: string[]) => {
    try {
      const { data } = await api.post('/chat/conversations', {
        type: 'group',
        groupName,
        participants: members
      });
      dispatch(setConversations([data, ...conversations]));
      dispatch(setActiveConversation(data._id));
      setIsCreateGroupOpen(false);
    } catch (error) {
      console.error('Failed to create group');
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background-dark p-6">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[radial-gradient(circle_at_center,rgba(13,185,242,0.1)_0%,transparent_70%)] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.1)_0%,transparent_70%)] rounded-full"></div>
        
        <div className="w-full max-w-md z-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary/10 border border-primary/30 mb-4 neon-glow">
              <span className="material-icons-round text-primary text-4xl">bolt</span>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Nexus <span className="text-primary">Chat</span></h1>
            <p className="text-slate-400 mt-2">Connect in real-time with the world.</p>
          </div>

          <div className="glass-effect rounded-xl p-8 shadow-2xl border border-primary/20">
            <div className="flex mb-8 bg-surface-dark/50 p-1 rounded-lg">
              <button 
                onClick={() => setAuthMode('login')}
                className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${authMode === 'login' ? 'bg-primary text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Login
              </button>
              <button 
                onClick={() => setAuthMode('signup')}
                className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${authMode === 'signup' ? 'bg-primary text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Sign Up
              </button>
            </div>

            <div className="space-y-5">
              {authMode === 'signup' && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">Full Name</label>
                  <div className="relative">
                    <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xl">person</span>
                    <input 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-background-dark/50 border border-border-dark rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none text-slate-900 dark:text-white placeholder:text-slate-600" 
                      placeholder="John Doe" 
                    />
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">Email Address</label>
                <div className="relative">
                  <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xl">alternate_email</span>
                  <input 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-background-dark/50 border border-border-dark rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none text-slate-900 dark:text-white placeholder:text-slate-600" 
                    placeholder="name@example.com" 
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1.5 ml-1">
                  <label className="block text-sm font-medium text-slate-300">Password</label>
                </div>
                <div className="relative">
                  <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xl">lock_open</span>
                  <input 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-12 py-3 bg-background-dark/50 border border-border-dark rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none text-slate-900 dark:text-white placeholder:text-slate-600" 
                    type="password" 
                    placeholder="••••••••" 
                  />
                </div>
              </div>

              <button 
                onClick={handleAuth}
                disabled={authLoading}
                className="w-full bg-primary text-white font-bold py-3.5 rounded-lg shadow-lg hover:shadow-primary/40 transition-all duration-300 transform active:scale-[0.98] flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
              >
                <span>{authLoading ? 'Processing...' : (authMode === 'login' ? 'Sign In' : 'Create Account')}</span>
                <span className="material-icons-round text-lg">login</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background-dark text-white">
      {/* Sidebar */}
      <aside className="w-[380px] flex-shrink-0 border-r border-border-dark flex flex-col bg-surface-dark/50">
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg">
                <span className="material-icons-round">bolt</span>
              </div>
              <h1 className="text-xl font-bold tracking-tight text-white">NexusChat</h1>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'))}
                className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all"
              >
                <span className="material-icons-round">{theme === 'dark' ? 'light_mode' : 'dark_mode'}</span>
              </button>
              <button 
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all"
              >
                <span className="material-icons-round">edit_square</span>
              </button>
              <button 
                onClick={() => dispatch(logout())}
                className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all"
              >
                <span className="material-icons-round">logout</span>
              </button>
            </div>
          </div>
          <div className="relative group">
            <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary text-lg">search</span>
            <input className="w-full bg-background-dark border-none rounded-xl py-3 pl-11 pr-4 focus:ring-2 focus:ring-primary/50 text-sm transition-all text-white" placeholder="Search conversations..." />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 space-y-2">
          <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold px-2 py-2">Conversations</div>
          {conversations.map(conv => {
            const participant = conv.participants.find(p => p._id !== currentUser?._id) || conv.participants[0];
            const messages = conv.messages || [];
            const lastMsg = messages[messages.length - 1];
            const isActive = activeConversationId === conv._id;
            
            if (!participant) return null;

            return (
              <div 
                key={conv._id}
                onClick={() => dispatch(setActiveConversation(conv._id))}
                className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all group ${
                  isActive ? 'bg-primary/10 border border-primary/20' : 'hover:bg-background-dark/50'
                }`}
              >
                <div className="relative">
                  <img src={participant.avatar || 'https://picsum.photos/seed/user/200'} className="w-12 h-12 rounded-xl object-cover" alt="" />
                  {participant.status === 'online' && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary border-2 border-surface-dark rounded-full shadow-lg"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <h3 className="font-semibold text-sm truncate text-white">{conv.type === 'group' ? conv.groupName : participant.name}</h3>
                    <span className={`text-[10px] ${isActive ? 'text-primary font-medium' : 'text-slate-500'}`}>
                      {conv.lastMessageTime}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 truncate">{lastMsg?.text || 'No messages'}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-6 border-t border-border-dark">
          <button 
            onClick={() => setIsCreateGroupOpen(true)}
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg"
          >
            <span className="material-icons-round">group_add</span>
            <span>Create Group</span>
          </button>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col relative bg-background-dark">
        {activeConversation ? (
          <>
            <header className="h-20 flex-shrink-0 border-b border-border-dark flex items-center justify-between px-8 bg-background-dark/80 backdrop-blur-md z-10">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img src={otherParticipant?.avatar} className="w-10 h-10 rounded-xl object-cover" alt="" />
                </div>
                <div>
                  <h2 className="font-bold text-base text-white">{activeConversation.type === 'group' ? activeConversation.groupName : otherParticipant?.name}</h2>
                  <div className="flex items-center gap-1.5">
                    <p className="text-[11px] font-medium tracking-wide text-primary">
                      {isTyping ? 'typing...' : (otherParticipant?.status || 'online')}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-surface-dark text-slate-400 transition-colors">
                  <span className="material-icons-round">call</span>
                </button>
                <button className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-surface-dark text-slate-400 transition-colors">
                  <span className="material-icons-round">videocam</span>
                </button>
                <button className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-surface-dark text-slate-400 transition-colors">
                  <span className="material-icons-round">more_vert</span>
                </button>
              </div>
            </header>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6">
              {activeConversation.messages.map(msg => {
                const isMe = msg.senderId === currentUser?._id;
                const sender = activeConversation.participants.find(p => p._id === msg.senderId);
                return (
                  <div key={msg._id} className={`flex items-end gap-3 max-w-[75%] ${isMe ? 'ml-auto flex-row-reverse' : ''}`}>
                    <img 
                      src={sender?.avatar || 'https://picsum.photos/seed/user/200'} 
                      className="w-8 h-8 rounded-lg object-cover flex-shrink-0" 
                      alt="" 
                    />
                    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <div className={`p-4 rounded-2xl glass-effect border border-white/5 shadow-lg ${
                        isMe ? 'bg-accent-purple text-white rounded-br-none neon-purple-glow' : 'bg-surface-dark/80 text-slate-200 rounded-bl-none'
                      }`}>
                        <p className="text-sm leading-relaxed">{msg.text}</p>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-[10px] text-slate-500">{msg.timestamp}</span>
                        {isMe && <span className="material-icons-round text-[14px] text-primary">done_all</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
              {isTyping && (
                <div className="flex items-end gap-3 max-w-[70%]">
                  <div className="bg-surface-dark/80 text-slate-400 p-4 rounded-2xl rounded-bl-none flex gap-1">
                    <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce delay-75"></span>
                    <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce delay-150"></span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 bg-background-dark/50 backdrop-blur-lg">
              <div className="max-w-4xl mx-auto flex items-center gap-3 bg-surface-dark border border-border-dark p-2 rounded-2xl shadow-xl">
                <input 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 px-4 text-slate-200" 
                  placeholder="Type your message..." 
                />
                <button 
                  onClick={handleSendMessage}
                  className="w-11 h-11 flex items-center justify-center rounded-xl bg-primary text-white shadow-lg hover:shadow-primary/50 transition-all"
                >
                  <span className="material-icons-round">send</span>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center flex-col text-slate-500">
            <span className="material-icons-round text-6xl mb-4">forum</span>
            <p>Select a conversation to start chatting</p>
          </div>
        )}
      </main>

      {/* Right Detail Panel */}
      <aside className="w-80 hidden xl:flex flex-col border-l border-border-dark bg-surface-dark/20 p-8">
        {otherParticipant && (
          <>
            <div className="flex flex-col items-center text-center mb-10">
              <div className="relative mb-4">
                <img src={otherParticipant.avatar} className="w-24 h-24 rounded-3xl object-cover ring-4 ring-primary/20" alt="" />
              </div>
              <h2 className="text-xl font-bold text-white">{otherParticipant.name}</h2>
              <p className="text-xs text-slate-500 mt-1">{otherParticipant.role || 'Nexus Member'}</p>
            </div>
          </>
        )}
      </aside>

      {isSettingsOpen && currentUser && (
        <SettingsModal 
          user={currentUser} 
          onClose={() => setIsSettingsOpen(false)} 
          onSave={async (updatedUser) => {
            try {
              const { data } = await api.put('/auth/update-profile', updatedUser);
              dispatch(loginSuccess({ user: data, token: data.token }));
              setIsSettingsOpen(false);
            } catch (error) {
              console.error('Failed to update profile');
            }
          }} 
        />
      )}
      {isCreateGroupOpen && (
        <CreateGroupModal 
          friends={allUsers}
          onClose={() => setIsCreateGroupOpen(false)}
          onCreate={handleCreateGroup}
        />
      )}
    </div>
  );
};

export default App;