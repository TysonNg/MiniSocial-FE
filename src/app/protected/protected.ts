import axios from "axios";
import dotenv from "dotenv";
dotenv.config();
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function InstanceApi() {
  const cookieStore = await cookies();
  
  const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL??process.env.API_URL,
    timeout: 60000,
    headers: {
      "Content-Type": "application/json",
    },
  });

  api.interceptors.request.use((config) => {
    const token = cookieStore.get('access_token')?.value
    if(token) config.headers.Authorization = `Bearer ${token}`;
    const userId = cookieStore.get("userId")?.value;
    if (userId) {
      config.headers["x-user-id"] = userId;
    }
    return config;
  },async(err) => {
    return Promise.reject(err)
  }
);

  api.interceptors.response.use((res) => {
    return res;
  },async(err) => {
    
    const originalRequest = err.config
    console.log('orinalll', err);
    
    const status = err?.response?.status;
    const statusText = err?.response?.statusText;
    if(status === 401 && statusText === 'Unauthorized'  && !originalRequest._retry){
      originalRequest._retry = true

      const refreshToken = cookieStore.get('refresh_token')?.value
      
      if(!refreshToken)
      {
        return Promise.reject(err)
      }
      try {
          const res = await api.post('auth/refreshToken',{refreshToken})
          
          const newAccessToken = res.data.accessToken
          const newRefreshToken = res.data.refreshToken
          cookieStore.set('access_token', newAccessToken)
          cookieStore.set('refresh_token', newRefreshToken)
          return api(originalRequest)
        } catch (error) {
          cookieStore.delete('access_token')
          cookieStore.delete('refresh_token')
          cookieStore.delete('userId')
          console.log(error);
          
          redirect('auth/signin')
          
      }
    }
    return Promise.reject({
      message:err?.response?.data?.message || err?.message || "Something went wrong",
      status: err?.response?.status || 500,
      raw: err,
    })
  }


);

  return api;
}
