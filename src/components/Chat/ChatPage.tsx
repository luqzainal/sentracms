import React, { useState, useEffect, useRef, memo, useCallback } from 'react';
import { Search, Send, MessageSquare, Menu, ArrowLeft, RefreshCw, Paperclip, X, Download, FileText, Image, File, MessageCircleOff, MessageCircle } from 'lucide-react';
import { useAppStore } from '../../store/AppStore';
import { getInitials } from '../../utils/avatarUtils';
import { DatabaseChatMessage } from '../../types/database';

interface MessageData {
  id: number;
  chat_id: number;
  sender: 'client' | 'admin';
  sender_id?: string;
  sender_name?: string;
  sender_role?: string;
  content: string;
  message_type: 'text' | 'file' | 'image';
  attachment_url?: string;
  attachment_name?: string;
  attachment_type?: string;
  attachment_size?: number;
  created_at: string;
}

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

// Helper function to get file icon
function getFileIcon(fileType: string) {
  if (fileType.startsWith('image/')) {
    return <Image className="w-4 h-4" />;
  }
  if (fileType.includes('pdf')) {
    return <FileText className="w-4 h-4" />;
  }
  return <File className="w-4 h-4" />;
}

// Helper function to format file size
function formatFileSize(bytes: number) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// MessageList komponen memoized
const MessageList = memo(({ messages, isAdmin, clientName, clientId }: { messages: MessageData[]; isAdmin: boolean; clientName?: string; clientId?: number }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { user, getClientRole, users } = useAppStore();
  
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleFileDownload = (attachmentUrl: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = attachmentUrl;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper function untuk dapatkan admin user yang active
  const getAdminUserInfo = (message: DatabaseChatMessage) => {
    // Use actual sender info from message if available
    if (message.sender_name && message.sender_role) {
      return {
        role: message.sender_role,
        name: message.sender_name
      };
    }
    
    // Fallback to current user info
    if (user && (user.role === 'Super Admin' || user.role === 'Team')) {
      return {
        role: user.role, // Show actual role: Super Admin or Team
        name: user.name
      };
    }
    return {
      role: 'Team',
      name: 'Support'
    };
  };

  // Helper function untuk dapatkan client user info
  const getClientUserInfo = (message: DatabaseChatMessage, clientId?: number) => {
    // Use actual sender info from message if available
    if (message.sender_name && message.sender_role) {
      return {
        role: message.sender_role,
        name: message.sender_name
      };
    }
    
    if (!clientId) {
      return {
        role: 'Client Team',
        name: clientName || 'Unknown Client'
      };
    }

    // Debug: Log untuk understand data matching
    console.log('🔍 getClientUserInfo Debug:', {
      clientId,
      clientName,
      usersCount: users.length,
      clientUsers: users.filter(u => u.clientId === clientId),
      allClientIds: users.map(u => ({ id: u.id, name: u.name, clientId: u.clientId, role: u.role }))
    });

    // Cari user yang ada clientId sama dengan chat
    const clientUser = users.find(u => u.clientId === clientId);
    if (clientUser) {
      console.log('✅ Found client user:', { name: clientUser.name, role: clientUser.role });
      return {
        role: clientUser.role, // Client Admin atau Client Team
        name: clientUser.name
      };
    }

    // Fallback - Cuba cari berdasarkan nama jika clientId matching gagal
    if (clientName) {
      const userByName = users.find(u => 
        u.name.toLowerCase() === clientName.toLowerCase() && 
        (u.role === 'Client Admin' || u.role === 'Client Team')
      );
      if (userByName) {
        console.log('✅ Found client user by name:', { name: userByName.name, role: userByName.role });
        return {
          role: userByName.role,
          name: userByName.name
        };
      }
    }

    // Fallback kepada old method
    const role = getClientRole(clientId);
    console.log('⚠️ Using fallback role:', role, 'for client:', clientName);
    return {
      role: role,
      name: clientName || 'Unknown Client'
    };
  };

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
                {(() => {
                  const adminInfo = getAdminUserInfo(msg);
                  return `${adminInfo.role} - ${adminInfo.name}`;
                })()}
              </div>
            )}
            {msg.sender === 'client' && (
              <div className={`text-xs font-medium mb-1 ${
                msg.sender === (isAdmin ? 'admin' : 'client') ? 'text-blue-100' : 'text-slate-600'
              }`}>
                {(() => {
                  const clientUserInfo = getClientUserInfo(msg, clientId);
                  return `${clientUserInfo.role} - ${clientUserInfo.name}`;
                })()}
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
                    onClick={() => handleFileDownload(msg.attachment_url!, msg.attachment_name || 'file')}
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
                    className="max-w-full h-auto rounded-lg cursor-pointer"
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showChatView, setShowChatView] = useState(false);
  const [currentChatEnabled, setCurrentChatEnabled] = useState<boolean>(true);
  const [isChatToggling, setIsChatToggling] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
    stopPolling,
    toggleUserChatStatus,
    getClientChatStatus,
    users,
    user
  } = useAppStore();

  const activeClient = activeChat ? getChatById(activeChat) : null;
  const messages = activeClient?.messages || [];

  // Chat Status Functions
  const fetchCurrentChatStatus = useCallback(async () => {
    if (activeClient?.clientId) {
      try {
        const chatEnabled = await getClientChatStatus(activeClient.clientId);
        setCurrentChatEnabled(chatEnabled);
      } catch (error) {
        console.error('Error fetching chat status:', error);
        setCurrentChatEnabled(true); // Default to enabled on error
      }
    }
  }, [activeClient?.clientId, getClientChatStatus]);

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
  }, [fetchChats, startPolling, stopPolling]); // Include dependencies

  // Load messages when active chat changes
  useEffect(() => {
    if (activeChat) {
      loadChatMessages(activeChat);
      markChatAsRead(activeChat, 'admin'); // Mark as read when opened (admin user type)
    }
  }, [activeChat, loadChatMessages, markChatAsRead]); // Include all dependencies

  // Fetch chat status when active client changes
  useEffect(() => {
    if (activeClient?.clientId) {
      fetchCurrentChatStatus();
    }
  }, [activeClient?.clientId, fetchCurrentChatStatus]);

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
      // Try S3 upload first
      console.log('📤 Attempting S3 upload...');
      
      // Use absolute URL for production, relative for development
      const apiUrl = import.meta.env.PROD 
        ? 'https://sentra-api-app-sxdm6.ondigitalocean.app/api/generate-upload-url'
        : '/api/generate-upload-url';
      
      // Generate upload URL
      const response = await fetch(apiUrl, {
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

      const responseText = await response.text();
      
      // Check if response is HTML (API server not running)
      if (responseText.includes('<!doctype html>') || responseText.includes('<html')) {
        console.log('❌ API server not running, falling back to local storage...');
        throw new Error('API server not available');
      }
      
      // Parse JSON response
      const { uploadUrl, publicUrl } = JSON.parse(responseText);

      // Upload file to S3
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (uploadResponse.ok) {
        console.log('✅ S3 upload successful');
        return publicUrl;
      } else {
        console.log('❌ S3 upload failed, trying local storage...');
        throw new Error('S3 upload failed');
      }
    } catch {
      console.log('🔄 Falling back to local file storage...');
      
      // Fallback: Convert file to data URL for local storage
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result as string;
          console.log('✅ Local file storage successful');
          resolve(dataUrl);
        };
        reader.onerror = () => {
          reject(new Error('Failed to read file'));
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleSendMessage = async () => {
    if ((!message.trim() && !selectedFile) || !activeChat) return;

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
      await sendMessage(activeChat, message.trim() || (selectedFile ? `Sent ${selectedFile.name}` : ''), 'admin', {
        messageType,
        attachmentUrl,
        attachmentName,
        attachmentType,
        attachmentSize
      });

      setMessage('');
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      // Error has been logged, errorMessage is used above
      console.error('Error sending message:', error);
      
      // Show more specific error message
      if (errorMessage.includes('API server not available')) {
        alert('S3 upload server not available. File saved locally. Message sent with local file.');
      } else if (errorMessage.includes('S3 upload failed')) {
        alert('S3 upload failed, but file was saved locally. Message sent with local file.');
      } else if (errorMessage.includes('Failed to read file')) {
        alert('Failed to process file. Please try again.');
      } else {
        alert('Failed to send message. Please try again.');
      }
    } finally {
      setIsUploading(false);
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



  const handleToggleChatStatus = async () => {
    if (!activeClient?.clientId || !user) {
      console.error('No active client or user for chat toggle');
      return;
    }

    // Only Super Admin and Admin Team can toggle chat
    if (user.role !== 'Super Admin' && user.role !== 'Team') {
      console.error('Unauthorized: Only admin can toggle chat status');
      return;
    }

    setIsChatToggling(true);
    try {
      // Find the client user in the users array
      const clientUser = users.find(u => u.clientId === activeClient.clientId);
      if (!clientUser) {
        console.error('Client user not found');
        return;
      }

      const newChatStatus = !currentChatEnabled;
      console.log(`🔍 Admin: Toggling chat status - User ID: ${clientUser.id}, New Status: ${newChatStatus}`);
      
      await toggleUserChatStatus(clientUser.id, newChatStatus);
      setCurrentChatEnabled(newChatStatus);
      
      console.log(`✅ Admin: Chat ${newChatStatus ? 'enabled' : 'disabled'} for client: ${activeClient.client}`);
    } catch (error) {
      console.error('Error toggling chat status:', error);
    } finally {
      setIsChatToggling(false);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

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
              {(loading.chats && chats.length === 0) ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              ) : chats.length === 0 ? (
                <div className="p-4 text-center text-slate-500">
                  <p>No conversations yet</p>
                </div>
              ) : (
                chats
                  .sort((a, b) => {
                    // Sort by lastMessageAt (newest first), then by createdAt
                    const aTime = a.lastMessageAt || a.createdAt;
                    const bTime = b.lastMessageAt || b.createdAt;
                    return new Date(bTime).getTime() - new Date(aTime).getTime();
                  })
                  .map((chat) => (
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
                    {/* Chat Disable/Enable Button - Only for Admin users */}
                    {user && (user.role === 'Super Admin' || user.role === 'Team') && (
                      <button
                        onClick={handleToggleChatStatus}
                        disabled={isChatToggling}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                          currentChatEnabled
                            ? 'text-green-600 hover:text-green-700 hover:bg-green-50 border border-green-200'
                            : 'text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200'
                        } ${
                          isChatToggling ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        title={
                          isChatToggling
                            ? 'Updating chat status...'
                            : currentChatEnabled
                            ? 'Disable chat for this client'
                            : 'Enable chat for this client'
                        }
                      >
                        {isChatToggling ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span className="text-sm font-medium">Updating...</span>
                          </>
                        ) : currentChatEnabled ? (
                          <>
                            <MessageCircleOff className="w-4 h-4" />
                            <span className="text-sm font-medium">Disable Chat</span>
                          </>
                        ) : (
                          <>
                            <MessageCircle className="w-4 h-4" />
                            <span className="text-sm font-medium">Enable Chat</span>
                          </>
                        )}
                      </button>
                    )}

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
                  {/* Chat Status Indicator */}
                  {!currentChatEnabled && (
                    <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
                      <MessageCircleOff className="w-5 h-5 text-red-600" />
                      <div>
                        <p className="text-sm font-medium text-red-800">Chat Disabled</p>
                        <p className="text-xs text-red-600">Client cannot send messages, but can view chat history. Admin can still send messages.</p>
                      </div>
                    </div>
                  )}

                  {/* Selected File Preview */}
                  {selectedFile && (
                    <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
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
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Attach file"
                    >
                      <Paperclip className="w-5 h-5" />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileSelect}
                      className="hidden"
                      accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                    />
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
                    <button
                      onClick={handleSendMessage}
                      disabled={(!message.trim() && !selectedFile) || isUploading}
                      className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUploading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
        <div className="lg:hidden flex flex-col h-full">
          {!showChatView ? (
            // Mobile Chat List
            <div className="flex-1 overflow-y-auto">
              {(loading.chats && chats.length === 0) ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              ) : chats.length === 0 ? (
                <div className="p-4 text-center text-slate-500">
                  <p>No conversations yet</p>
                </div>
              ) : (
                chats
                  .sort((a, b) => {
                    // Sort by lastMessageAt (newest first), then by createdAt
                    const aTime = a.lastMessageAt || a.createdAt;
                    const bTime = b.lastMessageAt || b.createdAt;
                    return new Date(bTime).getTime() - new Date(aTime).getTime();
                  })
                  .map((chat) => (
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
                {/* Selected File Preview */}
                {selectedFile && (
                  <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getFileIcon(selectedFile.type)}
                        <div>
                          <p className="text-xs font-medium text-blue-900 truncate">{selectedFile.name}</p>
                          <p className="text-xs text-blue-700">{formatFileSize(selectedFile.size)}</p>
                        </div>
                      </div>
                      <button
                        onClick={handleRemoveFile}
                        className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Attach file"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                  />
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
                    disabled={(!message.trim() && !selectedFile) || isUploading}
                    className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUploading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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