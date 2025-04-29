"use client";

import { useModal } from "@/app/context/modal.context";
import { UserInterface } from "@/app/features/users/interfaces/user.interface";
import Image from "next/image";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImages } from "@fortawesome/free-solid-svg-icons";
import {
  CldUploadWidget,
  CloudinaryUploadWidgetResults,
} from "next-cloudinary";
import { BtnLoading } from "@/app/loading";

export default function CreateStoryModal({ user }: { user: UserInterface }) {
  const { isCreateStoryModalOpen, closeCreateStoryModal } = useModal();

  const [storyUrl, setStoryUrl] = useState<string>("");
  const [publicId, setPublicId] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSuccessUploadImage = (result: CloudinaryUploadWidgetResults) => {
    const event = result.event || "";
    if (event === "success") {
      if (typeof result.info === "object" && result.info !== null) {
        const info = result.info;
        const secureUrl = info?.secure_url || "";
        const uploadedPublicId = info?.public_id || "";

        setStoryUrl(secureUrl);
        setPublicId(uploadedPublicId);
      }
    }
  };

  const handleDeleteUploadImage = async () => {
    if (!publicId) return;
    await fetch(`api/cloudinary/delete-image`, {
      method: "POST",
      body: publicId,
    });
    setStoryUrl("");
    setPublicId("");
  };

  const handlePost = async () => {
    if (!storyUrl) return;
    setIsLoading(true);
    try {
      const res = await fetch(`api/post/create-story`, {
        method: "POST",
        body: JSON.stringify({ storyUrl }),
      });
      if (res.ok) {
        const data = await res.json();
        window.dispatchEvent(new Event("newStory"));
        closeCreateStoryModal();
        return data;
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const cancelCreateStory = async () => {
    await handleDeleteUploadImage();
    closeCreateStoryModal();
  };

  if (!isCreateStoryModalOpen) return null;

  return (
    <div
      className="fixed inset-0 z-100 flex justify-center bg-black/30 items-center"
      onClick={cancelCreateStory}
    >
      <div
        className="w-[500px] h-[500px] bg-white rounded-md relative flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="py-5 border-b border-[var(--color-separator)] relative">
          <h1 className="text-center font-bold text-xl">Create Story</h1>
          <div
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 cursor-pointer"
            onClick={cancelCreateStory}
          >
            <span>X</span>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-col p-5 gap-5 flex-1 overflow-auto">
          {/* User */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 relative rounded-full overflow-hidden">
              <Image fill src={user.avatarUrl} alt="avatar" className="object-cover" />
            </div>
            <p className="font-bold text-sm">{user.name}</p>
          </div>

          {/* Uploaded Image */}
          {storyUrl && (
            <div className="relative w-full h-60">
              <Image src={storyUrl} alt="story" fill className="rounded-md object-cover" />
              <button
                onClick={handleDeleteUploadImage}
                className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center hover:bg-red-600 cursor-pointer"
              >
                X
              </button>
            </div>
          )}

          {/* Upload Button */}
          {!storyUrl && (
            <div className="w-full h-60 flex flex-col items-center justify-center bg-gray-100 rounded-md cursor-pointer hover:bg-gray-200">
              <CldUploadWidget
                uploadPreset="mini_social_story"
                options={{
                  sources: ["local", "url", "unsplash"],
                  multiple: false,
                  folder: "story",
                }}
                onSuccess={(result) => handleSuccessUploadImage(result)}
              >
                {({ open }) => (
                  <div onClick={() => open()}>
                    <FontAwesomeIcon icon={faImages} size="2x" />
                    <p className="font-bold text-sm mt-2">Add Photo or Video</p>
                  </div>
                )}
              </CldUploadWidget>
            </div>
          )}

          {/* Post Button */}
          <button
            onClick={handlePost}
            disabled={!storyUrl || isLoading}
            className="w-full py-3 bg-blue-600 text-white rounded-md font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? <BtnLoading /> : "Post Story"}
          </button>
        </div>
      </div>
    </div>
  );
}
