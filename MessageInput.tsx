import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types.ts';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  user: User | null;
  allUsers: User[];
}

// TEMP: Cooldown is for demo purposes and resets on page refresh.
const COOLDOWN_MINUTES = 10;
const COOLDOWN_MS = COOLDOWN_MINUTES * 60 * 1000;

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, user, allUsers }) => {
  const [message, setMessage] = useState('');
  const [cooldownTime, setCooldownTime] = useState(0);

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);


  useEffect(() => {
    if (!user) return;
    const lastMessageTime = parseInt(localStorage.getItem(`cooldown_${user.id}`) || '0', 10);
    const now = Date.now();
    const timePassed = now - lastMessageTime;

    if (timePassed < COOLDOWN_MS) {
      setCooldownTime(COOLDOWN_MS - timePassed);
    }
  }, [user]);

  useEffect(() => {
    if (cooldownTime > 0) {
      const timer = setTimeout(() => setCooldownTime(cooldownTime - 1000), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldownTime]);


  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && user && cooldownTime <= 0) {
      onSendMessage(message.trim());
      setMessage('');
      localStorage.setItem(`cooldown_${user.id}`, Date.now().toString());
      setCooldownTime(COOLDOWN_MS);
      setShowSuggestions(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setMessage(text);

    const cursorPos = e.target.selectionStart;
    const textBeforeCursor = text.substring(0, cursorPos);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);

    if (mentionMatch) {
      const query = mentionMatch[1].toLowerCase();
      const filteredUsers = allUsers
        .map(u => u.username)
        .filter(username => username.toLowerCase().startsWith(`@${query}`))
        .slice(0, 5);
      setSuggestions(filteredUsers);
      setShowSuggestions(filteredUsers.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (username: string) => {
    const text = message;
    const cursorPos = textareaRef.current?.selectionStart || 0;
    const textBeforeCursor = text.substring(0, cursorPos);
    
    const newText = textBeforeCursor.replace(/@\w*$/, `${username} `) + text.substring(cursorPos);

    setMessage(newText);
    setShowSuggestions(false);
    textareaRef.current?.focus();
  };
  
  const isCooldownActive = cooldownTime > 0;

  return (
    <footer className="p-4 bg-gray-800 border-t border-gray-700">
      <form onSubmit={handleSend}>
        <div className="relative">
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute bottom-full left-0 right-0 bg-gray-700 border border-gray-600 rounded-t-lg shadow-lg mb-1 overflow-hidden z-10">
              {suggestions.map(username => (
                <div 
                  key={username}
                  onClick={() => handleSuggestionClick(username)}
                  className="px-4 py-2 hover:bg-indigo-600 cursor-pointer text-white"
                >
                  {username}
                </div>
              ))}
            </div>
          )}
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            placeholder={isCooldownActive ? `On cooldown...` : "Type your message..."}
            className="w-full bg-gray-700 text-gray-300 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-20 resize-none"
            rows={1}
            disabled={isCooldownActive}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
            {isCooldownActive ? (
                 <div className="w-10 h-10">
                    <CircularProgressbar
                        value={cooldownTime}
                        maxValue={COOLDOWN_MS}
                        text={`${Math.floor(cooldownTime / 60000)}:${(Math.floor(cooldownTime / 1000) % 60).toString().padStart(2, '0')}`}
                        styles={buildStyles({
                            // Invert progress to show time remaining
                            pathColor: '#4B5563',
                            trailColor: '#818CF8',
                            textColor: '#9CA3AF',
                            textSize: '28px'
                        })}
                    />
                 </div>
            ) : (
                <button
                    type="submit"
                    className="p-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white transition duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed"
                    disabled={!message.trim()}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                </button>
            )}
           </div>
        </div>
      </form>
    </footer>
  );
};

export default MessageInput;