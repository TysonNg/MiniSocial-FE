'use client'

import { createContext, useContext, useState } from "react";
import { CommentPayload } from "../api/post/comment/route";

export interface CommentContext{
    comment: CommentPayload,
    user: {
        name: string,
        avatarUrl: string
    }
}

interface ReplyContextType{
    isReply: boolean;
    commentContext: CommentContext | null
    replyComment: (commentPayload : CommentContext) => void
    setCommentContext: React.Dispatch<React.SetStateAction<CommentContext>>
    notReply: () => void
}

const ReplyContext = createContext<ReplyContextType | undefined>(undefined)


export function ReplyProvider({children} : {children: React.ReactNode}){
    const [commentContext, setCommentContext] = useState<CommentContext>({
        comment: {
            content: '',
            parent_comment_id: '',
            postId: '',
        },
        user:{
            name: '',
            avatarUrl: '',
        }
    })
    const [isReply, setIsReply] = useState<boolean>(false)

    const replyComment = (commentPayload : CommentContext) => {
        setIsReply(true)
        setCommentContext({
            comment: {
                content: commentPayload.comment.content,
                parent_comment_id: commentPayload.comment.parent_comment_id,
                postId: commentPayload.comment.postId
            },
            user: {
                name: commentPayload.user.name,
                avatarUrl: commentPayload.user.avatarUrl
            }
        }
        )
    }

    const notReply =() => {
        setIsReply(false)
    }
     
    return (
        <ReplyContext.Provider value={{ commentContext,isReply,replyComment,setCommentContext,notReply}}>
          {children}
        </ReplyContext.Provider>
      );
}

export function useReply(){
    const context = useContext(ReplyContext);
    if(!context){
        throw new Error("useReply must be used within a ReplyProvider");
    }
    return context;
}