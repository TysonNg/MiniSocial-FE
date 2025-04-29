import { FormSignUp } from "@/app/features/users/components/forms/access.form";
import Loading from "@/app/loading";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { cookies } from "next/headers";

export default async function SignUpPage() {

   const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;
  
    if(userId) {
      redirect('/home');
    }

  return (
    <div>
      <div className="flex flex-col items-center mt-25 gap-6">
        <h1 className="text-[var(--foreground-title)] text-3xl">MiniSocial</h1>
        <h2 className="text-[var(--foreground-subTitle)] text-4xl">
          Welcome to MiniSocial
        </h2>
      </div>
      <h3 className="text-[var(--foreground-subTitle)] mt-25 mb-20 text-2xl font-bold">
        SIGN UP
      </h3>
      <Suspense fallback={<Loading></Loading>}>
        <FormSignUp />
      </Suspense>

      <div className="mt-20 text-xl w-1/2 mx-auto flex flex-row justify-center">
        <p className="text-[var(--foreground-subTitle)]">
          Already have account?{" "}
        </p>
        <Link className="hover:underline" href="/auth/signin">
          <span className="ml-2 text-[#62685E] cursor-pointer ">Login</span>
        </Link>
      </div>
    </div>
  );
}
