'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

export default function NewPost() {
  const router = useRouter();
  const params = useParams();
  const channelId = params.id;

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await fetch(`/api/channels/${channelId}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, body, author_name: authorName }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || 'Something went wrong');
      setLoading(false);
      return;
    }

    router.push(`/channels/${channelId}`);
  }

  return (
    <div className="bg-[#1a1a1b] border border-gray-800 rounded-lg p-6 max-w-xl">
      <div className="flex items-center gap-2 mb-6">
        <Link href={`/channels/${channelId}`} className="text-gray-500 hover:text-gray-300 text-sm">
          Back
        </Link>
        <span className="text-gray-700">/</span>
        <h1 className="text-white font-bold">Create a Post</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Your Name
          </label>
          <input
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="e.g. DevRam"
            className="w-full bg-[#0f0f0f] border border-gray-700 rounded px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What's your question?"
            className="w-full bg-[#0f0f0f] border border-gray-700 rounded px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Body
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Describe your question in detail..."
            rows={6}
            className="w-full bg-[#0f0f0f] border border-gray-700 rounded px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 resize-none"
            required
          />
        </div>

        {error && (
          <p className="text-red-400 text-sm">{error}</p>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-full text-sm font-medium transition disabled:opacity-50"
          >
            {loading ? 'Posting...' : 'Post'}
          </button>
          <Link
            href={`/channels/${channelId}`}
            className="text-gray-400 hover:text-white px-5 py-2 rounded-full text-sm font-medium transition border border-gray-700 hover:border-gray-500"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}