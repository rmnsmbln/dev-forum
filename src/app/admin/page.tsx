import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import { redirect } from 'next/navigation';
import pool from '@/lib/db';
import AdminPanel from './AdminPanel';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

  if (!session.user || session.user.role !== 'admin') {
    redirect('/');
  }

  const [usersResult, channelsResult, postsResult, repliesResult] = await Promise.all([
    pool.query('SELECT id, display_name, email, role, created_at FROM users ORDER BY created_at DESC'),
    pool.query('SELECT * FROM channels ORDER BY created_at DESC'),
    pool.query('SELECT * FROM posts ORDER BY created_at DESC'),
    pool.query('SELECT * FROM replies ORDER BY created_at DESC'),
  ]);

  return (
    <AdminPanel
      users={usersResult.rows}
      channels={channelsResult.rows}
      posts={postsResult.rows}
      replies={repliesResult.rows}
    />
  );
}