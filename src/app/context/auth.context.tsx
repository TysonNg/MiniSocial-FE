"use client";

import { createContext, useContext, useState } from "react";
import Cookies from 'js-cookie';

interface AuthContextType {
  userId: string | null;
  login: (userId: string) => void;
  logout: () => void;
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {

  const id = Cookies.get('id')
  const [userId, setUserId] = useState<string|null>( id||null)


  const login = (userId: string) => {
    Cookies.set('id',userId,{
      path:'/',
      sameSite: 'None',
      secure: true
    })
    setUserId(userId);
  };

  const logout = () => {
    Cookies.remove('id')
    setUserId(null);
  };



  return (
    <AuthContext.Provider
      value={{userId,login,logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useReply must be used within a ReplyProvider");
  }
  return context;
}
