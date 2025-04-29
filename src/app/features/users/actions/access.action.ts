"use server";

import { InstanceApi } from "@/app/protected/protected";
import {
  UserLoginInterface,
  UserSignUpInterface,
} from "../interfaces/access.interface";
import { cookies } from "next/headers";

export interface CustomApiError {
  message: string;
  status?: number;
}

export async function LoginAction(payload: UserLoginInterface) {
  const cookieStore = await cookies();
  const api = await InstanceApi();
  try {
    const result = await api.post("/auth/signIn", payload);
    
    if (!result.data) throw new Error(`${result.data.message}`);
    const { access_token, refresh_token } = result.data.tokens;
    const { id } = result.data.user;
    cookieStore.set("access_token", access_token, {
      httpOnly: true,
      maxAge: 60 * 60 * 24,
    });
    cookieStore.set("refresh_token", refresh_token, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7,
    });
    cookieStore.set("userId", id, { httpOnly: true, maxAge: 60 * 60 * 24 * 7 });
    return {
      metadata: result.data,
      message: "Login successfully!",
    };
  } catch (error: unknown) {
    const err = error as CustomApiError;
    console.error("Login error:", err.message);
    return {
      message: err.message,
      status: err.status || 500,
    };
  }
}

export async function SignUpAction(payload: UserSignUpInterface) {
  const api = await InstanceApi();
  const cookieStore = await cookies();

  try {
    const result = await api.post("/auth/signUp", payload);
    if (!result.data) throw new Error(result.data.message);
    console.log('register',result.data);
    const {id} = result.data.user
    const {access_token,refresh_token} = result.data.tokens
    cookieStore.set("access_token", access_token, {
      httpOnly: true,
      maxAge: 60 * 60 * 24,
    });
    cookieStore.set("refresh_token", refresh_token, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7,
    });
    cookieStore.set("userId", id, { httpOnly: true, maxAge: 60 * 60 * 24 * 7 });
    return {
      metadata: result.data,
      message: "Register successfully!",
    };
  } catch (error: unknown) {
    const err = error as CustomApiError;
    console.error("Login error:", err.message);
    return {
      message: err.message,
      status: err.status || 500,
    };
  }
}

export async function SignOutAction() {
  const api = await InstanceApi();
  const cookieStore = await cookies();
  try {
    const result = await api.post("/auth/logOut");
    if (result.data) {
      cookieStore.delete("access_token");
      cookieStore.delete("refresh_token");
      cookieStore.delete("userId");
      console.log("resultLogout", result);
      
      return result.data;
    }
    throw new Error("Logout failed");
  } catch (error: unknown) {
    const err = error as CustomApiError;
    return {
      message: err.message,
      status: err.status || 500,
    };
  }
}
