"use client";
import Image from "next/image";
import { useModal } from "@/app/context/modal.context";
import React, { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleLeft,
  faAngleRight,
  faCircleXmark,
} from "@fortawesome/free-solid-svg-icons";
import { formatTime } from "@/app/ultils/format-time.ultil";
import { CommentPayload } from "@/app/api/post/comment/route";
import { useReply } from "@/app/context/reply.context";
import { buildCommentTree, CommentNode } from "@/app/ultils/comment-tree.ultil";
import PostReply from "../items/post/post-reply";
import { CommentInterface } from "../../interfaces/post.interface";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useNotifySocket } from "@/app/hooks/useNotifySocket.hook";
import { AuthSocket } from "@/app/shared/header/notify/notify.component";

export default function PostModal() {
  const {
    isPostModalOpen,
    closePostModal,
    openLikeModal,
    selectedPost: post,
  } = useModal();
  const [isLike, setIsLike] = useState<boolean>(false);
  const [numsOfLike, setNumsOfLike] = useState<number>(0);
  const [isCommented, setIsCommented] = useState<boolean>(false);
  const { commentContext, isReply, setCommentContext, notReply } = useReply();
  const [comments, setComments] = useState<CommentInterface[]>(
    post?.comments ?? []
  );

  const pathname = usePathname();
  const router = useRouter();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [commentTree, setCommentTree] = useState<CommentNode[]>([]);
  const [num, setNum] = useState<number>(1);
  const imageRef: React.RefObject<HTMLDivElement | null> =
    useRef<HTMLDivElement | null>(null);
  const imgOffsetRef = useRef<number>(0);

  const slideImgRight = () => {
    if (!imageRef.current) return;
    const imageRefWidth = imageRef.current.clientWidth;
    setNum((prev) => prev + 1);
    imgOffsetRef.current += imageRefWidth;

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

  const fetchUserData = async (userId: string) => {
    const res = await fetch(`/api/user/find-user-by-id?userId=${userId}`);
    const data = await res.json();
    return data;
  };

  const addUsersDataToComments = async (comments: CommentInterface[]) => {
    const commentsWithUser = await Promise.all(
      comments.map(async (comment) => {
        const userData = await fetchUserData(comment.userId);
        return {
          ...comment,
          avatarUrl: userData.avatarUrl,
          name: userData.name,
        };
      })
    );

    return commentsWithUser;
  };

  const handleFocusTextarea = () => {
    textareaRef.current?.focus();
  };

  const handleLikePost = async (postId: string) => {
    if (!isLike) {
      const res = await fetch(`api/post/like-post`, {
        method: "POST",
        body: postId,
      });
      const data = await res.json();
      setIsLike(!isLike);
      window.dispatchEvent(new Event("newLike"));
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
  const { notifySocket } = useNotifySocket();

  const [comment, setComment] = useState<CommentPayload>({
    content: "",
    parent_comment_id: null,
    postId: post?.postId || "",
    fromUserId: "",
  });

  // handlePostComment
  const handlePostComment = async () => {
    const isReplyValid =
      isReply &&
      commentContext?.comment.content.startsWith(
        `@${commentContext.user.name}`
      );
    const payload: CommentPayload | undefined = isReplyValid
      ? commentContext?.comment
      : {
          content: comment.content,
          parent_comment_id: null,
          postId: post?.postId || "",
          fromUserId: post?.userId || "",
        };

    console.log("payload", payload);

    const res = await fetch(`api/post/comment`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const data: CommentInterface = await res.json();

      if (payload?.fromUserId !== (notifySocket?.auth as AuthSocket).userId) {
        notifySocket?.emit("newReplyComment", {
          toUser: payload?.fromUserId,
          postId: data.postId,
        });
      }
      const newComments = [...comments, data];
      setComments(newComments);
      const enrichedComments = await addUsersDataToComments(newComments);
      const newCommentTree = buildCommentTree(enrichedComments ?? []);
      setCommentTree(newCommentTree);

      const event = new CustomEvent("newComment", {
        detail: {
          comment: data,
        },
      });

      window.dispatchEvent(event);

      setIsCommented(true);
      setTimeout(() => {
        if (isReply) {
          setCommentContext((prev) => ({
            ...prev,
            comment: {
              content: "",
              parent_comment_id: null,
              postId: "",
              fromUserId: "",
            },
          }));
        }
        setComment({
          content: "",
          parent_comment_id: null,
          postId: "",
          fromUserId: "",
        });
        setIsCommented(false);
      }, 1500);
    }
  };

  //direct to user page
  const handleDirectUserPage = (userId: string) => {
    router.push(`/${userId}`);
    closePostModal();
  };

  useEffect(() => {
    if (isPostModalOpen) {
      document.body.style.overflow = "hidden";
      setNum(1);
      imgOffsetRef.current = 0;
    } else {
      document.body.style.overflow = "auto";
    }

    const setLike = async () => {
      const res = await fetch(
        `api/post/get-users-like-post?postId=${post?.postId}`
      );
      const data = await res.json();
      const { datas } = data;
      setNumsOfLike(datas.users.length);
      setIsLike(data.isHaveUser);
    };
    setLike();

    window.addEventListener("newLike", setLike);

    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("newLike", setLike);
    };
  }, [isPostModalOpen]);

  useEffect(() => {
    if (post?.comments) {
      setComments(post.comments);
    }
  }, [post, post?.postId]);

  useEffect(() => {
    const enrichComments = async () => {
      const enrichedComments = await addUsersDataToComments(comments);
      const tree = buildCommentTree(enrichedComments ?? []);
      setCommentTree(tree);
    };

    enrichComments();
  }, [comments]);

  useEffect(() => {
    closePostModal();
  }, [pathname]);

  if (!isPostModalOpen || !post) return null;
  return (
    <div
      className="fixed inset-0 z-[100] flex justify-center bg-black/10 items-center "
      onClick={closePostModal}
    >
      {/* Modal content */}
      <div
        className=" w-full h-screen max-w-[300px] max-h-fit sm:max-w-[500px] sm:max-h-[400px]  md:max-w-[700px] md:max-h-[600px] lg:max-w-[900px] lg:max-h-[700px] 2xl:max-w-[1500px] 2xl:max-h-[1257px] bg-white flex flex-col sm:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left side */}
        <div className="w-[950px] max-w-[300px] max-h-[300px] sm:max-w-[500px] sm:max-h-[400px] md:max-w-[700px] md:max-h-[600px] lg:max-w-[900px] lg:max-h-[700px] 2xl:max-w-[1500px]  2xl:max-h-[1257px] relative overflow-clip">
          <div
            ref={imageRef}
            className="transition-transform flex flex-row duration-300 ease-in-out"
          >
            {post.imgsUrl.map((img, i) => (
              <div
                key={img}
                className="w-full h-[1257px] max-w-[300px] max-h-[300px] sm:max-w-[500px] sm:max-h-[400px] md:max-w-[700px] md:max-h-[600px] lg:max-w-[900px] lg:max-h-[700px] 2xl:max-w-[1500px] 2xl:max-h-[1257px] relative flex-shrink-0"
              >
                <Image
                  src={img}
                  alt={`post-image-${i}`}
                  fill
                  className=" rounded-md"
                />
              </div>
            ))}
          </div>

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

        {/* Right side */}
        <div className="w-full max-w-[300px] sm:max-w-[550px] relative flex flex-col ">
          {/* User and close btn */}
          <div className="flex flex-row items-center p-4 gap-3 border-b border-[var(--color-separator)]">
            <span className="w-8 h-8 relative rounded-full">
              <Image
                src={post.user.avatarUrl}
                fill
                alt={`avatar_${post.postId}`}
                className="rounded-full"
              />
            </span>
            <span
              className="font-semibold text-sm cursor-pointer"
              onClick={() => handleDirectUserPage(post.userId)}
            >
              {post.user.name}
            </span>
          </div>

          <button
            onClick={closePostModal}
            className="absolute text-gray-700 top-2 right-2 font-light text-2xl cursor-pointer hover:text-red-400"
          >
            <FontAwesomeIcon icon={faCircleXmark} />
          </button>

          {/* Content section*/}
          <section className="p-4  h-fit md:h-screen max-h-[250px] sm:max-h-270 overflow-y-auto scrollbar-hide">
            <div className="flex flex-row gap-3">
              <div className="w-8 h-8 relative rounded-full ">
                <Image
                  src={post.user.avatarUrl}
                  fill
                  alt={`avatar_${post.postId}`}
                  className="rounded-full "
                />
              </div>

              <div className="w-full">
                <span
                  className="font-semibold text-xs cursor-pointer"
                  onClick={() => handleDirectUserPage(post.userId)}
                >
                  {post.user.name}
                </span>
                <span className="ml-2 text-sm">{post.content}</span>
              </div>
            </div>

            <div className="pl-11 text-sm text-[#666]">
              {formatTime(post.createdAt)}
            </div>

            {/*Show Comment  section*/}
            <div className="mt-3">
              {commentTree?.map((comment) => (
                <PostReply
                  key={comment.commentId}
                  comment={comment}
                  focusTextarea={handleFocusTextarea}
                />
              ))}
            </div>
          </section>

          {/* Interact Place */}
          <div className=" bg-white pl-4 w-full bottom-20 z-1 border-t-1 border-[var(--color-separator)]">
            <div className="interact flex flex-row gap-3 pt-2 ">
              <div
                className={`text-2xl cursor-pointer active:scale-110 ${
                  isLike ? "animate-like" : ""
                }`}
                onClick={() => handleLikePost(post.postId)}
              >
                {isLike ? `❤️` : `🤍`}
              </div>
              <div
                className="text-2xl cursor-pointer active:scale-110"
                onClick={handleFocusTextarea}
              >
                💬
              </div>
            </div>
            <div
              className="text-sm font-bold px-2 pt-1 cursor-pointer"
              onClick={() => openLikeModal(post)}
            >
              {numsOfLike} likes
            </div>
            <div className="text-xs text-[var(--foreground-subTitle)] px-2">
              {formatTime(post.createdAt)} ago
            </div>
          </div>

          {/* Comment Place */}
          <div className="w-full text-sm mt-3 flex flex-row items-center border-t-1 border-[var(--color-separator)] ">
            <textarea
              ref={textareaRef}
              className="w-full max-h-[58px]  px-2 py-3 border-none outline-none resize-none overflow-y-auto"
              placeholder="Add a comment....."
              onChange={(e) => {
                const value = e.target.value;
                if (!value.startsWith(`@${commentContext?.user.name}`)) {
                  notReply();
                }
                if (isReply) {
                  setCommentContext((prev) => ({
                    ...prev,
                    comment: {
                      ...prev.comment,
                      content: value,
                    },
                  }));
                } else {
                  setComment((prev) => ({
                    ...prev,
                    content: value,
                    postId: post.postId,
                  }));
                }
              }}
              value={
                isReply && commentContext?.comment.content !== ""
                  ? commentContext?.comment.content
                  : comment?.content
              }
              rows={4}
            />

            <div className="">
              <button
                className="w-10 h-5 pr-10 font-bold text-xs  cursor-pointer"
                onClick={handlePostComment}
              >
                <p
                  className={`${isCommented ? "hidden" : ""} ${
                    comment?.content === "" ? "text-gray-500" : "text-blue-500"
                  } transition-colors duration-300`}
                >
                  Post
                </p>
                <span
                  className={`${
                    isCommented ? "opacity-100" : "opacity-0"
                  } transition-opacity duration-300`}
                >
                  ✅
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
