import { UpdatePostDto } from "@/app/features/posts/components/modal/update-post-modal";
import { InstanceApi } from "@/app/protected/protected";
import { AxiosError } from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest) {
  const api = await InstanceApi();

  const body : UpdatePostDto = JSON.parse(await request.text());
  console.log(body);
  
  const { postId, payload } = body;
  try {
    const result = await api.put(`/post/update/${postId}`,
        payload
    );
    if (result.data) {
      return NextResponse.json(result.data);
    }
    return NextResponse.json({ message: "fetchAllPosts failed" });
  } catch (error: unknown) {
    if (error instanceof AxiosError && error.response) {
      return NextResponse.json(
        { message: error.response.data?.message || "fetchAllPosts error" },
        { status: error.response.status || 500 }
      );
    }
    console.error("Unknown error:", error);
    return NextResponse.json(
      { message: "Unknown server error" },
      { status: 500 }
    );
  }
}
