import React, { useState, useEffect, useCallback, useMemo, memo, useRef } from 'react';
import { ArrowLeft, Send, RefreshCw, Paperclip, X, Download } from 'lucide-react';
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

// Helper function to get file icon
function getFileIcon(fileType: string) {
  if (fileType.startsWith('image/')) {
    return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>;
  }
  return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>;
}

// Helper function to format file size
function formatFileSize(bytes: number) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

const ClientPortalChat: React.FC<ClientPortalChatProps> = ({ user, onBack }) => {
  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  const client = clients.length > 0 ? clients[0] : null;
  let clientChat = chats.find(chat => chat.clientId === client?.id);

  // Memoize messages to prevent unnecessary re-renders
  const memoizedMessages = useMemo(() => {
    return clientChat?.messages || [];
  }, [clientChat?.messages]);

  // Load chats on component mount and start polling
  useEffect(() => {
    if (!isPolling) {
      startPolling();
    }
    
    // Cleanup function to stop polling when component unmounts
    return () => {
      // Don't stop polling completely as other components might need it
      // Just reduce polling frequency when chat client is not active
    };
  }, [startPolling, stopPolling, isPolling]);

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
      markChatAsRead(clientChat.id, 'client'); // Mark as read when opened (client user type)
    }
  }, [clientChat?.id, loadChatMessages, markChatAsRead]); // Include clientChat.id in dependency

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (memoizedMessages.length > 0) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [memoizedMessages]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadFile = async (file: File): Promise<string> => {
    try {
      // Generate upload URL
      const response = await fetch('/api/generate-upload-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate upload URL');
      }

      const { uploadUrl, publicUrl } = await response.json();

      // Upload file to S3
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file');
      }

      return publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  };

  const handleFileDownload = (attachmentUrl: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = attachmentUrl;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSendMessage = async () => {
    if ((!message.trim() && !selectedFile) || !clientChat || isSending) return;

    setIsSending(true);
    setIsUploading(true);
    
    try {
      let attachmentUrl: string | undefined;
      let messageType: 'text' | 'file' | 'image' = 'text';
      let attachmentName: string | undefined;
      let attachmentType: string | undefined;
      let attachmentSize: number | undefined;

      // Upload file if selected
      if (selectedFile) {
        attachmentUrl = await uploadFile(selectedFile);
        attachmentName = selectedFile.name;
        attachmentType = selectedFile.type;
        attachmentSize = selectedFile.size;
        
        // Determine message type
        if (selectedFile.type.startsWith('image/')) {
          messageType = 'image';
        } else {
          messageType = 'file';
        }
      }

      // Send message with attachment
      await sendMessage(clientChat.id, message.trim() || (selectedFile ? `Sent ${selectedFile.name}` : ''), 'client', {
        messageType,
        attachmentUrl,
        attachmentName,
        attachmentType,
        attachmentSize
      });

      // Clear input and file
      setMessage('');
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Focus back to input
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      
      // Scroll to bottom after sending message
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 200);
      
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
      setIsUploading(false);
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

  const formatTime = useCallback((timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, []);

  const formatDate = useCallback((timestamp: string) => {
    return new Date(timestamp).toLocaleDateString();
  }, []);

  if (!client) {
    return (
      <div className="bg-slate-50 flex items-center justify-center p-4">
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

  // Update clientChat reference after state changes
  clientChat = chats.find(chat => chat.clientId === client?.id);

  if (!clientChat) {
    return (
      <div className="bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Chat not found</h2>
          <p className="text-slate-600 mb-4">Unable to load chat information</p>
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
    <div className="bg-slate-50 flex flex-col h-screen">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-slate-900">Chat with Team</h1>
              <p className="text-sm text-slate-600">
                {clientChat.online ? 'Team is online' : 'Team will respond soon'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${clientChat.online ? 'bg-green-500' : 'bg-slate-300'}`}></div>
              <span className="text-sm text-slate-600">
                {clientChat.online ? 'Online' : 'Offline'}
              </span>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-600">Live</span>
              </div>
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
      <div className="flex-1 flex flex-col min-h-0">
        {/* Messages - Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
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
                      className={`px-3 py-2 rounded-lg ${
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
                      
                      {/* Message content */}
                      {msg.message_type === 'text' && (
                        <p className="text-sm">{msg.content}</p>
                      )}
                      
                      {/* File attachment */}
                      {msg.message_type === 'file' && msg.attachment_url && (
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2 p-2 bg-white bg-opacity-20 rounded-lg">
                            {getFileIcon(msg.attachment_type || '')}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{msg.attachment_name || 'File'}</p>
                              {msg.attachment_size && (
                                <p className="text-xs opacity-75">{formatFileSize(msg.attachment_size)}</p>
                              )}
                            </div>
                            <button
                              onClick={() => msg.attachment_url && handleFileDownload(msg.attachment_url, msg.attachment_name || 'file')}
                              className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
                              title="Download file"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                          {msg.content && <p className="text-sm">{msg.content}</p>}
                        </div>
                      )}
                      
                      {/* Image attachment */}
                      {msg.message_type === 'image' && msg.attachment_url && (
                        <div className="space-y-2">
                          <div className="relative">
                            <img 
                              src={msg.attachment_url} 
                              alt={msg.attachment_name || 'Image'} 
                              className="max-w-full max-h-64 h-auto rounded-lg cursor-pointer object-cover"
                              onClick={() => window.open(msg.attachment_url, '_blank')}
                            />
                            <button
                              onClick={() => msg.attachment_url && handleFileDownload(msg.attachment_url, msg.attachment_name || 'image')}
                              className="absolute top-2 right-2 p-1 bg-black bg-opacity-50 text-white rounded hover:bg-opacity-70 transition-colors"
                              title="Download image"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                          {msg.content && <p className="text-sm">{msg.content}</p>}
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
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Send className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-base font-medium text-slate-900">No messages yet</p>
                <p className="text-sm text-slate-600">Start a conversation with your team</p>
              </div>
            </div>
          )}
        </div>

        {/* Message Input - Fixed at Bottom */}
        <div className="bg-white border-t border-slate-200 p-4 flex-shrink-0">
          {/* File Preview */}
          {selectedFile && (
            <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getFileIcon(selectedFile.type)}
                  <div>
                    <p className="text-sm font-medium text-blue-900">{selectedFile.name}</p>
                    <p className="text-xs text-blue-700">{formatFileSize(selectedFile.size)}</p>
                  </div>
                </div>
                <button
                  onClick={handleRemoveFile}
                  className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
          
          <div className="flex items-center space-x-3">
            {/* File Upload Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isSending || isUploading}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Attach file"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              className="hidden"
              accept="image/*,.pdf,.doc,.docx,.txt,.xls,.xlsx"
            />
            
            <div className="flex-1">
              <input
                ref={inputRef}
                type="text"
                value={message}
                onChange={e => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={isSending || isUploading}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm bg-white disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={(!message.trim() && !selectedFile) || isSending || isUploading}
              className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
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

export default memo(ClientPortalChat);