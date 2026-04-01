import type { Metadata } from "next";
import "./globals.css";
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";
import NavAuth from "./NavAuth";

export const metadata: Metadata = {
  title: "dev-forum",
  description: "A place to ask and answer programming questions",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  const user = session.user || null;

  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0f0f0f] text-gray-200">
        <nav className="bg-[#1a1a1b] border-b border-gray-800 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
          <a href="/" className="text-purple-400 font-bold text-xl tracking-tight">
            dev-forum
          </a>
          <NavAuth user={user} />
        </nav>
        <div className="max-w-5xl mx-auto px-4 py-6 flex gap-6">
          <main className="flex-1 min-w-0">
            {children}
          </main>
          <aside className="w-72 shrink-0 hidden md:block">
            <div className="bg-[#1a1a1b] border border-gray-800 rounded-lg p-4">
              <h2 className="text-white font-bold mb-2">About dev-forum</h2>
              <p className="text-gray-400 text-sm">
                A channel-based Q&A forum for programmers. Ask questions, share knowledge, and learn together.
              </p>
              <hr className="border-gray-800 my-4" />
              {user ? (
                <a href="/channels/new" className="block w-full text-center bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full text-sm font-medium transition">
                  New Channel
                </a>
              ) : (
                <a href="/auth/signin" className="block w-full text-center bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full text-sm font-medium transition">
                  Sign in to post
                </a>
              )}
            </div>
          </aside>
        </div>
      </body>
    </html>
  );
}
