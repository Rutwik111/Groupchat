export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface User {
  id: string;
  email: string;
  username: string;
  isAdmin: boolean;
  approvalStatus: ApprovalStatus;
}

export interface Group {
  id: string;
  name: string;
  members: string[]; // array of usernames
}

export interface Message {
  id: string;
  content: string;
  sender: string; // username
  timestamp: number;
  groupId: string;
}