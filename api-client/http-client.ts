import type { APIRequestContext, APIResponse } from '@playwright/test';

export class HttpClient {
  constructor(
    private readonly request: APIRequestContext,
    private readonly token?: string,
    private readonly authorized = true,
  ) {}

  private get headers(): Record<string, string> {
    return this.authorized && this.token ? { Authorization: `Bearer ${this.token}` } : {};
  }

  get(
    path: string,
    opts?: { params?: Record<string, string | number | boolean | undefined> },
  ): Promise<APIResponse> {
    return this.request.get(path, {
      headers: this.headers,
      params: opts?.params as Record<string, string | number | boolean> | undefined,
    });
  }

  post(path: string, opts?: { data?: unknown }): Promise<APIResponse> {
    return this.request.post(path, { headers: this.headers, data: opts?.data });
  }

  patch(path: string, opts?: { data?: unknown }): Promise<APIResponse> {
    return this.request.patch(path, { headers: this.headers, data: opts?.data });
  }

  put(path: string, opts?: { data?: unknown }): Promise<APIResponse> {
    return this.request.put(path, { headers: this.headers, data: opts?.data });
  }

  delete(path: string): Promise<APIResponse> {
    return this.request.delete(path, { headers: this.headers });
  }
}
