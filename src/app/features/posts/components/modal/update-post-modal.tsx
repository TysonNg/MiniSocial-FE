"use client";

import { useEffect, useState } from "react";
import { PostInterface } from "../../interfaces/post.interface";
import Image from "next/image";

export type UpdatePostDto = {
  postId: string;
  payload: {
    content: string;
    imgsUrl: string[];
  };
};
export function UpdatePostModal({
  isUpdateModal,
  post,
  setIsUpdateModal,
}: {
  isUpdateModal: boolean;
  post: PostInterface;
  setIsUpdateModal: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [payload, setPayload] = useState<UpdatePostDto>();

  const updatePost = async () => {
    const res = await fetch("api/post/update-post", {
      method: "PUT",
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (data) {
      alert("UpdatePost Successfully");
      location.reload();
    }
  };

  useEffect(() => {
    if (post) {
      setPayload({
        payload: {
          content: post.content,
          imgsUrl: post.imgsUrl.map((img) => img),
        },
        postId: post.postId,
      });
    }

    if (isUpdateModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
      setPayload({
        payload: { content: "", imgsUrl: [] },
        postId: "",
      });
    }
  }, [isUpdateModal]);

  if (isUpdateModal) {
    return (
      <>
        <div
          className="fixed inset-0 w-full h-full z-100 bg-black/10"
          onClick={() => setIsUpdateModal(false)}
        >
          <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-101">
            <div
              className="bg-white w-full max-w-xl rounded-2xl shadow-lg p-6 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-semibold text-center mb-4">
                Update Post
              </h2>

              {/* Close button */}
              <button
                className="absolute top-3 right-3 text-gray-500 hover:text-red-500 cursor-pointer"
                onClick={() => setIsUpdateModal(false)}
              >
                ✕
              </button>

              {/* Image preview */}
              <div className="flex flex-wrap gap-3 mb-4">
                {payload?.payload.imgsUrl.map((img, index) => (
                  <div
                    key={img}
                    className="relative w-24 h-24 rounded overflow-hidden border"
                  >
                    <Image src={img} alt="img" fill className="object-cover" />
                    <button
                      className="absolute top-1 right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center"
                      onClick={() =>
                        setPayload((prev) =>
                          prev
                            ? {
                                ...prev,
                                payload: {
                                  ...prev.payload,
                                  imgsUrl: prev.payload.imgsUrl.filter(
                                    (_, i) => i !== index
                                  ),
                                },
                              }
                            : prev
                        )
                      }
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              {/* Textarea */}
              <textarea
                className="w-full border border-gray-300 rounded-md p-2 resize-none min-h-[100px] outline-none"
                placeholder="Update your post content..."
                value={payload?.payload.content || ""}
                onChange={(e) =>
                  setPayload((prev) =>
                    prev
                      ? {
                          ...prev,
                          payload: {
                            ...prev.payload,
                            content: e.target.value,
                          },
                        }
                      : prev
                  )
                }
              />

              {/* Update button */}
              <div className="flex justify-center mt-4 ">
                <button
                  onClick={updatePost}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold cursor-pointer px-4 py-2 rounded-lg"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
}
