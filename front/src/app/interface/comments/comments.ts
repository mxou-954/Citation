export interface CommentData {
  comment: string;
  date: Date;
}

export interface APIResponse {
  success: Boolean;
  message: String;
}

export interface CommentResponse {
  id: number;
  author: number;
  authorName: string;
  authorId: number;
  content: string;
  likeCount: number;
  date: Date;
  quoteId: number | null;
  parentCommentId: number | null; 
  replies: CommentResponse[]; 
  likedBy: number[];
}