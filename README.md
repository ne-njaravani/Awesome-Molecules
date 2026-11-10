# Unified AI Workspace — LUBS3991 prototype

An interactive **Mighty Atoms** SME student concept. Bob can ask questions or select a deliberately limited Agent to analyse campaign data and produce a PDF action brief. A common API Gateway handles the differences between AI providers. This is **not** an official Mighty Atoms product, and its name is not final.

## Version 0.4: chat-first desktop redesign

- Desktop-first, monochrome chat UI; a single composer with explicit **Ask / Agent** modes.
- Browser-local multi-turn conversations, new-chat history, context sent to Live AI and an Auto/manual provider selector.
- Safe **Demo** chat responses are fixed templates; they are never represented as live model output or billed usage.
- **Basic Agent A** reads CSV/TSV and TXT files (80 KB text limit), performs actual deterministic campaign calculations, creates a weekly marketing plan and generates a downloadable, selectable-text PDF report. The sample campaign prompt can be run immediately without a provider key.
- **AI Audit Demo** compares a fictional AI tool inventory, estimates potential savings and time recovery, recommends a smaller toolset, provides focused five-minute lessons with human checks, and sets 30/90-day ROI checkpoints. It is deterministic Demo data, not a financial or procurement guarantee.
- The audit also includes a KPI scorecard (baseline, target, Day 30 and Day 90), a risk register for contracts/data/staff dependency, and quick entry points for reviewing ROI progress or risks.
- **Live API** calls use the existing Cloudflare Worker Gateway with OpenAI, Anthropic, Google Gemini and DeepSeek adapters. Live mode stays disabled without server-configured API keys.
- Per-call cost guardrails, same-origin POST checks and sign-in checks; API secrets never enter the browser.
- **Insights** keeps Demo and Live usage separate. Live tokens come from upstream provider usage; costs appear only if owner-configured pricing is available. Existing browser-local prototype records remain readable, marked as legacy demo examples.
- **Adapter Inspector** preserves the prior request transformation demonstration with placeholders, without making billable provider calls.
- Fictional sample input and expected calculations are versioned in [`demo-data/`](./demo-data). Demo chat uses deterministic canned examples and the Agent calculates the supplied CSV locally; neither requires an API key.

### Honest prototype limits

- Excel (`.xlsx`), PDF input and scanned PDF OCR are **not yet supported** as uploads; this increment focuses on reliable CSV/TSV/TXT analysis. PDF **report output** works.
- Demo chat returns a fixed generic response for every message, including the submitted request. Numeric CSV metrics are actually computed from the fictional fixture, but Demo does not invoke a model or fabricate token counts.
- HTML client shows a waiting state while a Live response arrives; true model response streaming is not implemented yet.
- Chats and report results are stored only in the current browser. Cross-device history and BYO API keys remain future work pending the team's product decision.
- This Site is owner-private by current access policy. Do not change access merely for a teammate; sharing and GitHub collaboration can be handled separately.

## Start locally

Requires Node.js 20 or later. No npm dependencies are needed.

```bash
npm test
npm run build
```

The build produces a self-contained Cloudflare Worker at `dist/server/index.js` that serves the UI as well as the API routes. The Sites project identity is in `.openai/hosting.json` and must be preserved when updating the existing deployment.

To run the built Worker locally:

```powershell
npm run build
npx wrangler dev .\dist\server\index.js
```

Open `http://localhost:8787`, leave the environment set to **Demo**, and choose
**Analyse campaign data**. The complete fixture and expected results are in
[`demo-data/README.md`](./demo-data/README.md).

## Hosted configuration

Configure **runtime secrets** in the hosting platform (not in GitHub):

1. Choose at least one of `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GEMINI_API_KEY` or `DEEPSEEK_API_KEY`.
2. Optionally configure `*_MODEL` with a model ID available to the corresponding account.
3. Set `MAX_OUTPUT_TOKENS` and `MAX_REQUEST_ESTIMATED_USD`; the default output limit is 512 tokens and default per-request cost ceiling is USD 0.05 **only when pricing is configured**.
4. Optionally set the provider-specific `*_INPUT_USD_PER_M` and `*_OUTPUT_USD_PER_M` values using current provider pricing. Without these, dollar estimates show as `N/A` while actual token counts still work.
5. Set `API_ENABLED=true` only after reviewing budgets, credentials and access. Otherwise Live mode stays disabled.

The API is protected by the Site's ChatGPT sign-in. A new authentication strategy and a persistent spend ledger would be needed before offering this as a public multi-user product.

## API contract

`GET /api/status` returns only enabled model metadata and configured availability, never keys.

`POST /api/run` remains available for compatibility (requires Site sign-in and `Content-Type: application/json`):

```json
{
  "prompt": "Write three LinkedIn posts for a small consulting firm.",
  "goal": "balanced"
}
```

Goals: `balanced`, `quality`, `cost`, `speed`. The server classifies the prompt, scores only configured providers and invokes the chosen API. The response includes `providerId`, `model`, `output`, `usage` and optional `estimatedCostUsd`.

New routes:

- `POST /api/chat` takes `mode` (`demo`/`live`), `messages` (`[{role,content}]`), optional `goal` and `providerId` (`auto` or a provider ID). Live sends bounded conversation context through the provider adapter.
- `POST /api/agent` takes `mode`, `prompt`, optional `filename` and `fileText`, `goal` and `providerId`. CSV columns can include `Channel`, `Spend`, `Clicks`, `Impressions`, `Leads` and `Revenue`. It returns `steps`, structured `report`, `output`, and usage metadata when Live is configured.

The user-facing PDF report is generated from the structured result in the browser. No PDF generation API or third-party file service is used.

The router's quality/fit/speed/cost scores are **illustrative product assumptions, not validated benchmarks**. Do not claim real cost savings until you have comparable measured costs and a counterfactual baseline.

## Further production work

- Browser-local history is not shared between teammates. Account-backed records, uploaded-file persistence and *true daily/monthly spend caps* require database-backed quotas and atomic reservations.
- Model IDs/rates change. Review overrides and prices before enabling Live API billing.
- Files are read and sent to the Site backend for analysis, and when Live is selected, a summarised task context may be sent to the chosen AI provider. Use fictional data for classroom demos.
- Add robust PDF/XLSX file extraction, actual streaming, stable retryable background jobs and per-user authentication before treating this as a production SME tool.
- Keep the GitHub repository private until the team agrees on access and cost responsibility.

## Group development

Suggested flow: create a branch for each feature, open a pull request into `main`, review UI and server changes separately, and run `npm test` before merging. Never commit `.env`, API tokens, private prompts or recorded customer data.

### Suggested presentation

1. Open the clean **Workspace**; explain Ask vs Agent and Auto model choice.
2. Click **Analyse campaign data** to load a fictional CSV and Agent task.
3. Run in Demo: show real file parsing, derived metrics, the step list and a downloadable PDF.
4. Inspect the **Adapter Inspector** to show how the gateway translates a single task into four provider API formats.
5. Open **Insights**. Explain that Demo has no billable usage; Live only reports real provider metrics if a key has been enabled.

### Load a full fictional workspace

For presentations or screenshots, open **Settings** and select **Load fictional
demo workspace**. This adds 10 recent-looking conversations and 12 Demo
activity records to the current browser. The records are clearly fictional,
have no token or cost values, and are never sent to an AI provider. Loading is
explicit and asks for confirmation if the browser already contains local data.

If an older version of the UI is still visible, stop Wrangler with `Ctrl+C`,
run `npm run build`, start it again with the Worker entry point, and hard
refresh the browser with `Ctrl+Shift+R`.

## Reference APIs

- [OpenAI Chat Completions](https://developers.openai.com/api/reference/resources/chat)
- [Anthropic Messages](https://docs.anthropic.com/en/api/messages)
- [Google Gemini generateContent](https://ai.google.dev/api/generate-content)
- [DeepSeek Chat Completions](https://api-docs.deepseek.com/api/create-chat-completion/)
