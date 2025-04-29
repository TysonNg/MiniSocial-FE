"use client";

import { ReactNode } from "react";
import { ModalProvider } from "./modal.context";
import { ReplyProvider } from "./reply.context";
import { FollowProvider } from "./follow.context";
import { AuthProvider } from "./auth.context";
import { ChatProvider } from "./chat.context";

export const GlobalProvider = ({ children }: { children: ReactNode }) => {
  return (
    <AuthProvider>
      <FollowProvider>
        <ModalProvider>
          <ChatProvider>
            <ReplyProvider>{children}</ReplyProvider>
          </ChatProvider>
        </ModalProvider>
      </FollowProvider>
    </AuthProvider>
  );
};
