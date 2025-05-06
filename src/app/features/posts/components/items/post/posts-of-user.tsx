"use client";
import Image from "next/image";
import { PostInterface } from "../../../interfaces/post.interface";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImages, faTableCellsLarge } from "@fortawesome/free-solid-svg-icons";
import PostModal from "../../modal/post-modal";
import { useModal } from "@/app/context/modal.context";
import LikeModal from "../../modal/like-modal";
import { NotHavePosts } from "@/app/not-found";

export default function PostsOfUser({ posts }: { posts: PostInterface[] }) {
  const { openPostModal } = useModal();

  return (
    <div className="max-w-[315px] sm:max-w-[435px] lg:max-w-[735px] 2xl:max-w-[935px] flex flex-col mx-auto mt-10 border-t border-[var(--color-separator)]">
      <div className="place-self-center w-fit border-t border-black font-bold p-3 text-sm cursor-pointer">
        <span className="mr-1 cursor-pointer">
          <FontAwesomeIcon icon={faTableCellsLarge} size="sm" />
        </span>
        Posts
      </div>
      {posts.length > 0 && (
        <div className="grid grid-cols-12 gap-1">
          {posts.map((post) => {
            return (
              <div className="col-span-4" key={post.postId}>
                <div
                  className="relative w-[105px] h-[110px] sm:w-[145px] sm:h-[210px] lg:w-[245px] lg:h-[310px] 2xl:w-[307px] 2xl:h-[410px]"
                  onClick={() => openPostModal(post)}
                >
                  <div className="bg-black w-full h-full"></div>
                  <Image
                    className="cursor-pointer hover:opacity-80 transition-all duration-300"
                    src={post.imgsUrl[0]}
                    fill
                    alt="img"
                  />
                  <div
                    className={`${
                      post.imgsUrl.length > 1 ? "" : "hidden"
                    } absolute top-2 right-2`}
                  >
                    <FontAwesomeIcon
                      className="text-[#c1bebe]"
                      icon={faImages}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {posts.length === 0 && <NotHavePosts />}
      <PostModal />
      <LikeModal />
    </div>
  );
}
