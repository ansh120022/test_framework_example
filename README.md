# GitHub Gist Test Automation

This project demonstrates my understanding of a reliable test framework for a web application, with each piece of functionality covered at the appropriate level.

It isn't meant to provide complete coverage, the focus is on the structure.

## Structure

```
api-client/http-client.ts    wrapper around Playwright's request context, adds the auth header
endpoints/endpoints.ts       one method per Gists API endpoint
endpoints/gist.schema.ts     Zod schemas for API responses + types inferred from them
fixtures/fixture.ts          sessions for different users, with cleanup
data/gists-builder.ts        builder for gist test data
pages/gist-page.ts           page object for the gist page
tests/api/                   create, retrieve, update, delete, revisions, permissions
tests/ui/                    gist page and revision count
```

The structure is built so that whoever writes a new test can focus only on the functionality under test, not on framework details like test data cleanup or authentication.

## Authentication

There is a set of ready-made fixtures for testing permissions. Pass one as a parameter to a test to make requests as that specific user:

- `session`: a user with gist access (`GISTS_TOKEN`)
- `anonymousSession`: no token at all
- `noGistsScopeSession`: a valid token without gist permission (`NO_GISTS_ACCESS_TOKEN`)

Security considered: the token values, which are sent as HTTP headers, are masked in job logs and reports.

## Fixtures and cleanup

Gists created through `session.create()` or the builder are tracked and automatically removed.

## Test data builder

Writing the gist JSON by hand in every test would be repetitive, so there's a small builder that accepts arguments and returns a payload:

```ts
await CreateGist()
  .withDescription('two files')
  .withMultipleFiles({ 'a.txt': { content: 'a' }, 'b.txt': { content: 'b' } })
  .public()
  .create(session);
```

## Page objects

UI selectors and reusable page interaction methods live in `GistPage`.

## Running locally

```bash
npm install
npx playwright install chromium
```

Add a `.env` file:

```
GISTS_TOKEN=...              # token with gist access
NO_GISTS_ACCESS_TOKEN=...    # optional, fine-grained token without the Gists permission, for the permission tests
```

Then:

```bash
npm test            # run everything
npm run test:api
npm run test:ui
npm run report      # see report
```

## CI

The tests are started on Pull Request. 
The report of the latest run is published here: https://ansh120022.github.io/test_framework_example/