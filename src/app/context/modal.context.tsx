"use client";

import { createContext, useContext, useState } from "react";
import { PostInterface } from "../features/posts/interfaces/post.interface";
import { UserInterface } from "../features/users/interfaces/user.interface";
import { useChatSocket } from "../hooks/useChatSocket.hook";

interface ModalContextType {
  isModalOpen: boolean;
  isStoryModalOpen: boolean;
  isPostModalOpen: boolean;
  selectedPost: PostInterface | null;
  isLikeModalOpen: boolean;
  selectedPostLike: PostInterface | null;
  isCreatePostModalOpen: boolean;
  isFollowModal: boolean;
  isChatModal: boolean;
  selectedUser: UserInterface | null;
  isCreateStoryModalOpen: boolean;

  openModal: () => void;
  closeModal: () => void;
  handleShowModal: () => void;
  openStoryModal: () => void;
  closeStoryModal: () => void;
  openPostModal: (post: PostInterface) => void;
  closePostModal: () => void;
  openLikeModal: (post: PostInterface) => void;
  closeLikeModal: () => void;
  openCreatePostModal: () => void;
  closeCreatePostModal: () => void;
  openFollowModal: () => void;
  closeFollowModal: () => void;
  openChatModal: (user: UserInterface) => void;
  closeChatModal: () => void;
  openChatModalWithUser: (user: UserInterface) => void;
  openCreateStoryModal: () => void;
  closeCreateStoryModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isStoryModalOpen, setIsStoryModalOpen] = useState<boolean>(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState<boolean>(false);
  const [selectedPost, setSelectedPost] = useState<PostInterface | null>(null);
  const [selectedPostLike, setSelectedPostLike] =
    useState<PostInterface | null>(null);
  const [isFollowModal, setIsFollowModal] = useState<boolean>(false);
  const [isLikeModalOpen, setIsLikeModalOpen] = useState<boolean>(false);
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] =
    useState<boolean>(false);

  const [isChatModal, setIsChatModal] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<UserInterface | null>(null);
  const [isCreateStoryModalOpen, setIsCreateStoryModalOpen] =
    useState<boolean>(false);

  const { socket } = useChatSocket();

  const openCreateStoryModal = () => {
    setIsCreateStoryModalOpen(true);
  };

  const closeCreateStoryModal = () => {
    setIsCreateStoryModalOpen(false);
  };

  const openChatModalWithUser = (user: UserInterface) => {
    setSelectedUser(user);
    setIsChatModal(true);
  };

  const openChatModal = (user: UserInterface) => {
    if (user.id !== selectedUser?.id) {
      setSelectedUser(user);
    }
    
    socket?.emit("markMessagesAsRead", {
      toId: selectedUser?.id,
    });

    setIsChatModal(true);
    window.dispatchEvent(new Event("seen"));
  };

  const closeChatModal = () => {
    setIsChatModal(false);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
  };
  const handleShowModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const openStoryModal = () => {
    setIsStoryModalOpen(true);
  };
  const closeStoryModal = () => {
    setIsStoryModalOpen(false);
  };

  const openPostModal = (post: PostInterface) => {
    setSelectedPost(post);
    setIsPostModalOpen(true);
  };
  const closePostModal = () => {
    setSelectedPost(null);
    setIsPostModalOpen(false);
  };

  const openLikeModal = (post: PostInterface) => {
    setSelectedPostLike(post);
    setIsLikeModalOpen(true);
  };

  const closeLikeModal = () => {
    setSelectedPostLike(null);
    setIsLikeModalOpen(false);
  };

  const openCreatePostModal = () => {
    setIsCreatePostModalOpen(true);
  };

  const closeCreatePostModal = () => {
    setIsCreatePostModalOpen(false);
  };

  const openFollowModal = () => {
    setIsFollowModal(true);
  };

  const closeFollowModal = () => {
    setIsFollowModal(false);
  };
  return (
    <ModalContext.Provider
      value={{
        isModalOpen,
        openModal,
        closeModal,
        handleShowModal,
        openStoryModal,
        closeStoryModal,
        isStoryModalOpen,
        isPostModalOpen,
        openPostModal,
        closePostModal,
        selectedPost,
        openLikeModal,
        closeLikeModal,
        isLikeModalOpen,
        selectedPostLike,
        openCreatePostModal,
        closeCreatePostModal,
        isCreatePostModalOpen,
        closeFollowModal,
        openFollowModal,
        isFollowModal,
        isChatModal,
        closeChatModal,
        openChatModal,
        selectedUser,
        openChatModalWithUser,
        closeCreateStoryModal,
        openCreateStoryModal,
        isCreateStoryModalOpen,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
}
