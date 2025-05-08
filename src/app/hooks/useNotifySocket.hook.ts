"use client";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/auth.context";
import { UserInterface } from "../features/users/interfaces/user.interface";
import { Socket } from "socket.io-client";
import { initNotifySocket } from "../ultils/lib/notify-socket";

export const useNotifySocket = () => {
  const [connected, setConnected] = useState(false);
  const { userId } = useAuth();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!userId ) return;
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    const connectSocket = async () => {
      try {
        const res = await fetch(`/api/user/get-my-user`);
        const { token, userId: id } = await res.json();

        if (!token) return;

        const resUser = await fetch(`/api/user/find-user-by-id?userId=${id}`);
        const user: UserInterface = await resUser.json();

        if (!user) return;

        const notifySocket = initNotifySocket({
          token,
          userId: id,
          userName: user.name,
          avatarUrl: user.avatarUrl,
        });
        
        socketRef.current = notifySocket;
        notifySocket.on("connect", () => {
         
          setConnected(true);
        });

        notifySocket.on("disconnect", () => {
          setConnected(false);
        });

        notifySocket.on("connect_error", (err) => {
          console.error("Socket connect error:", err.message);
        });
      } catch (error) {
        console.error("Failed to connect socket:", error);
      }
    };

    if (!socketRef.current) {
      connectSocket();
    }

    return () => {
      
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [userId]);

 

  return {
    notifySocket: socketRef.current,
    connected,
  };
};
