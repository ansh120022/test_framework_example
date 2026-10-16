import { test, expect } from '../../fixtures/fixture';
import type { APIResponse } from '@playwright/test';
import type { Gist } from '../../endpoints/gist.schema';
import { CreateGist } from '../../data/gists-builder';

test('create public gist', async ({ session }) => {
  const description = 'test gist - single file';
  const filename = 'hello.txt';
  const content = 'Hello, world!';

  let response: APIResponse;
  let gistData: Gist;

  await test.step('Create a public gist with a single file', async () => {
    ({ response, body: gistData } = await CreateGist()
      .withDescription(description)
      .withOneFile(filename, content)
      .public()
      .create(session));
  });

  await test.step('Verify the create response', () => {
    expect(response.status()).toBe(201);
    expect(gistData.public).toBe(true);
    expect(gistData.description).toBe(description);
    expect(gistData.files).toHaveProperty([filename]);
    expect(gistData.files[filename].content).toBe(content);
  });

  let getResponse: APIResponse;
  let createdGist: Gist;

  await test.step('Retrieve the created gist', async () => {
    ({ response: getResponse, body: createdGist } = await session.getGist(gistData.id));
  });

  await test.step('Verify the retrieved gist matches what was created', () => {
    expect(getResponse.status()).toBe(200);
    expect(createdGist.public).toBe(true);
    expect(createdGist.description).toBe(description);
    expect(createdGist.files[filename].content).toBe(content);
  });
});

test('secret gist creation', async ({ session }) => {
  const description = 'test gist - secret';
  const filename = 'secret.txt';
  const content = 'this is secret';

  let response: APIResponse;
  let body: Gist;

  await test.step('Create a secret gist', async () => {
    ({ response, body } = await CreateGist()
      .withDescription(description)
      .withOneFile(filename, content)
      .secret()
      .create(session));
  });

  await test.step('Verify the create response', () => {
    expect(response.status()).toBe(201);
    expect(body.public).toBe(false);
  });

  let getResponse: APIResponse;
  let fetched: Gist;

  await test.step('Retrieve the created gist', async () => {
    ({ response: getResponse, body: fetched } = await session.getGist(body.id));
  });

  await test.step('Verify the retrieved gist matches what was created', () => {
    expect(getResponse.status()).toBe(200);
    expect(fetched.public).toBe(false);
    expect(fetched.description).toBe(description);
    expect(fetched.files[filename].content).toBe(content);
  });
});

test('gist created as secret if not specified as public', async ({ session }) => {
  const description = 'test gist - default visibility';
  const filename = 'default.txt';
  const content = 'no visibility specified, expected to be secret';

  let response: APIResponse;
  let body: Gist;

  await test.step('Create a gist without specifying visibility', async () => {
    ({ response, body } = await CreateGist()
      .withDescription(description)
      .withOneFile(filename, content)
      .create(session));
  });

  await test.step('Verify the gist defaulted to secret', () => {
    expect(response.status()).toBe(201);
    expect(body.public).toBe(false);
  });

  let getResponse: APIResponse;
  let fetched: Gist;

  await test.step('Retrieve the created gist', async () => {
    ({ response: getResponse, body: fetched } = await session.getGist(body.id));
  });

  await test.step('Verify the retrieved gist matches what was created', () => {
    expect(getResponse.status()).toBe(200);
    expect(fetched.public).toBe(false);
    expect(fetched.description).toBe(description);
    expect(fetched.files[filename].content).toBe(content);
  });
});

test('create gist with multiple files', async ({ session }) => {
  const description = 'test gist - multiple files';
  const fileA = 'a.txt';
  const fileB = 'b.txt';
  const fileAContent = "I'm the first file in multiple-files gist";
  const fileBContent = "I'm the second file in multiple-files gist";

  let response: APIResponse;
  let body: Gist;

  await test.step('Create a gist with multiple files', async () => {
    ({ response, body } = await CreateGist()
      .withDescription(description)
      .withMultipleFiles({
        [fileA]: { content: fileAContent },
        [fileB]: { content: fileBContent },
      })
      .create(session));
  });

  await test.step('Verify the create response', () => {
    expect(response.status()).toBe(201);
    expect(Object.keys(body.files).sort()).toEqual([fileA, fileB]);
  });

  let getResponse: APIResponse;
  let fetched: Gist;

  await test.step('Retrieve the created gist', async () => {
    ({ response: getResponse, body: fetched } = await session.getGist(body.id));
  });

  await test.step('Verify the retrieved gist matches what was created', () => {
    expect(getResponse.status()).toBe(200);
    expect(Object.keys(fetched.files).sort()).toEqual([fileA, fileB]);
    expect(fetched.files[fileA].content).toBe(fileAContent);
    expect(fetched.files[fileB].content).toBe(fileBContent);
  });
  
});