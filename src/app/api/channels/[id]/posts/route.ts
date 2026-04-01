import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const result = await pool.query(
      'SELECT * FROM posts WHERE channel_id = $1 ORDER BY created_at DESC',
      [id]
    );
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const res = new NextResponse();
    const session = await getIronSession<SessionData>(request as any, res, sessionOptions);

    if (!session.user) {
      return NextResponse.json(
        { error: 'You must be logged in to create a post' },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const { title, body, author_name, image_url } = await request.json();

    if (!title || !body) {
      return NextResponse.json(
        { error: 'Title and body are required' },
        { status: 400 }
      );
    }

    const result = await pool.query(
      'INSERT INTO posts (channel_id, title, body, author_name, image_url, author_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [id, title, body, session.user.displayName, image_url || null, session.user.id]
    );
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}