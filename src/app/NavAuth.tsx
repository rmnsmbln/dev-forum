'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface User {
  id: number;
  displayName: string;
  email: string;
  role: string;
}

export default function NavAuth({ user }: { user: User | null }) {
  const router = useRouter();

  async function handleSignOut() {
    await fetch('/api/auth/signout', { method: 'POST' });
    router.push('/');
    router.refresh();
  }

  if (!user) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/auth/signin"
          className="text-gray-400 hover:text-white text-sm transition"
        >
          Sign in
        </Link>
        <Link
          href="/auth/signup"
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-1.5 rounded-full text-sm font-medium transition"
        >
          Sign up
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-gray-400 text-sm">
        Hey, <span className="text-purple-400 font-medium">{user.displayName}</span>
      </span>
      {user.role === 'admin' && (
        <Link
          href="/admin"
          className="text-gray-400 hover:text-white text-sm transition"
        >
          Dashboard
        </Link>
      )}
      <button
        onClick={handleSignOut}
        className="text-gray-400 hover:text-white text-sm transition"
      >
        Sign out
      </button>
    </div>
  );
}