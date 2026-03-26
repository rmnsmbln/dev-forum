import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET /api/channels/[id]/posts - fetch all posts in a channel
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

// POST /api/channels/[id]/posts - create a new post
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { title, body, author_name, image_url } = await request.json();

    if (!title || !body) {
      return NextResponse.json(
        { error: 'Title and body are required' },
        { status: 400 }
      );
    }

    const result = await pool.query(
      'INSERT INTO posts (channel_id, title, body, author_name, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [id, title, body, author_name || 'Anonymous', image_url || null]
    );
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}