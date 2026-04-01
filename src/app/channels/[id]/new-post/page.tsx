'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

export default function NewPost() {
  const router = useRouter();
  const params = useParams();
  const channelId = params.id;

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (!data.user) {
          router.push('/auth/signin');
        }
      });
  }, []);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;

    const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!allowed.includes(selected.type)) {
      setError('Only PNG, JPEG, and WebP images are allowed');
      return;
    }
    if (selected.size > 5 * 1024 * 1024) {
      setError('File size must be under 5MB');
      return;
    }

    setError('');
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let imageUrl = null;

      if (file) {
        const formData = new FormData();
        formData.append('file', file);

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const uploadData = await uploadRes.json();

        if (!uploadRes.ok) {
          setError(uploadData.error || 'Upload failed');
          setLoading(false);
          return;
        }

        imageUrl = uploadData.url;
      }

      const res = await fetch(`/api/channels/${channelId}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          body,
          image_url: imageUrl,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        setLoading(false);
        return;
      }

      router.push(`/channels/${channelId}`);
    } catch (err) {
      setError('Something went wrong');
      setLoading(false);
    }
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

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Screenshot (optional)
          </label>
          <input
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            onChange={handleFileChange}
            className="w-full text-sm text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-sm file:bg-purple-600 file:text-white hover:file:bg-purple-700 file:cursor-pointer"
          />
          <p className="text-gray-600 text-xs mt-1">PNG, JPEG, WebP — max 5MB</p>

          {preview && (
            <div className="mt-3">
              <img
                src={preview}
                alt="Preview"
                className="max-h-48 rounded border border-gray-700 object-contain"
              />
              <button
                type="button"
                onClick={() => { setFile(null); setPreview(null); }}
                className="text-red-400 text-xs mt-1 hover:text-red-300"
              >
                Remove image
              </button>
            </div>
          )}
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