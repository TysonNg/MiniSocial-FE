import { InstanceApi } from "@/app/protected/protected";
import { AxiosError } from "axios";
import { cookies } from "next/headers";
import {  NextResponse } from "next/server";


export async function GET() {
  const api = await InstanceApi();
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value
  
  try {
    const result = await api.get(`/user/getFollowersUser/${userId}`);    
    
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