import React, { useState, useEffect, useRef } from 'react';
import { Search, Send, MessageSquare, Users, Clock, Menu, ArrowLeft, RefreshCw } from 'lucide-react';
import { useAppStore } from '../../store/AppStore';
import { getInitials } from '../../utils/avatarUtils';

interface ChatPageProps {
  onToggleSidebar?: () => void;
}

// Color palette for avatars
const AVATAR_COLORS = [
  { bg: 'bg-blue-500', text: 'text-white' }, // Blue
  { bg: 'bg-green-500', text: 'text-white' }, // Green
  { bg: 'bg-yellow-500', text: 'text-white' }, // Amber
  { bg: 'bg-red-500', text: 'text-white' }, // Red
  { bg: 'bg-purple-500', text: 'text-white' }, // Purple
  { bg: 'bg-orange-500', text: 'text-white' }, // Orange
  { bg: 'bg-cyan-500', text: 'text-white' }, // Cyan
  { bg: 'bg-pink-500', text: 'text-white' }, // Pink
  { bg: 'bg-lime-500', text: 'text-white' }, // Lime
  { bg: 'bg-indigo-500', text: 'text-white' }, // Indigo
  { bg: 'bg-rose-500', text: 'text-white' }, // Rose
  { bg: 'bg-teal-500', text: 'text-white' }, // Teal
];

// Helper function to get consistent color for a name
function getColorForName(name: string): { bg: string; text: string } {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

const ChatPage: React.FC<ChatPageProps> = ({ onToggleSidebar }) => {
  const [activeChat, setActiveChat] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  // const [searchTerm, setSearchTerm] = useState('');
  const [showChatView, setShowChatView] = useState(false);
  const pollingInitialized = useRef(false);

  const { 
    chats, 
    loading, 
    fetchChats, 
    sendMessage, 
    loadChatMessages, 
    markChatAsRead, 
    getChatById,
    startPolling,
    stopPolling
  } = useAppStore();

  const activeClient = activeChat ? getChatById(activeChat) : null;
  const messages = activeClient?.messages || [];

  // Load chats on component mount and start polling (once only)
  useEffect(() => {
    fetchChats();
    
    // Start polling only once
    if (!pollingInitialized.current) {
      startPolling();
      pollingInitialized.current = true;
    }
    
    // Cleanup function to stop polling when component unmounts
    return () => {
      if (pollingInitialized.current) {
        stopPolling();
        pollingInitialized.current = false;
      }
    };
  }, []); // Empty dependencies to run only once

  // Load messages when active chat changes
  useEffect(() => {
    if (activeChat) {
      loadChatMessages(activeChat);
      markChatAsRead(activeChat); // Mark as read when opened
    }
  }, [activeChat]); // Only depend on activeChat

  const handleSendMessage = async () => {
    if (message.trim() && activeChat) {
      try {
        await sendMessage(activeChat, message.trim(), 'admin');
        setMessage('');
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleChatSelect = (chatId: number) => {
    setActiveChat(chatId);
    setShowChatView(true);
  };

  const handleBackToList = () => {
    setShowChatView(false);
    setActiveChat(null);
  };

  const handleRefresh = async () => {
    if (activeChat) {
      await loadChatMessages(activeChat);
    }
    await fetchChats();
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // const formatDate = (timestamp: string) => {
  //   return new Date(timestamp).toLocaleDateString();
  // };

  return (
    <div className="p-4 lg:p-6 h-screen lg:h-[calc(100vh-8rem)]">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={onToggleSidebar}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-slate-900">Messages</h1>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 h-full lg:h-[calc(100vh-12rem)] flex flex-col lg:flex-row overflow-hidden">
        {/* Desktop Layout */}
        <div className="hidden lg:flex flex-1">
          {/* Chat List */}
          <div className="w-80 border-r border-slate-200 flex flex-col">
            <div className="p-4 border-b border-slate-200">
              <h2 className="font-semibold text-slate-900 mb-3">Messages</h2>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {loading.chats ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              ) : chats.length === 0 ? (
                <div className="p-4 text-center text-slate-500">
                  <p>No conversations yet</p>
                </div>
              ) : (
                chats.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => handleChatSelect(chat.id)}
                    className={`p-4 cursor-pointer border-b border-slate-100 hover:bg-slate-50 ${
                      activeChat === chat.id ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className={`w-12 h-12 ${getColorForName(chat.client).bg} rounded-full flex items-center justify-center ${getColorForName(chat.client).text} font-medium`}>
                          {getInitials(chat.client)}
                        </div>
                        {chat.online && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-slate-900 truncate">{chat.client}</h3>
                          <span className="text-xs text-slate-500">
                            {chat.lastMessageAt && formatTime(chat.lastMessageAt)}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 truncate">
                          {chat.lastMessage || 'No messages yet'}
                        </p>
                      </div>
                      {chat.unread_count > 0 && (
                        <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-xs text-white font-medium">{chat.unread_count}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chat Content */}
          <div className="flex-1 flex flex-col">
            {activeClient ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className={`w-10 h-10 ${getColorForName(activeClient.client).bg} rounded-full flex items-center justify-center ${getColorForName(activeClient.client).text} font-medium`}>
                        {getInitials(activeClient.client)}
                      </div>
                      {activeClient.online && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-900">{activeClient.client}</h3>
                      <p className="text-sm text-slate-500">
                        {activeClient.online ? 'Online' : 'Offline'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleRefresh}
                      className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Refresh messages"
                    >
                      <RefreshCw className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                      <MessageSquare className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                      <Users className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                      <Clock className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          msg.sender === 'admin'
                            ? 'bg-blue-500 text-white'
                            : 'bg-slate-100 text-slate-900'
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <p className={`text-xs mt-1 ${
                          msg.sender === 'admin' ? 'text-blue-100' : 'text-slate-500'
                        }`}>
                          {formatTime(msg.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-slate-200">
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                      <MessageSquare className="w-5 h-5" />
                    </button>
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type a message..."
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                    </div>
                    <button className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                      <Users className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleSendMessage}
                      disabled={!message.trim()}
                      className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-500">
                <div className="text-center">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-lg font-medium">Select a conversation</p>
                  <p className="text-sm">Choose a chat to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden flex flex-col h-full">
          {!showChatView ? (
            // Mobile Chat List
            <div className="flex-1 overflow-y-auto">
              {loading.chats ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              ) : chats.length === 0 ? (
                <div className="p-4 text-center text-slate-500">
                  <p>No conversations yet</p>
                </div>
              ) : (
                chats.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => handleChatSelect(chat.id)}
                    className="p-3 cursor-pointer border-b border-slate-100 hover:bg-slate-50"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className={`w-10 h-10 ${getColorForName(chat.client).bg} rounded-full flex items-center justify-center ${getColorForName(chat.client).text} font-medium text-sm`}>
                          {getInitials(chat.client)}
                        </div>
                        {chat.online && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-slate-900 truncate text-sm">{chat.client}</h3>
                          <span className="text-xs text-slate-500">
                            {chat.lastMessageAt && formatTime(chat.lastMessageAt)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 truncate">
                          {chat.lastMessage || 'No messages yet'}
                        </p>
                      </div>
                      {chat.unread_count > 0 && (
                        <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-xs text-white font-medium">{chat.unread_count}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            // Mobile Chat View
            <>
              {/* Mobile Chat Header */}
              <div className="p-3 border-b border-slate-200 flex items-center space-x-3">
                <button
                  onClick={handleBackToList}
                  className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center space-x-3 flex-1">
                  <div className="relative">
                    <div className={`w-8 h-8 ${getColorForName(activeClient?.client || '').bg} rounded-full flex items-center justify-center ${getColorForName(activeClient?.client || '').text} font-medium text-sm`}>
                      {getInitials(activeClient?.client || '')}
                    </div>
                    {activeClient?.online && (
                      <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-white"></div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900 text-sm">{activeClient?.client}</h3>
                    <p className="text-xs text-slate-500">
                      {activeClient?.online ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={handleRefresh}
                    className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Refresh messages"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                    <MessageSquare className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                    <Users className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Mobile Messages */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] px-3 py-2 rounded-lg ${
                        msg.sender === 'admin'
                          ? 'bg-blue-500 text-white'
                          : 'bg-slate-100 text-slate-900'
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <p className={`text-xs mt-1 ${
                        msg.sender === 'admin' ? 'text-blue-100' : 'text-slate-500'
                      }`}>
                        {formatTime(msg.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Mobile Message Input */}
              <div className="p-3 border-t border-slate-200">
                <div className="flex items-center space-x-2">
                  <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                    <MessageSquare className="w-4 h-4 text-slate-600" />
                  </button>
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type a message..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm bg-white"
                    />
                  </div>
                  <button
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                    className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;