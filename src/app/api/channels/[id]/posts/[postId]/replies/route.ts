import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string; postId: string }> }
) {
  try {
    const res = new NextResponse();
    const session = await getIronSession<SessionData>(request as any, res, sessionOptions);

    if (!session.user) {
      return NextResponse.json(
        { error: 'You must be logged in to reply' },
        { status: 401 }
      );
    }

    const { postId } = await context.params;
    const { body } = await request.json();

    if (!body) {
      return NextResponse.json(
        { error: 'Reply body is required' },
        { status: 400 }
      );
    }

    const result = await pool.query(
      'INSERT INTO replies (post_id, body, author_name, author_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [postId, body, session.user.displayName, session.user.id]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create reply' },
      { status: 500 }
    );
  }
}