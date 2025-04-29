import { InstanceApi } from "@/app/protected/protected";
import { AxiosError } from "axios";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";


export async function GET(request: NextRequest) {
  const api = await InstanceApi();
  const id = request.nextUrl.searchParams.get('userId')
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value
  
  try {
    const result = await api.get(`/user/getFollowingUser/${userId}`);    
    if (result.data) {
      const isHaveFollowed = result.data.usersId.includes(id)

      return NextResponse.json({
        isHaveFollowed,
        metadata: result.data
      })
    }
    return NextResponse.json({ message: "fetch users failed" });
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