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

  // mask access token in PW report
  private async send(call: () => Promise<APIResponse>): Promise<APIResponse> {
    try {
      return await call();
    } catch (error) {
      if (this.token && error instanceof Error) {
        error.message = error.message.split(this.token).join('***');
        error.stack = error.stack?.split(this.token).join('***');
      }
      throw error;
    }
  }

  get(
    path: string,
    opts?: { params?: Record<string, string | number | boolean | undefined> },
  ): Promise<APIResponse> {
    return this.send(() =>
      this.request.get(path, {
        headers: this.headers,
        params: opts?.params as Record<string, string | number | boolean> | undefined,
      }),
    );
  }

  post(path: string, opts?: { data?: unknown }): Promise<APIResponse> {
    return this.send(() => this.request.post(path, { headers: this.headers, data: opts?.data }));
  }

  patch(path: string, opts?: { data?: unknown }): Promise<APIResponse> {
    return this.send(() => this.request.patch(path, { headers: this.headers, data: opts?.data }));
  }

  put(path: string, opts?: { data?: unknown }): Promise<APIResponse> {
    return this.send(() => this.request.put(path, { headers: this.headers, data: opts?.data }));
  }

  delete(path: string): Promise<APIResponse> {
    return this.send(() => this.request.delete(path, { headers: this.headers }));
  }
}
