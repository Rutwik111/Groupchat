import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import GroupList from '../components/GroupList.tsx';
import ChatWindow from '../components/ChatWindow.tsx';
import MessageInput from '../components/MessageInput.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { Group, Message, User } from '../types.ts';
import toast from 'react-hot-toast';

const DashboardPage: React.FC = () => {
  const { user, logout, getAllUsers } = useAuth();
  const navigate = useNavigate();

  const [groups, setGroups] = useState<Group[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const refreshData = useCallback(() => {
    const storedGroups = JSON.parse(localStorage.getItem('groups') || '[]') as Group[];
    const storedMessages = JSON.parse(localStorage.getItem('messages') || '[]') as Message[];
    const users = getAllUsers();
    
    setGroups(storedGroups);
    setMessages(storedMessages);
    setAllUsers(users);

    if (storedGroups.length > 0) {
      // If a group is selected, check if user is still a member
      if(selectedGroupId) {
        const currentGroup = storedGroups.find(g => g.id === selectedGroupId);
        if(currentGroup && user && !currentGroup.members.includes(user.username)) {
            toast.error(`You have been removed from #${currentGroup.name}.`);
            setSelectedGroupId(null);
        }
      }
      // If no group is selected, select the first one user is a member of
      if(!selectedGroupId && user) {
        const firstJoinedGroup = storedGroups.find(g => g.members.includes(user.username));
        if (firstJoinedGroup) {
          setSelectedGroupId(firstJoinedGroup.id);
        }
      }
    } else {
        setSelectedGroupId(null);
    }
  }, [getAllUsers, selectedGroupId, user]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSendMessage = (content: string) => {
    if (!user || !selectedGroupId) return;

    const newMessage: Message = {
      id: `m${Date.now()}`,
      content,
      sender: user.username,
      timestamp: Date.now(),
      groupId: selectedGroupId,
    };

    const updatedMessages = [...messages, newMessage];
    localStorage.setItem('messages', JSON.stringify(updatedMessages));
    setMessages(updatedMessages);
  };
  
  const handleJoinGroup = (groupId: string) => {
    if(!user) return;
    const updatedGroups = groups.map(g => {
        if(g.id === groupId && !g.members.includes(user.username)) {
            return { ...g, members: [...g.members, user.username] };
        }
        return g;
    });
    localStorage.setItem('groups', JSON.stringify(updatedGroups));
    refreshData();
  };

  const handleCreateGroup = (name: string) => {
    if(!user || !user.isAdmin) return;
    const newGroup: Group = {
        id: `g${Date.now()}`,
        name,
        members: [user.username]
    };
    const updatedGroups = [...groups, newGroup];
    localStorage.setItem('groups', JSON.stringify(updatedGroups));
    refreshData();
    toast.success(`Group "${name}" created!`);
  };

  const handleRemoveUserFromGroup = (groupId: string, usernameToRemove: string) => {
    const updatedGroups = groups.map(g => {
      if (g.id === groupId) {
        return { ...g, members: g.members.filter(m => m !== usernameToRemove) };
      }
      return g;
    });
    localStorage.setItem('groups', JSON.stringify(updatedGroups));
    refreshData();
    toast.success(`${usernameToRemove} has been removed from the group.`);
  };

  const handleJoinAllGroups = () => {
    if (!user || !user.isAdmin) return;
    const updatedGroups = groups.map(g => {
        if (!g.members.includes(user.username)) {
            return { ...g, members: [...g.members, user.username] };
        }
        return g;
    });
    localStorage.setItem('groups', JSON.stringify(updatedGroups));
    refreshData();
    toast.success("Joined all available groups!");
  };

  const handleSelectGroup = (groupId: string) => {
    setSelectedGroupId(groupId);
    setIsSidebarOpen(false); // Close sidebar on selection in mobile
  }

  const selectedGroup = groups.find(g => g.id === selectedGroupId);

  return (
    <div className="h-screen w-full flex bg-gray-900 text-gray-300 overflow-hidden">
      {/* Sidebar */}
      <div className={`absolute md:relative w-64 bg-gray-800 flex-shrink-0 h-full flex flex-col transition-transform duration-300 ease-in-out z-20 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h1 className="text-xl font-bold text-white">Team Chat</h1>
        </div>
        <GroupList
          groups={groups}
          currentUser={user}
          selectedGroupId={selectedGroupId}
          onSelectGroup={handleSelectGroup}
          onJoinGroup={handleJoinGroup}
          onCreateGroup={handleCreateGroup}
          onJoinAllGroups={handleJoinAllGroups}
        />
        <div className="mt-auto p-4 border-t border-gray-700">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-white mr-3 flex-shrink-0">
              {user?.username?.charAt(1).toUpperCase()}
            </div>
            <div className='truncate'>
               <p className="font-semibold text-white flex items-center truncate">
                <span className='truncate'>{user?.username}</span>
                {user?.isAdmin && <span className="ml-2 text-xs font-bold bg-red-600 text-white px-2 py-0.5 rounded-full flex-shrink-0">ADMIN</span>}
              </p>
              <p className="text-sm text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-300"
          >
            Logout
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="p-4 border-b border-gray-700 flex-shrink-0 flex justify-between items-center md:hidden">
            <h2 className="text-xl font-bold text-white"># {selectedGroup?.name || 'Chat'}</h2>
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
            </button>
        </header>
        {selectedGroup && user ? (
            <>
                <ChatWindow
                    group={selectedGroup}
                    messages={messages.filter((m) => m.groupId === selectedGroupId)}
                    currentUser={user}
                    onRemoveUser={handleRemoveUserFromGroup}
                />
                <MessageInput
                    onSendMessage={handleSendMessage}
                    user={user}
                    allUsers={allUsers}
                />
            </>
        ) : (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-gray-500">
                    <h2 className="text-2xl font-semibold">Select a group to start chatting</h2>
                    <p>You can join a group from the sidebar.</p>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;