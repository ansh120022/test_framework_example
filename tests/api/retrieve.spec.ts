import { test, expect } from "../../fixtures/fixture"
import type { APIResponse } from "@playwright/test"
import type { Gist } from "../../endpoints/gist.schema"
import { GistSchema } from "../../endpoints/gist.schema"
import { CreateGist } from "../../data/gists-builder"

test("retrieve a gist with multiple files and validate all fields", async ({ session }) => {
  const payload = {
    description: "test gist - retrieve full details",
    files: {
      "a.txt": { content: "I'm the first file in the retrieved gist" },
      "b.txt": { content: "I'm the second file in the retrieved gist" },
    },
  }

  let createdGist: Gist
  let fetchedGist: Gist
  let getResponse: APIResponse

  await test.step("Create a public gist with multiple files", async () => {
    const { response, body } = await CreateGist()
      .withDescription(payload.description)
      .withMultipleFiles(payload.files)
      .public()
      .create(session)

    expect(response.status()).toBe(201)
    createdGist = GistSchema.parse(body)
  })

  await test.step("Retrieve the created gist and validate via Zod schema", async () => {
    let rawBody: unknown;
    ({ response: getResponse, body: rawBody } = await session.getGist(createdGist.id))
    expect(getResponse.status()).toBe(200)

    fetchedGist = GistSchema.parse(rawBody)

    await test.step("Verify specific payload and business logic data", () => {
      expect(fetchedGist.id).toBe(createdGist.id)
      expect(fetchedGist.description).toBe(payload.description)
      expect(fetchedGist.public).toBe(true)
      expect(fetchedGist.comments).toBe(0)
    })

    await test.step("Verify the gist has recent create date", () => {
      const createdAtTime = new Date(fetchedGist.created_at).getTime()
      expect(Date.now() - createdAtTime).toBeLessThan(60_000)
    })

    await test.step("Verify specific files content and size", () => {
      expect(Object.keys(fetchedGist.files).sort()).toEqual(Object.keys(payload.files).sort())

      for (const [filename, expectedFile] of Object.entries(payload.files)) {
        const file = fetchedGist.files[filename]
        expect(file.content).toBe(expectedFile.content)
        expect(file.size).toBeGreaterThan(0)
      }
    })
  })
})