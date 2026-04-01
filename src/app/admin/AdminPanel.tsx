'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  display_name: string;
  email: string;
  role: string;
  created_at: string;
}

interface Channel {
  id: number;
  name: string;
  description: string;
  created_at: string;
}

interface Post {
  id: number;
  title: string;
  author_name: string;
  created_at: string;
}

interface Reply {
  id: number;
  body: string;
  author_name: string;
  created_at: string;
}

export default function AdminPanel({
  users,
  channels,
  posts,
  replies,
}: {
  users: User[];
  channels: Channel[];
  posts: Post[];
  replies: Reply[];
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'users' | 'channels' | 'posts' | 'replies'>('users');
  const [loading, setLoading] = useState(false);

  async function handleDelete(type: string, id: number, name: string) {
    const confirmed = window.confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`);
    if (!confirmed) return;

    setLoading(true);
    const res = await fetch(`/api/admin/${type}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });

    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json();
      alert(data.error || 'Failed to delete');
    }
    setLoading(false);
  }

  const tabs = ['users', 'channels', 'posts', 'replies'] as const;

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Admin Panel</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition capitalize ${
              activeTab === tab
                ? 'bg-purple-600 text-white'
                : 'bg-[#1a1a1b] text-gray-400 hover:text-white border border-gray-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Users */}
      {activeTab === 'users' && (
        <div className="bg-[#1a1a1b] border border-gray-800 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-800">
              <tr>
                <th className="text-left p-4 text-gray-400">Name</th>
                <th className="text-left p-4 text-gray-400">Email</th>
                <th className="text-left p-4 text-gray-400">Role</th>
                <th className="text-left p-4 text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-gray-800 last:border-0">
                  <td className="p-4 text-white">{user.display_name}</td>
                  <td className="p-4 text-gray-400">{user.email}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      user.role === 'admin' ? 'bg-purple-900 text-purple-300' : 'bg-gray-800 text-gray-400'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleDelete('users', user.id, user.display_name)}
                      disabled={loading}
                      className="text-red-400 hover:text-red-300 text-xs transition disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Channels */}
      {activeTab === 'channels' && (
        <div className="bg-[#1a1a1b] border border-gray-800 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-800">
              <tr>
                <th className="text-left p-4 text-gray-400">Name</th>
                <th className="text-left p-4 text-gray-400">Description</th>
                <th className="text-left p-4 text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {channels.map((channel) => (
                <tr key={channel.id} className="border-b border-gray-800 last:border-0">
                  <td className="p-4 text-white">#{channel.name}</td>
                  <td className="p-4 text-gray-400">{channel.description}</td>
                  <td className="p-4">
                    <button
                      onClick={() => handleDelete('channels', channel.id, channel.name)}
                      disabled={loading}
                      className="text-red-400 hover:text-red-300 text-xs transition disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Posts */}
      {activeTab === 'posts' && (
        <div className="bg-[#1a1a1b] border border-gray-800 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-800">
              <tr>
                <th className="text-left p-4 text-gray-400">Title</th>
                <th className="text-left p-4 text-gray-400">Author</th>
                <th className="text-left p-4 text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} className="border-b border-gray-800 last:border-0">
                  <td className="p-4 text-white">{post.title}</td>
                  <td className="p-4 text-gray-400">{post.author_name}</td>
                  <td className="p-4">
                    <button
                      onClick={() => handleDelete('posts', post.id, post.title)}
                      disabled={loading}
                      className="text-red-400 hover:text-red-300 text-xs transition disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Replies */}
      {activeTab === 'replies' && (
        <div className="bg-[#1a1a1b] border border-gray-800 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-800">
              <tr>
                <th className="text-left p-4 text-gray-400">Reply</th>
                <th className="text-left p-4 text-gray-400">Author</th>
                <th className="text-left p-4 text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {replies.map((reply) => (
                <tr key={reply.id} className="border-b border-gray-800 last:border-0">
                  <td className="p-4 text-white truncate max-w-xs">{reply.body}</td>
                  <td className="p-4 text-gray-400">{reply.author_name}</td>
                  <td className="p-4">
                    <button
                      onClick={() => handleDelete('replies', reply.id, reply.body)}
                      disabled={loading}
                      className="text-red-400 hover:text-red-300 text-xs transition disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}