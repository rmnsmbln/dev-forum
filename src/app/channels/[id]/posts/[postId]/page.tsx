import Link from 'next/link';
import pool from '@/lib/db';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import ReplyForm from './ReplyForm';
import VoteButton from '@/app/components/VoteButton';

export const dynamic = 'force-dynamic';

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string; postId: string }>;
}) {
  const { id, postId } = await params;

  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  const isLoggedIn = !!session.user;
  const userId = session.user?.id;

  const postResult = await pool.query(
    'SELECT * FROM posts WHERE id = $1 AND channel_id = $2',
    [postId, id]
  );

  if (postResult.rows.length === 0) notFound();
  const post = postResult.rows[0];

  // Get post vote score and user's vote
  const postVoteResult = await pool.query(
    'SELECT COALESCE(SUM(value), 0) as score FROM votes WHERE target_type = $1 AND target_id = $2',
    ['post', postId]
  );
  const postScore = Number(postVoteResult.rows[0].score);

  let postUserVote = 0;
  if (userId) {
    const userVoteResult = await pool.query(
      'SELECT value FROM votes WHERE user_id = $1 AND target_type = $2 AND target_id = $3',
      [userId, 'post', postId]
    );
    if (userVoteResult.rows.length > 0) {
      postUserVote = userVoteResult.rows[0].value;
    }
  }

  // Get all replies with their vote scores
  const repliesResult = await pool.query(
    `SELECT r.*, 
     COALESCE(SUM(v.value), 0) as score,
     MAX(uv.value) as user_vote
     FROM replies r
     LEFT JOIN votes v ON v.target_type = 'reply' AND v.target_id = r.id
     LEFT JOIN votes uv ON uv.target_type = 'reply' AND uv.target_id = r.id AND uv.user_id = $2
     WHERE r.post_id = $1
     GROUP BY r.id
     ORDER BY r.created_at ASC`,
    [postId, userId || 0]
  );

  const replies = repliesResult.rows;

  // Build reply tree
  const topLevelReplies = replies.filter(r => !r.parent_reply_id);
  const getReplies = (parentId: number) => replies.filter(r => r.parent_reply_id === parentId);

  function ReplyTree({ reply, depth = 0 }: { reply: any; depth?: number }) {
    const children = getReplies(reply.id);
    return (
      <div className={`${depth > 0 ? 'ml-6 border-l border-gray-800 pl-4' : ''}`}>
        <div className="py-3">
          <div className="flex gap-3">
            <VoteButton
              targetType="reply"
              targetId={reply.id}
              initialScore={Number(reply.score)}
              userVote={reply.user_vote || 0}
              isLoggedIn={isLoggedIn}
            />
            <div className="flex-1">
              <div className="text-gray-300 text-sm leading-relaxed">
                {reply.body}
              </div>
              <div className="text-gray-600 text-xs mt-1">
                {reply.author_name} · {new Date(reply.created_at).toLocaleDateString()}
              </div>
              {isLoggedIn && (
                <ReplyForm
                  postId={postId}
                  channelId={id}
                  parentReplyId={reply.id}
                  compact={true}
                />
              )}
            </div>
          </div>
        </div>
        {children.map(child => (
          <ReplyTree key={child.id} reply={child} depth={depth + 1} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Link href={`/channels/${id}`} className="text-gray-500 hover:text-gray-300 text-sm">
        Back to channel
      </Link>

      <div className="bg-[#1a1a1b] border border-gray-800 rounded-lg p-6 flex gap-4">
        <VoteButton
          targetType="post"
          targetId={post.id}
          initialScore={postScore}
          userVote={postUserVote}
          isLoggedIn={isLoggedIn}
        />
        <div className="flex-1">
          <h1 className="text-xl font-bold text-white mb-2">{post.title}</h1>
          <div className="text-gray-600 text-xs mb-4">
            Posted by {post.author_name} · {new Date(post.created_at).toLocaleDateString()}
          </div>
          <p className="text-gray-300 leading-relaxed">{post.body}</p>
          {post.image_url && (
            <div className="mt-4">
              <img
                src={post.image_url}
                alt="Post screenshot"
                className="max-w-full rounded border border-gray-700"
              />
            </div>
          )}
        </div>
      </div>

      <div className="bg-[#1a1a1b] border border-gray-800 rounded-lg p-6">
        <h2 className="text-white font-bold mb-4">
          {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
        </h2>

        {replies.length === 0 ? (
          <p className="text-gray-500 text-sm mb-6">No replies yet. Be the first to reply!</p>
        ) : (
          <div className="mb-6 space-y-2">
            {topLevelReplies.map(reply => (
              <ReplyTree key={reply.id} reply={reply} />
            ))}
          </div>
        )}

        <ReplyForm postId={postId} channelId={id} />
      </div>
    </div>
  );
}