# Weekly pipeline

How a week's research gets from Dropbox to falconbp.com. Built October 2026.

## The rule

Signals and reports go up as they are. The Weekly Signal is shown exactly as issued, in its own structure. The study page carries the Executive Summary as issued, and the pack files are the files from the Client Pack. The only things removed from a signal are its email wrapper: sender and recipient lines, the internal-use footer, the credit lines and phone numbers.

## What goes where

| Layer | What | How a reader gets it |
|---|---|---|
| Open | The Weekly Scan entry; the study page with the Executive Visual and Executive Summary | On the site, no form |
| Pack | Quick Start Guide, Executive Deck, full GDRS report | Reader completes the form on the study page; a link is emailed and works for 7 days |
| Internal | Partner Brief, Reference Audit, internal memo, research brief, working files | Never uploaded, never shown |

Each file's level is a setting on the study in `/admin/reports`: **Open download**, **In the pack**, or **Internal**.

## The weekly run (Wednesday, once all five packs are in Dropbox)

1. Read the week's five folders in `K2. RaaS Engagements` and write the public copy.
2. Save one `manifest.json` to `W. Website Publishing/<year>-W<week>/` in the shared Dropbox.
3. Open `/admin/import`. The week appears with each territory and its files.
4. **Import as drafts** to review first, or **Import and publish**.
5. The importer copies the pack files from Dropbox into private storage and creates the scan entry and the study for each territory, linked to each other.

Running an import again is safe. Entries are matched by slug and files by slot; a file already copied from the same Dropbox file is not copied again. An entry that is already live is skipped unless **Replace published entries** is ticked. A study is never published while one of its files failed to copy.

## One-time setup

1. **Database.** Run `supabase/004_weekly_pipeline.sql`, then `supabase/005_scan_signal.sql`, in the Supabase SQL editor.
2. **Dropbox app.** At dropbox.com/developers/apps create an app: *Scoped access*, *Full Dropbox*. Under Permissions tick `files.metadata.read` and `files.content.read`. Under Settings add the redirect URI `https://falconbp.com/api/dropbox/callback` (and the `www.` host if the admin is used there).
3. **Vercel.** Add `DROPBOX_APP_KEY` and `DROPBOX_APP_SECRET` (Production), then redeploy.
4. **Connect.** In `/admin/import` choose **Connect Dropbox** and allow access. The site reads from Dropbox; it never writes.

Optional environment variables: `DROPBOX_PUBLISH_PATH`, `RESEND_LEADS_EMAIL` (default `info@falconbp.com`), `PACK_LINK_DAYS` (default 7).

## Pack requests

A reader gives name, work email and organisation and ticks the consent line. The site then:

- records the request in `access_requests` (see **Pack requests** in the admin),
- emails the reader a link to `/research/pack/<token>`,
- emails `info@falconbp.com`, copied to the partner(s) whose territories include the study's.

Only a hash of the token is stored. The pack page issues each download as a signed URL that lasts two minutes. The link stops working after seven days, or at once if the study is unpublished. Opens and downloads are counted per request.

Studies without uploaded pack files keep the earlier behaviour: the form emails the research team and a partner replies by hand.

## The manifest

One JSON file per week. Whoever writes it — a person, Claude or HT+ — the importer treats it the same way. Files are referenced by Dropbox file id (`id:…`), so their names and folders do not matter.

```json
{
  "version": 1,
  "week_label": "2026-W41",
  "review_period": { "from": "2026-09-28", "to": "2026-10-04" },
  "prepared_by": "Claude",
  "notes": "Optional note shown on the import screen.",
  "entries": [
    {
      "territory": "mauritius",
      "scan": {
        "slug": "mauritius-week-41-2026-fuel-price-pass-through",
        "title": "Mauritius · Week 41 · Fuel price pass-through",
        "service": "raas",
        "week_of": "2026-09-28",
        "signal": "…",
        "question": "…",
        "finding": "…",
        "interpretation": "…",
        "open_questions": ["…"]
      },
      "report": {
        "slug": "from-pump-price-to-cost-base-mauritius",
        "title": "From Pump Price to Cost Base",
        "subtitle": "…",
        "published_at": "2026-10-07",
        "body": "The Executive Summary text.",
        "facts": [{ "figure": "164 sources", "body": "…" }],
        "extract_image": "id:…"
      },
      "files": [
        { "slot": 1, "label": "Quick start guide", "dropbox": "id:…" },
        { "slot": 2, "dropbox": "id:…" },
        { "slot": 3, "dropbox": "id:…" },
        { "slot": 4, "dropbox": "id:…" },
        { "slot": 5, "dropbox": "id:…" }
      ]
    }
  ]
}
```

- `territory`: `uae-gcc`, `south-africa`, `new-zealand`, `mauritius`, `north-carolina`, `singapore`.
- `week_label` uses FalconBridge's week number; `week_of` is the Monday the review period starts.
- An entry may carry a scan, a report, or both. `files` need a report.
- Slots and their default access: 1 User guide (pack), 2 Executive deck (pack), 3 Full research report (pack), 4 Executive summary (open), 5 Executive visual (open), 6 Reference and link audit (internal). `label` and `access` override the defaults. A slot left out is created empty and internal.
- `extract_image` is the Executive Visual as PNG, JPEG or WebP; it is shown on the study page. `cover_image` (3:4) is optional.
- `scan.content` carries the Weekly Signal exactly as issued, and the scan page then shows it as written: `{ "format": "weekly-signal-v1", "heading", "issue", "review_period", "briefing", "themes": [{ "title", "body", "lens", "sources" }], "lead": { … }, "watch", "audit_log": ["…"] }`. `signal` and `question` stay required (lists, the feed and search use them): give the lead topic's text and headline. Needs `supabase/005_scan_signal.sql`.
- Pack files may be PDF, PPTX, DOCX or ZIP.

The validator is `src/lib/weekly/manifest.ts`; the import screen lists every problem before anything is written.
