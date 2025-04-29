import { cookies } from "next/headers";
import { InstanceApi } from "../../../protected/protected";
import { CustomApiError } from "../../users/actions/access.action";

export async function GetAllPost() {
  const api = await InstanceApi();
  try {
    const res = await api.get("/post");
    console.log("resAllPosts", res.data);
    return res.data;
  } catch (error: unknown) {
    const err = error as CustomApiError;
    console.error("Login error:", err.message);
    return {
      message: err.message,
      status: err.status || 500,
    };
  }
}

export async function getAllPostsOfUser(userId: string){
    try {
        const api = await InstanceApi()
        const cookieStore = await cookies()
        const myId = cookieStore.get('userId')?.value
        const res = await api.get(`post/allPosts/${userId}`)
        
        return{
          myId,
          metadata: res.data
        } 
    } catch (error) {
        const err = error as CustomApiError;
            console.error("Login error:", err.message);
            return {
              message: err.message,
              status: err.status || 500,
            };
    }
}