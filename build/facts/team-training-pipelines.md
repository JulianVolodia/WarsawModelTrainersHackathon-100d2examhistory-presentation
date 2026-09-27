# team-training-pipelines

## Summary

Beyond the L40S Gemma-4-12B LoRA line, the "100d2exam" team ran several other, largely independent training
efforts during the 25–27.09.2026 hackathon, all aimed at the Polish history matura (extended level):

1. **Qwen3.8-27B LoRA on its IQ2_S deploy quantization** (Szymon Hajderek, `training/`) — trains a bf16 LoRA
   directly against the dequantized IQ2_S GGUF weights so the adapter matches the actual deploy format; grew out
   of earlier **Qwen3.5-2B overfit-capacity LoRA grids** (same author, same package, `RUNBOOK.md`).
2. **A second post-training line, `src/posttrain/`** (mainly Pawel Cyrta): LoRA SFT+GRPO for **Bielik-11B v3** and
   **Ministral-3-8B**, plus Unsloth/NeMo-RL scaffolding, sharing data/reward code with the Gemma pipeline.
3. Inside the same package, **`history_v2`** — a from-scratch, all-valid-data, real-image Gemma-4-12B LoRA pipeline
   for one Nebius H100, authored mainly by endote, with an explicit "P0 semantic audit" gate on using historical
   grades as rewards. Its full run (`full-v2`) was launched 26/27.09 and later **paused in favour of the Qwen work**
   (`output/history-v2-paused-for-qwen-20260927/`) at optimizer step 200 of 1,389.
4. **Micro100d2examGPT** — a 123M-parameter, from-scratch Karpathy-MicroGPT-architecture model (repo
   `WMTH-100d2exam/Micro100d2examGPT`), installed and validated in a custom Ollama/llama.cpp backend on :8025/:11435
   (author `hiderr`).
5. A **v6 DPO adapter** (`WMTH-100d2exam/history-lora/v6-dpo-vision-text`, vision+text, on the shared "history-lora"
   HF repo lineage) trained on a Nebius H100 and mock-submitted against `history-2023-mock-v1` — coverage-checked
   but **never graded for correctness**.
6. **`infra/norbert/nebius/`** — endote's own scripts for provisioning a Nebius H100, running Gemma-4-12B-Q4
   batch inference/benchmarking and DeepSeek re-grading of saved answers, separate from the L40S/Runpod work.
7. **Shared ClearML tracking** (`track.py`, `CLEARML.md`), introduced by `hiderr` and made mandatory for every
   run team-wide via `AGENTS.md`.
8. **`src/lostInHistoricalTime/`** — the team's (endote's) EMNLP 2026 paper submission repo/dataset,
   "Large Language Models Pass the History Exam But Miss the «History»", folded into this repo as source+data.

Why it matters: it shows the hackathon ran several parallel model lines (not just the L40S Gemma LoRA), converging
on a common data/exclusion policy, a common ClearML tracking discipline, and an increasingly strict "don't trust a
numeric grade as a training reward without a named human review" policy (`AGENTS.md`, `SEMANTIC_REVIEW.md`).

## Timeline

- **26.09.2026 14:59 +0000** — `hiderr` commit `da2195e7`: introduces shared ClearML tracking (`track.py` +
  `CLEARML.md`), server on `81.85.1.173:18080`. *(source: `git log -1 da2195e7`)*
- **26.09.2026 15:02–15:21 +0000** — `hiderr` commits `70bfb52b`, `826894c2`, `62521b7d`, `33a07917`: hardcodes
  ClearML keys, adds `scripts/mock_training.py` smoke test, and writes the `AGENTS.md` standing rule ("every
  training/grid/eval reports to ClearML by default"). *(source: `git log`)*
- **26.09.2026 15:26 +0000** — `hiderr` commit `a064a894`: "Benchmark: Micro100d2examGPT (123M from-scratch) on
  :8025" — adds `benchmark/serve/microgpt/{model,server}.py`, `serve_micro.sh`, a `models.yaml` entry.
  *(source: `git show --stat a064a894`)*
- **26.09.2026 (no time in msg, ~00:21 +0200 per author date) — commit dated `Sat Sep 26 00:21:17 2026 +0200`** —
  `endote` commit `d2a9e3b5` "paper + codes": adds `src/lostInHistoricalTime/history-matura-llm-evaluation-39B4/`
  (later renamed under `src/lostInHistoricalTime/…` — the EMNLP submission repo, essays + LLM outputs for
  claude-3.7-sonnet, claude-sonnet-4.6, gemini-2.5/3.1-pro, gpt-4o, gpt-5.4, grok-4/4.20). Merge commit `b99807e1`
  ("Merge origin/main with paper and evaluation code") the same timestamp brings in the 2005–2016 historia PDFs
  and drops `cke_crawler.py`. *(source: `git show d2a9e3b5`, `git show b99807e1`)*
- **26.09.2026 17:20 +0200** — `endote` commit `cfe37663` "eval 2017-2026 + grading set": a single huge commit
  (5,816 files, +1,634,117/-5 lines) that lands `docs/micro100d2exam-ollama.md`, `scripts/micro100d2exam*.py`,
  `output/nebius-setup/`, and the first `infra/norbert/nebius/` scripts together with a large evaluation/data
  drop. *(source: `git show --stat cfe37663`)*
- **26.09.2026 20:32–22:24 +0000** — Pawel Cyrta commits `ed8e4fd4` ("posttrain unsloth and nemo-rl code"),
  `eb8abedc`, `05e11d36`, `0ac9f463` ("postrain bielik ministral"), `baa2a078` ("extend postrain"): builds the
  `src/posttrain/` package end to end (Bielik/Ministral SFT+GRPO, Unsloth/NeMo-RL envs).
  *(source: `git log`)*
- **26.09.2026 21:13 +0200** — `endote` commit `77b153b3` "39 evaled runs of gemma4, data science, benchmark
  building" (7,677 files, +1,707,648/-233): extends `infra/norbert/nebius/`, `output/nebius-setup/`.
  *(source: `git show --stat 77b153b3`)*
- **26.09.2026 23:52–23:56 UTC** — on the Nebius H100, `history_v2` run `full-v2`: `prepare` stage completes
  (23:52:04→23:55:08), `profile-smoke` stage completes (23:55:08→23:56:53, exit 0).
  *(source: `output/history-v2-full-2026-09-27/runs/full-v2/status.json`)*
- **26.09.2026 23:56:53 UTC onward** — `full-v2` **training** stage starts; ClearML task
  `518cde74d811454aaa481bc103c179d2`; first steps logged (1/1389 in 16.07 s, step 5 loss 3.266, grad_norm 19.17).
  *(source: `status.json`, `training.log`, `checkpoint-200/trainer_state.json`)*
- **27.09.2026 00:42 +0200** — `endote` commit `f3ba345a` "harness automatic eval and improvement" — this is
  the commit that adds the **"Current history LoRA training policy (2026-09-27)"** section to `AGENTS.md`,
  recording the user's authorization ("OKAY, now RUN !!!") to train on `source_trusted_training` data, and the P0
  semantic-audit-gate rule. *(source: `git log -S "Current history LoRA training policy" -- AGENTS.md`)*
- **27.09.2026 00:49 +0200** — `endote` commit `f51268f9` "evals..." (361 files, +13,693/-17).
- **27.09.2026 01:01 +0200** — `endote` commit `747355a8` "Merge origin/main and reconcile post-training
  pipelines" — merges the Qwen/posttrain lines together.
- **27.09.2026 01:18 +0200** — `endote` commit `eb3283bc` "benchmark _+ harness workings" (1,380 files,
  +84,670/-137): further `src/posttrain/history_v2/` work.
- **27.09.2026 03:16 +0200** — `endote` commit `87283d60` "commit eb3283bc fix" (6,110 files, +4,126,474/-88):
  lands `output/history-v2-full-2026-09-27/`, `output/history-v2-h100-smoke-2026-09-27/`,
  `output/history-v2-paused-for-qwen-20260927/`, `output/v6-dpo-vision-text-mock-h100-v1/`, and the three
  `docs/history-v2-*-2026-09-27.md` reports. *(source: `git show --stat 87283d60`)*
- **27.09.2026 04:55–04:59 +0000** — Szymon Hajderek commits `6cb40608` ("training/: reproducible Qwen3.8-27B
  LoRA pipeline on the IQ2_S deploy quantization") and `7737f119` (`REPRODUCE_FOR_CLAUDE.md`).
  *(source: `git log`)*
- **27.09.2026 06:18–06:20 +0000** — `szymon-hajderek` commits `f75ee9ae` / `da4611f1`: adds
  `COMMUNICATION.md` §3, the LoRA bench-queue contract (host `89.169.123.44:38471`) that the Qwen pipeline's
  "bench, don't run your own llama-server" rule in `AGENTS.md` points at.
- **27.09.2026 06:33 +0200** — `endote` commit `6b6dab53` " rag" (3,088 files, +2,264,864/-81): lands
  `output/v6-dpo-vision-text-mock-h100-v4/` (the final graded-for-coverage v6-dpo mock submission) plus RAG
  service additions. *(source: `git show --stat 6b6dab53`)*
- **Some point before the pause** — `history_v2` `full-v2` training reaches **global_step 200 / max_steps 1389**
  (epoch 0.144), loss down to 0.574 from an initial 3.266, but with a **grad_norm spike to 412.6** exactly at
  step 200 (the checkpoint step). Backed up locally to a Mac at
  `/Users/norbert.jaworski/Documents/small/hackathons/WarsawModelTrainersHackathon/output/history-v2-paused-for-qwen-20260927/checkpoint-200`
  with all 7 checkpoint files hash-verified. *(source: `checkpoint-200/trainer_state.json`, `backup-validation.json`)*
- **23:23–24:01 (27.09.2026, +0000, per author dates)** — Szymon Hajderek bench commits `43da6220` ("Qwen3.5-2B
  overfit LoRA r8 ckpt-225 on the last 10 years") and `e4f775ff` ("Qwen3.5-2B vLLM baseline vs overfit-v1 LoRA r8
  lr1e-4 s570") — reproduce the `RUNBOOK.md` baseline table. *(source: `git show -s`)*
- **27.09.2026 09:42–09:58 +0000** — Pawel Cyrta commits `16af30c9`, `1395dd31` (merge, "adopt the reconciled
  posttrain layout"), `7b501fdd`, `606ee08a`: further posttrain updates across two machines ("machine 1",
  "machine 2"). *(source: `git log`)*
- **27.09.2026 10:01 +0000 (HEAD)** — Pawel Cyrta merge commit `6d8d52d7` "Merge branch 'main' …" — current tip
  of `main` at the time of this fact sheet. *(source: `git log -1`)*
- Branch `origin/qwen-lora`, tip `cf6d27f5` (`hiderr`, 26.09 20:58 +0000): "qwen_lora: pinned fetch of WMTH
  *-2201 datasets" — a side branch, not (yet, as of this reading) merged into `main`. *(source: `git branch -a`,
  `git show -s cf6d27f5`)*

## Key numbers

| label | value | source |
|---|---|---|
| Qwen3.8-27B LoRA rank / alpha | 32 / 64 | `training/README.md` |
| Qwen3.8-27B LoRA target modules | full attn (q/k/v/o) + MLP (gate/up/down), 64 layers; Gated-DeltaNet excluded | `training/README.md` |
| Qwen3.8-27B micro-batch × accumulation | 4 × 8 = 32 | `training/README.md` |
| Qwen3.8-27B learning rate | 1e-4, AdamW, cosine to 10% after 5% warmup | `training/README.md` |
| Qwen3.8-27B training corpus (`all-holdout21`) | ~24k items/epoch (28 real packs ×2 upsample, 20k epodręczniki, 616 CNT, 748 relabeled synthetic images, 500 synthetic essays) | `training/README.md` |
| Qwen3.8-27B held-out set | all 2023, 2020, 2021 packs = 12 packs, 630 pts | `training/README.md` |
| Qwen3.8-27B schedule | 1,577 optimizer steps, ~16–18h on one H100; expected step-0 eval loss ≈1.45 (2023) / 1.60 (2021); step-0 bench ≈55% on 2023 maj | `training/README.md`, `training/REPRODUCE_FOR_CLAUDE.md` |
| Qwen3.8-27B GGUF↔HF mapping check | 851 tensors, max |diff| ≈ 6e-8 | `training/README.md` |
| Qwen3.5-2B baseline (Ollama q8_0, deploy target) | 60/300 = 20.0% (latest-5 papers, matura harness+images, deepseek-flash-high) | `training/RUNBOOK.md` |
| Qwen3.5-2B vLLM bf16 greedy | 45/300 = 15.0% (25 answers hit 4096-token cap) | `training/RUNBOOK.md` |
| Qwen3.5-2B vLLM bf16 + presence_penalty 1.5 | 54/300 = 18.0%, 3 cut off | `training/RUNBOOK.md` |
| Qwen3.5-2B grid | rank ∈{8,16,32,64}, lr ∈{1e-4,3e-5,1e-5,1e-6}, 10 epochs, batch 24 (length-grouped) | `training/RUNBOOK.md` |
| Bielik/Ministral SFT data | `sft_train` 7.9k rows, `sft_val` 315, `grpo_closed` 4.0k, `grpo_open` 1.6k, `eval_val` 682 | `src/posttrain/README.md` |
| Bielik/Ministral GRPO | TRL GRPOTrainer, DAPO loss, β=0, G=8, 8 prompts/step, ~14s/step (Bielik) | `src/posttrain/README.md` |
| history_v2 default LoRA hyperparams | rank 16, alpha 32, LR 5e-5, 1 epoch, microbatch 1, accumulation 16, 8,192-token ceiling | `src/posttrain/history_v2/README.md`, `output/history-v2-full-2026-09-27/runs/full-v2/training/run.json` |
| history_v2 candidate corpus (`candidates-v2`) | 25,799 candidates (19,835 epodręczniki, 3,611 rephrased, 1,261 real 2017-2026, 608 real 2005-2016, 448 CNT, 36 evaluation-package) from 30,327 input records; 3,092 quarantined, 1,436 duplicates consolidated | `docs/history-v2-pipeline-audit-2026-09-27.md` |
| history_v2 `full-v2` training set | 22,212 examples (1,847 with images), all weight 1; 3,424 no-answer + 163 >8192-token retained in quarantine | `docs/history-v2-full-run-2026-09-27.md` |
| history_v2 `full-v2` schedule | 1,389 optimizer steps scheduled, ~4h early estimate | `docs/history-v2-full-run-2026-09-27.md` |
| history_v2 `full-v2` pause point | global_step 200/1389 (14.4% of the 1 epoch), loss 3.266→0.574, grad_norm spike 412.6 at step 200 | `checkpoint-200/trainer_state.json` |
| history_v2 profile-smoke (accum-16) check | loss 1.6115, 54.18 GiB peak VRAM, longest input 8,165 tokens | `docs/history-v2-full-run-2026-09-27.md` |
| history_v2 H100 technical smoke (26.09) | 10 examples, 10 optimizer steps, mean loss 2.5652, 65,568,768 trainable params (0.5453%), peak VRAM 32.08 GiB, 656/656 adapter tensors changed | `output/history-v2-h100-smoke-2026-09-27/summary.json` |
| history_v2 feedback audit (full40, 1,400 rows) | 489 resolved below-full-credit, 755 full-credit-to-review, 19 unresolved, 137 no usable DeepSeek evidence (321/489 have images) | `docs/history-v2-pipeline-audit-2026-09-27.md` |
| Micro100d2examGPT size | 123,076,608 float32 params; 12 layers, width 768, 12 heads, 24,576-token vocab, 512-token context | `docs/micro100d2exam-ollama.md` |
| Micro100d2examGPT validation | PyTorch-vs-original max logit error 4.44e-16 (2-layer); cached-vs-uncached max 9.73e-5; native GGUF top-10 logprob max diff 5.42e-5 | `docs/micro100d2exam-ollama.md` |
| v6-dpo-vision-text DPO run | init from `runs/v5-all-r16/step-130`; 88 pairs, 0 dropped; β=0.1, lr=5e-6, 2 epochs, accum 8, max_len 6144; loss 0.693→~0.22, accuracy→1.0 by step ~20 | `output/v6-dpo-vision-text-mock-h100-v1/adapter/dpo_train_log.json` |
| v6-dpo mock submission (`history-2023-mock-v1`, v4) | 37/37 answered, 0 retries/failed/pending; 99,397+108,929=208,326 tokens; 1,720.1 s (28.67 min) generation; adapter file 262,373,216 bytes | `output/v6-dpo-vision-text-mock-h100-v4/README.md` |
| Nebius H100 (`warsaw-h100-benchmarks`) cost | $3.90/running hour incl. disk (console estimate); $121 initial credit, $120 spending ceiling | `infra/norbert/nebius/README.md`, `output/nebius-setup/instance.json` |
| Norbert's H100 Gemma batch (`gemma4-h100-p4-v1`) | 4 exam workers, 1 Ollama server, 4 slots × 32,768 ctx; digest `f6dc48d5…ab49b` matches local baseline | `infra/norbert/nebius/README.md` |
| RFT step-51 H100 eval | 16 official extended papers 2023–2026 (both formulas), 573 questions (406 w/ images), 880 pts; 8 exams completed (290 Q, 440 pts) before VM stopped on a CUDA failure | `infra/norbert/nebius/RFT_RUN.md` |
| DeepSeek re-grading baseline cohort | 36 fully completed exams, 1,263 answers, 1,900 points (4 exams excluded for failed inference items) | `infra/norbert/nebius/DEEPSEEK_REGRADING.md` |

## Components

- `training/README.md`, `training/REPRODUCE_FOR_CLAUDE.md`, `training/RUNBOOK.md` — docs for the Qwen3.8-27B and
  Qwen3.5-2B LoRA lines (setup, reproduction, ablation plan, grid runbook).
- `training/setup_env.sh`, `training/requirements-train.lock.txt` — frozen `.venv-train` (torch 2.13 cu130,
  transformers 5.17, peft 0.21) + a CUDA llama.cpp build (`@9588757`).
- `training/fetch.sh` — downloads datasets, relabels synthetic images, fetches the compact IQ2_S base; `VERIFY=1`
  checks the GGUF↔HF mapping.
- `training/launch_qwen38_lora.sh` — detached (`setsid nohup`) launch/resume of the Qwen3.8-27B run; writes
  `PIDS`, `RUN.md`, `train.log`, `status.json`.
- `training/qwen35_lora/gguf_base.py` — GGUF→HF mapping, `QuantLinear` (bf16 LoRA over int8-codes×fp16-scale base).
- `training/qwen35_lora/train.py` — the shared training loop (bf16 / NF4 QLoRA / GGUF base), used by both the 2B
  and 27B lines.
- `training/qwen35_lora/data.py` — dataset adapters that render prompts identical to the bench harness
  (`python -m training.qwen35_lora.data check`).
- `training/qwen35_lora/bench_hook.py` — per-checkpoint bench (vLLM for 2B, llama-server+GGUF adapter for 27B).
- `training/qwen35_lora/grid.py` — sequential, resumable grid driver with `--status`.
- `training/relabel_synimg.py` — leak-free relabel of the synthetic-image dataset.
- `training/serve_vllm_lora.sh` — vLLM server used for in-training bench of the 2B line.
- `src/posttrain/README.md` — top-level doc for both the Gemma-4 text-only legacy pipeline and the newer
  Bielik/Ministral line.
- `src/posttrain/models.py`, `common.py` — shared paths, held-out/validation rules, exam prompt.
- `src/posttrain/deepseek_reward.py` / `reward.py` — the DeepSeek-only reward scorer (visual questions refused by
  the legacy text scorer).
- `src/posttrain/distill.py`, `sft.py`, `grpo.py`, `unsloth_sft.py`, `unsloth_grpo.py` — SFT/GRPO trainers for the
  various models.
- `src/posttrain/eval.py`, `eval_models.py` — evaluation entry points (closed-item EM + DeepSeek-judge points).
- `src/posttrain/build_data.py`, `build_model_data.py`, `build_essays.py` — dataset builders.
- `src/posttrain/schedule.py` — the overnight two-lane (Bielik/Ministral) scheduler with a GPU lock.
- `src/posttrain/nemo/` — NeMo-RL `HistoryExamEnvironment` (Ray actor), processor, prep script, DTensor LoRA config.
- `src/posttrain/history_v2/README.md` — operating doc for the all-data, image-aware Gemma-4 pipeline.
- `src/posttrain/history_v2/data.py` — fetch/build/release of the training corpus; enforces `DEPRECATED` source
  exclusions.
- `src/posttrain/history_v2/trusted_data.py` — encodes `source_trusted_training` examples for the authorized full
  run; writes `quarantine.jsonl` for anything that fails checks (never silently truncates).
- `src/posttrain/history_v2/train.py` — preflight / smoke / train / export CLI; `MultimodalCollator`,
  `processor_for`.
- `src/posttrain/history_v2/full_run.py` — the end-to-end pipeline driver (prepare → profile-smoke → train →
  export → runtime acceptance), used for `full-v2`.
- `src/posttrain/history_v2/feedback.py` — reads `output/feedback/`, cross-checks DeepSeek invocation/hashes,
  builds a correction-writing queue.
- `src/posttrain/history_v2/semantics.py`, `semantic_audit.py`, `SEMANTIC_REVIEW.md` — the "P0" human-adjudication
  gate before any historical grade can become a training reward or correction weight.
- `src/posttrain/history_v2/serve.py`, `runtime_smoke.py` — llama.cpp GGUF serving + scale-0/1 acceptance test
  (fixed batch/ubatch=4096, image tokens=560 after the two-image assertion failure).
- `src/posttrain/history_v2/config.json` — pinned model/source revisions for the `history-v2-all-data` version.
- `scripts/micro100d2exam.py` — independent PyTorch reference/completion runner for Micro100d2examGPT.
- `scripts/convert_micro100d2exam.py` — checkpoint/tokenizer → GGUF conversion (lossless F32).
- `scripts/prepare_microgpt_backend.py` — builds a custom llama.cpp backend (`microgpt` architecture; disables
  cache-shift, since positions are learned/absolute).
- `scripts/validate_micro100d2exam.py`, `validate_microgpt_backend.py`, `validate_microgpt_ollama.py` — the
  scalar/native/Ollama-API validation chain.
- `scripts/micro100d2exam-ollama.sh`, `docs/micro100d2exam-ollama.md` — launcher + install/validation report.
- `infra/norbert/nebius/README.md`, `RFT_RUN.md`, `DEEPSEEK_REGRADING.md` — endote's Nebius H100 provisioning,
  RFT step-51 evaluation and DeepSeek re-grading docs.
- `infra/norbert/nebius/setup.sh`, `setup_history_v2.sh`, `prepare_workspace.py` — environment/workspace setup on
  the Nebius VM.
- `infra/norbert/nebius/rft_benchmark.py`, `download_rft.py`, `grade_completed_deepseek.py`,
  `analyze_deepseek_archive.py`, `retry_deepseek_grade.py` — the RFT-step51 inference + DeepSeek-grading pipeline.
- `infra/norbert/nebius/gemma_smoke.py`, `smoke.py`, `capture_runtime.py`, `backup_gemma4.py`,
  `sync-gemma4-results.sh` — smoke tests, runtime capture and result sync for the Gemma batch runs.
- `CLEARML.md`, `track.py` — shared ClearML client/guide used by every line of work in this fact sheet.
- `tests/test_history_v2.py` — offline tests for `data.py` (build/release/digest/DEPRECATED checks) against a
  fake DeepSeek client.
- `tests/test_history_v2_processor.py` — opt-in integration test with the real pinned Gemma4Unified processor and
  a tiny random model (pixels, masking, LoRA backward); gated on `HISTORY_PROCESSOR_TEST=1`.
- `tests/test_nebius_rft.py` — tests the RFT-step51 exam-selection logic (excludes mock/basic-level papers) by
  loading `infra/norbert/nebius/rft_benchmark.py` directly from its path.
- `tests/test_posttrain_merge.py` — CPU-only `--help` smoke tests for every posttrain entry point.
- `src/lostInHistoricalTime/history-matura-llm-evaluation-39B4/` — the EMNLP 2026 paper repo: essays, per-model
  LLM outputs (claude-3.7-sonnet, claude-sonnet-4.6, gemini-2.5-pro/3.1-pro, gpt-4o, gpt-5.4, grok-4/4.20), CSV
  indexes.
- `output/v6-dpo-vision-text-mock-h100-{v1..v4}/` — four iterations of a mock-submission run against the DPO
  adapter (v1 superseded for low throughput, v2 superseded for a dedicated-H100 config change, v3 hit the
  16,384-token thinking cap on Q3 and was stopped, v4 is the complete, coverage-checked submission).

## Decisions, incidents and lessons

- **P0 semantic-audit gate** (`SEMANTIC_REVIEW.md`, `AGENTS.md`): a passing transport/schema check (quotes, image
  hashes, arithmetic) does **not** establish that a DeepSeek grade is historically correct. Triggered by the
  **May 2026 Q24 case**: two DeepSeek re-runs scored 3/3 for an answer describing "a pouring action instead of
  extinguishing a candle with a helmet"; that item is explicitly quarantined pending human adjudication. As of
  this reading, **zero** accepted human reviews exist in `results/history-v2/semantic-reviews/accepted.jsonl`; all
  38 sample drafts + 3 Q24 cases are pending. *(source: `SEMANTIC_REVIEW.md`, `AGENTS.md` "P0 semantic audit gate")*
- **Deprecated training sources (2026-09-27, explicit user decision, in `AGENTS.md`)**: `history-lora-data-2201`
  excluded because a stored thinking response for one item "reasons about a missing map"; both
  `data_synthetic_image` copies excluded because one example ("syn-img-starozytnosc-01") "leaks identifying image
  information through the attribution"; `data_synthetic_extended-2201` excluded because its
  `generated/*/essay_*.jsonl` puts examiner guidance into `key_answer` fields, which must never become assistant
  targets.
- **Holdout policy reversal**: the user "explicitly removed holdout restrictions for the new training corpus:
  all valid source splits may train," with trained-exam scores now called "diagnostic progress, not held-out
  generalization estimates" (`AGENTS.md`), a departure from the Qwen3.8-27B line's own held-out 12-pack design
  (`training/README.md`).
- **llama.cpp non-causal-attention assertion on multi-image input**: the first `history_v2` GGUF runtime run
  aborted on a two-image question ("`non-causal attention requires n_ubatch >= n_tokens`"); fixed by setting
  batch/ubatch to 4096 and the image token budget to 560 in both `serve.py` and `runtime_smoke.py` — the same class
  of bug independently hit and fixed on the L40S/Mac side per the parent `CLAUDE.md` ("Images on llama.cpp").
- **`full-v1` superseded by `full-v2`**: a per-example vocabulary-copy bottleneck in data preparation was measured
  and replaced by a direct token lookup; `full-v1`'s ClearML task was marked stopped, its evidence retained.
  *(source: `docs/history-v2-full-run-2026-09-27.md`)*
- **RFT step-51 H100 eval stopped on a CUDA failure** (26.09.2026): the Nebius VM was stopped after the failure;
  only 8/16 exams had completed; the "Astra" grading watcher for that run is disabled and its numeric grades are
  described as "historical inference run, not authorization to restart it or use Astra grades."
  *(source: `infra/norbert/nebius/RFT_RUN.md`)*
- **Grading provenance change**: the older feedback archive (1,400 rows) was graded entirely by `gpt-6-astra`;
  the team's current policy is that only `deepseek-flash-high@think` grades are usable, so all Astra grades are
  "diagnostic hints" only pending DeepSeek re-grading. *(source: `docs/history-v2-pipeline-audit-2026-09-27.md`)*
- **v6-dpo mock submission produced no correctness signal**: three successive versions (v1–v3) were technical
  false starts (throughput, GPU dedication, a 16k-token thinking-mode runaway on question 3); v4 completed
  cleanly but explicitly states "No correctness grade was produced… this mock is not a held-out generalization
  estimate" since the model card says training included CKE papers outside its stated validation sessions.
  *(source: `output/v6-dpo-vision-text-mock-h100-v4/README.md`)*
- **Qwen3.8-27B LoRA deliberately trains on the quantized (IQ2_S) weights**, not the bf16 original, "so the
  adapter learns against the quantized weights' errors" — a design choice specific to shipping a small model at
  very low precision. *(source: `training/README.md`)*

## People

- **Szymon Hajderek** (commits as `Szymon Hajderek` / `szymon-hajderek`) — built `training/` end to end: the
  Qwen3.8-27B IQ2_S LoRA pipeline (`6cb40608`, `7737f119`) and, earlier, the Qwen3.5-2B overfit-grid benches
  (`43da6220`, `e4f775ff`), plus the LoRA bench-queue contract in `COMMUNICATION.md` §3 (`f75ee9ae`, `da4611f1`).
- **Pawel Cyrta** — built `src/posttrain/`: the original Unsloth/NeMo-RL code (`ed8e4fd4`), the Bielik/Ministral
  SFT+GRPO line (`eb8abedc`, `05e11d36`, `0ac9f463`, `baa2a078`), and later "machine 1"/"machine 2" updates
  (`16af30c9`, `7b501fdd`, `606ee08a`) plus the final merge to HEAD (`6d8d52d7`).
- **endote** — added the EMNLP paper repo (`d2a9e3b5`, `b99807e1`), the large 26.09 evaluation/data drop
  (`cfe37663`, `77b153b3`), the `history_v2` pipeline and its docs (`f3ba345a`, `f51268f9`, `eb3283bc`,
  `87283d60`, `6b6dab53` — including the `AGENTS.md` training-policy section and the P0 semantic-audit rule), and
  `infra/norbert/nebius/` (local file paths under these commits point at `/Users/norbert.jaworski/…`, i.e. this is
  the "norbert" of `infra/norbert`).
- **hiderr** — introduced shared ClearML tracking (`da2195e7` and follow-ups) and the Micro100d2examGPT benchmark
  serving code (`a064a894`); also the `qwen-lora` side branch's pinned-dataset-fetch commit (`cf6d27f5`).
- Git author identities in this area do not include personal email addresses per the sourcing rule for this
  fact sheet; commit hashes above are the citable identifiers.

## Open issues / limitations

- `history_v2` `full-v2` full training run was **paused, not completed** (step 200/1,389, ~14% of one epoch) —
  no final adapter, no export, no evaluation exists for it as of the sources read. Directory name
  (`history-v2-paused-for-qwen-20260927`) is the source's own label for the reason; no separate document in scope
  explains the handoff mechanics.
- A **grad_norm spike to 412.6** appears exactly at the last logged/checkpointed step (200) before the pause;
  nothing in the read sources analyzes or explains this spike.
- `history_v2`'s own docs repeatedly stress that **no held-out performance claim is made**, that trained-exam
  scores are "diagnostic progress" only, and that the semantic-audit ledger is currently **empty** (zero accepted
  human reviews) — so none of its historical DeepSeek/Astra grades are usable as rewards yet.
- The Qwen3.8-27B `REPRODUCE_FOR_CLAUDE.md` ablation sweeps (`ablation-lr`, `ablation-rank`, `ablation-batch`,
  `ablation-upsample`, `ablation-tail`, `ablation-epochs`) are a **plan**, not (from files read here) confirmed
  results — no run-result table for these sweeps was found in the paths covered by this fact sheet.
- `training/RUNBOOK.md`'s `synth-v1` grid ("does synthetic data transfer to the real bench?") is explicitly
  marked **not started**.
- The `qwen-lora` branch (`cf6d27f5`) had, at the point read, not been merged to `main` — its relationship to the
  `training/` work that did land on `main` (same author, `hiderr`) is not fully clear from history alone.
- Four DeepSeek grading invocations are missing from the feedback archive (May 2022, June 2023, June 2023 old
  formula, May 2023) — not investigated further in the sources read.
- v6-dpo's `dpo_train_log.json` (88 preference pairs) gives no information on how those pairs were generated or
  reviewed; not covered by files in scope.

## Good quotes or slide-worthy details

- "The LoRA trains directly on the IQ2_S GGUF it is deployed as… **the adapter learns against the quantized
  weights' errors, not the bf16 original**." — `training/README.md`
- "`VERIFY=1 fetch.sh` proves the mapping bit-exact (**851 tensors, max diff 6e-8**)." — `training/README.md`
- "May 2026 Q24 demonstrates this: two newer DeepSeek runs award 3/3 despite describing **a pouring action
  instead of extinguishing a candle with a helmet**." — `src/posttrain/history_v2/SEMANTIC_REVIEW.md`
- "The user explicitly authorized full training using trusted dataset answers." (following "OKAY, now RUN !!!")
  — `docs/history-v2-full-run-2026-09-27.md`, `AGENTS.md`
- "Concrete error patterns include confusing Pompeii/Herculaneum discoveries with Napoleon's Egyptian expedition,
  recognizing the Parthenon instead of the Erechtheion from architectural features, and repeating descriptive
  phrases instead of the requested rulers' historical epithets." — `docs/history-v2-pipeline-audit-2026-09-27.md`
- Micro100d2examGPT's context handling: "cache shifting is disabled because learned absolute positions cannot be
  shifted faithfully without recomputation." — `docs/micro100d2exam-ollama.md`
- "This is a serving smoke test, not an exam quality benchmark." — recurring caveat across
  `infra/norbert/nebius/README.md` and the `history_v2` docs — a team-wide discipline of separating "it runs" from
  "it's good."
- 25,799 curated candidates funnelled down to 22,212 trainable examples for one epoch on one H100 — a concrete
  number for "how big is a from-scratch matura corpus."

## Sources consulted

- `training/README.md`, `training/RUNBOOK.md`, `training/REPRODUCE_FOR_CLAUDE.md`
- `AGENTS.md` (root), `CLEARML.md`, `track.py` (header/purpose only)
- `src/posttrain/README.md`, `src/posttrain/history_v2/README.md`, `src/posttrain/history_v2/SEMANTIC_REVIEW.md`
- `src/lostInHistoricalTime/history-matura-llm-evaluation-39B4/README.md`
- `docs/history-v2-full-run-2026-09-27.md`, `docs/history-v2-h100-smoke-2026-09-27.md`,
  `docs/history-v2-pipeline-audit-2026-09-27.md`, `docs/micro100d2exam-ollama.md`
- `infra/norbert/nebius/README.md`, `RFT_RUN.md`, `DEEPSEEK_REGRADING.md`
- `output/history-v2-full-2026-09-27/runs/full-v2/status.json`, `.../training/run.json`, `.../training.log`
- `output/history-v2-h100-smoke-2026-09-27/summary.json`
- `output/history-v2-paused-for-qwen-20260927/checkpoint-200/trainer_state.json`, `backup-validation.json`
- `output/nebius-setup/instance.json`, `cuda-check.json`
- `output/v6-dpo-vision-text-mock-h100-v1/adapter/dpo_train_log.json`
- `output/v6-dpo-vision-text-mock-h100-v4/README.md`, `adapter-provenance.json`, `answer-completeness-review.json`
- `tests/test_history_v2.py`, `tests/test_history_v2_processor.py`, `tests/test_nebius_rft.py`,
  `tests/test_posttrain_merge.py` (headers only)
- `COMMUNICATION.md` (head)
- Commits (via `git show`/`git log`): `d2a9e3b5`, `b99807e1`, `cfe37663`, `77b153b3`, `f3ba345a`, `f51268f9`,
  `747355a8`, `eb3283bc`, `87283d60`, `6b6dab53`, `6cb40608`, `7737f119`, `f75ee9ae`, `da4611f1`, `43da6220`,
  `e4f775ff`, `16af30c9`, `1395dd31`, `7b501fdd`, `606ee08a`, `6d8d52d7`, `ed8e4fd4`, `eb8abedc`, `05e11d36`,
  `0ac9f463`, `baa2a078`, `da2195e7`, `70bfb52b`, `826894c2`, `62521b7d`, `33a07917`, `a064a894`, `cf6d27f5`
  (branch `origin/qwen-lora`)
- `git ls-files`/`git shortlog -sn` on `training/`, `src/posttrain/`, `src/lostInHistoricalTime/`,
  `infra/norbert/`, and the `history-v2`/`v6-dpo` output+docs paths
