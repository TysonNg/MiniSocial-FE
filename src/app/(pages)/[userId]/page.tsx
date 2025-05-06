import PostsOfUser from "@/app/features/posts/components/items/post/posts-of-user";
import { getAllPostsOfUser } from "@/app/features/posts/data/data";
import Follow from "@/app/features/users/components/items/posts-of-user-page/follow";
import Interact from "@/app/features/users/components/items/posts-of-user-page/interact";
import {
  findUserById,
  getFollowers,
  getFollowings,
} from "@/app/features/users/data/data";
import { UserInterface } from "@/app/features/users/interfaces/user.interface";
import Image from "next/image";
import Link from "next/link";


export default async function UserPage({ params }: { params: Promise<{userId: string}> }) {
  const { userId } =  await params;

  const user: UserInterface = await findUserById(userId);
  const followers = await getFollowers(userId);
  
  const followings = await getFollowings(userId);

  const resultGetAllPosts = await getAllPostsOfUser(userId);
  const { data: posts } = resultGetAllPosts.metadata;
  const { myId } = resultGetAllPosts;

  return (
    <section className="w-full">
      <div className=" sm:max-w-[430px] 2xl:max-w-[630px] mx-auto py-10">
        <div className="flex flex-row justify-center gap-5 sm:gap-10">
          <div className="relative w-15 h-15 sm:w-30 sm:h-30 rounded-full">
            <Image
              src={user.avatarUrl}
              fill
              alt="avatarUser"
              className="rounded-full"
            />
          </div>
          <div className="flex flex-col gap-5">
            <div className="flex flex-row gap-5 items-center">
              <div>{user.name}</div>
              <div
                className={`${
                  myId === userId ? "" : "hidden"
                } bg-[#9a9ca0] text-black text-xs font-bold px-2 py-1 rounded-md`}
              >
                <Link href="profile">
                  <p>Edit Profile</p>
                </Link>
              </div>

              <div className={`${myId === userId? 'hidden': ''}`}>
                <Interact user={user} />
              </div>
            </div>
            <div className="flex flex-row gap-5">
              <p>
                <span className="font-bold mr-1">{posts.length}</span>
                posts
              </p>
              <Follow followers={followers} followings={followings} userId={userId}/>
            </div>
            <div>{user.bio}</div>
          </div>
        </div>
      </div>
      <PostsOfUser posts={posts} />
    </section>
  );
}
