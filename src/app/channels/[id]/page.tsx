import Link from 'next/link';
import pool from '@/lib/db';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';

export const dynamic = 'force-dynamic';

export default async function ChannelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

  const channelResult = await pool.query(
    'SELECT * FROM channels WHERE id = $1',
    [id]
  );

  if (channelResult.rows.length === 0) notFound();
  const channel = channelResult.rows[0];

  const postsResult = await pool.query(
    `SELECT p.*, COALESCE(SUM(v.value), 0) as score
     FROM posts p
     LEFT JOIN votes v ON v.target_type = 'post' AND v.target_id = p.id
     WHERE p.channel_id = $1
     GROUP BY p.id
     ORDER BY p.created_at DESC`,
    [id]
  );

  const posts = postsResult.rows;
  const isLoggedIn = !!session.user;

  return (
    <div>
      <div className="bg-[#1a1a1b] border border-gray-800 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">#{channel.name}</h1>
            {channel.description && (
              <p className="text-gray-400 text-sm mt-1">{channel.description}</p>
            )}
          </div>
          {isLoggedIn ? (
            <Link
              href={`/channels/${id}/new-post`}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-1.5 rounded-full text-sm font-medium transition"
            >
              New Post
            </Link>
          ) : (
            <Link
              href="/auth/signin"
              className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-1.5 rounded-full text-sm font-medium transition"
            >
              Sign in to post
            </Link>
          )}
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="bg-[#1a1a1b] border border-gray-800 rounded-lg p-8 text-center">
          <p className="text-gray-500">No posts yet.</p>
          {isLoggedIn && (
            <Link
              href={`/channels/${id}/new-post`}
              className="inline-block mt-4 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full text-sm font-medium transition"
            >
              Create the first post
            </Link>
          )}
        </div>
      ) : (
        <ul className="space-y-2">
          {posts.map((post) => (
            <li key={post.id}>
              <Link
                href={`/channels/${id}/posts/${post.id}`}
                className="flex items-start gap-4 bg-[#1a1a1b] border border-gray-800 hover:border-purple-500 rounded-lg p-4 transition group"
              >
                <div className="flex flex-col items-center bg-[#0f0f0f] rounded px-3 py-2 min-w-[48px]">
                  <span className="text-purple-400">▲</span>
                  <span className={`text-xs mt-1 font-medium ${
                    Number(post.score) > 0 ? 'text-purple-400' :
                    Number(post.score) < 0 ? 'text-red-400' : 'text-gray-500'
                  }`}>
                    {post.score}
                  </span>
                </div>
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