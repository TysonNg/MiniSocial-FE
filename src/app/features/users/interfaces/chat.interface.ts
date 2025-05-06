export interface ChatInterface {
  fromId: string;
  fromUrl: string;
  fromUserName: string;
  message: string;
  toId: string;
}

export interface DataChat extends ChatInterface {
  chatParticipants: string[];
  chatKey: string;
  isRead: boolean;
  message: string;
  readBy: string[];
  timestamp: { seconds: number; nanoseconds: number };
}
