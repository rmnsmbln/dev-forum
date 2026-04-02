'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface Result {
  type: string;
  id: number;
  title: string;
  body: string;
  author_name: string;
  created_at: string;
  channel_id: number;
  channel_name: string;
  score?: number;
  post_count?: number;
}

const SEARCH_TYPES = [
  { value: 'content', label: 'Search content' },
  { value: 'author', label: 'Search by author' },
  { value: 'most_posts', label: 'Most active users' },
  { value: 'least_posts', label: 'Least active users' },
  { value: 'top_rated', label: 'Top rated posts' },
  { value: 'low_rated', label: 'Lowest rated posts' },
];

const NO_QUERY_TYPES = ['most_posts', 'least_posts', 'top_rated', 'low_rated'];

export default function SearchPage() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState('');
  const [type, setType] = useState('content');
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setQuery(q);
      doSearch('content', q, 1);
    }
  }, []);

  async function doSearch(searchType: string, searchQuery: string, newPage = 1) {
    setLoading(true);
    const params = new URLSearchParams({
      type: searchType,
      q: searchQuery,
      page: newPage.toString(),
    });

    const res = await fetch(`/api/search?${params}`);
    const data = await res.json();

    if (newPage === 1) {
      setResults(data.results);
    } else {
      setResults(prev => [...prev, ...data.results]);
    }

    setHasMore(data.hasMore);
    setPage(newPage);
    setSearched(true);
    setLoading(false);
  }

  async function handleSearch(e?: React.FormEvent) {
    if (e) e.preventDefault();
    await doSearch(type, query, 1);
  }

  async function handleTypeChange(newType: string) {
    setType(newType);
    setSearched(false);
    setResults([]);
    setQuery('');

    if (NO_QUERY_TYPES.includes(newType)) {
      await doSearch(newType, '', 1);
    }
  }

  async function loadMore() {
    await doSearch(type, query, page + 1);
  }

  const noQuery = NO_QUERY_TYPES.includes(type);

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-2 text-center">Search</h1>
      <p className="text-gray-500 text-sm text-center mb-6">
        Search across posts, replies and users
      </p>
      <hr className="border-gray-800 mb-6" />

      <form onSubmit={handleSearch} className="bg-[#1a1a1b] border border-gray-800 rounded-lg p-4 mb-6">
        <div className="flex gap-3">
          <select
            value={type}
            onChange={(e) => handleTypeChange(e.target.value)}
            className="bg-[#0f0f0f] border border-gray-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
          >
            {SEARCH_TYPES.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>

          {!noQuery && (
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search..."
              className="flex-1 bg-[#0f0f0f] border border-gray-700 rounded px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500"
            />
          )}

          {!noQuery && (
            <button
              type="submit"
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-full text-sm font-medium transition disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          )}

          {noQuery && loading && (
            <span className="text-gray-400 text-sm py-2">Loading...</span>
          )}
        </div>
      </form>

      {/* Results */}
      {searched && (
        <div>
          {results.length === 0 ? (
            <div className="bg-[#1a1a1b] border border-gray-800 rounded-lg p-8 text-center">
              <p className="text-gray-500">No results found.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* User stats results */}
              {(type === 'most_posts' || type === 'least_posts') && (
                <div className="bg-[#1a1a1b] border border-gray-800 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="border-b border-gray-800">
                      <tr>
                        <th className="text-left p-4 text-gray-400">Rank</th>
                        <th className="text-left p-4 text-gray-400">Author</th>
                        <th className="text-left p-4 text-gray-400">Posts</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((r, i) => (
                        <tr key={i} className="border-b border-gray-800 last:border-0">
                          <td className="p-4 text-gray-500">#{i + 1}</td>
                          <td className="p-4 text-white">{r.author_name}</td>
                          <td className="p-4 text-purple-400">{r.post_count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Content results */}
              {(type === 'content' || type === 'author' || type === 'top_rated' || type === 'low_rated') && results.map((result, i) => (
                <div key={i} className="bg-[#1a1a1b] border border-gray-800 rounded-lg p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          result.type === 'post'
                            ? 'bg-purple-900 text-purple-300'
                            : 'bg-gray-800 text-gray-400'
                        }`}>
                          {result.type}
                        </span>
                        <span className="text-gray-600 text-xs">
                          in #{result.channel_name}
                        </span>
                        {result.score !== undefined && (
                          <span className="text-gray-600 text-xs">
                            · score: {result.score}
                          </span>
                        )}
                      </div>
                      {result.title && (
                        <div className="font-medium text-white mb-1">{result.title}</div>
                      )}
                      <div className="text-gray-400 text-sm line-clamp-2">{result.body}</div>
                      <div className="text-gray-600 text-xs mt-2">
                        by {result.author_name} · {new Date(result.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <Link
                      href={`/channels/${result.channel_id}/posts/${result.type === 'post' ? result.id : ''}`}
                      className="text-purple-400 hover:text-purple-300 text-xs shrink-0"
                    >
                      View
                    </Link>
                  </div>
                </div>
              ))}

              {/* Load more */}
              {hasMore && (
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="w-full bg-[#1a1a1b] border border-gray-800 hover:border-purple-500 text-gray-400 hover:text-white py-3 rounded-lg text-sm transition disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Load more'}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}