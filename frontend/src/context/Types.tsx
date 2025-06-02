export interface User {
  id: string | null,
  username: string;
  email: string;
  biography: string;
}

// Post start

export interface Author {
  id: string;
  username: string;
}

interface CommentUser {
  id: string;
  name: string;
}

interface Comment {
  comment_id: string;
  user: CommentUser;
  text: string;
  created_at: string;
}

export interface Post {
  id: string;
  author: Author;
  title_text: string;
  body_text: string;
  likes: number;
  liked_by_user: boolean;
  comments: Comment[];
  created_at: string;
}

// Post end

export interface Message {
  id: string;
  sender: Author;
  recipient: Author;
  text: string;
  created_at: string;
  read: boolean;
}

export type NotificationType = 'comment' | 'message' | 'post' | 'like';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  related_user: Author;
  created_at: string;
}
