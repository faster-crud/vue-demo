import type { ResourceMeta } from '@faster-crud/core';

/**
 * Fetch all ResourceMeta from a running @faster-crud/nest server.
 * Reads from GET /__crud/meta (auto-registered by NestCrudModule).
 *
 * @example
 * const meta = await fetchCrudMeta('http://localhost:3000');
 * const UserCrud = defineCrud({ meta: meta.users, api: userApi });
 */
export async function fetchCrudMeta(baseUrl: string): Promise<Record<string, ResourceMeta>> {
  const url = baseUrl.replace(/\/$/, '') + '/__crud/meta';
  const res = await fetch(url);
  if (!res.ok) throw new Error(`fetchCrudMeta: ${res.status} ${res.statusText} from ${url}`);
  return res.json();
}
