#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

/**
 * OneMira AI — Official MCP Server for the OneMira C1 AI Voice Recorder
 * Product & Documentation: https://onemira.com/products/c1
 *
 * Bridges local OneMira Desktop OKF Markdown (.md) vaults (sessions/, wiki/people/,
 * wiki/topics/, tasks.md) and the local `mira` CLI into MCP-compatible AI agents
 * (Claude Desktop, Claude Code, Cursor, Windsurf).
 */
const DEFAULT_VAULT = process.env.ONEMIRA_VAULT_PATH || path.join(os.homedir(), 'OneMira');

function runMiraCli(args: string[]): string {
  try {
    return execFileSync('mira', [...args, '--json'], { encoding: 'utf8', timeout: 15000 });
  } catch {
    return '';
  }
}

function listMarkdownFiles(dirPath: string): string[] {
  if (!fs.existsSync(dirPath)) return [];
  const results: string[] = [];
  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const full = path.join(dirPath, entry.name);
    if (entry.isDirectory()) results.push(...listMarkdownFiles(full));
    else if (entry.isFile() && entry.name.endsWith('.md')) results.push(full);
  }
  return results;
}

const server = new McpServer({
  name: 'onemira-mcp',
  version: '1.2.1',
});

server.tool(
  'mira_search',
  'Search across all local OneMira C1 meeting summaries, decisions, action items, and OKF Markdown Wiki pages by keyword, topic, or speaker name. Use this for cross-vault discovery when you do not yet know the specific session_id or wiki slug.',
  {
    query: z
      .string()
      .min(1)
      .describe('Keyword, speaker name, project topic, or decision phrase to search across the entire local OneMira vault.'),
    limit: z
      .number()
      .int()
      .min(1)
      .max(50)
      .default(10)
      .describe('Maximum number of matching snippets to return (1–50, default 10).'),
  },
  {
    title: 'Search Meetings & OKF Wiki',
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  async ({ query, limit }) => {
    const cliOut = runMiraCli(['search', query, '--limit', String(limit)]);
    if (cliOut) {
      return { content: [{ type: 'text', text: cliOut }] };
    }
    const files = listMarkdownFiles(DEFAULT_VAULT);
    const q = query.toLowerCase();
    const hits = files
      .map((file) => {
        const text = fs.readFileSync(file, 'utf8');
        const idx = text.toLowerCase().indexOf(q);
        if (idx === -1) return null;
        const snippet = text.slice(Math.max(0, idx - 120), Math.min(text.length, idx + 280));
        return { file: path.relative(DEFAULT_VAULT, file), snippet };
      })
      .filter(Boolean)
      .slice(0, limit);
    return {
      content: [{ type: 'text', text: JSON.stringify({ vault: DEFAULT_VAULT, query, hits }, null, 2) }],
    };
  },
);

server.tool(
  'mira_sessions',
  'List recent OneMira C1 recorded meeting sessions, check any currently active live recording session, or inspect summary metadata for a single session_id.',
  {
    action: z
      .enum(['list', 'show', 'active'])
      .default('list')
      .describe('Operation mode: "list" recent recorded sessions, "active" for an in-progress live recording, or "show" metadata for one session_id.'),
    session_id: z
      .string()
      .optional()
      .describe('Target session identifier (required when action is "show", e.g. "2026-11-10-product-sync").'),
    limit: z
      .number()
      .int()
      .min(1)
      .max(50)
      .default(15)
      .describe('Maximum number of sessions to list when action is "list" (1–50, default 15).'),
  },
  {
    title: 'List or Inspect Recording Sessions',
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  async ({ action, session_id, limit }) => {
    if (action === 'show' && !session_id) {
      return {
        isError: true,
        content: [{ type: 'text', text: 'Parameter "session_id" is required when action is "show".' }],
      };
    }
    const args = ['sessions', action];
    if (session_id) args.push(session_id);
    args.push('--limit', String(limit));
    const cliOut = runMiraCli(args);
    if (cliOut) return { content: [{ type: 'text', text: cliOut }] };
    const sessionsDir = path.join(DEFAULT_VAULT, 'sessions');
    const files = listMarkdownFiles(sessionsDir)
      .slice(0, limit)
      .map((f) => path.relative(DEFAULT_VAULT, f));
    return { content: [{ type: 'text', text: JSON.stringify({ action, sessions: files }, null, 2) }] };
  },
);

server.tool(
  'mira_segments',
  'Read verbatim timestamped, speaker-diarized (Speaker ID) transcript segments from one known OneMira C1 recording session. Prefer mira_search first if you need to find which session_id discussed a topic.',
  {
    session_id: z
      .string()
      .min(1)
      .describe('Session ID or relative Markdown filename under sessions/ (e.g. "2026-11-10-client-call").'),
    speaker: z
      .string()
      .optional()
      .describe('Optional speaker name or Speaker ID label to filter utterances within this session.'),
  },
  {
    title: 'Read Speaker-Attributed Transcript Segments',
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  async ({ session_id, speaker }) => {
    const args = ['segments', session_id];
    if (speaker) args.push('--speaker', speaker);
    const cliOut = runMiraCli(args);
    if (cliOut) return { content: [{ type: 'text', text: cliOut }] };
    const candidate = path.join(
      DEFAULT_VAULT,
      'sessions',
      session_id.endsWith('.md') ? session_id : `${session_id}.md`,
    );
    const body = fs.existsSync(candidate)
      ? fs.readFileSync(candidate, 'utf8')
      : 'Session not found in local vault.';
    return { content: [{ type: 'text', text: body }] };
  },
);

server.tool(
  'mira_wiki_list',
  'Enumerate structured OKF Markdown Wiki pages (topics, project notes, speaker profiles, and tasks.md) stored in the local OneMira vault without requiring a search query.',
  {
    folder: z
      .enum(['all', 'wiki', 'wiki/topics', 'wiki/people'])
      .default('all')
      .describe('Vault scope to enumerate: "all", "wiki", "wiki/topics", or "wiki/people".'),
    limit: z
      .number()
      .int()
      .min(1)
      .max(200)
      .default(50)
      .describe('Maximum number of Wiki page slugs to return (1–200, default 50).'),
  },
  {
    title: 'List OKF Markdown Wiki Pages',
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  async ({ folder, limit }) => {
    const cliOut = runMiraCli(['wiki', 'list', '--limit', String(limit)]);
    if (cliOut && folder === 'all') return { content: [{ type: 'text', text: cliOut }] };
    const targetDir = folder === 'all' ? DEFAULT_VAULT : path.join(DEFAULT_VAULT, folder);
    const pages = listMarkdownFiles(targetDir)
      .map((f) => path.relative(DEFAULT_VAULT, f))
      .filter((rel) => folder !== 'all' || !rel.startsWith(`sessions${path.sep}`))
      .slice(0, limit);
    return {
      content: [{ type: 'text', text: JSON.stringify({ vault: DEFAULT_VAULT, folder, pages }, null, 2) }],
    };
  },
);

server.tool(
  'mira_wiki_read',
  'Read the full Markdown body, YAML frontmatter, and relational backlinks of a specific OKF Wiki page (person profile, project topic, or tasks.md) maintained by OneMira Desktop.',
  {
    slug: z
      .string()
      .min(1)
      .describe('Relative Markdown path or Wiki slug inside the OneMira vault, e.g. "wiki/people/alex.md", "wiki/topics/roadmap.md", or "tasks.md".'),
  },
  {
    title: 'Read OKF Markdown Wiki Page',
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  async ({ slug }) => {
    const cliOut = runMiraCli(['wiki', 'read', slug]);
    if (cliOut) return { content: [{ type: 'text', text: cliOut }] };
    const target = path.resolve(DEFAULT_VAULT, slug.endsWith('.md') ? slug : `${slug}.md`);
    if (!target.startsWith(path.resolve(DEFAULT_VAULT))) {
      return { isError: true, content: [{ type: 'text', text: 'Path must stay inside ONEMIRA_VAULT_PATH.' }] };
    }
    const text = fs.existsSync(target) ? fs.readFileSync(target, 'utf8') : 'Wiki entry not found.';
    return { content: [{ type: 'text', text }] };
  },
);

server.tool(
  'mira_wiki_update',
  'Create or update an OKF Markdown Wiki page (meeting decisions, action items, topic note, or speaker profile) inside the local OneMira vault.',
  {
    slug: z
      .string()
      .min(1)
      .describe('Target relative Markdown path inside ONEMIRA_VAULT_PATH, e.g. "wiki/topics/q4-plan.md" or "tasks.md".'),
    content: z
      .string()
      .min(1)
      .describe('Complete Markdown document content, including optional Google Native OKF YAML frontmatter and deterministic Markdown links.'),
  },
  {
    title: 'Create or Update OKF Wiki Page',
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  async ({ slug, content }) => {
    const target = path.resolve(DEFAULT_VAULT, slug.endsWith('.md') ? slug : `${slug}.md`);
    if (!target.startsWith(path.resolve(DEFAULT_VAULT))) {
      throw new Error('Path must stay inside ONEMIRA_VAULT_PATH');
    }
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, content, 'utf8');
    return { content: [{ type: 'text', text: JSON.stringify({ updated: path.relative(DEFAULT_VAULT, target) }, null, 2) }] };
  },
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error('onemira-mcp fatal error:', err);
  process.exit(1);
});
