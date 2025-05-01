import axios from "axios";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function InstanceApi() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  console.log('NEXT_PUBLIC_API_URL',process.env.NEXT_PUBLIC_API_URL);
  console.log('api-url',process.env.API_URL);

  
  const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL??process.env.API_URL,
    timeout: 10000,
    headers: {
      "Content-Type": "application/json",
      "x-user-id": userId,
    },
  });

  api.interceptors.request.use((config) => {
    const token = cookieStore.get('access_token')?.value
    if(token) config.headers.Authorization = `Bearer ${token}`;
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
    
    if(err.response.status === 401 && err.response.statusText === 'Unauthorized'  && !originalRequest._retry){
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
      message: err?.response?.data?.message || "Something went wrong",
      status: err?.response?.status || 500,
      raw: err,
    })
  }


);

  return api;
}
