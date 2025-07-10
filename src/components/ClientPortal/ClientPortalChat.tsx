import React, { useState } from 'react';
import { ArrowLeft, Send, Paperclip, Smile } from 'lucide-react';
import { useAppStore } from '../../store/AppStore';

interface ClientPortalChatProps {
  user: any;
  onBack: () => void;
}

const ClientPortalChat: React.FC<ClientPortalChatProps> = ({ user, onBack }) => {
  const [message, setMessage] = useState('');

  const { clients, chats } = useAppStore();

  // Find the client data based on the user email
  const client = clients.find(c => c.email === user.email);
  const clientChat = chats.find(chat => chat.clientId === client?.id);

  if (!client || !clientChat) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Chat not available</h2>
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

  const handleSendMessage = () => {
    if (message.trim()) {
      // Add message logic here
      console.log('Sending message:', message);
      setMessage('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 lg:px-8 py-4 flex-shrink-0">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Support Chat</h1>
              <p className="text-slate-600 text-sm">Chat with our support team</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Content */}
      <div className="flex-1 max-w-4xl mx-auto w-full flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-4">
          {clientChat.messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'client' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  msg.sender === 'client'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-slate-900 border border-slate-200'
                }`}
              >
                <p className="text-sm">{msg.content}</p>
                <p className={`text-xs mt-1 ${
                  msg.sender === 'client' ? 'text-blue-100' : 'text-slate-500'
                }`}>
                  {msg.timestamp}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="p-4 lg:p-8 border-t border-slate-200 bg-white flex-shrink-0">
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
  );
};

export default ClientPortalChat;