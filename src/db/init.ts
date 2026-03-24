import pool from '../lib/db.js';
import fs from 'fs';
import path from 'path';

async function init() {
  const client = await pool.connect();
  
  try {
    console.log('Running schema...');
    const schema = fs.readFileSync(
      path.join(process.cwd(), 'src/db/schema.sql'),
      'utf8'
    );
    await client.query(schema);
    console.log('Schema done ✅');

    console.log('Running seed...');
    const seed = fs.readFileSync(
      path.join(process.cwd(), 'src/db/seed.sql'),
      'utf8'
    );
    await client.query(seed);
    console.log('Seed done ✅');

  } catch (err) {
    console.error('Database init failed:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

init();