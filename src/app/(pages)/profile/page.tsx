"use client";

import {
  UpdateUserInterface,
  UserInterface,
} from "@/app/features/users/interfaces/user.interface";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  CldUploadWidget,
  CloudinaryUploadWidgetResults,
} from "next-cloudinary";
import { BtnLoading } from "@/app/loading";
import { usePathname } from "next/navigation";

export default function ProfilePage() {
  const [user, setUser] = useState<UserInterface>();
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [updateUser, setUpdateUser] = useState<UpdateUserInterface>({
    userName: user?.name??"",
    bio: user?.bio??"",
    imgUrl: {
      url: user?.avatarUrl??null,
      publicId: null,
    },
  });
  const isUpdatedRef = useRef(false);

  const pathname = usePathname()
  const oldPublicIdRef = useRef<string|null>(null) 




  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch(`api/user/find-my-user`);
      if(res.ok){
        const data:UserInterface = await res.json();
        setUser(data);
        setUpdateUser({
          userName: data.name,
          bio: data.bio,
          imgUrl: {
            url: data.avatarUrl,
            publicId: null
          }
        })
        return data;
      }
      
    };
    fetchUser();
  }, []);


 

  const handleSuccessUploadImage = (result: CloudinaryUploadWidgetResults) => {
    const event = result.event ? result.event : "";
    if (event === "success") {
      if (typeof result.info === "object" && result.info !== null) {
        const info = result.info;
        const secureUrl = info?.secure_url || "";
        const publicId = info?.public_id || "";
        

        const oldPublicId = oldPublicIdRef.current

        oldPublicIdRef.current = publicId
        
        setUpdateUser((prev) => ({
          ...prev,
          imgUrl: {
            url: secureUrl,
            publicId,
          },
        }));

        if (oldPublicId) {
          handleDeleteUploadImage(oldPublicId);
        }

      }
    }
  };

  const handleDeleteUploadImage = async (publicId: string) => {
    const res = await fetch(`api/cloudinary/delete-image`, {
      method: "POST",
      body: publicId,
    });
    const data = await res.json();
    
    return data
  };

  const handleUpdateUser = async() => {
    setIsLoading(true)
    try {
      const res = await fetch(`api/user/update-user`,{
        method: "POST",
        body: JSON.stringify({
          userName: updateUser.userName,
          bio: updateUser.bio,
          imgUrl: updateUser.imgUrl.url
        })
      })
      if(res.ok){
        const data = await res.json()

        isUpdatedRef.current =  true
        return data
      }
    } catch (error) {
      console.log(error);
      
    }finally{
      setIsLoading(false)
    }
  }

  useEffect(() => {
    return () => {
      if (pathname === "/profile" && oldPublicIdRef.current && !isUpdatedRef.current) {
        handleDeleteUploadImage(oldPublicIdRef.current);
      }
    };
  },[pathname])

  return (
    <div className="w-full max-w-[1200px] h-fit mx-auto flex flex-col  gap-5 mt-5">
      <h1 className="text-3xl place-self-center">Profile Setting</h1>

      <div className="flex flex-row gap-5 mt-10 justify-center">
        <div className="bg-white w-full max-w-[414px] h-fit shadow">
          <h2 className="p-2 border-b border-[var(--color-separator)] text-[var(--foreground-subTitle)]  bg-[#f8f8f9]">
            Profile Picture
          </h2>

          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <div className="w-25 h-25 relative rounded-full">
              <Image
                className="rounded-full object-cover"
                fill
                alt="avatar"
                src={updateUser?.imgUrl?.url ?? user?.avatarUrl ?? ""}
              />
            </div>
            <CldUploadWidget
              options={{
                sources: ["local", "url", "unsplash"],
                multiple: true,
                folder: "avatar",
              }}
              uploadPreset="mini_social_avatar"
              onSuccess={(result) => handleSuccessUploadImage(result)}
            >
              {({ open }) => {
                return (
                  <div
                    className="p-1 bg-blue-400 text-white text-sm cursor-pointer"
                    onClick={() => open()}
                  >
                    <button className="cursor-pointer">Upload new image</button>
                  </div>
                );
              }}
            </CldUploadWidget>
          </div>
          <div className={`${isUpdatedRef.current? '':'hidden'} text-green-500 text-sm place-self-center`}>
              Updated successfully! ✅
          </div>
        </div>

        <div className="bg-white w-full max-w-[414px] h-fit shadow">
          <h2 className="p-2 border-b border-[var(--color-separator)] text-[var(--foreground-subTitle)]  bg-[#f8f8f9]">
            Account Details
          </h2>
          <div className="flex flex-col gap-5 mt-2 p-3">
            <div>
              <p>New user name</p>
              <input
                className="outline-none w-full border border-[var(--color-separator)] p-2 rounded-md"
                type="text"
                placeholder="new user name...."
                onChange={(e) =>
                  setUpdateUser((prev) => ({
                    ...prev,
                    userName: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <p>Bio</p>
              <textarea
                className="resize-none outline-none border-[var(--color-separator)] rounded-md  w-full border p-2"
                rows={1}
                placeholder="new bio...."
                onChange={(e) =>
                  setUpdateUser((prev) => ({ ...prev, bio: e.target.value }))
                }
              ></textarea>
            </div>

            <div className="p-1 bg-blue-400 text-white text-sm text-center" onClick={handleUpdateUser}>
              <button>{isLoading? <BtnLoading/> : "Save changes"} </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
