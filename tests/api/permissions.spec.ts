import { test, expect } from '../../fixtures/fixture';
import type { APIResponse } from '@playwright/test';
import type { Gist } from '../../endpoints/gist.schema';
import { CreateGist } from '../../data/gists-builder';

test('unauthorized request returns only public gists', async ({ session, anonymousSession }) => {
let publicGist: Gist;
let secretGist: Gist;

await test.step('Create a public and a secret gist', async () => {
    ({ body: publicGist } = await CreateGist()
    .withDescription('permissions test - public')
    .public()
    .create(session));

    ({ body: secretGist } = await CreateGist()
    .withDescription('permissions test - secret')
    .secret()
    .create(session));
});

let response: APIResponse;
let list: Gist[];

await test.step("List the owner's gists without authentication", async () => {
    const username = publicGist.owner?.login;

    response = await anonymousSession.listGistsOfUsername(username!);
    list = await response.json();
});

await test.step('Verify only the public gist is visible', () => {
    expect(response.status()).toBe(200);
    const ids = list.map((gist) => gist.id);
    expect(ids).toContain(publicGist.id);
    expect(ids).not.toContain(secretGist.id);
});
});

test('secret gist is retrievable by ID without authentication', async ({ session, anonymousSession }) => {
let secretGist: Gist;

await test.step('Create a secret gist', async () => {
    ({ body: secretGist } = await CreateGist()
    .withDescription('permissions test - secret retrievable without auth')
    .secret()
    .create(session));
});

let response: APIResponse;
let fetched: Gist;

await test.step('Retrieve the secret gist without authentication', async () => {
    ({ response, body: fetched } = await anonymousSession.getGist(secretGist.id));
});

await test.step('Verify the secret gist is returned', () => {
    expect(response.status()).toBe(200);
    expect(fetched.id).toBe(secretGist.id);
    expect(fetched.public).toBe(false);
});
});

test('rejects creation without authentication', async ({ anonymousSession }) => {
const response = await test.step('Attempt to create a gist without authentication', () =>
    anonymousSession.createGist(CreateGist().withDescription('should not be created').build()),
);

await test.step('Verify the request was rejected', async () => {
    const body = await response.json();
    expect(response.status()).toBe(401);
    expect(body.message).toBe('Requires authentication');
});
});

test('rejects creation with a token lacking the gist scope', async ({ noGistsScopeSession }) => {
const response = await test.step('Attempt to create a gist with a token without the gist scope', () =>
    noGistsScopeSession.createGist(CreateGist().withDescription('should not be created').build()),
);


await test.step('Verify the request was rejected', async () => {
    const body = await response.json();
    expect(response.status()).toBe(404);
    expect(body.message).toBe('Not Found');
});
});
