import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { ArrowLeft, Send, RefreshCw, UploadCloud, FileText, X } from 'lucide-react';
import { useAppStore } from '../../store/AppStore';
import { getInitials } from '../../utils/avatarUtils';

interface ClientPortalChatProps {
  user: any;
  onBack: () => void;
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

const ClientPortalChat: React.FC<ClientPortalChatProps> = ({ user, onBack }) => {
  const [message, setMessage] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

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
    isPolling,
    getClientRole
  } = useAppStore();

  // Find the client data based on the user email
  const client = clients.find(c => c.email === user.email);
  let clientChat = chats.find(chat => chat.clientId === client?.id);

  // Memoize messages to prevent unnecessary re-renders
  const memoizedMessages = useMemo(() => {
    return clientChat?.messages || [];
  }, [clientChat?.messages]);

  // Load chats on component mount and start polling
  useEffect(() => {
    fetchChats();
    if (!isPolling) {
      startPolling();
    }
    
    // Cleanup function to stop polling when component unmounts
    return () => {
      // Don't stop polling completely as other components might need it
      // Just reduce polling frequency when chat client is not active
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
      loadChatMessages(clientChat.id);
      markChatAsRead(clientChat.id); // Mark as read when opened
    }
  }, [clientChat?.id, loadChatMessages, markChatAsRead]);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (memoizedMessages.length > 0) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [memoizedMessages]);

  const handleSendMessage = async () => {
    if ((message.trim() || attachment) && clientChat && !isSending) {
      try {
        setIsSending(true);
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
        
        const messageText = message.trim() || 'Sent an attachment';
        
        // Clear input IMMEDIATELY before doing anything else
        setMessage('');
        setAttachment(null);
        
        // Focus back to input
        setTimeout(() => {
          inputRef.current?.focus();
        }, 50);
        
        // Scroll to bottom after sending message
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 200);
        
        // Send message with attachment
        await sendMessage(clientChat.id, messageText, 'client', attachmentUrl);
        
        // Reload messages to show the new message with attachment
        await loadChatMessages(clientChat.id);
        
      } catch (error) {
        console.error('Error sending message:', error);
        alert('Failed to send message. Please try again.');
      } finally {
        setIsSending(false);
        setIsUploading(false);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isSending) {
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

  const formatTime = useCallback((timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, []);

  const formatDate = useCallback((timestamp: string) => {
    return new Date(timestamp).toLocaleDateString();
  }, []);

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
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 p-4 lg:p-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-slate-900">Chat with Support</h1>
              <p className="text-sm text-slate-600">Get help from our team</p>
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
          
          {memoizedMessages && memoizedMessages.length > 0 ? (
            <>
              {memoizedMessages.map((msg) => (
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
                      } ${msg.id > 999999999 ? 'opacity-75 border-dashed' : ''}`}
                    >
                      {/* Show sender info for all messages */}
                      {msg.sender === 'admin' && (
                        <div className="text-xs font-medium mb-1 text-slate-600">
                          Admin Team - Support
                        </div>
                      )}
                      {msg.sender === 'client' && (
                        <div className="text-xs font-medium mb-1 text-blue-100">
                          {getClientRole(client.id)} - {client.name}
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
                              msg.sender === 'client' 
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
                        msg.sender === 'client' ? 'text-blue-100' : 'text-slate-500'
                      }`}>
                        {formatTime(msg.created_at)}
                        {msg.id > 999999999 && (
                          <span className="ml-2 text-blue-200 animate-pulse">• sending</span>
                        )}
                      </p>
                    </div>
                    {msg.sender === 'client' && (
                      <div className={`w-8 h-8 ${getColorForName(client.name).bg} rounded-full flex items-center justify-center ${getColorForName(client.name).text} font-medium text-sm flex-shrink-0`}>
                        {getInitials(client.name)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
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
          
          <div className="flex items-center space-x-3">
            {/* File upload button */}
            <div className="relative">
              <input
                type="file"
                onChange={handleFileChange}
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                className="hidden"
                id="client-chat-attachment"
                disabled={isSending || isUploading}
              />
              <label htmlFor="client-chat-attachment" className="cursor-pointer p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50">
                <UploadCloud className="w-5 h-5" />
              </label>
            </div>
            
            <div className="flex-1">
              <input
                ref={inputRef}
                type="text"
                value={message}
                onChange={e => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={isSending || isUploading}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm bg-white disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={(!message.trim() && !attachment) || isSending || isUploading}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isSending || isUploading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">{isSending || isUploading ? 'Sending...' : 'Send'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientPortalChat;