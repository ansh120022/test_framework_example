import type { APIResponse } from '@playwright/test';
import type { HttpClient } from '../api-client/http-client';
import { GistSchema, type Gist } from './gist.schema';

export class GistsEndpoints {
  constructor(private readonly client: HttpClient) {}

  createGist(payload: unknown): Promise<APIResponse> {
    return this.client.post('/gists', { data: payload });
  }

  async getGist(gistId: string): Promise<{ response: APIResponse; body?: Gist }> {
    const response = await this.client.get(`/gists/${gistId}`);
    const body = response.ok() ? GistSchema.parse(await response.json()) : undefined;
    return { response, body };
  }

  async getGistRevision(gistId: string, sha: string): Promise<{ response: APIResponse; body?: Gist }> {
    const response = await this.client.get(`/gists/${gistId}/${sha}`);
    const body = response.ok() ? GistSchema.parse(await response.json()) : undefined;
    return { response, body };
  }

  updateGist(gistId: string, payload: unknown): Promise<APIResponse> {
    return this.client.patch(`/gists/${gistId}`, { data: payload });
  }

  listGistsOfUsername(username: string): Promise<APIResponse> {
    return this.client.get(`/users/${username}/gists`);
  }

  deleteGist(gistId: string): Promise<APIResponse> {
    return this.client.delete(`/gists/${gistId}`);
  }
}
