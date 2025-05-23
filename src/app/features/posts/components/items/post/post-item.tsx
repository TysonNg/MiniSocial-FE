"use client";
import { useEffect, useRef, useState } from "react";

import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleLeft,
  faAngleRight,
  faEllipsisVertical,
} from "@fortawesome/free-solid-svg-icons";
import { useModal } from "@/app/context/modal.context";
import { CommentPayload } from "@/app/api/post/comment/route";
import { formatTime } from "@/app/ultils/format-time.ultil";
import { ShowMoreText } from "../../buttons/show-more-text";
import { PostInterface } from "../../../interfaces/post.interface";
import Link from "next/link";
import { useFollow } from "@/app/context/follow.context";
import { UpdatePostModal } from "../../modal/update-post-modal";
import { useNotifySocket } from "@/app/hooks/useNotifySocket.hook";
interface PostItemProps {
  post: PostInterface;
  i: number;
}

export default function PostItem(props: PostItemProps) {
  const { post, i } = props;

  const imageRef: React.RefObject<HTMLDivElement | null> =
    useRef<HTMLDivElement | null>(null);
  const [isLike, setIsLike] = useState<boolean>(false);
  const [numsOfLike, setNumsOfLike] = useState<number>(0);
  const [comment, setComment] = useState<CommentPayload>({
    content: "",
    parent_comment_id: null,
    postId: post.postId,
    fromUserId: ''
  });
  const [isPostSettings, setIsPostSettings] = useState<boolean>(false);
  const [isUpdateModal, setIsUpdateModal] = useState<boolean>(false);
  const [isCommented, setIsCommented] = useState<boolean>(false);
  const [num, setNum] = useState<number>(1);
  const [myId, setMyId] = useState<string>("");
  const { isMyFollowed, toggleMyFollow } = useFollow();

  const { notifySocket } = useNotifySocket();

  const handleForcusTextArea = () => {
    textareaRef.current?.focus();
  };
  const { openPostModal, openLikeModal } = useModal();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imgOffsetRef = useRef<number>(0);

  const handleDoubleClick = (postId: string, post: PostInterface) => {
    handleLikePost(postId, post);
  };

  const handleLikePost = async (postId: string, post: PostInterface) => {
    if (!isLike) {
      const res = await fetch(`api/post/like-post`, {
        method: "POST",
        body: postId,
      });
      const data = await res.json();
      setIsLike(!isLike);
      window.dispatchEvent(new Event("newLike"));

      if (notifySocket && post.userId !== myId) {
        notifySocket.emit("newLike", {
          toUser: post.userId,
          postId,
        });
      }

      return data;
    } else {
      const res = await fetch(`api/post/like-post?postId=${postId}`, {
        method: "PUT",
        body: postId,
      });
      const data = await res.json();
      window.dispatchEvent(new Event("newLike"));
      setIsLike(!isLike);
      return data;
    }
  };

  const deletePost = async (postId: string) => {
    const res = await fetch(`/api/post/delete-post`, {
      method: "DELETE",
      body: postId,
    });
    const data = await res.json();

    if (data) {
      alert(data.data.message);
      location.reload();
    }
  };

  const slideImgRight = () => {
    if (!imageRef.current) return;
    const imgRefWidth = imageRef.current.clientWidth;
    setNum((prev) => prev + 1);
    imgOffsetRef.current += imgRefWidth;

    if (imageRef.current) {
      imageRef.current.style.transform = `translateX(-${imgOffsetRef.current}px)`;
    }
  };

  const slideImgLeft = () => {
    if (!imageRef.current) return;
    const imgRefWidth = imageRef.current.clientWidth;
    setNum((prev) => prev - 1);

    imgOffsetRef.current = imgOffsetRef.current - imgRefWidth;

    if (imageRef.current) {
      imageRef.current.style.transform = `translateX(-${imgOffsetRef.current}px)`;
    }
  };

  const getMyFollowing = async (userId: string) => {
    await fetch(`api/user/get-my-following?userId=${userId}`);
  };

  const handlePostComment = async () => {
    const res = await fetch(`api/post/comment`, {
      method: "POST",
      body: JSON.stringify(comment),
    });
    if (res.ok) {
      const data = await res.json();

      setIsCommented(true);

      setTimeout(() => {
        setComment({
          content: "",
          parent_comment_id: null,
          postId: post.postId,
          fromUserId: ''
        });
        setIsCommented(false);
      }, 1500);

      const event = new CustomEvent("newComment", {
        detail: {
          postId: comment.postId,
          comment: data,
        },
      });

      if (notifySocket && post.userId !== myId) {
        notifySocket.emit("newCommentToPost", {
          toUser: post.userId,
          postId: post.postId,
        });
      }
      window.dispatchEvent(event);
    }
  };

  const handleFollow = async (userId: string, isFollowed: boolean) => {
    if (isFollowed) {
      await fetch(`api/user/unfollow`, {
        method: "POST",
        body: userId,
      });
    } else {
      await fetch(`api/user/follow`, {
        method: "POST",
        body: userId,
      });

      notifySocket?.emit('newFollow',{
        toUser: userId,
      })
    }
    toggleMyFollow(userId);
  };

  useEffect(() => {
    if (!notifySocket) return;
    const setLike = async () => {
      const res = await fetch(
        `api/post/get-users-like-post?postId=${post.postId}`
      );
      const data = await res.json();
      const { datas, userId } = data;
      setMyId(userId);
      setNumsOfLike(datas.users.length);
      setIsLike(data.isHaveUser);
    };

    getMyFollowing(post.userId);

    setLike();

    window.addEventListener("newLike", setLike);

    return () => {
      window.removeEventListener("newLike", setLike);
    };
  }, [notifySocket]);

  return (
    <div
      key={post.postId}
      className="border-b border-[var(--color-separator)] pb-5"
    >
      <div
        className={`${
          i === 0 ? "pt-5" : ""
        } flex flex-row gap-1 px-1 pb-2 items-center`}
      >
        <Link href={`/${post.userId}`}>
          <div className="flex flex-row gap-1 items-center">
            <div className="w-8 h-8 relative rounded-full cursor-pointer">
              <Image
                src={post.user.avatarUrl}
                className="rounded-full"
                alt="avatarUrl"
                fill
              />
            </div>
            <h1 className="text-sm pl-2 font-semibold cursor-pointer">
              {post.user.name}
            </h1>
          </div>
        </Link>

        <span className="mb-2 text-[#666]">.</span>
        <p className="text-sm text-[#666]">{formatTime(post.createdAt)}</p>
        <span className="mb-2 text-[#666]">.</span>
        <div
          className={`${
            isMyFollowed(post.userId, "Followings")
              ? "px-1 text-[#666]"
              : "bg-[#0095F6] px-5 font-bold text-white"
          } ${
            myId === post.userId ? "hidden" : ""
          } cursor-pointer hover:opacity-65 rounded-md text-sm`}
          onClick={() =>
            handleFollow(post.userId, isMyFollowed(post.userId, "Followings"))
          }
        >
          <button className={` text-sm cursor-pointer`}>
            {isMyFollowed(post.userId, "Followings") ? "Following" : "Follow"}
          </button>
        </div>
      </div>
      <div className=" relative overflow-clip w-full max-w-[350px] sm:max-w-[400px] md:max-w-[500px] lg:max-w-[580px] xl:max-w-[630px]">
        <div
          ref={imageRef}
          className="relative flex flex-row transition-transform duration-300 "
        >
          {post.imgsUrl.map((img, i) => {
            return (
              <div key={i} className="relative min-w-full aspect-[630/468]">
              <Image
                src={img}
                alt="Post Image"
                fill
                className="rounded-md object-cover"
                onDoubleClick={() => handleDoubleClick(post.postId, post)}
              />
            </div>
            );
          })}
        </div>

        {/* Slide img left */}
        <button
          className={`${
            num === 1 ? "hidden" : ""
          } absolute top-1/2 left-0 text-white z-1 border-1 border-white bg-white shadow-lg rounded-full opacity-80 mx-3 cursor-pointer`}
          onClick={slideImgLeft}
        >
          <FontAwesomeIcon
            className="h-7 w-7 text-[var(--foreground-subTitle)]"
            icon={faAngleLeft}
            size="xl"
          />
        </button>

        {/* Slide img right */}
        <button
          className={`${
            num === post.imgsUrl.length ? "hidden" : ""
          } absolute top-1/2 right-0 text-white z-1 border-1 border-white bg-white shadow-lg rounded-full opacity-80 mx-3 cursor-pointer`}
          onClick={slideImgRight}
        >
          <FontAwesomeIcon
            className="h-7 w-7 text-[var(--foreground-subTitle)]"
            icon={faAngleRight}
            size="xl"
          />
        </button>
      </div>

      {/* Interact  */}
      <div className="interact flex flex-row gap-3 pt-2 ">
        <div
          className={`text-2xl cursor-pointer active:scale-110 ${
            isLike ? "animate-like" : ""
          }`}
          onClick={() => handleLikePost(post.postId, post)}
        >
          {isLike ? `❤️` : `🤍`}
        </div>
        <div
          className="text-2xl cursor-pointer active:scale-110"
          onClick={handleForcusTextArea}
        >
          💬
        </div>
      </div>
      <div
        className="text-sm w-15 font-bold px-2 pt-1 cursor-pointer"
        onClick={() => openLikeModal(post)}
      >
        {numsOfLike} likes
      </div>

      {/* user name and post's content */}
      <div className="px-2 pt-1">
        <Link href={`/${post.userId}`}>
          <span className="font-bold w-[20px] text-sm cursor-pointer">
            {post.user.name}
          </span>
        </Link>

        <ShowMoreText text={post.content} maxChars={120} />
      </div>
      <div
        className={`${
          post.comments.length > 0 ? "" : "hidden"
        } comment text-sm px-2 pt-1  text-[var(--foreground-subTitle)] cursor-pointer`}
        onClick={() => openPostModal(post)}
      >
        View all {post.comments.length} comments
      </div>
      <div className="w-full text-sm pt-1 flex flex-row">
        <textarea
          ref={textareaRef}
          className="w-full max-h-[20px] px-2 border-none outline-none resize-none"
          placeholder="Add a comment....."
          onChange={(e) =>
            setComment((prev) => ({
              ...prev,
              content: e.target.value,
              postId: post.postId,
            }))
          }
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handlePostComment();
            }
          }}
          value={comment?.content || ""}
          rows={2}
        />
        {comment?.content.trim() && (
          <button
            className="w-10 h-5 pr-10 font-bold text-xs text-blue-500 cursor-pointer"
            onClick={handlePostComment}
          >
            <p className={`${isCommented ? "hidden" : ""}`}>Post</p>
            <span
              className={`${
                isCommented ? "opacity-100" : "opacity-0"
              } transition-opacity duration-300`}
            >
              ✅
            </span>
          </button>
        )}
      </div>

      {myId === post.userId && (
        <>
          <div
            className={`${
              i === 0 ? "top-6" : "top-2"
            } absolute  right-5 cursor-pointer px-2`}
            onClick={() => {
              setIsPostSettings(!isPostSettings);
            }}
          >
            <FontAwesomeIcon icon={faEllipsisVertical} />
          </div>

          {isPostSettings && (
            <ul
              className={`absolute ${
                i === 0 ? "top-12" : "top-8"
              } right-7 bg-white shadow-lg rounded-md w-32 overflow-hidden z-50`}
            >
              <li className="border-b border-gray-200">
                <div
                  onClick={() => deletePost(post.postId)}
                  className="px-4 py-2 text-red-600 hover:bg-red-500 hover:text-white transition-colors duration-200 cursor-pointer"
                >
                  Delete
                </div>
              </li>
              <li>
                <div
                  onClick={() => {
                    setIsUpdateModal(true);
                    setIsPostSettings(false);
                  }}
                  className="px-4 py-2 text-blue-600 hover:bg-blue-500 hover:text-white transition-colors duration-200 cursor-pointer"
                >
                  Update
                </div>
              </li>
            </ul>
          )}
          <UpdatePostModal
            post={post}
            isUpdateModal={isUpdateModal}
            setIsUpdateModal={setIsUpdateModal}
          />
        </>
      )}
    </div>
  );
}
