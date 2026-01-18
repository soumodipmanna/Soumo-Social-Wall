
export interface Post {
  id: string;
  username: string;
  text: string;
  image_url?: string;
  likes: number;
  likedBy: string[]; // Track user IDs/usernames who liked
  commentCount: number;
  created_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  username: string;
  comment: string;
  created_at: string;
}

export interface User {
  username: string;
  isAuthenticated: boolean;
}
