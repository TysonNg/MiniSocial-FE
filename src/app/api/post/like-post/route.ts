import { InstanceApi } from "@/app/protected/protected";
import { AxiosError } from "axios";
import { NextRequest, NextResponse } from "next/server";


export async function POST(request: NextRequest) {
  const api = await InstanceApi();
  
    const payload = await request.text()
    console.log('id', payload);
    
  try {
    const result = await api.post(`/post/like/${payload}`);    
    if (result.data) {
      return NextResponse.json(result.data)
    }
    return NextResponse.json({ message: " users like post failed" });
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


export async function PUT(request: NextRequest) {
    const api = await InstanceApi();
    
   
    const payload = await request.text()
    console.log('id', payload);
    try {
      const result = await api.put(`/post/like/${payload}`);    
      if (result.data) {
        return NextResponse.json(result.data)
      }
      return NextResponse.json({ message: " users dislike post failed" });
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