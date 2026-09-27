# gaps-2

## Summary

This sheet closes three coverage gaps flagged by a coverage critic against the other fact sheets: (1) the provenance
of `DU_programowej_2024.pdf`, the 3.46 MB Polish core-curriculum regulation PDF sitting at the team repo root, and
its traceable link to the `data_synthetic/curriculum/podstawa_<epoch>.txt` files used as the template for all
`data_synthetic` tasks; (2) the correct date of the `history_v2` H100 technical smoke test, where two other sheets
gave conflicting labels ("26.09" vs "27.09"); (3) the correct current contributor commit-count leaderboard, where
two other sheets captured `git shortlog -sn --all` at different points in the repo's history and neither flagged
the discrepancy. All three are now resolved with primary-source evidence (the PDF's own text, git commit ancestry,
and a fresh `git shortlog` run against the current repo). None of this required any file to be modified — all
checks were read-only PDF text extraction (`pdftotext`/`pdfinfo`, local, no network) and non-mutating git commands
(`log`, `show`, `shortlog`, `merge-base`, `rev-list`). Materiality: item 1 is a real gap (no sheet names the file or
proves the "cut from Annex 3" claim); items 2 and 3 are presentation-hygiene fixes — the correct number was already
derivable, but a deck built naively from the older sheet would show a stale/contradictory figure next to other slides.

## Timeline

- **25.09.2026 23:05 +0200** — `endote` commit `a045a254` "gotowe jsonl z PDF" adds `DU_programowej_2024.pdf` (Bin
  0 -> 3,463,804 bytes) at the repo root, alongside the first working extractor, `output/questions.jsonl` and the
  33-exam corpus. The PDF is not referenced anywhere in that commit's own `README.md` (84 new lines) — it lands as
  an unexplained root-level file at this point. *(source: `git show --stat a045a254`, `git log -1 --format=... a045a254`)*
- **26.09.2026 07:13 +0200** — `JulianVolodia` (co-authored by Claude Opus 5.5) commit `8b0f43be` "Add
  data_synthetic: curriculum per epoch, essay rubric template, pilot tasks" adds `data_synthetic/README.md` and the
  six `curriculum/podstawa_<epoch>.txt` files, plus the essay-rubric template and the first (unverified) pilot
  batch of 438 tasks across 6 epochs. `data_synthetic/README.md` line 15 states explicitly: `curriculum/podstawa_<epoch>.txt`
  = "The detailed requirements for each epoch, cut from `DU_programowej_2024.pdf` (Annex 3, history)" — this is the
  first and only place in the repo that names `DU_programowej_2024.pdf` as a source. *(source: `git show --stat
  8b0f43be`, `data_synthetic/README.md:15`)*
- **(this session, read-only verification)** — `pdftotext`/`pdfinfo` on the file confirm the README's claim
  word-for-word (see Components below): the PDF is *Dziennik Ustaw* 2024, poz. 1019 ("ROZPORZĄDZENIE MINISTRA
  EDUKACJI z dnia 28 czerwca 2024 r. zmieniające rozporządzenie w sprawie podstawy programowej..."), its
  `Załącznik nr 3` (PDF pages 466–514 of 524) is titled "PODSTAWA PROGRAMOWA KSZTAŁCENIA OGÓLNEGO W ZAKRESIE
  PRZEDMIOTÓW: HISTORIA I WIEDZA O SPOŁECZEŃSTWIE...", and its "II. Pradzieje i historia starożytnego Wschodu"
  section contains the exact sentence "porównuje uwarunkowania geograficzne rozwoju cywilizacji na Bliskim
  Wschodzie" that opens `data_synthetic/curriculum/podstawa_starozytnosc.txt`.
- **27.09.2026 03:16 +0200** — `endote` commit `87283d60` "commit eb3283bc fix" lands `docs/history-v2-h100-smoke-2026-09-27.md`
  (68 lines) and `output/history-v2-h100-smoke-2026-09-27/` (summary.json, raw logs, evidence tarball) — the H100
  LoRA technical smoke test. Both paths' names, and this commit's own timestamp, say 27.09; the smoke test itself
  ran that same day. *(source: `git show --stat 87283d60`, `git log -1 --format=... 87283d60`)*
- **27.09.2026 10:46:44 +0200** — `JulianVolodia` commit `9ed0effa` is `main`'s HEAD at the moment
  `git-history-team-context.md` was written (its own line 14/169); `git shortlog -sn --all` at that point gives
  135 commits on `main` and the per-author counts reproduced below.
- **26.09.2026 21:10 – 27.09.2026 09:58 +0200** — `Pawel Cyrta`'s 7 "postrain machine 1/2" commits
  (`eb8abedc`, `05e11d36`, `0ac9f463`, `baa2a078`, `16af30c9`, `7b501fdd`, `606ee08a`) — author timestamps earlier
  than `9ed0effa`'s, but merged into `main` **after** it (`git merge-base --is-ancestor 9ed0effa 606ee08a` → yes;
  the reverse → no), so they were absent from `main` at `9ed0effa` and are present at the current HEAD.
- **27.09.2026 11:01:04 +0200** — `Szymon Hajderek` commit `89a488ad` "bench: matura-imagerag default harness,
  gemma SFT vision r32 and Qwen3.8 configs" — the tip of `remotes/origin/oldgoodtimes`, confirmed **not** an
  ancestor of `9ed0effa` and **not** an ancestor of `main` (still unmerged as of this session). It is the one
  extra "Szymon Hajderek" (with-space identity) commit that appears in `git shortlog -sn --all` but not in a
  `main`-only shortlog.
- **(this session)** current repo HEAD/`main` = `6d8d52d7` (142 commits on `main`, 146 across `git rev-list --all`),
  unchanged from when `agentic-workflow.md` was written — confirmed by re-running `git shortlog -sn --all` and
  `git shortlog -sn main` fresh.

## Key numbers

| Label | Value | Source |
|---|---|---|
| `DU_programowej_2024.pdf` size | 3,463,804 bytes (3.46 MB), 524 pages, A4 | `ls -la`, `pdfinfo DU_programowej_2024.pdf` |
| PDF identity | *Dziennik Ustaw RP*, Warszawa 10 lipca 2024, **Poz. 1019** — rozporządzenie Ministra Edukacji z 28.06.2024 zmieniające podstawę programową (liceum/technikum/branżowa II st.) | `pdftotext -f 1 -l 3 DU_programowej_2024.pdf` |
| PDF metadata (`pdfinfo`) | Title "akty prawne do ISAP-u-x kad", Author "autorem jest J.A. Maricz", Created 11.07.2024 10:09:58 CEST | `pdfinfo DU_programowej_2024.pdf` |
| Annex used by `data_synthetic` | `Załącznik nr 3` — "PODSTAWA PROGRAMOWA KSZTAŁCENIA OGÓLNEGO W ZAKRESIE PRZEDMIOTÓW: HISTORIA I WIEDZA O SPOŁECZEŃSTWIE...", PDF pages 466–514 of 524 (Dziennik Ustaw's own running page numbers "466"–"514") | `pdftotext -f <p> -l <p>` sweep for `^Załącznik nr 3$` / `^Załącznik nr 4$` |
| `curriculum/podstawa_<epoch>.txt` sizes | starozytnosc 77 lines, sredniowiecze 170, nowozytnosc 278, xix_wiek 198, 1914_1945 378, po_1945 266 (1,367 lines total) | `wc -l data_synthetic/curriculum/podstawa_*.txt` |
| History_v2 H100 smoke — correct date | **27.09.2026**, not 26.09 | `git show --stat 87283d60` (03:16:13 +0200); `output/history-v2-h100-smoke-2026-09-27/`; `docs/history-v2-h100-smoke-2026-09-27.md` — all three name 27.09 |
| History_v2 H100 smoke — figures (unchanged by the date fix) | 10 examples/optimizer steps, mean loss 2.565197 (rounds to 2.5652), 65,568,768 trainable params / 12,025,298,944 total = 0.5453% trainable, peak VRAM 32.0800 GiB (32.08), 656/656 adapter tensors changed | `output/history-v2-h100-smoke-2026-09-27/summary.json`; `output/history-v2-h100-smoke-2026-09-27/history-v2-smoke/train-v1.log:7` |
| Contributor commits — current, correct (`git shortlog -sn --all` at HEAD `6d8d52d7`) | JulianVolodia 43, **Pawel Cyrta 30**, endote 26, **Szymon Hajderek 22** (+szymon-hajderek 7), hiderr 8, Olaf Serafin 6 (+o-serafin 2), Volodia 2 — 146 commits total | this session, `git shortlog -sn --all`; matches `agentic-workflow.md:109` and its correction note at line 3 |
| Contributor commits — stale snapshot (`git shortlog -sn --all` at HEAD `9ed0effa`, 27.09 10:46:44) | JulianVolodia 42, endote 26, **Pawel Cyrta 23**, **Szymon Hajderek 21**, hiderr 7, szymon-hajderek 7, Olaf Serafin 5, Volodia 2, o-serafin 2 — 135 commits on `main` | `git-history-team-context.md:169-170`; reproduced this session with `git shortlog -sn 9ed0effa` |
| `main` vs `--all` today | `main` alone: 142 commits, Szymon Hajderek 21, hiderr 7, Olaf Serafin 5 (i.e. one each of Szymon Hajderek/hiderr/Olaf Serafin's `--all` commits sit only on unmerged branches) | this session, `git shortlog -sn main` vs `git shortlog -sn --all` |

## Components

- `WarsawModelTrainersHackathon/DU_programowej_2024.pdf` — official Polish government regulation PDF (*Dziennik
  Ustaw* 2024, poz. 1019); primary legal source for the extended-level history curriculum. Added at repo root in
  the very first extraction commit and never moved or renamed since.
- `WarsawModelTrainersHackathon/data_synthetic/README.md` — names `DU_programowej_2024.pdf` as the source of the
  curriculum files ("Annex 3, history") and documents the whole `data_synthetic` layout/record format.
- `WarsawModelTrainersHackathon/data_synthetic/curriculum/podstawa_<epoch>.txt` (×6: starozytnosc, sredniowiecze,
  nowozytnosc, xix_wiek, 1914_1945, po_1945) — the six epoch-scoped curriculum excerpts, manually cut from the
  PDF's Załącznik nr 3, used as the generation template for all `data_synthetic` tasks (per `data_synthetic/README.md`).
- `WarsawModelTrainersHackathon/output/history-v2-h100-smoke-2026-09-27/` — evidence directory for the `history_v2`
  H100 technical smoke test: `summary.json`, `history-v2-smoke/` (incl. `train-v1.log`), `evidence.tar.gz`,
  `local-tests.log`, `verification-tracking.json`.
- `WarsawModelTrainersHackathon/docs/history-v2-h100-smoke-2026-09-27.md` — the human-readable writeup of the same
  test (results table, failure-and-fix narrative, evidence/tracking links, data-authorization note).

## Decisions, incidents and lessons

- **Curriculum provenance was traceable but uncited.** No fact sheet named `DU_programowej_2024.pdf` by path before
  this one, even though `data_synthetic/README.md:15` already made the citation — a viewer asking "where did the
  curriculum text come from" would previously have had no sourced answer pointing at the actual document. Verified
  in this session by extracting the PDF text directly and matching it sentence-for-sentence against
  `podstawa_starozytnosc.txt`; no assumption was needed.
- **A regulation PDF sat at the repo root for 25.09–27.09 with no README mention in its own commit.** It only
  became "explained" a day later when `data_synthetic/README.md` was added in a separate commit (`8b0f43be`) by a
  different author (JulianVolodia + Claude Opus 5.5, vs. `endote`'s `a045a254`). Nothing in the repo enforces that
  link; it is only prose in a README.
- **`team-training-pipelines.md`'s own Key Numbers table contradicted its own Timeline.** The table (line 130)
  labels the H100 smoke test "(26.09)" while its Timeline (line 76) correctly places the landing commit `87283d60`
  at "27.09.2026 03:16 +0200" and cites `docs/history-v2-*-2026-09-27.md`. This is a same-document internal
  inconsistency, not a disagreement between two authors' research — a plain date-label slip while compiling the table.
- **Two commit-leaderboard sheets are not wrong relative to each other — they are timestamped snapshots.**
  `git-history-team-context.md` captured `git shortlog -sn --all` at `main` HEAD `9ed0effa` (27.09 10:46:44);
  `agentic-workflow.md` captured it later, at HEAD `6d8d52d7`, and even carries its own explicit orchestrator
  correction note (line 3) reconciling commit counts and the 9-identities-vs-6-people point. Neither sheet flags
  that the other used a different HEAD, so a slide built from `git-history-team-context.md` (or naively from
  `003B-hackaton/CLAUDE.md`, which gives no shortlog at all) would show a leaderboard inconsistent with one built
  from `agentic-workflow.md`. Root cause of the delta, confirmed by ancestry checks in this session: Pawel Cyrta's
  +7 ("Pawel Cyrta 23"→"30") is the 7 "postrain machine 1/2" commits, which sat on a branch merged into `main`
  *after* `9ed0effa` despite having earlier author-dates (`git merge-base --is-ancestor 9ed0effa 606ee08a` = yes,
  the reverse = no — DAG order, not clock order, decides ancestry). Szymon Hajderek's +1 ("21"→"22") is commit
  `89a488ad`, the tip of the still-unmerged `remotes/origin/oldgoodtimes` branch, which is counted by `--all`
  (it walks every ref) regardless of `main` state and regardless of when the snapshot was taken.
  **Conclusion: `agentic-workflow.md`'s numbers (146 commits `--all`, Pawel Cyrta 30, Szymon Hajderek 22+7) are the
  current, correct totals** — re-run fresh in this session and unchanged, since no new commits landed between that
  sheet and now.

## People

- **endote** — added `DU_programowej_2024.pdf` to the repo (`a045a254`, 25.09 23:05) and, separately, the
  `history_v2` H100 technical smoke test commit `87283d60` (27.09 03:16).
- **JulianVolodia** (co-authored by Claude Opus 5.5) — added `data_synthetic/README.md` and the curriculum/epoch
  files that cite `DU_programowej_2024.pdf` as their source (`8b0f43be`, 26.09 07:13); authored `main`'s HEAD at
  the time `git-history-team-context.md` was captured (`9ed0effa`).
- **Pawel Cyrta** — author of the 7 "postrain machine 1/2" commits (26.09 21:10–27.09 09:58) that account for the
  entire delta between the two sheets' Pawel Cyrta counts (23 vs 30).
- **Szymon Hajderek** — author of `89a488ad`, the unmerged `oldgoodtimes` branch tip, which accounts for the
  Szymon Hajderek delta (21 vs 22) between the two sheets.

## Open issues / limitations

- The exact page span reported for `Załącznik nr 3` (PDF pages 466–514) was derived in this session by a
  per-page `pdftotext` sweep for the annex heading text, not from any metadata in the repo — no sheet or repo file
  states this page range, so it is this session's own reading of the primary source, not a claim traceable to a
  team-authored document.
- Whether the six `podstawa_<epoch>.txt` files were cut from the PDF by hand, by a script, or by a Claude subagent
  reading the PDF is not stated anywhere in the repo (`data_synthetic/README.md` only says "cut from", with no
  script name); `8b0f43be`'s commit message says the whole `data_synthetic` batch (curriculum files, rubric
  template, pilot tasks) was "Claude subagents"-authored (co-authored-by Claude Opus 5.5), but does not
  distinguish the curriculum-cutting step specifically.
- `git-history-team-context.md`'s "135 commits on main" figure was reproduced exactly in this session
  (`git shortlog -sn 9ed0effa` sums to 135, matching per-author), but that is a `main`-only reconstruction at a
  past commit, not a true historical `--all` snapshot (branch tips existing today may not have existed, or may
  have pointed elsewhere, back when `9ed0effa` was HEAD) — the two sheets' `--all` numbers should be read as "what
  `--all` returns today, pointed at each sheet's respective `main` HEAD", not as a rigorous point-in-time `--all`.

## Good quotes or slide-worthy details

- The curriculum's own opening line, verbatim from both the regulation PDF and `podstawa_starozytnosc.txt`:
  *"porównuje uwarunkowania geograficzne rozwoju cywilizacji na Bliskim Wschodzie"* — a one-line, byte-matching
  proof that the "cut from Annex 3" claim in `data_synthetic/README.md` is literally true, not paraphrased.
- The regulation's own subject line makes a good provenance slide caption: *Dziennik Ustaw RP, 10 lipca 2024,
  Poz. 1019 — "ROZPORZĄDZENIE MINISTRA EDUKACJI z dnia 28 czerwca 2024 r. zmieniające rozporządzenie w sprawie
  podstawy programowej kształcenia ogólnego..."* — i.e. the entire synthetic-data curriculum content traces to a
  one-month-old ministerial regulation amendment.
- "DU" in the filename is not a code name — it stands for *Dziennik Ustaw* (Poland's official Journal of Laws),
  confirmed by the PDF's own masthead text, not an assumption.
- Two sheets, two different truths, same repo: a slide-ready one-liner is "commit-count leaderboards are
  timestamps, not facts — always cite the HEAD hash next to a `git shortlog` figure."

## Sources consulted

- `WarsawModelTrainersHackathon/DU_programowej_2024.pdf` (read via `pdfinfo` and per-page `pdftotext`, read-only,
  no modification)
- `WarsawModelTrainersHackathon/data_synthetic/README.md`
- `WarsawModelTrainersHackathon/data_synthetic/curriculum/podstawa_starozytnosc.txt` (and sibling files, `wc -l` only)
- `WarsawModelTrainersHackathon/output/history-v2-h100-smoke-2026-09-27/summary.json`
- `WarsawModelTrainersHackathon/output/history-v2-h100-smoke-2026-09-27/history-v2-smoke/train-v1.log`
- `WarsawModelTrainersHackathon/docs/history-v2-h100-smoke-2026-09-27.md`
- git commits: `a045a254`, `8b0f43be`, `87283d60`, `606ee08a`, `7b501fdd`, `16af30c9`, `baa2a078`, `0ac9f463`,
  `05e11d36`, `eb8abedc`, `89a488ad`, `9ed0effa`
- `git log`, `git show --stat`, `git shortlog -sn [--all|main|<commit>]`, `git rev-list --count`,
  `git merge-base --is-ancestor` (all read-only)
- Other fact sheets read for cross-referencing (not modified): `team-training-pipelines.md`,
  `git-history-team-context.md`, `agentic-workflow.md`
