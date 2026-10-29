<div align="center">

  <h1>OneMira MCP Server & Mira CLI</h1>
  <p><strong>Connect the <a href="https://onemira.com/products/c1">OneMira C1 Standalone AI Voice Recorder ($99, $0/mo)</a> to Cursor, Claude Desktop, Claude Code & Obsidian</strong></p>
  <p>✨ Local AI · Works Standalone · 🗣️ Speaker ID · Zero Cloud Subscription</p>

  <p>
    <a href="https://onemira.com/products/c1"><img src="https://img.shields.io/badge/Hardware-OneMira_C1_(%2499)-0052CC?style=for-the-badge&logo=shopify&logoColor=white" alt="OneMira C1" /></a>
    <a href="https://onemira.com/docs/mcp-integration"><img src="https://img.shields.io/badge/Docs-MCP_%26_CLI_Guide-008080?style=for-the-badge" alt="MCP Docs" /></a>
    <a href="https://onemira.com/download"><img src="https://img.shields.io/badge/Desktop-macOS_%26_Windows-2ea44f?style=for-the-badge" alt="Download Desktop" /></a>
    <a href="https://www.producthunt.com/products/onemira-c1"><img src="https://img.shields.io/badge/Product_Hunt-OneMira_AI-DA552F?style=for-the-badge&logo=producthunt&logoColor=white" alt="Product Hunt" /></a>
  </p>

</div>

---

## Overview

**[OneMira C1](https://onemira.com/products/c1)** is an 85 g sandblasted aluminum, subscription-free AI voice recorder that captures in-person meetings, interviews, lectures, and headphone calls (AirPods / Bluetooth headphones on Zoom, Teams, and Google Meet) with a single press—no phone distractions and no meeting bots.

**[OneMira Desktop](https://onemira.com/download)** transcribes speech locally on macOS 12+ and Windows 10/11 (64-bit) across 99 languages with automatic **Speaker ID**, builds a compounding **Google Native OKF Markdown Wiki**, and exposes a built-in **Model Context Protocol (MCP) server** and **Mira CLI** so your AI coding and writing agents (**Cursor**, **Claude Desktop**, **Claude Code**, **Windsurf**, **ChatGPT**) can query your spoken context directly.

<p align="center">
  <a href="https://onemira.com/products/c1">
    <img src="https://cdn.shopify.com/s/files/1/0822/6897/9444/files/onemira-c1-pdp-001_0c685067-f806-4ba2-8c5d-2717ce2097a4.jpg" alt="OneMira C1 Standalone AI Voice Recorder" width="840" />
  </a>
</p>

<p align="center">
  <a href="https://onemira.com/products/c1">
    <img src="https://cdn.shopify.com/s/files/1/0822/6897/9444/files/c1-pdp-01-realtime-wiki.jpg" alt="OneMira C1 Real-Time Local Transcription & OKF Markdown Wiki" width="840" />
  </a>
</p>

---

## Quick Start: Connect OneMira MCP to Your AI Client

Full setup guide: **[https://onemira.com/docs/mcp-integration](https://onemira.com/docs/mcp-integration)**

### 1. Install OneMira Desktop & Pair C1
1. Order **[OneMira C1 ($99, $0/mo subscription)](https://onemira.com/products/c1)** and download **[OneMira Desktop for macOS or Windows](https://onemira.com/download)**.
2. Open **OneMira Desktop → Settings → MCP & CLI** to copy your local MCP snippet or enable automatic injection for Cursor and Claude Desktop.

### 2. Cursor / Claude Desktop Configuration (`mcp.json` / `claude_desktop_config.json`)

```json
{
  "mcpServers": {
    "mira": {
      "command": "mira",
      "args": ["mcp", "serve"]
    }
  }
}
```

### 3. Claude Code CLI

```bash
claude mcp add mira -- mira mcp serve
```

---

## Available MCP Tools

| Tool Name | Description |
| :--- | :--- |
| `mira_search` | Full-text and semantic search across meeting transcripts and OKF Wiki pages. |
| `mira_sessions` | List, filter, and inspect recent recorded meetings and active live sessions. |
| `mira_session_read` | Read full structured session metadata, summary, decisions, and action items. |
| `mira_segments` | Retrieve exact speaker-labeled transcript segments and timestamps from a session. |
| `mira_wiki_search` | Search compounding OKF Markdown Wiki topics, project notes, and people profiles. |
| `mira_wiki_read` | Read a canonical OKF Wiki page with YAML frontmatter and relational backlinks. |
| `mira_wiki_create` / `mira_wiki_update` | Create or refine structured OKF Wiki knowledge pages from spoken context. |
| `mira_speaker_read` / `mira_speaker_update` | Inspect and map speaker profiles across meetings. |

---

## Why Local AI + Dedicated Hardware Beats Cloud Recorder Subscriptions

<p align="center">
  <a href="https://onemira.com/products/c1">
    <img src="https://cdn.shopify.com/s/files/1/0822/6897/9444/files/c1-pdp-07-no-subscriptions-ever_0d5de095-ae1f-4fe7-86e6-506159690576.jpg" alt="OneMira C1 Zero Subscriptions Forever" width="840" />
  </a>
</p>

| Feature | [OneMira C1 ($99)](https://onemira.com/products/c1) | Cloud Card / Pin Recorders (Plaud, Pocket, etc.) | Software Meeting Bots (Otter, Fireflies) |
| :--- | :--- | :--- | :--- |
| **Recurring Subscription** | **$0/month forever** | $79–$240/year for Pro/Unlimited | $100–$240/year per seat |
| **Monthly Transcription Cap** | **Unlimited local ASR (99 languages)** | 300 min/mo cap on starter plans | 300 min/mo cap on free tiers |
| **Built-In Offline Local AI** | **Included in OneMira Desktop** | Cloud-only processing | Cloud-only processing |
| **AirPods / Headphone Call Capture** | **Yes (without joining as a bot)** | Requires phone MagSafe vibration mode | Joins call as visible recording bot |
| **Storage Format** | **Local OKF Markdown (`.md`) + optional `.wav`** | Proprietary cloud app inbox | Proprietary web dashboard |
| **Native MCP & CLI** | **Local MCP server + Mira CLI** | Cloud API / webhook export | Paid tier webhook / Zapier |

---

## Official Links & Head-to-Head Comparisons

- **[OneMira C1 Official Product Page ($99 USD)](https://onemira.com/products/c1)**
- **[OneMira MCP & CLI Documentation](https://onemira.com/docs/mcp-integration)**
- **[Mira CLI Command Reference](https://onemira.com/docs/mcp-integration/cli-guide)**
- **[AI Voice Recorder Without Subscription (1–3 Year Cost Breakdown)](https://onemira.com/ai-voice-recorder-without-subscription)**
- **[Record Zoom, Teams & Google Meet Without a Bot](https://onemira.com/meeting-recorder-without-a-bot)**
- **[How to Connect Your Voice to Cursor Using OneMira MCP](https://onemira.com/blogs/how-to-connect-your-voice-to-cursor-using-onemira-mcp)**
- **[Send Voice Recordings to Claude & Obsidian Without Zapier](https://onemira.com/blogs/automate-voice-recorder-to-claude-obsidian-without-zapier)**
- **Hardware Comparisons**:
  - [OneMira C1 vs. Plaud Note](https://onemira.com/compare/plaud-note)
  - [OneMira C1 vs. Plaud Note Pro](https://onemira.com/compare/plaud-note-pro)
  - [OneMira C1 vs. Plaud NotePin](https://onemira.com/compare/plaud-notepin)
  - [HeyPocket Alternative: OneMira C1 vs. Pocket AI](https://onemira.com/compare/heypocket)
  - [Omi Alternative: OneMira C1 vs. Omi Pendant](https://onemira.com/compare/omi)
  - [OneMira C1 vs. HiDock P1](https://onemira.com/compare/hidock-p1)
  - [Limitless Pendant Alternative: OneMira C1](https://onemira.com/compare/limitless)
  - [OneMira C1 vs. Amazon Bee](https://onemira.com/compare/bee-frontier)
