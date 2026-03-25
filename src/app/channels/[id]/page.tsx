import Link from 'next/link';
import pool from '@/lib/db';
import { notFound } from 'next/navigation';

export default async function ChannelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const channelResult = await pool.query(
    'SELECT * FROM channels WHERE id = $1',
    [id]
  );

  if (channelResult.rows.length === 0) {
    notFound();
  }

  const channel = channelResult.rows[0];

  const postsResult = await pool.query(
    'SELECT * FROM posts WHERE channel_id = $1 ORDER BY created_at DESC',
    [id]
  );

  const posts = postsResult.rows;

  return (
    <div>
      {/* Channel header */}
      <div className="bg-[#1a1a1b] border border-gray-800 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">
              #{channel.name}
            </h1>
            {channel.description && (
              <p className="text-gray-400 text-sm mt-1">
                {channel.description}
              </p>
            )}
          </div>
          <Link
            href={`/channels/${id}/new-post`}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-1.5 rounded-full text-sm font-medium transition"
          >
            New Post
          </Link>
        </div>
      </div>

      {/* Posts list */}
      {posts.length === 0 ? (
        <div className="bg-[#1a1a1b] border border-gray-800 rounded-lg p-8 text-center">
          <p className="text-gray-500">No posts yet.</p>
          <Link
            href={`/channels/${id}/new-post`}
            className="inline-block mt-4 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full text-sm font-medium transition"
          >
            Create the first post
          </Link>
        </div>
      ) : (
        <ul className="space-y-2">
          {posts.map((post) => (
            <li key={post.id}>
              <Link
                href={`/channels/${id}/posts/${post.id}`}
                className="flex items-start gap-4 bg-[#1a1a1b] border border-gray-800 hover:border-purple-500 rounded-lg p-4 transition group"
              >
                {/* Vote indicator */}
                <div className="flex flex-col items-center bg-[#0f0f0f] rounded px-3 py-2 min-w-[48px]">
                  <span className="text-purple-400">▲</span>
                  <span className="text-gray-500 text-xs mt-1">0</span>
                </div>

                {/* Post info */}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white group-hover:text-purple-300 transition">
                    {post.title}
                  </div>
                  <div className="text-gray-500 text-sm mt-1 truncate">
                    {post.body}
                  </div>
                  <div className="text-gray-600 text-xs mt-2">
                    Posted by {post.author_name} · {new Date(post.created_at).toLocaleDateString()}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}