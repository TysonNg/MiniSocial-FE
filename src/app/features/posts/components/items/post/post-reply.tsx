"use client";

import Image from "next/image";
import formatTime from "@/app/ultils/format-time.ultil";
import { CommentNode } from "@/app/ultils/comment-tree.ultil";
import { useReply } from "@/app/context/reply.context";
import { useRouter } from "next/navigation";
import { useModal } from "@/app/context/modal.context";

export default function PostReply({
  comment,
  focusTextarea,
}: {
  comment: CommentNode;
  focusTextarea: () => void;
}) {
  const { replyComment } = useReply();
  const router = useRouter()
  const {closePostModal} =  useModal()
  
  const handleReply = () => {
    replyComment({
      comment: {
        parent_comment_id: comment.commentId,
        postId: comment.postId,
        content: `@${comment.name || "user"}`,
      },
      user: {
        avatarUrl: comment.avatarUrl ?? "",
        name: comment.name ?? "",
      },
    });
    focusTextarea();
  };

  const handleDirectUserPage = (userId: string) => {
    router.push(`/${userId}`)
      closePostModal()
  }
  
 
  return (
    <div className="pl-4 pt-2 border-l border-gray-200">
      <div className="flex gap-3 items-center">
        <div className="w-8 h-8 relative rounded-full">
          <Image
            src={comment.avatarUrl || "/default.jpg"}
            fill
            alt="avatar"
            className="rounded-full"
          />
        </div>
        <div className="flex flex-row gap-2">
            <div className="font-semibold text-sm cursor-pointer" onClick={() => handleDirectUserPage(comment.userId)}>{comment.name}</div>
          <div className="text-sm">{comment.content}</div>
        </div>
      </div>
      <div className="text-xs pl-11 text-gray-500">
        {formatTime(comment.createdAt)}
      </div>

      <div
        className="text-xs mt-1 pl-11 text-gray-600 cursor-pointer"
        onClick={handleReply}
      >
        Reply
      </div>

      {/* Replies children */}
      {comment.children.map((child) => (
        <PostReply
          key={child.commentId}
          comment={child}
          focusTextarea={focusTextarea}
        />
      ))}
    </div>
  );
}
