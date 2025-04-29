import { InstanceApi } from "@/app/protected/protected";
import { AxiosError } from "axios";
import { NextRequest, NextResponse } from "next/server";


export async function GET(request: NextRequest) {
  const api = await InstanceApi();
  
  const postId = request.nextUrl.searchParams.get('postId');
  const parent_comment_id = request.nextUrl.searchParams.get('parentCommentId');
  
  
  try {
    const result = await api.get(`/comments?postId=${postId}&&parent_comment_id=${parent_comment_id}`);    
    if (result.data) {
      return NextResponse.json(result.data)
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