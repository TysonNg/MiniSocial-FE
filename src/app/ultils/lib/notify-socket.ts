import { io, Socket } from "socket.io-client";

let notifySocket: Socket | null = null;

export const initNotifySocket = ({
  token,
  userId,
  userName,
  avatarUrl,
}: {
  token: string;
  userId: string;
  userName: string;
  avatarUrl: string;
}): Socket => {  
  if (!notifySocket) {
    notifySocket = io(
      `${process.env.NEXT_PUBLIC_SOCKET_URL || "https://minisocial-be.onrender.com"}/notify`,
      {
        auth: {
          token,
          userId,
          userName,
          url: avatarUrl,
        },
        transports: ["websocket"],
        autoConnect: true,
        withCredentials: true,
      }
    );

    notifySocket.on('disconnect', () => {
      notifySocket = null
    })
  }
  return notifySocket;
};
