import { test, expect } from '../../fixtures/fixture';
import type { APIResponse } from '@playwright/test';
import type { Gist } from '../../endpoints/gist.schema';
import { CreateGist } from '../../data/gists-builder';

test('update public gist', async ({ session }) => {
  const description = 'test gist - single file';
  const filename = 'initial_hello.txt';
  const content = 'INITIAL Hello, world!';

  let response: APIResponse;
  let gistData: Gist;
  let gistID

  await test.step('Prepare data: create a public gist with a single file', async () => {
    ({ response, body: gistData } = await CreateGist()
      .withDescription(description)
      .withOneFile(filename, content)
      .public()
      .create(session));
      expect(response.status()).toBe(201);

      gistID = gistData.id
  });

  let getResponse: APIResponse;
  let createdGist: Gist;


  await test.step('Update filename and file content', async () => {

    const newFilename = 'new2809_hello.txt';
    const newContent = 'New2809 Hello, world!';
    let response: Gist

    const updatedPayload = {
      files: {
        newFilename: {
          content: newContent
        }
      },
    }
    response = await session.updateGist(gistID, updatedPayload)

  });
});