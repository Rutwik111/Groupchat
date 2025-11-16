import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { User, ApprovalStatus } from '../types.ts';

const AdminPanel: React.FC = () => {
  const { getAllUsers, updateUserStatus } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [filter, setFilter] = useState<ApprovalStatus | 'all'>('all');

  useEffect(() => {
    const allUsers = getAllUsers();
    setUsers(allUsers);
  }, [getAllUsers]);
  
  const handleStatusChange = (userId: string, status: ApprovalStatus) => {
    updateUserStatus(userId, status);
    // Refresh user list
    setUsers(getAllUsers());
  };

  const statusColorMap: Record<ApprovalStatus, string> = {
    pending: 'bg-yellow-500',
    approved: 'bg-green-500',
    rejected: 'bg-red-500',
  };

  const filteredUsers = users.filter(user => filter === 'all' || user.approvalStatus === filter);

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-white mb-4">User Management</h2>
      <div className="mb-4 flex space-x-2">
        <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded ${filter === 'all' ? 'bg-indigo-600' : 'bg-gray-700'}`}>All</button>
        <button onClick={() => setFilter('pending')} className={`px-4 py-2 rounded ${filter === 'pending' ? 'bg-indigo-600' : 'bg-gray-700'}`}>Pending</button>
        <button onClick={() => setFilter('approved')} className={`px-4 py-2 rounded ${filter === 'approved' ? 'bg-indigo-600' : 'bg-gray-700'}`}>Approved</button>
        <button onClick={() => setFilter('rejected')} className={`px-4 py-2 rounded ${filter === 'rejected' ? 'bg-indigo-600' : 'bg-gray-700'}`}>Rejected</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-b border-gray-700">
            <tr>
              <th className="p-3">Username</th>
              <th className="p-3">Email</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className="border-b border-gray-700 hover:bg-gray-700">
                <td className="p-3">{user.username}</td>
                <td className="p-3">{user.email}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full text-white ${statusColorMap[user.approvalStatus]}`}>
                    {user.approvalStatus}
                  </span>
                </td>
                <td className="p-3 space-x-2">
                  <button
                    onClick={() => handleStatusChange(user.id, 'approved')}
                    disabled={user.approvalStatus === 'approved'}
                    className="px-3 py-1 text-sm bg-green-600 rounded hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleStatusChange(user.id, 'rejected')}
                    disabled={user.approvalStatus === 'rejected'}
                    className="px-3 py-1 text-sm bg-red-600 rounded hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
                  >
                    Reject
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

export default AdminPanel;