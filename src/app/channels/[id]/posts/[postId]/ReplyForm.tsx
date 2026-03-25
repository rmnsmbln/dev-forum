'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ReplyForm({
  postId,
  channelId,
}: {
  postId: string;
  channelId: string;
}) {
  const router = useRouter();
  const [body, setBody] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await fetch(
      `/api/channels/${channelId}/posts/${postId}/replies`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body, author_name: authorName }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || 'Something went wrong');
      setLoading(false);
      return;
    }

    setBody('');
    setAuthorName('');
    setLoading(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit}>
      <h3 className="text-white font-medium mb-3">Leave a Reply</h3>
      <input
        type="text"
        value={authorName}
        onChange={(e) => setAuthorName(e.target.value)}
        placeholder="Your name (optional)"
        className="w-full bg-[#0f0f0f] border border-gray-700 rounded px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 mb-3"
      />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Write your reply..."
        rows={4}
        required
        className="w-full bg-[#0f0f0f] border border-gray-700 rounded px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 resize-none mb-3"
      />
      {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-full text-sm font-medium transition disabled:opacity-50"
      >
        {loading ? 'Posting...' : 'Reply'}
      </button>
    </form>
  );
}