import { InstanceApi } from "@/app/protected/protected";
import { AxiosError } from "axios";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";


export async function GET(request: NextRequest) {
  const api = await InstanceApi();
  const cookieStore = await cookies()
  const userId =  cookieStore.get('userId')?.value
  const postId = request.nextUrl.searchParams.get('postId');
 
  
  try {
    const result = await api.get(`/post/like/getUsers/${postId}`);    
    if (result.data) {
        const isHaveUser = result.data.users.includes(userId)
        
      return NextResponse.json({
        userId,
        isHaveUser,
        datas: result.data
      })
    }
    return NextResponse.json({ message: "fetch users like post failed" });
  } catch (error: unknown) {
    if (error instanceof AxiosError && error.response) {
        return NextResponse.json(
          { message: error.response.data?.message || "fetch users error" },
          { status: error.response.status || 500 }
        );
      }
      return NextResponse.json({ message: "Unknown server error" }, { status: 500 });
  }
}