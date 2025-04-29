"use client";

import { useModal } from "@/app/context/modal.context";
import { UserInterface } from "@/app/features/users/interfaces/user.interface";
import Image from "next/image";
import {  useState } from "react";
import { CreatePostInterface } from "../../interfaces/post.interface";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImages } from "@fortawesome/free-solid-svg-icons";
import {
  CldUploadWidget,
  CloudinaryUploadWidgetResults,
} from "next-cloudinary";
import { BtnLoading } from "@/app/loading";

interface ImgPost {
  url: string;
  publicId: string;
}
export default function CreatePostModal({ user }: { user: UserInterface }) {
  const { isCreatePostModalOpen, closeCreatePostModal } = useModal();
  const [post, setPost] = useState<CreatePostInterface>({
    content: "",
    imgsUrl: [],
  });
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [imgsPost, setImgsPost] = useState<ImgPost[]>([]);
  
  const handleSuccessUploadImage = (result: CloudinaryUploadWidgetResults) => {
    const event = result.event ? result.event : "";
    if (event === "success") {
      if (typeof result.info === "object" && result.info !== null) {
        const info = result.info;
        const secureUrl = info?.secure_url || "";
        const publicId = info?.public_id || "";

        setPost((prev) => ({
          ...prev,
          imgsUrl: [...prev.imgsUrl, secureUrl],
        }));

        setImgsPost((prev) => [...prev, { publicId, url: secureUrl }]);
      }
    }
  };

  const handleDeleteUploadImage = async (publicId: string, index: number) => {
    const res = await fetch(`api/cloudinary/delete-image`, {
      method: "POST",
      body: publicId,
    });
    const data = await res.json();
    console.log(data);
    
    setImgsPost((prev) => {
      const newImgsPost = prev.filter((img) => img.publicId !== publicId);
      return newImgsPost;
    });

    setPost((prev) => ({
      ...prev,
      imgsUrl: post.imgsUrl.filter((img,i) => i !== index)
    }))
  };


  const handlePost = async(postPayload: CreatePostInterface ) => {
    setIsLoading(true)
    try {
      const res = await fetch(`api/post/create-post`,{
        method: "POST",
        body: JSON.stringify(postPayload)
      })
      if(res.ok){
        const data = await res.json()
        console.log('creatPost', data);
        window.dispatchEvent(new Event('newPost'))
        closeCreatePostModal()
        return data
      }
    } catch (error) {
      console.log(error);
      
    }finally{
      setIsLoading(false)
    }
    
    
  }
  const handleChangeContent = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPost((prev) => ({ ...prev, content: e.target.value }));
  };

  const cancleCreatePost = () => {
    const handleDeleteAllUploadImage = async() => {
      imgsPost.forEach(async(post) => {
        await fetch(`api/cloudinary/delete-image`, {
          method: "POST",
          body: post.publicId,
        }); 
      })
      setImgsPost([])
      setPost({content: '',imgsUrl: []})
    }
    handleDeleteAllUploadImage();
    closeCreatePostModal();
  }

  

  if (isCreatePostModalOpen) {
    return (
      <div
        className="fixed inset-0 z-100 flex justify-center bg-black/30 items-center"
        onClick={cancleCreatePost}
      >
        <div
          className="fixed inset-0 w-[500px] h-[630px] flex flex-col mx-auto my-auto bg-white z-101 rounded-md "
          onClick={(e) => e.stopPropagation()}
        >
          <div className="py-5 relative border-b border-[var(--color-separator)]">
            <h1 className="place-self-center font-bold text-xl">Create Post</h1>
            <div
              className="absolute w-8 h-8 flex justify-center items-center top-4 right-3 p-1 rounded-full bg-[var(--base-button-background)] cursor-pointer"
              onClick={cancleCreatePost}
            >
              <button className=" text-xl cursor-pointer">X</button>
            </div>
          </div>

          <div className="flex flex-col h-full p-5 gap-5">
            <div className="flex flex-row items-center gap-3">
              <div className="w-10 h-10 relative rounded-full">
                <Image
                  fill
                  src={user.avatarUrl}
                  alt="avatar"
                  className="rounded-full"
                />
              </div>
              <p className="font-bold text-sm">{user.name}</p>
            </div>

            {/* text */}
            <div>
              <textarea
                className="resize-none outline-0 w-full text-sm"
                placeholder={`${user.name}, do you thinking about what?`}
                onChange={handleChangeContent}
              />
            </div>

            {/* show Imgs */}
            <div className={`${imgsPost.length > 0 ? "" : "hidden"}`}>
              <span className="text-sm">Images:</span>
              {imgsPost.length > 0 && (
                <div className="flex flex-row gap-2">
                  {imgsPost.map((img, i) => (
                    <div key={img.publicId + i} className="w-25 h-20 relative">
                      <Image src={img.url} fill alt="imgOfPost" />
                      <div className="w-5 h-5 rounded-full bg-[#e65a5d] flex flex-row justify-center items-center absolute top-0 right-0 cursor-pointer hover:opacity-70"
                      onClick={() => handleDeleteUploadImage(img.publicId,i)}
                      >
                        <button className="text-white cursor-pointer">X</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="w-full max-w-[468px] h-full max-h-[311px] p-1 border rounded-md border-[var(--color-separator)]">
              <CldUploadWidget
                options={{
                  sources: ["local", "url", "unsplash"],
                  multiple: true,
                  folder: "mini_social",
                }}
                uploadPreset="mini_social_images"
                onSuccess={(result) => handleSuccessUploadImage(result)}
              >
                {({ open }) => {
                  return (
                    <div
                      className="w-full h-full flex flex-col items-center justify-center bg-[#f8f9fb] rounded-md cursor-pointer hover:bg-black/10"
                      onClick={() => open()}
                    >
                      <div>
                        <FontAwesomeIcon icon={faImages} />
                      </div>
                      <span className="font-bold text-sm">Add photos</span>
                    </div>
                  );
                }}
              </CldUploadWidget>
            </div>

            <div className="w-full max-w-[468px] py-3 rounded-md cursor-pointer bg-[#3c68fd] flex justify-center text-sm text-white font-bold hover:opacity-80"
            onClick={() => handlePost(post)}>
              <button>{isLoading? <BtnLoading/> : "Post"} </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
