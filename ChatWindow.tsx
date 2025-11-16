import React, { useRef, useEffect, useState } from 'react';
import { Group, Message, User } from '../types.ts';

interface ChatWindowProps {
  group: Group;
  messages: Message[];
  currentUser: User | null;
  onRemoveUser: (groupId: string, username: string) => void;
}

const parseMentions = (text: string) => {
  const parts = text.split(/(@[a-zA-Z0-9_]+)/g);
  return parts.map((part, i) =>
    part.match(/@[a-zA-Z0-9_]+/) ? (
      <span key={i} className="text-indigo-400 font-semibold bg-gray-800 rounded px-1">
        {part}
      </span>
    ) : (
      part
    )
  );
};

const ManageMembersModal: React.FC<{
    group: Group;
    currentUser: User | null;
    onClose: () => void;
    onRemove: (groupId: string, username: string) => void;
}> = ({ group, currentUser, onClose, onRemove }) => {
    
    const handleRemoveClick = (username: string) => {
        if (window.confirm(`Are you sure you want to remove ${username} from this group?`)) {
            onRemove(group.id, username);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-xl font-bold text-white mb-4">Manage Members for #{group.name}</h2>
                <ul className="space-y-2 max-h-80 overflow-y-auto">
                    {group.members.map(member => (
                        <li key={member} className="flex justify-between items-center bg-gray-700 p-3 rounded">
                            <span className="text-white">{member}</span>
                            {member !== currentUser?.username && (
                                <button
                                    onClick={() => handleRemoveClick(member)}
                                    className="text-sm bg-red-600 hover:bg-red-700 text-white font-semibold py-1 px-3 rounded"
                                >
                                    Remove
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
                <div className="mt-6 flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-md text-white font-semibold">Close</button>
                </div>
            </div>
        </div>
    );
};

const ChatWindow: React.FC<ChatWindowProps> = ({ group, messages, currentUser, onRemoveUser }) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {isModalOpen && <ManageMembersModal group={group} currentUser={currentUser} onClose={() => setIsModalOpen(false)} onRemove={onRemoveUser} />}
      <header className="hidden md:flex p-4 border-b border-gray-700 flex-shrink-0 justify-between items-center">
        <div>
            <h2 className="text-xl font-bold text-white"># {group.name}</h2>
            <p className="text-sm text-gray-400">Members: {group.members.length}</p>
        </div>
        {currentUser?.isAdmin && (
            <div className="relative">
                 <button onClick={() => setIsModalOpen(true)} className="p-2 rounded-full hover:bg-gray-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                </button>
            </div>
        )}
      </header>
      <main className="flex-1 p-4 overflow-y-auto">
        {messages.map((msg) => {
          const isCurrentUser = msg.sender === currentUser?.username;
          return (
            <div key={msg.id} className={`flex items-start mb-4 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex items-start max-w-xs lg:max-w-md ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className="w-10 h-10 rounded-full bg-gray-700 flex-shrink-0 mx-3 flex items-center justify-center font-bold">
                    {msg.sender.charAt(1).toUpperCase()}
                </div>
                <div className={`px-4 py-2 rounded-lg ${isCurrentUser ? 'bg-indigo-600 text-white' : 'bg-gray-700'}`}>
                    <div className={`flex items-baseline space-x-2 ${isCurrentUser ? 'justify-end' : ''}`}>
                         {!isCurrentUser && <p className="font-bold text-indigo-400">{msg.sender}</p>}
                         <p className="text-xs text-gray-400">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <p className={`text-white whitespace-pre-wrap ${isCurrentUser ? 'text-right' : ''}`}>{parseMentions(msg.content)}</p>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </main>
    </div>
  );
};

export default ChatWindow;