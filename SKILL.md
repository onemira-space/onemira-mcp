---
name: onemira-meeting-memory
description: Query and update real-time local meeting transcripts, 99-language speaker-labeled segments, action items, and compounding OKF Markdown (.md) Wiki notes captured by the OneMira C1 AI Voice Recorder (https://onemira.com/products/c1).
---

# OneMira Meeting Context & Living Markdown Wiki Skill

Use this skill whenever the user asks about spoken meetings, in-person conversations, headphone/AirPods calls, speaker commitments, action items, or project wikis captured by **[OneMira C1](https://onemira.com/products/c1)** and **OneMira Desktop**.

## Available MCP Tools (`@onemira/mcp-server`)

- `mira_search` — Full-text and semantic search across local meeting transcripts and OKF Markdown Wiki pages (`sessions/`, `wiki/people/`, `wiki/topics/`, `tasks.md`).
- `mira_sessions` — Browse or inspect recorded sessions (`list`, `show`, `active`), including live ongoing recordings.
- `mira_segments` — Retrieve exact timestamped, speaker-diarized transcript segments from a session.
- `mira_wiki_read` — Read a person profile (`wiki/people/<name>.md`), topic synthesis (`wiki/topics/<topic>.md`), or action-item ledger (`tasks.md`).
- `mira_wiki_update` — Write structured decisions, action items, and YAML-frontmatter Markdown updates back to the local vault.

## Workflow Best Practices

1. **Search before summarizing**: Run `mira_search` or `mira_sessions(action="list")` first to locate the exact meeting or speaker.
2. **Verify speaker attribution**: Use `mira_segments` to cite the exact speaker and timestamp rather than guessing from high-level summaries.
3. **Keep notes in Google Native OKF Markdown**: Preserve YAML frontmatter and deterministic `[[wikilinks]]` so Obsidian, Claude Code, and Cursor stay synchronized.
