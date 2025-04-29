"use client";
import { useModal } from "@/app/context/modal.context";
import { UserInterface } from "@/app/features/users/interfaces/user.interface";
import formatTime from "@/app/ultils/format-time.ultil";
import {
  faAngleLeft,
  faAngleRight,
  faCircleXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";

interface StoryInterface {
  storyId: string;
  createdAt: string;
  storyUrl: string;
  user: UserInterface;
  userId: string;
}

interface StoryMap {
  user: UserInterface;
  urls: string[];
  createdAt: string;
}

interface StoriesObject {
  name: string;
  avartar: string;
  createAt: string;
  isSeen: boolean;
  urls: string[];
}

export default function StorySection() {
  const [width, setWidth] = useState<number>(0);
  const [num, setNum] = useState<number>(1);
  const [selectedStory, setSelectedStory] = useState<number>(0);
  const [activeStoryIndex, setActiveStoryIndex] = useState<number>(0);
  const { closeModal, closeStoryModal, isStoryModalOpen, openStoryModal } =
    useModal();

  const [stories, setStories] = useState<StoriesObject[]>([]);

  const maxOfSlide =
    stories.length % 8 === 0
      ? Math.ceil(stories.length / 8) * 2 - 1
      : Math.ceil(stories.length / 8) * 2 - 2;

  const containerRef: React.RefObject<HTMLDivElement | null> =
    useRef<HTMLDivElement | null>(null);

  const handleSelect = (index: number) => {
    setSelectedStory(index);
  };

  const slideNext = () => {
    if (!containerRef.current) return;
    const halfStoryWidth = containerRef.current.clientWidth / 2;
    if (num !== maxOfSlide) {
      setNum((prev) => prev + 1);
    }
    setWidth((prev) => prev + halfStoryWidth);

    if (halfStoryWidth && num < maxOfSlide) {
      containerRef.current.style.transform = `translateX(-${
        width + halfStoryWidth
      }px)`;
    }
  };

  const slidePrev = () => {
    if (!containerRef.current) return;
    const halfStoryWidth = containerRef.current.clientWidth / 2;
    if (width !== 0) {
      setWidth((prev) => prev - halfStoryWidth);
      setNum((prev) => prev - 1);
    }
    if (halfStoryWidth && num > 0) {
      containerRef.current.style.transform = `translateX(-${
        width === 0 ? 0 : width - halfStoryWidth
      }px)`;
    }
  };

  const handleChangeStory = (direction: "next" | "back") => {
    const storyLength = stories?.[selectedStory]?.urls?.length || 0;

    if (direction === "next") {
      if (activeStoryIndex < storyLength - 1) {
        setActiveStoryIndex((prev) => prev + 1);
      } else if (selectedStory < stories.length - 1) {
        setSelectedStory((prev) => {
          setActiveStoryIndex(0);
          return prev + 1;
        });
      }
    } else {
      if (activeStoryIndex > 0) {
        setActiveStoryIndex((prev) => prev - 1);
      } else if (selectedStory > 0) {
        setSelectedStory((prev) => {
          setActiveStoryIndex(stories[prev - 1].urls.length - 1);
          return prev - 1;
        });
      }
    }
  };

  const isFirstStory = selectedStory === 0 && activeStoryIndex === 0;
  const isLastStory =
    selectedStory === stories.length - 1 &&
    activeStoryIndex === (stories[selectedStory]?.urls.length || 0) - 1;

  useEffect(() => {
    if (isStoryModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    const fetchStories = async () => {
      const storyMap = new Map<string, StoryMap>();

      const res = await fetch("api/post/get-stories");
      const data = await res.json();
      const stories = data;
      stories.forEach((story: StoryInterface) => {
        if (!storyMap.has(story.userId)) {
          storyMap.set(story.userId, {
            user: story.user,
            urls: [story.storyUrl],
            createdAt: story.createdAt,
          });
        } else {
          const existingStoryMap = storyMap.get(story.userId);
          if (existingStoryMap) {
            existingStoryMap.urls.push(story.storyUrl);
          }
        }
      });

      const transformedStories: StoriesObject[] = Array.from(
        storyMap.values()
      ).map((story) => ({
        name: story.user.name,
        avartar: story.user.avatarUrl,
        createAt: story.createdAt,
        isSeen: true,
        urls: story.urls,
      }));

      setStories(transformedStories);

      return transformedStories;
    };
    fetchStories();

    document.addEventListener("newStory", fetchStories);

    return () => {
      document.body.style.overflow = "auto";
      document.removeEventListener("newStory", fetchStories);
    };
  }, [isStoryModalOpen]);
  console.log("stories", stories);

  return (
    <div className="relative">
      {/* List Story */}
      <div
        className="overflow-hidden overflow-x-clip w-full z-1"
        onClick={closeModal}
      >
        <button
          onClick={slidePrev}
          className={`absolute border-1 border-white bg-white shadow-lg rounded-full top-7 left-0 cursor-pointer z-5 ${
            num === 1 ? "hidden" : ""
          }`}
        >
          <FontAwesomeIcon
            className="h-7 w-7 text-[var(--foreground-subTitle)]"
            icon={faAngleLeft}
            size="sm"
          />
        </button>
        <div
          ref={containerRef}
          className="story-container flex flex-row scroll-smooth w-full transition-transform duration-500"
        >
          {stories.map((story, index) => (
            <div
              key={index}
              className="flex flex-row gap-1 items-center p-3.5 active:opacity-80 active:scale-90"
              onClick={() => {
                openStoryModal();
                handleSelect(index);
              }}
            >
              <div
                className={`border-1 ${
                  story.isSeen ? "bg-purple-400" : "bg-green-50"
                } p-1 rounded-full cursor-pointer`}
              >
                <div className="w-10 h-10 relative rounded-full border-1 flex items-center justify-center bg-[var(--base-button-background)] ">
                  <Image
                    src={story.avartar}
                    className="rounded-full"
                    fill
                    alt="avatar"
                  />
                </div>
              </div>

              <p className="text-[var(--foreground-subTitle)] hidden">
                {story.name}
              </p>
              <p className="text-[var(--foreground-subTitle)] hidden">
                {new Date(story.createAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
        <button
          onClick={slideNext}
          className={`absolute border-1 border-white bg-white shadow-lg rounded-full top-7 right-3 cursor-pointer z-1 ${
            num === maxOfSlide || stories.length < 8 ? "hidden" : ""
          }`}
        >
          <FontAwesomeIcon
            className="h-7 w-7 text-[var(--foreground-subTitle)]"
            icon={faAngleRight}
            size="sm"
          />
        </button>
      </div>
      <div></div>

      {/* Show Story */}

      <div
        className={`${
          isStoryModalOpen ? "" : "hidden"
        } absolute -inset-21 h-300 w-200 bg-black top-0 z-6 rounded-2xl`}
      >
        <div className="relative h-full ">
          {/* Show avatar */}
          <div className="relative">
            {stories[selectedStory]?.avartar && (
              <div className="absolute top-5 left-5 z-1">
                <div className="w-10 h-10 relative rounded-full">
                  <Image
                    src={stories[selectedStory].avartar}
                    className="rounded-full object-cover"
                    fill
                    alt="avatar-story"
                  />
                </div>
              </div>
            )}
            {stories[selectedStory]?.name && (
              <p className="absolute top-7 left-20 text-white text-sm font-semibold z-1">
                {stories[selectedStory].name}
              </p>
            )}

            <div className="absolute top-12 left-20 text-[#c4c4c4] text-sm z-1">
              {formatTime(stories[selectedStory]?.createAt)} ago
            </div>
          </div>

          {/* Show Story Img or Video */}
          <div className="relative h-full w-full rounded-2xl">
            {isStoryModalOpen &&
              stories[selectedStory]?.urls?.[activeStoryIndex] && (
                <div className="relative h-full w-full rounded-2xl">
                  {stories[selectedStory].urls[activeStoryIndex].endsWith(
                    ".mp4"
                  ) ? (
                    <video
                      src={stories[selectedStory].urls[activeStoryIndex]}
                      controls
                      autoPlay
                      className="h-full w-full rounded-2xl "
                    />
                  ) : (
                    <Image
                      src={stories[selectedStory].urls[activeStoryIndex]}
                      alt="story"
                      fill
                      className="rounded-2xl"
                    />
                  )}
                </div>
              )}
          </div>
        </div>
      </div>

      {/* button slide story */}
      <button
        className={`${
          isStoryModalOpen && !isFirstStory ? "" : "hidden"
        } absolute border-1 border-white bg-white shadow-lg rounded-full p-2 top-150 -left-35 cursor-pointer z-15 active:scale-90`}
        onClick={() => handleChangeStory("back")}
      >
        <FontAwesomeIcon
          className="h-7 w-7 text-[var(--foreground-subTitle)]"
          icon={faAngleLeft}
          size="xl"
        />
      </button>
      <button
        className={`${
          isStoryModalOpen && !isLastStory ? "" : "hidden"
        } absolute border-1 border-white bg-white shadow-lg rounded-full p-2 top-150 -right-35 cursor-pointer z-15 active:scale-90`}
        onClick={() => handleChangeStory("next")}
      >
        <FontAwesomeIcon
          className="h-7 w-7 text-[var(--foreground-subTitle)]"
          icon={faAngleRight}
          size="xl"
        />
      </button>

      {/* button close story */}
      <button
        className={`${
          isStoryModalOpen ? "" : "hidden"
        } absolute rounded-full top-5 -right-15 cursor-pointer z-15 `}
        onClick={closeStoryModal}
      >
        <FontAwesomeIcon
          className="h-7 w-7 text-[var(--foreground-subTitle)]"
          icon={faCircleXmark}
          size="xl"
        />
      </button>
    </div>
  );
}
