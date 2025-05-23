"use client";
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "../context/auth.context";
import { UserInterface } from "../features/users/interfaces/user.interface";

export const useChatSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const { userId } = useAuth();

  useEffect(() => {
    if (!userId) return;
    const connectSocket = async () => {
      try {
        const res = await fetch(`/api/user/get-my-user`,{
          method: "GET"
        });

        
        if(!res.ok){
          throw new Error('Error to fetch')
        }
        const data = await res.json();

        const { token, userId } = data;

        if (!token || !userId) {
          console.error("No token or userId found");
          return;
        }
        const resUser = await fetch(
          `/api/user/find-user-by-id?userId=${userId}`
        );
        const user: UserInterface = await resUser.json();
        if (!user) return;

        const socket = io(
          `${
            process.env.NEXT_PUBLIC_SOCKET_URL ||
            "https://minisocial-be.onrender.com"
          }/chat`,
          {
            auth: {
              token,
              userId,
              url: user.avatarUrl,
              userName: user.name,
            },
            transports: ["websocket"],
            autoConnect: true,
            withCredentials: true,
          }
        );

        socketRef.current = socket;

        socket.on("connect", () => {
          setConnected(true);
        });

        socket.on("connect_error", (err) => {
          console.error(" Socket connect error:", err.message);
        });

        socket.on("disconnect", () => {
          setConnected(false);
        });
      } catch (error) {
        console.error( error);
      }
    };

    connectSocket();
    return () => {
      
      socketRef.current?.disconnect();
    };
  }, [userId]);

  
  return {
    socket: socketRef.current,
    connected,
  };
};
