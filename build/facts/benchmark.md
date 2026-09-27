# benchmark

## Summary

`benchmark/` (inside the team repo `WarsawModelTrainersHackathon`, branch `main`) is the team's LLM-as-judge
evaluation harness for the Polish history matura, extended level. It runs a set of exams against a roster of
OpenAI-compatible models (paid APIs, OpenRouter, and self-hosted vLLM/llama.cpp servers on the team's GPU host
`81.85.1.173`) through one or more **harnesses** (how a question is put to the model), then grades the answers
with an LLM judge (DeepSeek `deepseek-flash`, mostly `deepseek-flash-high@think` per team rule) that scores every
question 0..max and returns a rationale. It supports answering now and grading later (`--no-judge` +
`--grade`), resuming a stopped run, merging runs into one leaderboard, and reports (`report.html`) with All /
Essay / Non-essay views. It matters because it is the team's only way to compare self-hosted candidate models
(their fine-tuning targets) against strong API baselines on the actual exam format, and because two internal
audits found the obvious in-house judge (the Gemma 4 model itself, and even DeepSeek to a lesser extent) is not
fully trustworthy, which changed how later results were graded (Claude subagents as the reference).
Built almost entirely 25–27.09.2026, evolving from a single-file script to a harness-pluggable, vision-capable,
ClearML-tracked runner with ~40 dedicated commits.

## Timeline

- 25.09.2026 22:28 (+0200) — `928cf6bd` (Szymon Hajderek, co-authored Claude Opus 5.5): first version, `bench.py`
  — runs a JSONL exam against OpenAI-compatible models, judge model, rich results table.
- 25.09.2026 22:31 — `727a2164` — judge switched to whole-exam-at-once (one JSON reference + all Q&A pairs),
  one score per (model, exam), multiple exams supported.
- 25.09.2026 22:54 — `42babc2d` — benchmark code moved into `benchmark/` directory.
- 26.09.2026 06:27 — `4ef29202` — first "real" milestone: results for **19 models** merged into a committed
  `RESULTS.html`; `tools/` (exams, add_gradings, viz, merge) and `serve/` (Bielik, PLLuM vLLM scripts) laid out;
  `conf/` run configs; deps moved to `pyproject.toml` extras.
- 26.09.2026 06:46 — `0b0f6a9e` — thinking-mode support (`name@think`/`name@nothink`, `--modes`), Gemma 4 12B +
  small-Qwen serving, RESULTS.html grows to 25 rows.
- 26.09.2026 11:20 — `087eb55b` — every result column labelled `name@mode`, not just thinking-capable models.
- 26.09.2026 12:45 — `595282ab` — small-Qwen run added, RESULTS.html to 31 columns; note: "Qwen3.5 thinking modes
  score ~0: nearly every answer hits max_tokens while still thinking."
- 26.09.2026 12:45 — `8dedb8b9` — configs/serving for Qwen3 4B, Gemma 4 12B, E4B and 12B-QAT (bf16, the LoRA base).
- 26.09.2026 13:06 — `8793c323` — Gemma 4 12B QAT served as the **real Q4_0 GGUF** via llama.cpp
  (`serve/serve_gemma_q4.sh`, :8017), separate from the shared LoRA server on :8000.
- 26.09.2026 11:49–11:50 (+0000) — `35a115ab` (Q4_0+LoRA on :8019, and w4a16 on vLLM :8018), `62f7044a` — serves and
  benches the then-best LoRA, `history-lora v3-rft` step 51 on :8020; note "v3-rft step 51 is the best adapter on
  val v2 (Claude grading, 41.4% vs 39.1% for the base, no thinking)."
- 26.09.2026 14:01 (+0200) — `40a7d79a` — RESULTS.html reaches **34 columns**: merges
  `results/20260926_132848_gemma-4-12b-q4` (base Q4_0 GGUF: think 72.9% / nothink 68.1%) and
  `results/20260926_135335` (`gemma-4-12b-q4-rft@nothink`: 62.6%) into `results/20260926_140500_merged`. This is
  the **last commit to touch `benchmark/RESULTS.html`** — it is deleted three commits later.
- 26.09.2026 19:30 — `b5b70364` (co-authored Cursor) — exam packages (organizers' history-2023 mock), rubric
  packaging, `eval-2017-2026`/`mock` configs, `ssh-serve-bench.sh` helper.
- 26.09.2026 20:12 (+0200) — `b2f011db` (JulianVolodia, co-authored Claude Opus 5.5, 1M context) — **harness axis**:
  `benchmark/harnesses/` (`plain` = byte-identical original prompt checked on 59 exams/1736 items/1202 images;
  `matura` = the team's submission solver `harness/matura.py` imported as-is, over its OpenAI-compatible or native
  Ollama transport); `--no-judge` + `submissions/`; `--grade <run>` (+ `--regrade`); `tools/exams.py`;
  `tests/test_bench_harness.py` (fake OpenAI + Ollama server, no keys).
- 26.09.2026 20:20 — `a8153834` — `check_exam(exam)` hook: every pack is run through the solver's own
  `--dry-run` package check before any question is asked. "All 41 local packs … pass it, in about a second."
  First real (model, harness) run: `gemma-4-12b-q4-rft` via `matura`, `--no-judge`, on `history-2023-maj`:
  37/37 answered, 0 cut off, 0 blanked, submission passes `harness/matura.py --validate` (ClearML `HCKT/bench`,
  task `b345371a6ffd4accbb5c2fc2ba178e2b`). Saved locally as `results/20260926_201753`.
- 26.09.2026 21:13 — `77b153b3` (endote) — "39 evaled runs of gemma4, data science, benchmark building": **deletes
  `benchmark/RESULTS.html`** (-103 lines) and replaces the reporting path with `tools/report.html` +
  `tools/task_types.py` + a rewritten `tools/viz.py` (+198/-? lines); adds large evaluation/grading artefact trees
  under `output/`.
- 26.09.2026 21:44 (+0200) — `24beec10` (JulianVolodia, co-authored Claude Opus 5.5) — **vision on llama.cpp**:
  `VISION=1 serve/serve_gemma_q4.sh` adds `--mmproj` + `-b/-ub 2048` (default `-ub 512` aborts the server on the
  first image >512 tokens: `GGML_ASSERT … non-causal attention requires n_ubatch >= n_tokens`); `*-vision`
  models.yaml entries (:8026/:8027/:8028); `tools/vision_check.py`. Verified on L40S (llama.cpp `4b1a27f`, CUDA)
  and Mac (Homebrew `b10964`, Metal): 37/37 answered with all 31 images sent, both submission files valid
  (ClearML task `0adad34d04494a9598d487e541c565ec`). Saved locally as `results/20260926_212615`.
- 26.09.2026 22:06 (+0200) — `610ed6fa` (endote) — "gemma4-rft-step51-latest16-v1 40 matura results"; adds the
  README's "Essay and non-essay report views" section and the (never-committed) `RESULTS/corrected_RESULTS.html`
  reference; large `harness/matura.py` changes (+237/-? lines) and grading-report artefacts.
  (`77b153b3` is 21:13, `610ed6fa` 22:06 — later, so its README edits are current at HEAD.)
- 26.09.2026 23:23 (+0000) — `43da6220` (Szymon Hajderek) — Qwen3.5-2B overfit LoRA r8 ckpt-225 benched on all 40
  evaluation packs 2017–2026 with images, nothink, matura harness, judged by `deepseek-flash-high`.
- 27.09.2026 00:01 (+0000) — `e4f775ff` (Szymon Hajderek) — Qwen3.5-2B vLLM baseline vs. overfit-v1 LoRA r8 lr1e-4
  step 570, benched on the latest 5 papers.
- 27.09.2026 (afternoon-evening, per `l40s-results/EXPERIMENTS.md`) — Claude-subagent blind grading of **499**
  answers finds the Gemma-4 judge ~11 points too lenient; later, DeepSeek-flash is calibrated against Claude
  (89.8% exact-point agreement) and adopted as an acceptable RFT-pool grader.
- 27.09.2026 — `9ed0effa` (JulianVolodia, current `main` HEAD at time of writing) — Wikipedia retrieval
  (`--retrieval on`) + new `matura-rag` bench harness.
- (unmerged, local branch `harness-tuned`, commit `83895478`, one commit ahead of `9ed0effa`) — a fourth harness,
  `matura-tuned`: tunes the system prompt with explicit CKE scoring rules and adds an essay-length revision call,
  because on `history-2026-czerwiec` the IQ2_S model wrote 206–251-word essays against a 300-word target (0 points
  on the coherence criterion). **Not on `main`**; on disk in the checked-out repo, `benchmark/harnesses/matura-tuned/`
  currently holds only a stale `__pycache__` (no `harness.py` — it isn't tracked on `main`).

## Key numbers

| Label | Value | Source |
|---|---|---|
| Evaluation packs used by current configs | 40 (`../data/evaluation-2017-2026/*`), 1400 items, 2120 points | `benchmark/README.md` "Exams" section |
| Evaluation/grading packs on disk | 40 `exam.json` + 40 `grading.json` | `git ls-files data/evaluation-2017-2026 \| grep -c exam.json`, same for `data/grading-2017-2026` |
| Older extractor dataset | 1172 questions, 33 exams (2018–2026) | `wc -l benchmark/exams_output/questions.jsonl` (1172 lines); outer `003B-hackaton/CLAUDE.md` |
| `exams_claude_extracted/` files | 11 (10 real exams 2017–2026 + `example.json`) | `ls benchmark/exams_claude_extracted` |
| Local `results/` run folders on disk now | 2 (`20260926_201753`, `20260926_212615`), gitignored | `ls benchmark/results` |
| Last committed `RESULTS.html` size (before deletion) | 34 model@mode columns, 272 records over 8 exams (2019–2026 May + 2020 June) | `git show 40a7d79a:benchmark/RESULTS.html`, parsed `const RECS` |
| Best score in that leaderboard | `deepseek-flash-high@think` 244/248 = **98.4%** | same RECS parse |
| Worst score in that leaderboard | `qwen3.5-0.8b@think` 0/248 = **0.0%** | same RECS parse |
| `gemma-4-12b-q4` (base Q4_0 GGUF) in that leaderboard | nothink 170/248 = 68.5%; think 182/248 = 73.4% | same RECS parse (commit msg rounds to 68.1%/72.9%) |
| `gemma-4-12b-q4-rft@nothink` (then-best LoRA) in that leaderboard | 159/248 = **64.1%** by exact points-ratio (commit `40a7d79a` states **62.6%**, likely a mean-of-exam-% figure — two figures, same run, not reconciled in the repo) | same RECS parse vs. commit message |
| v3-rft step 51 vs base, val v2, Claude grading (no thinking) | 41.4% vs 39.1% | commit `62f7044a`; `lora_experiments.md` "RFT" |
| v3-rft-think step 63 vs base_think, val v2.1, Claude grading | 44.5% vs 49.2% (best LoRA, still ~6 pts below base_think) | `l40s-results/EXPERIMENTS.md` "RFT thinking" |
| Gemma-4 grader vs Claude blind grading, val v2 (111 tasks/128 pts) | base_think 53.9% (Gemma) vs 49.2% (Claude); base 50.8% vs 39.1%; LoRA A 51.6% vs 37.5%; LoRA B 44.5% vs 35.2% | `lora_experiments.md` "The LLM grader must be checked"; `l40s-results/EXPERIMENTS.md` "Blind grading" |
| Gemma-vs-Claude agreement / bias | exact agreement 85%; Gemma higher 67×, lower 9× when they differ; "~11 points too lenient" | `l40s-results/EXPERIMENTS.md` |
| DeepSeek-flash vs Claude grading calibration (728 answers, $0.10) | exact points 89.8%; mean |diff| 0.10 pts; "full points" precision 0.88 / recall 0.94 | `l40s-results/EXPERIMENTS.md` "DeepSeek as grader" |
| Vision micro-batch tokens | default `-ub` 512; May-2023 item-1 image ~570 tokens; largest 40-pack crop ~1080 tokens | `benchmark/RUNNING.md` "Images on llama.cpp" |
| First harness-axis verification run | `gemma-4-12b-q4-rft`, `--harness matura --no-judge`, history-2023-maj: 37/37 answered, 0 cut off, 0 blanked | commit `a8153834`; `benchmark/results/20260926_201753/report.md` |
| First vision verification run | `gemma-4-12b-q4-vision`(+`-rft-vision`), plain+matura, May 2023: 37/37, 31 images sent, both submissions valid | commit `24beec10`; `benchmark/results/20260926_212615/report.md` |
| Final-pack (history-synthetic-c-v4, 37 items/60 pts, no key) LoRA `abl-r16` step-175 vs base IQ2_S | Claude: 42/60 (70.0%) vs 35/60 (58.3%); DeepSeek flash high: 43/60 (71.7%) vs 42/60 (70.0%) | `l40s-results/EXPERIMENTS.md` "27.09 — final pack C-v4" |
| Judge rule (team-wide) | grading exam attempts uses **`deepseek-flash-high@think` only** | `WarsawModelTrainersHackathon/AGENTS.md` line 7 |
| `default-harness-eval` dev set | `history-2020-czerwiec-matura-rozszerzona-v1` (38 q / 50 pts) + `history-2026-maj-matura-rozszerzona-v1` (39 q / 60 pts) | `AGENTS.md` lines 9–11 |

## Components

- `benchmark/bench.py` — the runner: live progress table, resume, judge, harness dispatch, `--no-judge`/`--grade`,
  ClearML reporting (`report_clearml()`, `benchmark/bench.py:843`).
- `benchmark/run.sh` — whole pipeline: attach gradings → `bench.py --run <conf>` → HTML report; `EXTRACT=1` re-runs
  the PDF extractor first (currently fails on old exams, see Known issues).
- `benchmark/ssh-serve-bench.sh` — for self-hosted models: SSH to the GPU host, start a server, run bench.py
  locally against it, stop it, then `tools/merge.py` everything; one model on the GPU at a time.
- `benchmark/models.yaml` — judge (`deepseek-flash`) + ~50 candidate model/mode entries: DeepSeek (3 fixed-mode
  entries), OpenRouter (Qwen3/3.5/3.8, Gemma 3/4, Ministral, Hy-MT2), self-hosted vLLM (Bielik v3.0 ×5, PLLuM 2512
  ×3, Gemma 4 12B/E4B/QAT/w4a16, Qwen3 small ×4), llama.cpp Q4_0 GGUF variants (base/LoRA/RFT, each with a
  `-vision` twin), plus experiment-specific entries (`qwen3.5-2b-overfit-r8`, `qwen3.5-2b-vllm-bf16`,
  `qwen3.8-27b-iq2s`, `micro100d2examgpt` — the team's 123M from-scratch model, own OpenAI-compatible server since
  vLLM can't load the checkpoint).
- `benchmark/conf/*.yaml` (29 files) — run configs; notable ones: `eval-2017-2026.yaml` (all 40 packs, 13 API
  models), `harness-matura.yaml` / `q4-vision.yaml` (plain vs matura, ±images, judged by `deepseek-flash-high` per
  `AGENTS.md`), `mock.yaml` (organizers' mock pack), `qwen38-27b-holdout.yaml` / `qwen35-2b-holdout2023.yaml`
  (held-out packs for LoRA training-time eval hooks), `gemma-4-12b-sft-r32-2026cz.yaml` (27.09, newest config —
  flags its own exam, June 2026, as *not* in that adapter's holdout, i.e. a possibly-contaminated result).
- `benchmark/harnesses/` — `plain` (original byte-identical prompt), `matura` (imports `harness/matura.py` as-is,
  OpenAI-compatible or native-Ollama transport), `matura-rag` (adds Wikipedia retrieval via services on
  `81.85.1.173:8600/8601`), and the unmerged `matura-tuned` (branch `harness-tuned` only — see Timeline).
- `benchmark/serve/` — one script per model family (`serve_bielik.sh`, `serve_pllum.sh`, `serve_qwen.sh`,
  `serve_gemma.sh`, `serve_gemma_q4.sh` [+ VISION=1/LORA=/rft], `serve_micro.sh`, `serve_qwen35_lora.sh`,
  `serve_qwen38_iq2s.sh`) plus shared `common.sh`.
- `benchmark/tools/exams.py` — loads all three exam formats for both `bench.py` and `viz.py`; `add_gradings.py` —
  attaches grading criteria to extractor output; `package_rubric.py` — builds `rubric.json` for packs without a
  `grading.json` (the organizers' mock); `viz.py` + `report.html` — static HTML leaderboard/report generator
  (All/Essay/Non-essay, replaced the committed `RESULTS.html` at `77b153b3`); `task_types.py` — task-type labels
  and score slices "derived from saved questions, never from judge prose"; `merge.py` — combines run folders,
  drop/rename columns; `vision_check.py` — entry/server/sees/largest/item checks for whether an endpoint really
  reads images.
- `benchmark/exams_packages/history-2023-mock-v1/` — organizers' mock pack (exam.json, images/, our `rubric.json`,
  `answers-template.json`, README): May 2023, 37 items, 60 points.
- `benchmark/exams_claude_extracted/`, `benchmark/exams_output/` — the two older/deprecated exam sources (see Key
  numbers); superseded by `../data/evaluation-2017-2026` for current runs.
- `benchmark/vllm-logs/` — 2 files on disk: `gemma-4-12b-q4-rft-vision.log`, `submission-api.log` (gitignored).
- `tests/test_bench_harness.py` (repo root `tests/`, 497 lines) — end-to-end harness tests against a fake
  OpenAI-compatible + llama.cpp + Ollama server (no network/keys/GPU); also exercises `vision_check.py` and the
  `serve_gemma_q4.sh` command line.
- `../bench-dashboard/` (sibling of the team repo, `003B-hackaton/bench-dashboard/`) — a separate, standalone live
  dashboard over the team's **ClearML** server (not over `benchmark/results/`): `server.py` (stdlib, proxies the
  ClearML REST API, 5–8 s cache) + `index.html` (Chart.js): runs table, overlaid training/eval curves, machine
  monitors, and a `Summary`-value leaderboard; `/api/results` builds an exam × model matrix from every run's
  `report`/`execution-summary` artifact. Deployed on a separate Ubuntu VM as a systemd user service on :8090.

## Decisions, incidents and lessons

- **The in-house judge is not neutral, and this was caught internally.** `lora_experiments.md` and
  `l40s-results/EXPERIMENTS.md` document a deliberate audit: 499 answers were blind-graded by Claude subagents (no
  variant name, no Gemma score) against the same rubric the Gemma-4 judge used. Gemma agreed with Claude on 85% of
  answers, but was higher 67 times vs. lower 9 times when they disagreed — about 11 points too lenient overall —
  and its leniency **differs between model variants**, so it changes the ranking: "Gemma puts base > A > base_think,
  Claude puts base_think > base > A." Decision: **Claude became the reference grader for model selection**, and
  the team also calibrated DeepSeek-flash against Claude (89.8% exact-point agreement, $0.10 for 728 answers) as an
  acceptable-but-not-identical stand-in for larger-scale grading.
- **Batch-size crash on images.** llama.cpp's default micro-batch (`-ub 512`) silently aborts the whole
  `llama-server` process (`GGML_ASSERT … non-causal attention requires n_ubatch >= n_tokens`) the first time an
  exam image exceeds ~512 tokens — every image crop in the 40-pack set is ~570–1080 tokens, so every vision run
  would have died on item 1 without `-b/-ub 2048` (commit `24beec10`). Caught and fixed before any real vision
  run, and `tools/vision_check.py` was built specifically to catch a regression of this before spending a run on it.
- **A text-only model will confabulate having seen an image.** Without its picture, `gemma-4-12b-q4` (base) still
  wrote its argument was "wyraźnie widoczne na obrazie" (clearly visible in the picture) — a concrete reason the
  team built `vision_check.py` rather than trusting a model's own claim that it used an image.
- **`RESULTS.html` was replaced mid-project without the README catching up cleanly.** The static, committed
  `benchmark/RESULTS.html` (grown from 19→25→31→34 columns across 5 commits, 4ef29202→40a7d79a) was deleted in
  `77b153b3` in favour of a dynamically generated `report.html`/`task_types.py`. A later commit on the same day,
  `610ed6fa`, added a README section describing a "corrected historical leaderboard" at
  `RESULTS/corrected_RESULTS.html` and instructions to rebuild it from `RESULTS/first_RESULTS.html` — **neither
  file exists anywhere in the repo's history** (confirmed: `git log --all --diff-filter=A` for both paths returns
  nothing). The current README (`benchmark/README.md`) still references these non-existent files; this is a
  documentation/reality mismatch, not a working feature.
- **Two different numbers for the same run.** Commit `40a7d79a`'s message states `gemma-4-12b-q4-rft@nothink`
  scored 62.6% in the merged run `results/20260926_140500_merged`; re-deriving the score directly from that run's
  data embedded in the (now-deleted) `RESULTS.html` gives 159/248 = 64.1% (sum of points ÷ sum of max points).
  The discrepancy (likely mean-of-per-exam-percentages vs. total-points-ratio) is not reconciled anywhere in the
  repo — recorded here as a known small inconsistency, not resolved.
- **RFT beats key-answer SFT, barely, and only relative to itself.** SFT on expert key answers (LoRA "A"/"B")
  changed answer *style* (exact-match on closed tasks 0%→32–55%) without raising *points*, and made the model more
  confidently wrong on facts it didn't know ("Oktawian August pierwszym konsulem", "Dictatus papae 1059" — both
  fabricated). Rejection-sampling fine-tuning (RFT) on the model's own Claude-verified full-score answers avoided
  that regression (`v3-rft` step 51: 41.4% vs base 39.1%) but never closed the gap to simply turning thinking mode
  on (`base_think`: 49.2%, still the team's benchmark to beat as of 27.09 evening).
- **Exam contamination is tracked explicitly, not assumed away.** `conf/gemma-4-12b-sft-r32-2026cz.yaml` (27.09,
  the newest config file) documents in its own header that its exam (June 2026) is *not* in the adapter's holdout
  set, so "the LoRA score is likely contaminated" — a deliberate caveat left in the config rather than a silent
  optimistic number.

## People

- **Szymon Hajderek** — wrote the original `bench.py` and almost the entire `benchmark/` scaffold through 26.09
  (commits `928cf6bd` through `43da6220`): judge design, `RESULTS.html` growth 19→34 columns, thinking-mode axis,
  serving scripts for Bielik/PLLuM/Gemma4/Qwen, the Q4_0 GGUF + vision serving groundwork, and later Qwen3.5-2B
  LoRA benches. Every one of his commits in this set is co-authored `Claude Opus 5.5`.
- **JulianVolodia** (= "Volodia", owner of the workspace notes) — built the **harness axis** (`b2f011db`), the
  package pre-check (`a8153834`), the **vision-on-llama.cpp** support (`24beec10`), and later the Wikipedia
  retrieval / `matura-rag` harness (`9ed0effa`), all co-authored `Claude Opus 5.5 (1M context)`.
- **hiderr** — added the from-scratch `Micro100d2examGPT` (123M) model entry and its own tiny OpenAI-compatible
  server (`a064a894`); also the GPU-host account name used in `serve/*.sh` remote scripts (`hiderr@81.85.1.173`).
- **endote** — large data-science / benchmark-artefact commits (`77b153b3`, `610ed6fa`) that removed the static
  `RESULTS.html` in favour of the report-template pipeline, edited `harness/matura.py` substantially, and added
  the (incomplete) "corrected leaderboard" README section; author of the standalone submission-server work
  described elsewhere in the project's notes.
- **b5b70364** co-authored by **Cursor** — the only non-Claude AI co-author found on a
  benchmark commit (exam packages / rubric packaging / ssh-serve helper).
- The unmerged `matura-tuned` harness (branch `harness-tuned`, commit `83895478`) has no author line captured here
  beyond the branch itself; not yet reviewed against `main`.

## Open issues / limitations

- `benchmark/README.md` still points to `RESULTS/corrected_RESULTS.html` and instructs rebuilding it from
  `RESULTS/first_RESULTS.html` (`tools/viz.py RESULTS/first_RESULTS.html -o RESULTS/corrected_RESULTS.html`) — as
  established above, **neither file exists in the repository at any commit**. Anyone following the README's
  first bullet point today gets a file-not-found.
- `EXTRACT=1 ./run.sh` (re-extracting questions from the PDFs) "currently fails: 23 of the old 2005–2018 PDFs
  don't parse" (`benchmark/README.md` "Exams"); the outer repo's `CLAUDE.md` gives a more granular breakdown (20
  fail a task-number check, 7 have a non-A4 page, 2 fail an essay-topic check, 11 fail later validation, not yet
  investigated). The committed `questions.jsonl`/`questions_graded.jsonl` (1172 questions, 33 exams 2018–2026) are
  the frozen working copies used instead.
- `benchmark/bench.py` needs `DEEPSEEK_API_KEY` for the default judge (billable) or an explicit `--judge`
  pointing at a self-hosted entry; the self-hosted `models.yaml` entries target the team's GPU host
  (`81.85.1.173`), not the project's own L40S server.
- The `matura-tuned` harness (essay-length + CKE-rules tuning) exists only on an unmerged local branch
  (`harness-tuned`); on the checked-out `main` worktree its directory holds no `harness.py`, only a stale
  `__pycache__`.
- Judge disagreement is a known, *unclosed* risk even after calibration: DeepSeek-flash agrees with Claude closely
  on the big picture but "among the LoRAs (a spread of 2–3 points) the order changes, so final comparisons should
  still go through Claude or both graders" (`l40s-results/EXPERIMENTS.md`).
- No LoRA variant had, as of the last recorded number (27.09), closed the gap to `base_think` (49.2%, Claude
  grading) — the best LoRA (`v3-rft-think` step 63) reached 44.5%, "still ~6 points below plain thinking mode,
  which is more than the noise."
- A recurring 0-point failure mode across evaluations: when an exam item references an illustration or map that
  wasn't actually shown to the model, it answers conditionally ("if the picture shows X…") instead of committing —
  which always scores 0 (`lora_experiments.md` "RFT"; `l40s-results/EXPERIMENTS.md` "RFT thinking").

## Good quotes or slide-worthy details

- "Fun fact: without its picture, the model still wrote that its argument was 'wyraźnie widoczne na obrazie'."
  — commit `24beec10` message, on a text-only model confabulating having seen an exam image.
- "The two graders agree exactly on 85% of the answers. When they differ, Gemma is higher 67 times and lower 9
  times." — `lora_experiments.md`, on why the team stopped trusting the in-house model as its own judge.
- "A lower loss on the key answers does not mean more points." — `lora_experiments.md` "Findings" #3, on
  SFT-on-keys producing confidently fabricated details (e.g. "Oktawian August pierwszym konsulem").
- "Like any good maturzysta, the matura harness now checks the exam before answering it" — commit `a8153834`
  message, introducing the pre-flight package-validation hook.
- "The slow tail is not a freeze." — `benchmark/README.md`, on why a run can sit for 5–15 minutes on one answer
  that is stuck in a token-repetition loop up to `max_tokens`.
- The default llama.cpp micro-batch size (512 tokens) is smaller than *every single exam image crop* in the
  40-pack collection (~570–1080 tokens) — meaning vision benchmarking was, by default, guaranteed to crash on the
  very first image, not an edge case (`benchmark/RUNNING.md` "Images on llama.cpp").

## Sources consulted

- `WarsawModelTrainersHackathon/benchmark/README.md`, `RUNNING.md`, `bench.py` (docstring/grep only), `models.yaml`
  (full), `harnesses/README.md`, `harnesses/matura-rag/harness.py` (docstring), `harnesses/plain,matura,matura-tuned`
  (listings), `conf/*.yaml` (12 of 29 read in full, rest listed), `tools/*.py` (docstrings), `run.sh`,
  `ssh-serve-bench.sh` (head), `results/20260926_201753/`, `results/20260926_212615/` (config.yaml + report.md),
  `exams_packages/history-2023-mock-v1/` (listing), `exams_output/` (line counts), `vllm-logs/` (listing).
- `WarsawModelTrainersHackathon/AGENTS.md` (grading rule, `default-harness-eval` scenario).
- `WarsawModelTrainersHackathon/lora_experiments.md` (full).
- `git log` / `git show -s --format` / `git show --stat` for commits `928cf6bd`, `727a2164`, `42babc2d`,
  `4ef29202`, `0b0f6a9e`, `087eb55b`, `595282ab`, `8dedb8b9`, `8793c323`, `35a115ab`, `62f7044a`, `40a7d79a`,
  `b5b70364`, `b2f011db`, `a8153834`, `24beec10`, `a064a894`, `43da6220`, `e4f775ff`, `610ed6fa`, `77b153b3`,
  `9ed0effa`; `git log --all -- benchmark/RESULTS.html`; `git show 40a7d79a:benchmark/RESULTS.html` (parsed
  embedded `const RECS` JSON, 272 records); `git show harness-tuned:...matura-tuned/harness.py`; `git blame` on
  `benchmark/README.md`; `git branch -a`, `git status`.
- `003B-hackaton/bench-dashboard/README.md` (full).
- `003B-hackaton/l40s-results/EXPERIMENTS.md` (headers + "Blind grading", "DeepSeek as grader", "RFT" sections,
  "27.09 — final pack C-v4" section, in full).
- `data/evaluation-2017-2026`, `data/grading-2017-2026` (`git ls-files` counts only, per HARD RULES).
