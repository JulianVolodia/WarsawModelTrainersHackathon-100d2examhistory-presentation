# l40s-gemma-lora-part2

## Summary

Part 2 of the team's Gemma 4 12B QLoRA work on the L40S GPU server, 26.09–27.09.2026: rejection-sampled
fine-tuning (RFT) with thinking mode, a 18-config LoRA hyperparameter tournament, DPO preparation (never
run), a DeepSeek-vs-Claude grader calibration, and a final closed-book evaluation on the organizers'
final-style pack. The best Gemma LoRA produced here, `v4-tourn-r4-think` / `v4-tourn-r8-think`
(rank 4/8, lr 1e-4, trained on 359 thinking-mode RFT traces), scored 50.8% on val v2.1 by Claude grading,
the first LoRA to match or slightly beat plain thinking-mode base Gemma (49.2%) rather than lose to it.
Hyperparameters mattered far more than the RFT data itself: the earlier v3-rft-think (same data, r32,
untuned) scored only 44.5%. A DeepSeek-flash grader was calibrated against Claude (89.8% exact-point
agreement on 728 items) and used as a cheap proxy for later comparisons. On 27.09 a separate model —
**Qwen3.8-27B** with a rank-16 LoRA (`abl-r16` step-175, not part of this Gemma 4 pipeline) — was
blind-graded against its own base on the organizers' final-style pack `history-synthetic-c-v4` (37 items,
60 pts, no key): 42/60 vs 35/60 by Claude, 43/60 vs 42/60 by DeepSeek. All scores in this area are model
grades (Claude and/or DeepSeek), never an official CKE key.

## Timeline

- **26.09.2026, ~05:30–05:55 UTC** — RFT no-thinking round trained into `v3-rft` on `lora-v3/rft/`: NF4 r32
  lr1e-4, 3 epochs, 261 examples, 22.6 min. Source: `l40s-results/EXPERIMENTS.md:1-9`.
- **26.09.2026, ~06:39–07:13 (local +0200, file mtimes)** — Claude subagents grade RFT no-think samples in
  6 batches (`claude-grading/batch_0..5.jsonl`, `grades_0..5.jsonl`). Source: file listing,
  `l40s-results/claude-grading/`.
- **26.09.2026, 07:30 +0200** — commit `c8dca45d` "Add RFT training sets selected by Claude grades"
  (JulianVolodia). Source: `git log`.
- **26.09.2026, 08:00 +0200** — commit `a2f963f4` "Docs: RFT sampling, Claude grading, v3-rft, repo
  workflow" (JulianVolodia).
- **26.09.2026, 08:11 +0200** — commit `f7791ea6` "v3-rft evaluation: Claude-graded val answers and
  results" (JulianVolodia).
- **26.09.2026, ~11:50 UTC** — commit `62f7044a` "Benchmark: serve and bench the best LoRA, history-lora
  v3-rft step 51" (Szymon Hajderek): adds `gemma-4-12b-q4-rft` on :8020.
- **26.09.2026, ~12:15–13:35 UTC** — RFT thinking round: last 458 thinking-mode samples graded by Claude
  (batches 38-49); `train_rft_think_claude.jsonl` built (359 examples); `v3-rft-think` trained in
  `lora-v3/rft_think/` (NF4 r32/α64, lr1e-4, 3 epochs, batch 2×8, max_len 4096, 63 steps, 34 min, peak VRAM
  15.1 GB). Source: `l40s-results/EXPERIMENTS.md:11-38`, `HANDOFF_03.md` §1.1.
- **26.09.2026, ~14:01 +0200** — commit `40a7d79a` "Benchmark: add Gemma 4 12B Q4_0 and the v3-rft LoRA to
  RESULTS.html (34 columns)" (Szymon Hajderek): merges base Q4_0 (think 72.9% / nothink 68.1%) and
  `gemma-4-12b-q4-rft@nothink` (62.6%) [note: these are the benchmark harness's own scoring, a different
  metric from the Claude-graded val % used elsewhere in this sheet].
- **26.09.2026, 15:11 +0200** — commit `c3900f33` "Claude grades for the remaining thinking-mode RFT
  samples (batches 38-49), v3-rft-think train set (359 examples)" (JulianVolodia).
- **26.09.2026, ~14:30 UTC** — DeepSeek-vs-Claude grader calibration on 728 already-Claude-graded answers
  (`grade_ds.py`, cost 0.10 USD): 89.8% exact-point agreement, mean |diff| 0.10, precision 0.88 / recall
  0.94 on "full points". Source: `l40s-results/EXPERIMENTS.md:41-66`, `HANDOFF_01.md` §3.
- **26.09.2026, 16:40 +0200** — commit `53b6d29d` "DeepSeek grader calibration vs Claude on val answers
  (728 items)" (JulianVolodia).
- **26.09.2026, from ~14:55 UTC, greedy search abandoned after ~10 min** — `lora-v4/greedy/greedy_search.py`
  (one-parameter-at-a-time, ~28 runs × 35 min ≈ 17h) started then stopped at the user's request for faster,
  parallel elimination. Source: `EXPERIMENTS.md:69-71`, `HANDOFF_03.md` §1.2.
- **26.09.2026, ~14:55 UTC onward** — LoRA tournament (successive elimination) launched on the think RFT
  data: 18 configs (rank 4-128 × lr 1e-4/1e-5/1e-6 × batch 16/32/64), 2 legs in parallel. Source:
  `EXPERIMENTS.md:74-108`, `HANDOFF_03.md` §1.3.
- **26.09.2026, 15:57 UTC** — Runpod A100 SXM 80GB pod `wmth-lora-tournament-a100` (id `kxjd6zofmp2cqz`,
  $1.59/h) created to run rank 32/64/128 configs in parallel with the L40S (which runs rank 4/8/16).
  Source: `HANDOFF_03.md` §1.3.
- **26.09.2026, 15:55 UTC** — pruning decision: all lr 1e-5 and 1e-6 configs cut after epoch 1 (eval_loss
  stuck at the untrained-base level 0.313, vs ~0.278 for lr 1e-4). Source: `EXPERIMENTS.md:96-103`.
- **26.09.2026, 16:00–16:20 UTC** — incidents: L40S ssh outage (~12 min kex resets) coinciding with a server
  env change (`HOME=/workspace/.home`) that crashed one leg (r64, `PermissionError`); duplicate legs started
  by the old driver during the outage (moved to `l40s-dup/`); one `scp`/pipe upload of `tournament.py`
  produced a truncated (empty) file, re-uploaded. Source: `HANDOFF_03.md` §2.
- **26.09.2026, 16:27–16:28** (file mtimes) — DPO pairs and scripts written: `build_dpo_pairs.py`,
  `dpo_train.py`, `run_dpo_think.sh`, `pairs_think.jsonl` (88 pairs), `pairs_nothink.jsonl` (94 pairs).
  Written and syntax-checked, **never run**. Source: `l40s-results/lora-v4/dpo/` file listing,
  `HANDOFF_03.md` §1.4, `EXPERIMENTS.md:207`.
- **26.09.2026, 17:27 +0200** — commit `83e568d4` "LoRA v4: tournament hyperparameter search + DPO scripts
  and Claude-graded preference pairs" (JulianVolodia, co-authored Claude Opus 5.5): pushes the
  single-host tournament script and DPO code/data to `main` (612 lines added, 7 files). Source: `git show
  --stat 83e568d4`.
- **26.09.2026, 17:34 UTC** — tournament reaches `DONE finalists`: **r4 (batch 16, eval loss 0.2747 at
  epoch 3.0)** and **r8 (batch 32, eval loss 0.2756)**, both lr 1e-4. Eliminated: r16 (2.5 ep, 0.2771), r32
  (2.5 ep, 0.2848), r64 (2.0 ep, 0.2790), r128 (2.0 ep, 0.2889). Source: `EXPERIMENTS.md:112-115`, confirmed
  against `l40s-results/lora-v4/tournament/leaderboard.json` (epoch "3.0": r4=0.27467, r8=0.27556).
- **26.09.2026, ~17:45 UTC** — tournament artifacts mirrored to `l40s-results/lora-v4/tournament/` (346 MB,
  without `trials/*/checkpoints/`). Source: `EXPERIMENTS.md:116-117`.
- **26.09.2026, ~19:45 UTC** — Claude grading of the two finalists on val v2.1, after a 16k-token rerun of
  15 truncated (6144-token) answers (9 finished, 2 still looped past 16k, 6 stayed truncated):
  **t4think (r4) 50.8% (65/128)**, **t8think (r8) 50.8% (65/128)**, vs base_think 49.2% (63), v3-rft-think
  44.5% (57), base 39.1% (50). Source: `EXPERIMENTS.md:120-133`, `HANDOFF_03.md` (tournament outcome
  section).
- **26.09.2026, 22:06 +0200** — commit `610ed6fa` "gemma4-rft-step51-latest16-v1 40 matura results"
  (endote): a benchmark-harness update (bench.py, matura.py, README changes, harness docs) plus results for
  a 40-item matura run against `gemma4-rft-step51-latest16-v1`; not a Gemma-LoRA training step itself.
  Source: `git show --stat 610ed6fa`.
- **27.09.2026, morning** — HF publishing of tournament finalists: `v4-tourn-r4-think` (commit `145f47a`),
  `v4-tourn-r8-think` (commit `044525c`), index `c0b729c`; earlier status/results commits `1ca7b87` (r4) and
  `be3fd39` (r8), index `fc93feb`. Source: `EXPERIMENTS.md:99,107-108,169-170`.
- **27.09.2026** — final closed-book pack evaluation on `history-synthetic-c-v4` (37 items, 60 pts, no key),
  but run on a **different model, Qwen3.8-27B** with LoRA `abl-r16` step-175 (IQ2_S GGUF on the H200), not on
  the Gemma 4 pipeline of this fact sheet: 42/60 (Claude, 3 subagents) vs 35/60 base; 43/60 (DeepSeek) vs
  42/60 base. Source: `l40s-results/EVAL/2026-09-27_history-synthetic-c-v4_qwen38-27b-iq2s_s175-vs-base/
  README.md`, `CLAUDE.md` "Final pack eval + EVAL/ on HF (27.09)".
- **27.09.2026** — same EVAL folder mirrored to HF `WMTH-100d2exam/history-lora/EVAL/…` (commit `4ee834bf`)
  and to the (separate) public HF repo `WMTH-100d2exam/BASELINE_IMPROVEMENT_QWEN_3.8_Q2_S_100D2EXAMHISTORY`
  as its "Evaluation 2" section. Source: `CLAUDE.md`, `l40s-results/EVAL/README_BASELINE_IMPROVEMENT_public.md`.

## Key numbers

| label | value | source |
|---|---|---|
| RFT no-think samples generated | 1212 | `EXPERIMENTS.md:1` |
| RFT no-think samples with full Claude points | 462 (covering 269/606 tasks) | `EXPERIMENTS.md:1` |
| v3-rft train set size | 261 examples | `EXPERIMENTS.md:3` |
| v3-rft training time | 22.6 min | `EXPERIMENTS.md:3` |
| v3-rft val loss, checkpoint-10 vs step 51 | 2.693 (step 10) vs 3.14 (step 51) | `EXPERIMENTS.md:4` |
| RFT think samples graded (of 1212) | 1169 (43 truncated, skipped) | `EXPERIMENTS.md:14` |
| RFT think samples with full points | 627 | `EXPERIMENTS.md:14` |
| train_rft_think_claude.jsonl examples | 359 (247 tasks dropped, no correct trace) | `EXPERIMENTS.md:16` |
| after >4096-token filter | 335 train / 17 val | `EXPERIMENTS.md:16` |
| think-trace token length | mean 1510, p95 2793 | `EXPERIMENTS.md:16` |
| v3-rft-think training | 63 steps, 34 min, peak VRAM 15.1 GB | `EXPERIMENTS.md:18` |
| v3-rft-think val loss | 0.290 → 0.281 (step 20, best) → 0.288 (step 63) | `EXPERIMENTS.md:19` |
| v3-rft-think val v2.1 score (Claude, 111 tasks/128 pts) | step 63 = 44.5% (57 pts), step 20 = 42.2% (54) | `EXPERIMENTS.md:21-25` |
| base_think / base val score (Claude) | 49.2% (63) / 39.1% (50) | `EXPERIMENTS.md:21-25` |
| DeepSeek-vs-Claude calibration set | 728 answers | `EXPERIMENTS.md:44` |
| DeepSeek grading cost | 0.10 USD | `EXPERIMENTS.md:45` |
| DeepSeek/Claude exact-point agreement | 89.8% | `EXPERIMENTS.md:46` |
| DeepSeek/Claude mean abs. point diff | 0.10 | `EXPERIMENTS.md:46` |
| DeepSeek precision/recall on "full points" | 0.88 / 0.94 | `EXPERIMENTS.md:47-48` |
| Tournament grid | 18 configs: rank {4,8,16,32,64,128} × lr {1e-4,1e-5,1e-6} × eff. batch {16,32,64} | `EXPERIMENTS.md:88-92`, `tournament.py` docstring |
| Tournament train/eval split | 318 train / 34 eval (7 dropped, >4096 tokens) | `EXPERIMENTS.md:86` |
| Tournament elimination schedule | every 0.25 epoch, worst quarter dropped: 18→14→11→8→6→5→4→3→2 | `EXPERIMENTS.md:80` |
| A100 pod cost | $1.59/h, ~2.2h ≈ $3.5 total, deleted | `EXPERIMENTS.md:167` |
| Tournament finalists (eval loss @ 3.0 epochs) | r4 = 0.2747, r8 = 0.2756 | `EXPERIMENTS.md:113`, `leaderboard.json` |
| Finalists val v2.1 score (Claude, after 16k rerun) | t4think 50.8% (65/128), t8think 50.8% (65/128) | `EXPERIMENTS.md:130-133` |
| Finalists val v2.1 score (DeepSeek) | t8think 47.7% (61), t4think 46.1% (59) | `EXPERIMENTS.md:118-121` |
| Truncated answers needing 16k rerun | 15 (9 fixed, 2 still looping, 6 stayed truncated) | `EXPERIMENTS.md:128` |
| DPO pairs prepared | 88 think, 94 no-think | `HANDOFF_03.md` §1.4, `build_dpo_pairs.py` file sizes |
| DPO runs executed | 0 (never run) | `EXPERIMENTS.md:207`, `HANDOFF_03.md` §1.4 |
| Wiki RFT pool (26.09) | 2999 tasks; 849 nothink + 497 think samples generated | `HANDOFF_03.md` "Wiki RFT pool" |
| Final pack C-v4 (Qwen3.8-27B abl-r16 s175) | Claude 42/60 (70.0%) vs base 35/60 (58.3%); DeepSeek 43/60 (71.7%) vs base 42/60 (70.0%) | `l40s-results/EVAL/…/README.md` |
| Same pack, differing items | Claude: differ on 11 items (LoRA ahead 9, base ahead 2); DeepSeek: identical on 33/37 | `grades_table.md`, `README.md` |

## Components

- `l40s-results/lora-v2/rft/`, `rft_think/` — RFT sampling output for v2 data: `samples.jsonl`,
  `samples_graded.jsonl` (Claude points added), `train_rft_claude.jsonl`, `train_rft_mix.jsonl`,
  `train_rft_think_claude.jsonl`. Path: `l40s-results/lora-v2/rft{,_think}/`.
- `l40s-results/lora-v3/rft/`, `rft_think/` — the actual v3-rft and v3-rft-think training runs (`run.sh`,
  `train.log`, `gpu.log`, `eval_val/`). Path: `l40s-results/lora-v3/{rft,rft_think}/`.
- `l40s-results/build_rft_train.py` — builds `train_rft_claude.jsonl` / `train_rft_think_claude.jsonl` from
  Claude-graded samples: no-think keeps the shortest full-points answer per task (pure STaR);
  `train_rft_mix.jsonl` adds key answers for unsolved tasks; think keeps the shortest fully-correct raw
  `<thought>...<answer>` trace per task, dropping tasks with none. Path:
  `l40s-results/build_rft_train.py`.
- `WarsawModelTrainersHackathon/scripts/rft_sample.py` — rejection-sampling driver: base Q4_0 (no thinking)
  generates k answers via llama-server, the same base with thinking judges by the exam key; `--build`
  assembles the training set (shortest full-points answer, or key answer as fallback); `--think` records
  raw `<thought>...<answer>` traces. Path: `WarsawModelTrainersHackathon/scripts/rft_sample.py`.
- `l40s-results/lora-v4/tournament/{tournament.py,train_leg.py}` — multi-host (L40S + Runpod A100)
  successive-elimination hyperparameter search over the 18-config grid; resumable via `<trial>/legs.jsonl`.
  Mirrored in the team repo (single-host version) at
  `WarsawModelTrainersHackathon/scripts/lora_v4/tournament/`. Path:
  `l40s-results/lora-v4/tournament/`, `WarsawModelTrainersHackathon/scripts/lora_v4/tournament/`.
- `l40s-results/lora-v4/tournament/leaderboard.json` — per-round (epoch checkpoint) eval_loss for every
  surviving config; confirms the finalists' losses at epoch 3.0. Path:
  `l40s-results/lora-v4/tournament/leaderboard.json`.
- `l40s-results/lora-v4/greedy/greedy_search.py` — abandoned one-parameter-at-a-time search (~28 runs × 35
  min). Path: `l40s-results/lora-v4/greedy/greedy_search.py`.
- `l40s-results/lora-v4/dpo/` = `WarsawModelTrainersHackathon/scripts/lora_v4/dpo/` —
  `build_dpo_pairs.py` (builds chosen/rejected pairs from same-task RFT samples with differing Claude
  points), `dpo_train.py` (trl 1.14 `DPOTrainer` on an NF4 base, optional `--init_adapter` reference),
  `run_dpo_think.sh` (starts from the v3-rft-think adapter), `pairs_think.jsonl` (88), `pairs_nothink.jsonl`
  (94). Never executed. Path: `l40s-results/lora-v4/dpo/`.
- `l40s-results/claude-grading/eval_batches.py` — builds blind, shuffled A/B-free (single-answer, multi-
  variant) grading batches from `eval_gguf.py` results and merges Claude's per-item grades back into a
  per-variant % summary; used for the `v3t`, `v4t`, `v4f` grading rounds (51 `rft_batch_*` files plus the
  `v3t`/`v4t`/`v4f` batch/grade sets). Path: `l40s-results/claude-grading/eval_batches.py`.
- `l40s-results/claude-grading/calib_analysis.py`, `calibration.md`, `ds_grades.jsonl`, `ds_report.json` —
  the DeepSeek-vs-Claude calibration analysis and its 728-item DeepSeek re-grading. Path:
  `l40s-results/claude-grading/`.
- `synthetic_extended/scripts/grade_ds.py` (mirrored as `data_synthetic_extended/scripts/grade_ds.py` in the
  repo) — grades answers with DeepSeek `deepseek-flash` (thinking off) using the same rules as the Claude
  workflow; used for the 728-item calibration and later as the RFT/tournament grader. Source:
  `EXPERIMENTS.md:41`, `HANDOFF_01.md` §3.
- `l40s-results/publish_hf.py` — publishes every LoRA version (adapter, GGUF, checkpoints, logs, config,
  eval) plus standalone `EVAL/<date>_<name>/` folders to the private HF repo `WMTH-100d2exam/history-lora`
  in one commit; skips files already present by content hash; mirrors `l40s-results/EVAL/` 1:1. Path:
  `l40s-results/publish_hf.py`.
- `l40s-results/EVAL/2026-09-27_history-synthetic-c-v4_qwen38-27b-iq2s_s175-vs-base/` — the final pack
  evaluation (Qwen3.8-27B, not Gemma): raw answers, submission-format JSON, `claude-grading/`,
  `deepseek-grading/`, `grades_table.md`, `h200-run/`, `README.md`. Path: as named.
- `l40s-results/EVAL/README_BASELINE_IMPROVEMENT_public.md` — local copy of the public HF README for
  `WMTH-100d2exam/BASELINE_IMPROVEMENT_QWEN_3.8_Q2_S_100D2EXAMHISTORY`, including its "Evaluation 2"
  section (the C-v4 pack result) and a first evaluation on the real `history-2026-czerwiec-matura-rozszerzona`
  exam. Path: `l40s-results/EVAL/README_BASELINE_IMPROVEMENT_public.md`.
- `wiki_ext-rft/` (mirror of server `/scratch/wiki_ext/`) — Wikipedia-grounded RFT sampling pool (2999
  tasks) and its DeepSeek grading ledger (36976 calls). Path: `l40s-results/wiki_ext-rft/`.

## Decisions, incidents and lessons

- **lr matters more than sampling data at short horizons**: at epoch 1 of the tournament, lr 1e-5 and 1e-6
  configs sat at the untrained base's loss (0.313) while lr 1e-4 was already at ~0.278; the LoRA B matrix
  starts at zero and barely moves in 5-20 steps with a decaying schedule, so all lr 1e-5/1e-6 configs were
  cut, "not a formal test, because per-example losses are not saved". Source: `EXPERIMENTS.md:96-103`.
- **eval_loss is only a proxy for Claude-graded quality**: on v3-rft-think the best-loss checkpoint (step
  20) scored *lower* on Claude grading than the worse-loss step 63; the tournament's method-gap note says
  the next tournament should generate and DeepSeek-grade answers at every rung, not just track eval_loss.
  Source: `EXPERIMENTS.md:19-25, 125-126`, `HANDOFF_03.md` §3 item 2.
- **Hyperparameters, not just RFT data, explain the tournament's win**: t4think/t8think (50.8%) beat
  v3-rft-think (44.5%) despite training on the *same* data, because v3-rft-think used untuned r32/lr1e-4.
  Source: `EXPERIMENTS.md:158-161`.
- **RFT plateau vs. thinking mode**: v3-rft-think stayed ~6 points below plain base_think even after
  training on the model's own best traces; picking the *shortest* correct trace may have shortened the
  reasoning being imitated. The tournament winners are the first LoRAs to not lose to thinking mode
  (+2 points, within noise). Source: `EXPERIMENTS.md:26-28, 163`.
- **Common 0-point failure mode**: graders most often zeroed an answer because the model noticed a missing
  image/map and gave conditional variants instead of one decision. Source: `EXPERIMENTS.md:27`.
- **ssh-session death kills background jobs**: the first v3-rft-think eval run stopped after 75/222 answers
  when its launching ssh session closed; fixed by launching with `setsid nohup … & disown` going forward
  (a rule now in CLAUDE.md). Source: `EXPERIMENTS.md:35`, `HANDOFF_03.md` §1.1.
- **Server env change broke a leg mid-tournament**: during a ~12-min ssh outage, `HOME`/`HF_HOME` were
  changed to `/workspace/.home` by someone else, crashing the r64 leg with `PermissionError`; the old driver
  also started duplicate r32/r64 legs on the L40S during the outage (moved to `l40s_dup/`). Source:
  `HANDOFF_03.md` §2.
- **Truncated upload**: an `ssh`-pipe upload of `tournament.py` produced an empty file; fixed by re-uploading
  via `scp`. Source: `HANDOFF_03.md` §2.
- **DeepSeek is a usable cheap grader, with caveats**: 89.8% exact agreement with Claude and matching
  big-picture ranking (base_think > LoRAs > base), but the LoRA-vs-LoRA ordering (a 2-3 point spread) can
  flip between graders, so final comparisons should still go through Claude or both. Source:
  `EXPERIMENTS.md:59-63`.
- **GRPO / real RL considered and shelved**: needs an in-loop reward; the Gemma-as-grader is too lenient,
  only ~51/606 train tasks are exact-match-checkable, a Claude-API reward is billable, and vLLM (needed for
  fast generation) is not installed. Source: `EXPERIMENTS.md:30-32`.
- **The final pack evaluation (27.09) is on a different base model.** `history-synthetic-c-v4` was
  evaluated with **Qwen3.8-27B** + a rank-16 LoRA (`abl-r16` step-175, from a separate "rank ablation" run,
  trained directly on the IQ2_S deploy quantization, not via the Gemma 4 QLoRA pipeline in this fact sheet).
  It is included here only because CLAUDE.md's "Final pack eval" section groups it with the LoRA
  experiments' timeline; it is not a Gemma 4 result. Source: `l40s-results/EVAL/2026-09-27_…/README.md`,
  `l40s-results/EVAL/README_BASELINE_IMPROVEMENT_public.md`.
- **Placeholder rubric.json trick**: `bench.py` refuses to load an exam pack without grading criteria even
  with `--no-judge`, so the C-v4 pack was given an empty placeholder `rubric.json` on the H200 to run the
  benchmark. Source: `l40s-results/EVAL/2026-09-27_…/README.md` "Session log" step 3, `CLAUDE.md`.
- **Public-repo essay-length penalty**: on the real June-2026 exam evaluation (in the public HF README),
  Claude Opus and DeepSeek disagree mostly on the essay because the LoRA writes shorter essays (225 vs 352
  words) and the CKE key zeroes coherence below 300 words — a rule Opus applied and DeepSeek did not.
  Source: `l40s-results/EVAL/README_BASELINE_IMPROVEMENT_public.md`.

## People

- **JulianVolodia** (repo author identity for the user's own commits; = "Volodia") — authored the RFT
  training-set, v3-rft, v3-rft-think, DeepSeek-calibration and tournament/DPO commits (`c8dca45d`,
  `a2f963f4`, `f7791ea6`, `c3900f33`, `53b6d29d`, `83e568d4`); made the tournament design/pruning decisions
  (grid choice, cutting lr 1e-5/1e-6, requesting faster parallel elimination over the greedy search).
  Sources: `git log`, `EXPERIMENTS.md`.
- **Claude (Opus 5.5, co-author on commits; also "Fable 5.5"/"Fable 5.1" acting as grading subagents)** —
  wrote `HANDOFF_03.md`, ran/co-authored the tournament and DPO code (`83e568d4`), performed the blind
  grading of RFT samples and val/tournament answers, and the final-pack blind grading (3 subagents).
  Sources: `HANDOFF_03.md` header, `83e568d4` trailer, `l40s-results/EVAL/…/README.md`.
- **Szymon Hajderek** — benchmarked the best Gemma LoRA (`v3-rft` step 51) via the benchmark harness
  (`62f7044a`, `40a7d79a`), adding it to `RESULTS.html`. Source: `git log`.
- **endote** — pushed benchmark/harness updates alongside a 40-item matura bench of
  `gemma4-rft-step51-latest16-v1` (`610ed6fa`). Source: `git log`.
- **hiderr** (mentioned in `HANDOFF_01.md` as adding ClearML tracking + "Micro100d2examGPT" benchmark) —
  not otherwise involved in this area's RFT/tournament work per the sources read. Source: `HANDOFF_01.md`
  §6.

## Open issues / limitations

- DPO (`lora-v4/dpo/`) was fully written and syntax-checked but **never run** — blocked on GPU availability
  after the tournament; no later commit or run directory shows it executing. Source: `EXPERIMENTS.md:207`,
  `HANDOFF_03.md` §3 item 3.
- The multi-host tournament driver (the version that actually ran, coordinating the L40S + A100 pod) was
  **not committed to the repo** as of `HANDOFF_03.md` — only the older single-host version is in
  `scripts/lora_v4/tournament/` (commit `83e568d4`). Source: `HANDOFF_03.md` §3 item 4.
- Tournament winner selection used **eval_loss only**, with no generative/graded evaluation during the
  bracket itself — flagged explicitly as a method gap for the next run. Source: `EXPERIMENTS.md:125-126`.
- 6 of the 15 truncated (6144-token) tournament-finalist answers stayed truncated even after a 16k-token
  rerun (2 looped past 16k). Source: `EXPERIMENTS.md:128`.
- The wiki RFT pool sampling run's stopping point is unclear from the log: "Whether the run was cut short or
  resumed elsewhere is not recorded." Source: `HANDOFF_03.md` "Wiki RFT pool sampling".
- No official CKE answer key exists for `history-synthetic-c-v4`; every number quoted for it (Claude,
  DeepSeek) is a model grade, explicitly marked as such in the sources, "not the organizers' grade."
  Source: `l40s-results/EVAL/2026-09-27_…/README.md`.
- `old_matura_exams` was asked about by the team but never resolved in this session's sources ("not found
  in any branch, the git history, the server or the HF org... got no answer yet"). Source: `HANDOFF_03.md`
  §1.5.
- Real GRPO and vLLM-based fast generation remain undecided/unimplemented. Source: `EXPERIMENTS.md:32`,
  `HANDOFF_01.md` §7.

## Good quotes or slide-worthy details

- "This is not a formal test, because per-example losses are not saved." — on the tournament's lr 1e-5/1e-6
  pruning decision. Source: `EXPERIMENTS.md:103`.
- "Like a football tournament" — the user's own description of the successive-elimination hyperparameter
  search method. Source: `EXPERIMENTS.md:76`.
- "The graders' most common reason for 0 points: the model notices the image or map is missing and answers
  with conditional variants instead of one decision." Source: `EXPERIMENTS.md:27`.
- "This is the first LoRA that doesn't lose to plain thinking mode (+2 points, within noise)." — the
  tournament finalists' verdict, closing an arc that started at v3-rft-think losing by ~6 points. Source:
  `EXPERIMENTS.md:163`.
- "~~BASELINE_IMPROVEMENT_QWEN_3.8_Q2_S_100D2EXAMHISTORY~~ Best score not baseline improvement (wrong repo
  name)" — the public HF repo's own README title, self-correcting a naming mistake. Source:
  `l40s-results/EVAL/README_BASELINE_IMPROVEMENT_public.md`.
- DeepSeek is "more lenient with the base model's answers (42 vs 35)... consistent with the earlier
  calibration where the LLM judge was ~11 points more lenient than Claude on real papers." Source:
  `l40s-results/EVAL/2026-09-27_…/README.md`.

## Sources consulted

- `l40s-results/EXPERIMENTS.md` (lines 109-276, "RFT no-thinking → v3-rft" to end)
- `HANDOFF_03.md` (all)
- `HANDOFF_01.md` (sections 2-7)
- `l40s-results/lora-v2/rft/`, `rft_think/`, `l40s-results/lora-v3/rft/`, `rft_think/`,
  `l40s-results/lora-v4/{tournament,dpo,greedy}/` (file listings + `leaderboard.json`, `run_config.json`)
- `l40s-results/build_rft_train.py` (docstring)
- `WarsawModelTrainersHackathon/scripts/rft_sample.py` (docstring)
- `WarsawModelTrainersHackathon/scripts/lora_v4/{tournament/tournament.py, dpo/build_dpo_pairs.py}`
  (docstrings)
- `l40s-results/claude-grading/eval_batches.py` (docstring), file listing (51 `rft_batch_*`, `v3t/v4t/v4f`
  batch and grade files)
- `l40s-results/publish_hf.py` (docstring)
- `l40s-results/EVAL/2026-09-27_history-synthetic-c-v4_qwen38-27b-iq2s_s175-vs-base/README.md`,
  `grades_table.md`
- `l40s-results/EVAL/README_BASELINE_IMPROVEMENT_public.md`
- `003B-hackaton/CLAUDE.md` ("LoRA experiments (26.09)", "Publishing rules and state (26.09, morning)",
  "Final pack eval + EVAL/ on HF (27.09)")
- Commits (via `git show`/`git log`, WarsawModelTrainersHackathon repo): `c8dca45d`, `f7791ea6`,
  `a2f963f4`, `c3900f33`, `53b6d29d`, `83e568d4`, `62f7044a`, `40a7d79a`, `610ed6fa`
