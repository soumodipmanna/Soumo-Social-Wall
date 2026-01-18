import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Comment, Post, User } from '../types';
import { api } from '../services/api';

type PostDetailModalProps = {
  postId: string;
  onClose: () => void;
  currentUser: User | null;
  onCommentAdded: () => void;
};

const PostDetailModal: React.FC<PostDetailModalProps> = ({
  postId,
  onClose,
  currentUser,
  onCommentAdded,
}) => {
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      const [postData, commentData] = await Promise.all([
        api.getPost(postId),
        api.getComments(postId),
      ]);
      if (!isMounted) {
        return;
      }
      setPost(postData || null);
      setComments(commentData);
      setLoading(false);
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [postId]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!currentUser || !commentText.trim()) {
      return;
    }
    await api.addComment(postId, {
      username: currentUser.username,
      comment: commentText.trim(),
    });
    setCommentText('');
    const updatedComments = await api.getComments(postId);
    setComments(updatedComments);
    onCommentAdded();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl p-6 rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Post details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-4 w-32 bg-gray-200 rounded" />
            <div className="h-3 w-full bg-gray-200 rounded" />
            <div className="h-3 w-4/5 bg-gray-200 rounded" />
          </div>
        ) : post ? (
          <>
            <div className="border border-gray-100 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">@{post.username}</p>
                  <p className="text-xs text-gray-400">
                    {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-gray-800 whitespace-pre-wrap">{post.text}</p>
              {post.image_url ? (
                <img
                  src={post.image_url}
                  alt="Post attachment"
                  className="mt-4 w-full rounded-lg border border-gray-100 object-cover"
                />
              ) : null}
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700">
                {comments.length} Comment{comments.length === 1 ? '' : 's'}
              </h3>
              {comments.length === 0 ? (
                <p className="text-sm text-gray-500">No comments yet.</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="border border-gray-100 rounded-lg p-3">
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span className="font-medium text-gray-700">@{comment.username}</span>
                      <span>
                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">
                      {comment.comment}
                    </p>
                  </div>
                ))
              )}
            </div>

            <div className="mt-6">
              {currentUser ? (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <textarea
                    value={commentText}
                    onChange={(event) => setCommentText(event.target.value)}
                    placeholder="Write a comment..."
                    rows={3}
                    className="w-full resize-none rounded-lg border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Add comment
                  </button>
                </form>
              ) : (
                <p className="text-sm text-gray-500">
                  Log in to add a comment.
                </p>
              )}
            </div>
          </>
        ) : (
          <p className="text-sm text-gray-500">Post not found.</p>
        )}
      </div>
    </div>
  );
};

export default PostDetailModal;
