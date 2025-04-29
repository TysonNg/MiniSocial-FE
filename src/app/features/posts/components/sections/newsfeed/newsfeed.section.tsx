"use client";

import { useEffect, useRef, useState } from "react";
import { PostInterface } from "../../../interfaces/post.interface";
import PostItem from "../../items/post/post-item";
import PostModal from "../../modal/post-modal";
import LikeModal from "../../modal/like-modal";
import { usePathname } from "next/navigation";

export default function NewsfeedSection() {
  const [posts, setPosts] = useState<PostInterface[]>([]);
  const [cursor, setCursor] = useState<string | null>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const pathname = usePathname();
  const isFetched = useRef<boolean>(false);

  const fetchPosts = async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);

    const res = await fetch(`/api/post/all-posts?cursor=${cursor}`, {
      method: "GET",
    });

    if (!res.ok) {
      const error = await res.json();
      console.error("Error fetching posts:", error.message);
      return;
    }

    const { data }: { data: PostInterface[] } = await res.json();
    setPosts((prev) => [...prev, ...data]);

    if (data.length > 0) {
      setTimeout(() => {
        setIsLoading(false);
        setHasMore(true);
      }, 500);
    }

    if (data.length === 0) {
      setTimeout(() => {
        setIsLoading(false);
        setHasMore(false);
      }, 100);
      return;
    }

    const lastPost = data[data.length - 1];
    setCursor(lastPost.createdAt);
  };

  const handleNewPost = () => {
    setPosts([]);
    setCursor(null);
    setHasMore(true);
    isFetched.current = false;
    fetchPosts();
  };
  useEffect(() => {
    if (posts.length === 0 && !isFetched.current) {
      fetchPosts();
      isFetched.current = true;
    }

    const handleUpdateCommentPost = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { comment } = customEvent.detail;

      setPosts((prev) =>
        prev.map((p) =>
          p.postId === comment.postId
            ? {
                ...p,
                comments: [...p.comments, comment],
              }
            : p
        )
      );
    };

    window.addEventListener("newPost", handleNewPost);
    window.addEventListener("newComment", handleUpdateCommentPost);
    return () => {
      window.removeEventListener("newPost", handleNewPost);

      window.removeEventListener("newComment", handleUpdateCommentPost);
    };
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      const isBottom =
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 50;
      if (isBottom && !isLoading && hasMore) {
        fetchPosts();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [cursor, isLoading, hasMore]);

  return (
    <>
      <div className="w-full flex flex-col gap-4">
        {posts.map((post, i) => {
          return (
            <div key={post.postId}>
              <PostItem post={post} i={i} />
            </div>
          );
        })}
      </div>
      {isLoading && hasMore && (
        <div className="w-full flex flex-col gap-6 px-2 py-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className=" animate-pulse space-y-3 border-b border-[var(--color-separator)] pb-5"
            >
              {/* Avatar + Name */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gray-300 rounded-full" />
                <div className="flex-1">
                  <div className="h-4 w-32 bg-gray-300 rounded" />
                  <div className="h-3 w-20 bg-gray-300 rounded mt-1" />
                </div>
              </div>

              {/* Image placeholder */}
              <div className="w-full h-[400px] bg-gray-300 rounded-md" />

              {/* Action buttons */}
              <div className="flex gap-4 pt-2">
                <div className="w-6 h-6 bg-gray-300 rounded" />
                <div className="w-6 h-6 bg-gray-300 rounded" />
              </div>

              {/* Likes & Text */}
              <div className="h-4 w-24 bg-gray-300 rounded" />
              <div className="flex gap-2">
                <div className="h-4 w-16 bg-gray-300 rounded" />
                <div className="h-4 w-32 bg-gray-300 rounded" />
              </div>
              <div className="h-4 w-36 bg-gray-300 rounded" />
            </div>
          ))}
        </div>
      )}

      <PostModal />
      <LikeModal />

      {!hasMore && (
        <div className="text-center py-2 font-bold text-sm">
          Haven&#39;t more post yet !
        </div>
      )}
    </>
  );
}
