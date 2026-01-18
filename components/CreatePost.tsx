import React, { useState } from 'react';
import { ImagePlus, Send } from 'lucide-react';
import { User } from '../types';
import { api } from '../services/api';

type CreatePostProps = {
  currentUser: User;
  onPostCreated: () => void;
};

const CreatePost: React.FC<CreatePostProps> = ({ currentUser, onPostCreated }) => {
  const [text, setText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (!text.trim()) {
      return;
    }
    setPosting(true);
    try {
      await api.createPost({
        username: currentUser.username,
        text: text.trim(),
        image_url: imageUrl.trim() || undefined,
      });
      setText('');
      setImageUrl('');
      onPostCreated();
    } catch (err) {
      const message =
        err instanceof Error && err.message
          ? err.message
          : 'Unable to create post. Is the API server running?';
      setError(message);
    } finally {
      setPosting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm mb-8"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Share an update</h3>
        <span className="text-xs text-gray-400">
          Posting as @{currentUser.username}
        </span>
      </div>
      <textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="What is on your mind?"
        rows={3}
        className="w-full resize-none rounded-lg border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {error ? (
        <p className="mt-3 text-sm text-red-600">{error}</p>
      ) : null}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <ImagePlus className="w-4 h-4" />
          <input
            type="url"
            value={imageUrl}
            onChange={(event) => setImageUrl(event.target.value)}
            placeholder="Optional image URL"
            className="flex-1 min-w-[220px] rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </label>
        <button
          type="submit"
          disabled={posting}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="w-4 h-4" />
          {posting ? 'Posting...' : 'Post'}
        </button>
      </div>
    </form>
  );
};

export default CreatePost;
