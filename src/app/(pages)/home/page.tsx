import { cookies } from "next/headers";
import StorySection from "../../features/posts/components/sections/story/story.section";
import { redirect } from "next/navigation";
import StoryWrapper from "@/app/features/posts/components/sections/story/story-wrapper";
import NewsfeedSection from "@/app/features/posts/components/sections/newsfeed/newsfeed.section";
import CreatePostSection from "@/app/features/posts/components/sections/createpost/createpost";
export default async function HomePage() {
  const cookieStore = await cookies();
  if (!cookieStore.get("userId")?.value) {
    redirect("/auth/signin");
  }
  return (
    <>
      <section className="w-full flex flex-col gap-5 mt-5">
        <section className="w-full max-w-[350px] sm:max-w-[400px] md:max-w-[500px] lg:max-w-[580px] xl:max-w-[630px] mx-auto bg-white rounded-2xl  relative">
          <StorySection />
          <StoryWrapper />
        </section>

        <section className="w-full max-w-[350px] sm:max-w-[400px] md:max-w-[500px] lg:max-w-[580px] xl:max-w-[630px] mx-auto bg-white rounded-2xl ">
          <CreatePostSection />
        </section>

        <section className="w-full max-w-[350px] sm:max-w-[400px] md:max-w-[500px] lg:max-w-[580px] xl:max-w-[630px] mx-auto bg-white rounded-2xl">
          <NewsfeedSection />
        </section>
      </section>
    </>
  );
}
