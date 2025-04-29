import { InstanceApi } from "@/app/protected/protected";
import { AxiosError } from "axios";
import { NextRequest, NextResponse } from "next/server";


export async function POST(request: NextRequest) {
  const api = await InstanceApi();
  
  const body = await request.text()
  const payload= JSON.parse(body)

  console.log('payload',payload);
  
  try {
    const result = await api.post(`/user/update`,payload);    
    if (result.data) {
      return NextResponse.json(result.data)
    }
    return NextResponse.json({ message: "update users failed" });
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