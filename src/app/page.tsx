import Link from 'next/link';
import pool from '@/lib/db';

export default async function Home() {
  const result = await pool.query(
    'SELECT * FROM channels ORDER BY created_at DESC'
  );
  const channels = result.rows;

  return (
    <div>
      <h1 className="text-lg font-bold text-white mb-4">All Channels</h1>

      {channels.length === 0 ? (
        <div className="bg-[#1a1a1b] border border-gray-800 rounded-lg p-8 text-center">
          <p className="text-gray-500">No channels yet.</p>
          <Link
            href="/channels/new"
            className="inline-block mt-4 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full text-sm font-medium transition"
          >
            Create the first one
          </Link>
        </div>
      ) : (
        <ul className="space-y-2">
          {channels.map((channel) => (
            <li key={channel.id}>
              <Link
                href={`/channels/${channel.id}`}
                className="flex items-center gap-4 bg-[#1a1a1b] border border-gray-800 hover:border-purple-500 rounded-lg p-4 transition group"
              >
                {/* Vote-style left indicator */}
                <div className="flex flex-col items-center justify-center bg-[#0f0f0f] rounded px-3 py-2 min-w-[48px]">
                  <span className="text-purple-400 text-lg">▲</span>
                  <span className="text-gray-500 text-xs mt-1">0</span>
                </div>

                {/* Channel info */}
                <div>
                  <div className="font-semibold text-purple-400 group-hover:text-purple-300">
                    #{channel.name}
                  </div>
                  {channel.description && (
                    <div className="text-gray-500 text-sm mt-0.5">
                      {channel.description}
                    </div>
                  )}
                  <div className="text-gray-600 text-xs mt-1">
                    Created {new Date(channel.created_at).toLocaleDateString()}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}