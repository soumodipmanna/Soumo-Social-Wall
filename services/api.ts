import { Comment, Post } from '../types';

type NewPostInput = {
  username: string;
  text: string;
  image_url?: string;
};

type NewCommentInput = {
  username: string;
  comment: string;
};

const API_BASE =
  import.meta.env.VITE_API_BASE || 'http://localhost:4000';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  if (!response.ok) {
    const message = await response.text();
    const error = new Error(message || 'Request failed');
    (error as Error & { status?: number }).status = response.status;
    throw error;
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return response.json() as Promise<T>;
}

function normalizePost(post: Post): Post {
  return {
    ...post,
    likedBy: post.likedBy || [],
    commentCount: post.commentCount || 0,
    likes: post.likes || 0,
  };
}

export const api = {
  async getPosts(searchQuery = ''): Promise<Post[]> {
    const query = searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : '';
    const posts = await request<Post[]>(`/api/posts${query}`);
    return posts.map(normalizePost);
  },

  async getPost(postId: string): Promise<Post | undefined> {
    try {
      const post = await request<Post>(`/api/posts/${postId}`);
      return normalizePost(post);
    } catch (err) {
      if ((err as Error & { status?: number }).status === 404) {
        return undefined;
      }
      throw err;
    }
  },

  async createPost(payload: NewPostInput): Promise<Post> {
    const post = await request<Post>('/api/posts', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return normalizePost(post);
  },

  async deletePost(postId: string): Promise<void> {
    await request<void>(`/api/posts/${postId}`, { method: 'DELETE' });
  },

  async likePost(postId: string, _username: string): Promise<Post> {
    const post = await request<Post>(`/api/posts/${postId}/like`, {
      method: 'POST',
    });
    return normalizePost(post);
  },

  async getComments(postId: string): Promise<Comment[]> {
    return request<Comment[]>(`/api/posts/${postId}/comments`);
  },

  async addComment(postId: string, payload: NewCommentInput): Promise<Comment> {
    return request<Comment>(`/api/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
