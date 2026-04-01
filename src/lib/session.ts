import { SessionOptions } from 'iron-session';

export interface SessionData {
  user?: {
    id: number;
    displayName: string;
    email: string;
    role: string;
  };
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET || 'complex-password-at-least-32-characters-long!!',
  cookieName: 'devforum-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
  },
};