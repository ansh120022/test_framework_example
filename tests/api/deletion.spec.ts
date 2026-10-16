import { test, expect } from '../../fixtures/fixture';
import type { Gist } from '../../endpoints/gist.schema';
import { CreateGist } from '../../data/gists-builder';

test('delete a gist and verify it can no longer be retrieved', async ({ session }) => {
  const description = 'test gist - to be deleted';
  const filename = 'delete-me.txt';

  let createdGist: Gist;

  await test.step('Create a gist', async () => {
    const { response, body } = await CreateGist()
      .withDescription(description)
      .withOneFile(filename, 'this gist is created only to be deleted')
      .public()
      .create(session);

    expect(response.status()).toBe(201);
    createdGist = body;
  });

  await test.step('Delete the gist', async () => {
    const response = await session.deleteGist(createdGist.id);
    expect(response.status()).toBe(204);
  });

  await test.step('Verify the gist can no longer be retrieved', async () => {
    const { response } = await session.getGist(createdGist.id);
    expect(response.status()).toBe(404);
  });
});
