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

1. **Database.** Run `supabase/004_weekly_pipeline.sql`, then `supabase/005_scan_signal.sql`, then `supabase/006_pieces.sql` and `supabase/007_pack_follow_up.sql`, in the Supabase SQL editor.
2. **Dropbox app.** At dropbox.com/developers/apps create an app: *Scoped access*, *Full Dropbox*. Under Permissions tick `files.metadata.read` and `files.content.read`. Under Settings add the redirect URI `https://falconbp.com/api/dropbox/callback` (and the `www.` host if the admin is used there).
3. **Vercel.** Add `DROPBOX_APP_KEY` and `DROPBOX_APP_SECRET` (Production), then redeploy.
4. **Connect.** In `/admin/import` choose **Connect Dropbox** and allow access. The site reads from Dropbox; it never writes.

Optional environment variables: `DROPBOX_PUBLISH_PATH`, `RESEND_LEADS_EMAIL` (default `info@falconbp.com`), `PACK_LINK_DAYS` (default 7), `DISCOVERY_CALL_URL` (the booking link in the download follow-up), `CRON_SECRET` (locks the daily follow-up job to Vercel's scheduler).

## Pack requests

A reader gives name, work email and organisation and ticks the consent line. The site then:

- records the request in `access_requests` (see **Pack requests** in the admin),
- emails the reader a link to `/research/pack/<token>`,
- emails `info@falconbp.com`, copied to the partner(s) whose territories include the study's.

When the reader comes back and downloads a document for the first time, the moment is recorded (`first_download_at`, from `supabase/008_follow_up_timing.sql`). Forty-eight hours later a daily job (`vercel.json` → `/api/cron/pack-follow-up`, 9am Dubai) emails them once more: thanks, and a link to book a 20-minute discovery call (`DISCOVERY_CALL_URL`, default `https://calendly.com/falconbp/discovery`). The wait is deliberate — by then most readers have been through the summaries and their own questions have started to surface. A reader who takes several packs receives it once in 30 days. The send is recorded on the request (`followup_sent_at`, from `supabase/007_pack_follow_up.sql`); **Pack requests** shows the send, or the day it falls due.

Reader emails come from `research@` on the domain in `RESEND_FROM`, as “FB Research”. Notices to the firm from the contact and research-request forms come from `website@`, as “FalconBridge Website”. The admin sign-in emails are Supabase's and keep the `RESEND_FROM` address.

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

- `territory`: `uae-gcc`, `south-africa`, `new-zealand`, `mauritius`, `north-carolina` or `singapore`. A study that crosses territories is filed under the one it sits closest to. `global` and `usa` are not in use for now: they are hidden from the filters and the admin forms, and a manifest that names one is refused. To bring one back, see `HIDDEN_TERRITORIES` in `src/lib/data.ts`.
- `week_label` uses FalconBridge's week number; `week_of` is the Monday the review period starts.
- An entry may carry a scan, a report, a piece, or any combination. `files` need a report.
- Slots and their default access: 1 User guide (pack), 2 Executive deck (pack), 3 Full research report (pack), 4 Executive summary (open), 5 Executive visual (open), 6 Reference and link audit (internal). `label` and `access` override the defaults. A slot left out is created empty and internal.
- `extract_image` is the Executive Visual as PNG, JPEG or WebP; it is shown on the study page. `cover_image` (3:4) is optional.
- `scan.content` carries the Weekly Signal exactly as issued, and the scan page then shows it as written: `{ "format": "weekly-signal-v1", "heading", "issue", "review_period", "briefing", "themes": [{ "title", "body", "lens", "sources" }], "lead": { … }, "watch", "audit_log": ["…"] }`. `signal` and `question` stay required (lists, the feed and search use them): give the lead topic's text and headline. Needs `supabase/005_scan_signal.sql`.
- Pack files may be PDF, PPTX, DOCX or ZIP.

The validator is `src/lib/weekly/manifest.ts`; the import screen lists every problem before anything is written.

## Professional Curiosity pieces

A piece is the short opinion piece we draw from an own-account study. It sits after the signal and the study in the reader's path: signal, then study, then our view. It lives at `/research/professional-curiosity/<slug>` and is listed, by territory, at `/research/professional-curiosity`.

The same rule applies: a piece goes up as issued. The manifest carries its wording in its own structure and the site shows it as written.

### Publishing a piece

The routine step at the end of a study:

1. Save a manifest with a `piece` to `W. Website Publishing`, exactly like a week's manifest. It can be a manifest of its own (the usual case, because the study is already live) or part of the study's entry.
2. Open `/admin/import`. The entry shows `piece: new`.
3. **Import as drafts** and open **Preview piece** to read it as a reader will, or **Import and publish**.

The piece then appears in the index, the study page gains a link to it beside the Weekly Signal link, and the piece's **Request the full study** button opens the study's request form (`/research/studies/<slug>#research-pack`). The button is shown only when the study has that form.

A piece can also be reviewed, linked to its study and published from **Professional Curiosity** in the admin.

```json
{
  "version": 1,
  "week_label": "2026-W41",
  "prepared_by": "Claude",
  "entries": [
    {
      "territory": "new-zealand",
      "piece": {
        "slug": "malaysia-is-not-yet-new-zealands-route-into-asean",
        "study": "from-advice-to-actual-market-routes-new-zealand-2026",
        "published_at": "2026-10-07",
        "evidence_date": "2026-09-21",
        "description": "Optional. One or two sentences for the link preview and the index.",
        "content": {
          "format": "professional-curiosity-v1",
          "series": "Professional Curiosity Series",
          "headline": "First sentence of the headline. Second sentence of the headline.",
          "headline_accent": "Second sentence of the headline.",
          "blocks": [
            { "type": "paragraph", "text": "Body text. **Bold** and *italic* are kept." },
            { "type": "lead", "text": "The paragraph the piece sets larger and bold." },
            { "type": "note", "text": "A boxed aside, such as the line that explains the series." },
            { "type": "stats", "items": [{ "figure": "4.9%", "label": "What the figure measures" }, { "figure": "0", "label": "The finding", "highlight": true }], "caption": "The base line under the tiles." },
            { "type": "heading", "text": "A section heading" },
            { "type": "callouts", "heading": "Optional heading", "items": [{ "title": "Optional title", "body": "Callout text" }] },
            { "type": "questions", "heading": "Optional heading", "items": ["A question?", "Another question?"] },
            { "type": "list", "items": ["A bullet"] },
            { "type": "quote", "text": "A pull quote", "attribution": "Optional" }
          ],
          "request_note": "The line under the Request the full study button.",
          "disclaimer": "The closing disclaimer, as issued."
        }
      }
    }
  ]
}
```

- `slug` is the piece's permanent address. Do not change it once the link has been shared.
- `study` is the slug of the study behind the piece. Leave it out when the same entry carries the `report`.
- `published_at` gives the byline its month and year; `evidence_date` gives it the evidence date. The byline reads “FalconBridge Partners · October 2026 · Own-account research, evidence date 21 September 2026”. To carry a byline exactly as issued instead, put it in `content.byline`.
- `headline_accent` is the closing part of the headline set in gold. It must be the last words of `headline`.
- Callouts and questions are numbered by the site in the order given. A callout's title is shown as its label: “1 · TITLE”.
- From an issued email, the email's own wrapper is left out: the logo, the sender's covering note, and the sign-off lines under the disclaimer.
- `share_image` (optional) is a Dropbox reference to a 1200 × 630 image for the link preview. Without it the site draws one from the headline.
- Needs `supabase/006_pieces.sql`.

The validator is `src/lib/pieces.ts`.

## Link previews

A piece, a study and a Weekly Signal each state their own title, description and image for LinkedIn (Open Graph) and for X. Where a page has no image of its own, the site draws a 1200 × 630 card from the headline at `/og/piece/<slug>`, `/og/study/<slug>` or `/og/signal/<slug>`. A study with a cover image uses the cover; a piece with a `share_image` uses that.

LinkedIn and X keep their own copy of a preview. After changing a headline or image, refresh LinkedIn's copy with its Post Inspector (linkedin.com/post-inspector) before posting the link again.

