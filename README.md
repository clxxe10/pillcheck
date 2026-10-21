# PillCheck

Hackathon (DSH Hacks V2, AI × Healthcare) web app: scan Korean pharmacy medicine bags and check them together.

## Run

```bash
npm install
cp .env.example .env.local   # then add a key if you want live extraction
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sample photos on `/scan` use a saved JSON result and **do not** call an AI API.

## Live extraction (`POST /api/extract`)

Used only when you upload your own photos. Keys stay on the server (`GEMINI_API_KEY` / `ANTHROPIC_API_KEY` — never `NEXT_PUBLIC_`).

| Env | Default | Notes |
|---|---|---|
| `AI_PROVIDER` | `gemini` | `"gemini"` or `"claude"` |
| `GEMINI_API_KEY` | — | [Google AI Studio](https://aistudio.google.com/apikey) |
| `GEMINI_MODEL` | `gemini-3.8-flash` | Free-tier Flash |
| `ANTHROPIC_API_KEY` | — | [Anthropic Console](https://console.anthropic.com/) |
| `ANTHROPIC_MODEL` | `claude-sonnet-5-5` | |

Both providers share the same prompt and JSON shape in `src/lib/ai/`. Photos and results are not stored on the server.

## Screens

| Screen | URL |
|---|---|
| Home | `/` |
| Empty home | `/?state=empty` |
| Scan | `/scan` |
| Scan error (sample) | `/scan?error=1` |
| Analyzing | `/analyzing` (`?hold=1` to stay) |
| Results | `/results` |
