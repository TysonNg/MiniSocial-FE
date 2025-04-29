'use client'

import { useModal } from "@/app/context/modal.context";

export default function CreatePostOpenModal() {
  const {openCreatePostModal} = useModal()
  return (
    <div className="p-2 bg-[var(--color-background)] w-full max-w-[600px] text-sm rounded-full cursor-pointer hover:bg-black/30 transition-colors duration-300" onClick={openCreatePostModal}>
      <div className="text-[var(--foreground-subTitle)]">
        <span>How&#39;re you today?</span>
      </div>
    </div>
  );
}
