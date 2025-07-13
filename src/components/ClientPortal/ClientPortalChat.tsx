import React, { useState, useEffect } from 'react';
import { ArrowLeft, Send, Paperclip, Smile, RefreshCw } from 'lucide-react';
import { useAppStore } from '../../store/AppStore';
import { getInitials } from '../../utils/avatarUtils';

interface ClientPortalChatProps {
  user: any;
  onBack: () => void;
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

const ClientPortalChat: React.FC<ClientPortalChatProps> = ({ user, onBack }) => {
  const [message, setMessage] = useState('');

  const { 
    clients, 
    chats, 
    loading,
    fetchChats,
    sendMessage, 
    loadChatMessages, 
    markChatAsRead, 
    createChatForClient,
    startPolling,
    stopPolling,
    isPolling
  } = useAppStore();

  // Find the client data based on the user email
  const client = clients.find(c => c.email === user.email);
  let clientChat = chats.find(chat => chat.clientId === client?.id);

  // Load chats on component mount and start polling
  useEffect(() => {
    fetchChats();
    if (!isPolling) {
      startPolling();
    }
    
    // Cleanup function to stop polling when component unmounts
    return () => {
      stopPolling();
    };
  }, [fetchChats, startPolling, stopPolling, isPolling]);

  // Create chat if it doesn't exist
  useEffect(() => {
    if (client && !clientChat && !loading.chats) {
      createChatForClient(client.id);
    }
  }, [client, clientChat, loading.chats, createChatForClient]);

  // Load messages when chat is available
  useEffect(() => {
    if (clientChat) {
      console.log('Loading messages for chat:', clientChat.id);
      loadChatMessages(clientChat.id);
      markChatAsRead(clientChat.id); // Mark as read when opened
    }
  }, [clientChat?.id, loadChatMessages, markChatAsRead]); // Include clientChat.id in dependency

  const handleSendMessage = async () => {
    if (message.trim() && clientChat) {
      try {
        await sendMessage(clientChat.id, message.trim(), 'client');
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

  const handleRefresh = async () => {
    if (clientChat) {
      await loadChatMessages(clientChat.id);
      await fetchChats();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString();
  };

  if (!client) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Client data not found</h2>
          <p className="text-slate-600 mb-4">Unable to load client information</p>
          <button 
            onClick={onBack}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  if (loading.chats) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  // Update clientChat reference after state changes
  clientChat = chats.find(chat => chat.clientId === client?.id);

  if (!clientChat) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Initializing chat...</h2>
          <p className="text-slate-600 mb-4">Please wait while we set up your chat</p>
          <button 
            onClick={onBack}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 lg:px-8 py-4 flex-shrink-0">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-slate-900">Chat with Team</h1>
              <p className="text-sm text-slate-600">
                {clientChat.online ? 'Team is online' : 'Team will respond soon'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${clientChat.online ? 'bg-green-500' : 'bg-slate-300'}`}></div>
              <span className="text-sm text-slate-600">
                {clientChat.online ? 'Online' : 'Offline'}
              </span>
            </div>
            <button
              onClick={handleRefresh}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              title="Refresh messages"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 max-w-4xl mx-auto w-full flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-4">
          {/* Debug info */}
          {process.env.NODE_ENV === 'development' && (
            <div className="text-xs text-slate-400 mb-2">
              Debug: Chat ID: {clientChat?.id}, Messages: {clientChat?.messages?.length || 0}
            </div>
          )}
          
          {clientChat?.messages && clientChat.messages.length > 0 ? (
            clientChat.messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'client' ? 'justify-end' : 'justify-start'}`}
              >
                <div className="flex items-start space-x-2 max-w-xs lg:max-w-md">
                  {msg.sender === 'admin' && (
                    <div className={`w-8 h-8 ${getColorForName('Admin Team').bg} rounded-full flex items-center justify-center ${getColorForName('Admin Team').text} font-medium text-sm flex-shrink-0`}>
                      {getInitials('Admin Team')}
                    </div>
                  )}
                  <div
                    className={`px-4 py-2 rounded-lg ${
                      msg.sender === 'client'
                        ? 'bg-blue-500 text-white'
                        : 'bg-white text-slate-900 border border-slate-200'
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <p className={`text-xs mt-1 ${
                      msg.sender === 'client' ? 'text-blue-100' : 'text-slate-500'
                    }`}>
                      {formatTime(msg.created_at)}
                    </p>
                  </div>
                  {msg.sender === 'client' && (
                    <div className={`w-8 h-8 ${getColorForName(client.name).bg} rounded-full flex items-center justify-center ${getColorForName(client.name).text} font-medium text-sm flex-shrink-0`}>
                      {getInitials(client.name)}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-lg font-medium text-slate-900">No messages yet</p>
                <p className="text-sm text-slate-600">Start a conversation with your team</p>
              </div>
            </div>
          )}
        </div>

        {/* Message Input */}
        <div className="bg-white border-t border-slate-200 p-4 lg:p-8">
          <div className="flex items-center space-x-3">
            <button className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
              <Paperclip className="w-5 h-5" />
            </button>
            <div className="flex-1 relative">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm bg-white"
              />
            </div>
            <button className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
              <Smile className="w-5 h-5" />
            </button>
            <button
              onClick={handleSendMessage}
              disabled={!message.trim()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientPortalChat;