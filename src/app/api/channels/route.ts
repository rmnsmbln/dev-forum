import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET /api/channels - fetch all channels
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

// POST /api/channels - create a new channel
export async function POST(request: Request) {
  try {
    const { name, description } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: 'Channel name is required!' },
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