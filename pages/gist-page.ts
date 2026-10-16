import type { Page, Locator } from '@playwright/test';

export class GistPage {
  readonly description: Locator;
  readonly fileNames: Locator;
  readonly fileLines: Locator;
  readonly revisionsCount: Locator;

  constructor(private readonly page: Page) {
    this.description = page.locator('[itemprop="about"]');
    this.fileNames = page.locator('.file-header .gist-blob-name');
    this.fileLines = page.locator('table.js-file-line-container');
    this.revisionsCount = page.locator('a[href$="/revisions"] .Counter');
  }

  async openGist(gistUrl: string) {
    await this.page.goto(gistUrl);
  }

  async reload() {
    await this.page.reload();
  }
}
