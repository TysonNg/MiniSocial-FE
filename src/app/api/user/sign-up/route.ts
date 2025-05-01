import { CustomApiError } from "@/app/features/users/actions/access.action";
import { InstanceApi } from "@/app/protected/protected";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const api = await InstanceApi();

  const payload = JSON.parse(await request.text());
  const cookieStore = await cookies();
  try {
    const result = await api.post("/auth/signUp", payload);
    if (!result.data) throw new Error(`${result.data.message}`);

    if (result.data) {
      const { id } = result.data.user;
      const { access_token, refresh_token } = result.data.tokens;
      cookieStore.set("access_token", access_token, {
        httpOnly: true,
        maxAge: 60 * 60 * 24,
      });
      cookieStore.set("refresh_token", refresh_token, {
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 7,
      });
      cookieStore.set("userId", id, {
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 7,
      });

      return NextResponse.json({
        metadata: result.data,
        message: "Register successfully!",
      });
    }
    return NextResponse.json({ message: "Logout failed" });
  } catch (error: unknown) {
    const err = error as CustomApiError;
    console.error("Login error:", err.message);
    return NextResponse.json({
        message: err.message,
        status: err.status || 500,
      });
  }
}
