# notes-and-latest-pull

Repo: `WarsawModelTrainersHackathon` (team repo, branch `main`), read at HEAD `6d8d52d7` (pulled 27.09.2026 ~12:10
CEST). All paths below are relative to the repo root:
`/mnt/hgfs/sharedWithKali/ai-thingy-september-26/003B-hackaton/WarsawModelTrainersHackathon`.

## Summary

The repo root holds three short "notes" files that are the team's own narrative of the post-training work.
`notes.md` is a one-line pointer to an academic benchmark paper on the same task (with a title mismatch worth
flagging — see below). `notes_gemma_sft_20260927.md` (Pawel Cyrta, commit `a87bcae2`, 27.09 09:59:04 UTC) reports
one overnight Gemma 3/4 SFT+GRPO line on one H100: ~22k SFT rows, 1,589 distilled teacher traces (84% keep rate),
and a 5-model leaderboard topped by Gemma 4 SFT@think at 70.4% closed-item exact match. `note_bielik_qwen_ministral
_20260927.md` (Pawel Cyrta, commit `855f2d82`, 27.09 10:01:43 UTC) reports a second, parallel line — Bielik-11B v3,
Qwen3.5-9B, Ministral-3 8B — on the same H100: 21.8k RL/SFT prompts, 1,594 distilled traces (85% keep rate, note the
1,589 vs 1,594 discrepancy with the Gemma note), and an 8-repo HF publish with Bielik-11B v3 SFT reaching 77.0%
closed EM (best overall figure in either note). The commit range `16af30c9..6d8d52d7` is dominated by a `src
/posttrain` restructure into a `open_models/` subpackage (Bielik/Ministral/Qwen: build_data, common, eval, grpo,
push_hf, schedule, sft) plus lane scripts, `publish_hf.py`, `eval_closed.py`, a NeMo-RL GRPO LoRA config, and
`unsloth_grpo.py` — done across two merges by Pawel Cyrta ("postrain machine2" / "postrain machine 2 update",
09:53–09:58 UTC) reconciling a prior merge (`1395dd31`, also Pawel Cyrta, 09:47 UTC) that itself resolved a conflict
between a local `posttrain2/` split and origin's reconciliation. A concrete defect: the merge at `606ee08a`
committed `src/posttrain/README.md` with 4 unresolved git conflict markers still in the file, and they are still
there, unfixed, at current HEAD `6d8d52d7` — verified directly on the blob. AGENTS.md's "Current history LoRA
training policy" and "depreciated (DO NOT USE)" sections (dated 27.09.2026) explain why the notes call out "newly
deprecated synthetic data sources": three named HF datasets/snapshots were excluded from training that same day
for provenance/leak reasons (a thinking trace reasoning about a missing map, an image-attribution leak, and
examiner guidance baked into essay targets).

## Timeline (UTC unless noted; source repo commit times are UTC per `git log`)

- 26.09.2026 00:21:17 +0200 (local) — endote, commit `d2a9e3b5` "paper + codes": adds the external paper repo
  `src/lostInHistoricalTime/history-matura-llm-evaluation-39B4/` (README, essays, indexes, per-model essay outputs,
  pyproject, uv.lock). Source: `git show -s --format="%H%n%an%n%ai%n%B" d2a9e3b5`.
- 26.09.2026 01:28:18 +0200 — Pawel Cyrta, commit `3215a8ca` "source url links to cke resources": last commit
  touching `notes.md` (per `git log --follow`).
- 26.09.2026 17:20:31 +0200 — endote, commit `cfe37663` "eval 2017-2026 + grading set": a large, mostly unrelated
  commit (3169 files, 18598 insertions) that also drops more `text_sources/*.txt` files and an updated `uv.lock`
  into the same `history-matura-llm-evaluation-39B4/` paper folder. Source: `git show --stat cfe37663 -- src
  /lostInHistoricalTime`.
- 27.09.2026 04:55–07:27 UTC — Szymon Hajderek / szymon-hajderek / hiderr: Qwen3.8-27B LoRA-on-IQ2_S pipeline
  (`training/`), the LoRA bench queue (`scripts/lora_bench_queue/`), Wikipedia RAG + image-search service docs
  (`COMMUNICATION.md`, `rag_integration/RAG_USAGE.md`) — all inside the `16af30c9..6d8d52d7` range but a separate
  thread of work from the notes/posttrain restructure. Source: `git log --oneline 16af30c9..6d8d52d7`.
- 27.09.2026 07:09 UTC — JulianVolodia, commit `9ed0effa` "harness: Wikipedia retrieval (--retrieval on) +
  matura-rag bench harness" (timestamp per commit shows `2026-09-27 10:46:44 +0200`; note the author line's local
  offset — this is the commit the team pulled *to* on the prior 27.09 pull, per AREA description "9ed0effa →
  6d8d52d7").
- 27.09.2026 09:47:11 UTC — Pawel Cyrta, commit `1395dd31` "Merge origin/main: adopt the reconciled posttrain
  layout" (merge of `16af30c9` and `9ed0effa`; Co-Authored-By: Claude Opus 5.5). Resolves a second round of
  posttrain conflicts between a local `src/posttrain2/` split and origin's reconciliation at `747355a8`; keeps
  `eval_closed.py`, `publish_hf.py`, night/morning lane scripts locally. `tests/test_posttrain_merge.py`: 14 passed,
  2 failed (same 2 fail on clean origin/main — "the semantic adjudication gate now blocks the DeepSeek reward they
  expect"). Source: `git show -s 1395dd31`.
- 27.09.2026 09:53:18 UTC — Pawel Cyrta, commit `7b501fdd` "postrain machine2": moves Gemma-only files
  (`build_data.py`, `common.py`, `eval.py`) out and creates `src/posttrain/open_models/` (README, `__init__.py`,
  `build_data.py`, `common.py`, `eval.py`, `push_hf.py`); renames `grpo.py`, `schedule.py`, `sft.py` into
  `open_models/`. Net: 14 files changed, 715 insertions(+), 550 deletions(-). Source: `git show --stat 7b501fdd`.
- 27.09.2026 09:58:38 UTC — Pawel Cyrta, commit `606ee08a` "postrain machine 2 update" (merge of `7b501fdd` and
  `1395dd31`). **`src/posttrain/README.md` is committed here with 4 unresolved `<<<<<<<`/`=======`/`>>>>>>>`
  conflict markers** (verified: `git show 606ee08a:src/posttrain/README.md | grep -c '<<<<<<<'` → 4).
- 27.09.2026 09:59:04 UTC — Pawel Cyrta, commit `a87bcae2` "note from training gemma": adds
  `notes_gemma_sft_20260927.md` (parent `1395dd31`, so this branch's README.md has 0 conflict markers).
- 27.09.2026 10:01:43 UTC — Pawel Cyrta, commit `855f2d82` "note about bielik qwen ministral sft grpo training":
  adds `note_bielik_qwen_ministral_20260927.md` (parent `606ee08a`, so this branch's README.md still carries the
  4 conflict markers).
- 27.09.2026 10:01:55 UTC — Pawel Cyrta, commit `6d8d52d7` "Merge branch 'main' of .../Endote/...": merges
  `a87bcae2` and `855f2d82`. This is current HEAD. **The conflict markers from `606ee08a` survive into this merge
  unresolved** (verified on the HEAD blob directly: `git show HEAD:src/posttrain/README.md | grep -n
  '<<<<<<<\|=======\|>>>>>>>'` → 4 marker triples at lines 4/6/10, 15/20/23, 39/41/43, 52/62/140).

## Key numbers

| Label | Value | Source |
|---|---|---|
| Gemma note: SFT training data | ~22k rows | `notes_gemma_sft_20260927.md` "Data" section |
| Gemma note: answer-key extraction | 624 answer keys, 2005–2016, extracted by the 31B model | `notes_gemma_sft_20260927.md` |
| Gemma note: teacher distillation | gemma-4-31b@think, 4 answers/question, 31B judge keeps best | `notes_gemma_sft_20260927.md` |
| Gemma note: verified traces | 1,589 traces, 84% keep rate | `notes_gemma_sft_20260927.md` |
| Gemma note: validation set size | 321 closed items | `notes_gemma_sft_20260927.md` results table header |
| Gemma note: Gemma 4 SFT@think | 70.4 | `notes_gemma_sft_20260927.md` results table (bold, top) |
| Gemma note: Gemma 3 SFT → GRPO (step 25) | 68.2 | same table |
| Gemma note: Gemma 3 SFT | 66.4 | same table |
| Gemma note: Gemma 4 base@think | 57.0 | same table |
| Gemma note: Gemma 3 base | 45.5 | same table |
| Gemma note: SFT gain over base | ~20 points | `notes_gemma_sft_20260927.md` "Results" bullet |
| Gemma note: merge-conflict cost | ~5 GPU-hours (overnight) | `notes_gemma_sft_20260927.md` "Lessons learned" |
| Bielik/Qwen note: RL/SFT prompts | 21.8k | `note_bielik_qwen_ministral_20260927.md` §2 |
| Bielik/Qwen note: validation items | 682 | same, and echoed in `open_models/README.md` `eval_val` row |
| Bielik/Qwen note: textbook Q&A | 20.3k | `note_bielik_qwen_ministral_20260927.md` §2 |
| Bielik/Qwen note: verified traces | 1,594 from 1,884 prompts, 85% yield rate | `note_bielik_qwen_ministral_20260927.md` §2 |
| Bielik/Qwen note: mean teacher reward | 0.78 | `note_bielik_qwen_ministral_20260927.md` §2 |
| **Discrepancy** | Gemma note says 1,589 traces (84%); Bielik/Qwen note says 1,594 traces (85%) from 1,884 prompts — the Bielik/Qwen note is the later commit (`855f2d82`, 10:01:43 UTC vs `a87bcae2`, 09:59:04 UTC) so it is the newer figure, but the notes do not reconcile the two numbers themselves | both notes, per commit timestamps above |
| SFT data (`sft_train`) | 7.9k rows | `note_bielik_qwen_ministral_20260927.md` §3 table; also `src/posttrain/open_models/README.md` |
| GRPO closed data (`grpo_closed`) | 4.0k items | `note_bielik_qwen_ministral_20260927.md` §3 table; `open_models/README.md` |
| Validation: closed items | 317 out of 682 | `note_bielik_qwen_ministral_20260927.md` §3 table header |
| Bielik-11B v3: base | 13.3 | `note_bielik_qwen_ministral_20260927.md` §3 table |
| Bielik-11B v3: SFT | **77.0** (bold = best in this note) | same table |
| Bielik-11B v3: SFT→GRPO | 74.8 | same table |
| Bielik-11B v3: GRPO from base | 71.3 | same table |
| Qwen3.5-9B (no-think): base | 61.2 | same table |
| Qwen3.5-9B: SFT | 75.4 | same table |
| Qwen3.5-9B: SFT→GRPO | 73.8 | same table |
| Ministral-3 8B: base | 8.8 | same table |
| Ministral-3 8B: SFT | 72.6 | same table |
| Ministral-3 8B: SFT→GRPO | 62.2 | same table |
| Ministral-3 8B: GRPO from base | 69.4 | same table |
| Exam-like slice (n=44, real June 2026 + Dec 2024) | Ministral GRPO-from-base 50.0; Qwen base 45.5; Bielik SFT→GRPO 43.2 | `note_bielik_qwen_ministral_20260927.md` §3, paragraph after the table |
| HF publish: Bielik SFT | 77.0 | `note_bielik_qwen_ministral_20260927.md` §4 table |
| HF publish: Qwen3.5-9B SFT | 75.4 | same |
| HF publish: Bielik SFT→GRPO | 74.8 | same |
| HF publish: Qwen3.5-9B SFT→GRPO | 73.8 | same |
| HF publish: Ministral SFT | 72.6 | same |
| HF publish: Bielik GRPO-from-base | 71.3 | same |
| HF publish: Ministral GRPO-from-base | 69.4 | same |
| HF publish: Ministral SFT→GRPO | 62.2 | same |
| Storage: merged bf16 weights | 18–23 GB each, filled ~100 GB org quota | `note_bielik_qwen_ministral_20260927.md` §4 |
| Storage fix: adapter-only upload | 0.3–0.5 GB | `note_bielik_qwen_ministral_20260927.md` §4 |
| Gemma 4 QLoRA smoke: model size / params | 4-bit, 7 GB, 131M trainable params | `note_bielik_qwen_ministral_20260927.md` §5 |
| Gemma judge leniency vs Claude grading | ~11 points too lenient | `note_bielik_qwen_ministral_20260927.md` §6; echoed in AGENTS.md ("the Gemma grader is ~11 points too lenient") |
| Posttrain restructure diff (`7b501fdd`) | 14 files changed, +715/-550 | `git show --stat 7b501fdd` |
| Unresolved conflict markers at HEAD | 4 triples (12 marker lines) in `src/posttrain/README.md` | `git show HEAD:src/posttrain/README.md` (lines 4/6/10, 15/20/23, 39/41/43, 52/62/140) |
| Paper commit size | `d2a9e3b5`: adds full paper repo (essays, indexes, per-model outputs, uv.lock) | `git show --stat d2a9e3b5` |
| Paper reference | arXiv 2608.12343 | `notes.md` |

## Components (files, scripts, models, datasets)

- `notes.md` (repo root) — one-line pointer: paper title "Lost in Historical Time? A Polish History Matura
  Benchmark for Large Language Models", `https://arxiv.org/pdf/2608.12343`, describes evaluating "eight leading
  LLMs" on three official 2023–2025 Matura papers. Last touched by commit `3215a8ca` (26.09 01:28:18 +0200).
- `src/lostInHistoricalTime/history-matura-llm-evaluation-39B4/` — the cloned/extracted companion code repo for
  that paper. Its own `README.md` gives a **different** paper title: "Large Language Models Pass the History Exam
  But Miss the «History»: A Polish Matura/High School Exit Exam Benchmark" (submitted to EMNLP 2026). Contains
  `essays/`, `indexes/` (per-year CSV indexes), `outputs/` (per-model essay generations: claude-3.7-sonnet,
  claude-sonnet-4.6, gemini-2.5-pro-preview, gemini-3.1-pro-preview, gpt-4o, gpt-5.4, grok-4, grok-4.20 — i.e. 8
  models, matching notes.md's "eight leading LLMs"), `photo_sources/`, `questions/`, `random/`, `text_sources/`,
  `run_inference.sh`, `pyproject.toml` (`history-matura-llm-evaluation`, requires-python `>=3.11`, dep
  `openai>=2.30.0`), `uv.lock`. Also present as a same-named zip `history-matura-llm-evaluation-39B4.zip` (17.3 MB)
  next to the extracted folder. Added by `d2a9e3b5` (endote), extended by `cfe37663` (endote).
- `notes_gemma_sft_20260927.md` (repo root) — Pawel Cyrta's Gemma post-training note, commit `a87bcae2`.
- `note_bielik_qwen_ministral_20260927.md` (repo root) — Pawel Cyrta's Bielik/Qwen/Ministral note, commit
  `855f2d82`.
- `src/posttrain/` — the Gemma 4 post-training package: `README.md` (**currently has unresolved merge-conflict
  markers, see Decisions/incidents**), `build_data.py`, `build_essays.py`, `build_model_data.py`, `build_sft.py`,
  `common.py`, `deepseek_reward.py`, `distill.py`, `eval.py`, `eval_closed.py`, `eval_models.py`, `export.py`,
  `extract_keys.py`, `models.py`, `publish_hf.py`, `queue_overnight.sh`, `reward.py`, `serve_judge.sh`,
  `unsloth_grpo.py`, `unsloth_sft.py`, plus lane scripts `lane_after_A.sh`, `lane_answers.sh`, `lane_morning.sh`,
  `lane_publish.sh`, and subfolders `envs/`, `history_v2/` (a separate "all-data, image-aware pipeline" referenced
  from the still-conflicted README as the one to "use ... for the new Nebius H100 training" — not read in depth,
  out of this task's declared scope), `nemo/` (NeMo-RL GRPO environment/config), `open_models/`.
- `src/posttrain/open_models/` — created in commit `7b501fdd`, holds the Bielik/Ministral/Qwen line: `README.md`,
  `__init__.py`, `build_data.py`, `common.py`, `eval.py`, `grpo.py`, `push_hf.py`, `schedule.py`, `sft.py` (per
  `git show --stat 7b501fdd`, `ls`).
- `src/posttrain/nemo/` — NeMo-RL DTensor LoRA GRPO setup: `HistoryExamEnvironment` (a Ray actor), processor, data
  prep, `configs/grpo_lora.yaml` (per `src/posttrain/README.md`'s Files section).
- Models referenced: `google/gemma-4-12B-it-qat-q4_0-unquantized` (Gemma 4 12B QAT student), `gemma-4-31B-it` /
  `gemma-4-31b` QAT w4a16 (teacher + RL/eval judge, served on local vLLM), `Gemma 3 12B`, `speakleash/Bielik-11B-
  v3.0-Instruct`, `mistralai/Ministral-3-8B-Instruct-2512-BF16`, `Qwen/Qwen3.5-9B` — all per the two notes and
  `open_models/README.md`.
- HF org `WMTH-100d2exam` (private): per the Gemma note, `gemma-4-12B-it-qat-matura-history-sft-lora-r32` (+ vision
  SFT, Gemma 3 SFT, Gemma 3 SFT→GRPO adapters); per the Bielik/Qwen note, 8 named repos (see Key numbers table for
  each with its validation score).

## Decisions, incidents and lessons

- **Unresolved merge-conflict markers committed to `main` and still present at HEAD.** `src/posttrain/README.md`
  was committed with 4 sets of literal `<<<<<<<`/`=======`/`>>>>>>>` git conflict markers at commit `606ee08a`
  ("postrain machine 2 update", Pawel Cyrta, 27.09 09:58:38 UTC), and they are still there, unfixed, at the current
  HEAD `6d8d52d7` (verified on the live blob: `git show HEAD:src/posttrain/README.md | grep -n '<<<<<<<\|=======\|
  >>>>>>>'` returns 12 marker lines). Net effect: the file currently reads as two overlapping, contradictory
  versions of the pipeline docs (e.g. one side says "Teacher and RL judge: gemma-4-31B-it ... Thinking stays on",
  the other says "All training grading now requires deepseek-flash-high@think; the optional local 31B model is a
  teacher only" — a real policy conflict, not just a docs glitch).
- **Parallel-agent merge conflicts cost ~5 GPU-hours overnight** on the Gemma line, per `notes_gemma_sft_20260927
  .md` "Lessons learned": "Parallel agents editing the same repo caused merge conflicts, which cost ~5 GPU-hours
  overnight."
- **Gemma 4 has thin library support.** Unsloth + vLLM, FlashAttention (head dim 512) and NeMo-RL each needed
  fixes, per `notes_gemma_sft_20260927.md`. `note_bielik_qwen_ministral_20260927.md` §1 gives specifics for the
  open-model line: Unsloth pins transformers ≤5.5 but Gemma 4 needs ≥5.10 (fixed via `envs/overrides.txt`); a vLLM
  Pixtral patch was needed for Ministral-3; `flash-linear-attention` was needed for Qwen3.5's DeltaNet layers.
- **Validation loss is not a proxy for exam score.** `notes_gemma_sft_20260927.md`: "Validation loss rose while
  exact match held steady, so loss on key wording isn't the exam score."
- **SFT gives by far the largest gain; GRPO on closed questions after SFT gave no further gain and hurt Ministral.**
  `note_bielik_qwen_ministral_20260927.md` §3 "Takeaways": Bielik 13%→77%, Ministral 9%→73% from SFT alone (both
  base models scored 0% on rephrased real papers); "Closed-question GRPO after SFT didn't add anything, and it hurt
  Ministral (72.6 → 62.2). GRPO from the base model recovers most of the SFT gain on its own." Qwen3.5-9B is
  flagged as the strongest base model, whose fine-tunes don't yet beat it on real exam papers.
- **Storage incident:** first HF pushes uploaded merged bf16 weights (18–23 GB each) and filled the org's ~100 GB
  private quota; fixed by `push_hf.py --adapter_only` (adapter + card only, 0.3–0.5 GB). Source:
  `note_bielik_qwen_ministral_20260927.md` §4.
- **Deprecated training data sources (27.09.2026, explicit user decision), per `AGENTS.md` "depreciated (DO NOT
  USE)"** — the reason the Gemma note flags "retraining without the newly deprecated synthetic data sources" as
  still open:
  - `WMTH-100d2exam/history-lora-data-2201` (and its SFT/RFT derivatives): excluded — its stored thinking response
    for `historia-2019-maj-matura-stara-rozszerzona:2.2` reasons about a missing map.
  - `WMTH-100d2exam/data_synthetic_image` and `data_synthetic_image-2201`: excluded — the example
    `syn-img-starozytnosc-01` leaks identifying image information through the attribution; the snapshot is called a
    duplicate, not a repaired dataset.
  - `WMTH-100d2exam/data_synthetic_extended-2201`: excluded from the new training corpus — `generated/*/essay_*
    .jsonl` puts examiner guidance into `key_answer`, which must never become an assistant essay training target.
  - AGENTS.md is explicit these are *logical training exclusions*, not deletions, and that a replacement needs
    separate provenance/review.
  - `AGENTS.md` also records `benchmark/exams_output` as separately deprecated ("DO NOT USE"), unrelated to the
    synthetic-data decision.
- **Grading policy conflict visible in the repo itself:** `AGENTS.md` mandates `deepseek-flash-high@think` as the
  only grader for exam attempts and forbids a local/Gemma judge fallback; the un-merged `src/posttrain/README.md`
  still has one surviving side ("HEAD") describing the local 31B model as "Teacher and RL judge" with "Thinking
  stays on for the student" as if that were still current — direct evidence the merge conflict was never actually
  reconciled against current policy.
- **`AGENTS.md` "Current history LoRA training policy (2026-09-27)"** (cross-checked, all dated 27.09.2026):
  authorizes full training on `source_trusted_training` records without factual-review receipts after the user's
  "OKAY, now RUN !!!"; separately authorizes H100 technical smoke tests on `technical_smoke_only` provenance; pins
  the QAT parent `google/gemma-4-12B-it-qat-q4_0-unquantized` for adapters deployed on the Q4_0 GGUF, targeting
  Nebius H100 + llama.cpp; removes holdout restrictions for the *new* training corpus (all valid source splits may
  train, provenance retained, dedup required — trained-exam scores are diagnostic, not held-out estimates); requires
  images/source text to reach the multimodal processor (no silent text-only substitution); restates
  `deepseek-flash-high@think`-only grading with an abort-on-failure rule; and sets a "P0 semantic audit gate" — no
  proposed score may be used as an RL reward/correction weight until a named human has adjudicated it, with a named
  unresolved case ("May 2026 Q24's pouring/helmet/candle discrepancy") explicitly quarantined pending human review.

## People

(Names exactly as they appear in `git log`.)
- **Pawel Cyrta** — author of both notes (`a87bcae2`, `855f2d82`) and of the posttrain restructure/merge commits
  (`1395dd31`, `7b501fdd`, `606ee08a`, `6d8d52d7`) in this range.
- **endote** — added the paper repo (`d2a9e3b5`) and the large eval/grading commit that also touched it
  (`cfe37663`).
- **JulianVolodia** — authored `9ed0effa` (Wikipedia retrieval + matura-rag harness), which the AREA description
  identifies as the "9ed0effa" endpoint of the prior pull.
- **Szymon Hajderek** / **szymon-hajderek** — Qwen3.8-27B LoRA-on-IQ2_S pipeline and the LoRA bench queue, in the
  same commit range but a separate thread (per `git log --oneline 16af30c9..6d8d52d7`).
- **hiderr** — Wikipedia RAG + image-search service docs commit (`91207b7a`), same range.
- (Olaf Serafin is named in the roster of expected authors but did not appear as a committer in the
  `16af30c9..6d8d52d7` range checked here.)

## Open issues / limitations (as stated in the sources)

- Gemma note "Still open": full exam grading with DeepSeek (needs the API key); Gemma 4 SFT→GRPO results not yet
  in; retraining without the newly deprecated synthetic data sources.
- Bielik/Qwen note §6 "Open items": graded exam scores are still missing because the training box didn't have the
  DeepSeek API key (grading must use `deepseek-flash-high@think` per team rule); reward design for open questions
  needs the 31B judge calibrated against Claude grades first, since "a Gemma judge was about 11 points too lenient."
- Bielik/Qwen note §3 "Limitation": exact match measures only closed questions; open questions and essays (most of
  the exam's points) need the graded bench.
- Bielik/Qwen note §5 "Gemma 4 12B line (status)": marks the Gemma 4 QLoRA/LoRA smoke test and thinking-format
  confirmation as **Done**, but QLoRA SFT-with-thinking-then-GRPO as **Next** (not yet run at the time of writing).
- `src/posttrain/README.md` is, as currently checked in, an unresolved merge (see Decisions/incidents) — anyone
  reading it must decide by inspection which "side" is current; this is itself an open item, not documented as
  such anywhere.
- AGENTS.md quarantines one specific grading discrepancy pending human adjudication (May 2026 Q24, "pouring/helmet
  /candle discrepancy") and states a passing audit sample does not approve unsampled scores generally.

## Good quotes or slide-worthy details

- "We evaluate eight leading LLMs on the Polish high school exit exam (Matura) in history - three official papers
  from 2023-2025" — `notes.md`, describing the paper the team is explicitly positioning its own benchmark against.
- Two different titles for what `notes.md` treats as the same arXiv paper (2608.12343): "Lost in Historical Time?
  A Polish History Matura Benchmark for Large Language Models" (`notes.md`) vs. "Large Language Models Pass the
  History Exam But Miss the «History»: A Polish Matura/High School Exit Exam Benchmark" (`src/lostInHistoricalTime
  /history-matura-llm-evaluation-39B4/README.md`, "submitted to EMNLP 2026") — a real, sourced discrepancy.
  Both texts trace to the same repo snapshot; worth flagging rather than picking one silently.
  If the presentation needs the arXiv paper title, verify it against arxiv.org directly rather than either note.
- "Bielik goes from 13% to 77% and Ministral from 9% to 73%. Much of that is learning the CKE answer format (both
  base models scored 0% on the rephrased real papers)." — `note_bielik_qwen_ministral_20260927.md` §3.
- "Closed-question GRPO after SFT didn't add anything, and it hurt Ministral (72.6 → 62.2)." — same note,
  same section: a clean, quotable negative result.
- The repo's own docs currently contradict each other on grading policy — one committed-but-unmerged half of
  `src/posttrain/README.md` still names the local 31B model as judge, the other (and `AGENTS.md`) mandates
  `deepseek-flash-high@think` only. Good "even the docs got merge-conflicted" beat for a talk about a fast,
  multi-agent hackathon.
- Three separate teacher/distillation figures across the two notes on the very same "31B teacher, reject below
  0.8" idea (1,589 traces/84%; 1,594 traces/85% from 1,884 prompts) — a small but real number mismatch between two
  notes written two minutes apart by the same author.
- 8 private HF model repos shipped overnight (`WMTH-100d2exam`), each with a documented validation score, for three
  different open base models, on top of the parallel Gemma 4 line — a concrete "how much did the team ship in one
  overnight H100 run" number.

## Sources consulted

- `notes.md` (root)
- `notes_gemma_sft_20260927.md` (root)
- `note_bielik_qwen_ministral_20260927.md` (root)
- `AGENTS.md` (root) — "Current history LoRA training policy (2026-09-27)" and "depreciated (DO NOT USE)" sections
- `src/posttrain/README.md` (current, conflicted, at HEAD)
- `src/posttrain/open_models/README.md`
- `src/lostInHistoricalTime/history-matura-llm-evaluation-39B4/README.md`
- `src/lostInHistoricalTime/history-matura-llm-evaluation-39B4/pyproject.toml`
- `ls -la` on repo root, `src/`, `src/posttrain/`, `src/posttrain/history_v2/`,
  `src/lostInHistoricalTime/`, `src/lostInHistoricalTime/history-matura-llm-evaluation-39B4/`
- `git log -1` (HEAD identity), `git status` (untracked `wb_tries/` only, no local edits)
- `git log --oneline 16af30c9..6d8d52d7` and `git log --stat 16af30c9..6d8d52d7`
- `git show -s --format=... a87bcae2 / 855f2d82 / 606ee08a / 6d8d52d7 / d2a9e3b5 / cfe37663` (author, date, message,
  parents)
- `git show --stat d2a9e3b5`, `git show --stat cfe37663 -- src/lostInHistoricalTime`, `git show --stat 7b501fdd`
- `git log --graph --oneline -20 a87bcae2` (branch topology)
- `git log --follow --format=... -- notes.md`
- `git show <rev>:src/posttrain/README.md | grep -c/-n "<<<<<<<..."` for `6d8d52d7`, `a87bcae2`, `606ee08a`,
  `1395dd31`, `9ed0effa`, `16af30c9` (conflict-marker verification)
