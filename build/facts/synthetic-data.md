# Synthetic and distilled training data

## Summary

The team needed matura-style history tasks beyond the 33 real exams the extraction pipeline could parse
(`output/questions.jsonl`, 1172 questions, 2018–2026 only), and needed graded answers to train/reward a
model without teaching it facts it doesn't know. Between 25.09 and 27.09.2026 this produced five distinct
synthetic/distilled datasets, built by three different methods:

1. **`data_synthetic/`** — 3,600 CKE-format tasks (6 epochs) written by Claude subagents from the 2024
   core curriculum, verified by separate Claude verifier agents. Done 26.09.
2. **`data_synthetic_extended/`** — 15,113 tasks (variants + newly generated), grounded in two Polish
   Wikipedia snapshots, written by **DeepSeek `deepseek-flash`** via static Python (no Claude/Opus). Done
   26.09, cost 22.57 USD.
3. **`data_synthetic_images/`** — 478 image-based tasks (real Wikimedia Commons images), built by Olaf
   Serafin 26.09.
4. **`data/epodreczniki*`** — Pawel Cyrta's crawl of 231 ZPE e-textbook lessons, turned into extraction
   questions and 231 model essays (25–26.09); a later critique by endote (27.09, `docs/synthetic-essays-lora-plan.md`)
   found concrete defects in the generated-essay pipeline (e.g. a 1914/1917 fact mismatch) and specified
   a stricter essay-training contract, partially implemented as the `output/essay-generation/history-500-v*`
   runs (in progress, judge `deepseek-flash-high@think`).
5. **`data_destillated_by_claude/`** — Claude subagents acting as blind CKE examiners, used both to
   calibrate the Gemma self-grader (finding it ~11 points too lenient) and to select RFT training examples
   from the base model's own graded answers.

Why it matters: experiments recorded in `lora_experiments.md` / `EXPERIMENTS.md` show that SFT directly on
key answers raises confident hallucination without raising the score, so nearly all of this data is
designed to feed **RFT (rejection sampling on the model's own graded answers)** and **RL reward for essays**,
not to be copied as SFT targets.

## Timeline

- **25.09.2026 22:39 +0200** — Pawel Cyrta, commit `18975717`, "epodreczniki 1": first e-podręczniki work.
- **25.09.2026 23:10 +0200** — Pawel Cyrta, commit `f387c3d3`, "epodreczniki crawler".
- **26.09.2026 07:13–07:14 +0200** — JulianVolodia, commits `8b0f43be`/`b0d9c80e`: `data_synthetic` curriculum
  extracts, essay rubric template, pilot 1914–1945 (76 tasks).
- **26.09.2026 06:59 +0200** — JulianVolodia, commit `acfcebcf`: "Add data_destillated_by_claude: Claude-graded
  answers and guidelines".
- **26.09.2026 08:15–08:33 +0200** — JulianVolodia, commits `ee6a39ae`/`cd39ed36`/`e8a8f601`: `data_synthetic`
  main set complete, 3,600 verified tasks.
- **26.09.2026 07:00–08:36 +0200** — JulianVolodia, 9-commit series "Sync Claude RFT grades" (`f0e41039`,
  `204ed02c`, `7293fc49`, `91804c7d`, `9ec81314`, `26b2b108`, `c6ed473f`, `e5babb64`, `c7a2fcc1`): incremental
  publication of Claude-graded RFT batches into `data_destillated_by_claude/rft/`.
- **26.09.2026 14:55–17:44 UTC** — L40S: DeepSeek-vs-Claude grader calibration (`EXPERIMENTS.md`), then a
  6-config LoRA hyperparameter tournament on the `data_synthetic_extended` RFT-think data.
- **26.09.2026 15:04 +0200** — JulianVolodia, commit `91d51b48`: `data_synthetic_extended` wave 1 — 3,431
  Wikipedia-grounded variants, fact-check, curriculum inventory.
- **26.09.2026 15:19 +0200** — JulianVolodia, commit `3e558a8f`: wave 2 — 10,582 new tasks (5,010 essays,
  4,953 closed, 4,050 open at that point).
- **26.09.2026 ~15:30–16:00 UTC** — Wiki RFT pool sampling on a Runpod H100 pod (`trq7l49nf0jq45`), logged
  as cut short / incomplete (`l40s-results/EXPERIMENTS.md` "Wiki RFT pool sampling").
- **26.09.2026 16:13 +0200** — JulianVolodia, commit `51b1f66f`: wave 3 — targets reached, 5,010/5,040/5,063.
- **26.09.2026 16:06–16:24 +0200** — JulianVolodia, commits `25dc063c`/`3d628baf`: docs and run-script sync.
- **26.09.2026 19:24–20:27 +0200** — Pawel Cyrta, commits `288aa73b`/`b2b361aa`/`e3b4e536`/`95619385`/
  `fa828aee`/`d2428a8e`: e-podręczniki download, question extraction/rephrasing scripts, dataset schema.
- **26.09.2026 23:36 +0200** — Pawel Cyrta, commit `49c161f3`: "esseays for epodreczniki 231 one for each topic".
- **26.09.2026 17:44 UTC (Olaf Serafin) — see Components** below for the 4-commit image-task series.
- **26.09.2026 19:47 +0200** — o-serafin, commit `9fd342f1`, merge PR #4 "data/synthetic-images" into `main`.
- **26.09.2026 22:19 +0200** — endote, commit `26476983`: "matura-histoty-2005-2016" (older-exam work, adjacent
  to this area but not part of it — see Known issues in the root CLAUDE.md on the 2005–2018 parser gap).
- **27.09.2026 00:42 +0200** — endote, commit `f3ba345a`: "harness automatic eval and improvement" — adds
  `docs/synthetic-essays-lora-plan.md` and `scripts/synthetic_essay_review_findings.json`, a critique of the
  generated-essay pipeline with 4 confirmed record-level findings and 8 label-alignment reviews.
- **27.09.2026 00:49–06:33 +0200** — endote, commits `f51268f9`/`eb3283bc`/`87283d60`/`6b6dab53`: essay-generation
  pipeline runs `output/essay-generation/history-500-v1` … `v8` (contract-driven, judge
  `deepseek-flash-high@think`), in progress — v8 shows 252 accepted results and $6.02 of a $15 budget spent.

## Key numbers

| Label | Value | Source |
|---|---|---|
| `data_synthetic` main set | 3,600 tasks, 600/epoch × 6 epochs, 96 chunks | `data_synthetic/README.md` |
| `data_synthetic` verifier outcome | 3,374 kept unchanged, 226 fixed, 0 dropped | `data_synthetic/README.md` |
| `data_synthetic` task-type split | 960 closed_choice, 960 true_false, 1,440 open (611 explain/317 identify/259 compare/146 argument/107 chronology), 240 essays | `data_synthetic/README.md` |
| `data_synthetic` pilot (unverified) | 433 tasks (76/81/80/63/66/67 across epochs) | `wc -l data_synthetic/pilot_unverified/*.jsonl` |
| `data_synthetic_extended` target vs final | target 5,000/5,000/5,000; final **5,010 essays, 5,040 closed, 5,063 open** (15,114 total, 15,113 published after 1 exact duplicate dropped) | `data_synthetic_extended/README.md`, `stats.json`, `QA_REPORT.md` |
| `data_synthetic_extended` families | variants 3,431; generated 11,683 | `stats.json` |
| `data_synthetic_extended` DeepSeek cost | **22.57 USD** total (wave 2: 21.41 USD — linking 0.89, variants 3.30, variant verification 0.81, inventory 0.53, generation+verification 15.88; finishing run: 1.16 USD) | `data_synthetic_extended/PIPELINE.md` |
| `data_synthetic_extended` verification | generated: 7,267 keep/verifier, 1,285 fixed/verifier, 3,131 keep/blind; variants: 1,050 keep/verifier, 296 fixed/verifier, 274 revised/verifier, 1,795 keep/blind, 16 revised/blind | `stats.json` |
| Wikipedia index (`plwiki.sqlite`) | 7.0 GB; 1,543,918 FineWiki pages + 1,587,721 pages from the 2023 dump; 580,726 redirects | `data_synthetic_extended/PIPELINE.md` |
| `data_synthetic_images` | 478 tasks (80/epoch, 79 for 1914–1945 and po_1945), 513 points | `data_synthetic_images/README.md`, `wc -l tasks.jsonl` |
| e-podręczniki source | 231 lessons across 6 ZPE books | `data/epodreczniki/index.jsonl` (231 lines), `data/epodreczniki_essays/README.md` |
| e-podręczniki essay forms | 154 teza, 32 porownanie, 23 charakterystyka, 22 ocena | `data/epodreczniki_essays/README.md` |
| e-podręczniki essays by era | starożytność 25, średniowiecze 43, nowożytność 56, XIX w. 38, 1914–1945 51, po 1945 18 | `data/epodreczniki_essays/README.md` |
| e-podręczniki model essays | 443–550 words, average 484; 216 self-rated 15/15, 15 self-rated 14/15 | `data/epodreczniki_essays/README.md` |
| Grader calibration (val v2, 111 tasks / 128 pts) | Gemma vs Claude: base_think 53.9%/49.2%, base 50.8%/39.1%, LoRA A 51.6%/37.5%, LoRA B 44.5%/35.2%; exact agreement 85%, Gemma higher in 67/76 disagreements | `data_destillated_by_claude/README.md`, `lora_experiments.md` |
| RFT base sampling | 1,212 no-thinking samples over 606 train tasks (k=2); 462 full-points (38%), covering 269/606 tasks | `lora_experiments.md` |
| Thinking-mode full-marks rate | 58% (vs 38% no-thinking), based on early figures | `lora_experiments.md` |
| RFT/thinking DPO pairs | 94 no-think pairs, 88 think pairs | `wc -l data_destillated_by_claude/dpo/*.jsonl`, `l40s-results/EXPERIMENTS.md` |
| DeepSeek-vs-Claude grading agreement | 89.8% exact match, mean |diff| 0.10 pts, precision 0.88/recall 0.94 on "full points" | `l40s-results/EXPERIMENTS.md` |
| Wiki RFT pool sampling (unfinished) | pool 2,999 tasks; 849 nothink / 497 think samples generated; 326 / 242 graded; logs stop at 600/5785 (nothink), 200/5815 (think) jobs | `l40s-results/wiki_ext-rft/README.md`, `l40s-results/EXPERIMENTS.md` |
| DeepSeek API ledger for wiki_ext | 36,976 logged calls | `l40s-results/EXPERIMENTS.md`, `l40s-results/wiki_ext-rft/README.md` |
| `history-500` essay-generation runs (endote, 27.09, in progress) | v1 48, v2 24, v4 22, v5 10, v6 18, v7 501, v8 252 accepted/attempted results (v3 has no `all_results.jsonl` yet) | `wc -l output/essay-generation/history-500-v*/all_results.jsonl` |
| `history-500-v8` cost so far | 6.02 USD charged/reserved of a 15.0 USD budget; 716 API requests reserved, 288 essay requests reserved, 11 uncertain | `output/essay-generation/history-500-v8/cost-status.json` |
| `output/essay-evidence/wikipedia-full-2026-09-26` | 163 cached evidence JSON files | `ls | wc -l` |

## Components

- `data_synthetic/README.md`, `curriculum/podstawa_<epoch>.txt`, `curriculum/essay_rubric_template_cke_2024.txt` — the 2024 core-curriculum extracts and the real June-2024 CKE essay rubric used as templates.
- `data_synthetic/pilot_unverified/gen_<epoch>.jsonl` — 433 unverified pilot tasks, 6 authors, not for training.
- `data_synthetic/<epoch>/<type>_<k>.verified.jsonl` — the 3,600-task main set, 16 chunks/epoch, each independently verified.
- `data_synthetic_extended/README.md`, `PLAN.md`, `PIPELINE.md`, `QA_REPORT.md`, `stats.json`, `LICENSE-WIKIPEDIA.md` — the Wikipedia-grounded extension: plan, running build log, QA results, machine-readable stats, and the CC BY-SA 4.0 licence note for the whole folder.
- `data_synthetic_extended/variants/`, `generated/`, `wiki_check/`, `inventory/`, `scripts/` — the four data families plus the pipeline code (retrieval, verbatim-quote checking, task assembly, dedup/leakage checks), run from `/scratch/wiki_ext/` on the L40S.
- `data_synthetic_images/README.md`, `tasks.jsonl`, `images_manifest.json`, `<epoch>/exam.json`, `<epoch>/images/*.png`, `<epoch>/tasks/*.json`, `keys/<epoch>.json`, `scripts/` (`commons_search.py`, `fetch_images.py`, `tasks_data.py`, `tasks_b*.py`, `check_group.py`, `build.py`) — 478 real-image tasks packaged in the organizers' exam format, images downscaled to ≤1024px longest side, each stored once.
- `data/epodreczniki.md`, `data/epodreczniki/index.jsonl`, `data/epodreczniki/ERRATA.md`, `data/epodreczniki/dataset/` — the crawled ZPE e-textbook source (231 lessons, 6 books) and a long list of factual errors found in the source lessons themselves (Pawel Cyrta).
- `scripts/epodreczniki_crawler.py`, `build_epodreczniki_dataset.py`, `epodreczniki_questions.py`(+`_prompt.md`), `epodreczniki_essays.py`(+`_prompt.md`), `rephrase_questions.py`, `rephrase_qa_report.py`, `structure_rephrased.py`, `validate_rephrased.py` — the e-podręczniki pipeline: crawl → dataset schema → question generation → rephrasing/QA → essay generation, all Pawel Cyrta, 25–26.09.
- `data/epodreczniki_essays/README.md`, `essays.jsonl` (231 rows), `_reference/essay_reference.md`, `_pilot/REPORT.md` — one CKE-style essay topic + model essay + self-assessment per e-podręcznik lesson; validated by `epodreczniki_essays.py validate`.
- `scripts/generate_synthetic_essays.py`, `generate_planned_essays.py`, `generate_rubric_essays.py`, `curate_synthetic_essays.py`, `validate_synthetic_essays.py`, `apply_essay_source_reviews.py`, `fetch_essay_evidence.py`, `synthetic_essay_review_findings.json` — endote's later essay tooling and its structured critique of the generated-essay data (27.09).
- `docs/synthetic-essays-lora-plan.md` — endote's design document ("not a claim that training … has run"): objective (≥300-word essays, ≥0–12/0–3 CKE rubric), a table of concrete defects found in the existing pipeline, and a two-phase repair/calibration plan citing "AGENTS.md" and `deepseek-flash-high@think` as the required grader.
- `output/essay-generation/history-500-v1`…`v8`, `output/essay-evidence/wikipedia-full-2026-09-26/` — endote's contract-driven essay generation runs implementing that plan; still running/incomplete (v3 has no results file yet, v8 at 252 results and ~40% of budget).
- `data_destillated_by_claude/README.md`, `gemma_vs_claude/`, `rft/`, `dpo/`, `eval_v3_rft/` — Claude-subagent grading data: grader calibration, RFT training-selection, DPO pairs, and the v3-rft evaluation batches.
- `l40s-results/synthetic/`, `l40s-results/synthetic_extended/` — the working mirrors of the two folders above (server-side staging before `sync_*.sh` publishes to `main`).
- `l40s-results/wiki_ext-rft/README.md` — unpublished mirror of the incomplete Wikipedia RFT sampling run, deliberately kept out of `data_synthetic_extended/` so the sync script doesn't publish it.
- `l40s-results/claude-grading/` — the working directory for every Claude-grading batch (calibration, `rft_*`, `v3*/v3t*/v4f*/v4t*`, `val_*`): batches in, grades out, `eval_batches.py`, `rft_batches.py`, `calib_analysis.py` → `calibration.md`.
- `l40s-results/sync_synthetic.sh`, `sync_synthetic_extended.sh`, `sync_claude_data.sh` — the three publish scripts; all commit as `JulianVolodia`, straight to `main`, fetch+rebase before and after commit, push, no merge commits (per the team's "synthetic data → main, rebase-only" rule).

## Decisions, incidents and lessons

- **SFT on key answers teaches confident hallucination, not knowledge.** `lora_experiments.md`: LoRA A/B trained on key answers changed answer *style* (exact-match on closed tasks rose 0% → 32–55%) without raising the Claude-graded score (A 37.5%, B 35.2% vs base 39.1%); B, which fit the keys more tightly (lower val loss, bf16 base), scored *worst* and produced specific fabricated facts ("Oktawian August pierwszym konsulem", "Dictatus papae 1059"). This is the stated reason all `data_synthetic*` sets are RFT/RL prompt pools, not SFT targets.
- **The Gemma self-grader cannot be trusted alone to rank models.** `data_destillated_by_claude/README.md` / `EXPERIMENTS.md`: on val v2 Gemma is ~11 points more lenient than Claude on average, and the leniency differs by variant enough to *flip the ranking* (Gemma: base > A > base_think; Claude: base_think > base > A). Decision: Claude is the reference grader from 26.09 onward.
- **DeepSeek `deepseek-flash` was calibrated and accepted as a cheap stand-in grader for the large Wikipedia pool** — 89.8% exact agreement with Claude, 0.10 USD to check 728 already-Claude-graded answers — but the team still routes final model comparisons through Claude (or both graders) because the ranking among close LoRAs still shifts by 2–3 points.
- **RFT beat plain SFT but only modestly:** v3-rft (best checkpoint, step 51) scored 41.4% vs base 39.1%, vs base_think 49.2% — thinking mode remained worth far more (~8–10 points) than any LoRA tried by 26.09.
- **A factual retrieval bug was found and named, not silently fixed:** `synthetic_essay_review_findings.json` documents a Wikipedia-grounded essay item (`wik-1914_1945-essay-XXXVII-043-1`) whose question is about the 1914 July Crisis but whose grading key describes the 1917 Petrograd crisis — the stored verifier note flagged the contradiction, but the "fixed" published record still contains it. This is cited as the concrete case for a stricter, full-object re-review requirement in `docs/synthetic-essays-lora-plan.md`.
- **A "fixed" verification flag was found to be potentially misleading in general**: the same plan document states the pipeline's `verify_task` can mark a record "fixed" after only a partial correction, and that reviewers were sometimes shown truncated objects (essays without rubric/evidence/summary) — hence its Phase 1 requirement to re-review the complete rebuilt object every time.
- **A generated-essay ID collision was found at publish time** (wave 2, 26.09): ids for generated essays didn't include the chapter, so ids collided within an epoch; fixed for future generation in `stage_generate.py`, and existing ids rebuilt from `seed.unit` in `publish.py` (`data_synthetic_extended/PIPELINE.md`).
- **A first full DeepSeek run largely failed silently on format:** "70% of responses needed a repair, mostly open tasks ignoring the prescribed order of types and points" — caught because every response is cached, so the rerun cost nothing (`PIPELINE.md`).
- **Budget was a live constraint, twice:** wave 2 stopped early at the `--budget 21.5` cap with 4,245/4,438 units done; the DeepSeek account (balance 23.34 USD at plan time) was topped up to 10.81 USD to finish the last ~300 open tasks (`PIPELINE.md`).
- **The Wikipedia RFT sampling run (H100 pod) was left incomplete** and its state is explicitly unknown: "Whether the run was cut short or resumed elsewhere is not recorded" (`l40s-results/EXPERIMENTS.md`).
- **Self-assessment in the e-podręczniki essays is inflated by roughly 1 point**, per the pilot's blind grading (both "celujący" variants held at 15, but "bardzo dobry" targets came in at 9 and 11 instead of 13) — `data/epodreczniki_essays/_pilot/REPORT.md`.
- **The e-podręczniki source lessons themselves contain many factual errors**, catalogued rather than silently corrected, in `data/epodreczniki/ERRATA.md` (dozens of dated/attribution/figure errors across all six books), so downstream question generation explicitly built no questions on flagged fragments.

## People

- **JulianVolodia** (the owner of these notes) — created and completed `data_synthetic` (curriculum, pilot, main 3,600-task set) and `data_destillated_by_claude`; ran/published all three waves of `data_synthetic_extended` and its docs/run scripts; authored the 9-commit "Sync Claude RFT grades" series; wrote/maintains `lora_experiments.md`, `EXPERIMENTS.md`, and the `sync_*.sh` publish scripts. Runs the DeepSeek pipeline and LoRA/RFT/DPO/tournament experiments on the L40S and Runpod.
- **Pawel Cyrta** — built the entire e-podręczniki pipeline: crawler, dataset schema, question extraction/rephrasing scripts and QA, and the 231 model essays with self-assessment (25.09–26.09, commits `f387c3d3`→`49c161f3`; note git shows author name "Pawel Cyrta").
- **Olaf Serafin** (git handle "o-serafin", "Olaf Serafin") — built `data_synthetic_images` end to end: image sourcing from Wikimedia Commons, 4 batches (60 → 180 → 748 → 478 final after review fixes), downscaling, review fixes; merged via PR #4 (commits `d6c5e81e`, `7be0dceb`, `4b31cf5a`, `097fed1a`, merge `9fd342f1`).
- **endote** — wrote the critical review of the generated-essay pipeline (`docs/synthetic-essays-lora-plan.md`, `synthetic_essay_review_findings.json`) on 27.09 and built the newer contract-driven `history-500` essay-generation runs (`output/essay-generation/`) implementing that plan; also touched `matura-histoty-2005-2016` work (commit `26476983`) adjacent to this area.
- **Claude subagents** (via JulianVolodia's sessions) — wrote and verified all of `data_synthetic`'s 3,600 tasks (96 authors + 96 verifiers, workflow `synthetic-matura-history-3600`), and graded every batch in `data_destillated_by_claude/` blind as CKE examiners.
- **DeepSeek `deepseek-flash`** (API, no named human author) — wrote and verified all language content in `data_synthetic_extended/` under JulianVolodia's static Python pipeline; separately used as a calibration/RFT grader for the Wikipedia pool.

## Open issues / limitations

- `data_synthetic_extended`'s Wikipedia RFT pool sampling run is incomplete and its stopping point undocumented (only 849/5,785 nothink and 497/5,815 think jobs logged); not yet folded into any training set.
- `output/essay-generation/history-500-v3` produced no `all_results.jsonl` — status unclear from the files present; v1/v2/v4/v5/v6 have small result counts (10–48) suggesting early/aborted runs before v7 (501) and v8 (252, in progress at ~40% of its $15 budget).
- `docs/synthetic-essays-lora-plan.md` explicitly states no training, essay generation at scale, claim verification, or model evaluation has been run under its plan yet — it is a design/critique document, not a completed pipeline.
- The generic "fixed" flag issue is stated to affect potentially many of the 1,275 `generated|fixed|verifier` wave-2 records, but the plan document explicitly does **not** claim all of them are wrong — only that the process cannot be trusted to certify them without re-review.
- `data_synthetic`'s pilot set (433 tasks) remains unverified and is explicitly marked "do not use" in favour of the main 3,600-task set.
- No independent human (non-LLM) check exists for any of these datasets at the time of writing; e-podręczniki essay self-assessment is checked only by a 6-essay blind pilot, and the Wikipedia fact-checks (`wiki_check/`) are themselves LLM-verified quotes, not human-adjudicated except through a separate `fixes/` step referenced but not detailed in the README.
- `data_destillated_by_claude/README.md` itself states grading/generation "are still running, so the RFT sets aren't complete yet" as of 26.09 — check current line counts before treating any RFT file as final.

## Good quotes or slide-worthy details

- "Fitting the key answers more tightly means more confident made-up details." — `lora_experiments.md`, on why LoRA B (lowest val loss) scored the fewest points and fabricated "Oktawian August pierwszym konsulem".
- "Gemma is ~11 points too lenient." / "Don't choose models with a same-family grader alone." — `data_destillated_by_claude/README.md`, `lora_experiments.md`.
- The July-Crisis mismatch: a Wikipedia-grounded essay task asks about 1914, but its grading key is built from the 1917 Petrograd crisis — caught by the pipeline's own verifier note, yet still published as "fixed" (`scripts/synthetic_essay_review_findings.json`, id `wik-1914_1945-essay-XXXVII-043-1`).
- 22.57 USD in DeepSeek API spend produced 15,113 published, individually fact-checked tasks against two Wikipedia snapshots (7.0 GB SQLite index, 3.1M+ pages) — roughly $0.0015 per task.
- The e-podręczniki source textbooks are themselves riddled with errors the pipeline had to route around — e.g. the ERRATA log flags the Council of Trent lesson as claiming it "proclaimed papal infallibility" (that was Vatican I, 1870).
- 231 lessons → 231 full 15-point matura essays, average 484 words, written and self-graded end to end by one person's pipeline (Pawel Cyrta) in under 24 hours (crawl started 25.09 23:10, essays committed 26.09 23:36).

## Sources consulted

- `WarsawModelTrainersHackathon/data_synthetic/README.md`
- `WarsawModelTrainersHackathon/data_synthetic_extended/README.md`, `PLAN.md`, `PIPELINE.md`, `QA_REPORT.md`, `stats.json`
- `WarsawModelTrainersHackathon/data_synthetic_images/README.md`, `tasks.jsonl`
- `WarsawModelTrainersHackathon/data_destillated_by_claude/README.md`
- `WarsawModelTrainersHackathon/data/epodreczniki.md`, `data/epodreczniki/index.jsonl`, `data/epodreczniki/ERRATA.md`
- `WarsawModelTrainersHackathon/data/epodreczniki_essays/README.md`, `_pilot/REPORT.md`
- `WarsawModelTrainersHackathon/docs/synthetic-essays-lora-plan.md`
- `WarsawModelTrainersHackathon/scripts/synthetic_essay_review_findings.json`
- `WarsawModelTrainersHackathon/lora_experiments.md`
- `WarsawModelTrainersHackathon/output/essay-generation/history-500-v1..v8/` (`contract.json`, `cost-status.json`, `all_results.jsonl`) and `output/essay-evidence/wikipedia-full-2026-09-26/` (dir listings/counts)
- `l40s-results/synthetic/README_data_synthetic.md`
- `l40s-results/wiki_ext-rft/README.md`
- `l40s-results/EXPERIMENTS.md` (sections: grader calibration, LoRA tournament, Wiki RFT pool sampling)
- `l40s-results/sync_synthetic.sh`, `sync_synthetic_extended.sh`, `sync_claude_data.sh`
- `data_destillated_by_claude/dpo/pairs_{nothink,think}.jsonl`, `rft/samples_{nothink,think}.jsonl` (line counts)
- git log (`WarsawModelTrainersHackathon`), commits: `18975717`, `f387c3d3`, `8b0f43be`, `b0d9c80e`, `acfcebcf`,
  `ee6a39ae`, `cd39ed36`, `e8a8f601`, `91d51b48`, `3e558a8f`, `51b1f66f`, `25dc063c`, `3d628baf`, `288aa73b`,
  `b2b361aa`, `e3b4e536`, `95619385`, `fa828aee`, `d2428a8e`, `49c161f3`, `d6c5e81e`, `7be0dceb`, `4b31cf5a`,
  `097fed1a`, `9fd342f1`, `26476983`, `f3ba345a`, `f51268f9`, `eb3283bc`, `87283d60`, `6b6dab53`, and the
  9-commit "Sync Claude RFT grades" series (`f0e41039`, `204ed02c`, `7293fc49`, `91804c7d`, `9ec81314`,
  `26b2b108`, `c6ed473f`, `e5babb64`, `c7a2fcc1`).
