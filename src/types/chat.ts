export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  message: string;
  messageType: 'text' | 'image' | 'document' | 'location';
  attachmentUrl?: string;
  timestamp: string;
  isRead: boolean;
  readAt?: string;
  reactions?: {
    emoji: string;
    count: number;
    userIds: string[];
  }[];
}

export interface Chat {
  id: string;
  participants: string[]; // User IDs
  participantDetails: ChatParticipant[];
  lastMessage?: ChatMessage;
  lastMessageTime?: string;
  unreadCount: number;
  isGroup: boolean;
  groupName?: string;
  groupIcon?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatParticipant {
  id: string;
  name: string;
  avatar?: string;
  phone?: string;
  isOnline?: boolean;
  lastSeen?: string;
}

export interface ChatNotification {
  id: string;
  userId: string;
  chatId: string;
  senderName: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}
