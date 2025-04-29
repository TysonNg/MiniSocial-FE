'use client'

import { useModal } from "@/app/context/modal.context"

export default function StoryWrapper(){
    const {closeStoryModal, isStoryModalOpen} = useModal()
    return(
        <div
        className={`${
          isStoryModalOpen ? "" : "hidden"
        } fixed inset-0  backdrop-blur-sm w-full z-5 h-full bg-black opacity-50 `}
        onClick={closeStoryModal}
      ></div>
    )
}