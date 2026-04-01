import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';

export async function GET(request: NextRequest) {
  const res = new NextResponse();
  const session = await getIronSession<SessionData>(request, res, sessionOptions);

  if (!session.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const result = await pool.query(
    'SELECT id, display_name, email, role, created_at FROM users ORDER BY created_at DESC'
  );
  return NextResponse.json(result.rows);
}

export async function DELETE(request: NextRequest) {
  const res = new NextResponse();
  const session = await getIronSession<SessionData>(request, res, sessionOptions);

  if (!session.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { id } = await request.json();

  if (id === session.user.id) {
    return NextResponse.json(
      { error: 'You cannot delete your own account' },
      { status: 400 }
    );
  }

  await pool.query('DELETE FROM users WHERE id = $1', [id]);
  return NextResponse.json({ success: true });
}