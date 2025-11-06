import { Context } from 'hono';

declare module 'hono' {
  interface Context {
    get(key: 'userId'): number;
    get(key: 'user'): { id: number; email: string };
    set(key: 'userId', value: number): void;
    set(key: 'user', value: { id: number; email: string }): void;
  }
}

