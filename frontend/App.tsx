
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AppState, Conversation, Message, User } from './types';
import { MOCK_CURRENT_USER, INITIAL_CONVERSATIONS, MOCK_USERS } from './constants';
import { getGeminiResponse } from './services/geminiService';
import SettingsModal from './components/SettingsModal';
import CreateGroupModal from './components/CreateGroupModal';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    currentUser: MOCK_CURRENT_USER,
    conversations: INITIAL_CONVERSATIONS,
    activeConversationId: INITIAL_CONVERSATIONS[0].id,
    isSettingsOpen: false,
    isCreateGroupOpen: false,
    isLoggedIn: false,
    theme: 'dark'
  });

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.theme]);

  const activeConversation = state.conversations.find(c => c.id === state.activeConversationId);
  const otherParticipant = activeConversation?.participants[0];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [state.conversations, state.activeConversationId]);

  const handleSendMessage = useCallback(async () => {
    if (!inputText.trim() || !state.activeConversationId) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: 'me',
      text: inputText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent'
    };

    const updatedConversations = state.conversations.map(conv => {
      if (conv.id === state.activeConversationId) {
        return {
          ...conv,
          messages: [...conv.messages, newMessage],
          lastMessageTime: newMessage.timestamp
        };
      }
      return conv;
    });

    setState(prev => ({ ...prev, conversations: updatedConversations }));
    setInputText('');

    // Simulated AI response if chatting with Nexus Bot
    if (otherParticipant?.name === 'Nexus Bot') {
      setIsTyping(true);
      const response = await getGeminiResponse(inputText);
      setIsTyping(false);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        senderId: otherParticipant.id,
        text: response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'sent'
      };

      setState(prev => ({
        ...prev,
        conversations: prev.conversations.map(conv => {
          if (conv.id === state.activeConversationId) {
            return {
              ...conv,
              messages: [...conv.messages, aiMessage],
              lastMessageTime: aiMessage.timestamp
            };
          }
          return conv;
        })
      }));
    }
  }, [inputText, state.activeConversationId, state.conversations, otherParticipant]);

  const handleCreateGroup = (name: string, members: string[]) => {
    const selectedUsers = MOCK_USERS.filter(u => members.includes(u.id));
    const newConv: Conversation = {
      id: `group-${Date.now()}`,
      type: 'group',
      participants: selectedUsers,
      messages: [{
        id: 'msg-init',
        senderId: 'me',
        text: `Group ${name} created!`,
        timestamp: 'Just now',
        status: 'sent'
      }],
      unreadCount: 0,
      lastMessageTime: 'Just now'
    };
    setState(prev => ({
      ...prev,
      conversations: [newConv, ...prev.conversations],
      activeConversationId: newConv.id,
      isCreateGroupOpen: false
    }));
  };

  if (!state.isLoggedIn) {
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
              <button className="flex-1 py-2 text-sm font-semibold rounded-md bg-primary text-white shadow-sm transition-all">Login</button>
              <button className="flex-1 py-2 text-sm font-semibold rounded-md text-slate-400 hover:text-slate-200 transition-all">Sign Up</button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">Email Address</label>
                <div className="relative">
                  <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xl">alternate_email</span>
                  <input className="w-full pl-11 pr-4 py-3 bg-background-dark/50 border border-border-dark rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none text-white placeholder:text-slate-600" defaultValue="name@example.com" />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1.5 ml-1">
                  <label className="block text-sm font-medium text-slate-300">Password</label>
                  <button className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors">Forgot?</button>
                </div>
                <div className="relative">
                  <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xl">lock_open</span>
                  <input className="w-full pl-11 pr-12 py-3 bg-background-dark/50 border border-border-dark rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none text-white placeholder:text-slate-600" type="password" defaultValue="password123" />
                  <button className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-primary transition-colors">
                    <span className="material-icons-round text-xl">visibility</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center ml-1">
                <input className="w-4 h-4 rounded border-border-dark text-primary focus:ring-primary bg-transparent cursor-pointer" id="remember" type="checkbox" />
                <label className="ml-2 text-sm text-slate-400 cursor-pointer" htmlFor="remember">Stay logged in for 30 days</label>
              </div>

              <button 
                onClick={() => setState(prev => ({ ...prev, isLoggedIn: true }))}
                className="w-full bg-primary text-white font-bold py-3.5 rounded-lg shadow-lg hover:shadow-primary/40 transition-all duration-300 transform active:scale-[0.98] flex items-center justify-center gap-2 mt-4"
              >
                <span>Sign In</span>
                <span className="material-icons-round text-lg">login</span>
              </button>
            </div>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border-dark"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background-dark px-3 text-slate-500 font-semibold tracking-wider">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center py-2.5 px-4 rounded-lg bg-surface-dark/50 border border-border-dark text-slate-300 hover:bg-surface-dark transition-all">
                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDuTSoHytrUMzT3br_KWIHtkmipKX8Aabmdd7pS6DLtWNm1iNPN9ISjjC0qgI2_KnRmxAlKJHf5-7MYvgWYLwGLiUEh5s-dsNVc781CYlPqf_mGyjXlTAFfU8AfxqDsBA8vYwBrUD4C48-6ME6-I5J3XrWMMXhOnvNe8YGaChe4B36iy_ev1MDT7qFBAnBB33sGwhjKi5flDvTCTVhyvtBOL7qSDQI1wh3rKRv07oI8UwKe1N8w9ujHncyoEXRW0PmZ_XVb2V3ONkM" alt="G" className="w-5 h-5 mr-2" />
                <span className="text-sm font-semibold">Google</span>
              </button>
              <button className="flex items-center justify-center py-2.5 px-4 rounded-lg bg-surface-dark/50 border border-border-dark text-slate-300 hover:bg-surface-dark transition-all">
                <span className="material-icons-round text-xl mr-2">apple</span>
                <span className="text-sm font-semibold">Apple</span>
              </button>
            </div>
          </div>
          <p className="text-center mt-8 text-slate-500 text-sm">
            Don't have an account yet? 
            <button className="text-primary font-bold hover:underline ml-1">Create an account</button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background-dark">
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
                onClick={() => setState(prev => ({ ...prev, theme: prev.theme === 'dark' ? 'light' : 'dark' }))}
                className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all"
                title={`Switch to ${state.theme === 'dark' ? 'light' : 'dark'} mode`}
              >
                <span className="material-icons-round">{state.theme === 'dark' ? 'light_mode' : 'dark_mode'}</span>
              </button>
              <button 
                onClick={() => setState(prev => ({ ...prev, isSettingsOpen: true }))}
                className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all"
              >
                <span className="material-icons-round">edit_square</span>
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
          {state.conversations.map(conv => {
            const participant = conv.participants[0];
            const lastMsg = conv.messages[conv.messages.length - 1];
            const isActive = state.activeConversationId === conv.id;
            return (
              <div 
                key={conv.id}
                onClick={() => setState(prev => ({ ...prev, activeConversationId: conv.id }))}
                className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all group ${
                  isActive ? 'bg-primary/10 border border-primary/20' : 'hover:bg-background-dark/50'
                }`}
              >
                <div className="relative">
                  <img src={participant.avatar} className="w-12 h-12 rounded-xl object-cover" alt="" />
                  {participant.status === 'online' && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary border-2 border-surface-dark rounded-full shadow-lg"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <h3 className="font-semibold text-sm truncate text-white">{participant.name}</h3>
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
            onClick={() => setState(prev => ({ ...prev, isCreateGroupOpen: true }))}
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
                  {otherParticipant?.status === 'online' && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-primary border-2 border-surface-dark rounded-full"></div>
                  )}
                </div>
                <div>
                  <h2 className="font-bold text-base text-white">{otherParticipant?.name}</h2>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${otherParticipant?.status === 'online' ? 'bg-primary animate-pulse' : 'bg-slate-600'}`}></span>
                    <p className={`text-[11px] font-medium tracking-wide ${otherParticipant?.status === 'online' ? 'text-primary' : 'text-slate-500'}`}>
                      {isTyping ? 'typing...' : (otherParticipant?.status === 'online' ? 'online' : 'last seen recently')}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setState(prev => ({ ...prev, theme: prev.theme === 'dark' ? 'light' : 'dark' }))}
                  className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-surface-dark text-slate-400 transition-colors"
                  title={`Switch to ${state.theme === 'dark' ? 'light' : 'dark'} mode`}
                >
                  <span className="material-icons-round">{state.theme === 'dark' ? 'light_mode' : 'dark_mode'}</span>
                </button>
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
              <div className="flex justify-center">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-surface-dark/50 px-3 py-1 rounded-full">Conversation History</span>
              </div>
              
              {activeConversation.messages.map(msg => {
                const isMe = msg.senderId === 'me';
                return (
                  <div key={msg.id} className={`flex items-end gap-3 max-w-[75%] ${isMe ? 'ml-auto flex-row-reverse' : ''}`}>
                    <img 
                      src={isMe ? state.currentUser.avatar : otherParticipant?.avatar} 
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
                  <img src={otherParticipant?.avatar} className="w-8 h-8 rounded-lg object-cover flex-shrink-0" alt="" />
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
                <div className="flex items-center">
                  <button className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-background-dark text-slate-400 transition-colors">
                    <span className="material-icons-round">add_circle_outline</span>
                  </button>
                  <button className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-background-dark text-slate-400 transition-colors">
                    <span className="material-icons-round">mood</span>
                  </button>
                </div>
                <input 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 px-1 text-slate-200" 
                  placeholder="Type your message..." 
                />
                <div className="flex items-center gap-2">
                  <button className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-background-dark text-slate-400 transition-colors">
                    <span className="material-icons-round">mic_none</span>
                  </button>
                  <button 
                    onClick={handleSendMessage}
                    className="w-11 h-11 flex items-center justify-center rounded-xl bg-primary text-white shadow-lg hover:shadow-primary/50 transition-all"
                  >
                    <span className="material-icons-round">send</span>
                  </button>
                </div>
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
        <div className="flex flex-col items-center text-center mb-10">
          <div className="relative mb-4">
            <img src={otherParticipant?.avatar} className="w-24 h-24 rounded-3xl object-cover ring-4 ring-primary/20" alt="" />
            <div className={`absolute bottom-1 right-1 w-6 h-6 border-4 border-surface-dark rounded-full ${otherParticipant?.status === 'online' ? 'bg-primary' : 'bg-slate-600'}`}></div>
          </div>
          <h2 className="text-xl font-bold text-white">{otherParticipant?.name}</h2>
          <p className="text-xs text-slate-500 mt-1">{otherParticipant?.role || 'Nexus Member'} • {otherParticipant?.location || 'Unknown'}</p>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-4">Media & Files</h3>
            <div className="grid grid-cols-3 gap-2">
              <div className="aspect-square rounded-lg bg-surface-dark overflow-hidden border border-white/5">
                <img src="https://picsum.photos/seed/code1/100" className="w-full h-full object-cover" alt="" />
              </div>
              <div className="aspect-square rounded-lg bg-surface-dark overflow-hidden border border-white/5">
                <img src="https://picsum.photos/seed/desk1/100" className="w-full h-full object-cover" alt="" />
              </div>
              <div className="aspect-square rounded-lg bg-surface-dark flex items-center justify-center border border-white/5 cursor-pointer hover:bg-surface-dark/80 transition-colors">
                <span className="text-xs font-bold text-slate-400">+12</span>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Options</h3>
            <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-surface-dark transition-colors group">
              <span className="material-icons-round text-slate-400 group-hover:text-primary transition-colors">notifications_off</span>
              <span className="text-sm font-medium text-slate-300">Mute Notifications</span>
            </button>
            <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-surface-dark transition-colors group">
              <span className="material-icons-round text-slate-400 group-hover:text-primary transition-colors">block</span>
              <span className="text-sm font-medium text-slate-300">Block User</span>
            </button>
            <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-500/10 text-red-500 transition-colors group">
              <span className="material-icons-round">delete_outline</span>
              <span className="text-sm font-medium">Delete Conversation</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Modals */}
      {state.isSettingsOpen && (
        <SettingsModal 
          user={state.currentUser} 
          onClose={() => setState(prev => ({ ...prev, isSettingsOpen: false }))} 
          onSave={(u) => setState(prev => ({ ...prev, currentUser: u }))}
        />
      )}
      {state.isCreateGroupOpen && (
        <CreateGroupModal 
          friends={MOCK_USERS}
          onClose={() => setState(prev => ({ ...prev, isCreateGroupOpen: false }))}
          onCreate={handleCreateGroup}
        />
      )}
    </div>
  );
};

export default App;
