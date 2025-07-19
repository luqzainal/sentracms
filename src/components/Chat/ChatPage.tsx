import React, { useState, useEffect, useRef, memo } from 'react';
import { Search, Send, MessageSquare, Users, Clock, Menu, ArrowLeft, RefreshCw, UploadCloud, FileText, X } from 'lucide-react';
import { useAppStore } from '../../store/AppStore';
import { getInitials } from '../../utils/avatarUtils';

interface ChatPageProps {
  onToggleSidebar?: () => void;
}

// Helper function to get color for avatar
const getColorForName = (name: string) => {
  const colors = [
    { bg: 'bg-blue-500', text: 'text-white' },
    { bg: 'bg-green-500', text: 'text-white' },
    { bg: 'bg-purple-500', text: 'text-white' },
    { bg: 'bg-pink-500', text: 'text-white' },
    { bg: 'bg-indigo-500', text: 'text-white' },
    { bg: 'bg-yellow-500', text: 'text-white' },
    { bg: 'bg-red-500', text: 'text-white' },
    { bg: 'bg-teal-500', text: 'text-white' },
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

// MessageList komponen memoized
const MessageList = memo(({ messages, isAdmin, clientName, clientId }: { messages: any[]; isAdmin: boolean; clientName?: string; clientId?: number }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { user, getClientRole } = useAppStore();
  
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length > 0 ? messages[messages.length - 1]?.id : null]);

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex ${msg.sender === (isAdmin ? 'admin' : 'client') ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
              msg.sender === (isAdmin ? 'admin' : 'client')
                ? 'bg-blue-500 text-white'
                : 'bg-slate-100 text-slate-900'
            }`}
          >
            {/* Show sender info for all messages */}
            {msg.sender === 'admin' && (
              <div className={`text-xs font-medium mb-1 ${
                msg.sender === (isAdmin ? 'admin' : 'client') ? 'text-blue-100' : 'text-slate-600'
              }`}>
                {user?.role} - {user?.name}
              </div>
            )}
            {msg.sender === 'client' && (
              <div className={`text-xs font-medium mb-1 ${
                msg.sender === (isAdmin ? 'admin' : 'client') ? 'text-blue-100' : 'text-slate-600'
              }`}>
                {clientId ? getClientRole(clientId) : 'Client'} - {clientName || 'Unknown Client'}
              </div>
            )}
            <p className="text-sm">{msg.content}</p>
            
            {/* Show attachment if exists */}
            {msg.attachmentUrl && (
              <div className="mt-2">
                <a
                  href={msg.attachmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-xs flex items-center space-x-1 ${
                    msg.sender === (isAdmin ? 'admin' : 'client') 
                      ? 'text-blue-100 hover:text-blue-200' 
                      : 'text-blue-600 hover:text-blue-800'
                  }`}
                >
                  <FileText className="w-3 h-3" />
                  <span>View attachment</span>
                </a>
              </div>
            )}
            
            <p className={`text-xs mt-1 ${
              msg.sender === (isAdmin ? 'admin' : 'client') ? 'text-blue-100' : 'text-slate-500'
            }`}>
              {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
});

const ChatPage: React.FC<ChatPageProps> = ({ onToggleSidebar }) => {
  const [activeChat, setActiveChat] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
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
    if ((message.trim() || attachment) && activeChat) {
      try {
        setIsUploading(true);
        let attachmentUrl = '';
        
        // Upload attachment if present
        if (attachment) {
          console.log('🔄 Uploading chat attachment:', attachment.name);
          
          // 1. Get pre-signed URL from our API
          const res = await fetch('/api/generate-upload-url', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              fileName: attachment.name, 
              fileType: attachment.type 
            }),
          });

          if (!res.ok) {
            const errorText = await res.text();
            console.error('❌ API Error:', errorText);
            throw new Error(`Failed to get upload URL: ${res.status} ${errorText}`);
          }

          const responseData = await res.json();
          const { uploadUrl, fileUrl } = responseData;
          
          if (!uploadUrl || !fileUrl) {
            throw new Error('Invalid response: missing uploadUrl or fileUrl');
          }

          // 2. Upload file to DigitalOcean Spaces
          console.log('📤 Starting file upload to DigitalOcean Spaces...');
          await new Promise<void>((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('PUT', uploadUrl, true);
            
            xhr.onload = async () => {
              console.log('📡 Upload response status:', xhr.status);
              if (xhr.status === 200) {
                console.log('✅ File uploaded successfully!');
                attachmentUrl = fileUrl;
                resolve();
              } else {
                console.error('❌ Upload failed with status:', xhr.status);
                console.error('❌ Upload response:', xhr.responseText);
                reject(new Error(`Upload failed with status ${xhr.status}`));
              }
            };

            xhr.onerror = (error) => {
              console.error('❌ Network error during upload:', error);
              reject(new Error('Network error during upload.'));
            };
            
            console.log('📤 Sending file to DigitalOcean Spaces...');
            xhr.send(attachment);
          });
        }
        
        // Send message with attachment
        await sendMessage(activeChat, message.trim() || 'Sent an attachment', 'admin', attachmentUrl);
        
        // Clear form after successful send
        setMessage('');
        setAttachment(null);
        
        // Reload messages to show the new message with attachment
        await loadChatMessages(activeChat);
        
      } catch (error) {
        console.error('Error sending message:', error);
        alert('Failed to send message. Please try again.');
      } finally {
        setIsUploading(false);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      setAttachment(file);
    }
  };

  const removeAttachment = () => {
    setAttachment(null);
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
              {chats.length === 0 ? (
                <div className="p-4 text-center text-slate-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-2 text-slate-300" />
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
                  </div>
                </div>

                {/* Messages */}
                <MessageList messages={messages} isAdmin={true} clientName={activeClient?.client} clientId={activeClient?.clientId} />

                {/* Message Input */}
                <div className="p-4 border-t border-slate-200">
                  {/* Show attachment if selected */}
                  {attachment && (
                    <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-blue-600" />
                          <span className="text-sm text-blue-700">{attachment.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={removeAttachment}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2">
                    {/* File upload button */}
                    <div className="relative">
                      <input
                        type="file"
                        onChange={handleFileChange}
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                        className="hidden"
                        id="chat-attachment"
                        disabled={isUploading}
                      />
                      <label htmlFor="chat-attachment" className="cursor-pointer p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50">
                        <UploadCloud className="w-5 h-5" />
                      </label>
                    </div>
                    
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type a message..."
                        disabled={isUploading}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:opacity-50"
                      />
                    </div>
                    <button
                      onClick={handleSendMessage}
                      disabled={(!message.trim() && !attachment) || isUploading}
                      className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUploading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
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
        <div className="lg:hidden flex-1 flex flex-col">
          {!showChatView ? (
            // Mobile Chat List
            <div className="flex-1 overflow-y-auto">
              {chats.length === 0 ? (
                <div className="p-4 text-center text-slate-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-2 text-slate-300" />
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
                </div>
              </div>

              {/* Mobile Messages */}
              {showChatView && (
                <MessageList messages={messages} isAdmin={true} clientName={activeClient?.client} clientId={activeClient?.clientId} />
              )}

              {/* Mobile Message Input */}
              <div className="p-3 border-t border-slate-200">
                {/* Show attachment if selected */}
                {attachment && (
                  <div className="mb-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-3 h-3 text-blue-600" />
                        <span className="text-xs text-blue-700">{attachment.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={removeAttachment}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center space-x-2">
                  {/* File upload button */}
                  <div className="relative">
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                      className="hidden"
                      id="chat-attachment-mobile"
                      disabled={isUploading}
                    />
                    <label htmlFor="chat-attachment-mobile" className="cursor-pointer p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50">
                      <UploadCloud className="w-4 h-4" />
                    </label>
                  </div>
                  
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type a message..."
                      disabled={isUploading}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm bg-white disabled:opacity-50"
                    />
                  </div>
                  <button
                    onClick={handleSendMessage}
                    disabled={(!message.trim() && !attachment) || isUploading}
                    className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUploading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
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