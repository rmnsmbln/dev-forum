import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    const res = new NextResponse();
    const session = await getIronSession<SessionData>(request, res, sessionOptions);

    if (!session.user) {
      return NextResponse.json(
        { error: 'You must be logged in to vote' },
        { status: 401 }
      );
    }

    const { targetType, targetId, value } = await request.json();

    if (!['post', 'reply'].includes(targetType)) {
      return NextResponse.json(
        { error: 'Invalid target type' },
        { status: 400 }
      );
    }

    if (![1, -1].includes(value)) {
      return NextResponse.json(
        { error: 'Invalid vote value' },
        { status: 400 }
      );
    }

    // Check if user already voted
    const existing = await pool.query(
      'SELECT * FROM votes WHERE user_id = $1 AND target_type = $2 AND target_id = $3',
      [session.user.id, targetType, targetId]
    );

    if (existing.rows.length > 0) {
      if (existing.rows[0].value === value) {
        // Same vote — remove it (toggle off)
        await pool.query(
          'DELETE FROM votes WHERE user_id = $1 AND target_type = $2 AND target_id = $3',
          [session.user.id, targetType, targetId]
        );
        return NextResponse.json({ action: 'removed', value: 0 });
      } else {
        // Different vote — update it
        await pool.query(
          'UPDATE votes SET value = $1 WHERE user_id = $2 AND target_type = $3 AND target_id = $4',
          [value, session.user.id, targetType, targetId]
        );
        return NextResponse.json({ action: 'updated', value });
      }
    }

    // New vote
    await pool.query(
      'INSERT INTO votes (user_id, target_type, target_id, value) VALUES ($1, $2, $3, $4)',
      [session.user.id, targetType, targetId, value]
    );

    return NextResponse.json({ action: 'added', value });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to vote' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const targetType = searchParams.get('targetType');
    const targetId = searchParams.get('targetId');

    const result = await pool.query(
      'SELECT COALESCE(SUM(value), 0) as score FROM votes WHERE target_type = $1 AND target_id = $2',
      [targetType, targetId]
    );

    return NextResponse.json({ score: Number(result.rows[0].score) });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get votes' },
      { status: 500 }
    );
  }
}