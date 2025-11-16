import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminPanel from '../components/AdminPanel.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { Group, User } from '../types.ts';
import toast from 'react-hot-toast';

type AdminTab = 'approvals' | 'groups' | 'active';

const GroupManagementPanel: React.FC = () => {
    const [groups, setGroups] = useState<Group[]>([]);

    useEffect(() => {
        refreshGroups();
    }, []);

    const refreshGroups = () => {
        const storedGroups = JSON.parse(localStorage.getItem('groups') || '[]') as Group[];
        setGroups(storedGroups);
    };

    const handleDeleteGroup = (groupId: string, groupName: string) => {
        if (window.confirm(`Are you sure you want to delete the group "${groupName}"? This action cannot be undone.`)) {
            const updatedGroups = groups.filter(g => g.id !== groupId);
            const updatedMessages = JSON.parse(localStorage.getItem('messages') || '[]').filter((m: any) => m.groupId !== groupId);

            localStorage.setItem('groups', JSON.stringify(updatedGroups));
            localStorage.setItem('messages', JSON.stringify(updatedMessages));
            
            setGroups(updatedGroups);
            toast.success(`Group "${groupName}" has been deleted.`);
        }
    };
    
    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-white mb-4">Group Management</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-gray-700">
                <tr>
                  <th className="p-3">Group Name</th>
                  <th className="p-3">Member Count</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {groups.map((group) => (
                  <tr key={group.id} className="border-b border-gray-700 hover:bg-gray-700">
                    <td className="p-3">{group.name}</td>
                    <td className="p-3">{group.members.length}</td>
                    <td className="p-3">
                      <button
                        onClick={() => handleDeleteGroup(group.id, group.name)}
                        className="px-3 py-1 text-sm bg-red-600 rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
    );
};

const ActiveUsersPanel: React.FC = () => {
    const { getAllUsers } = useAuth();
    const [activeUsers, setActiveUsers] = useState<User[]>([]);

    useEffect(() => {
        const allUsers = getAllUsers();
        setActiveUsers(allUsers.filter(u => u.approvalStatus === 'approved'));
    }, [getAllUsers]);

    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-white mb-4">Active Users</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {activeUsers.map(user => (
                <div key={user.id} className="bg-gray-700 p-4 rounded-lg flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-white flex-shrink-0">
                        {user.username.charAt(1).toUpperCase()}
                    </div>
                    <div>
                        <p className="font-semibold text-white">{user.username}</p>
                        <p className="text-sm text-gray-400">{user.email}</p>
                    </div>
                </div>
            ))}
          </div>
        </div>
    );
};


const AdminDashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminTab>('approvals');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const renderTabContent = () => {
    switch(activeTab) {
        case 'approvals':
            return <AdminPanel />;
        case 'groups':
            return <GroupManagementPanel />;
        case 'active':
            return <ActiveUsersPanel />;
        default:
            return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-300 p-4 sm:p-6 lg:p-8">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-gray-400">Welcome, {user?.username}!</p>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-300"
        >
          Logout
        </button>
      </header>
      <div className="mb-6 border-b border-gray-700">
        <nav className="-mb-px flex space-x-6">
          <button onClick={() => setActiveTab('approvals')} className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'approvals' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'}`}>
            User Approvals
          </button>
          <button onClick={() => setActiveTab('groups')} className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'groups' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'}`}>
            Group Management
          </button>
          <button onClick={() => setActiveTab('active')} className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'active' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'}`}>
            Active Users
          </button>
        </nav>
      </div>
      <main>
        {renderTabContent()}
      </main>
    </div>
  );
};

export default AdminDashboardPage;