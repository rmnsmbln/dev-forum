'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface VoteButtonProps {
  targetType: 'post' | 'reply';
  targetId: number;
  initialScore: number;
  userVote?: number;
  isLoggedIn: boolean;
}

export default function VoteButton({
  targetType,
  targetId,
  initialScore,
  userVote = 0,
  isLoggedIn,
}: VoteButtonProps) {
  const router = useRouter();
  const [score, setScore] = useState(initialScore);
  const [currentVote, setCurrentVote] = useState(userVote);
  const [loading, setLoading] = useState(false);

  async function handleVote(value: 1 | -1) {
    if (!isLoggedIn) {
      router.push('/auth/signin');
      return;
    }

    setLoading(true);
    const res = await fetch('/api/votes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetType, targetId, value }),
    });

    const data = await res.json();

    if (res.ok) {
      if (data.action === 'removed') {
        setScore(score - currentVote);
        setCurrentVote(0);
      } else if (data.action === 'updated') {
        setScore(score - currentVote + value);
        setCurrentVote(value);
      } else {
        setScore(score + value);
        setCurrentVote(value);
      }
    }
    setLoading(false);
  }

  return (
    <div className="flex flex-col items-center bg-[#0f0f0f] rounded px-3 py-2 min-w-[48px]">
      <button
        onClick={() => handleVote(1)}
        disabled={loading}
        className={`text-lg transition ${
          currentVote === 1
            ? 'text-purple-400'
            : 'text-gray-600 hover:text-purple-400'
        }`}
      >
        ▲
      </button>
      <span className={`text-sm font-medium my-1 ${
        score > 0 ? 'text-purple-400' : score < 0 ? 'text-red-400' : 'text-gray-400'
      }`}>
        {score}
      </span>
      <button
        onClick={() => handleVote(-1)}
        disabled={loading}
        className={`text-lg transition ${
          currentVote === -1
            ? 'text-red-400'
            : 'text-gray-600 hover:text-red-400'
        }`}
      >
        ▼
      </button>
    </div>
  );
}