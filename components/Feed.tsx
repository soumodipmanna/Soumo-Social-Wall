import React from 'react';
import { MessageCircle, Heart, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Post } from '../types';

type FeedProps = {
  posts: Post[];
  loading: boolean;
  onLike: (postId: string) => void;
  onCommentClick: (postId: string) => void;
  onDelete?: (postId: string) => void;
  currentUsername?: string;
};

const Feed: React.FC<FeedProps> = ({
  posts,
  loading,
  onLike,
  onCommentClick,
  onDelete,
  currentUsername,
}) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm animate-pulse"
          >
            <div className="h-4 w-32 bg-gray-200 rounded mb-3" />
            <div className="h-3 w-full bg-gray-200 rounded mb-2" />
            <div className="h-3 w-4/5 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="bg-white p-8 rounded-xl border border-gray-100 text-center text-gray-500">
        No posts yet. Be the first to share an update.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => {
        const liked = currentUsername ? post.likedBy.includes(currentUsername) : false;
        return (
          <article key={post.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-gray-900">@{post.username}</p>
                <p className="text-xs text-gray-400">
                  {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                </p>
              </div>
              {onDelete && currentUsername === post.username ? (
                <button
                  onClick={() => onDelete(post.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  aria-label="Delete post"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              ) : null}
            </div>

            <p className="mt-4 text-gray-800 leading-relaxed whitespace-pre-wrap">{post.text}</p>

            {post.image_url ? (
              <img
                src={post.image_url}
                alt="Post attachment"
                className="mt-4 w-full rounded-lg border border-gray-100 object-cover"
              />
            ) : null}

            <div className="mt-4 flex items-center gap-4 text-sm">
              <button
                onClick={() => onLike(post.id)}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                  liked
                    ? 'border-rose-200 bg-rose-50 text-rose-600'
                    : 'border-gray-200 text-gray-600 hover:text-gray-800'
                }`}
              >
                <Heart className={`w-4 h-4 ${liked ? 'fill-rose-500' : ''}`} />
                {post.likes} Like{post.likes === 1 ? '' : 's'}
              </button>
              <button
                onClick={() => onCommentClick(post.id)}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                {post.commentCount} Comment{post.commentCount === 1 ? '' : 's'}
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
};

export default Feed;
