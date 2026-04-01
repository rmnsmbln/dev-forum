'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ReplyForm({
  postId,
  channelId,
  parentReplyId,
  compact = false,
}: {
  postId: string;
  channelId: string;
  parentReplyId?: number;
  compact?: boolean;
}) {
  const router = useRouter();
  const [body, setBody] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [checking, setChecking] = useState(true);
  const [showForm, setShowForm] = useState(!compact);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        setUser(data.user);
        setChecking(false);
      });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await fetch(
      `/api/channels/${channelId}/posts/${postId}/replies`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body, parent_reply_id: parentReplyId }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || 'Something went wrong');
      setLoading(false);
      return;
    }

    setBody('');
    setLoading(false);
    setShowForm(false);
    router.refresh();
  }

  if (checking) return null;

  if (!user && !compact) {
    return (
      <div className="border border-gray-800 rounded-lg p-4 text-center">
        <p className="text-gray-500 text-sm mb-3">You must be signed in to reply</p>
        <Link
          href="/auth/signin"
          className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-full text-sm font-medium transition"
        >
          Sign in to reply
        </Link>
      </div>
    );
  }

  if (compact && !showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="text-gray-500 hover:text-purple-400 text-xs mt-2 transition"
      >
        Reply
      </button>
    );
  }

  if (!user) return null;

  return (
    <form onSubmit={handleSubmit} className="mt-3">
      {!compact && <h3 className="text-white font-medium mb-3">Leave a Reply</h3>}
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Write your reply..."
        rows={compact ? 2 : 4}
        required
        className="w-full bg-[#0f0f0f] border border-gray-700 rounded px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 resize-none mb-2"
      />
      {error && <p className="text-red-400 text-sm mb-2">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-1.5 rounded-full text-xs font-medium transition disabled:opacity-50"
        >
          {loading ? 'Posting...' : 'Reply'}
        </button>
        {compact && (
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="text-gray-500 hover:text-white px-4 py-1.5 rounded-full text-xs transition"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}