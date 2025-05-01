import { InstanceApi } from "@/app/protected/protected";
import { AxiosError } from "axios";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const api = await InstanceApi();

  const payload = JSON.parse(await request.text());
  const cookieStore = await cookies();
  try {
    const result = await api.post("/auth/signIn", payload);
    console.log("resultLogout", result);

    if (result.data) {
      cookieStore.delete("access_token");
      cookieStore.delete("refresh_token");
      cookieStore.delete("userId");

      return NextResponse.json(result.data);
    }
    return NextResponse.json({ message: "Logout failed" });
  } catch (error: unknown) {
    if (error instanceof AxiosError && error.response) {
      return NextResponse.json(
        { message: error.response.data?.message || "Logout error" },
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
