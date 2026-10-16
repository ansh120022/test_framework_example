import { test as base, } from '@playwright/test';
import { HttpClient } from '../api-client/http-client';
import { GistsEndpoints } from '../endpoints/endpoints';
import type { Gist } from '../endpoints/gist.schema';


export class GistsSession extends GistsEndpoints {
  private trackedIds: string[] = [];

  async create(payload: unknown) {
    const response = await super.createGist(payload);
    if (response.ok()) {
      const body = (await response.json()) as Gist;
      if (body?.id) {
        this.trackedIds.push(body.id);
      }
    }
    return response;
  }

  async cleanup() {
    for (const id of this.trackedIds) {
      await super.deleteGist(id).catch(() => {});
    }
  }
}

type SessionFixtures = {
  session: GistsSession;
  anonymousSession: GistsSession;
  noGistsScopeSession: GistsSession
};

export const test = base.extend<SessionFixtures>({
  session: async ({ request }, use) => {
    const client = new HttpClient(request, process.env.GISTS_TOKEN, true);
    const session = new GistsSession(client);
    
    await use(session);

    await session.cleanup();
  },

  anonymousSession: async ({ request }, use) => {
    const client = new HttpClient(request, undefined, false);
    const session = new GistsSession(client);
    
    await use(session);
    await session.cleanup();
  },

  noGistsScopeSession: async ({ request }, use) => {
    const client = new HttpClient(request, process.env.NO_GISTS_ACCESS_TOKEN, true);
    const session = new GistsSession(client);

    await use(session);
    await session.cleanup();
  },
});

export { expect } from '@playwright/test';