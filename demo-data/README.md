# Demo data

`campaign_data.csv` is fictional classroom data for the local Demo mode. It is
safe to use without provider API keys and contains no customer information.

## Expected calculations

The Agent reads 4 rows and groups them into four channels:

| Channel | Spend | Clicks | Leads | Revenue | Cost per lead |
|---|---:|---:|---:|---:|---:|
| Search | 1200 | 800 | 40 | 4500 | 30 |
| Social | 900 | 1200 | 18 | 1900 | 50 |
| Email | 200 | 400 | 32 | 2800 | 6.25 |
| Referrals | 100 | 180 | 24 | 3600 | 4.17 |

Totals are **£2,400 spend**, **2,580 clicks**, **114 leads**, and **£12,800
revenue**. The overall cost per lead is **£21.05** and the overall ROAS is
**5.33**.

These are deterministic calculations from the CSV, not model-generated
predictions. Demo chat replies are canned examples, and Demo usage is never
reported as provider tokens or a billable cost.

## Try it

1. Start the local Worker from the repository root:

   ```powershell
   npm run build
   npx wrangler dev .\dist\server\index.js
   ```

2. Open `http://localhost:8787`.
3. Stay on **Demo** mode.
4. Choose **Analyse campaign data**. The app attaches the same sample data
   automatically.
5. Select **Agent**, submit the task, and preview or download the action brief.

You can also attach this CSV manually. Live mode is separate and requires
owner-configured provider secrets.

## AI Audit fixture

`ai_tool_inventory.csv` is a fictional inventory for the AI Audit Demo. It
contains duplicate assistants, renewal dates, adoption, time saved and data
risk fields so the audit can demonstrate:

- consolidating overlapping subscriptions;
- assigning a process owner;
- reviewing contracts before renewal;
- tracking staff adoption and hours saved; and
- checking whether sensitive data is entering unapproved tools.

The audit's £145 monthly saving, 18 hours recovered and 42% adoption baseline
are illustrative scenario values. They are not calculated from a real business
and must not be presented as a guaranteed saving.
