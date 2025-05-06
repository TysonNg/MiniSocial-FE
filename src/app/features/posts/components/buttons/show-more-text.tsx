'use client'

import { useState } from "react";

interface ShowMoreTextProps {
  text: string;
  maxChars: number;
}

export function ShowMoreText({ text, maxChars}: ShowMoreTextProps) {
    const [expand,setExpand] = useState(false)
    const displayText = expand? text : text.slice(0,maxChars)
  
    const handleMoreText = () => {
        setExpand(!expand)
    }

    return (
    <span className="text-sm ml-1">
    {displayText}
    {!expand && text.length>120? <span>...</span>:<></>}
    <button className={`${expand || text.length < 120? 'hidden':''} text-[#4b4b4b] cursor-pointer font-bold`} onClick={handleMoreText}>more</button>
    <button className={`${!expand || text.length < 120? 'hidden':''} pl-2 text-[#4b4b4b] cursor-pointer font-bold`} onClick={handleMoreText}>less more</button>

    </span>
  )
}
