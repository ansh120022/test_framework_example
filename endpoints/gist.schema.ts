import { z } from 'zod';

export const GistFileSchema = z.object({
  filename: z.string(),
  type: z.string(),
  language: z.string().nullable(),
  raw_url: z.url(),
  size: z.number().int(),
  truncated: z.boolean().optional(),
  patch: z.string().optional(),
  content: z.string().optional(),
});

export const GistOwnerSchema = z.object({
  login: z.string(),
  id: z.number().int(),
  node_id: z.string(),
  avatar_url: z.url(),
  gravatar_id: z.string().nullable(),
  html_url: z.url(),
  type: z.string(),
  site_admin: z.boolean(),
});

export const GistHistorySchema = z.object({
  user: GistOwnerSchema.optional(),
  version: z.string(),
  committed_at: z.iso.datetime(),
  change_status: z.object({
    total: z.number().int(),
    additions: z.number().int(),
    deletions: z.number().int(),
  }),
  url: z.url(),
});

export const GistSchema = z.object({
  url: z.url(),
  id: z.string(),
  node_id: z.string(),
  html_url: z.url(),
  git_pull_url: z.url(),
  git_push_url: z.url(),
  files: z.record(z.string(), GistFileSchema),
  public: z.boolean(),
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
  description: z.string().nullable(),
  comments: z.number().int(),
  comments_url: z.url(),
  owner: GistOwnerSchema.optional(),
  forks: z.array(z.unknown()).optional(),
  history: z.array(GistHistorySchema).optional(),
  truncated: z.boolean().optional(),
});

export type Gist = z.infer<typeof GistSchema>;
export type GistFile = z.infer<typeof GistFileSchema>;
export type GistOwner = z.infer<typeof GistOwnerSchema>;

class GistSchema {
    truncated!: boolean;

} 