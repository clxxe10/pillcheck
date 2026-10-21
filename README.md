# PillCheck

PillCheck reads photos of medicine bags and checks whether the medicines are safe to take together. It was built for DSH Hacks V2 (AI × Healthcare).

People often leave a clinic with several bags and no easy way to see that two of them share acetaminophen, or that ibuprofen can blunt low-dose aspirin. PillCheck puts those bags on one screen and flags the overlap with a source you can open.

This is not medical advice and does not replace a doctor or pharmacist.

## Features

- Scan up to five medicine-bag photos, or try three fictional sample bags with no API call.
- Read Korean pharmacy labels into a structured medicine list. English shows the English name; Korean shows the printed name.
- Safety checks are rules, not model output:
  - duplicate ingredients
  - daily dose against published adult limits (caution at 70%, danger above the limit)
  - combination contraindications from MFDS DUR when `DATA_GO_KR_KEY` is set, otherwise a small local table
  - known cautions such as ibuprofen plus low-dose aspirin (FDA)
- Edit or delete a medicine and the safety check runs again.
- Home shows today’s date and the next dose from the default times (08:00, 12:30, 18:30, 22:00).
- Share the list and warnings, or copy them when the browser has no share sheet.
- English and Korean. Photos and results stay in the browser.

## Stack

Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4.

AI providers are swappable with `AI_PROVIDER`:

- Gemini via `@google/genai`, default model `gemini-3.8-flash`
- Claude via `@anthropic-ai/sdk`, default model `claude-sonnet-5-5`

The app was built in Cursor.

## Data sources

| Check | Source |
|---|---|
| Acetaminophen 4,000 mg/day | [FDA](https://www.fda.gov/consumers/consumer-updates/dont-double-acetaminophen) |
| Ibuprofen 3,200 mg/day | [DailyMed](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=00872852-680a-41b3-901b-b991b12a176d) |
| Aspirin 4,000 mg/day | [FDA](https://www.fda.gov/drugs/safe-use-aspirin) |
| Pseudoephedrine 240 mg/day | [NIH MedlinePlus](https://medlineplus.gov/druginfo/meds/a682619.html) |
| Ibuprofen + low-dose aspirin | [FDA](https://www.fda.gov/drugs/safe-use-aspirin/information-about-taking-ibuprofen-and-aspirin-together) |
| Combination contraindications | [MFDS DUR ingredient API](https://www.data.go.kr/data/15056780/openapi.do) when a key is set. Without a key, a short local fallback in `src/lib/safety/interactions.json` |
| Duplicate ingredients | The names printed on the labels. No external URL |

Limits are general adult ceilings, not a personal dose.

## Run

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). `npm test` checks the safety rules. `npm run build` makes a production build.

| Env | Default | Notes |
|---|---|---|
| `AI_PROVIDER` | `gemini` | `gemini` or `claude` |
| `GEMINI_API_KEY` | — | [Google AI Studio](https://aistudio.google.com/apikey). Server only |
| `GEMINI_MODEL` | `gemini-3.8-flash` | Optional |
| `ANTHROPIC_API_KEY` | — | [Anthropic Console](https://console.anthropic.com/). Server only |
| `ANTHROPIC_MODEL` | `claude-sonnet-5-5` | Optional |
| `DATA_GO_KR_KEY` | — | Optional. [data.go.kr](https://www.data.go.kr/data/15056780/openapi.do) key for DUR |
| `DAILY_EXTRACT_LIMIT` | `200` | Shared live-extraction cap per UTC day, per server instance |

Do not prefix any of these with `NEXT_PUBLIC_`.

Live extraction (`POST /api/extract`) allows 5 photos, about 3.5 MB of base64 each, 10 calls an hour and 30 a day per IP, plus the shared daily cap. Over the limit, the sample bags still work. Counters are in memory, so on Vercel they are per instance and reset on a cold start. `POST /api/safety` rejects oversized bodies. Nothing is written to disk.

## Screens

| Screen | URL |
|---|---|
| Home | `/` |
| Empty home | `/?state=empty` |
| Scan | `/scan` |
| Scan error (sample) | `/scan?error=1` |
| Analyzing | `/analyzing` (`?hold=1` to stay) |
| Results | `/results` |
