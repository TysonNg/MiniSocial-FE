import { InstanceApi } from "@/app/protected/protected";
import { AxiosError } from "axios";
import { NextRequest, NextResponse } from "next/server";


export interface CommentPayload{
    postId: string;
    content: string;
    parent_comment_id: string|null;
    fromUserId: string;
}
export async function POST(request: NextRequest) {
  const api = await InstanceApi();
    const payload:CommentPayload = await request.json()
    const {content,parent_comment_id,postId} = payload
 
  try {
    const result = await api.post(`/comments`,{
        postId,
        content,
        parent_comment_id
    });    
    if (result.data) {
      return NextResponse.json(result.data)
    }
    return NextResponse.json({ message: "comment failed" });
  } catch (error: unknown) {
    if (error instanceof AxiosError && error.response) {
        return NextResponse.json(
          { message: error.response.data?.message || "comment error" },
          { status: error.response.status || 500 }
        );
      }
      return NextResponse.json({ message: "Unknown server error" }, { status: 500 });
  }
}