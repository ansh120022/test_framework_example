import { test, expect } from '../../fixtures/fixture';
import type { APIResponse } from '@playwright/test';
import type { Gist } from '../../endpoints/gist.schema';
import { CreateGist } from '../../data/gists-builder';

test('previous revision preserves files renamed, deleted and edited in one update', async ({ session }) => {
  const originalFiles = {
    'a.txt': { content: 'file a - original' },
    'b.txt': { content: 'file b - original' },
    'c.txt': { content: 'file c - original' },
  };
  const renamedFilename = 'a-renamed.txt';
  const updatedContent = 'file c - updated';

  let createdGist: Gist;

  await test.step('Create a gist with three files', async () => {
    const { response, body } = await CreateGist()
      .withDescription('revisions test - undo a bad edit')
      .withMultipleFiles(originalFiles)
      .create(session);

    expect(response.status()).toBe(201);
    createdGist = body;
  });

  await test.step('Verify the new gist has a single revision', () => {
    expect(createdGist.history).toHaveLength(1);
  });

  const originalVersion = createdGist!.history![0].version;

  await test.step('Rename, delete and edit files in a single update', async () => {
    const response = await session.updateGist(createdGist.id, {
      files: {
        'a.txt': { filename: renamedFilename },
        'b.txt': null,
        'c.txt': { content: updatedContent },
      },
    });

    expect(response.status()).toBe(200);
  });

  let getResponse: APIResponse;
  let updatedGist: Gist;

  await test.step('Retrieve the updated gist', async () => {
    ({ response: getResponse, body: updatedGist } = await session.getGist(createdGist.id));
  });

  await test.step('Verify the gist reflects the update', () => {
    expect(getResponse.status()).toBe(200);
    expect(Object.keys(updatedGist.files).sort()).toEqual([renamedFilename, 'c.txt']);
    expect(updatedGist.files[renamedFilename].content).toBe(originalFiles['a.txt'].content);
    expect(updatedGist.files['c.txt'].content).toBe(updatedContent);
  });

  await test.step('Verify the history has two revisions, newest first', () => {
    expect(updatedGist.history).toHaveLength(2);
    expect(updatedGist.history![0].version).not.toBe(originalVersion);
    expect(updatedGist.history![1].version).toBe(originalVersion);
  });

  let revisionResponse: APIResponse;
  let previousRevision: Gist;

  await test.step('Retrieve the previous revision', async () => {
    ({ response: revisionResponse, body: previousRevision } = await session.getGistRevision(
      createdGist.id,
      originalVersion,
    ));
  });

  await test.step('Verify the previous revision holds the original files', () => {
    expect(revisionResponse.status()).toBe(200);
    expect(Object.keys(previousRevision.files).sort()).toEqual(Object.keys(originalFiles).sort());
    for (const [filename, { content }] of Object.entries(originalFiles)) {
      expect(previousRevision.files[filename].content).toBe(content);
    }
  });
});
