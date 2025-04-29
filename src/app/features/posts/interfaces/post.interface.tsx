import { UserInterface } from "../../users/interfaces/user.interface";

export interface PostInterface {
    postId: string;
    userId: string;
    content: string;
    imgsUrl: string[];
    user: UserInterface;
    comments: CommentInterface[];
    likes: LikeInterface[];
    createdAt: string;
    updatedAt: string;
}


export interface CommentInterface{
    commentId: string;
    userId: string;
    postId: string;
    post: PostInterface;
    content: string;
    parent_comment_id: string;
    comment_left: number;
    createdAt: string;
}

export interface LikeInterface{
    likeId: string;
    userId: string;
    post: PostInterface;
    postId: string;
    createAt: string;
}

export interface LikeOfPostInterface{
    user: UserInterface,
    follow: boolean
}

export interface CreatePostInterface{
    content: string,
    imgsUrl: string[]
}

export interface CreateStoryInterface{
    storyUrl: string;
}