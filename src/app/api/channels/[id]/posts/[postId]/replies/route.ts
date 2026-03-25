import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string; postId: string }> }
) {
  try {
    const { postId } = await context.params;
    const { body, author_name } = await request.json();

    if (!body) {
      return NextResponse.json(
        { error: 'Reply body is required' },
        { status: 400 }
      );
    }

    const result = await pool.query(
      'INSERT INTO replies (post_id, body, author_name) VALUES ($1, $2, $3) RETURNING *',
      [postId, body, author_name || 'Anonymous']
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create reply' },
      { status: 500 }
    );
  }
}