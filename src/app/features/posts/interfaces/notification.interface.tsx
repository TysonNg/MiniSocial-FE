import { UserInterface } from "../../users/interfaces/user.interface"
import { PostInterface } from "./post.interface"

export interface NotificationInterface{
    notifyId: string,
    fromUser: UserInterface,
    fromUserId: string,
    toUserId: string,
    post: PostInterface,
    postId: string,
    type: 'like' | 'commentPost' | 'follow' | 'commentReply',
    isRead: boolean,
    createdAt: string
}