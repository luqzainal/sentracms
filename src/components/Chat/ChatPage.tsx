import React, { useState } from 'react';
import { Send, Search, Phone, Video, MoreHorizontal, Paperclip, Smile } from 'lucide-react';

const ChatPage: React.FC = () => {
  const [activeChat, setActiveChat] = useState(1);
  const [message, setMessage] = useState('');

  const chats = [
    {
      id: 1,
      client: 'Acme Corporation',
      avatar: 'AC',
      lastMessage: 'Thanks for the update on the project',
      timestamp: '10:30 AM',
      unread: 2,
      online: true
    },
    {
      id: 2,
      client: 'Tech Solutions Inc',
      avatar: 'TS',
      lastMessage: 'When can we schedule the next meeting?',
      timestamp: '9:15 AM',
      unread: 0,
      online: false
    },
    {
      id: 3,
      client: 'Global Marketing',
      avatar: 'GM',
      lastMessage: 'The designs look great!',
      timestamp: 'Yesterday',
      unread: 1,
      online: true
    },
    {
      id: 4,
      client: 'Digital Agency',
      avatar: 'DA',
      lastMessage: 'Payment has been processed',
      timestamp: '2 days ago',
      unread: 0,
      online: false
    },
  ];

  const messages = [
    {
      id: 1,
      sender: 'client',
      content: 'Hi! I wanted to check on the progress of our project.',
      timestamp: '10:15 AM',
      type: 'text'
    },
    {
      id: 2,
      sender: 'admin',
      content: 'Hello! The project is going well. We\'ve completed the design phase and are now moving into development.',
      timestamp: '10:18 AM',
      type: 'text'
    },
    {
      id: 3,
      sender: 'client',
      content: 'That\'s great to hear! Can you share some screenshots?',
      timestamp: '10:20 AM',
      type: 'text'
    },
    {
      id: 4,
      sender: 'admin',
      content: 'Absolutely! I\'ll send them over shortly. The UI is looking very clean and modern.',
      timestamp: '10:22 AM',
      type: 'text'
    },
    {
      id: 5,
      sender: 'client',
      content: 'Thanks for the update on the project',
      timestamp: '10:30 AM',
      type: 'text'
    },
  ];

  const handleSendMessage = () => {
    if (message.trim()) {
      // Add message logic here
      console.log('Sending message:', message);
      setMessage('');
    }
  };

  const activeClient = chats.find(chat => chat.id === activeChat);

  return (
    <div className="p-6 h-[calc(100vh-8rem)]">
      <div className="h-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex h-full">
          {/* Chat List */}
          <div className="w-80 border-r border-slate-200 flex flex-col">
            <div className="p-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900 mb-3">Messages</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => setActiveChat(chat.id)}
                  className={`p-4 cursor-pointer border-b border-slate-100 hover:bg-slate-50 ${
                    activeChat === chat.id ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                        {chat.avatar}
                      </div>
                      {chat.online && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-slate-900 truncate">{chat.client}</h3>
                        <span className="text-xs text-slate-500">{chat.timestamp}</span>
                      </div>
                      <p className="text-sm text-slate-600 truncate">{chat.lastMessage}</p>
                    </div>
                    {chat.unread > 0 && (
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white font-medium">{chat.unread}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Content */}
          <div className="flex-1 flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                  {activeClient?.avatar}
                </div>
                <div>
                  <h3 className="font-medium text-slate-900">{activeClient?.client}</h3>
                  <p className="text-sm text-slate-500">
                    {activeClient?.online ? 'Online' : 'Last seen 2 hours ago'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                  <Phone className="w-5 h-5 text-slate-600" />
                </button>
                <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                  <Video className="w-5 h-5 text-slate-600" />
                </button>
                <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                  <MoreHorizontal className="w-5 h-5 text-slate-600" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                      {msg.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-slate-200">
              <div className="flex items-center space-x-2">
                <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                  <Paperclip className="w-5 h-5 text-slate-600" />
                </button>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a message..."
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                  <button className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-slate-100 rounded">
                    <Smile className="w-5 h-5 text-slate-600" />
                  </button>
                </div>
                <button
                  onClick={handleSendMessage}
                  className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;