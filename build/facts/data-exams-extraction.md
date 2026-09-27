# data-exams-extraction

## Summary

This area covers the team's raw data (Polish "matura z historii, poziom rozszerzony" exam PDFs and answer
keys, 2005-2026, plus a Polish-history e-textbook corpus) and the deterministic (no-LLM, no-OCR) pipeline that
turns the exam PDFs into structured JSONL/JSON the rest of the project builds on. The repo (team
`WarsawModelTrainersHackathon`, branch `main`) started from zero on 25.09.2026 evening and by 26.09.2026 night
had: 67 real advanced-level history exams (2005-2026, exam + answer-key PDF each) crawled/collected from three
sources (arkusze.pl, cke.gov.pl, direct uploads); a from-scratch pdfplumber+pypdf parser
(`scripts/extract_questions.py`) that went from covering 33 exams (2018-2026, 1,172 questions) to all 67 exams
(2005-2026, 2,098 questions) in one day; per-question PNG source crops and a "source graph" linking questions to
their source images; two organizer-format benchmark packages (40 exams 2017-2026, 27 exams 2005-2016) with
matching blank-answer templates and separately extracted grading keys; two private Hugging Face dataset
publications; and a 231-lesson Polish-history-textbook corpus (six ZPE e-textbooks) used to generate ~22k
synthetic Q&A items and 231 model matura essays. It matters because everything downstream (SFT data, RAG,
benchmark harnesses, LoRA training/eval) depends on this extraction being complete and trustworthy — and the
headline finding of this fact sheet is that **the extraction's "2018-2026 only" limitation, recorded as a known
issue in the parent `CLAUDE.md`, was fixed on 26.09.2026 and the current repo state (and README) no longer has
that limitation**; the parent doc is stale on this point.

## Timeline

- **25.09.2026 22:11 +0200** — Pawel Cyrta, commit `7a6a41bc` "uv project starter + data crawlers": repo
  scaffolding (`pyproject.toml`, `.python-version`) plus the first versions of `cke_crawler.py` and
  `scripts/arkusze_crawler.py`.
- **25.09.2026 22:17 +0200** — endote, commit `d55c39d7` "PDFy 2018-2026": uploads exam+answer-key PDFs for
  2018-2026 directly into `data/`.
- **25.09.2026 23:02 +0200** — Szymon Hajderek, commit `f0955092` "Add extracted history matura exams
  (2017-2026)": adds `exams_claude_extracted/` (10 exams, LLM/Claude-based extraction, not the deterministic
  pipeline) — later kept on as the benchmark's quick-start/example exam set.
- **25.09.2026 23:05 +0200** — endote, commit `a045a254` "gotowe jsonl z PDF": first version of
  `scripts/extract_questions.py` (334 lines) plus `questions.schema.json`, `tests/test_extraction.py` and the
  first `output/questions.jsonl` — **1,172 questions from the 2018-2026 PDFs only** (`output/questions.jsonl` at
  this commit is exactly 1,172 lines, verified with `git show a045a254:output/questions.jsonl | wc -l`).
- **25.09.2026 23:28 +0200** — Olaf Serafin, commit `0cd12383` "feat(data): Add history matura rozszerzona
  exams 2005-2018 and fill stara gaps": adds the 2005-2018 exam+answer PDFs that the parser could not yet read.
  This is the data drop that the parent `CLAUDE.md`'s "Known issues" section describes as unsupported.
- **26.09.2026 01:23 +0200** — Pawel Cyrta, commit `444723b5` "all set since 2003 from arkusze.pl": bulk crawl
  dump, `data/arkusze/files/` (198 files, all subjects, 2003-2026), `data/arkusze/manifest.jsonl` (4,550 lines)
  and `data/arkusze/pages.jsonl` (2,161 lines).
- **26.09.2026 01:28 +0200** — Pawel Cyrta, commit `3215a8ca` "source url links to cke resources":
  `data/cke/manifest.jsonl` (892 lines), `data/cke/pages.jsonl` (418 lines), `data/cke/media_links.jsonl`.
- **26.09.2026 11:57 +0200** — endote, commit `2413d976` "parser on matura 2005-2026": rewrites the parser
  (`scripts/extract_questions.py` +173/-... lines) to handle older layouts — wider/mirrored margins, landscape
  pages, Arkusz II numbering starting above 1, Roman essay topics, source packets before questions, inline
  subquestions. `output/questions.jsonl` goes from 1,172 to **2,098** lines (verified:
  `git show 2413d976:output/questions.jsonl | wc -l` = 2098, matching current `HEAD`). **This is the commit that
  resolves the "2018-2026 only" limitation.**
- **26.09.2026 14:34 +0200** — endote, commit `7c2355d6` "extracted images": adds `exam-metadata.schema.json`
  and the first rendered PNG source crops in `output/assets/`.
- **26.09.2026 14:37 +0200** — endote, commit `6333bb34` "Complete visual source graph exports and extraction
  review tooling": `output/source-graph.json`, `scripts/source_graph.py`, `scripts/audit_png_extraction.py`,
  `scripts/review_png_extraction.py`, `scripts/png_review.html` — this is the last commit to touch
  `output/questions.jsonl` (2,098→2,098 lines, content rewrite only: "2098 insertions(+), 2098 deletions(-)").
- **26.09.2026 17:20 +0200** — endote, commit `cfe37663` "eval 2017-2026 + grading set": first
  `data/evaluation-2017-2026/` organizer-format packs and `data/grading-2017-2026/` grading-key extraction.
- **26.09.2026 19:26 +0200** — Pawel Cyrta, commit `b2b361aa` " scripts for epodreczniki, and rephrease exam
  qa": adds `scripts/extract_legacy_questions.py` (a *lenient* fallback extractor for exams the strict parser
  still rejects) — added **after** `2413d976` already fixed the main gap; current README and
  `tests/test_extraction.py` do not reference it as part of the documented extraction command, so it reads as an
  exploratory/unused fallback rather than part of the shipped pipeline (not independently verified which, if
  any, exams still need it).
- **26.09.2026 22:19 +0200** — endote, commit `26476983` "matura-histoty-2005-2016": `data/evaluation-2005-2016/`
  organizer-format packs (27 exams) and the separate Hugging Face publication for that range.
- **26.09.2026** (date on doc, exact time not in a commit I read) — `docs/huggingface-exam-dataset.md`:
  Hugging Face dataset `WMTH-100d2exam/matura-history-2017-2026` published privately, "Uploaded using that
  account on 2026-09-26", revision `937c2d008cbcb8d678082b1de619c104c24239a7` (source:
  `docs/huggingface-exam-dataset.md` lines 1-5).
- **docs/huggingface-exams-2005-2016.md** (source doc, no commit hash read directly): second HF dataset
  `WMTH-100d2exam/matura-histoty-2005-2016` (misspelling "histoty" stated as intentional — "the exact dataset
  name requested by the user"), uploaded and remotely verified at revision `b559f8d09d1ac7f580d258570af29c95a20cdfab`.

## Key numbers

| Label | Value | Source |
|---|---|---|
| Exam PDFs (top-level `data/historia-*.pdf`, excluding answer keys) | 67, spanning 2005-2026 | `git ls-files data \| grep -E '^data/historia-.*\.pdf$' \| grep -v odpowiedzi \| wc -l` = 67 |
| Matching answer-key PDFs | 67 | same, `grep odpowiedzi` = 67 |
| `output/questions.jsonl` records (current) | 2,098 | `wc -l output/questions.jsonl`; confirmed in `output/extraction-report.json` (`question_count: 2098`) and README.md line 32 |
| `output/questions.jsonl` records (first run, a045a254, 2018-2026 only) | 1,172 | `git show a045a254:output/questions.jsonl \| wc -l` |
| Exams covered (current) | 67 | `output/exam-metadata.jsonl` = 67 lines; `output/extraction-report.json` `exam_count: 67` |
| Exams covered (first run) | 33 (implied: parent CLAUDE.md "Known issues"; not independently re-derived from a045a254's report) | parent `CLAUDE.md` "Known issues" section |
| Task groups | 1,672 | `wc -l output/task-groups.jsonl`; README.md line 32 |
| Individually exported subquestions | 812 | README.md line 32 |
| Essay alternatives | 236 | README.md line 32 |
| Subquestions with shared (not individual) score | 81 | README.md line 34 |
| `question_type` breakdown | closed_task 334 / short_answer 1,570 / essay 67 / mixed 127 / unknown 0 | README.md lines 116-122; `output/extraction-report.json` `question_types` (identical) |
| Regression tests passed (v3.2 validation) | "all 50 regression tests" | README.md line 36 |
| Extractor version | 3.2.0 | `output/extraction-report.json` `extractor_version` |
| Extraction dependency pins | pdfplumber 0.11.9, pdfminer.six 20251230, pypdf 6.10.0, pymupdf 1.28.2 | `output/extraction-report.json` |
| `output/exam-metadata.jsonl` size | 67 records, 236,633 bytes | `wc -l`, `ls -la` |
| `output/extraction-report.json` size | 779,036 bytes | `ls -la` |
| `output/source-graph.json` size | 17,058,279 bytes (17 MB) | `ls -la` |
| `output/page-text.jsonl` size | 8,996,124 bytes (~9 MB) | `ls -la` |
| PNG source-crop assets | 5,308 files, ~1.5 GB | `git ls-files output/assets \| wc -l`; `du -sh output/assets` |
| PNG review queue | 2,172 PDF pages total; 3 decisions logged, 2,169 unreviewed, 3 "needs_changes"; **acceptance = BLOCKED** | `output/png-extraction-review/acceptance.json` |
| Structure-tree metadata coverage | only 31 of 67 PDFs have a tagged structure tree | README.md line 173 |
| Answer-key heading coverage | complete for 44 exams, partial for 14, unavailable for 9 | README.md line 24 |
| Organizer-format eval pack, 2017-2026 | 40 exams, 1,400 scored items, 904 PNG crops | `data/evaluation-2017-2026/README.md` |
| Organizer-format eval pack, 2005-2016 | 27 exams, 655 scored items, 425 PNG crops | `data/evaluation-2005-2016/README.md` |
| Grading-key extraction, 2017-2026 | 40 exams, 1,400 items, 967 grading-key pages, 164 essay topic alternatives, 21 items with conflicting score evidence | `data/grading-2017-2026/README.md`, `docs/evaluation-grading-datasets.md` |
| Grading-key extraction, 2005-2016 | not built yet (no `data/grading-2005-2016/` directory found) | `ls data \| grep -i grad` → only `grading-2017-2026` |
| Older grading pipeline (`scripts/extract_gradings.py`) validated corpus | "the 33-exam, 1,172-record benchmark snapshot" — the *pre-2413d976* extraction, not the current 67-exam one | `docs/grading-extraction.md` (this doc appears not updated since the parser fix) |
| HF dataset `matura-history-2017-2026` | 1,400 rows total; configs `all` (1,400)/`items` (1,360)/`essays` (40); 443 text-only rows, 159 multi-image rows | `docs/huggingface-exam-dataset.md` |
| HF dataset `matura-histoty-2005-2016` | 655 scored rows (628 non-essay + 27 essay), 425 PNGs, 1,049 item-to-image refs, 1,350 max points, 512 remote files verified | `docs/huggingface-exams-2005-2016.md` |
| `data/arkusze/` crawl dump | 4,550-line manifest, 2,161-line pages index, 198 files under `files/` (all subjects, 2003-2026) | `wc -l`, `git ls-files` |
| `data/cke/` crawl dump | 892-line manifest, 418-line pages index, 6-line media-links file | `wc -l` |
| e-podręczniki textbook corpus | 6 books, 231 lessons, 22,129 generated+original Q&A items | `data/epodreczniki/dataset/{books,lessons,items}.jsonl` line counts |
| e-podręczniki essay corpus | 231 model essays, 443-550 words each, average 484 | `data/epodreczniki_essays/README.md` |
| `data/` tracked files total | 7,518 | `git ls-files data \| wc -l` |
| `output/` tracked files total | 41,295 | `git ls-files output \| wc -l` |

## Components

- `scripts/extract_questions.py` (498 lines) — the deterministic extractor: pdfplumber for positioned text +
  a heading state machine, pypdf as an independent second engine for a coverage cross-check. Produces
  `output/questions.jsonl`, `output/task-groups.jsonl`, `output/exam-metadata.jsonl`,
  `output/extraction-report.json`, `output/page-text.jsonl`. Command: `python scripts/extract_questions.py
  --data-dir data --output-dir output` (README.md line 157).
- `scripts/extract_legacy_questions.py` (251 lines, added 26.09 19:26 by Pawel Cyrta) — a *lenient* fallback
  extractor, reusing `extract_questions.py`'s heading patterns but widening margins, skipping non-portrait
  pages, and accepting numbering that starts above 1; docstring says it is "for exams the strict extractor
  rejects (mostly 2005-2017 papers)" and processes "only exams missing from the strict output." Not referenced
  in README's documented run command.
- `scripts/question_metadata.py` — deterministic `question_type` classifier (closed_task/short_answer/essay/
  mixed/unknown) from Polish instruction verbs (`zaznacz`, `podkreśl`, `wyjaśnij`, `uzasadnij`, …).
- `scripts/source_graph.py` — renders per-task source regions from original PDF bytes (via `pymupdf`) into
  `output/source-graph.json` + `output/assets/*.png`; schema `source-graph.schema.json`.
- `scripts/audit_png_extraction.py` — independent audit of current PDF vs. saved PNG bytes; writes
  `output/png-extraction-validation/{report.md,index.html,audit.json}`.
- `scripts/review_png_extraction.py` + `scripts/png_review.html` — local HTTP server (port 8769 by default) for
  human page-by-page review; writes an append-only, hash-chained `output/png-extraction-review/decisions.jsonl`
  and `acceptance.json`.
- `scripts/cke_crawler.py` / `scripts/arkusze_crawler.py` — uv-inline-script crawlers (requests+bs4+lxml) for
  cke.gov.pl and arkusze.pl exam-sheet PDFs; write `data/cke/` and `data/arkusze/` manifests.
- `scripts/epodreczniki_crawler.py` — crawler for zpe.gov.pl e-podręczniki (ZPE API → Markdown per lesson,
  including rendered interactive exercises with answers).
- `scripts/build_epodreczniki_dataset.py`, `scripts/epodreczniki_questions.py`, `scripts/epodreczniki_essays.py`
  — turn the crawled textbook Markdown into `data/epodreczniki/dataset/` (HF-shaped: books/lessons/items JSONL)
  and `data/epodreczniki_essays/essays.jsonl` (Claude-written matura-style essays per lesson). All authored by
  Pawel Cyrta.
- `scripts/build_evaluation_datasets.py` / `scripts/validate_evaluation_datasets.py` — build and check the
  organizer-format `data/evaluation-2017-2026/` and `data/evaluation-2005-2016/` packs (exam.json +
  answers-template.json + images/, matching the supplied `history-2023-mock-v1` layout).
- `scripts/extract_gradings.py` / `scripts/grading_context.py` / `scripts/build_grading_datasets.py` /
  `scripts/validate_grading_datasets.py` — the separate grading-key extraction pipeline; outputs
  `benchmark/exams_output/grading/{gradings,grading-exams}.jsonl` (old 33-exam snapshot per `docs/
  grading-extraction.md`) and `data/grading-2017-2026/` (40-exam organizer-format grading evidence, current).
- `scripts/package_huggingface_exams.py` / `publish_huggingface_exams.py` / `validate_huggingface_exams.py`
  (and the `*_essays.py` equivalents) — build, publish (private) and independently re-verify the two HF exam
  dataset repos from local packs only, via an explicit file allowlist (never a recursive folder upload).
- `questions.schema.json`, `exam-metadata.schema.json`, `source-graph.schema.json` — JSON Schemas (draft
  2020-12) for the three main output contracts; current `schema_version` is `"3.2"`.
- `benchmark/exams_claude_extracted/` — 10 exams (2017-2026) extracted via Claude/LLM rather than the
  deterministic parser (Szymon Hajderek, commit `f0955092`); kept on as the benchmark's example/quick-start
  input set (referenced from `benchmark/README.md`, `benchmark/RUNNING.md`, `scripts/build_sft_data.py`, and
  the synthetic-data scripts).
- `tests/test_extraction.py` (249 lines, ~25 test methods) — regression suite; `test_unique_ids_and_
  all_current_exam_files` now compares against *every* `data/*.pdf` (no year restriction), consistent with the
  README's "50 regression tests passed" and no skip/xfail markers found for the pre-2413d976 33-exam
  restriction.

## Decisions, incidents and lessons

- **The parser's "2018-2026 only" limitation was real, then fixed within the same day.** `a045a254` (25.09
  23:05) shipped the first extractor covering only 2018-2026 (1,172 questions); `2413d976` (26.09 11:57,
  6 commit-messages and ~12 hours later, same author "endote") rewrote it ("parser on matura 2005-2026") to
  handle older layouts and produced 2,098 questions from all 67 exams. The parent workspace `CLAUDE.md`'s
  "Known issues" section (which describes the 33-exam / 1,172-question state and an abort on
  `historia-2005-grudzien-probna-rozszerzona`) documents the **pre-fix** state and has not been updated since;
  the current repo (README.md, `output/exam-metadata.jsonl`, `output/extraction-report.json`) shows 67/67 exams
  passing. This is the single most important discrepancy found in this area.
- **A second, older grading pipeline was not updated along with the main extractor.** `docs/grading-
  extraction.md` still states "The validated corpus is the 33-exam, 1,172-record benchmark snapshot" for
  `scripts/extract_gradings.py` / `benchmark/exams_output/grading/`. This looks like the same kind of staleness
  as the CLAUDE.md issue, in a doc rather than in code; not independently re-run to see whether the code itself
  is actually still limited to those 33 exams or just the doc is stale.
  - **Guardrail is deliberate:** extraction "fails on missing/duplicate task numbers, broken subquestion
  sequences, missing essay alternatives, empty question bodies, missing scores without an explicit parent
  budget, unsupported page sizes, disagreements between the two heading extractors, too few tasks relative to
  exam instructions, or a mismatch with an extractable declared point total" and "output files are written
  only after all exams finish successfully" (README.md, "Validation and limits" section) — this is why the
  pre-fix run could not simply skip the unsupported PDFs; it either processed the whole corpus or aborted.
- **Determinism was explicitly tested, not assumed:** "Two complete version 3.1 runs produced byte-identical
  question, group, page-text, extraction-report and exam-metadata files" (README.md line 40).
- **PNG source-crop integrity ≠ human-reviewed correctness.** `output/png-extraction-review/acceptance.json`
  reports `"acceptance": "BLOCKED"`, `"zero_omissions_verified": false`; only 3 of 2,172 pages have a logged
  review decision. README.md's own PNG-audit section states this outright: "**The current extraction fails
  zero-omission acceptance.** PNG integrity passed, but metadata is incomplete: only 31 of 67 current PDFs have
  structure trees" and names three specific pages where two source headings were merged into one node (May
  2012 p.12, May 2013 p.13, May 2015 p.15).
- **Deliberate spelling choice, not a typo:** the second HF dataset is named `matura-histoty-2005-2016`
  (missing "r"); `docs/huggingface-exams-2005-2016.md` states this is "intentional: it is the exact dataset
  name requested by the user."
- **Legacy-format ambiguity is handled by "retain everything, don't guess":** repeatedly stated design
  principle across README sections — shared/legacy source packets are attached to every task that might need
  them rather than trying to infer which one actually uses them, "This deliberately avoids guessing implicit
  references."

## People

- **endote** — wrote and evolved the core deterministic extractor end-to-end: `a045a254` (first version, 33
  exams), `2413d976` (extended to 67 exams/2005-2026), `7c2355d6` (PNG source images), `6333bb34` (source graph
  + review tooling), `cfe37663` (2017-2026 eval+grading packs), `26476983` (2005-2016 eval packs + HF dataset).
  Also sole author of `docs/huggingface-exam-dataset.md`, `docs/huggingface-exams-2005-2016.md`, and the
  `build_evaluation_datasets.py`/`build_grading_datasets.py` family. Self-identifies in those two HF docs as
  "Norbert Jaworski (@End0t3)," the curator of both published HF exam datasets.
- **Pawel Cyrta** — built the crawling/data-collection layer: `cke_crawler.py`, `arkusze_crawler.py` (first
  commit of the repo, `7a6a41bc`), the bulk arkusze.pl dump (`444723b5`, all subjects 2003-2026), the cke.gov.pl
  link manifest (`3215a8ca`), `scripts/extract_legacy_questions.py`, and the entire e-podręczniki
  crawl→dataset→essay-generation chain (`epodreczniki_crawler.py`, `build_epodreczniki_dataset.py`,
  `epodreczniki_questions.py`, `epodreczniki_essays.py`).
- **Olaf Serafin** — contributed the 2005-2018 exam+answer PDFs (`0cd12383`) that filled the historical gap the
  first-version parser could not read; this data drop is what `2413d976` was written to consume.
- **Szymon Hajderek** — contributed a separate, LLM-based extraction of 10 exams (`f0955092`,
  `exams_claude_extracted/`), used downstream as the benchmark's example/quick-start exam set rather than
  merged into the deterministic pipeline.

## Open issues / limitations

- Parent workspace `CLAUDE.md` "Known issues" section is **stale**: it describes the pre-`2413d976` 33-exam
  state (1,172 questions, abort on the first 2005-2018 PDF) as current. It is not.
- `docs/grading-extraction.md` still documents the old 33-exam/1,172-record snapshot as "the validated corpus"
  for the grading-extraction pipeline (`scripts/extract_gradings.py`); whether the code itself was ever re-run
  against the current 67-exam corpus was not verified in this pass.
- No grading-key extraction exists yet for the 2005-2016 range: `data/grading-2017-2026/` exists,
  `data/grading-2005-2016/` does not (only the organizer-format *solver* packs — `data/evaluation-2005-2016/`
  — exist for that range).
- PNG/source-region human review is explicitly blocked: 2,169 of 2,172 pages unreviewed, acceptance =
  `"BLOCKED"` (`output/png-extraction-review/acceptance.json`).
- Only 31 of 67 PDFs carry a tagged PDF structure tree, so Figure/Chart/Table object resolution is partial by
  the extractor's own admission (README.md "PNG audit" section).
- Three exams have a known, unfixed source-merging defect: two side-by-side source headings render as one
  source node (May 2012 p.12, May 2013 p.13, May 2015 p.15) — "the missing separate source-2 identity still
  requires correction" (README.md line 173).
- The June 2024 old-format exam has a body/instructions task-count disagreement (25 declared vs. 26 present);
  both counts are retained rather than one being discarded (README.md, "Observed input issues").
- `scripts/extract_legacy_questions.py` exists but is not wired into the documented extraction command; it is
  unclear from the sources read whether any exam currently still needs it, or whether it is a superseded/
  exploratory script — not independently determined in this pass (would require diffing its output against
  `output/questions.jsonl`, not done here per the read-only/no-heavy-computation constraint).
- `question_type` labels and `type_classification` are explicitly self-described as "deterministic inferred
  labels, not official CKE annotations" — cross-engine agreement, not semantic ground truth.
- Public exam papers can overlap future/other training data; `docs/evaluation-datasets.md` states outright:
  "they do not establish an uncontaminated holdout."

## Good quotes or slide-worthy details

- "The current corpus yields **2,098 question records from 67 exam PDFs (2005–2026)**... The companion
  `output/task-groups.jsonl` preserves all **1,672 original task groups**." — README.md line 32. (Compare: the
  parent CLAUDE.md still says "1172 questions from 33 exams (2018–2026) only.")
- "**81 subquestions have no individually printed score**: their `max_points` is `null`... Never assign the
  whole budget to every child or assume an equal split." — README.md line 34.
- "**The current extraction fails zero-omission acceptance.** PNG integrity passed, but metadata is
  incomplete: only 31 of 67 current PDFs have structure trees." — README.md line 173.
- "`output/png-extraction-review/decisions.jsonl` is an append-only, hash-chained decision log... Changed
  extraction or audit bytes invalidate the applicability of earlier approvals; changed PDFs or PNGs cannot
  retain final acceptance." — README.md line 177 (a full provenance/audit design for a hackathon side-pipeline).
- "The specimen named `historia-2015-przykladowy-arkusz-cke-rozszerzona` has no declared cover total and
  retains `points_declared: null`." — README.md line 38 (one named exception, called out rather than smoothed
  over).
- "The spelling `histoty` is intentional: it is the exact dataset name requested by the user." — docs/
  huggingface-exams-2005-2016.md line 2.
- extraction-report.json's stated `limitations` array (12 items) is itself a candid, machine-embedded list of
  what the extractor does *not* claim — e.g. "Answer key heading matches verify numbering only; answers are not
  extracted" and "PDF text spacing and encoding defects are preserved rather than corrected heuristically."

## Sources consulted

- Git commits (`git show --stat`, `git log --format`, `git show <rev>:<path> | wc -l`): `7a6a41bc`, `d55c39d7`,
  `a045a254`, `f0955092`, `0cd12383`, `444723b5`, `3215a8ca`, `2413d976`, `7c2355d6`, `6333bb34`, `cfe37663`,
  `26476983`, `b2b361aa`.
- `README.md` (full file, 179 lines) — sections "Deterministic history-exam question extraction" through "PNG
  audit and exhaustive source review".
- `output/extraction-report.json` (top-level keys + `limitations` array, via `python3 -c "json.load(...)"`; not
  read whole — 779 KB).
- `output/exam-metadata.jsonl` (line count + first record), `output/questions.jsonl` (line count + first
  record + `exam_id` set), `output/task-groups.jsonl` (line count), `output/source-graph.json` (size + first
  ~800 bytes only, 17 MB file).
- `output/png-extraction-review/acceptance.json` (full, small file) and `decisions.jsonl` (line count).
- `tests/test_extraction.py` (structure via `grep -n 'def test_'`, plus targeted `sed -n` reads of specific
  tests).
- `questions.schema.json`, `exam-metadata.schema.json` (headers only).
- `docs/evaluation-datasets.md`, `docs/huggingface-exam-dataset.md`, `docs/huggingface-exams-2005-2016.md`,
  `docs/grading-extraction.md`, `docs/evaluation-grading-datasets.md` (read in full or near-full).
- `data/evaluation-2017-2026/README.md`, `data/evaluation-2005-2016/README.md`, `data/grading-2017-2026/
  README.md` (heads).
- `data/epodreczniki.md` (head), `data/epodreczniki/ERRATA.md` (head), `data/epodreczniki/dataset/README.md`
  (head + line counts of `books.jsonl`/`lessons.jsonl`/`items.jsonl`), `data/epodreczniki_essays/README.md`
  (full).
- Script headers/docstrings only (not full bodies) for: `scripts/extract_questions.py`,
  `scripts/extract_legacy_questions.py`, `scripts/source_graph.py`, `scripts/question_metadata.py`,
  `scripts/audit_png_extraction.py`, `scripts/review_png_extraction.py`, `scripts/cke_crawler.py`,
  `scripts/arkusze_crawler.py`, `scripts/epodreczniki_crawler.py`, `scripts/package_huggingface_exams.py`,
  `scripts/publish_huggingface_exams.py`, `scripts/validate_huggingface_exams.py`.
- Directory listings and line/file counts via `git ls-files`, `ls`, `wc -l`, `du -sh` (no recursive listing of
  `output/` or `data/` beyond one level, per the task's hard rules).
- Parent `/mnt/hgfs/sharedWithKali/ai-thingy-september-26/003B-hackaton/CLAUDE.md` "Known issues" section
  (provided in this session's context, used only as the claim being checked against the above sources).
