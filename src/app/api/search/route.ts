import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'content';
    const query = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 10;
    const offset = (page - 1) * limit;

    let results: any[] = [];
    let total = 0;

    switch (type) {
      // 1. Substring search across posts and replies
      case 'content': {
        const postsResult = await pool.query(
          `SELECT 'post' as type, p.id, p.title as title, p.body, p.author_name, 
           p.created_at, p.channel_id, c.name as channel_name
           FROM posts p
           JOIN channels c ON c.id = p.channel_id
           WHERE p.title ILIKE $1 OR p.body ILIKE $1
           ORDER BY p.created_at DESC
           LIMIT $2 OFFSET $3`,
          [`%${query}%`, limit, offset]
        );

        const repliesResult = await pool.query(
          `SELECT 'reply' as type, r.id, '' as title, r.body, r.author_name,
           r.created_at, p.channel_id, c.name as channel_name
           FROM replies r
           JOIN posts p ON p.id = r.post_id
           JOIN channels c ON c.id = p.channel_id
           WHERE r.body ILIKE $1
           ORDER BY r.created_at DESC
           LIMIT $2 OFFSET $3`,
          [`%${query}%`, limit, offset]
        );

        results = [...postsResult.rows, ...repliesResult.rows];
        total = results.length;
        break;
      }

      // 2. Content by a specific author
      case 'author': {
        const postsResult = await pool.query(
          `SELECT 'post' as type, p.id, p.title, p.body, p.author_name,
           p.created_at, p.channel_id, c.name as channel_name
           FROM posts p
           JOIN channels c ON c.id = p.channel_id
           WHERE p.author_name ILIKE $1
           ORDER BY p.created_at DESC
           LIMIT $2 OFFSET $3`,
          [`%${query}%`, limit, offset]
        );

        const repliesResult = await pool.query(
          `SELECT 'reply' as type, r.id, '' as title, r.body, r.author_name,
           r.created_at, p.channel_id, c.name as channel_name
           FROM replies r
           JOIN posts p ON p.id = r.post_id
           JOIN channels c ON c.id = p.channel_id
           WHERE r.author_name ILIKE $1
           ORDER BY r.created_at DESC
           LIMIT $2 OFFSET $3`,
          [`%${query}%`, limit, offset]
        );

        results = [...postsResult.rows, ...repliesResult.rows];
        total = results.length;
        break;
      }

      // 3. User with most posts
      case 'most_posts': {
        const result = await pool.query(
          `SELECT author_name, COUNT(*) as post_count
           FROM posts
           GROUP BY author_name
           ORDER BY post_count DESC
           LIMIT $1 OFFSET $2`,
          [limit, offset]
        );
        results = result.rows;
        total = results.length;
        break;
      }

      // 4. User with least posts
      case 'least_posts': {
        const result = await pool.query(
          `SELECT author_name, COUNT(*) as post_count
           FROM posts
           GROUP BY author_name
           ORDER BY post_count ASC
           LIMIT $1 OFFSET $2`,
          [limit, offset]
        );
        results = result.rows;
        total = results.length;
        break;
      }

      // 5. Highest ranked content
      case 'top_rated': {
        const result = await pool.query(
          `SELECT 'post' as type, p.id, p.title, p.body, p.author_name,
           p.created_at, p.channel_id, c.name as channel_name,
           COALESCE(SUM(v.value), 0) as score
           FROM posts p
           JOIN channels c ON c.id = p.channel_id
           LEFT JOIN votes v ON v.target_type = 'post' AND v.target_id = p.id
           GROUP BY p.id, c.name
           ORDER BY score DESC
           LIMIT $1 OFFSET $2`,
          [limit, offset]
        );
        results = result.rows;
        total = results.length;
        break;
      }

      // 6. Lowest ranked content
      case 'low_rated': {
        const result = await pool.query(
          `SELECT 'post' as type, p.id, p.title, p.body, p.author_name,
           p.created_at, p.channel_id, c.name as channel_name,
           COALESCE(SUM(v.value), 0) as score
           FROM posts p
           JOIN channels c ON c.id = p.channel_id
           LEFT JOIN votes v ON v.target_type = 'post' AND v.target_id = p.id
           GROUP BY p.id, c.name
           ORDER BY score ASC
           LIMIT $1 OFFSET $2`,
          [limit, offset]
        );
        results = result.rows;
        total = results.length;
        break;
      }

      default:
        return NextResponse.json({ error: 'Invalid search type' }, { status: 400 });
    }

    return NextResponse.json({
      results,
      page,
      limit,
      total,
      hasMore: results.length === limit,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}