FBP Weekly Operating Process v1.5
Written 13 October 2026, updated the same day (v1.1 adds the server import job and the scheduled tasks; v1.2 refreshes section 10 after the 08:50 check). v1.3 (21 Oct 2026) adds the study title rule in Task 3 and section 6. v1.4 (3 Nov 2026) brings the doc in line with the scheduled-task prompts: six territories, the 27 Oct source rule (K2 first, email only for territories with no GDRS folder), the week addresses (section 9a) and the week rule. v1.5 (9 Nov 2026) adds the linking rule in section 6. Start any new conversation in this project by reading this file first. It records how the weekly research cycle gets onto falconbp.com, which parts are automated, the rules that cannot be broken and the traps already hit. Appendix A and B hold the two scripts the process depends on.

1. Who does what
Person or system	Role
Quincy (and HT+, his AI aid)	Writes the Weekly Signals (one per territory), the proposed GDRS studies, the studies and the Professional Curiosity pieces. Sends them to Joel by email and files study folders in Dropbox
Joel	Decides. Answers Quincy on proposals, unpublishes anything doubtful, approves anything Claude is blocked from doing
Claude	Reads, sweeps, source-checks, prepares manifests, imports, publishes, verifies and reports. Never sends a message, never signs in, never solves a CAPTCHA
falconbp.com	Imports manifests, publishes, runs the pack follow-up emails by itself
2. The weekly rhythm
Week numbers follow FalconBridge's count. Week 1 started Monday 29 Dec 2025. Week N starts on 2025-12-29 plus 7 x (N-1) days. The review period is the previous Monday to Sunday. The email date decides the week. Week 42: Monday 12 Oct 2026, review period 5 to 11 Oct. Week 44 starts 26 Oct 2026 and Week 45 starts 2 Nov 2026.

Which week (Joel, 3 Nov 2026): the current week is the week that holds today in Dubai time. Everything issued in a week carries that week's number, week_label (2026-WNN), week_of (its Monday) and week address, even though its review period covers the week before. Never put a study at another week's address, and never report last week's addresses as this week's.

Territories (seven, Joel 3 Nov 2026): UAE / GCC (uae-gcc), South Africa (south-africa), Mauritius (mauritius), New Zealand (new-zealand), USA / NC (north-carolina), USA national (usa), Singapore (singapore). Singapore has not issued a Weekly Signal yet. Every run checks for it; the first one is published as issued and reported first. No Singapore week address (placeholder) is made until Joel says so after that first signal: the site leaves Singapore out of PLACEHOLDER_TERRITORIES in src/lib/weekly/placeholders.ts.

Nil editions: a signal headed "NO QUALIFYING SIGNAL" / "NIL EDITION" carries no themes and is not published (Mauritius Week 45). Report it in one line.

Dropped currency (Joel, 3 Nov 2026): where a signal drops the currency from a figure and the same signal, its study or its cited source shows it, add it in the signal's own style (Dhs500,000), say so in the manifest notes and publish. Every other error is still held.

When (Dubai)	What arrives	What Claude does
Monday early morning	Five Weekly Signal emails from researchteam@falconbp.com	Task 1
Monday and Tuesday	Five "Proposed GDRS Research Study" emails from Quincy	Task 2
Wednesday	Five studies in Dropbox K2 folders	Task 3
Wednesday to Friday	Professional Curiosity pieces, number varies	Task 4
Daily	Pack requests and downloads on the site	Task 5
3. Every task, and whether it can be automated
Level A: runs unattended on a schedule now, provided Joel's computer is on with Chrome open and signed in to Zoho and the site admin. Level B: runs on the server with no computer. Level C: stays with Joel.

#	Task	Level
1	Sweep the inbox for the five Weekly Signals, check them, import and publish, verify	A (scheduled). Publishing step also exists as the server job (B) once a manifest is in Dropbox
2	Read the five Proposed GDRS Research Study emails, issue a verdict per region once all five are in	A
3	Studies: read the five K2 folders, build the manifest, import and publish, link each study to its signal	A (needs Dropbox approvals set to automatic)
4	Pieces: sweep current-week K2 folders, import as issued, link to the study, date to the study	A
5	Pack requests: watch the admin Pack requests page, flag failed or overdue follow-ups, summarise new leads	A
6	Restore unread state on every email opened	A (part of every task)
7	Coverage and cross-reference audit (admin Coverage and Cross-references pages)	A, weekly
8	Site health crawl: status codes, canonical tags, structured data, sitemap, unique titles	A, weekly
9	Website-ops mail sweep (Sentry, Stripe, Vercel, Supabase, Resend notices) with actions for Joel flagged	A, daily
10	Defect note for Quincy when the sweep finds a fault at source (draft only, Joel sends)	A
11	Process document and memory upkeep	A
12	Follow-up email three business days after first download	Already automatic on the server
13	Featured study rotation	Already automatic (daily, 12 most recent studies)
14	Joel's replies to Quincy on proposals	C
15	Unpublish decisions, anything held for an error or a query	C
16	Site design or code changes (pull request, check, merge)	Claude does it on request, so C for the decision
17	Credentials, sign-ins, CAPTCHAs, sending any message, financial actions	C always
4. The runbook
Source of truth (Joel, 14 and 27 Oct 2026): the Dropbox folder K2. RaaS Engagements is the first source. A K2 folder exists only when Quincy runs a GDRS study for a territory that week. A territory with no GDRS study has no folder, and its Weekly Signal and any Professional Curiosity piece arrive only by email: after the K2 sweep, open Zoho (Inbox, from the current week's Monday) for those territories only, take the latest "FalconBridge Weekly Signal" copy, ignore "Scan Audit Companion" emails, read any Fwd or Re from Quincy or Wayne for holds, and restore unread on every email opened. Find K2 work by listing K2 folders modified in the last 3 days and comparing what is in them with what is live. In each K2 folder: the Weekly Signal is "1. FalconBridge Weekly Signal ... [Week#NN-2026].pdf" in A. Work Done (read with the Dropbox fetch tool, then the Appendix B parser, which accepts untagged lines); the proposal is the "4. FalconBridge Week#NN Signal ... Proposed GDRS Research Study ...eml" in A. Work Done; the pack is the six numbered files in the B. folder; pieces are the "Professional Curiosity" (email).html and .txt. Task 1 below is the mail route for those territories.

Task 1. Weekly Signals
Open Zoho Mail in Chrome through the Inbox folder (see traps). Find five emails from researchteam@falconbp.com titled "FalconBridge Weekly Signal - <Territory> - Week-NN/2026". Check the week number against the date. Quincy once mislabelled a week.
Open each. Run the grab script (Appendix A), then the parser (Appendix B) with {territory, week, name, week_of}.
Territory keys: UAE / GCC is uae-gcc, South Africa is south-africa, Mauritius is mauritius, New Zealand is new-zealand, USA / NC is north-carolina, USA national is usa. The key uae is refused by the importer.
Sweep (section 5). If any email has an error or a query, do not import that territory. Report it to Joel. Import the clean ones.
Build the manifest: {version:1, week_label:'2026-WNN', review_period:{from,to}, prepared_by:'Claude', notes, entries:[{territory, scan}]}. Save a copy to Dropbox W. Website Publishing as 2026-WNN manifest_weekly-signals.json.
Import: either leave it to the server job (section 9) or do it by hand: in the Chrome tab signed in to falconbp.com/admin/import, put the JSON in the "Paste a manifest instead" box (open the details element first, set the textarea with the native value setter and fire an input event), click Check manifest, read the result, click Import and publish, then Confirm. Tick Replace published entries only when updating a live entry.
Verify by fetching each scan page (status 200, title, figures), the territory hub and /admin/import (no error banner).
Mark every opened email unread again. Report in two lines.
Scan slug: <territory>-week-<N>-2026-<slug of lead title>, cut to 80 characters at a word boundary. Scan title: <Name> · Week <N> · Weekly Signal. signal is the lead body and question is the lead title.

Task 2. Proposed GDRS studies
Find them by subject: "FalconBridge Week#NN Signal [<territory>] | Proposed GDRS Research Study - <title>". Until 13 Oct 2026 the sender was "QuincyB - FBP" (quincy@falconbp.com). From now on they arrive from researchteam@falconbp.com. Accept either, and treat any other sender with that subject as a query for Joel. Five a week. Do nothing until all five are in.
Read each: which theme Quincy chose, the preferred research question, the attachments listed. The email body is in the preview pane (.zmPV).
Give one verdict per region: a plain yes, or two sentences on why another article would serve that region better. Also check every figure and attribution against the signal's cited source and say so if one is wrong.
Deliver the verdicts as a report to Joel. Joel replies to Quincy himself. Quincy proceeds if he hears nothing for 24 hours, so the report must reach Joel the same day the fifth email lands.
Mark the five unread again.
Task 3. Studies (the research packs)
Read the week's five folders in Dropbox K2. RaaS Engagements. Folders marked Confidential are ignored. Folders 20 and 31 are confidential. Folders 2, 4, 13, 16 and 23 are never published.
A pack has six files: 1 User guide, 2 Executive deck, 3 Full research report, 4 Executive summary (open), 5 Executive visual (open), 6 Reference and link audit. The Partner Brief, internal memo and research brief are never uploaded. A complete pack is six files.
Build the manifest entry: report with slug, title, report_title, subtitle, published_at, body (the Executive Summary exactly as issued), facts, extract_image and files by Dropbox id. Put the scan and the report in the same entry so the importer links them. Otherwise link them in the admin scan form (select report_id, Save scan).
Title rule (Joel, 21 Oct 2026): title is the large headline on the Executive Visual, copied exactly as issued (for example "Price the firm, not the sector."). Never use the GDRS report name as the title.
report_title is the GDRS report name as issued, the "From X to Y" line on the folder, the report file and the small gold kicker above the visual headline (for example "From Exposure to Resilience"). The site shows it as a small label on the study page.
subtitle is Quincy's descriptive line (the bracket text in the folder name, or the line he gives), as issued. If it repeats the visual headline, use the standfirst under the headline on the visual instead, as issued (done for North Carolina W43 on 21 Oct 2026).
If a visual has no headline, use the report name as the title and flag the study to Joel.
Slug: from Week 44 onward the study's report.slug is the week address, 2026-week-NN-<territory key> (section 9a), never a slug built from the report name. Studies from Week 43 and earlier keep their slugs. Never change a slug once shared.
Sweep, import, verify, then run the Cross-references page and confirm no problem is listed.
Studies are published as issued. Never rewrite, trim or summarise.
Task 4. Professional Curiosity pieces
Sweep only the current week's K2 folders for new pieces. Do not rely on the "Done*" marker, and do not wait for an email: Quincy sometimes files pieces without sending them. A piece is two files, "FalconBridge - Professional Curiosity - <name>.txt" and "<same> (email).html", either loose in the folder or in a subfolder such as "15. Article". Where two copies exist, use the newest.
Build a piece manifest (format professional-curiosity-v1) from the (email).html, wording exactly as issued; the .txt is flattened and loses the layout. Leave out the email wrapper, the logo, the covering note and the sign-off lines. Layout mapping: H1 is the headline and its span is headline_accent; the Calibri 13px grey line is byline; the 21px Cambria line is lead; the 13.5px grey box is note; 30px figures with their labels are stats (the white one is highlight) and the 11.5px line under them is the caption; H2 is heading; the 15px boxes are callouts (drop the "1 ·" from the title); the white 17px rows are questions; <strong> becomes **bold**. description is the email preheader. Slug is the first sentence of the headline. Fetch the HTML in the falconbp.com tab from a Dropbox temporary download link and parse it there, so no wording is retyped.
Date the piece to the study it draws on, not to the upload day. Link it to the study behind it. Never change a slug once shared.
Import, verify, then check the study page shows the link to the piece.
Task 5. Pack requests
Open /admin/requests (Pack requests). Flag any request without a sent follow-up that is past its due day, any failed send and any new lead worth a call. Follow-up rule: three business days (Dubai, Monday to Friday) after first download. Monday goes to Thursday, Tuesday to Friday, Wednesday to Monday, Thursday to Tuesday, Friday to Wednesday. A weekend download counts from Monday.

5. The sweep (standing rule, 12 Oct 2026)
Scan every signal and report before publishing. Do not publish anything with an error or an open query. Hold it and report to Joel.

The sweep has two parts.

Mechanical checks on the extracted text: dropped currency symbols (a figure like ".2tn", "00,000" or "(62 billion)"), the pattern $ followed by a non-digit, placeholders (TBD, TODO, ??, lorem), mojibake, template leftovers (Theme 1:, LEAD TOPIC), stray double spaces or spaces before punctuation, an empty title or body, a theme count other than three, a missing lead, watch or audit log. The server job runs a code version of these (src/lib/weekly/sweep.ts).

Source-check, because the mechanical part cannot catch a wrong fact: for every figure and every attribution in the signal, open the cited source and confirm it. Example from 12 Oct: the UAE signal credited Morgan Stanley with a $1.2tn figure that the National attributes to Fitch. Quincy has since taken the UAE-GCC Week 42 signal down for rework and plans a verification stage in the engine. The source-check always happens before a manifest is saved to Dropbox, because the server job publishes whatever clean manifest it finds.

6. Standing rules
Content

Signals and reports are published exactly as issued. Only the email wrapper is removed (sender and recipient lines, internal-use footer, credit lines, phone numbers). Pieces keep their wording exactly.
Study titles (21 Oct 2026): the title on the site is the Executive Visual headline as issued. The GDRS "From X to Y" report name is a small label only (report_title), never the card or page title. See Task 3 step 3.
Writing style, everywhere, all the time: no Oxford commas and no em dashes in anything Claude writes, including emails and site copy. Published research stays as issued.
Website only. No social media.
Never publish folders 2, 4, 13, 16 or 23. Folders 20 and 31 are confidential and never appear on the site. Anything marked Confidential in Dropbox is never published. Hold anything that looks commissioned but is unmarked.
Territories: Global is hidden. USA is available. Singapore stays. Folder 50 and the private equity piece sit under North Carolina. Folders 46 and 47 sit under USA.
Jessica must not appear on the home page or contact page. She appears on About only. Social media and leads go to info@ and the partners.
Joel's title is "Co-Founder & Managing Partner (EMEA)", short form "Managing Partner (EMEA)". Quincy stays "Co-Founder & Managing Partner · Global".
Never call any location a "branch" in public copy.
Linking (CJ, 9 Nov 2026): every Weekly Signal links to its GDRS research pack, and the pack to its Professional Curiosity piece, wherever they exist; the publish runs check this on every import. A signal holds one study link, so when a week has two studies the signal links to the one its text is about and the other stands alone.
Handling

Claude never handles credentials, never signs in, never completes a CAPTCHA or Turnstile, never sends a message. It drafts only.
K2 in Dropbox is the first source (14 and 27 Oct 2026). The mailbox is used only for territories with no GDRS folder that week (section 4). It is read-only and every email opened is marked unread again.
A file marked CONFIDENTIAL, HOLD or "Not for Publication" holds its whole territory for that week.
Dropbox writes and deletes go through approval prompts. State exactly what changed.
An admin save that the auto-mode classifier blocks needs Joel's explicit "do it".
Joel wants to be told, not asked. For setup steps he wants one simple step at a time.
7. Tools and where things live
Site: falconbp.com. Admin: /admin (import at /admin/import, Coverage at /admin/coverage, Cross-references at /admin/coverage/links, Pack requests at /admin/requests). Joel signs in. Claude works in his signed-in Chrome.
Repo: falconbridgepartners-maker/falconbridgepartners, branch main, Next.js 14 and Supabase, deployed by Vercel on merge. Change route: branch, commit, push, pull request through gh api, wait for checks, merge, confirm production. Commit trailers per the session reminder. Merging is blocked for Claude by the auto-mode classifier; Joel merges.
Repo docs: docs/WEEKLY_PIPELINE.md holds the manifest format, file slots, validators and the import job (src/lib/weekly/manifest.ts, src/lib/pieces.ts, src/lib/weekly/sweep.ts).
Dropbox: shared folder W. Website Publishing (path ns:13180523041//W. Website Publishing/) for manifests, K2. RaaS Engagements for the study folders. The site reads Dropbox through its own read-only app.
Mail: Zoho Mail for joel@falconbp.com, read through Chrome. Inbox goes back to 1 Oct 2026. Older mail is in the Archive folder. Ops notices (Sentry and the like) land in the Notification folder, which has a numeric URL; open it from the sidebar.
Project memory and this document live in the claude.ai Project "FalconBridge Partners Website".
8. Traps already hit
The shell cannot reach falconbp.com, Supabase storage or Dropbox links. Use JavaScript fetch inside a Chrome tab (same origin on falconbp.com).
To read an Executive Visual headline, show the image in the falconbp.com tab (a div with the public-media image as background, offset to the top) and take a screenshot.
The JavaScript tool truncates output at about 1,000 characters and blocks cookie-like strings. Read long text in slices.
A tab can navigate mid-script. Avoid long waits across a navigation.
The importer only accepts the territory keys in section 4. The first attempt with uae failed.
The paste box sits inside a collapsed details element. Open it, then set the value.
Zoho can drop you in the Spam folder after a navigation. Click Inbox.
Zoho folder URLs by name (for example #mail/folder/notification) silently show Spam. Use the sidebar.
Navigating a Zoho tab to falconbp.com can lag a few seconds before it lands. Read the tab again before concluding it failed.
The Chrome extension disconnects now and then. Run tabs_context_mcp and open a fresh tab. Never reuse old tab ids.
JSX attribute strings do not process escapes. Write real characters, not ™.
Unpublished pages return 404 by design.
A scheduled task that fires while Joel's Mac is asleep or the Claude app is closed switches itself off ("device absent"). The 14:10 task did this on 13 Oct and was switched back on. If a run is missing, check the task is still enabled.
Study pages live at /research/studies/<slug>, pieces at /research/professional-curiosity/<slug>.
Quincy's emails once carried the wrong week number. Check against the date.
Week label parsing: 2026-W42 must be read from the W, not the first digits.
Re-importing a live study with Replace ticked also sets its week label to the manifest's week, so group studies by week, one manifest per week.
Week address still "on its way" after the study was imported (W45 USA and South Africa, 2 Nov 2026): when the manifest's report slug was the week address itself, the importer took the placeholder for a published study and never cleared its placeholder flag. Fixed in PR #59. Until that is merged, and as a fallback after: open the study in /admin/reports and press Save report once. With a pack file set to "request" that ends the placeholder and sends the pack to anyone who reserved.
9. Automation as built (13 Oct 2026)
Server job. /api/cron/weekly-import runs daily at 04:00 and 10:00 UTC (08:00 and 14:00 Dubai) from vercel.json. It lists the Dropbox publishing folder, takes any manifest file modified in the last 30 days that it has not handled, sweeps each entry and publishes the clean ones that are new to the site. Anything already on the site, live or taken down, is left alone, so an unpublished page is never put back. An entry with a sweep finding is held and listed in the response. A manifest revision counts as handled once no entry failed (logged in import_log with source auto:<file id>@<rev>); saving a new revision makes it eligible again. It needs CRON_SECRET in Vercel (set 13 Oct 2026). Add ?dry=1 to report without publishing. First dry run on 13 Oct read 42 manifests and left every entry alone.

Calling it by hand (Joel, in Terminal): curl -s -H "Authorization: Bearer <CRON_SECRET>" "https://falconbp.com/api/cron/weekly-import?dry=1". Claude never holds the secret.

Scheduled tasks. Two tasks run Monday to Friday at 08:10 and 14:10 Dubai time (ids trig_01Jcy616CFQ4vCJrRQUwMWkj and trig_018JLAJSk7MC8673L4MMeBNp). They run in a fresh session on Joel's computer, read this document, work from K2 folders changed in the last 3 days and, for territories with no GDRS folder that week, from the mailbox (section 4), do only what is not yet live, hold anything with an error or query and finish with a report that arrives as a phone and email notification. The 14:10 task also runs the Friday audit (tasks 7 and 8). The 08:10 task starts ten minutes after the server job so it can see what the job did.

Email to Jessica. After every publish run (weekly signals, research packs, opinion pieces) the site emails jessica@falconbp.com one message per kind with the new pages: title, territory, slug and link, so she can use them in her posts. It goes from Joel Arcus joel@falconbp.com if the mail service accepts that address, otherwise from the site address with replies to Joel. The site sends it, not Claude: the import screen status line says "Email sent to Jessica" or "Email to Jessica not sent" and the scheduled tasks report which. The status line shows only straight after a run; reloading /admin/import later does not show it. Each page is announced once and only pages created in the last 10 days count. Joel is copied (cc joel@falconbp.com) on every one from 13 Oct 2026 (PR #49), so he sees each one arrive in his own inbox. These emails go through Resend, so they do not appear in Zoho Sent; the Resend dashboard (Emails) is the delivery record. Built 13 Oct 2026 (PR #47).

Gates built in. A signal, study or piece that fails the sweep is held and reported, never published. The five proposals are reported only when all five are in. Anything touching a confidential folder is skipped.

What still depends on Joel's computer: using the admin needs his signed-in Chrome, so the Mac must be awake with Chrome open at 08:10 and 14:10. Dropbox writes and some admin saves ask for approval, so the tasks need "Automatically approve" in their settings.

Further step to remove the computer: either Quincy's pipeline writes manifests straight to Dropbox, or the site reads the mailbox itself over IMAP with an app password that Joel places in Vercel. The source-check stays with Claude.

9a. Week addresses (the GDRS funnel, 29 Oct 2026, PRs #56, #57 and #59)
Every Monday at 09:00 Dubai (/api/cron/weekly-placeholders) the site makes one placeholder study page per territory at /research/studies/2026-week-NN-<territory key>, links it to that week's Weekly Signal and emails Jessica the six addresses. Claude never makes these pages and never emails Jessica.
A placeholder page says "The <Territory> study for Week NN, 2026 is on its way" and takes a reader's name and email (a reservation). Placeholders never show in the library, the sitemap or "other studies".
When a study lands, put it in the manifest with report.slug set to the week address. The importer takes the placeholder row over (same id, same address), publishes the study and sends the pack to every reservation. Verify the public page no longer says "on its way".
A placeholder with no pack when its week is over (the Monday after, Dubai time) is closed by the daily job (/api/cron/pack-follow-up, 09:00 Dubai) as "No study for <Territory> this week", and each reservation is told once. Before PR #59 this was ten days after the row was made. A week address still "on its way" mid-week with no GDRS folder is expected, not a fault.
Readers waiting on a placeholder show on /admin/requests under "Waiting for a pack to land". The section only appears when someone is waiting.
10. Open items at 3 Nov 2026
PR #59 (placeholder takeover and week-end closing) is open for Joel to merge. Once merged, the next 09:00 Dubai daily job closes the Week 44 addresses for UAE / GCC, South Africa and New Zealand as "no study this week" (no study was run for them in Week 44).
W45 USA ("AI capex is funded by capital markets, not by payroll") and W45 South Africa ("The risk to Durban is a carrier decision...") were live in admin but their public pages still said "on its way". Fixed on 3 Nov by Save report in admin. No one had reserved, so no email went out.
W44 Mauritius, USA and North Carolina scans keep week_of 2026-10-19 (Joel's call, 27 Oct). Labels come from week_label, so the site shows them as Week 44.
UAE / GCC Week 45 published 3 Nov 2026 at Joel's instruction with "Dhs" added to the CEO's 500,000 penalty: signal, study at 2026-week-45-uae-gcc ("The UAE holds individuals to account at the gate, not by the map", folder 81) and the piece "The UAE holds senior bankers to account...". The importer took the placeholder over correctly (PR #59). Jessica was emailed.
Mauritius Week 45: nil edition, not published.
Pack requests: John Keane's W41 Allocator Evidence Gap follow-up has shown as due since 13 Oct. New request from Ashwani Kumar Baweja (ETC Group, Global Corporate Finance Head) on 1 Nov for the W39 study, not yet opened.
Singapore: seventh region from 3 Nov 2026. Waiting for its first Weekly Signal; no week address until Joel says so.
10b. Open items at 21 Oct 2026
Study titles (21 Oct 2026): the 13 studies titled "From X to Y" (W38 UAE / GCC and North Carolina; W41 New Zealand, North Carolina, Mauritius; W42 North Carolina, South Africa, New Zealand, Mauritius; W43 North Carolina, New Zealand, UAE / GCC, South Africa) were retitled with their Executive Visual headlines through /admin/import (Replace ticked, one manifest per week). Slugs unchanged. PR #52 adds the report_title label; after Joel merges it he runs supabase/011_report_title.sql in the Supabase SQL editor, which adds the column and fills it for those 13. Until the SQL is run, leave report_title out of manifests.
PRs #50 (USA territory) and #51 (Professional Curiosity week filter and Email this piece) were open on 21 Oct, waiting for Joel to merge.
10a. Open items at 14 Oct 2026, 13:45 Dubai
UAE-GCC Week 42 signal is still a draft on the site (import screen: "scan: draft exists"). No reissue has arrived. The UAE-GCC study email arrived Monday 22:48 from QuincyB, subject marked "Not for Publication Until Further VERIFIED". Folder 63 also holds a CONFIDENTIAL "W42 UAE-GCC Scan Hold" note. Hold both. Publish signal and study together only once Quincy reissues them as verified, after the sweep and source-check.
South Africa Week 42: the El Niño maize piece is live and linked to its study, so the South Africa study has been published since 13 Oct (not by this session).
14 Oct 2026: W42 Professional Curiosity pieces published for USA / NC ("Power has not replaced land in North Carolina"), Mauritius ("Africa's new rating agency has launched") and New Zealand ("Public data can show New Zealand's youth jobs problem"), from K2 folders 66, 64 and 65, pasted into the importer. Each dated 13 Oct 2026 to its study and linked both ways. The site reported "Email sent to Jessica: 3 pieces". No Dropbox copy of that manifest was saved; the import log holds it. UAE-GCC piece outstanding with the rest of UAE-GCC Week 42.
13 Oct 2026: W42 research packs live for USA / NC (folder 66), Mauritius (64) and New Zealand (65) from 2026-W42 manifest_studies.json. That manifest correctly leaves out UAE and South Africa.
2026-W42 manifest_weekly-signals.json still contains the UAE-GCC entry. The server job leaves it alone because a draft already exists. Do not tick Replace on that manifest.
Week 42 proposals reviewed: UAE, North Carolina, South Africa and Mauritius agreed. New Zealand not agreed (see the verdict sent to Joel on 12 Oct).
Existing W42 audit logs in the database still hold the email footer lines. The page now hides them. Re-importing with Replace would clean the stored copy if wanted.
Jessica emails: closed 13 Oct 09:11. Joel checked the Resend dashboard: Resend works and the email was sent. From the next publish run Joel's cc copy in his inbox is the routine confirmation.
Scheduled tasks: both have automatic approval. The 08:10 run on 13 Oct completed (04:11 to 04:13 UTC); it found nothing new after the morning's pack publish.
Pack requests: John Keane (AscensionU) is the one real outside lead, with two packs (Can South Africa Break 3% Growth? and The Allocator Evidence Gap). His Allocator follow-up is due today, 13 Oct. Check tomorrow that it shows as sent. The 11 Oct batch sent three follow-ups on a Sunday, one of them two days early and one two days late; watch that the daily job keeps to the three-business-day rule from now on.
Ops mail: nothing new since the Sentry weekly report of Sat 10 Oct. No action needed.
Appendix A. Grab script (run in the Zoho tab with a signal email open)
Returns the email body as lines tagged P, LI or H, one per paragraph. Store the result as window.__cur = {id, subject, text}.

js
window.__grab = () => {
  const wraps=[...document.querySelectorAll('div[class*="wrapper"]')].filter(d=>/Top 3|Lead Topic|LEAD TOPIC/i.test(d.innerText||''));
  const root = wraps.sort((a,b)=>b.innerText.length-a.innerText.length)[0];
  if (!root) return null;
  const BLOCK = new Set(['P','H1','H2','H3','H4','H5','H6','LI','TD','TH','DIV','SECTION','ARTICLE','BLOCKQUOTE','TR','TABLE','UL','OL','BR']);
  const lines=[];
  const inline = (el) => { let out=''; for (const n of el.childNodes) { if (n.nodeType===3) out+=n.textContent; else if (n.nodeType===1) { const t=n.tagName; if (t==='BR') out+='\n'; else if (BLOCK.has(t)) continue; else { const inner=inline(n); const bold=(t==='STRONG'||t==='B'||/font-weight:\s*(bold|[6-9]00)/i.test(n.getAttribute('style')||'')); out += bold && inner.trim() ? '**'+inner+'**' : inner; } } } return out; };
  const walk = (el) => { const kids=[...el.children]; const hasBlock=kids.some(k=>BLOCK.has(k.tagName) && k.tagName!=='BR'); if (!hasBlock) { const tag = el.tagName==='LI'?'LI':/^H\d$/.test(el.tagName)?el.tagName:'P'; for (const part of inline(el).split('\n')) { const t=part.replace(/\s+/g,' ').trim(); if (t) lines.push(tag+'|'+t); } return; } for (const k of kids) walk(k); };
  walk(root);
  return lines.join('\n');
};
Appendix B. Parser (run in the same tab, then call window.__parseSignal(window.__cur, {territory, week, name, week_of}))
Returns {territory, scan, head}. scan is the manifest scan object, with content in weekly-signal-v1 format. Check themes (3), lead, watch and audit_log before using it. A lead whose title and body run together is the usual failure.

js
window.__parseSignal = (cur, meta) => {
  const plain = (s) => s.replace(/\*\*(.+?)\*\*/g, '$1').replace(/(^|[^*])\*([^*]+?)\*/g, '$1$2').replace(/[ \t]+/g, ' ').trim();
  const raw = [];
  for (const l of cur.text.split('\n')) { const i = l.indexOf('|'); const ok = i > 0 && i < 8 && /^[A-Z0-9~]+$/.test(l.slice(0, i)); const tag = ok ? l.slice(0, i) : 'X'; const text = ok ? l.slice(i + 1) : l; const p = plain(text); if (p && !/^(STRICTLY FOR INTERNAL USE|Report: |Generated: )/i.test(p)) raw.push({ tag, text: p }); }
  const out = { format: 'weekly-signal-v1', heading: '', themes: [], audit_log: [] };
  const bare = (t) => t.replace(/^[^A-Za-z0-9]+/, '').replace(/^\d+\.\s*/, '');
  const marker = (t) => { const b = bare(t); if (/^Top 3 [\w &]*Themes/i.test(b)) return ['themes', '']; let m = b.match(/^Lead (?:\w+ )?Topic:?\s*(.*)$/i); if (m) return ['lead', m[1]]; m = b.match(/^One to Watch(?: \([^)]*\))?:?\s*(.*)$/i); if (m) return ['watch', m[1]]; if (/^Article Audit Log/i.test(b)) return ['log', '']; return null; };
  const isLens = (t) => /^FalconBridge Lens/i.test(t);
  const isSrc = (t) => /^(Sources?|Primary sources?):/i.test(t);
  let section = 'head', theme = null, lead = null, mode = 'body', pendingTitle = false;
  const watch = [], head = [];
  const feed = (item, t) => {
    if (isLens(t)) { mode = 'lens'; const rest = t.replace(/^FalconBridge Lens:?\s*/i, ''); if (rest) item.lens.push(rest); return; }
    if (isSrc(t)) { item.sources = (item.sources ? item.sources + ' ' : '') + t; return; }
    (mode === 'lens' ? item.lens : item.body).push(t);
  };
  const finish = (item) => item && ({ title: item.title, body: item.body.join('\n\n'), ...(item.lens.length ? { lens: item.lens.join('\n\n') } : {}), ...(item.sources ? { sources: item.sources } : {}) });
  for (const { tag, text: t } of raw) {
    const m = marker(t);
    if (m) {
      section = m[0]; mode = 'body';
      if (section === 'lead' && m[1]) { lead = { title: m[1], body: [], lens: [] }; }
      if (section === 'watch' && m[1] && !/^ONE TO WATCH$/i.test(m[1])) watch.push(m[1]);
      continue;
    }
    if (section === 'head') { head.push(t); continue; }
    if (section === 'themes') {
      const numbered = /^\d+\.\s/.test(t) || /^Theme \d+:/i.test(t) || /^[1-9]️?⃣$/.test(t);
      const fresh = !theme || (mode === 'lens' && theme.lens.length > 0 && !isLens(t) && !isSrc(t) && t.length < 160);
      if (numbered || fresh) {
        if (theme) out.themes.push(finish(theme));
        const title = t.replace(/^\d+\.\s*/, '').replace(/^Theme \d+:\s*/i, '').replace(/^[1-9]️?⃣$/, '');
        theme = { title, body: [], lens: [] }; mode = 'body'; pendingTitle = !title; continue;
      }
      if (pendingTitle) { theme.title = t; pendingTitle = false; continue; }
      feed(theme, t); continue;
    }
    if (section === 'lead') {
      if (/^LEAD TOPIC$/i.test(t)) continue;
      if (!lead) { lead = { title: t.replace(/^Theme \d+:\s*/i, ''), body: [], lens: [] }; mode = 'body'; continue; }
      feed(lead, t); continue;
    }
    if (section === 'watch') { if (!/^(ONE TO WATCH|Emerging Theme)/i.test(t)) watch.push(t); continue; }
    if (section === 'log') { if (tag === 'LI' || t.length > 10) out.audit_log.push(t); }
  }
  if (theme) out.themes.push(finish(theme));
  if (lead) out.lead = finish(lead);
  if (watch.length) out.watch = watch.join('\n\n');
  if (!out.audit_log.length) delete out.audit_log;
  for (const h of head) {
    if (/^WEEK ?#?\s*\d+/i.test(h) && !out.issue) out.issue = h;
    else if (/Weekly Signal/i.test(h) && !out.heading) out.heading = h;
    else if (/^Review Period:?/i.test(h)) out.review_period = h.replace(/^Review Period:?\s*/i, '');
    else if (/^Intelligence briefing for/i.test(h)) out.briefing = h;
    else if (/[•|—]/.test(h) && /Week/i.test(h) && !out.issue) out.issue = h;
    else if (/^Week-?\s?\d+/i.test(h) && !out.issue) out.issue = h;
  }
  if (!out.heading) out.heading = 'FalconBridge Weekly Signal';
  const slugify = (s) => s.toLowerCase().replace(/[’'"]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const leadTitle = out.lead ? out.lead.title : out.themes[0].title;
  let slug = `${meta.territory}-week-${meta.week}-2026-${slugify(leadTitle)}`;
  if (slug.length > 80) slug = slug.slice(0, 80).replace(/-+$/, '').replace(/-[a-z0-9]*$/, '');
  const scan = { slug, title: `${meta.name} · Week ${meta.week} · Weekly Signal`, service: 'raas', week_of: meta.week_of, signal: out.lead ? out.lead.body : out.themes[0].body, question: leadTitle, content: out };
  return { territory: meta.territory, scan, head };
};
'parser2 ready';
