import { test, expect } from '../../fixtures/fixture';
import type { Gist } from '../../endpoints/gist.schema';
import { CreateGist } from '../../data/gists-builder';
import { GistPage } from '../../pages/gist-page';

test('open public gist with direct URL', async ({ session, page }) => {
  const gistPage = new GistPage(page);
  const description = 'open existing gist on UI';
  const filename = 'ui-test.txt';
  const content = '1st revision';
  const updatedContent = '2nd revision';

  let createdGist: Gist;

  await test.step('Prepare data: create a public with API', async () => {
    const { response, body } = await CreateGist()
      .withDescription(description)
      .withOneFile(filename, content)
      .public()
      .create(session);

    expect(response.status()).toBe(201);
    createdGist = body;
  });

  await test.step('Open the gist page', async () => {
    await gistPage.openGist(createdGist.html_url);
  });

  await test.step('Verify the gist appears on UI', async () => {
    await expect.soft(gistPage.description).toHaveText(description);
    await expect(gistPage.fileNames).toHaveText([filename]);
    await expect(gistPage.fileLines).toContainText(content);
  });

  await test.step('Update the gist file content with API', async () => {
    const response = await session.updateGist(createdGist.id, {
      files: { [filename]: { content: updatedContent } },
    });

    expect(response.status()).toBe(200);
  });

  await test.step('Verify the update produced a second revision', async () => {
    await expect(async () => {
      await gistPage.reload();
      await expect(gistPage.fileLines).toContainText(updatedContent);
      await expect(gistPage.revisionsCount).toHaveText('2');
    }).toPass({ timeout: 30_000 });
  });
});
