import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, Send, User, ChevronLeft, MoreVertical, Paperclip, Smile, Image as ImageIcon, ShieldCheck, MessageCircle, Zap, Loader2 } from 'lucide-react';
import { storageService } from '../services/storageService.ts';
import { InternalMessage, User as UserType } from '../types.ts';
import { useNavigate } from 'react-router-dom';

const Messages: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = useMemo(() => storageService.getCurrentUser(), []);
  const [messages, setMessages] = useState<InternalMessage[]>([]);
  const [selectedConvoId, setSelectedConvoId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [search, setSearch] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentUser.id === 'guest') navigate('/auth?reason=msg_auth');
    
    const refreshData = () => {
      setMessages(storageService.getInternalMessages());
    };
    refreshData();
    window.addEventListener('storage', refreshData);
    return () => window.removeEventListener('storage', refreshData);
  }, [currentUser.id, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedConvoId]);

  // GROUP MESSAGES INTO CONVERSATIONS
  const conversations = useMemo(() => {
    const convoMap = new Map<string, {
      participantId: string;
      participantName: string;
      listingId: string;
      listingTitle: string;
      lastMessage: string;
      timestamp: string;
      unread: number;
    }>();

    messages.forEach(m => {
      const isMeSender = m.senderId === currentUser.id;
      const partnerId = isMeSender ? m.receiverId : m.senderId;
      const partnerName = isMeSender ? 'Merchant Node' : m.senderName;
      // Keyed by partner + listing to keep context clear
      const convoKey = `${partnerId}_${m.listingId}`;

      const existing = convoMap.get(convoKey);
      if (!existing || new Date(m.timestamp) > new Date(existing.timestamp)) {
        convoMap.set(convoKey, {
          participantId: partnerId,
          participantName: partnerName,
          listingId: m.listingId,
          listingTitle: m.listingTitle,
          lastMessage: m.text,
          timestamp: m.timestamp,
          unread: 0 
        });
      }
    });

    return Array.from(convoMap.entries()).map(([id, data]) => ({ id, ...data }))
      .filter(c => c.participantName.toLowerCase().includes(search.toLowerCase()) || c.listingTitle.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [messages, currentUser.id, search]);

  const activeConvo = useMemo(() => conversations.find(c => c.id === selectedConvoId), [conversations, selectedConvoId]);

  const activeMessages = useMemo(() => {
    if (!activeConvo) return [];
    return messages.filter(m => 
      (m.senderId === currentUser.id && m.receiverId === activeConvo.participantId && m.listingId === activeConvo.listingId) ||
      (m.senderId === activeConvo.participantId && m.receiverId === currentUser.id && m.listingId === activeConvo.listingId)
    ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [messages, activeConvo, currentUser.id]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !activeConvo) return;

    const newMsg: InternalMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      listingId: activeConvo.listingId,
      listingTitle: activeConvo.listingTitle,
      senderId: currentUser.id,
      senderName: currentUser.name,
      receiverId: activeConvo.participantId,
      text: messageInput,
      timestamp: new Date().toISOString()
    };

    await storageService.sendInternalMessage(newMsg);
    setMessageInput('');
  };

  return (
    <div className="h-[calc(100vh-140px)] flex bg-white rounded-[40px] shadow-3xl border border-emerald-50 overflow-hidden animate-in fade-in duration-500">
      <div className={`w-full md:w-80 lg:w-96 border-r border-emerald-50 flex flex-col ${selectedConvoId ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-6 border-b border-emerald-50">
          <h2 className="text-2xl font-serif-italic text-emerald-950 mb-6">Trade Transmissions</h2>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter intelligence..." className="w-full bg-gray-50 rounded-2xl py-3 pl-12 pr-4 text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {conversations.length > 0 ? conversations.map((convo) => (
            <button key={convo.id} onClick={() => setSelectedConvoId(convo.id)} className={`w-full p-6 flex items-start gap-4 transition-all hover:bg-emerald-50/50 text-left border-b border-emerald-50/50 ${selectedConvoId === convo.id ? 'bg-emerald-50' : ''}`}>
              <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 font-black shrink-0 shadow-sm">{convo.participantName.charAt(0)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-emerald-950 truncate">{convo.participantName}</span>
                  <span className="text-[9px] text-gray-400 font-bold uppercase whitespace-nowrap">{new Date(convo.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
                <p className="text-[9px] font-black uppercase text-emerald-600 mb-1 truncate">{convo.listingTitle}</p>
                <p className="text-xs text-gray-400 line-clamp-1 font-medium italic">"{convo.lastMessage}"</p>
              </div>
            </button>
          )) : (
            <div className="p-12 text-center text-gray-400 text-xs font-bold uppercase tracking-widest opacity-50">No Active Transmissions</div>
          )}
        </div>
      </div>

      <div className={`flex-1 flex flex-col bg-gray-50/30 ${!selectedConvoId ? 'hidden md:flex' : 'flex'}`}>
        {selectedConvoId && activeConvo ? (
          <>
            <div className="p-5 bg-white border-b border-emerald-50 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-4">
                <button onClick={() => setSelectedConvoId(null)} className="md:hidden p-2 text-gray-400 hover:text-emerald-600"><ChevronLeft className="w-6 h-6" /></button>
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 font-black">P</div>
                <div>
                  <div className="flex items-center gap-1.5"><h3 className="font-bold text-emerald-950">{activeConvo.participantName}</h3><ShieldCheck className="w-4 h-4 text-emerald-500" /></div>
                  <span className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">Listing: {activeConvo.listingTitle}</span>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
              {activeMessages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] space-y-1.5 ${msg.senderId === currentUser.id ? 'items-end' : 'items-start'}`}>
                    <div className={`px-6 py-4 rounded-[28px] text-sm leading-relaxed shadow-sm font-medium ${msg.senderId === currentUser.id ? 'bg-emerald-600 text-white rounded-br-none' : 'bg-white text-emerald-950 rounded-bl-none'}`}>{msg.text}</div>
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-2">{new Date(msg.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-6 bg-white border-t border-emerald-50">
              <div className="flex items-center gap-3">
                <input type="text" value={messageInput} onChange={(e) => setMessageInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Type your message..." className="flex-1 bg-gray-50 rounded-2xl py-4 px-6 outline-none text-sm font-medium focus:ring-2 focus:ring-emerald-500 transition-all" />
                <button onClick={handleSendMessage} className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all"><Send className="w-5 h-5" /></button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-emerald-50/20">
            <div className="w-24 h-24 bg-white rounded-[32px] flex items-center justify-center text-emerald-100 shadow-sm mb-6"><MessageCircle className="w-12 h-12" /></div>
            <h3 className="text-2xl font-serif-italic text-emerald-950 mb-2">Secure Message Node</h3>
            <p className="text-gray-400 max-w-xs font-medium">Select a conversation to begin high-fidelity trade communication.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;