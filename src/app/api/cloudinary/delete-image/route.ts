import {v2 as cloudinary} from 'cloudinary'
import { NextResponse, NextRequest } from 'next/server';


cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    api_secret: process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET
})

export async function POST(req : NextRequest){
    try {
        const publicId = await req.text()

        const result = await cloudinary.uploader.destroy(publicId)
        if(result.result === "ok"){
           return NextResponse.json({message: "Delete image successfully"}, {status:200})
        }else{
        return NextResponse.json({ message: "Image not found" }, { status: 404 })
        }
    } catch (error) {
        return NextResponse.json({ message: "Internal Server Error", error }, { status: 500 })
    }
}