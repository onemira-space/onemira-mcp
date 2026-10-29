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
  version: '1.2.0',
});

server.tool(
  'mira_search',
  'Search local OneMira C1 meeting transcripts, 99-language speaker-labeled segments, and OKF Markdown Wiki notes.',
  {
    query: z.string().describe('Keywords, speaker name, decision, or topic to search across meetings and Wiki'),
    limit: z.number().int().min(1).max(50).default(10).describe('Maximum results to return'),
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
  }
);

server.tool(
  'mira_sessions',
  'List or inspect recent OneMira C1 recorded meeting sessions with speaker attribution and metadata.',
  {
    action: z.enum(['list', 'show', 'active']).default('list'),
    session_id: z.string().optional().describe('Session ID when action is show'),
    limit: z.number().int().min(1).max(50).default(15),
  },
  async ({ action, session_id, limit }) => {
    const args = ['sessions', action];
    if (session_id) args.push(session_id);
    args.push('--limit', String(limit));
    const cliOut = runMiraCli(args);
    if (cliOut) return { content: [{ type: 'text', text: cliOut }] };
    const sessionsDir = path.join(DEFAULT_VAULT, 'sessions');
    const files = listMarkdownFiles(sessionsDir).slice(0, limit).map((f) => path.relative(DEFAULT_VAULT, f));
    return { content: [{ type: 'text', text: JSON.stringify({ action, sessions: files }, null, 2) }] };
  }
);

server.tool(
  'mira_segments',
  'Read timestamped, speaker-diarized transcript segments from a specific OneMira C1 recording session.',
  {
    session_id: z.string().describe('Session ID or relative Markdown filename'),
    speaker: z.string().optional().describe('Optional speaker filter'),
  },
  async ({ session_id, speaker }) => {
    const args = ['segments', session_id];
    if (speaker) args.push('--speaker', speaker);
    const cliOut = runMiraCli(args);
    if (cliOut) return { content: [{ type: 'text', text: cliOut }] };
    const candidate = path.join(DEFAULT_VAULT, 'sessions', session_id.endsWith('.md') ? session_id : `${session_id}.md`);
    const body = fs.existsSync(candidate) ? fs.readFileSync(candidate, 'utf8') : 'Session not found in local vault.';
    return { content: [{ type: 'text', text: body }] };
  }
);

server.tool(
  'mira_wiki_read',
  'Read a compounding OKF Markdown Wiki page (person profile, project topic, or tasks.md) maintained by OneMira Desktop.',
  {
    slug: z.string().describe('Wiki relative path or topic/person slug, e.g., wiki/people/alex.md or tasks.md'),
  },
  async ({ slug }) => {
    const cliOut = runMiraCli(['wiki', 'read', slug]);
    if (cliOut) return { content: [{ type: 'text', text: cliOut }] };
    const target = path.join(DEFAULT_VAULT, slug.endsWith('.md') ? slug : `${slug}.md`);
    const text = fs.existsSync(target) ? fs.readFileSync(target, 'utf8') : 'Wiki entry not found.';
    return { content: [{ type: 'text', text }] };
  }
);

server.tool(
  'mira_wiki_update',
  'Create or update an OKF Markdown Wiki note (decisions, action items, or speaker profile) in the local OneMira vault.',
  {
    slug: z.string().describe('Relative Markdown path inside the OneMira vault'),
    content: z.string().describe('Updated Markdown content with YAML frontmatter and wikilinks'),
  },
  async ({ slug, content }) => {
    const target = path.resolve(DEFAULT_VAULT, slug.endsWith('.md') ? slug : `${slug}.md`);
    if (!target.startsWith(path.resolve(DEFAULT_VAULT))) {
      throw new Error('Path must stay inside ONEMIRA_VAULT_PATH');
    }
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, content, 'utf8');
    return { content: [{ type: 'text', text: JSON.stringify({ updated: target }, null, 2) }] };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error('onemira-mcp fatal error:', err);
  process.exit(1);
});
