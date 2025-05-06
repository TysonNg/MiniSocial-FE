"use client";

import { useModal } from "@/app/context/modal.context";
import { faCamera} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function CreateStoryOpenModal() {
  const { openCreateStoryModal } = useModal();
  return (
    <div className="col-span-4 px-6 py-2 rounded-lg cursor-pointer hover:bg-black/30 transition-colors duration-300 text-xs sm:text-sm text-nowrap" onClick={openCreateStoryModal}>
      <span>
        <FontAwesomeIcon
          icon={faCamera}
          className="mr-2 text-red-800 "
        />
      </span>
      Story
    </div>
  );
}
