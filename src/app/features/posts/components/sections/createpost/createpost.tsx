import CreatePostOpenModal from "@/app/features/users/components/items/create-post-open-modal/createpost";
import { findUserById } from "@/app/features/users/data/data";
import { UserInterface } from "@/app/features/users/interfaces/user.interface";
import {
  faFaceSmile,
  faPhotoFilm,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { cookies } from "next/headers";
import Image from "next/image";
import CreatePostModal from "../../modal/create-post-modal";
import CreateStoryModal from "../../modal/create-story-modal";
import CreateStoryOpenModal from "@/app/features/users/components/items/create-story-open-modal/createstory";

export default async function CreatePostSection() {
  const cookieStore = await cookies();
  const myId = cookieStore.get("userId")?.value;
  const user: UserInterface = await findUserById(myId ?? "");

  return (
    <div className="p-3 w-full">
      <div className="flex flex-row items-center gap-2 border-b border-[var(--color-separator)] pb-3">
        <div className="w-8 h-8 relative rounded-full flex-shrink-0">
          <Image
            src={user.avatarUrl}
            fill
            alt="avatar"
            className="rounded-full"
          />
        </div>

        {/* click to open createPostModal */}
        <CreatePostOpenModal />
      </div>
      <div className="grid grid-cols-12 p-2 justify-items-center text-[var(--foreground-subTitle)] text-sm font-bold">
        <CreateStoryOpenModal />
        <div
          className=" col-span-4 px-6 py-2 rounded-lg cursor-pointer hover:bg-black/30 transition-colors duration-300"
        >
          <span>
            <FontAwesomeIcon
              icon={faPhotoFilm}
              className="mr-2 text-green-800"
              size="lg"
            />
          </span>
          Photos&Video
        </div>
   
        <div className="col-span-4 px-6 py-2 rounded-lg cursor-pointer hover:bg-black/30 transition-colors duration-300">
          <span>
            <FontAwesomeIcon
              icon={faFaceSmile}
              className="mr-2 text-yellow-800"
              size="lg"
            />
          </span>
          Reactions
        </div>
      </div>

      {/* show createPostModal */}
      <CreatePostModal user={user} />
      <CreateStoryModal user={user} />
    </div>
  );
}
