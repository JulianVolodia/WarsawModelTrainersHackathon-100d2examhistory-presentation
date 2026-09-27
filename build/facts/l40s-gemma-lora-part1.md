# Gemma 4 12B QLoRA on the L40S — Part 1: setup, data, first runs, evaluation method, publishing

## Summary

This is the Warsaw Model Trainers Hackathon team's (git handle used throughout: JulianVolodia) work to QLoRA
fine-tune Google's Gemma 4 12B QAT model so it scores more points on the Polish history matura (extended level),
then ship the result as a GGUF LoRA adapter usable with the official quantized model in llama.cpp. Work ran on a
rented AWS L40S GPU (`ssh l40s`), 25–26.09.2026, all under `/scratch`. The chosen approach: train QLoRA (NF4,
bitsandbytes) on the *unquantized* bf16 QAT checkpoint (`google/gemma-4-12B-it-qat-q4_0-unquantized`), because QAT
weights are trained to survive Q4_0 quantization, so a LoRA trained on them should transfer better to the shipped
Q4_0 GGUF than one trained on the plain (non-QAT) model. Training data (v1: 611/76, then v2/v2.1: 608 train/111
val/291 test) was built by pairing the team's already-extracted exam questions (`output/questions.jsonl`) with
answers parsed out of the CKE answer-key PDFs. The first real training run (`v1`, r=32 LoRA) finished in 14.3
minutes with eval loss 1.257. A second round (v2-A/v2-B) found that fine-tuning on the literal key answers changes
answer *style* (short, key-formatted) but not the number of points scored — it did not beat the untuned base model.
A critical evaluation-method finding was that `llama-server --jinja` silently turns on Gemma 4's "thinking" mode by
default, which initially truncated most answers; and that using the model's own family as an LLM judge is ~11
points too lenient versus blind grading by Claude subagents acting as CKE examiners, which became the reference
grader. This led the team toward RFT (rejection-sampling fine-tuning on the model's own graded answers) as the next
direction (covered by a later part of this fact sheet / other work). The adapter was published privately to Hugging
Face (`WMTH-100d2exam/history-lora`). Everything is backed up locally in `l40s-results/` outside the team repo.

## Timeline

- **25.09.2026, exact time not given**: L40S server rented and set up — SSH access, Python packages, repo copied as
  zip, base models downloaded. Source: `SETUP.md` (root steps 1–5); `WarsawModelTrainersHackathon/SETUP_ON_L40S.md`
  §§1–4.
- **25.09.2026**: `include-system-site-packages` isolation fix applied to `/scratch/.venv` (conda's torchaudio 2.9.1
  broke `import trl`); `uv pip check` afterwards found only an `fsspec` version conflict, fixed by re-pinning to
  2026.6.0. Source: `SETUP_ON_L40S.md` §2 "Isolate the venv from conda".
- **25.09.2026, 22:17–22:36 UTC**: llama.cpp built from source with CUDA (commit `4b1a27f`), 19 minutes on 4 vCPUs
  (official prebuilt binaries fail on this server's glibc 2.35). Source: `SETUP_ON_L40S.md` §5 "llama.cpp with
  CUDA".
- **25.09.2026, 22:31–22:52 UTC**: first real QLoRA run (`/scratch/lora-run`, later published as HF version `v1`) —
  14.3 min, `EXIT 0`. Source: `SETUP_ON_L40S.md` §7; `l40s-results/lora-run/run/{metrics,run_config}.json`.
- **25/26.09.2026, ~22:35–00:10 UTC**: SSH to the server reset every connection ("kex_exchange_identification:
  Connection reset by peer") for ~1.5 h, likely hitting the custom sshd's `MaxStartups` limit from frequent
  monitoring connections; it recovered on its own. Source: `SETUP_ON_L40S.md` §9 "Incidents".
- **26.09.2026 (commit time 00:07:42 +0200)**: `SETUP.md`/`SETUP_ON_L40S.md` first committed (commit `25fd3908`,
  "Add L40S server setup guide", author JulianVolodia, co-authored Claude Opus 5.5).
- **26.09.2026 (commit time 02:45:23–02:46:06 +0200)**: `SETUP_ON_L40S.md` extended (commit `fc335048`) and
  `scripts/build_sft_data.py` + `scripts/lora_pipeline_simple.py` added (commit `4140277b`, "Add SFT data builder
  and QLoRA -> GGUF adapter pipeline"), both author JulianVolodia / co-author Claude Opus 5.5.
- **26.09.2026**: HF upload of `v1` completed — private repo `WMTH-100d2exam/history-lora`, commit `626d3cb`,
  uploaded by HF user `julianvolodia`. Source: `SETUP_ON_L40S.md` §8; `l40s-results/README.md` "Open items".
- **26.09.2026 (commit time 02:58:27 +0200)**: data-leakage and text-noise fixes to `build_sft_data.py` (v2), plus
  `guideline_data_fix.md` added (commit `cbc30dca`, "Fix SFT data leakage and text noise; add data-fix guideline").
  On branch `data/sft-fix-guideline` per `HANDOFF_REVIEW_FABLE.md` (also written 26.09.2026, "by Claude Opus 5.5, at
  the request of the user JulianVolodia").
- **26.09.2026**: v2-A-nf4 and v2-B-bf16 LoRA runs (11 min / 16 min) trained and evaluated on val v2 (111
  tasks/128 pts) via the Q4_0 GGUF; result: neither beats the untuned base. Source: `lora_experiments.md`
  "Results on val".
- **26.09.2026, discovered during first evaluation**: `llama-server --jinja` found to enable Gemma 4 thinking mode
  by default, truncating 82/111 base answers and ~40 LoRA answers in the first eval pass. Source:
  `lora_experiments.md` "⚠️ Thinking mode in llama-server".
- **26.09.2026 (commit time 06:45:27–06:46:18 +0200)**: test split (291 tasks) added, key-parsing fixes, `eval_gguf.py`
  and `rft_sample.py` added (commit `c0c484e1`, "Add test split, fix key parsing, add eval/RFT scripts and
  results"); branch merged to main (commit `64ad1a31`, "Merge branch 'data/sft-fix-guideline'").
- **26.09.2026**: blind grading of 499 answers by 12 Claude subagents acting as CKE examiners, establishing Gemma
  is ~11 points too lenient as a self-grader. Source: `lora_experiments.md` "Blind grading by Claude subagents".
- **26.09.2026**: incident — the thinking-mode RFT sampler's `llama-server` was killed by the host after RAM use
  (two samplers + a teammate's server) exceeded 30 GB; fixed with `--cache-ram 2048` and incremental sample
  writing. Source: `l40s-results/EXPERIMENTS.md` "Incident: the thinking-mode sampler was killed (host RAM)";
  `SETUP_ON_L40S.md` §11.

## Key numbers

| Label | Value | Source |
|---|---|---|
| GPU | 1× NVIDIA L40S, 46068 MiB VRAM, driver 595.91.07, CUDA 13.2 (nvidia-smi) | `l40s-results/env/system.txt` |
| Server CPU/RAM | 4 vCPU, 30 GB RAM, Ubuntu 22.04.5 LTS, kernel 6.12.103 | `l40s-results/env/system.txt` |
| `/scratch` disk | separate 229 GB NVMe | `SETUP.md` line 5 |
| Base model (unquantized) size | 23,919,549,408 bytes (model.safetensors), ~24 GB bf16 | `l40s-results/env/models.txt` |
| Q4_0 GGUF size | 6,975,879,296 bytes (~7.0 GB) + mmproj 175,115,616 bytes | `l40s-results/env/models.txt` |
| Q4_0 GGUF sha256 | `93567e57a8fe10b23569b9d9ec38cd005deedf71e29477c421a4b83f418a538b` | `l40s-results/env/models.txt`; `SETUP_ON_L40S.md` §9 |
| torch | 2.14.0+cu130 | `SETUP_ON_L40S.md` §2; `l40s-results/README.md` |
| transformers | 5.17.0 | `SETUP_ON_L40S.md` §2 |
| peft | 0.21.0 | `SETUP_ON_L40S.md` §2 |
| trl | 1.14.0 | `SETUP_ON_L40S.md` §2 |
| accelerate | 1.15.0 | `SETUP_ON_L40S.md` §2 |
| torchao | 0.18.0 | `SETUP_ON_L40S.md` §2 |
| huggingface_hub | 1.33.0 | `SETUP_ON_L40S.md` §2 |
| bitsandbytes | 0.50.2 | `SETUP_ON_L40S.md` §2; `l40s-results/README.md` |
| datasets | 5.0.1 | `SETUP_ON_L40S.md` §9 |
| fsspec (pinned) | 2026.6.0 | `SETUP_ON_L40S.md` §2, §9 |
| flash-attn | 2.8.3+cu130torch2.14 (community wheel, mjun0812) | `SETUP_ON_L40S.md` §2 |
| flash-attn bf16 vs SDPA max diff | 0.0078 | `SETUP.md` line 67; `SETUP_ON_L40S.md` §2 |
| llama.cpp commit (build) | `4b1a27f` (25.09.2026) | `SETUP_ON_L40S.md` §5, §9 |
| llama.cpp build time | 19 min, 4 vCPUs, 22:17–22:36 UTC 25.09 | `SETUP_ON_L40S.md` §5 |
| SFT data v1 | train 611 (20 exams) / eval 76 | `l40s-results/sft/report.json`; `SETUP_ON_L40S.md` §6 |
| SFT data v1, "answer not found" skipped | 128 tasks | `l40s-results/sft/report.json` |
| SFT data v1, benchmark exams skipped | 299 tasks | `l40s-results/sft/report.json` |
| SFT data v1, no key file skipped | 33; essay skipped | 25 | `l40s-results/sft/report.json` |
| SFT data v2/v2.1 | train 608 / val 111 (whole sessions) / test 291 (benchmark papers) | `l40s-results/sft-v2/report.json`, `sft-v2.1/report.json`; `lora_experiments.md` |
| v2 leakage audit | train∩val 5 shingle hits, train∩benchmark 3 (instruction phrases only) | `l40s-results/sft-v2/report.json`, `sft-v2.1/report.json` |
| v2 → v2.1 "with_rubric" | 968 → 1009 (of ~1010 total kept tasks) | `l40s-results/sft-v2/report.json` vs `sft-v2.1/report.json`; `guideline_data_fix.md` |
| v1 training examples after dedup (`prepare`) | 579 train / 66 eval (42 duplicates removed) | `l40s-results/lora-run/run/data/stats.json`; `SETUP_ON_L40S.md` §7 |
| v1 data tokens | mean 434.9, p95 759, max 3,926, total 251,818 | `l40s-results/lora-run/run/data/stats.json` |
| v1 LoRA config | r=32, α=64, dropout 0.05; 328 modules; 131,137,536 trainable params (1.08%) | `SETUP_ON_L40S.md` §7; `l40s-results/hf-history-lora/README.md` |
| v1 optimization | 2 epochs = 74 steps, batch 4 × grad_accum 4, lr 1e-4 cosine, warmup_steps 0.03, `paged_adamw_8bit`, max_len 4096, seed 42 | `SETUP_ON_L40S.md` §7; `l40s-results/lora-run/run/run_config.json` |
| v1 run time / VRAM | 14.3 min training, peak VRAM 22.2 GB (whole process ~26 GB per gpu.log) | `l40s-results/lora-run/run/metrics.json`; `SETUP_ON_L40S.md` §7 |
| v1 loss curve | step 10: train 2.116; step 18: eval 1.422 (acc 0.700); step 36: train 1.335 / eval 1.292 (0.718); step 54: train 0.984 / eval 1.269 (0.726); step 74: train 0.935 / **eval 1.257** (0.725) | `l40s-results/lora-run/run/metrics.json` (eval_loss 1.256564736366272); `SETUP_ON_L40S.md` §7; `l40s-results/hf-history-lora/README.md` |
| v1 output artifacts | `adapter/` 525 MB (PEFT); `lora.gguf` 262 MB, sha256 `44a1a3e1…` | `SETUP_ON_L40S.md` §7 |
| Smoke test (`lora-smoke`) | 42 synthetic Q&A pairs, 6 steps, batch 2, peak VRAM 8.6 GB (NF4 base alone 7.7 GB), ~2.2 s/step; `lora.gguf` 656 tensors, 262 MB | `SETUP_ON_L40S.md` §5 |
| Val v2 (Q4_0 GGUF), Gemma grader | base 65 pts/128 (50.8%), base_think 69/128 (53.9%), A(v2-A-nf4) 66/128 (51.6%), B(v2-B-bf16) 57/128 (44.5%) | `lora_experiments.md` "Results on val" |
| Val v2 EM (closed, n=22), Gemma pass | base 0%, base_think 0%, A 31.8%, B 54.5% | `lora_experiments.md` |
| Val v2, Claude reference grading (499 answers, 12 subagents) | base_think **49.2%**, base 39.1%, A 37.5%, B 35.2% | `lora_experiments.md` "Blind grading by Claude subagents"; `SETUP_ON_L40S.md` §10 |
| Gemma-vs-Claude grader agreement | exact agreement 85%; when differing, Gemma higher 67 times, lower 9 times; ~11 points too lenient overall | `lora_experiments.md` |
| Grader self-check (key answer) | 95.3% of points, 22/22 (100%) on closed tasks, mean length 197 chars | `lora_experiments.md`; `HANDOFF_REVIEW_FABLE.md` §4 |
| v2-A-nf4 training | 11 min, peak VRAM 14.2 GB, val loss best 1.352 at step 40 (~1.1 epoch), then rose (overfit) | `lora_experiments.md` |
| v2-B-bf16 training | 16 min, peak VRAM 27.1 GB, val loss fell to 1.261 by end | `lora_experiments.md` |
| RFT no-thinking sampling result | 1,212 samples from 606 train tasks (k=2); 462 with full Claude points (38%), covering 269/606 tasks | `SETUP_ON_L40S.md` §12 |
| RFT throughput | ~26 no-thinking samples/min, ~3–4 thinking samples/min (one shared server) | `SETUP_ON_L40S.md` §11 |
| v3-rft (first RFT run) | 22.6 min, peak VRAM 14.7 GB, r=32 α=64 lr 1e-4, 3 epochs, batch 4×4, val loss rose 2.69→3.14 (misleading, measured vs key answers) | `SETUP_ON_L40S.md` §13 |
| v3-rft Claude-graded val score | step 51: **41.4%** (best LoRA so far at that point, vs base 39.1%, within noise) | `SETUP_ON_L40S.md` "Status" item 6; `l40s-results/hf_preview_README.md` |
| data_synthetic_extended output | 5,010 essays, 5,040 closed tasks, 5,063 open tasks (3,431 variants + 11,682 new); DeepSeek cost $22.57 | `SETUP_ON_L40S.md` §14 |
| Backup size | ~4.4 GB (`l40s-results/`, outside the team repo) | `SETUP_ON_L40S.md` §9 |

## Components

- `WarsawModelTrainersHackathon/SETUP.md` (root copy, `003B-hackaton/SETUP.md`) — our short reproduction guide for
  setting up the L40S server, in order (SSH, packages, repo, models, "next" QLoRA plan).
- `WarsawModelTrainersHackathon/SETUP_ON_L40S.md` — the team-facing, detailed step-by-step (13 numbered sections):
  server specs, Claude-Code-over-SSH workflow, package install incl. flash-attn/bitsandbytes/venv isolation, repo
  copy + test results, model downloads, the full QLoRA→GGUF pipeline design (including a review table of bugs in
  the original `lora_pipeline.py`), llama.cpp build, shared llama-server on :8000, `build_sft_data.py` mechanics,
  the first real run, HF upload, backup/incidents, data v2/v2.1 + eval, RFT sampling, Claude grading, v3-rft, and
  `data_synthetic_extended`.
- `WarsawModelTrainersHackathon/scripts/build_sft_data.py` — deterministic script that pairs each question in
  `output/questions.jsonl` with its answer text parsed out of the matching `-odpowiedzi` key PDF (regex-based
  heading/label matching via pypdf, reusing `extract_questions.HEADING`), applies leakage filtering (80-char
  shingles) and text cleaning, and writes `{train,val,test}.jsonl` + `report.json`.
- `WarsawModelTrainersHackathon/scripts/lora_pipeline_simple.py` — the QLoRA training pipeline used for all runs:
  stages `prepare → train → eval → export → gguf_eval`; NF4 (or `--precision bf16`) base, LoRA on language-model
  attention/MLP projections only (`TARGET` regex excludes vision/audio embeddings and `lm_head`), TRL `SFTTrainer`,
  exports `lora.gguf` via llama.cpp's `convert_lora_to_gguf.py`, and can spin up a `llama-server` to compare base
  vs. LoRA on the real Q4_0 GGUF.
- `WarsawModelTrainersHackathon/scripts/eval_gguf.py` — evaluation harness: one `llama-server` serving the official
  Q4_0 GGUF plus all adapters at once (switched per request via `"lora":[{"id","scale"}]`); grades each answer with
  an LLM judge prompt (Q4_0 base in thinking mode) against the key's "Zasady oceniania" + example answer, plus exact
  match (EM) on closed tasks.
- `WarsawModelTrainersHackathon/scripts/rft_sample.py` (per `SETUP_ON_L40S.md` §11/§12; referenced, not opened in
  full here) — rejection-sampling script: samples k=2 base answers per training task (no-thinking or `--think`
  raw-trace mode), grades them, and builds an RFT training set from the shortest fully-correct sample (falling back
  to the key answer).
- `WarsawModelTrainersHackathon/lora_experiments.md` — results log for the v2-A/v2-B experiments, the
  thinking-mode-in-llama-server discovery, the Claude-vs-Gemma grader calibration, and the RFT plan.
- `WarsawModelTrainersHackathon/guideline_data_fix.md` — a fix-by-fix guideline/checklist for the SFT data problems
  (leakage, missing answers, answer/rubric mis-extraction, text noise, prompt-format matching) with a
  post-rebuild checklist.
- `003B-hackaton/HANDOFF_REVIEW_FABLE.md` — a handoff document (written 26.09.2026 by "Claude (Opus 5.5)") asking a
  reviewer ("Fable 5.1") to code-review the whole LoRA workstream read-only and write findings to
  `REVIEW_FEEDBACK.md`; lists ranked review priorities (loss masking/train-inference format mismatch, evaluation
  validity/self-preference risk, leakage-filter completeness, text-cleaning heuristics, RFT length bias, NF4-vs-bf16
  fairness, `publish_hf.py` correctness, and a diff review of the pipeline simplification).
- `003B-hackaton/HANDOFF_01.md` §1 — a session handoff summarizing the state as of ~26.09.2026 12:00 UTC (server
  setup, data v2/v2.1, LoRA run results table, grader calibration, RFT sampling status, scripts list).
- `003B-hackaton/l40s-results/README.md` — inventory of the local backup of everything from the server (checksummed
  against the server), describing `lora-run/`, `lora-smoke/`, `sft/`, `hf-history-lora/`, `scripts/`, `env/` and the
  first-run configuration/results/open items.
- `003B-hackaton/l40s-results/EXPERIMENTS.md` (lines 1–108 read) — the running experiment log: SFT data v2 splits,
  `eval_gguf.py` mechanics, the thinking-mode discovery, the val v2 results table (base/base_think/A/B), RFT
  design (including the thinking-mode variant), publishing plan, the Claude-subagent grader calibration table, a
  short benchmark-research summary, and the host-RAM sampler-kill incident.
- `003B-hackaton/l40s-results/BENCHMARKS_RESEARCH.md` — research into external Polish-history benchmarks
  (LLMzSzŁ has zero history items; the closest public work, arXiv 2608.12343, uses the *same* CKE 2023–25 papers as
  this team's val/test, so 100% overlap risk; several MCQ benchmarks recommended only as general-ability regression
  checks, never as training data).
- `003B-hackaton/l40s-results/hf-history-lora/README.md` — the HF model card for the `v1` adapter (usage in
  llama.cpp and PEFT, data provenance/limitations, training hyperparameters and loss table).
- `003B-hackaton/l40s-results/hf_preview_README.md` — a draft root index README for the multi-version HF repo,
  with a comparison table of all versions (v1, v2-A-nf4, v2-B-bf16, v3-rft, v3-rft-think, v4-tourn-r4-think,
  v4-tourn-r8-think) against base and base_think, by both Gemma and Claude grading.
- `l40s-results/lora-run/`, `lora-smoke/`, `sft/`, `sft-v2/`, `sft-v2.1/`, `env/` — local mirrors of the server's
  run outputs, smoke test, three generations of SFT data, and an environment snapshot (`system.txt`, `models.txt`,
  package freeze, checksums).
- Models: `google/gemma-4-12B-it-qat-q4_0-unquantized` (bf16 QAT weights, QLoRA training base) and
  `google/gemma-4-12B-it-qat-q4_0-gguf` (the shipped Q4_0 GGUF + vision `mmproj`, the LoRA's deployment target).
- HF repo `WMTH-100d2exam/history-lora` (private) — published adapter(s): PEFT format + `lora.gguf`, per-version
  folders, model card(s).

## Decisions, incidents and lessons

- **Why train on the unquantized QAT checkpoint, not the plain model:** a Q4_0 GGUF cannot itself be trained
  (transformers would just dequantize it back to bf16); the unquantized QAT weights are the same weights the
  official Q4_0 GGUF was derived from, and QAT specifically makes weights robust to that quantization, so a LoRA
  trained on them should degrade less when the base is later served as Q4_0. Source: `003B-hackaton/CLAUDE.md`
  "Next step" §1; `SETUP_ON_L40S.md` §5.
- **`include-system-site-packages` had to be turned off**: the preinstalled venv saw conda's torchaudio (built for
  CUDA 12 / torch 2.9), which crashed `import trl`/`import peft` with `OSError: libcudart.so.12: cannot open shared
  object file` — no matching torchaudio release exists for torch 2.14, so the fix was isolating the venv, not
  upgrading torchaudio. This was an environment change, done with a backup of `pyvenv.cfg` kept for rollback (per
  the user's "ask before env changes" rule, this and other env changes are documented in `SETUP_ON_L40S.md` §2 and
  team CLAUDE.md — no explicit mention that consent was withheld or granted is present in the read sources).
  Source: `SETUP_ON_L40S.md` §2 "Isolate the venv from conda".
- **Original `lora_pipeline.py` had 6 identified bugs**, fixed in the simplified rewrite `lora_pipeline_simple.py`:
  (1) `warmup_ratio` doesn't exist in TRL 1.14/transformers 5's `SFTConfig`, crashing on start; (2) the Gemma 4 chat
  template has no `{% generation %}` markers, so loss was computed over the whole conversation, not just the
  answer; (3) the template appends an empty thinking block to the *generation* prompt but not to a rendered full
  conversation, which caused a prompt/completion tokenization mismatch that made TRL mask off the first ~5 tokens
  of the actual answer; (4) FP8-via-torchao base isn't real QLoRA and peft support for it is uncertain; (5)
  `--merge` exported q8_0, not Q4_0, losing the QAT benefit; (6) `dataloader_num_workers=4` is too many for a
  4-vCPU box. Source: `SETUP_ON_L40S.md` §5 "Review of the original `lora_pipeline.py`".
- **The train/inference format-mismatch fix**: render the prompt as a string with `add_generation_prompt=True`
  (so it includes the same empty `<|channel>thought\n<channel|>` block the model sees at inference), and set the
  completion to `answer + "<turn|>"` (TRL appends `<eos>`), so the loss is computed only on the answer tokens.
  Verified by a training-log line, e.g. `Loss liczony na (przykład 0): '1978<turn|><eos>'`. Source:
  `SETUP_ON_L40S.md` §5, §7; `HANDOFF_REVIEW_FABLE.md` §3.1.
- **Data leakage in SFT v1** (most important data fix): v1 excluded benchmark-session exams only in their
  *new*-format version; the old-format ("-stara-") papers of the same sessions shared real tasks with the
  benchmark, so 16 of 611 v1 training examples were literally benchmark questions (12 from May 2026, 3 from May
  2023, 1 from June 2020) — meaning v1's eval loss and any early benchmark scores were optimistic. Also, v1's
  eval split was by individual exam, so the old-format June 2026 paper sat in train while its new-format twin sat
  in eval. Fix (v2): old-format papers are dropped if they share any 80-character text shingle with a benchmark
  question; validation is done by whole *session* (both formats together). Source: `guideline_data_fix.md` §1;
  `SETUP_ON_L40S.md` §10.
- **A second leakage source found later**: the team's own second eval set,
  `src/history-matura-llm-evaluation-39B4` (built from the same 2023–2025 papers as the public arXiv 2608.12343
  benchmark), shares 2 training task IDs (both from `historia-2023-przykladowy-arkusz-cke-rozszerzona`); these are
  dropped by explicit ID (`drop_ids.txt`), not yet folded into the automatic shingle filter. Source:
  `guideline_data_fix.md` §1.
- **Curriculum text mis-captured as an "answer" in v2, fixed in v2.1**: the "Wymagania egzaminacyjne" block
  sometimes starts with a word matching an answer label (e.g. "argumenty…"), causing 7 tasks' extracted "answer" to
  actually be curriculum boilerplate ("…Zdający: 2) wyjaśnia przyczyny… (PP)") with an empty rubric — this was
  caught by the blind Claude graders flagging "BRAK_KLUCZA". Fix: search for the answer label *after* "Zasady
  oceniania" first, falling back to the whole block only for the Nowa Era layout. Also fixed: Nowa Era's rubric,
  which sits *after* the answer in their key layout, causing 34 tasks to appear rubric-less. Source:
  `guideline_data_fix.md` §2b.
- **Answer text swallowing the next task**: a loosely formatted heading (`Zadanie 25 . (0–12)`, extra space before
  the dot) wasn't matched by the strict heading regex, so an entire 11,862-character essay rubric got glued onto
  the previous task's answer. Fixed by also cutting on any loosely written `Zadanie N (` line. Source:
  `guideline_data_fix.md` §3.
- **PDF-extraction text noise fixed in `clean()`**: letter-by-letter map/figure labels (replaced with a
  `[mapa/ilustracja]` marker via a noise-density heuristic), hard ~90-character line wraps mid-sentence (rejoined,
  since the benchmark's own questions are one line per paragraph and training on wrapped text taught the model to
  answer with hard-wrapped lines), answer blanks (`......`) removed, split Polish diacritics from pypdf/pdfplumber
  (`mo żliwe` → `możliwe`, joined via a corpus-frequency heuristic), and a repeated COVID-19 regulation footnote
  removed. Source: `guideline_data_fix.md` §4.
- **`llama-server --jinja` enables Gemma 4 thinking mode by default** — a load-bearing operational finding: the
  chat template then omits the empty thinking block that training assumed for its non-thinking LoRAs, so the model
  starts thinking (in English) and burns through the token budget; in the first evaluation pass this truncated or
  blanked 82 of 111 base answers and ~40 LoRA answers. Fix: always pass
  `--chat-template-kwargs '{"enable_thinking":false}'` (or per-request `chat_template_kwargs`) for LoRAs trained
  without thinking. The team's own shared server on :8000 was, at least at the time of writing, still running in
  thinking mode by default. Source: `lora_experiments.md` "⚠️ Thinking mode in llama-server"; `SETUP_ON_L40S.md`
  §10; `003B-hackaton/CLAUDE.md` "LoRA experiments (26.09)".
- **Fine-tuning on literal key answers changes style, not knowledge**: v2-A (NF4) and v2-B (bf16 base) both learn
  the key's terse answer format (EM on closed tasks rises from 0% to 32–55%) but score at or below the untuned
  base's point total; B, fit more tightly (lower loss), produced *more* confident invented specifics (quoted
  examples: "Oktawian August był pierwszym konsulem", "Dictatus papae z 1059 r."), i.e. lower loss on key answers
  did not mean more points, and bf16 training didn't help over NF4. Source: `lora_experiments.md` "Conclusions"
  under "Results on val".
- **Self-grading is measurably biased**: using the same model family (Gemma, in thinking mode) as the LLM judge
  scored answers about 11 points too leniently versus 12 Claude subagents grading blind (no variant name, no
  Gemma score) as CKE examiners, and — more importantly — the leniency was *not uniform across variants*, so it
  changed the ranking (e.g., Gemma ranked A above base at 51.6% vs 50.8%, while Claude ranked base above A at
  39.1% vs 37.5%). This made "Claude is the reference grader for model selection" an explicit conclusion, with
  base_think's 49.2% (Claude) set as "the bar to beat." Source: `lora_experiments.md` "Blind grading by Claude
  subagents"; `SETUP_ON_L40S.md` §10.
- **Data-quality bugs the graders surfaced**: the blind grading pass itself found 7 key answers that were actually
  empty rubrics/curriculum text (see above), fixed in v2.1 (commit `c0c484e1`). Source: `lora_experiments.md`
  "Benchmark research" section intro; `SETUP_ON_L40S.md` §10.
- **Host-RAM incident**: `llama-server`'s default up-to-8-GB-per-instance prompt cache in host RAM, combined
  across two RFT samplers plus a teammate's server, exceeded the box's 30 GB RAM and got the thinking-mode
  sampler's server killed by the OS. Fixed with `--cache-ram 2048` and by writing each sample to disk as soon as
  it finished (so a restart resumes by `(id, sample)` and loses no work). Source: `l40s-results/EXPERIMENTS.md`
  "Incident: the thinking-mode sampler was killed (host RAM)"; `SETUP_ON_L40S.md` §11.
- **Operational SSH/process lessons** (documented for future sessions): a `pgrep -f "<pattern>"` wait-loop run
  inside a `bash -c` whose own command text contains the same pattern never terminates (it matches itself) — use a
  bracketed character in the pattern or wait on a PID instead; `ssh l40s '… &'` can hang even with `nohup` and
  redirects, so background jobs should use `ssh -n l40s 'setsid nohup … > log 2>&1 < /dev/null &'`; and a training
  launch once actually started on the server even though its tool call appeared rejected in the Claude Code UI, so
  server state should be checked directly rather than assumed. Source: `SETUP_ON_L40S.md` §9 "Incidents".

## People

- **JulianVolodia** (git author on all six reviewed commits `25fd3908, fc335048, 4140277b, cbc30dca, c0c484e1,
  64ad1a31`; = "Volodia", owner of these notes per project CLAUDE.md) — drove the whole L40S QLoRA workstream:
  server setup, wrote/committed `SETUP_ON_L40S.md`, `build_sft_data.py`, `lora_pipeline_simple.py`,
  `eval_gguf.py`, `rft_sample.py`, `guideline_data_fix.md`; ran the training/evaluation sessions; uploaded the
  adapter to HF as user `julianvolodia`; requested the Fable code review. All six commits list
  "Co-Authored-By: Claude Opus 5.5" — i.e., an AI pair-programming session did the implementation work under this
  author's commits, and two commits (`cbc30dca`, `c0c484e1`) additionally carry a `Claude-Session:` link.
- **"Fable 5.1"** — the addressee of `HANDOFF_REVIEW_FABLE.md`, asked to independently code-review the LoRA
  workstream (data building, training, evaluation, RFT, publishing) read-only and write findings to
  `REVIEW_FEEDBACK.md` (that feedback file was not among the sources read for this fact sheet, so its content/
  outcome is a gap — see below).
- No other individual git authors appear among the six commits reviewed for this area; other teammates
  (e.g. the owner of the shared `llama-server` on :8000, referred to only as "a teammate" in the sources, never
  named) are mentioned as present on the shared server but are not named authors of this workstream's commits.

## Open issues / limitations

- **`gguf_eval` / real Q4_0 deployment check had not been run at the time of the first HF upload** — the llama.cpp
  build was ready but the adapter hadn't yet been tested end-to-end on the quantized Q4_0 model in llama-server.
  Source: `l40s-results/README.md` "Open items".
- **16 of 611 v1 training examples overlap the benchmark** (old-format "stara" papers of benchmark sessions), so
  v1's own benchmark-style scores may be inflated; not fixed in v1, fixed in v2. Source: `l40s-results/README.md`
  "Open items"; `l40s-results/hf-history-lora/README.md` "Known limitations".
- **128 tasks (v1) / 80 tasks (v2) have no extractable answer**: table-format keys (June 2018/2019, 68 tasks),
  unrecognized labels, missing task headings in the key, and one exam (May 2025, old format) with no key file at
  all — deliberately left unfixed because "noisy answers hurt more than missing ones." Source:
  `guideline_data_fix.md` §2; `SETUP_ON_L40S.md` §6.
- **No images in training data**: the model only sees the PDF text layer; map/photo/poster-based tasks are marked
  `[mapa/ilustracja]` but the model can't see the actual image, which the team says depresses scores on those
  tasks "equally for every model" but doesn't fix the gap. Source: `guideline_data_fix.md` §6;
  `l40s-results/hf-history-lora/README.md` "Known limitations".
- **No essays in training data**: answer keys only give scoring criteria, not a model essay, so essay-writing
  ability isn't trained or evaluated here. Source: `guideline_data_fix.md` §6.
- **LLM-judge grading has a self-preference risk**: even after moving to Claude as the reference grader, the
  underlying evaluation still uses the Gemma family for some scoring paths, and `HANDOFF_REVIEW_FABLE.md`
  explicitly flags this as an open question for review, especially for RFT models trained on the grader's own
  judged output. Source: `HANDOFF_REVIEW_FABLE.md` §3.2.
- **Noise floor**: with val v2 at 128 points, the team states a ±4–5 point difference is noise, meaning most of
  the v2-A/v2-B/v3-rft deltas discussed above are only marginally distinguishable from the base. Source:
  `lora_experiments.md` "Results on val" conclusions; `HANDOFF_REVIEW_FABLE.md` §3.2.
- **No adapter had beaten the thinking-mode base (49.2%, Claude-graded) as of the sources read**: v3-rft reached
  41.4%; later-stage results (v3-rft-think 44.5%, v4-tourn-* tournament finalists) are mentioned in
  `hf_preview_README.md` but sit outside this fact sheet's assigned scope/commit range and are flagged as a
  **gap** below.
- **No ready-made Polish CKE-history training/eval data exists externally**: confirmed by dedicated research — the
  only public overlapping benchmark (arXiv 2608.12343) uses the *same* 2023–2025 papers as this team's own
  val/test, so it cannot be used as extra data without contaminating evaluation. Source:
  `l40s-results/BENCHMARKS_RESEARCH.md`.
- **Extraction of pre-2018 exams is unsupported** (noted here because it caps how much more real CKE data could
  ever be added): 34 older exam PDFs (2005–2018) fail `extract_questions.py`'s parser for four distinct reasons
  (unrecognized headings/numbering, non-A4 pages, essay-count check, later validation checks); this is the
  "largest untapped data source" per the guideline doc. Source: `guideline_data_fix.md` §6; `003B-hackaton/CLAUDE.md`
  "Known issues" (cross-reference, not separately re-verified here).
- **`REVIEW_FEEDBACK.md` (Fable's review output) was not read** for this fact sheet — its existence, findings, or
  whether the requested fixes were applied is a **gap**: not in the assigned source list.
- **Whether the user explicitly approved the venv `include-system-site-packages` change beforehand** is not stated
  in the sources read (the team CLAUDE.md states a general "ask before env changes" rule, and `SETUP_ON_L40S.md`
  documents the change as already made) — a **gap**.
- **This fact sheet's assigned scope stops at "part 1"**: RFT-thinking results (`v3-rft-think`), the hyperparameter
  tournament (`v4-tourn-r4-think`/`v4-tourn-r8-think`), and the final `test`-split (291-task) evaluation are
  referenced in passing (via `hf_preview_README.md` and `SETUP_ON_L40S.md`'s own forward references) but are
  explicitly out of scope here and presumably covered by a separate "part 2" fact sheet — flagged as a **gap**
  for this document, not a missing fact per se.

## Good quotes or slide-worthy details

- "Fine-tuning on key answers changes the style, not the knowledge." — the LoRA's answers get short and
  key-formatted (EM on closed tasks 0%→32–55%) but score at or below the base. Source: `lora_experiments.md`.
- Hallucination example under the more tightly-fit v2-B variant: the model asserted "Oktawian August był pierwszym
  konsulem" and "Dictatus papae z 1059 r." — confident, specific, and wrong; lower training loss did not mean more
  correct facts. Source: `lora_experiments.md` "Conclusions".
- Base-model hallucination caught in the eval samples for v1: asked to explain a 1968 speech/poster pair about
  Czechoslovakia, the untuned base invented an "akcji «Operacja Burza»" ("Operation Storm") for the 1968
  Warsaw-Pact invasion, while the LoRA correctly named the actual historical mechanism (Brezhnev's speech as the
  ideological basis for the intervention). Source: `l40s-results/lora-run/run/eval_samples.md`, "Przykład 1".
- "`llama-server --jinja` turns on Gemma 4's thinking mode by default" — a one-line default silently cut off 82 of
  111 evaluation answers the first time the team ran it. Source: `lora_experiments.md`.
- Grader sanity check: feeding the judge the *actual key answer* as the "model's answer" scored it 95.3% (not
  100%) and 22/22 on closed tasks — used as evidence the grader is at least roughly well-calibrated, not just
  lenient. Source: `HANDOFF_REVIEW_FABLE.md` §4; `lora_experiments.md`.
- Grader-disagreement asymmetry: comparing the Gemma judge against 12 Claude subagents on the same 111-task val
  set, they agreed exactly 85% of the time — and on the other 15%, Gemma scored higher 67 times versus lower only
  9 times, i.e. Gemma's disagreements are lopsidedly generous. Source: `lora_experiments.md`.
- QLoRA touched only 1.08% of the model's parameters (131,137,536 of the full Gemma 4 12B) yet fully changed its
  answer style within 74 training steps (14.3 minutes on one L40S). Source: `l40s-results/hf-history-lora/README.md`;
  `SETUP_ON_L40S.md` §7.

## Sources consulted

- `/mnt/hgfs/sharedWithKali/ai-thingy-september-26/003B-hackaton/SETUP.md`
- `/mnt/hgfs/sharedWithKali/ai-thingy-september-26/003B-hackaton/WarsawModelTrainersHackathon/SETUP_ON_L40S.md` (full, 556 lines)
- `/mnt/hgfs/sharedWithKali/ai-thingy-september-26/003B-hackaton/l40s-results/README.md`
- `/mnt/hgfs/sharedWithKali/ai-thingy-september-26/003B-hackaton/l40s-results/EXPERIMENTS.md` (lines 1–108)
- `/mnt/hgfs/sharedWithKali/ai-thingy-september-26/003B-hackaton/WarsawModelTrainersHackathon/lora_experiments.md`
- `/mnt/hgfs/sharedWithKali/ai-thingy-september-26/003B-hackaton/WarsawModelTrainersHackathon/guideline_data_fix.md`
- `/mnt/hgfs/sharedWithKali/ai-thingy-september-26/003B-hackaton/WarsawModelTrainersHackathon/scripts/build_sft_data.py` (docstring + head)
- `/mnt/hgfs/sharedWithKali/ai-thingy-september-26/003B-hackaton/WarsawModelTrainersHackathon/scripts/lora_pipeline_simple.py` (docstring + argparse defaults)
- `/mnt/hgfs/sharedWithKali/ai-thingy-september-26/003B-hackaton/WarsawModelTrainersHackathon/scripts/eval_gguf.py` (docstring)
- `/mnt/hgfs/sharedWithKali/ai-thingy-september-26/003B-hackaton/l40s-results/lora-run/run/metrics.json`
- `/mnt/hgfs/sharedWithKali/ai-thingy-september-26/003B-hackaton/l40s-results/lora-run/run/run_config.json`
- `/mnt/hgfs/sharedWithKali/ai-thingy-september-26/003B-hackaton/l40s-results/lora-run/run/data/stats.json`
- `/mnt/hgfs/sharedWithKali/ai-thingy-september-26/003B-hackaton/l40s-results/lora-run/run/eval_samples.md` (excerpt)
- `/mnt/hgfs/sharedWithKali/ai-thingy-september-26/003B-hackaton/l40s-results/sft/report.json`
- `/mnt/hgfs/sharedWithKali/ai-thingy-september-26/003B-hackaton/l40s-results/sft-v2/report.json`
- `/mnt/hgfs/sharedWithKali/ai-thingy-september-26/003B-hackaton/l40s-results/sft-v2.1/report.json`
- `/mnt/hgfs/sharedWithKali/ai-thingy-september-26/003B-hackaton/l40s-results/lora-smoke/` (directory listing)
- `/mnt/hgfs/sharedWithKali/ai-thingy-september-26/003B-hackaton/l40s-results/env/system.txt`
- `/mnt/hgfs/sharedWithKali/ai-thingy-september-26/003B-hackaton/l40s-results/env/models.txt`
- `/mnt/hgfs/sharedWithKali/ai-thingy-september-26/003B-hackaton/l40s-results/hf-history-lora/README.md`
- `/mnt/hgfs/sharedWithKali/ai-thingy-september-26/003B-hackaton/l40s-results/hf_preview_README.md`
- `/mnt/hgfs/sharedWithKali/ai-thingy-september-26/003B-hackaton/HANDOFF_REVIEW_FABLE.md`
- `/mnt/hgfs/sharedWithKali/ai-thingy-september-26/003B-hackaton/HANDOFF_01.md` (section 1, lines 1–~44)
- `/mnt/hgfs/sharedWithKali/ai-thingy-september-26/003B-hackaton/l40s-results/BENCHMARKS_RESEARCH.md`
- Commits (team repo, `git show`): `25fd3908`, `fc335048`, `4140277b`, `cbc30dca`, `c0c484e1`, `64ad1a31`
  (full messages + `--stat` read via `git show`)
