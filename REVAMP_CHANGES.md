# falconbp.com revamp — branch `revamp/dss` (prototype v4, 21 September 2026)

Built from the September 2026 partner-review documents. All copy lives in `src/content/site.ts`;
change it there and every page updates. Lines marked `[DRAFT]` in that file were written where the
documents are silent — strike or edit.

## Structure
- `/` — hero (approved client promise), Evidence/Judgement/Execution reality, four situations, DSS compass + five services, human authority, research in practice, partners, invitation.
- `/decision-support-system` + five service pages (`critical-evaluation`, `research`, `coaching`, `execution-modelling`, `advisory`) — from the 4-series briefs; AaaS from the foundation + spec (`[DRAFT]`).
- `/situations` + four pages — from the 7-series documents (7.2 split into `own-a-decision` and `make-a-direction-workable`).
- `/research`, `/research/weekly-scan` (+ 3 sample entries, labelled), `/research/studies` (+ SA 3% Growth study page).
- `/bespoke-managed-services` — document 9; IRaaS marked in development; no client, prices or terms.
- `/about` — origins (2015 / 2025 / ≈158), three partners, territories map, philosophy, trust and use.
- `/working-with-falconbridge` — document 8.
- `/contact` — approved invitation; "Where are you based?" routing field added (API route updated).
- Terms of Engagement — IP/licence paragraph rewritten to the Type-1 default; referral-only language removed everywhere.
- Redirects (`next.config.mjs`): `/how-we-work*` → DSS pages. Old dimension pages and unused section components deleted.

## Visual
- Palette moved to the Visual Identity Working Guide v1.0: charcoal #262626, ivory #F4F2EC, gold #C8A86A, pale gold #E3CE98, body grey #B8BDC8. Token names (`brand-navy` etc.) kept so existing classes still work.
- Arial + Georgia Italic (system fonts; Google Fonts import removed). `.governing` = Georgia Italic for governing questions.
- `.tile` / `.tile-ivory` = shallow tiles with gold hairlines, per the guide. Pill nav, grain and frosted pattern retained.
- Decision Support System compass built in code (`src/components/dss/Compass.tsx`) — swap for the locked Decision Compass v1.0 asset if preferred.

## Placeholders (prototype only)
- Wayne's portrait — initials tile until the supplied portrait arrives (`PartnerCard.tsx`).
- Weekly Scan — three sample entries, marked "Sample — prototype".
- Study page — report extract image and six download links are placeholders.
- `/public/og-default.png` — copy of the icon; replace with a 1200×630 branded card.
- Turnstile needs `NEXT_PUBLIC_TURNSTILE_SITE_KEY` in Vercel (already set for production).

## Not yet built
- Keystatic collections for Weekly Scan and Studies (structure is defined by `ScanEntry` in `site.ts`).
- Per-page Open Graph image generation.

## v2 — restored messaging from the original site (14 Sept 2026)
Carried forward because it is consistent with the foundation and was lost only by omission:
- "What FalconBridge is not" (About; one-line version on the DSS overview) and "We do not make decisions for leaders. We make their thinking sharper."
- Two coaching moments — before research (clarity on the question) and after research (integration) — on the Coaching page and the DSS overview.
- Integration paragraph under the three forces on Home; "clarity cannot be outsourced" line on Home and About.
- Concrete confidentiality statements and "Trust is not a by-product of the work. It is the product." (About → Trust and use).
- No dependency by design (Coaching, About, Working with FalconBridge).
- "We will say so" / "A professional exchange, not a sales discussion." / "What decision are you actually being asked to make?" (Contact, Working with).
- Pace and timing; second-order consequences (Advisory).
- "Research is written to be read by decision-makers, not analysts." (Research).
- ™ applied to FalconBridge Decision Support System™ at first mention per page, in the nav and footer; trademark line in the footer.
- Pricing stays off the site (partner decision).

## v3 — original-site elements restored, Keystatic content layer, launch plumbing (14 Sept 2026)
- Keystatic scaffold (PR #3) folded in and re-pointed: collections `scans` (Weekly Scan) and `studies` (Public studies) under `content/`; editor at `/keystatic`; GitHub-mode env vars per `.env.example`. Scan entries carry an internal `reviewed` checkbox (never rendered) and a `sample` flag. `/insights*` redirects to Research.
- Weekly Scan, scan entries, Studies and the study page now read from `content/` (`src/lib/content.ts`); territory filter on the index; RSS at `/research/weekly-scan/rss.xml`.
- "Request the full report" on each study page, wired to the existing `/api/submit-research` route; per-element downloads appear as URLs are added in Keystatic.
- UAE phone restored in footer and contact. Engagement-environment line on Home and Situations; "clarity they can trust" quote on Research.
- Falcon mark (cropped from the logo) as a faint element in the hero and the invitation tile. No stock photography.
- `sitemap.xml` (all routes + scans + studies) and `robots.txt` (disallows /keystatic and /api).
- Vercel env needed: `NEXT_PUBLIC_SITE_URL`; Keystatic GitHub App vars for production editing; `NEXT_PUBLIC_TURNSTILE_SITE_KEY` on Preview for forms.
- Still to do: Terms of Engagement full rewrite (separate draft); Wayne's portrait; real scan entries; study files.

## v4 — research admin on Supabase (21 Sept 2026)
- Keystatic and `content/` removed. Reports, package files, Weekly Scan entries and site settings live in Supabase Postgres; covers/extracts/portraits in the public `public-media` bucket; PDFs in the private `research-files` bucket, served by signed URL.
- `/admin` (FBP skin): dashboard, Reports (list, add/edit, cover + extract + six package files with open/on-request per file, featured, published), Weekly Scan (list, add/edit, reviewed gate before publish), Site settings (featured report, partner portraits). Sign-in by magic link; access = active row in `admin_users` (seeded: researchteam@falconbp.com). Pattern mirrors the SWTQ admin: server actions, `requireAdmin()` in the layout and re-checked in every action, no middleware gate.
- Uploads go browser → Storage via signed upload URLs (`createUploadTarget`), so large PDFs never pass through Vercel.
- Public: `/research/library` cover grid with territory/type filters; study pages, Weekly Scan, RSS, sitemap and the featured card on Home/Research read from the database. `/research/files/[id]` redirects to a signed URL for open files of published reports.
- Wayne's portrait composited onto a studio charcoal backdrop to match the other two.
- Setup: run `supabase/001_research_admin.sql` in the Supabase SQL editor; add `/auth/callback` on falconbp.com and the preview origin to Supabase Auth redirect URLs; env vars per `.env.example`.
