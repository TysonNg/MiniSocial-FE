import { CommentInterface } from "../features/posts/interfaces/post.interface";

export interface CommentNode extends CommentInterface {
  children: CommentNode[];
  avatarUrl?: string;
  name?: string;
}

export const buildCommentTree = (
  comments: CommentInterface[]
): CommentNode[] => {
  const map: Record<string, CommentNode> = {};
  const roots: CommentNode[] = [];
    
  comments.forEach((comment) => {
    map[comment.commentId] = { ...comment, children: [] };
  });

  comments.forEach((comment) => {
    if (comment.parent_comment_id) {
      map[comment.parent_comment_id]?.children.push(map[comment.commentId]);
    } else {
      roots.push(map[comment.commentId]);
    }
  });

  return roots;
};
