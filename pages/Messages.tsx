
import React, { useState, useMemo } from 'react';
import { Search, Send, User, ChevronLeft, MoreVertical, Paperclip, Smile, Image as ImageIcon, ShieldCheck, MessageCircle } from 'lucide-react';
import { storageService } from '../services/storageService.ts';

interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
}

interface Conversation {
  id: string;
  participant: {
    name: string;
    avatar: string;
    isVerified: boolean;
  };
  lastMessage: string;
  time: string;
  unread: number;
}

const Messages: React.FC = () => {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  
  const conversations: Conversation[] = [
    { id: 'c1', participant: { name: 'Faisal Property Hub', avatar: 'https://i.pravatar.cc/150?u=faisal', isVerified: true }, lastMessage: 'The villa is available for viewing on Saturday.', time: '10:42 AM', unread: 2 },
    { id: 'c2', participant: { name: 'Luxury Motors UAE', avatar: 'https://i.pravatar.cc/150?u=luxury', isVerified: true }, lastMessage: 'We can arrange a test drive for the G63.', time: 'Yesterday', unread: 0 },
    { id: 'c3', participant: { name: 'Saad Ahmed', avatar: 'https://i.pravatar.cc/150?u=saad', isVerified: false }, lastMessage: 'What is the final price for the iPhone 15?', time: '2 days ago', unread: 0 },
  ];

  const [activeMessages, setActiveMessages] = useState<ChatMessage[]>([
    { id: 'm1', senderId: 'other', text: 'Hi, I saw your listing for the DHA Villa.', timestamp: '10:30 AM' },
    { id: 'm2', senderId: 'me', text: 'Hello! Yes, it is currently available.', timestamp: '10:32 AM' },
    { id: 'm3', senderId: 'other', text: 'The villa is available for viewing on Saturday.', timestamp: '10:42 AM' },
  ]);

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      senderId: 'me',
      text: messageInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setActiveMessages([...activeMessages, newMsg]);
    setMessageInput('');
  };

  const activeChat = useMemo(() => conversations.find(c => c.id === selectedChat), [selectedChat]);

  return (
    <div className="h-[calc(100vh-140px)] flex bg-white rounded-[40px] shadow-3xl border border-emerald-50 overflow-hidden animate-in fade-in duration-500">
      
      {/* Sidebar: Conversation List */}
      <div className={`w-full md:w-80 lg:w-96 border-r border-emerald-50 flex flex-col ${selectedChat ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-6 border-b border-emerald-50">
          <h2 className="text-2xl font-serif-italic text-emerald-950 mb-6">Messages</h2>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              className="w-full bg-gray-50 rounded-2xl py-3 pl-12 pr-4 text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {conversations.map((chat) => (
            <button 
              key={chat.id}
              onClick={() => setSelectedChat(chat.id)}
              className={`w-full p-6 flex items-start gap-4 transition-all hover:bg-emerald-50/50 text-left border-b border-emerald-50/50 ${selectedChat === chat.id ? 'bg-emerald-50' : ''}`}
            >
              <div className="relative shrink-0">
                <img src={chat.participant.avatar} className="w-12 h-12 rounded-2xl object-cover" alt="" />
                {chat.unread > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-600 text-white text-[9px] font-black flex items-center justify-center rounded-full border-2 border-white">
                    {chat.unread}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="font-bold text-emerald-950 truncate">{chat.participant.name}</span>
                    {chat.participant.isVerified && <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                  </div>
                  <span className="text-[10px] text-gray-400 font-bold whitespace-nowrap">{chat.time}</span>
                </div>
                <p className="text-xs text-gray-500 line-clamp-1 font-medium">{chat.lastMessage}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Window */}
      <div className={`flex-1 flex flex-col bg-gray-50/30 ${!selectedChat ? 'hidden md:flex' : 'flex'}`}>
        {selectedChat && activeChat ? (
          <>
            {/* Chat Header */}
            <div className="p-5 bg-white border-b border-emerald-50 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-4">
                <button onClick={() => setSelectedChat(null)} className="md:hidden p-2 text-gray-400 hover:text-emerald-600 transition-colors">
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <img src={activeChat.participant.avatar} className="w-10 h-10 rounded-xl object-cover shadow-sm" alt="" />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-emerald-950">{activeChat.participant.name}</h3>
                    {activeChat.participant.isVerified && <ShieldCheck className="w-4 h-4 text-emerald-500" />}
                  </div>
                  <span className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">Active Now</span>
                </div>
              </div>
              <button className="p-2.5 text-gray-400 hover:bg-gray-100 rounded-xl transition-all">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
              {activeMessages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.senderId === 'me' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] space-y-1.5 ${msg.senderId === 'me' ? 'items-end' : 'items-start'}`}>
                    <div className={`px-6 py-4 rounded-[28px] text-sm leading-relaxed shadow-sm font-medium ${
                      msg.senderId === 'me' 
                      ? 'bg-emerald-600 text-white rounded-br-none' 
                      : 'bg-white text-emerald-950 rounded-bl-none'
                    }`}>
                      {msg.text}
                    </div>
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-2">{msg.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Input Footer */}
            <div className="p-6 bg-white border-t border-emerald-50">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <button className="p-2.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"><Paperclip className="w-5 h-5" /></button>
                  <button className="p-2.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"><ImageIcon className="w-5 h-5" /></button>
                </div>
                <div className="flex-1 relative">
                  <input 
                    type="text" 
                    placeholder="Type your message..." 
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="w-full bg-gray-50 rounded-2xl py-4 px-6 pr-12 outline-none text-sm font-medium focus:ring-2 focus:ring-emerald-500 transition-all border-none"
                  />
                  <button className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-yellow-500 transition-all">
                    <Smile className="w-5 h-5" />
                  </button>
                </div>
                <button 
                  onClick={handleSendMessage}
                  className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-600/20 hover:scale-105 active:scale-95 transition-all"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-emerald-50/20">
            <div className="w-24 h-24 bg-white rounded-[32px] flex items-center justify-center text-emerald-100 shadow-sm mb-6">
              <MessageCircle className="w-12 h-12" />
            </div>
            <h3 className="text-2xl font-serif-italic text-emerald-950 mb-2">Your Conversations</h3>
            <p className="text-gray-400 max-w-xs font-medium">Select a conversation from the left to start trading securely with verified participants.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
