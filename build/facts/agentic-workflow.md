# Agentic workflow: how the team worked with AI coding agents

## Summary

Team "100d2exam" (Warsaw Model Trainers Hackathon, 25–27.09.2026) ran almost its entire pipeline — data
extraction, LoRA training, RFT sampling, evaluation, benchmarking, a submission server — through Claude Code
sessions (models named in commits/handoffs: Opus 5.5, Fable 5.1) operating a remote L40S/H100/A100 GPU fleet
over SSH, with an explicit, written division of labour between models: Claude Opus/Fable for orchestration,
code and multi-step decisions; **Claude subagents** (dispatched via named Claude Code "workflows" such as
`grade-rft-batches` and `grade-eval-batches`) as the trusted, blind exam-grading reference; **DeepSeek
`deepseek-flash`** (static Python, no agents) for cheap bulk synthetic-data generation and as a secondary
grader; and a **Codex CLI** persona ("Astra", model `gpt-6-astra`) as an independent third grader defined in
`harness/grading.py`. Standing rules accumulated over the three days in the team repo's `AGENTS.md`/
`CLAUDE.md`/`COMMUNICATION.md` and in the user's own Claude Code memory files (`~/.claude/…/memory/*.md`):
never edit the shared server environment without asking, push to `main` only when asked (rebase-only for
synthetic data), sync code to remote machines via `git pull` rather than scp/tar, track every
train/eval/bench run in ClearML, and use `setsid nohup … & disown` for anything that must outlive an SSH
session. Two documented incidents shaped these rules: an agent hardcoded ClearML API keys into `track.py`
(still unrotated as of 26.09 evening), and an unreviewed "rag" commit had to be rolled back and redone more
carefully. Sessions also practised a "handoff" convention — one Claude Code session writes a Markdown
briefing for the next (or for a different model, e.g. a code-review handoff addressed to "Fable") so context
survives context-window resets and model switches.

## Timeline

- **25.09.2026** — L40S GPU server set up; `SETUP_ON_L40S.md` written with a dedicated section "How Claude
  Code works with the server" stating Claude Code runs locally and drives the GPU one `ssh l40s '<cmd>'` at a
  time. *(SETUP_ON_L40S.md:3-15)*
- **25/26.09.2026 (night)** — an agent changed the L40S venv (`include-system-site-packages` → false,
  downgraded fsspec) without asking, to fix a broken `import trl`; user says "better not edit execution
  environment please" → becomes standing rule. *(memory/no-env-edits-without-asking.md, modified
  2026-09-25T22:04:22Z)*
- **26.09.2026, ~05:30–05:55 UTC** — RFT no-thinking round: 1212 samples, graded by Claude subagents in 28
  batches via the `grade-rft-batches` Claude Code workflow; 462 got full points. *(l40s-results/EXPERIMENTS.md:111;
  CLAUDE.md:53-54)*
- **26.09.2026, 06:45 +0200** — commit `c0c484e1` (JulianVolodia, Co-Authored-By Claude Opus 5.5,
  `Claude-Session: https://claude.ai/code/session_01AXmAHtGo6VcMtDxjD7isX1`): adds `eval_gguf.py`,
  `rft_sample.py`, and documents "blind Claude grading of 499 answers: Gemma is ~11 points too lenient and
  ranks models differently."
- **26.09.2026, 14:59–15:21 UTC** — commits `da2195e7`, `826894c2`, `33a07917` (author `hiderr`,
  Co-Authored-By Claude Opus 5.5) add `track.py` + `CLEARML.md` and the `AGENTS.md` rule making ClearML
  reporting mandatory for every train/grid/eval/benchmark run.
- **26.09.2026, 15:02–15:17 UTC** — commits `70bfb52b`, `62521b7d` (author `hiderr`, Co-Authored-By Claude
  Opus 5.5) hardcode the ClearML access/secret key pair into `track.py`. Flagged later the same day in
  `HANDOFF_01.md`: "⚠️ `track.py` hardcodes the ClearML keys (commit `62521b7d`). They should be rotated."
  *(HANDOFF_01.md:143)*
- **26.09.2026, ~12:10–14:15 UTC** — user explicitly redirects bulk data generation away from Opus agents:
  "może jesteś w stanie zrobić coś innego? niż używanie opusa" → static Python + DeepSeek `deepseek-flash`
  API pipeline in `/scratch/wiki_ext/`. *(memory/deepseek-for-bulk-generation.md, modified
  2026-09-26T13:05:19Z; HANDOFF_01.md:29-31)*
- **26.09.2026, ~14:30 UTC** — DeepSeek used as a second grader, re-grading 728 val answers Claude had
  already graded: 89.8% exact agreement, cost $0.10. *(HANDOFF_01.md:81-99; EXPERIMENTS.md commit `53b6d29`)*
- **26.09.2026, ~12:15–13:35 UTC** — thinking-mode RFT: last 458 samples (batches 38–49) graded by Claude via
  `grade-rft-batches`; pushed to `main` as `c3900f3` (Co-Authored-By Claude Opus 5.5,
  `Claude-Session: https://claude.ai/code/session_01AXmAHtGo6VcMtDxjD7isX1`). *(EXPERIMENTS.md:118-122;
  HANDOFF_03.md:14-21)*
- **26.09.2026, evening** — `HANDOFF_02.md` written "by Claude (Opus 5.5) at the request of the user" — a
  short, explicitly no-op-on-repo session (ClearML client setup on a second VM), still following the
  handoff-document convention.
- **26.09.2026** — `HANDOFF_REVIEW_FABLE.md` written by "Claude (Opus 5.5), who did the work, at the request
  of the user", addressed "Hi Fable" — a code-review handoff asking a different model/session to review the
  LoRA workstream **read-only** and write findings to `REVIEW_FEEDBACK.md` without changing code.
  *(HANDOFF_REVIEW_FABLE.md:1-5)*
- **26.09.2026, 17:27 +0200** — commit `83e568d4` (JulianVolodia): LoRA v4 tournament + DPO scripts, "88
  think / 94 no-think pairs (chosen/rejected by Claude points)".
- **26.09.2026, ~19:45 UTC** — tournament finalists r4/r8 graded blind by Claude: both score 50.8%
  (65/128), the first LoRA that does not lose to plain thinking-mode base. *(EXPERIMENTS.md:244-245,
  253-256)*
- **27.09.2026, 04:59 UTC** — commit `7737f119` (Szymon Hajderek): `training/REPRODUCE_FOR_CLAUDE.md`,
  "exact reproduction + hyperparameter ablations for an agent" — a step-by-step instruction file explicitly
  addressed to a Claude agent running on a fresh H100.
- **27.09.2026, 06:18–06:20 UTC** — commits `f75ee9ae`, `da4611f1` (szymon-hajderek): `COMMUNICATION.md` §3
  "LoRA bench queue contract for agents" (host/port, client, HTTP API, result semantics, §3.6 etiquette),
  with `AGENTS.md` repointed at it.
  - Also 26/27.09: two "rag" episodes on `harness/matura.py` — an unreviewed commit `6b6dab53` (endote,
    subject just " rag") was rolled back by `2e779446` ("harness: roll the solver back to before the 'rag'
    commit", Szymon Hajderek, Co-Authored-By Claude Opus 5.5, 27.09 09:58 +0200), then Wikipedia retrieval was
    re-added properly (off by default, fail-safe, own skill + tests) in `9ed0effa` (JulianVolodia,
    Co-Authored-By Claude Fable 5.1, 27.09 10:46 +0200).
- **27.09.2026 (morning)** — 003B-hackaton `CLAUDE.md` "Publishing rules and state" section written: synthetic
  data and Claude grades go straight to `main`, rebase-only.
- **27.09.2026** — user stops an agent mid-push ("NIE PUSHUJ DO REPO") before it pushes an organizers' exam
  pack to the team repo → new standing rule "ask before every commit/push, even when convenient".
  *(memory/no-push-without-explicit-ask.md)*
- **27.09.2026** — user corrects an agent that had been tar/scp-piping files to servers: "przejdź się z
  kluczami na tę maszynę" (go to the machine with the keys) → sync-via-git rule.
  *(memory/sync-via-git-on-the-machine.md)*
- **27.09.2026, final pack eval** — closed-book blind grading of `abl-r16` step-175 vs base on the organizers'
  -style pack `history-synthetic-c-v4` (37 items, 60 pts, no key): **3 Claude subagents** (with images,
  A/B shuffled) score it 42/60 vs base 35/60; **DeepSeek flash-high** (text only) scores it 43/60 vs base
  42/60 on the same pack. *(EXPERIMENTS.md:261-271; 003B CLAUDE.md "Final pack eval" section)*

## Key numbers

| Label | Value | Source |
|---|---|---|
| Claude subagents used for the val-set grader calibration | 12 subagents, 499 answers graded blind | l40s-results/EXPERIMENTS.md:77 |
| Gemma self-grader vs Claude reference grader, exact agreement | 85% (Gemma higher 67×, lower 9× when they differ) | l40s-results/EXPERIMENTS.md:79 |
| RFT no-thinking samples graded by Claude (`grade-rft-batches`) | 1212 samples, 28 batches, 462 full points | l40s-results/EXPERIMENTS.md:111 |
| RFT thinking-mode samples graded by Claude in this session (batches 38–49) | 458 samples | l40s-results/EXPERIMENTS.md:118; commit c3900f3 |
| Grading batch/grade files on disk in `claude-grading/` | `rft_grades_0..49` (50 files), `val_grades_0..5`/`grades_0..5` (6+6), `v3_grades_0..3` (4), `v3t_grades_0..3` (4), `v4f_grades_0..3` (4) | `ls l40s-results/claude-grading/` (this session) |
| DeepSeek re-grading of Claude-graded val answers | 728 items, 89.8% exact agreement, mean abs diff 0.10, cost $0.10 | HANDOFF_01.md:83-88 |
| Cost of the whole DeepSeek Wikipedia-grounded synthetic pipeline (26.09) | $22.57 USD | HANDOFF_01.md:67 |
| DeepSeek account balance after that (26.09 EOD) | ~$9.4 USD | HANDOFF_01.md:145 |
| Final pack blind eval (LoRA vs base, organizers-style, no key) | Claude(3 subagents,images): 42/60 vs 35/60; DeepSeek flash-high(text): 43/60 vs 42/60 | l40s-results/EXPERIMENTS.md:267-269 |
| Tournament finalists (r4, r8) Claude-graded val score | 50.8% (65/128) each, first LoRA ≥ base_think (49.2%) | l40s-results/EXPERIMENTS.md:244-245,253 |
| ClearML users seen in the shared dashboard (26.09 evening) | Szymon Hajderek, Pawel, Norbert Jaworski, Wojciech Błaszczuk, + ~60 vendor example runs (user Allegro.ai) | HANDOFF_02.md:33-39 |
| Team repo total commits (this session's count) | 146 (`git log --oneline --all \| wc -l`) | this session, `git log` in WarsawModelTrainersHackathon |
| Team repo contributors (commit counts) | JulianVolodia 43(+Volodia 2), Pawel Cyrta 30, endote 26, Szymon Hajderek 22(+szymon-hajderek 7), hiderr 8, Olaf Serafin 6(+o-serafin 2) | this session, `git shortlog -sn --all` |

## Components

- `WarsawModelTrainersHackathon/AGENTS.md` — the team's standing rulebook for coding agents (134 lines):
  which grader/model to use for exam grading, the fixed 2-exam dev set for harness changes
  (`harness/scenarios/default-harness-eval.json`), a "depreciated (DO NOT USE)" section of excluded/leaky
  training sources, the 27.09 "Current history LoRA training policy" (explicit user authorizations, a P0
  human-adjudication gate before any score becomes a training reward), and the ClearML tracking mandate +
  copy-paste recipe.
- `WarsawModelTrainersHackathon/CLAUDE.md` — one line, `@AGENTS.md`: makes Claude Code load `AGENTS.md` as
  its project instructions for that repo.
- `WarsawModelTrainersHackathon/.claude/skills/matura-rag/SKILL.md` — a custom Claude Code **skill** the team
  wrote, describing how to run/bench the Wikipedia-RAG-augmented solver (services, code paths, gotchas about
  the image-matcher's unreliable "verified" flag). Added in commit `9ed0effa` (Co-Authored-By Claude Fable
  5.1).
- `WarsawModelTrainersHackathon/COMMUNICATION.md` §3 (lines 216–477) — "LoRA bench queue … contract for
  agents": job lifecycle, HTTP API, result-field semantics, and §3.6 "Etiquette for agents sharing this
  host" (one job per checkpoint, always set `--id`/`--note`, don't run competing servers, don't purge others'
  jobs, prefer `--wait`, everything also reports to ClearML `HCKT/bench`).
- `WarsawModelTrainersHackathon/harness/TASK_WORKFLOW.md` — documents the exam-solver's own internal
  multi-call "agentic" structure: default `--answer-review on` (draft → critical review → corrected answer),
  the 3-stage essay workflow (plan → draft → revision), visual-detail crop/OCR modes, and a taxonomy for
  classifying visual-answer failures (observation / historical-interpretation / chronology / unresolved).
- `WarsawModelTrainersHackathon/training/REPRODUCE_FOR_CLAUDE.md` — 124-line instruction set written for an
  agent to reproduce and then ablate the Qwen3.8-27B IQ2_S LoRA run on a fresh H100: explicit "rules read
  first" (don't `git pull` mid-run, outputs never inside the repo, one run per GPU, never `pkill -f`/`pgrep
  -f` — it matches the agent's own shell, grading is `deepseek-flash-high` only, track everything in
  ClearML), setup/smoke/reference-run/ablation-sweep steps, and a reporting template.
- `WarsawModelTrainersHackathon/harness/grading.py` — "Prepare rubric evidence, run **Astra** through
  **Codex CLI**, validate/import its decisions" (module docstring, line 2): a third independent grader,
  `gpt-6-astra` at `medium` effort, invoked via `subprocess`/Codex CLI rather than as a Claude Code workflow;
  its instructions tell it to treat exam text as data-not-instructions, quote evidence verbatim, and never
  fabricate a score.
- `l40s-results/claude-grading/eval_batches.py` — "Claude-subagent grading of `eval_gguf.py` answers
  (val/test), the reference grader for model selection" (module docstring): `prep` shuffles/blinds answers
  into `<prefix>_batch_<n>.jsonl` for the `grade-eval-batches` Claude Code workflow (`{"prefix","batches"}`),
  `merge` folds `<prefix>_grades_*.jsonl` back into `results_claude.jsonl` and a summary JSON.
- `l40s-results/claude-grading/rft_batches.py` (implied by `rft_batch_*`/`rft_grades_*` files) — the
  equivalent blinding/merging script for the `grade-rft-batches` workflow (`{"batches":[...]}`).
- `003B-hackaton/HANDOFF_01.md`, `HANDOFF_02.md`, `HANDOFF_03.md`, `HANDOFF_REVIEW_FABLE.md` — the team's
  handoff-document convention: each states which Claude Code session/model wrote it, for whom, and what was
  done/left open, so a new session (or a different model, e.g. Fable for code review) can resume without
  re-deriving context.
- Team `003B-hackaton/CLAUDE.md` — the user's own running rulebook layered on top of the team repo: no server
  env edits without asking, publishing rules for synthetic data (`main`, rebase-only) and models (HF +
  localhost), sync-via-git, ClearML tracking, DeepSeek for bulk generation, Claude subagents as reference
  graders, and the exact JSON shapes of the `grade-rft-batches`/`grade-eval-batches` workflows.
- `/home/kali/.claude/projects/…/memory/*.md` — 8 standing feedback/reference memory files distilled from
  user corrections during the hackathon (see Decisions section); each names its origin session and the
  quote/incident that produced it.

## Decisions, incidents and lessons

- **ClearML keys hardcoded into `track.py`.** Commits `70bfb52b` and `62521b7d` (author `hiderr`,
  Co-Authored-By Claude Opus 5.5, 26.09 15:02–15:17 UTC) hardcode the ClearML access/secret key pair so
  tracking "fails soft" without a `.env`. `HANDOFF_01.md:143` flags this the same day: "⚠️ `track.py`
  hardcodes the ClearML keys (commit `62521b7d`). They should be rotated." The user's memory rule
  (`clearml-tracking-rule.md`) explicitly warns: "`track.py` hardcodes ClearML keys … never copy them
  elsewhere." As of the sources read, no later commit rotating/removing the hardcoded keys was found — status
  is **unresolved / not yet fixed** as far as this repo state shows.
- **The "rag" commit and its rollback.** `6b6dab53` (author endote, message just `" rag"`, no body) changed
  `harness/matura.py`'s task workflow. It was rolled back by `2e779446` ("harness: roll the solver back to
  before the 'rag' commit", Szymon Hajderek, Co-Authored-By Claude Opus 5.5, 27.09 09:58 +0200), restoring the
  Polish system prompt, the default `--answer-review on` draft→review flow and the task-workflow docs to their
  pre-rag state, while explicitly keeping the newer "grading-consistency tooling" and image support. Wikipedia
  retrieval was then re-implemented more carefully as an **opt-in, fail-safe** feature (`--retrieval off|on`,
  default off; "Any failure or timeout = the item is solved without facts") in `9ed0effa` (JulianVolodia,
  Co-Authored-By Claude Fable 5.1), with its own tests and a dedicated Claude Code skill
  (`matura-rag/SKILL.md`) rather than being folded silently into the default solver path.
- **Grader self-preference / calibration.** The base model (Gemma, thinking mode) used as its own grader
  scored itself ~11 points too lenient versus blind Claude-subagent grading and even re-ranked variants
  differently (`base` 50.8% by Gemma vs 39.1% by Claude). This finding — from 12 Claude subagents blind-grading
  499 answers — made **"Claude subagents are the reference grader for model selection"** an explicit, repeated
  rule (AGENTS.md:7, 003B CLAUDE.md:54, EXPERIMENTS.md:87). `HANDOFF_REVIEW_FABLE.md:37-40` separately flags a
  residual **self-preference risk**: even the Claude/DeepSeek graders may favor a LoRA that has learned the base
  model's own stylistic tics, since it was trained via RFT on the base's own graded samples.
- **DeepSeek chosen over Opus agents for bulk generation, by explicit user decision.** 26.09: "może jesteś w
  stanie zrobić coś innego? niż używanie opusa" (can you do something other than using Opus?) → all
  large-scale synthetic generation/grading moved to static Python + the DeepSeek API, reserving Claude
  agents for grading quality control and code work (`memory/deepseek-for-bulk-generation.md`).
- **`nohup` is not enough for long jobs.** `HANDOFF_03.md:35` : "the first eval run died when the ssh session
  closed. Long jobs must be started with `setsid nohup … & disown` (this is in CLAUDE.md now)." Now codified
  in `003B-hackaton/CLAUDE.md` ("Publishing rules and state" section).
  Also on the training side, `training/REPRODUCE_FOR_CLAUDE.md:16-17` independently states the same rule
  ("Everything is detached… The run must survive the end of your session") and separately warns never to use
  `pkill -f`/`pgrep -f` because the pattern matches the agent's own shell and kills it.
  `SETUP_ON_L40S.md:432` records a related close call: "the training launch (step 7) ran even though the tool
  call looked rejected in the Claude Code UI. Before assuming something didn't start, check the server."
- **No env edits without asking.** An agent flipped `include-system-site-packages` to `false` and downgraded
  `fsspec` on the shared L40S venv to fix a broken `import trl`, without asking first. User: "better not edit
  execution environment please" (25/26.09) → standing rule, still in force per `003B CLAUDE.md` ("Don't
  change the server environment without asking the user first").
- **No push without explicit ask.** 27.09: user interrupts an agent about to push an organizers' exam pack to
  the shared team repo ("NIE PUSHUJ DO REPO"). Lesson recorded verbatim in memory: earlier standing
  permissions (for synthetic data, benchmark harness, the submission server) were each granted per-instance,
  "not a blanket permission." Team repo commits/pushes now require asking every time.
- **Sync via git, not scp/tar.** After an agent tar-piped files onto the L40S, the user asked it to instead
  log into the target machine and `git pull` with the keys already there ("przejdź się z kluczami na tę
  maszynę … weź klucz z tej innej sesji Claude, która jest już w moim profilu" — use the key from the other
  Claude session already in the GitHub profile, not a new deploy key).
- **The user's explicit training-policy authorizations (27.09, quoted verbatim in `AGENTS.md`):** "OKAY, now
  RUN !!!" authorized the full training run on trusted source answers; the policy simultaneously **keeps**
  technical checks, provenance and a "P0 semantic audit gate" that a Gemma/DeepSeek grade cannot become a
  training reward until "a named human has adjudicated" it — the May-2026 Q24 pouring/helmet/candle
  discrepancy is explicitly "quarantined pending human adjudication" (AGENTS.md:71-78).
- **Handoff practice as a deliberate workaround for context loss.** Every handoff doc names its author model
  (Opus 5.5), its addressee (the user, or explicitly "Fable" for a code review), and states the ground rules
  for the next session (e.g. `HANDOFF_REVIEW_FABLE.md:3`: "Don't change code, the server or the HF repo. I'm
  still running jobs, and I'll apply fixes myself from your feedback."). `HANDOFF_01.md:1` even names the exact
  Claude Code session id (`c20f3623`) it continues from.

## People

(Git author names as they appear in the log; "JulianVolodia"/"Volodia" are the same person, the owner of the
`003B-hackaton` notes; "szymon-hajderek" = "Szymon Hajderek"; "o-serafin" = "Olaf Serafin".)

- **JulianVolodia** (43 commits, +2 as "Volodia") — heaviest committer: harness/benchmark features
  (`b2f011db`, `a8153834`, `24beec10`, `314868c9`, `9ed0effa`), data fixes (`cbc30dc`, `c0c484e1`), LoRA v4
  tournament + DPO (`83e568d4`), RFT-think grading commit `c3900f3`, DeepSeek calibration `53b6d29`, all four
  Wikipedia-synthetic-data waves. Most of these carry `Co-Authored-By: Claude Opus 5.5` or `Claude Fable 5.1`
  and, on several, an explicit `Claude-Session:` link — i.e. done through Claude Code sessions this person
  drove. Also the author of every `003B-hackaton/CLAUDE.md`/HANDOFF-related memory rule cited above (the
  session's "user").
- **hiderr** (8 commits) — wrote the shared ClearML tracking infrastructure: `track.py`, `CLEARML.md`,
  `AGENTS.md`'s tracking rule, and (with Claude Opus 5.5 co-authorship) the commits that hardcoded the
  ClearML keys.
- **Szymon Hajderek** (22 commits) / **szymon-hajderek** (7 commits) — wrote the LoRA bench queue and its
  agent-facing contract (`COMMUNICATION.md` §3, `da4611f1`/`f75ee9ae`), `training/REPRODUCE_FOR_CLAUDE.md`
  (explicitly for an agent), and rolled back the "rag" commit (`2e779446`, with Claude Opus 5.5).
- **endote** (26 commits) — repo owner/original author, wrote the (unreviewed, one-word-message) "rag" commit
  `6b6dab53` that was later rolled back, and other core harness/benchmark work.
- **Pawel Cyrta** (30 commits) — second-heaviest committer overall (postrain/training-pipeline work per commit
  subjects such as "postrain machine 2 update", "note from training gemma"); no agent-workflow-specific
  commit found in the greps run for this fact sheet.
- **Olaf Serafin** (6 commits) / **o-serafin** (2 commits) — contributor; no agent-workflow-specific commit
  isolated in this pass.
- Grading/orchestration models referenced by name across commits and docs: **Claude Opus 5.5**,
  **Claude Fable 5.1** (both as Co-Authored-By on team-repo commits and as handoff authors/addressees),
  **DeepSeek `deepseek-flash`/`deepseek-flash-high`** (bulk generation + secondary/dev-set grader), and
  **Codex CLI running "Astra" (`gpt-6-astra`)** (third grader, `harness/grading.py`) — none of the three
  non-Claude models appear as git commit co-authors; their use is documented only in code/docs, not commit
  trailers (`git log --grep Codex|Astra` returned no hits in this repo).

## Open issues / limitations

- ClearML API keys hardcoded in `track.py` (`70bfb52b`, `62521b7d`) were flagged as needing rotation in
  `HANDOFF_01.md` on 26.09; no later fix was found in the commits inspected for this fact sheet.
- `HANDOFF_REVIEW_FABLE.md` explicitly asks a second model to audit the whole LoRA pipeline read-only; whether
  that review (`REVIEW_FEEDBACK.md`) was written and/or acted on was **not checked** in this pass (out of
  scope: the task limited this fact sheet to agentic-workflow docs, not `REVIEW_FEEDBACK.md`'s content).
  This is a gap, not a finding.
- `HANDOFF_03.md:81` records an unresolved question: `"old_matura_exams"` could not be found "in any branch,
  the git history, the server or the HF org. We asked the user where it comes from and got no answer yet" —
  left open as of that handoff.
  `HANDOFF_03.md:102` lists two more open items at handoff time: whether to try real GRPO, and finishing the
  LoRA v4 tournament.
- AGENTS.md's "P0 semantic audit gate" states that a passing audit sample "does not approve unsampled scores"
  and that the May-2026 Q24 discrepancy "remains quarantined pending human adjudication" — i.e., as of the
  version of `AGENTS.md` read, this specific audit item is explicitly still open.
- `harness/TASK_WORKFLOW.md:15` self-qualifies its own review mechanism: "This is a model instruction, not a
  guarantee that every revision improves correctness" — the team explicitly does not claim the agentic
  draft→review workflow is proven to raise answer quality, only that it exists and is documented for reuse.
- This fact sheet did not read `REVIEW_FEEDBACK.md`, `EXPERIMENTS.md` in full (only targeted greps/sections),
  or any commit bodies beyond the ones the task pointed at or that turned up in `--grep` searches — a full
  pass over all 146 commit bodies could surface more agent-related incidents.

## Good quotes or slide-worthy details

- "Notes for coding agents" — the literal title of the team's `AGENTS.md` (line 1).
- "FOR GRADING EXAM ATTEMPTS ONLY deepseek-flash-high@think should be use !!!" — AGENTS.md:7, capitals and
  double-bang in the original.
- Module docstring of `harness/grading.py`: "Prepare rubric evidence, run Astra through Codex CLI,
  validate/import its decisions." — a one-line summary of running a third LLM (via Codex, not Claude Code) as
  an independent examiner, with instructions such as "A truly unresolvable score is null, never a fabricated
  zero."
- `training/REPRODUCE_FOR_CLAUDE.md:22`: "**Never use `pkill -f` or `pgrep -f`**: the pattern matches your
  own shell and kills it." — a rule that exists specifically because an agent is the one running the
  commands.
- `l40s-results/EXPERIMENTS.md:87`: "**The bar to beat is base_think, 49.2%.**" — the single number every
  later LoRA in the hackathon is compared against; the tournament finalists (50.8%) are the first to (barely)
  clear it.
- `COMMUNICATION.md:445` etiquette rule for agents sharing the bench-queue host: "**One job per checkpoint per
  configuration.** Do not queue every 25-step checkpoint of a run; queue the ones you would actually compare."
- Memory file quote (`no-env-edits-without-asking.md`): "the user said 'better not edit execution environment
  please'" — the entire rule fits in one sentence of user feedback.
- `HANDOFF_REVIEW_FABLE.md:3`: "**Hi Fable.** Please review the whole LoRA workstream… Don't change code, the
  server or the HF repo. I'm still running jobs, and I'll apply fixes myself from your feedback." — one Claude
  session addressing another by its model nickname, mid-hackathon.
- `SETUP_ON_L40S.md:432`: "the training launch (step 7) ran even though the tool call looked rejected in the
  Claude Code UI." — a small but telling agent/tool-approval-UI edge case the team hit and documented.

## Sources consulted

- `WarsawModelTrainersHackathon/AGENTS.md` (full, 134 lines)
- `WarsawModelTrainersHackathon/CLAUDE.md` (full, 1 line: `@AGENTS.md`)
- `WarsawModelTrainersHackathon/.claude/skills/matura-rag/SKILL.md` (full)
- `WarsawModelTrainersHackathon/COMMUNICATION.md` §3 / §3.5–3.7 (lines ~216–477)
- `WarsawModelTrainersHackathon/harness/TASK_WORKFLOW.md` (full, 126 lines)
- `WarsawModelTrainersHackathon/harness/grading.py` (docstring + JUDGE_MODEL/INSTRUCTIONS, lines 1-40)
- `WarsawModelTrainersHackathon/training/REPRODUCE_FOR_CLAUDE.md` (full, 123 lines)
- `WarsawModelTrainersHackathon/notes.md` (full, 11 lines)
- `WarsawModelTrainersHackathon/SETUP_ON_L40S.md` (grep "Claude", lines 3,7,9,15,432,444,446,477,484,490,
  497-498,524,535-537)
- `003B-hackaton/CLAUDE.md` (full)
- `003B-hackaton/HANDOFF_01.md`, `HANDOFF_02.md`, `HANDOFF_03.md`, `HANDOFF_REVIEW_FABLE.md` (full)
- `003B-hackaton/l40s-results/EXPERIMENTS.md` (targeted sections: lines 70-130, 172-271; grep for
  workflow/subagent/Claude/Codex/Astra)
- `003B-hackaton/l40s-results/claude-grading/eval_batches.py` (docstring + `prep`/`merge`, full 60-line head)
- `003B-hackaton/l40s-results/claude-grading/` directory listing + `val_claude_summary.json` (this session,
  `ls`/`cat`)
- `/home/kali/.claude/projects/-mnt-hgfs-sharedWithKali-ai-thingy-september-26-003B-hackaton/memory/MEMORY.md`
  and all 8 linked memory files (full)
- Team repo git history (`WarsawModelTrainersHackathon`, branch `main`): `git log --oneline -60`,
  `git log --oneline --all --grep=Claude|Codex|agent -i`, `git log --grep=Astra` (empty),
  `git shortlog -sn --all`, `git log --oneline -- AGENTS.md|CLAUDE.md|CLEARML.md|COMMUNICATION.md|
  harness/TASK_WORKFLOW.md|training/REPRODUCE_FOR_CLAUDE.md|.claude/`, and `git show -s` for commits
  `7737f119`, `826894c2`, `f75ee9ae`, `da4611f1`, `c0c484e1`, `62521b7d`, `70bfb52b`, `b2f011db`, `a8153834`,
  `24beec10`, `314868c9`, `83e568d4`, `c3900f3`, `cbc30dc`, `91d51b4`, `53b6d29`, `76578dc5`, `6b6dab53`,
  `2e779446`, `9ed0effa`, `33a07917`, `da2195e7`
