'use server'
import { InstanceApi } from "@/app/protected/protected";
import { CustomApiError } from "../actions/access.action";

export default async function searchUserByUsername(payload : string) {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/search/${payload}`,{
            method: "GET",
            headers:{
                'Content-Type': 'application/json'
            }
              
        })
        const data = await res.json()
        return data
        
    } catch (error: unknown) {
        if (error instanceof Error) {
            return error.message;
        } else {
            console.error('Unknown error:', error);
        }
    }
}

export async function getFollowers(userId: string){
    try {
        const api = await InstanceApi()
        const res = await api.get(`user/getFollowersUser/${userId}`)
        return res.data

    } catch (error) {
        const err = error as CustomApiError;
        console.error("Login error:", err.message);
        return {
          message: err.message,
          status: err.status || 500,
        };
    }
}

export async function getFollowings(userId: string){
    try {
        const api = await InstanceApi()
        const res = await api.get(`user/getFollowingUser/${userId}`)
        return res.data

    } catch (error) {
        const err = error as CustomApiError;
        console.error("Login error:", err.message);
        return {
          message: err.message,
          status: err.status || 500,
        };
    }
}

export async function findUserById(userId: string){
    try {
        const api = await InstanceApi()
        const res = await api.get(`user/find/${userId}`)
        return res.data
        
    } catch (error) {
        const err = error as CustomApiError;
        console.error("Login error:", err.message);
        return {
          message: err.message,
          status: err.status || 500,
        };
    }
}