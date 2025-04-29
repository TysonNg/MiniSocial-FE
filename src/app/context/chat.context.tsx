"use client";

import { createContext, useContext, useState } from "react";
import { ChatInterface } from "../features/users/interfaces/chat.interface";

interface ChatContextType {
 messagesHistory: ChatInterface[]|[];
 setMessagesHistory: React.Dispatch<React.SetStateAction<ChatInterface[]>>
}


const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {

    const [messagesHistory, setMessagesHistory] = useState<ChatInterface[]>([])

  return (
    <ChatContext.Provider
      value={{setMessagesHistory, messagesHistory }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useReply must be used within a ReplyProvider");
  }
  return context;
}
