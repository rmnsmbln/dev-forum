import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';

export async function DELETE(request: NextRequest) {
  const res = new NextResponse();
  const session = await getIronSession<SessionData>(request, res, sessionOptions);

  if (!session.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { id } = await request.json();
  await pool.query('DELETE FROM replies WHERE id = $1', [id]);
  return NextResponse.json({ success: true });
}