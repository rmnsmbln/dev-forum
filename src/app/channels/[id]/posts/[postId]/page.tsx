import Link from 'next/link';
import pool from '@/lib/db';
import { notFound } from 'next/navigation';
import ReplyForm from './ReplyForm';

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string; postId: string }>;
}) {
  const { id, postId } = await params;

  const postResult = await pool.query(
    'SELECT * FROM posts WHERE id = $1 AND channel_id = $2',
    [postId, id]
  );

  if (postResult.rows.length === 0) {
    notFound();
  }

  const post = postResult.rows[0];

  const repliesResult = await pool.query(
    'SELECT * FROM replies WHERE post_id = $1 ORDER BY created_at ASC',
    [postId]
  );

  const replies = repliesResult.rows;

  return (
    <div className="space-y-4">
      <Link
        href={`/channels/${id}`}
        className="text-gray-500 hover:text-gray-300 text-sm"
      >
        Back to channel
      </Link>

      <div className="bg-[#1a1a1b] border border-gray-800 rounded-lg p-6 flex gap-4">
        <div className="flex flex-col items-center bg-[#0f0f0f] rounded px-3 py-2 min-w-[48px] h-fit">
          <span className="text-purple-400 cursor-pointer hover:text-purple-300">▲</span>
          <span className="text-gray-400 text-sm font-medium my-1">0</span>
          <span className="text-gray-600 cursor-pointer hover:text-gray-400">▼</span>
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-white mb-2">{post.title}</h1>
          <div className="text-gray-600 text-xs mb-4">
            Posted by {post.author_name} · {new Date(post.created_at).toLocaleDateString()}
          </div>
          <p className="text-gray-300 leading-relaxed">{post.body}</p>
        </div>
      </div>

      <div className="bg-[#1a1a1b] border border-gray-800 rounded-lg p-6">
        <h2 className="text-white font-bold mb-4">
          {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
        </h2>

        {replies.length === 0 ? (
          <p className="text-gray-500 text-sm mb-6">
            No replies yet. Be the first to reply!
          </p>
        ) : (
          <ul className="space-y-4 mb-6">
            {replies.map((reply) => (
              <li
                key={reply.id}
                className="border-l-2 border-purple-800 pl-4 py-1"
              >
                <div className="text-gray-300 text-sm leading-relaxed">
                  {reply.body}
                </div>
                <div className="text-gray-600 text-xs mt-1">
                  {reply.author_name} · {new Date(reply.created_at).toLocaleDateString()}
                </div>
              </li>
            ))}
          </ul>
        )}

        <ReplyForm postId={postId} channelId={id} />
      </div>
    </div>
  );
}