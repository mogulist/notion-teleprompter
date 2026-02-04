# Prompter Connected with Notion

A web app that uses Notion as a CMS and lets you remotely control a prompter screen from another device (PC or tablet).

- **Controller**: Connect via Notion OAuth, load a list of scripts from a Database, then select and control playback. Link to the prompter using a Room ID (e.g. QR code).
- **Prompter**: Enter the Room ID to receive real-time signals from the controller (scroll, play/pause, style, etc.).

Scripts are written and edited in Notion; the app reads them via the Notion API and displays them. For full specs and roadmap, see [docs/introduction.md](docs/introduction.md).

## Background

A teleprompter is usually placed near the camera, so it’s awkward to operate it on the same device. This project uses web tech so that:

- **Scripts live in Notion** — you write and update them in a familiar editor; no need to copy-paste into a separate app.
- **Control is remote** — you run the controller on a laptop or tablet and the prompter on another screen; the prompter device stays untouched by the presenter.

So the flow is: edit in Notion → open the controller → load the script list → connect the prompter via Room ID → control scroll and playback from the controller.

## Getting Started

1. **Install dependencies**
   ```bash
   bun install
   ```

2. **Set up environment variables**  
   Copy `.env.example` to `.env.local` and fill in your Notion OAuth values.
   - Create a [Public OAuth integration](https://www.notion.so/my-integrations) in Notion.
   - Set `NOTION_CLIENT_ID`, `NOTION_CLIENT_SECRET`, and `NOTION_OAUTH_REDIRECT_URI` (e.g. `http://localhost:3000/api/auth/notion/callback`).

3. **Run the dev server**
   ```bash
   bun run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000), go to `/controller`, and connect with Notion.

---

Vibe coded with [Cursor](https://cursor.com) and [Antigravity](https://antigravity.google/).
