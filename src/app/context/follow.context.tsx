"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./auth.context";

interface FollowContextType {
    myFollowedUserIds: Set<string>;
    myFollowersUserIds: Set<string>;
 

    toggleMyFollow: (userId: string) => void;
    isMyFollowed: (userId: string, title: string) => boolean;
}

const FollowContext = createContext<FollowContextType | undefined>(undefined);

export function FollowProvider({ children }: { children: React.ReactNode }) {

  const [myFollowedUserIds, setMyFollowedUserIds] = useState<Set<string>>(
    new Set()
  );

  const [myFollowersUserIds, setMyFollowersUserIds] = useState<Set<string>>(
    new Set()
  );

  const {userId} = useAuth()


  const fetchMyFollowedUsers = async () => {
    try {
      const res = await fetch(`/api/user/get-my-following`);
      const data = await res.json();
      const {metadata: {usersId}} = data
        
      if (Array.isArray(usersId)) {
        setMyFollowedUserIds(new Set(usersId));
      }
    } catch (error) {
      console.error("Error fetching followed users:", error);
    }
  };

  const fetchMyFollowersUsers = async () => {
    try {
      const res = await fetch(`/api/user/get-my-followers`);
      const data = await res.json();

      const {users} = data
        
      if (Array.isArray(users)) {
        setMyFollowersUserIds(new Set(users));
      }
    } catch (error) {
      console.error("Error fetching followed users:", error);
    }
  };
  
  


  useEffect(() => {
    if(userId){
      fetchMyFollowersUsers()
      fetchMyFollowedUsers()
    }
        
  
  }, [userId]);


  const toggleMyFollow = (userId: string) => {
        setMyFollowedUserIds((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(userId)) {
              newSet.delete(userId);
            } else {
              newSet.add(userId);
            }
            return newSet;
          });
    
  };

  const isMyFollowed = (userId: string, title: string) => {
    if(title === "Followings"){
      
        return myFollowedUserIds.has(userId);
    }else{
      
    return myFollowersUserIds.has(userId);
    }
  };

  return (
    <FollowContext.Provider
      value={{ isMyFollowed, toggleMyFollow, myFollowedUserIds, myFollowersUserIds }}
    >
      {children}
    </FollowContext.Provider>
  );
}

export function useFollow() {
  const context = useContext(FollowContext);
  if (!context) {
    throw new Error("useReply must be used within a ReplyProvider");
  }
  return context;
}
