import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';

export async function GET() {
  try {
    const result = await pool.query(
      'SELECT * FROM channels ORDER BY created_at DESC'
    );
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch channels' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const res = new NextResponse();
    const session = await getIronSession<SessionData>(request, res, sessionOptions);

    if (!session.user) {
      return NextResponse.json(
        { error: 'You must be logged in to create a channel' },
        { status: 401 }
      );
    }

    const { name, description } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: 'Channel name is required' },
        { status: 400 }
      );
    }

    const result = await pool.query(
      'INSERT INTO channels (name, description) VALUES ($1, $2) RETURNING *',
      [name, description]
    );
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create channel' },
      { status: 500 }
    );
  }
}