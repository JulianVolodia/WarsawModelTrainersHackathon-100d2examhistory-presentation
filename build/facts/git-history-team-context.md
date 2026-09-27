# git-history-team-context

> **Correction by the orchestrator (27.09.2026, verified with `git shortlog -sn main` at `6d8d52d7`):** the 9 git identities are **6 distinct people** (JulianVolodia = Volodia, Szymon Hajderek = szymon-hajderek, Olaf Serafin = o-serafin, plus Pawel Cyrta, endote, hiderr), not 7. `main` has **142 commits** after the 27.09 pull (135 at `9ed0effa`). First commit `a0c34b89` 25.09.2026 21:14:25 +0200 → last `6d8d52d7` 27.09.2026 10:01:55 UTC = **38.8 hours** (not ~62 h).

## Summary

The team repo is `WarsawModelTrainersHackathon` (GitHub `Endote/WarsawModelTrainersHackathon`, private), branch
`main`, team name **"100d2exam"** (their private Hugging Face org is `WMTH-100d2exam`, e.g.
`WMTH-100d2exam/history-lora`, `AGENTS.md:30-38`). The repo's own `README.md` title is "Warsaw Model Trainers
Hackathon"; the goal (per `003B-hackaton/CLAUDE.md`) is to train/fine-tune a model that solves the Polish history
matura (extended level) and benchmark it, for a public submission judged against a format published at
`warsawmodeltrainers.dev/submissions.html` (`submission/README.md:4`).

At the point this fact sheet was written (repo `HEAD`/`main` = `9ed0effa`, 27.09.2026 10:46:44 +0200), `main` has
**135 commits**, spanning **25.09.2026 21:14:25 +0200** (first commit `a0c34b89` "init with readme", Pawel Cyrta) to
**27.09.2026 10:46:44 +0200** (latest, JulianVolodia). Seven git author identities appear in `git shortlog -sn
--all`: JulianVolodia (43), endote (26), Pawel Cyrta (23), Szymon Hajderek (21), hiderr (8), szymon-hajderek (7),
Olaf Serafin (6), Volodia (2), o-serafin (2) — 9 name strings, some the same person under different git configs
(see People section). Work is organized as short-lived topic branches merged into `main`, mostly by direct "Merge
branch" commits rather than GitHub PRs; only 4 PRs (#1–#4) are visible in the merge-commit subjects. The repo is
enormous by file count (55,201 tracked files) but almost all of that is generated data (`output/` alone: 41,295
files) and one vendored external-paper dump (`src/lostInHistoricalTime/`, 3,169 files, one commit). Actual
hand-written code is concentrated in `benchmark/` (102 files), `harness/` (25), `src/posttrain/` (47), `training/`
(15), `scripts/` (71), `submission/` (6).

Why it matters for the deck: the history shows three days of extremely parallel, fast-moving work (data extraction
→ benchmark harness → LoRA training on the team's own L40S box in parallel with a Nebius H100/H200 track → a
Wikipedia-RAG feature added and partially rolled back within hours → a public submission server) by a ~7-person
team plus AI coding agents (Claude Sonnet/Opus/Fable co-authorship appears in commit trailers), finishing with a
working submission pipeline and multiple unmerged experiments still in flight as of the last commit.

## Timeline

### 25.09.2026 (hackathon start, 13 commits on `main` that day)
- **21:14:25 +0200** — `a0c34b89` Pawel Cyrta: "init with readme" — repo created. (`git log`)
- **21:14:25–22:11:32** — Pawel Cyrta: `7a6a41bc` "uv project starter + data crawlers" — project scaffolding
  (`uv`) and the PDF crawlers (`scripts/*_crawler.py` per `003B-hackaton/CLAUDE.md`).
- **22:17:57** — endote: `d55c39d7` "PDFy 2018-2026" — exam PDFs for 2018–2026 added.
- **22:28:03 / 22:31:17** — Szymon Hajderek: `928cf6bd` "Add LLM-as-judge benchmark script", `727a2164` "Judge
  whole exam at once: criteria followed by (question, answer) pairs" — first version of the LLM-judge benchmark.
- **22:39:02–23:10:05** — Pawel Cyrta: `18975717` "epodreczniki 1", `f387c3d3` "epodreczniki crawler" — start of
  the e-podręczniki (Polish digital-textbook) data stream.
- **22:54:52** — Szymon Hajderek: `42babc2d` "Move benchmark into benchmark/ directory" — repo layout settles.
- **23:02:24** — Szymon Hajderek: `f0955092` "Add extracted history matura exams (2017–2026)" on branch
  `benchmark`, merged same minute via `31976039` "Merge branch 'benchmark'".
- **23:05:39** — endote: `a045a254` "gotowe jsonl z PDF" (Polish: "jsonl ready from PDF") — first
  `output/questions.jsonl`.
- **23:28:28** — Olaf Serafin: `0cd12383` "feat(data): Add history matura rozszerzona exams 2005-2018 and fill
  stara gaps" on branch `add-history-rozszerzona-2005-2018`.
- **23:30:58** — o-serafin (Olaf Serafin): `f71b3524` **"Merge pull request #1 from
  Endote/add-history-rozszerzona-2005-2018"** — first GitHub PR merge. (This is the commit `003B-hackaton/CLAUDE.md`
  "Known issues" refers to as adding exams the parser of that time couldn't handle; the parser was later extended —
  see Decisions section.)

### 26.09.2026 (97 commits on `main` that day — the busiest day; JulianVolodia 40, endote 16, Pawel Cyrta 15,
Szymon Hajderek 11, hiderr 7, Olaf Serafin 5, Volodia 2, o-serafin 1)
- **00:07:42–00:22:44** — endote: `d2a9e3b5` "paper + codes", merged as `b99807e1` "Merge origin/main with paper
  and evaluation code" — vendoring of the external EMNLP-submission benchmark ("Lost in Historical Time?") into
  `src/lostInHistoricalTime/` (see Decisions/Components).
- **00:21:07–02:47:06** — JulianVolodia: `25fd3908` "Add L40S server setup guide", `fc335048` "Document QLoRA
  pipeline, llama.cpp build and LoRA serving on L40S", `4140277b` "Add SFT data builder and QLoRA -> GGUF adapter
  pipeline" on branch `docs/setup-on-l40s`, merged via Volodia's `cc1c6c56` **"Merge pull request #2"** and
  `d6a3469c` **"Merge pull request #3 from Endote/docs/setup-on-l40s"** — L40S QLoRA→GGUF pipeline documented and
  merged (two PRs for the same branch name).
- **01:23:52–01:28:18** — Pawel Cyrta: `444723b5` "all set since 2003 from arkusze.pl", `3215a8ca` "source url links
  to cke resources" — widening the exam-PDF source coverage.
- **02:58:27–06:46:18** — JulianVolodia: `cbc30dca` "Fix SFT data leakage and text noise; add data-fix guideline",
  branch `data/sft-fix-guideline` (`c0c484e1` "Add test split, fix key parsing, add eval/RFT scripts and results"),
  merged `64ad1a31`.
- **06:27:11–06:46:29** — Szymon Hajderek: `4ef29202` "Benchmark: results for 19 models, tools/ + serve/ layout,
  docs", `0b0f6a9e` "Benchmark: thinking modes, Gemma 4 12B + small Qwen serving, 25-row RESULTS".
- **06:46:29–07:13:50 (early morning)** — JulianVolodia: start of the Claude-distilled RFT-grading data stream —
  `acfcebcf` "Add data_destillated_by_claude: Claude-graded answers and guidelines" then a rapid series of "Sync
  Claude RFT grades: batches N–M graded" commits (`f0e41039`, `204ed02c`, `7293fc49`, `91804c7d`/branch
  `data/claude-distilled`, `9ec81314`, `26b2b108`, `c6ed473f`, `e5babb64`) each folded back to `main` by small
  "Merge branch 'data/claude-distilled'" merge commits (`e022d72b`, `4114b08b`, `d2ffb24f`, `3784d993`) — this is
  the pattern the `003B-hackaton/CLAUDE.md` "Publishing rules" section calls "rebase-only to main".
- **07:14:51–08:33:23** — JulianVolodia: `data_synthetic` stream begins — `b0d9c80e` "add pilot 1914-1945 (76
  tasks)", `8b0f43be` "Add data_synthetic: curriculum per epoch, essay rubric template, pilot tasks",
  `ee6a39ae`/`cd39ed36` "complete main set, 3600 verified tasks", `e8a8f601` docs.
- **08:00:13–08:11:10** — JulianVolodia: `a2f963f4` "Docs: RFT sampling, Claude grading, v3-rft, repo workflow",
  `f7791ea6` "v3-rft evaluation: Claude-graded val answers and results" — first "v3-rft" LoRA results land in the
  repo (matches `003B-hackaton/CLAUDE.md`'s "v3-rft (best LoRA, 44.5% vs base_think 49.2%)").
- **08:36:08** — endote: `2413d976` "parser on matura 2005-2026" — extractor work continues on older exams.
- **11:20:55–14:01:59** — Szymon Hajderek: benchmark/serving stream — `087eb55b` "label every result column
  name@mode, small-Qwen config", `595282ab`/`8dedb8b9`/`8793c323` Gemma 4 12B QAT-as-real-Q4_0-GGUF via llama.cpp,
  `35a115ab` "Gemma 4 12B Q4_0 + LoRA (llama.cpp, :8019) and w4a16 (vLLM, :8018)", `62f7044a` "serve and bench the
  best LoRA, history-lora v3-rft step 51", `40a7d79a` adds it to `RESULTS.html` (34 columns).
- **14:34:16–14:37:23** — endote: `7c2355d6` "extracted images", `6333bb34` "Complete visual source graph exports
  and extraction review tooling".
- **14:55:08–15:16:33** — Olaf Serafin: first two batches of the image-tasks data stream — `d6c5e81e` "Add 60
  image-based CKE-style history tasks", `7be0dceb` "Add 120 more image-based history tasks (180 total)".
- **14:59:56–15:21:40** — hiderr: ClearML tracking infra lands — `da2195e7` "Shared ClearML experiment tracking:
  track.py helper + CLEARML.md guide", `70bfb52b` "track.py: hardcode ClearML secret, fail soft on init errors; add
  scripts/mock_training.py smoke test", `62521b7d` "track.py: hardcode ClearML access/secret key pair",
  `826894c2` "AGENTS.md: standing rule for agents to track every training/grid/eval via track.py",
  `33a07917` "Tracking rules: mandatory ClearML reporting...".
- **15:17:15–15:29:14** — endote: `cfe37663` "eval 2017-2026 + grading set" — the `src/lostInHistoricalTime`
  external-paper dump (see Decisions), and `93f48a49` "pierwsze harneassy za ploty - do testow" (Polish, roughly
  "first harnesses behind the fence - for testing").
- **15:24:12** — Olaf Serafin: `4b31cf5a` "data: Downscale task images to 1024px, store each once".
- **15:26:24** — hiderr: `a064a894` "Benchmark: Micro100d2examGPT (123M from-scratch) on :8025" — a from-scratch
  small model benchmarked too.
- **16:06:59–16:40:24** — JulianVolodia: `data_synthetic_extended` stream (Wikipedia-grounded synthetic data via
  DeepSeek) — `25dc063c` docs, `3e558a8f` "wave 2: 10582 new Wikipedia-grounded tasks", `51b1f66f`/`e663fa3f`
  "wave 3: targets reached (5010 essays, 5040 closed, 5063 open)", `3d628baf` run scripts, `53b6d29d` "DeepSeek
  grader calibration vs Claude on val answers (728 items)" — matches `003B-hackaton/CLAUDE.md`'s "5010 essays, 5040
  closed tasks and 5063 open tasks (22.57 USD of DeepSeek)".
- **15:16:20–20:10:52** — Pawel Cyrta: e-podręczniki stream continues — `95619385` "epodreczniki questions",
  `fa828aee` "epodreczniki ext, question rephrased", `288aa73b` "epodreczniki download and questions", `e3b4e536`
  "exam synthetic rephrase question claude", `b2b361aa` "scripts for epodreczniki, and rephrease exam qa".
- **19:26:51–20:27:39** — Pawel Cyrta: `95619385`, `d2428a8e` "epodreczniki as dataset in proper schema",
  `49c161f3` "esseays for epodreczniki 231 one for each topic".
- **17:44:12 & 18:49:19 (UTC)** — Olaf Serafin: `097fed1a` "data: Add 300 image tasks (478 total), review fixes"
  (branch `data/synthetic-images`, merged **PR #4** by o-serafin at 19:47:22 +0200, `9fd342f1`), then `69e4113f`
  "data: Add 270 image tasks (748 total), batch 4" on branch `data/synthetic-images-b4` — **not yet merged into
  `main`** as of `HEAD`.
- **20:12:53–21:44:20** — JulianVolodia: benchmark-harness axis (pushed as noted in `003B-hackaton/CLAUDE.md`) —
  `b2f011db` "Benchmark: harnesses (plain + the team's matura solver), answers-only runs, --grade", `a8153834`
  "the matura harness reads the whole paper before it writes a word", `24beec10` "Gemma opens its eyes (llama.cpp
  image projector + vision check)".
- **20:32:42–22:24:59** — Pawel Cyrta: a parallel "posttrain" model track — `ed8e4fd4` "posttrain unsloth and
  nemo-rl code", `eb8abedc` "postrain update", `05e11d36` "postrain extension", `0ac9f463` "postrain bielik
  ministral", `baa2a078` "extend postrain" — training experiments on **Bielik**/**Ministral** models, separate from
  the Gemma/Qwen tracks the other streams focus on.
- **21:13:20–22:19:31** — endote: `77b153b3` "39 evaled runs of gemma4, data science, benchmark building",
  `610ed6fa` "gemma4-rft-step51-latest16-v1 40 matura results", `af97c067` merge "vision support with evaluation and
  reporting changes", `26476983` "matura-histoty-2005-2016" (a second, separate Hugging Face exam-dataset package
  for the older 2005–2016 papers).
- **23:23:45 & next day 00:01:13** — Szymon Hajderek: `43da6220` "Qwen3.5-2B overfit LoRA r8 ckpt-225 on the last
  10 years", `e4f775ff` "Qwen3.5-2B vLLM baseline vs overfit-v1 LoRA r8 lr1e-4 s570" — a **Qwen3.5-2B** LoRA
  experiment track distinct from the Gemma 4 12B L40S work.

### 27.09.2026 (25 commits on `main` up to 10:46:44 +0200; szymon-hajderek 7, endote 7, Szymon Hajderek 5, Pawel
Cyrta 4, JulianVolodia 3, hiderr 1)
- **00:18:23** — JulianVolodia: `314868c9` "Submission server: one port that turns an exam package into
  answers.json" — the FastAPI submission server (`submission/`, port 8090), matches `003B-hackaton/CLAUDE.md`'s
  "Submission server (27.09, pushed to main as 314868c9)" entry.
- **00:42:23–01:18:14** — endote: `f3ba345a` "harness automatic eval and improvement", `f51268f9` "evals...",
  `eb3283bc` "benchmark _+ harness workings", merged as `747355a8` "Merge origin/main and reconcile post-training
  pipelines".
- **03:16:13** — endote: `87283d60` "commit eb3283bc fix" — this is the harness/docs state that Szymon Hajderek's
  later rollback (`2e779446`) restores to.
- **03:18:56** — endote: `da90d0d4` "Merge origin/main benchmark configurations" on branch `oldgoodtimes`.
- **04:55:01–07:27:36 (UTC, ≈ 06:55–09:27 +0200)** — Szymon Hajderek / szymon-hajderek: a self-contained
  **"LoRA bench queue"** service — `6cb40608` "training/: reproducible Qwen3.8-27B LoRA pipeline on the IQ2_S
  deploy quantization", `7737f119` its reproduction doc, `671fb248` "Add LoRA bench queue: PEFT checkpoint server +
  client for IQ2_S matura benches", `7b2e85af` web GUI + queue management, `4647845a` per-job llama-server CTX/NP
  override, `f75ee9ae`/`da4611f1` `COMMUNICATION.md` contract for agents + `AGENTS.md` pointer, `d9748229`
  arbitrary-harness support + git-pull endpoints, `203c6d51` live progress bars + job resume.
- **06:18:13** — hiderr: `91207b7a` "Add Wikipedia RAG + image search service docs for harness integration" (the
  `81.85.1.173:8600`/`:8601` services documented in `COMMUNICATION.md`).
- **06:33:05** — endote: `6b6dab53` " rag" — adds RAG/grading-consistency changes to the solver (see Decisions).
- **09:58:10** — Szymon Hajderek: `2e779446` "harness: roll the solver back to before the 'rag' commit
  (6b6dab53)" — **rollback** (see Decisions).
- **10:46:44** — JulianVolodia: `9ed0effa` (latest commit on `main` at time of writing) "harness: Wikipedia
  retrieval (--retrieval on) + matura-rag bench harness" — RAG reintroduced as an **opt-in, separate** bench
  harness (`benchmark/harnesses/matura-rag`) rather than baked into the default solver path.
- **10:59:57** — JulianVolodia: `83895478` "bench: matura-tuned harness — CKE scoring rules in the system prompt,
  essay rubric + length target, essay revision call" — on local branch `harness-tuned`, **not yet merged** into
  `main`/`origin/main` as of this fact sheet (13 minutes after the last `main` commit).

## Key numbers

| label | value | source |
|---|---|---|
| Commits on `main` | 135 | `git rev-list --count main` |
| First commit on `main` | `a0c34b89`, 25.09.2026 21:14:25 +0200, Pawel Cyrta, "init with readme" | `git log` |
| Latest commit on `main` (at fact-sheet time) | `9ed0effa`, 27.09.2026 10:46:44 +0200, JulianVolodia | `git log` |
| Commits by author (`git shortlog -sn --all`) | JulianVolodia 43, endote 26, Pawel Cyrta 23, Szymon Hajderek 21, hiderr 8, szymon-hajderek 7, Olaf Serafin 6, Volodia 2, o-serafin 2 | `git shortlog -sn --all` |
| Commits per day on `main` | 25.09: 13; 26.09: 97; 27.09: 25 (up to 10:46:44) | `git log --since/--until` per day |
| Merged GitHub PRs | 4 (#1 add-history-rozszerzona-2005-2018; #2, #3 docs/setup-on-l40s; #4 data/synthetic-images) | merge-commit subjects |
| Local/remote branches (total distinct) | 12: `main`; local-only `harness-tuned`, `harness-new-wb`; remote-only `add-history-rozszerzona-2005-2018`, `benchmark`, `data/synthetic-images`, `data/synthetic-images-b4`, `oldgoodtimes`, `qwen-lora`; shared local+remote `data/claude-distilled`, `data/sft-fix-guideline`, `docs/setup-on-l40s` | `git branch -a`, `git for-each-ref` |
| Branches with commits not yet in `main` | 3: `harness-tuned` (+1, JulianVolodia), `data/synthetic-images-b4` (+1, Olaf Serafin), `qwen-lora` (+1, hiderr) | `git log main..<branch>` |
| Total tracked files in repo | 55,201 | `git ls-files \| wc -l` |
| Files under `output/` | 41,295 | `git ls-files \| cut -d/ -f1 \| sort \| uniq -c` |
| Files under `data/` | 7,518 | same |
| Files under `src/` | 3,217 (3,169 of them in `src/lostInHistoricalTime/`) | same, `git ls-files src/` |
| History-exam question records (per README top) | 2,098 records from 67 exam PDFs (2005–2026), 812 subquestions, 236 essay alternatives, 1,672 task groups | `README.md` top |
| Synthetic-extended data volume (26.09) | 5,010 essays, 5,040 closed tasks, 5,063 open tasks, $22.57 of DeepSeek spend | commit `e663fa3f`/`51b1f66f`, corroborated by `003B-hackaton/CLAUDE.md` |
| data_synthetic main set | 3,600 verified tasks | commit `cd39ed36`/`e8a8f601` |
| Image tasks (data/synthetic-images lineage) | 60 → 180 → 478 → 748 (batches, 26.09) | commits `d6c5e81e`, `7be0dceb`, `097fed1a`, `69e4113f` |
| Claude RFT grading (no-think sampling) | 1,212 samples graded | commit `e5babb64` |
| DeepSeek-vs-Claude grader calibration set | 728 items | commit `53b6d29d` |
| H100 full LoRA run `full-v2` (history-v2, 27.09) | 22,212 examples (1,847 with images), rank 16/alpha 32, peak LR 5e-5, 1,389 optimizer steps scheduled | `docs/history-v2-full-run-2026-09-27.md` |
| H100 technical smoke (history-v2, 27.09) | 10 examples, 10 optimizer steps, mean loss 2.5652, 65,568,768 trainable LoRA params, 32.08 GiB peak VRAM | `docs/history-v2-h100-smoke-2026-09-27.md` |

## Components

- `README.md` — repo front door: extractor claims (67 exams/2005–2026, 2,098 records), links to `harness/`,
  `benchmark/`, dataset docs, and the `benchmark/run.sh conf/<name>.yaml` one-liner.
- `AGENTS.md` — the living rulebook for coding agents: ClearML tracking mandate, "deprecated (DO NOT USE)" training
  sources, the current LoRA training policy (user authorizations, P0 semantic-audit gate), pointers to
  `COMMUNICATION.md` for the LoRA bench queue.
- `CLAUDE.md` (repo root) — a one-line `@AGENTS.md` include, so Claude Code reads the same rules as other agents.
- `CLEARML.md` — shared ClearML server contract (`http://81.85.1.173:18080`, project root `HCKT`, naming rules);
  helper `track.py`.
- `COMMUNICATION.md` — contract for three HTTP services other agents/teammates can hit: Wikipedia QA retrieval
  RAG (`81.85.1.173:8601`), image→Wikipedia-article search (`81.85.1.173:8600`), and the LoRA bench queue + GUI
  (`89.169.123.44:38471`, an H100 box, LAN `10.0.0.8`).
- `harness/matura.py` — the team's dependency-free exam solver (stdlib, Ollama or OpenAI-compatible), imported as-is
  by `benchmark/harnesses/matura`; `--retrieval on|off` (default off) added 27.09 for the Wikipedia RAG hookup.
- `harness/retrieval.py` — stdlib client for the RAG services, added in `9ed0effa` (27.09 10:46).
- `benchmark/` (102 files) — LLM-as-judge benchmark harness; `harnesses/{plain,matura,matura-rag}`, `bench.py`,
  `models.yaml`, `conf/*.yaml`, `RESULTS.html`, `serve/`, `tools/{exams,merge,viz}.py`.
- `submission/` (6 files) — FastAPI server (`server.py`, port 8090) that takes an organizer exam zip and returns a
  validated `answers.json` by running `harness/matura.py` as a subprocess against a llama-server; `client.py`
  (stdlib laptop client); format documented against `warsawmodeltrainers.dev/submissions.html`.
- `training/` (15 files) — a **second, independent** LoRA track: Qwen3.8-27B trained directly on its IQ2_S GGUF
  deploy quantization (not bf16), reproducible via `training/setup_env.sh` + `fetch.sh` + `launch_qwen38_lora.sh`;
  reported to ClearML `HCKT/qwen38-lora`; also runs earlier Qwen3.5-2B experiments (`RUNBOOK.md`).
- `src/posttrain/` (47 files) — the "history_v2" Gemma-4-12B QLoRA pipeline run on a **Nebius H100/H200** (not the
  team's L40S), documented in `docs/history-v2-*-2026-09-27.md` and `src/posttrain/history_v2/README.md`.
- `src/lostInHistoricalTime/` (3,169 files, added whole in one commit `cfe37663`) — code+data from the external
  paper "Lost in Historical Time? A Polish History Matura Benchmark for Large Language Models" (arXiv:2608.12343,
  submitted to EMNLP 2026, per `notes.md` and the vendored README), evaluating 8 LLMs on 3 official 2023–2025
  papers — vendored as reference/comparison material, not authored by the team.
- `infra/norbert/nebius/` (20 files, all commits by `endote`) — scripts/docs for the Nebius H100 workflow
  (setup, smoke tests, DeepSeek regrading, backups); "norbert" appears to be endote's own naming for this
  workspace, not a separate teammate (no other author touches this path).
- `data_synthetic/`, `data_synthetic_extended/`, `data_synthetic_images/`, `data_destillated_by_claude/` —
  the four synthetic/derived-data trees (110, 556, 1,010, 149 tracked files respectively).
- `.claude/skills/matura-rag/SKILL.md` — an agent skill for the new RAG-enabled bench harness, added with `9ed0effa`.
- `wb_tries/EXPERIMENTS-v5.md`, `notes.md`, `lora_experiments.md` — untracked/local working notes found on disk
  alongside the repo (not confirmed as committed to `main`; treat as informal, not git-sourced facts).

## Decisions, incidents and lessons

- **RAG added, then partially rolled back within ~3.5 hours (27.09).** `6b6dab53` (endote, 06:33:05) " rag" changed
  `harness/matura.py` and its docs plus added `harness/grading_consistency.py`/`grading_contract.py` and a DeepSeek
  regrading analysis (`infra/norbert/nebius/*deepseek*`). `2e779446` (Szymon Hajderek, 09:58:10) explicitly rolled
  `harness/matura.py` and its docs **back to `87283d60`** ("Polish system prompt for every question,
  `--answer-review` on (draft → review) as the default again"), while keeping images-per-item sending and "the
  grading-consistency tooling from that commit stays." `9ed0effa` (JulianVolodia, 10:46:44) then re-added Wikipedia
  retrieval, but as an **opt-in flag** (`--retrieval on`, default `off`) and a **separate** bench harness
  (`matura-rag`), explicitly not the default path — i.e., the team decided RAG should be additive/optional, not a
  change to the default solver behavior. Source: the three commits' own messages (`git show`/`git log -1`).
- **Extractor known gap, apparently since closed.** `003B-hackaton/CLAUDE.md` (as of 26.09 morning, per its own
  "Known issues" section) states the extractor "only handles the 33 exams from 2018–2026" and that 2005–2018 PDFs
  from PR #1 fail parsing. But the repo's own `README.md` (current state, top of file) claims "Version 3 extends
  the parser to older layouts" and a corpus of **2,098 question records from 67 exam PDFs (2005–2026)**, all
  validating against JSON Schema, "50 regression tests passed." These two sources disagree; the README text is the
  newer/current state (it describes parser "Version 3.2"), so the 33-exam limitation documented in
  `003B-hackaton/CLAUDE.md` appears to have been fixed later in the repo's history, though no single commit hash
  was identified confirming the exact fix commit in the time available (see Gaps).
- **Deprecated training sources, explicit and dated 27.09 (`AGENTS.md`).** Three datasets are excluded from
  training with stated reasons: `WMTH-100d2exam/history-lora-data-2201` (a stored thinking-mode response reasons
  about "a missing map"); `WMTH-100d2exam/data_synthetic_image[-2201]` (one example, `syn-img-starozytnosc-01`,
  "leaks identifying image information through the attribution"; the -2201 snapshot is "a duplicate, not a repaired
  dataset"); `WMTH-100d2exam/data_synthetic_extended-2201` (`generated/*/essay_*.jsonl` contains examiner grading
  guidance in `key_answer` — explicitly must **never** be used as an assistant target). `AGENTS.md` stresses these
  are training exclusions, not deletions, and a "repaired replacement needs separate provenance and review."
- **Explicit user authorizations gating the H100 LoRA run (27.09, `AGENTS.md` "Current history LoRA training
  policy").** The user authorized ("OKAY, now RUN !!!") the full run using `source_trusted_training` records
  without factual-review receipts, and separately removed holdout restrictions for the new training corpus — but
  `AGENTS.md` is explicit that neither authorization extends to trusting historical grading rewards, and that a
  "P0 semantic audit gate" (named-human adjudication) is required before any score is used as a reward/correction
  weight. One specific item — "May 2026 Q24's pouring/helmet/candle discrepancy" — is called out as still
  quarantined pending human adjudication.
- **Grading policy is strict about "unresolved" vs "zero."** `AGENTS.md`: grading is `deepseek-flash-high@think`
  only; route errors/incomplete responses/invalid verdicts/pending reviews must stay unresolved and never become a
  zero score; the reward batch must abort before an optimizer update on a grading failure.
- **Two independent LoRA/model tracks ran in parallel with the main Gemma-4/L40S track**, apparently without full
  cross-references between docs: (1) Qwen3.8-27B trained directly on IQ2_S quantized weights (`training/`, Szymon
  Hajderek, 27.09 04:55–07:27, `git log -- training/` = 2 commits) and its earlier Qwen3.5-2B sibling
  (23.09 23:23–00:01, `43da6220`/`e4f775ff`); (2) a second Gemma-4-12B QLoRA effort ("history_v2") on a Nebius
  H100/H200 (`src/posttrain/`, `infra/norbert/nebius/`, 27.09), distinct from the L40S-based v1/v2/v3-rft lineage
  documented in `003B-hackaton/CLAUDE.md`. A third, apparently more exploratory track — Bielik/Ministral posttrain
  experiments by Pawel Cyrta (26.09 20:32–22:24, 5 commits: "postrain unsloth and nemo-rl code", "postrain bielik
  ministral", etc.) — does not reappear later in the visible history.
- **`src/lostInHistoricalTime/` is vendored external work, not the team's own benchmark.** It is the code+data of
  the arXiv paper "Lost in Historical Time?" (arXiv:2608.12343), added whole by endote in one commit (`cfe37663`,
  26.09 17:20:31) titled "eval 2017-2026 + grading set" — the commit message does not flag it as third-party, that
  is only clear from the vendored `README.md`'s own text and `notes.md`.
- **Server-restart resilience for the LoRA bench queue** (szymon-hajderek, 27.09 07:27:36): "jobs re-queued by a
  server restart resume their bench run (`--resume-last`)" — a lesson from an earlier failure mode, addressed the
  same morning as the queue itself was built.

## People

(Names exactly as they appear in `git shortlog -sn --all`; per the task's identity note, "JulianVolodia" and
"Volodia" are the same person, "szymon-hajderek" = "Szymon Hajderek", "o-serafin" = "Olaf Serafin". "hiderr" is a
separate handle in the log with no stated identity mapping — not merged with any other name here.)

- **JulianVolodia / Volodia** (43 + 2 = 45 commits) — heaviest committer. Owns: L40S QLoRA→GGUF docs/pipeline
  (25.09 late–26.09 early), the SFT data-leakage fix, the entire `data_destillated_by_claude` / Claude-RFT-grading
  sync stream, `data_synthetic` and `data_synthetic_extended` (Wikipedia+DeepSeek), the benchmark harness axis
  (`b2f011db`, `a8153834`, `24beec10`), the submission server (`314868c9`), and the 27.09 Wikipedia-retrieval /
  matura-rag harness (`9ed0effa`) plus the still-unmerged `harness-tuned` branch (`83895478`).
- **endote** (26 commits) — exam-PDF extraction and the extractor/parser work ("PDFy 2018-2026", "gotowe jsonl z
  PDF", "parser on matura 2005-2026"), vendoring `src/lostInHistoricalTime/`, the 06:33 "rag" commit later partly
  rolled back, `infra/norbert/nebius/` Nebius-H100 scripts, and several `origin/main` reconciliation merges.
- **Pawel Cyrta** (23 commits) — the e-podręczniki (Polish textbook) crawler/dataset stream throughout 25.09–26.09,
  widened exam-PDF sourcing ("all set since 2003 from arkusze.pl"), and the separate Bielik/Ministral posttrain
  experiments (26.09 evening).
- **Szymon Hajderek / szymon-hajderek** (21 + 7 = 28 commits) — first LLM-judge benchmark script (25.09), moved
  `benchmark/` into its own directory, most of the `benchmark/RESULTS.html`/serving work for Gemma 4 12B Q4_0 +
  LoRA on llama.cpp, the Qwen3.5-2B and Qwen3.8-27B LoRA tracks (`training/`), the RAG rollback (`2e779446`), and
  authored the entire LoRA bench-queue service (server+GUI+`COMMUNICATION.md`, 27.09 04:55–07:27).
- **hiderr** (8 commits) — introduced the shared ClearML tracking infrastructure (`track.py`, `CLEARML.md`,
  `AGENTS.md` tracking rule) on 26.09, benchmarked a from-scratch "Micro100d2examGPT" (123M params), and documented
  the Wikipedia RAG + image-search services on 27.09.
- **Olaf Serafin / o-serafin** (6 + 2 = 8 commits) — the image-based history-task dataset, in batches (60 → 180 →
  478 via merged PR #4 → 748 on the still-unmerged `data/synthetic-images-b4`), plus image downscaling to 1024px;
  merged PR #1 and PR #4 as `o-serafin`.

Several commits carry AI co-authorship trailers (not counted as separate git authors): `2e779446` credits
"Claude Opus 5.5", `9ed0effa` credits "Claude Fable 5.1" (both `Co-Authored-By` trailers in the commit body).

## Open issues / limitations

- Three branches contain commits not yet merged into `main` as of `HEAD` (`9ed0effa`): `harness-tuned`
  (JulianVolodia's CKE-scoring/essay-rubric harness tuning, 10:59:57 — 13 minutes after the last `main` commit),
  `data/synthetic-images-b4` (Olaf Serafin's 4th image-task batch, 748 total), and `qwen-lora` (hiderr's "pinned
  fetch of WMTH *-2201 datasets" — note this touches the very datasets `AGENTS.md` marks deprecated for training,
  so its status relative to that rule is unclear from git alone).
- `003B-hackaton/CLAUDE.md`'s "Known issues" section (dated 26.09) states the extractor only supports 33 exams
  (2018–2026) and gives a detailed per-exam failure breakdown (20 exams fail task-number checks, 7 have non-A4
  pages, 2 fail the essay-topic check, 11 parse but fail later validation). The repo's current `README.md` claims
  this is resolved (67/67 exams, "Version 3" parser) — **this fact sheet could not identify the specific commit(s)
  that closed the gap** in the time/scope available; a targeted `git log -- scripts/extract_questions.py` walk
  would resolve which claim is current.
- `AGENTS.md`'s "P0 semantic audit gate" flags that transport/schema validation of DeepSeek grading does **not**
  establish grading correctness, and that the May 2026 Q24 "pouring/helmet/candle" discrepancy remains unresolved
  pending human adjudication — an explicitly open item as of the latest `AGENTS.md` text.
- The rollback commit `2e779446` kept "the grading-consistency tooling" from the rolled-back `6b6dab53` commit
  while reverting the solver/doc changes — meaning the repo's current harness state is a hybrid of pre- and
  post-"rag"-commit code, not a clean revert; worth flagging if the deck claims a simple "added RAG, removed RAG"
  story.
- `AGENTS.md` still marks `benchmark/exams_output` as deprecated ("depreciated (DO NOT USE)" section) alongside
  the three deprecated datasets.

## Good quotes or slide-worthy details

- Commit message, in full, for the rollback: *"harness: roll the solver back to before the 'rag' commit
  (6b6dab53)"* — followed by a precise diff-level description of exactly what was restored and what was kept
  (`2e779446`, Szymon Hajderek, 27.09 09:58:10 +0200).
- endote's terse commit subjects in Polish/English mix capture the hackathon pace: `" rag"` (leading space and
  all, `6b6dab53`), `"gotowe jsonl z PDF"` (`a045a254`), `"pierwsze harneassy za ploty - do testow"` (`93f48a49`,
  roughly "first harnesses behind the fence - for testing", note the typo "harneassy").
- `AGENTS.md`'s all-caps grading rule: *"FOR GRADING EXAM ATTEMPTS ONLY deepseek-flash-high@think should be use
  !!!"* — and the training-policy line quoting the user directly: *"the user explicitly authorized the full run
  ('OKAY, now RUN !!!')"*.
- The repo's file count is dominated by generated artifacts: 41,295 files under `output/` alone, out of 55,201
  tracked files total — i.e. ~75% of every file in the repo is extracted/generated exam data, not code.
- `src/lostInHistoricalTime/` — an entire external EMNLP-submission paper repository ("Lost in Historical Time? A
  Polish History Matura Benchmark for Large Language Models", arXiv:2608.12343) checked into the team repo in a
  single commit as supporting/reference material.
- Two Wikipedia-grounded RAG services, two PolQA quality numbers worth a slide: hybrid+rerank retrieval reaches
  answer@5 = 0.731 and article@5 = 0.882 over 1,000 held-out PolQA questions (`COMMUNICATION.md`).
- Team's own naming: a from-scratch 123M-parameter model is benchmarked under the name **"Micro100d2examGPT"**
  (`a064a894`) — a pun on the team name "100d2exam".

## Sources consulted

- `git log --all --date=iso --pretty=format:"%h|%ad|%an|%D|%s"` (full 135-commit history, saved locally during
  research)
- `git shortlog -sn --all`
- `git branch -a`, `git for-each-ref --format='%(refname) %(objectname:short) %(committerdate:iso)' refs/heads
  refs/remotes`
- `git log main..<branch>` / `git merge-base --is-ancestor` for each remote/local branch
- `git show --stat`, `git log -1 --format=...` for commits `2e779446`, `6b6dab53`, `9ed0effa`, `cfe37663`
- `git log --oneline -- <dir>` commit counts for `data_synthetic_images`, `data_synthetic_extended`,
  `data_destillated_by_claude`, `data_synthetic`, `benchmark`, `harness`, `submission`, `training`, `src/posttrain`,
  `infra`, `src/lostInHistoricalTime`
- `git ls-files | cut -d/ -f1 | sort | uniq -c | sort -rn` and `git ls-files src/ | cut -d/ -f1-2 | sort | uniq -c`
- `README.md` (top ~60 lines)
- `AGENTS.md` (full file)
- `CLAUDE.md` (repo root; `@AGENTS.md` include only)
- `CLEARML.md` (top ~30 lines)
- `COMMUNICATION.md` (top ~150 lines, sections 1–2 header)
- `training/README.md` (top ~30 lines)
- `lora_experiments.md`, `notes.md` (top of file; local/untracked status not fully confirmed)
- `submission/README.md` (grep for `warsawmodeltrainers.dev`/mock pack)
- `docs/history-v2-h100-smoke-2026-09-27.md`, `docs/history-v2-full-run-2026-09-27.md`,
  `docs/history-v2-pipeline-audit-2026-09-27.md`
- `src/lostInHistoricalTime/history-matura-llm-evaluation-39B4/README.md` (top 15 lines)
- `/mnt/hgfs/sharedWithKali/ai-thingy-september-26/003B-hackaton/CLAUDE.md` (our notes: layout, machines, known
  issues, publishing rules)
