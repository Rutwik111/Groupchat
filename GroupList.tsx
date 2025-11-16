import React, { useState } from 'react';
import { Group, User } from '../types.ts';

interface GroupListProps {
  groups: Group[];
  currentUser: User | null;
  selectedGroupId: string | null;
  onSelectGroup: (groupId: string) => void;
  onJoinGroup: (groupId: string) => void;
  onCreateGroup: (name: string) => void;
  onJoinAllGroups: () => void;
}

const CreateGroupModal: React.FC<{ onClose: () => void; onCreate: (name: string) => void }> = ({ onClose, onCreate }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onCreate(name.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-sm">
        <h2 className="text-xl font-bold text-white mb-4">Create New Group</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor="group-name" className="block text-sm font-medium text-gray-300">Group Name</label>
          <input
            id="group-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 mt-1 text-gray-300 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
          <div className="mt-6 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-md text-white font-semibold">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md text-white font-semibold">Create</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const GroupList: React.FC<GroupListProps> = ({ groups, currentUser, selectedGroupId, onSelectGroup, onJoinGroup, onCreateGroup, onJoinAllGroups }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex-1 overflow-y-auto">
      {isModalOpen && <CreateGroupModal onClose={() => setIsModalOpen(false)} onCreate={onCreateGroup} />}
      <div className="p-4">
        <div className="flex justify-between items-center mb-2">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Channels</h2>
            {currentUser?.isAdmin && (
                <button onClick={() => setIsModalOpen(true)} className="text-indigo-400 hover:text-indigo-300 text-xl font-bold leading-none">+</button>
            )}
        </div>
        <ul className="mt-2 space-y-1">
          {groups.map((group) => {
            const isMember = currentUser && group.members.includes(currentUser.username);
            return (
              <li key={group.id} className="group flex items-center justify-between">
                <button
                  onClick={() => onSelectGroup(group.id)}
                  disabled={!isMember}
                  className={`w-full text-left py-2 px-3 rounded-md text-sm font-medium flex items-center transition duration-200 ${
                    selectedGroupId === group.id
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  } ${!isMember ? 'cursor-not-allowed opacity-60' : ''}`}
                >
                  <span className="mr-2">#</span>
                  {group.name}
                </button>
                {!isMember && (
                    <button onClick={() => onJoinGroup(group.id)} className="ml-2 px-2 py-1 text-xs bg-green-600 hover:bg-green-700 rounded text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        Join
                    </button>
                )}
              </li>
            );
          })}
        </ul>
        {currentUser?.isAdmin && (
            <div className="mt-4 pt-4 border-t border-gray-700">
                <button 
                    onClick={onJoinAllGroups}
                    className="w-full text-sm py-2 px-3 rounded-md bg-gray-700 hover:bg-indigo-600 text-gray-300 hover:text-white transition-colors duration-200"
                >
                    Join All Groups
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default GroupList;