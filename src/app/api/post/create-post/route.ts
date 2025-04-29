import { InstanceApi } from "@/app/protected/protected";
import { AxiosError } from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const api = await InstanceApi();

  const body = await request.text();
  const postPayload = JSON.parse(body);
  console.log(postPayload);
  
  try {
    const result = await api.post(`/post`, 
      postPayload,
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
