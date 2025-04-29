import { InstanceApi } from "@/app/protected/protected";
import { AxiosError } from "axios";
import { NextResponse } from "next/server";


export async function GET() {
  const api = await InstanceApi();
 
  try {
    const result = await api.get(`/story`);    
    if (result.data) {
        
      return NextResponse.json(result.data)
    }
    return NextResponse.json({ message: "get stories failed" });
  } catch (error: unknown) {
    if (error instanceof AxiosError && error.response) {
        return NextResponse.json(
          { message: error.response.data?.message || "get stories error" },
          { status: error.response.status || 500 }
        );
      }
      return NextResponse.json({ message: "Unknown server error" }, { status: 500 });
  }
}