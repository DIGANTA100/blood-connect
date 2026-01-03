import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, User as UserIcon, Phone, Clock, Circle, Search, X, AlertCircle, Users, Droplet, MapPin, Filter, ChevronLeft, Star, MessageSquare } from 'lucide-react';
import { User, BloodGroup } from '../types';
import { 
  getConversations, 
  getMessages, 
  sendMessage, 
  Conversation, 
  Message, 
  getAllUsers, 
  ChatUser, 
  createConversation,
  markAsRead 
} from '../services/chatService';

interface ChatProps {
  language: 'en' | 'bn';
  user: User;
}

type ViewMode = 'users' | 'conversations' | 'chat';

const Chat: React.FC<ChatProps> = ({ language, user }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [allUsers, setAllUsers] = useState<ChatUser[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [filterBloodGroup, setFilterBloodGroup] = useState<BloodGroup | 'ALL'>('ALL');
  const [viewMode, setViewMode] = useState<ViewMode>('conversations');
  const [showFilters, setShowFilters] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingInterval = useRef<number | null>(null);

  useEffect(() => {
    loadConversations();
    loadAllUsers();
    
    pollingInterval.current = setInterval(() => {
      loadConversations();
      if (selectedConversation) {
        loadMessages(selectedConversation.id);
      }
    }, 5000);

    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    try {
      const data = await getConversations();
      setConversations(data);
    } catch (error) {
      console.error('Load conversations error:', error);
    } finally {
      setLoading(false);
    }
  };

const loadAllUsers = async () => {
  try {
    const data = await getAllUsers();
    console.log('Fetched users:', data); // Debug log
    console.log('Current user ID:', user.id); // Debug log
   const filteredUsers = data.filter(u => u._id !== user._id);  // Changed id to _id
    console.log('Filtered users:', filteredUsers); // Debug log
    setAllUsers(filteredUsers);
  } catch (error) {
    console.error('Load users error:', error);
  }
};
  const loadMessages = async (conversationId: string) => {
    try {
      const data = await getMessages(conversationId);
      setMessages(data);
      await markAsRead(conversationId);
      loadConversations();
    } catch (error) {
      console.error('Load messages error:', error);
    }
  };

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    loadMessages(conversation.id);
    setViewMode('chat');
  };

  const handleStartChat = async (chatUser: ChatUser) => {
    try {
      setLoading(true);
      const conversation = await createConversation(chatUser._id);
      setSelectedConversation(conversation);
      await loadMessages(conversation.id);
      await loadConversations();
      setViewMode('chat');
    } catch (error) {
      console.error('Start chat error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedConversation || sending) return;

    setSending(true);
    try {
      const newMessage = await sendMessage(selectedConversation.id, messageInput.trim());
      setMessages([...messages, newMessage]);
      setMessageInput('');
      scrollToBottom();
      await loadConversations();
    } catch (error) {
      console.error('Send message error:', error);
    } finally {
      setSending(false);
    }
  };

  const filteredConversations = conversations.filter(conv => 
    conv.otherUser.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.otherUser.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.otherUser.bloodGroup?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = allUsers.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
                         u.email.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
                         u.district.toLowerCase().includes(userSearchQuery.toLowerCase());
    const matchesBloodGroup = filterBloodGroup === 'ALL' || u.bloodGroup === filterBloodGroup;
    return matchesSearch && matchesBloodGroup;
  });

  const bloodGroups: (BloodGroup | 'ALL')[] = ['ALL', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const labels = {
    title: { en: 'Messages', bn: 'বার্তা' },
    subtitle: { en: 'Connect with donors and hospitals', bn: 'দাতা এবং হাসপাতালের সাথে যোগাযোগ করুন' },
    search: { en: 'Search conversations...', bn: 'কথোপকথন খুঁজুন...' },
    searchUsers: { en: 'Search users...', bn: 'ব্যবহারকারী খুঁজুন...' },
    typeMessage: { en: 'Type your message...', bn: 'আপনার বার্তা টাইপ করুন...' },
    noConversations: { en: 'No conversations yet', bn: 'এখনো কোনো কথোপকথন নেই' },
    noUsers: { en: 'No users found', bn: 'কোনো ব্যবহারকারী পাওয়া যায়নি' },
    selectChat: { en: 'Select a conversation to start chatting', bn: 'চ্যাট শুরু করতে একটি কথোপকথন নির্বাচন করুন' },
    startNewChat: { en: 'Start a new conversation from the users list', bn: 'ব্যবহারকারী তালিকা থেকে একটি নতুন কথোপকথন শুরু করুন' },
    online: { en: 'Online', bn: 'অনলাইন' },
    offline: { en: 'Offline', bn: 'অফলাইন' },
    available: { en: 'Available', bn: 'উপলব্ধ' },
    unavailable: { en: 'Unavailable', bn: 'অনুপলব্ধ' },
    allUsers: { en: 'All Users', bn: 'সকল ব্যবহারকারী' },
    conversations: { en: 'Conversations', bn: 'কথোপকথন' },
    filters: { en: 'Filters', bn: 'ফিল্টার' },
    bloodGroup: { en: 'Blood Group', bn: 'রক্তের গ্রুপ' },
    points: { en: 'points', bn: 'পয়েন্ট' },
    startChat: { en: 'Start Chat', bn: 'চ্যাট শুরু করুন' },
    back: { en: 'Back', bn: 'ফিরে যান' }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) {
      const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return diffMinutes < 1 ? 'Just now' : `${diffMinutes}m ago`;
    } else if (diffHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const UserCard = ({ chatUser }: { chatUser: ChatUser }) => (
    <div className="p-4 bg-white border border-gray-100 rounded-2xl hover:shadow-lg transition-all group">
      <div className="flex items-start gap-3">
        <div className="relative">
          <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-md">
            {getInitials(chatUser.name)}
          </div>
          <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-md">
            <div className={`w-3 h-3 rounded-full ${chatUser.isAvailable ? 'bg-green-500' : 'bg-gray-400'}`}></div>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-black text-gray-900 truncate mb-1">{chatUser.name}</h3>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-1 px-2 py-1 bg-red-50 rounded-lg">
              <Droplet size={12} className="text-red-600" />
              <span className="text-xs font-black text-red-600">{chatUser.bloodGroup}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <MapPin size={12} />
              <span className="font-medium truncate">{chatUser.district}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${chatUser.isAvailable ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
              <Circle size={8} className={chatUser.isAvailable ? 'fill-green-500' : 'fill-gray-400'} />
              <span className="font-bold">{chatUser.isAvailable ? labels.available[language] : labels.unavailable[language]}</span>
            </div>
            <div className="flex items-center gap-1 text-amber-600">
              <Star size={12} className="fill-amber-500" />
              <span className="font-bold">{chatUser.points} {labels.points[language]}</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => handleStartChat(chatUser)}
          className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition-all active:scale-95 shadow-md opacity-0 group-hover:opacity-100"
        >
          <MessageSquare size={16} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-[calc(100vh-12rem)] bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden flex animate-in fade-in duration-500">
      {/* Users Discovery Panel */}
      <div className={`w-full md:w-80 border-r border-gray-100 flex flex-col bg-gray-50 ${viewMode !== 'users' && 'hidden md:flex'}`}>
        <div className="p-6 border-b border-gray-200 bg-gradient-to-br from-red-50 to-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-red-600 p-3 rounded-2xl shadow-lg">
              <Users className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900">{labels.allUsers[language]}</h2>
              <p className="text-xs text-gray-500 font-medium">{allUsers.length} {language === 'en' ? 'users available' : 'ব্যবহারকারী উপলব্ধ'}</p>
            </div>
          </div>
          
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder={labels.searchUsers[language]}
              value={userSearchQuery}
              onChange={(e) => setUserSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-red-500 focus:outline-none transition-all"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full flex items-center justify-between px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all"
          >
            <div className="flex items-center gap-2">
              <Filter size={16} />
              {labels.filters[language]}
            </div>
            {filterBloodGroup !== 'ALL' && (
              <span className="px-2 py-1 bg-red-100 text-red-600 rounded-lg text-xs">
                {filterBloodGroup}
              </span>
            )}
          </button>

          {showFilters && (
            <div className="mt-3 p-3 bg-white border border-gray-200 rounded-xl animate-in slide-in-from-top-2">
              <p className="text-xs font-black text-gray-500 uppercase mb-2">{labels.bloodGroup[language]}</p>
              <div className="grid grid-cols-3 gap-2">
                {bloodGroups.map(bg => (
                  <button
                    key={bg}
                    onClick={() => setFilterBloodGroup(bg)}
                    className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                      filterBloodGroup === bg
                        ? 'bg-red-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {bg}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <Users className="text-gray-400" size={24} />
              </div>
              <p className="text-sm font-bold text-gray-400">{labels.noUsers[language]}</p>
            </div>
          ) : (
            filteredUsers.map(chatUser => (
              <UserCard key={chatUser._id} chatUser={chatUser} />
            ))
          )}
        </div>
      </div>

      {/* Conversations Panel */}
      <div className={`w-full md:w-80 border-r border-gray-100 flex flex-col ${viewMode !== 'conversations' && 'hidden md:flex'}`}>
        <div className="p-6 border-b border-gray-200 bg-gradient-to-br from-blue-50 to-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-600 p-3 rounded-2xl shadow-lg">
              <MessageCircle className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900">{labels.conversations[language]}</h2>
              <p className="text-xs text-gray-500 font-medium">{conversations.length} {language === 'en' ? 'active chats' : 'সক্রিয় চ্যাট'}</p>
            </div>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder={labels.search[language]}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <MessageCircle className="text-gray-400" size={24} />
              </div>
              <p className="text-sm font-bold text-gray-400 mb-2">{labels.noConversations[language]}</p>
              <p className="text-xs text-gray-400">{labels.startNewChat[language]}</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredConversations.map(conv => (
                <div
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv)}
                  className={`p-4 cursor-pointer transition-all hover:bg-gray-50 ${
                    selectedConversation?.id === conv.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-black shadow-md">
                        {getInitials(conv.otherUser.name)}
                      </div>
                      <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                        conv.otherUser.isOnline ? 'bg-green-500' : 'bg-gray-400'
                      }`}></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <div>
                          <h3 className="font-black text-gray-900 truncate">{conv.otherUser.name}</h3>
                          {conv.otherUser.bloodGroup && (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600">
                              <Droplet size={10} />
                              {conv.otherUser.bloodGroup}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-bold text-gray-400">
                          {formatTime(conv.lastMessage?.timestamp || conv.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 font-medium truncate mb-1">
                        {conv.lastMessage?.content || 'No messages yet'}
                      </p>
                      {conv.unreadCount > 0 && (
                        <span className="inline-flex items-center justify-center px-2 py-1 bg-red-600 text-white text-[10px] font-black rounded-full">
                          {conv.unreadCount} new
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col ${viewMode !== 'chat' && 'hidden md:flex'}`}>
        {selectedConversation ? (
          <>
            <div className="p-6 border-b border-gray-100 bg-gradient-to-br from-gray-50 to-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setViewMode('conversations')}
                    className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronLeft size={20} className="text-gray-600" />
                  </button>
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-black shadow-md">
                      {getInitials(selectedConversation.otherUser.name)}
                    </div>
                    <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                      selectedConversation.otherUser.isOnline ? 'bg-green-500' : 'bg-gray-400'
                    }`}></div>
                  </div>
                  <div>
                    <h3 className="font-black text-gray-900">{selectedConversation.otherUser.name}</h3>
                    <div className="flex items-center gap-3 text-xs">
                      <div className="flex items-center gap-1">
                        <Circle 
                          size={8} 
                          className={selectedConversation.otherUser.isOnline ? 'text-green-500 fill-green-500' : 'text-gray-400 fill-gray-400'} 
                        />
                        <span className="font-medium text-gray-500">
                          {selectedConversation.otherUser.isOnline ? labels.online[language] : labels.offline[language]}
                        </span>
                      </div>
                      {selectedConversation.otherUser.bloodGroup && (
                        <div className="flex items-center gap-1 text-red-600">
                          <Droplet size={12} />
                          <span className="font-bold">{selectedConversation.otherUser.bloodGroup}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {selectedConversation.otherUser.phone && (
                    <a 
                      href={`tel:${selectedConversation.otherUser.phone}`}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Phone size={20} className="text-gray-600" />
                    </a>
                  )}
                  <button 
                    onClick={() => setSelectedConversation(null)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors md:hidden"
                  >
                    <X size={20} className="text-gray-600" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-br from-gray-50 to-white custom-scrollbar">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <MessageCircle className="text-gray-300 mx-auto mb-3" size={48} />
                    <p className="text-sm font-bold text-gray-400">Start the conversation!</p>
                  </div>
                </div>
              ) : (
                messages.map((msg, index) => {
                  
const isOwn = msg.senderId === user._id;
                  const showDate = index === 0 || 
                    new Date(messages[index - 1].timestamp).toDateString() !== new Date(msg.timestamp).toDateString();

                  return (
                    <div key={msg.id}>
                      {showDate && (
                        <div className="flex justify-center mb-4">
                          <span className="bg-white px-4 py-2 rounded-full text-[10px] font-black text-gray-400 uppercase shadow-sm border border-gray-100">
                            {formatTime(msg.timestamp)}
                          </span>
                        </div>
                      )}
                      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
                        <div className={`max-w-[75%] ${isOwn ? 'order-2' : 'order-1'}`}>
                          <div
                            className={`p-4 rounded-2xl shadow-md ${
                              isOwn
                                ? 'bg-gradient-to-br from-red-600 to-red-700 text-white rounded-br-none'
                                : 'bg-white text-gray-900 border border-gray-100 rounded-bl-none'
                            }`}
                          >
                            <p className="text-sm font-medium leading-relaxed break-words">{msg.content}</p>
                          </div>
                          <div className={`flex items-center gap-1 mt-1 px-2 text-[10px] font-bold text-gray-400 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                            <Clock size={10} />
                            <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            {isOwn && msg.read && (
                              <span className="text-blue-500 ml-1">✓✓</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-gray-100 bg-white">
              <form onSubmit={handleSendMessage} className="flex items-end gap-3">
                <div className="flex-1">
                  <textarea
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                    placeholder={labels.typeMessage[language]}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-red-500 focus:outline-none transition-all resize-none"
                    rows={1}
                    disabled={sending}
                  />
                </div>
                <button
                  type="submit"
                  disabled={!messageInput.trim() || sending}
                  className="bg-gradient-to-br from-red-600 to-red-700 text-white p-4 rounded-2xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow-md"
                >
                  <Send size={20} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-gray-50 to-white">
            <div className="bg-white p-10 rounded-3xl shadow-lg border border-gray-100">
              <MessageCircle className="text-gray-300 mx-auto mb-4" size={64} />
              <h3 className="font-black text-gray-900 text-xl mb-2">{labels.title[language]}</h3>
              <p className="text-sm font-medium text-gray-500 mb-4">{labels.selectChat[language]}</p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setViewMode('users')}
                  className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition-all active:scale-95 shadow-md md:hidden"
                >
                  Browse Users
                </button>
                <button
                  onClick={() => setViewMode('conversations')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all active:scale-95 shadow-md md:hidden"
                >
                  View Chats
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile View Mode Switcher */}
      <div className="md:hidden fixed bottom-20 left-1/2 -translate-x-1/2 z-50">
        <div className="flex gap-2 bg-white rounded-full shadow-xl border border-gray-200 p-2">
          <button
            onClick={() => setViewMode('users')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              viewMode === 'users' ? 'bg-red-600 text-white' : 'text-gray-600'
            }`}
          >
            <Users size={18} />
          </button>
          <button
            onClick={() => setViewMode('conversations')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              viewMode === 'conversations' ? 'bg-blue-600 text-white' : 'text-gray-600'
            }`}
          >
            <MessageCircle size={18} />
          </button>
        </div>
      </div>

      <style >{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default Chat;