"use client";
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "../context/auth.context";
import { UserInterface } from "../features/users/interfaces/user.interface";

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const { userId } = useAuth();

  useEffect(() => {
    if (!userId) return;
    const connectSocket = async () => {
      try {
        const res = await fetch(`api/user/get-my-user`);
        const data = await res.json();

        const { token, userId } = data;

        if (!token || !userId) {
          console.error("No token or userId found");
          return;
        }
        const resUser = await fetch(`api/user/find-user-by-id?userId=${userId}`)
        const user:UserInterface = await resUser.json()
        if(!user) return;

        const socket = io("https://minisocial-be.onrender.com/", {
          auth: {
            token,
            userId,
            url: user.avatarUrl,
            userName: user.name
          },
          transports: ["websocket"],
          autoConnect: true,
          withCredentials: true
        });

        socketRef.current = socket;

        socket.on("connect", () => {
          console.log(" Socket connected:", socket.id);
          setConnected(true);
        });

        socket.on("connect_error", (err) => {
          console.error(" Socket connect error:", err.message);
        });

        socket.on("disconnect", () => {
          console.log(" Socket disconnected");
          setConnected(false);
        });
      } catch (error) {
        console.error("Failed to fetch user:", error);
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
