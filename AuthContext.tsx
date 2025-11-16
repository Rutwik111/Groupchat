import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { User, ApprovalStatus, Group, Message } from '../types.ts';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string; user?: User | null }>;
  signup: (email: string, password: string, username: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  updateUserStatus: (userId: string, status: ApprovalStatus) => void;
  getAllUsers: () => User[];
}

// StoredUser includes password for mock auth check, but password is not part of the main User type
interface StoredUser extends User {
    password?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const initializeMockData = () => {
    if (!localStorage.getItem('users')) {
        const defaultUsers: StoredUser[] = [
            { id: 'admin123', email: 'Casual@gmail.com', password: 'Casual777', username: '@admin', isAdmin: true, approvalStatus: 'approved' },
            { id: 'user1', email: 'user1@example.com', password: 'password123', username: '@user1', isAdmin: false, approvalStatus: 'approved' },
            { id: 'user2', email: 'user2@example.com', password: 'password123', username: '@user2', isAdmin: false, approvalStatus: 'pending' },
        ];
        localStorage.setItem('users', JSON.stringify(defaultUsers));
    }

    if (!localStorage.getItem('groups')) {
        const defaultGroups: Group[] = [
            { id: 'g1', name: 'General', members: ['@admin', '@user1'] },
            { id: 'g2', name: 'Project-Alpha', members: ['@admin'] }
        ];
        localStorage.setItem('groups', JSON.stringify(defaultGroups));
    }

    if (!localStorage.getItem('messages')) {
        const defaultMessages: Message[] = [
            { id: 'm1', content: 'Hello @user1, welcome to the General channel!', sender: '@admin', timestamp: Date.now() - 200000, groupId: 'g1' },
            { id: 'm2', content: 'Thanks @admin! Glad to be here.', sender: '@user1', timestamp: Date.now() - 100000, groupId: 'g1' },
            { id: 'm3', content: 'This is the private channel for Project Alpha.', sender: '@admin', timestamp: Date.now() - 50000, groupId: 'g2' },
        ];
        localStorage.setItem('messages', JSON.stringify(defaultMessages));
    }
};


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    initializeMockData();
    const loggedInUserJson = localStorage.getItem('loggedInUser');
    if (loggedInUserJson) {
      setUser(JSON.parse(loggedInUserJson));
    }
  }, []);

  const getUsersFromStorage = (): StoredUser[] => {
    const usersJson = localStorage.getItem('users');
    return usersJson ? JSON.parse(usersJson) : [];
  };

  const saveUsersToStorage = (users: StoredUser[]) => {
    localStorage.setItem('users', JSON.stringify(users));
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; message: string; user?: User | null }> => {
    const users = getUsersFromStorage();
    const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (existingUser && existingUser.password === password) {
      if (existingUser.approvalStatus === 'approved') {
        // Strip password before setting user state
        const { password, ...userToSet } = existingUser;
        setUser(userToSet);
        localStorage.setItem('loggedInUser', JSON.stringify(userToSet));
        return { success: true, message: 'Login successful!', user: userToSet };
      } else if (existingUser.approvalStatus === 'pending') {
        return { success: false, message: 'Your account is not approved yet.' };
      } else {
         return { success: false, message: 'Your account has been rejected.' };
      }
    }

    return { success: false, message: 'Invalid credentials.' };
  };

  const signup = async (email: string, password: string, username: string): Promise<{ success: boolean; message: string }> => {
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(username)) {
      return { success: false, message: 'Username must be 3-20 characters long and can only contain letters, numbers, and underscores.' };
    }
    
    const users = getUsersFromStorage();
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, message: 'An account with this email already exists.' };
    }
    
    let finalUsername = `@${username}`;
    let counter = 1;
    while(users.some(u => u.username === finalUsername)) {
        finalUsername = `@${username}${counter}`;
        counter++;
    }

    const newUser: StoredUser = {
      id: `user-${Date.now()}`,
      email,
      password, // Storing password for mock login
      username: finalUsername,
      isAdmin: false,
      approvalStatus: 'pending',
    };
    
    const updatedUsers = [...users, newUser];
    saveUsersToStorage(updatedUsers);

    // TEMP: Auto-approve for demo purposes. In a real app, this would be an admin action.
    setTimeout(() => {
        const currentUsers = getUsersFromStorage();
        const userToApprove = currentUsers.find(u => u.id === newUser.id);
        if (userToApprove && userToApprove.approvalStatus === 'pending') {
            userToApprove.approvalStatus = 'approved';
            saveUsersToStorage(currentUsers);
            console.log(`User ${newUser.username} auto-approved for demo.`);
        }
    }, 2000);

    return { success: true, message: 'Signup successful! Your account is pending approval.' };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('loggedInUser');
  };

  const updateUserStatus = (userId: string, status: ApprovalStatus) => {
    const users = getUsersFromStorage();
    const userIndex = users.findIndex(u => u.id === userId);
    if(userIndex !== -1) {
        users[userIndex].approvalStatus = status;
        saveUsersToStorage(users);
        // This is a bit of a hack to force a re-render in AdminPanel. A better solution might involve state management.
        setUser(prevUser => prevUser ? {...prevUser} : null);
    }
  };

  const getAllUsers = (): User[] => {
    // Strip passwords before returning users
    return getUsersFromStorage().map(({ password, ...user }) => user);
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, updateUserStatus, getAllUsers }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};