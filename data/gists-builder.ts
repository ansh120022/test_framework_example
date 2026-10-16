import type { APIResponse } from '@playwright/test';
import type { Gist } from '../endpoints/gist.schema';
import type { GistsSession } from '../fixtures/fixture';

type GistFiles = Record<string, { content: string; filename?: string }>;

const DEFAULT_FILES: GistFiles = { 'file.txt': { content: 'test content' } };

export class GistBuilder {
  private description = 'test gist';
  private files: GistFiles | undefined;
  private visibility: boolean | undefined;

  withDescription(description: string): this {
    this.description = description;
    return this;
  }

  withOneFile(filename: string, content: string): this {
    this.files = { ...(this.files ?? {}), [filename]: { content } };
    return this;
  }

  withMultipleFiles(files: GistFiles): this {
    this.files = files;
    return this;
  }

  public(): this {
    this.visibility = true;
    return this;
  }

  secret(): this {
    this.visibility = false;
    return this;
  }

  build() {
    return {
      description: this.description,
      files: this.files ?? { ...DEFAULT_FILES },
      ...(this.visibility !== undefined ? { public: this.visibility } : {}),
    };
  }

  async create(session: GistsSession): Promise<{ response: APIResponse; body: Gist }> {
    const response = await session.create(this.build());
    const body = await response.json();
    return { response, body };
  }
}

export function CreateGist(): GistBuilder {
  return new GistBuilder();
}