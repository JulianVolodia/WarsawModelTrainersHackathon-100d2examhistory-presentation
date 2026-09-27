# Every model used by team "100d2exam" (Warsaw Model Trainers Hackathon, 25–27.09.2026)

Compiled from the presentation fact sheets (`WarsawModelTrainersHackathon-100d2examhistory-presentation/build/facts/*.md`
and `build/sources/*.md`) and verified against the team repo (`benchmark/models.yaml`, `AGENTS.md`,
`training/README.md`, `src/posttrain/{README.md,open_models/README.md}`, `docs/rag-dense.md`,
`rag_integration/RAG_USAGE.md`, `docs/micro100d2exam-ollama.md`, `COMMUNICATION.md`). Read-only; no repo state
changed.

## 1. Summary — counts per role

| Role | Distinct models/entries |
|---|---|
| Base for fine-tuning | 7 |
| Fine-tuned / trained by the team (named adapters/checkpoints) | ~20 checkpoints across 8 pipelines |
| Teacher / distillation | 1 (dual-role, also a judge) |
| Judge / grader | 5 |
| Benchmark baseline only (never fine-tuned by the team) | ~27 `models.yaml` entries |
| From-scratch | 1 |
| Retrieval / embedding (RAG) | 3 in active use + 1 explicitly *not* used |
| Vision projector | 2 (+2 frozen/unused vision towers) |
| Referenced only via an imported external paper (not run by this team) | 8 (see Uncertainties) |

All Claude-subagent grading in this project is attributed to **Claude Opus 5.5**, with one workstream
(retrieval/harness, `9ed0effa`, `314868c9`, `83895478`) co-authored by **"Claude Fable 5.1"**. No specific
Sonnet/Haiku usage is named anywhere in the sources read.

---

## 2. Base for fine-tuning

| Model | Format | Who | Where | What for / result | Source |
|---|---|---|---|---|---|
| `google/gemma-4-12B-it-qat-q4_0-unquantized` | bf16 (QAT checkpoint, dequantized) | JulianVolodia (L40S line); Pawel Cyrta (posttrain Gemma line) | AWS L40S (`ssh l40s`, `/scratch`); H100 (posttrain) | Base for all Gemma-4-12B QLoRA/LoRA training; chosen because QAT weights survive Q4_0 re-quantization better than the plain model | `l40s-gemma-lora-part1.md` "Summary"; `AGENTS.md` "Current history LoRA training policy" |
| `unsloth/Qwen3.8-27B-GGUF` (UD-**IQ2_S** quant, dequantized exactly to HF layout) | int8 codes × fp16 block scale, bit-exact mapping (851 tensors, max diff 6e-8) | Szymon Hajderek | H100 (own rented GPU, `training/`) | Base for Qwen3.8-27B LoRA, trained deliberately on the *deploy* quantization so the adapter learns against its errors | `training/README.md` |
| `Qwen/Qwen3.5-2B` | bf16 / NF4 / GGUF (q8_0) variants | Szymon Hajderek | GPU host 81.85.1.173 / local vLLM (`:8030`) / Ollama | Base for the earlier Qwen3.5-2B LoRA overfit-capacity grid (rank×lr×batch) | `team-training-pipelines.md` Key numbers; `training/RUNBOOK.md` |
| `speakleash/Bielik-11B-v3.0-Instruct` | bf16 LoRA r=32/α=64 | Pawel Cyrta | 1× H100 80GB (posttrain) | Base for Bielik SFT / GRPO / GRPO-from-base | `note_bielik_qwen_ministral_20260927.md`; `src/posttrain/open_models/README.md` |
| `mistralai/Ministral-3-8B-Instruct-2512-BF16` | bf16 (the FP8 `-2512` release can't be trained) | Pawel Cyrta | 1× H100 80GB | Base for Ministral-3-8B SFT / GRPO / GRPO-from-base | same as above |
| `Qwen/Qwen3.5-9B` | bf16, non-thinking | Pawel Cyrta | 1× H100 80GB | Base for Qwen3.5-9B SFT / GRPO (strongest base model per the team's own note) | same as above |
| `Gemma 3 12B` | bf16 LoRA | Pawel Cyrta | 1× H100 80GB | Base for the parallel Gemma-3-12B SFT → GRPO line (comparison arm to Gemma 4) | `notes_gemma_sft_20260927.md` |

Deployment-format note: the actual shipped/served format for the Gemma-4 line is the **Q4_0 GGUF**
(`google/gemma-4-12B-it-qat-q4_0-gguf`) via llama.cpp — LoRA adapters are merged/exported into this format for
serving, not trained on it directly (a GGUF can't be trained; transformers would just dequantize it back to bf16).
Source: `003B-hackaton/CLAUDE.md` "Next step"; `l40s-gemma-lora-part1.md`.

---

## 3. Fine-tuned / trained by the team

| Model / adapter | Format | Who | Where | Best score (grader named) | Source |
|---|---|---|---|---|---|
| **Gemma 4 12B QLoRA v1** (r=32,α=64) | NF4 QLoRA → `lora.gguf` | JulianVolodia | L40S | eval loss 1.257; HF `WMTH-100d2exam/history-lora` (private), first published version | `l40s-gemma-lora-part1.md` |
| Gemma 4 12B LoRA **v2-A-nf4** / **v2-B-bf16** (SFT on key answers) | NF4 / bf16 LoRA | JulianVolodia | L40S | Did **not** beat base: Claude-graded 37.5% (A) / 35.2% (B) vs base 39.1% (val v2, 111 tasks/128 pts) | `l40s-gemma-lora-part1.md`; `lora_experiments.md` |
| Gemma 4 12B **v3-rft** (RFT, no-thinking) | NF4 LoRA r=32 | JulianVolodia | L40S | 41.4% (Claude), vs base 39.1% — first LoRA to (barely) beat the base | `l40s-gemma-lora-part2.md` |
| Gemma 4 12B **v3-rft-think** (RFT, thinking traces) | NF4 LoRA r=32 | JulianVolodia | L40S | 44.5% (Claude) — still ~6 pts below `base_think` 49.2% | `l40s-gemma-lora-part2.md` |
| Gemma 4 12B **v4-tourn-r4-think / v4-tourn-r8-think** (18-config hyperparameter tournament finalists) | NF4 LoRA r4/r8, lr1e-4 | JulianVolodia (+ co-authored Claude Opus 5.5) | L40S + Runpod A100 SXM 80GB (`wmth-lora-tournament-a100`, $1.59/h, deleted) | **50.8%** (Claude) both — first Gemma LoRA to match/slightly beat plain thinking-mode base (49.2%); published to HF `WMTH-100d2exam/history-lora` | `l40s-gemma-lora-part2.md` |
| Gemma 4 12B **history_v2 / full-v2** (all-data, image-aware pipeline) | bf16 LoRA r=16/α=32 | endote | Nebius H100 | **Paused, not completed** — step 200/1,389 (14.4%), loss 3.266→0.574, grad_norm spike 412.6; no export/eval | `team-training-pipelines.md` |
| Gemma 4 12B **v6-dpo-vision-text** | DPO, vision+text, init from `v5-all-r16/step-130` | (Nebius H100 line, endote's infra) | Nebius H100 | Mock-submitted to `history-2023-mock-v1` (37/37 answered) but **never graded for correctness** | `team-training-pipelines.md` |
| Qwen3.8-27B LoRA (main run, `training/`) | bf16 LoRA r32/α64 on IQ2_S base | Szymon Hajderek | H100 (bench-queue host `89.169.123.44:38471`) | Held-out (12 packs/630 pts) bench in progress; checkpoints benched every 25 steps | `team-training-pipelines.md`; `training/README.md` |
| Qwen3.8-27B LoRA **"abl-r16" step-175** (rank-16 ablation, trained directly on IQ2_S) | IQ2_S GGUF + LoRA | (team, H200 rank-ablation line) | H200 (`.110.43`) | Final pack `history-synthetic-c-v4` (37 items/60pts, no key): **42/60 (70.0%) Claude** vs base 35/60 (58.3%); 43/60 (71.7%) DeepSeek vs base 42/60 (70.0%) — model-graded only | `l40s-gemma-lora-part2.md`; `l40s-results/EVAL/…s175-vs-base/README.md` |
| Qwen3.5-2B LoRA **overfit-r8 ckpt-225 / overfit-v1 r8 lr1e-4 step-570** | bf16/NF4 LoRA | Szymon Hajderek | GPU host 81.85.1.173 / local vLLM | Benched vs base: Ollama q8_0 baseline 60/300 (20.0%); vLLM bf16 45/300 (15.0%) → +presence_penalty 54/300 (18.0%) | `team-training-pipelines.md`; `training/RUNBOOK.md` |
| **Bielik-11B-v3.0-Instruct** SFT / SFT→GRPO / GRPO-from-base | bf16 LoRA r32/α64 | Pawel Cyrta | 1× H100 80GB | **SFT 77.0%** closed-EM (best of this line) / SFT→GRPO 74.8% / GRPO-from-base 71.3% (vs base 13.3%), judge-free EM | `note_bielik_qwen_ministral_20260927.md` |
| **Qwen3.5-9B** SFT / SFT→GRPO | bf16 LoRA r32/α64 | Pawel Cyrta | 1× H100 80GB | SFT 75.4% / SFT→GRPO 73.8% (vs base no-think 61.2%), closed-EM | same |
| **Ministral-3-8B-Instruct-2512** SFT / SFT→GRPO / GRPO-from-base | bf16 LoRA r32/α64 | Pawel Cyrta | 1× H100 80GB | SFT 72.6% / GRPO-from-base 69.4% / SFT→GRPO **62.2%** (regression vs SFT alone) (vs base 8.8%), closed-EM | same |
| **Gemma 4 12B SFT@think** (`gemma-4-12B-it-qat-matura-history-sft-lora-r32`) | bf16 LoRA r32 | Pawel Cyrta | 1× H100 80GB | **70.4** closed-EM (top of the Gemma note's 5-model table), 321-item val set | `notes_gemma_sft_20260927.md` |
| **Gemma 3 12B** SFT / SFT→GRPO (step 25) | bf16 LoRA | Pawel Cyrta | 1× H100 80GB | SFT 66.4 / SFT→GRPO(step25) 68.2 (vs Gemma 3 base 45.5) closed-EM | `notes_gemma_sft_20260927.md` |

All of the above closed-EM figures (Bielik/Qwen3.5-9B/Ministral/Gemma3/Gemma4 SFT/GRPO table) are **judge-free exact
match on closed items only** — not graded exam scores; full graded scores for these finalists were still pending a
`DEEPSEEK_API_KEY` on the training box as of the notes. All Claude/DeepSeek percentages elsewhere are **model
grades**, explicitly marked as such in the sources, never an official CKE score.

---

## 4. Teacher / distillation

| Model | Format | Who | Where | What for / result | Source |
|---|---|---|---|---|---|
| `google/gemma-4-31b-it` (= "gemma-4-31B", QAT w4a16 in this role) | w4a16 (self-hosted vLLM) | Pawel Cyrta (posttrain lines); endote (2005–2016 key extraction) | vLLM `:8030` on the posttrain H100; also served via `serve_judge.sh` | Teacher: answers each question 4×@think, judge keeps the best answer scoring ≥0.8 → 1,594 verified traces (85% yield, mean reward 0.78) from 1,884 prompts, feeding SFT for Bielik/Ministral/Qwen/Gemma; also used to OCR/extract 624 answer keys for 2005–2016 PDFs | `note_bielik_qwen_ministral_20260927.md`; `notes_gemma_sft_20260927.md` |

Dual role: `gemma-4-31b` is *also* benchmarked as an ordinary candidate via OpenRouter (`models.yaml`, thinking
default off, `@think` optional) and doubles as the **RL judge/examiner** for open questions and essays in the
`reward.py` scorer — see §5 and §6.

---

## 5. Judge / grader

| Model | Format | Who | Where | Role / finding | Source |
|---|---|---|---|---|---|
| DeepSeek **`deepseek-flash`** (= DeepSeek-V4.1-Flash) | API, modes `-low`/`-high`/`-nothink` (temperature 0) | Team-wide (`AGENTS.md` mandates it) | DeepSeek API | Default/only sanctioned judge for grading exam attempts (`deepseek-flash-high@think` specifically); calibrated against Claude on 728 answers: 89.8% exact-point agreement, mean |diff| 0.10, precision 0.88/recall 0.94 on "full points", cost $0.10; also appears as a benchmarked *candidate* (best score in the old `RESULTS.html`, 98.4%) | `benchmark.md`; `AGENTS.md` line 7; `models.yaml` `judge:` block |
| **Claude subagents** (Claude **Opus 5.5**; one workstream co-authored "Claude **Fable 5.1**") | N/A (Claude Code subagents, not an API entry in `models.yaml`) | JulianVolodia's sessions (blind-grading batches); also final-pack grading (3 subagents) | Claude Code (local) | **Reference grader for model selection**, adopted after finding the in-house Gemma judge ~11 points too lenient (499 answers, 85% exact agreement with Gemma, Gemma higher 67× / lower 9× on disagreements) | `benchmark.md` "Decisions"; `l40s-gemma-lora-part1.md`; `grading-and-evaluation.md` |
| **`gpt-6-astra`** (medium effort, via Codex CLI) | API through Codex CLI wrapper (`harness/grading.py`) | (harness/grading line, author not separately named in sources read) | Local Codex CLI dispatch | Independent early grader ("Astra"); first full-mock grade 26/60 (43.33%); **explicitly deprecated** — `harness/README.md`: "do not use them for new grading" | `grading-and-evaluation.md`; `harness-submission-services.md` |
| **Gemma-4 self-grader** (the Q4_0 base itself, thinking mode, inside `eval_gguf.py`) | Q4_0 GGUF | JulianVolodia (L40S eval harness) | L40S | Early in-house judge; found **~11 points too lenient** and rank-flipping vs Claude — superseded, kept only as a historical/early metric | `l40s-gemma-lora-part1.md`; `HANDOFF_REVIEW_FABLE.md` |
| `google/gemma-4-31b-it` **as RL/examiner judge** | w4a16 vLLM | Pawel Cyrta | posttrain H100 | Scores open items/essays (points/max, partial credit) for GRPO reward on Bielik/Ministral/Qwen/Gemma; noted to need calibration against Claude ("a Gemma judge was about 11 points too lenient") before trusted as a reward | `note_bielik_qwen_ministral_20260927.md` §6 |

---

## 6. Benchmark baseline only (candidate models in `benchmark/models.yaml`, never fine-tuned by this team)

| Model | Format | Who | Where | What for / result | Source |
|---|---|---|---|---|---|
| `qwen/qwen3.8-27b` (+ `:free` tier) | API | Szymon Hajderek (bench scaffold) | OpenRouter | Candidate benchmark baseline (bf16-only provider filter) | `models.yaml` |
| `google/gemma-4-31b-it` | API | see §4 (dual role) | OpenRouter | Candidate baseline, `@think`/`@nothink` | `models.yaml` |
| `google/gemma-3-12b-it` | API | — | OpenRouter | Candidate baseline (separate identity from the locally-trained Gemma-3-12B SFT copy in §3) | `models.yaml` |
| `google/gemma-3-4b-it` | API | — | OpenRouter | Candidate baseline | `models.yaml` |
| `mistralai/ministral-8b-2512` | API | — | OpenRouter | Candidate baseline | `models.yaml` |
| `mistralai/ministral-14b-2512` | API | — | OpenRouter | Candidate baseline | `models.yaml` |
| `qwen/qwen3-8b` | API | — | OpenRouter | Candidate baseline, thinking toggle | `models.yaml` |
| `qwen/qwen3.5-9b` | API (bf16 filter) | — | OpenRouter | Candidate baseline (dual role: also §2/§3 fine-tuning base, different serving instance) | `models.yaml` |
| `tencent/hy-mt2-1.8b` | API (fp8) | — | OpenRouter | Translation model, oddity baseline (not history-specific) | `models.yaml` |
| `qwen/qwen3.5-35b-a3b` | API (fp8) | — | OpenRouter | Candidate baseline | `models.yaml` |
| `speakleash/Bielik-1.5B-v3.0-Instruct` | FP8 vLLM | — | GPU host 81.85.1.173:8001 | Candidate baseline | `models.yaml` |
| `speakleash/Bielik-4.5B-v3.0-Instruct` | FP8 vLLM | — | GPU host :8002 | Candidate baseline | `models.yaml` |
| `speakleash/Bielik-Minitron-7B-v3.0-Instruct` | FP8 vLLM | — | GPU host :8003 | Candidate baseline | `models.yaml` |
| `speakleash/Bielik-PL-Minitron-7B-v3.0-Instruct` | FP8 vLLM | — | GPU host :8004 | Candidate baseline | `models.yaml` |
| `speakleash/Bielik-11B-v3.0-Instruct` (untuned) | FP8 vLLM | — | GPU host :8005 | Candidate baseline (dual role: also §2/§3 FT base) | `models.yaml` |
| `CYFRAGOVPL/PLLuM-4B-instruct-2512` | FP8 vLLM | — | GPU host :8011 | Candidate baseline (Gemma-3-based) | `models.yaml` |
| `CYFRAGOVPL/Llama-PLLuM-8B-instruct-2512` | FP8 vLLM | — | GPU host :8012 | Candidate baseline (Llama-3.1-based) | `models.yaml` |
| `CYFRAGOVPL/PLLuM-12B-instruct-2512` | FP8 vLLM | — | GPU host :8013 | Candidate baseline (Mistral-Nemo-based) | `models.yaml` |
| `google/gemma-4-12B-it` (plain, not QAT) | FP8 vLLM | — | GPU host :8014 | Candidate baseline | `models.yaml` |
| `google/gemma-4-12B-it-qat-q4_0-unquantized` served unquantized | bf16 vLLM | — | GPU host :8016 | Candidate baseline (same weights as §2's FT base, untuned) | `models.yaml` |
| `google/gemma-4-12B-it-qat-q4_0-gguf` (base, no LoRA) | Q4_0 GGUF, llama.cpp | — | GPU host :8017 | Candidate baseline; scored think 72.9%/nothink 68.1% in the old 34-col `RESULTS.html` (own benchmark-harness metric, not comparable to the Claude-graded % elsewhere) | `models.yaml`; `benchmark.md` |
| `google/gemma-4-12B-it-qat-w4a16-ct` | w4a16 compressed-tensors, vLLM | — | GPU host :8018 | Candidate baseline (Google's own int4 release) | `models.yaml` |
| `google/gemma-4-E4B-it` | bf16 vLLM | — | GPU host :8015 | Candidate baseline ("4B" Gemma 4, ~8B w/ per-layer embeddings) | `models.yaml` |
| `Qwen/Qwen3-1.7B` | bf16 vLLM | — | GPU host :8021 | Candidate baseline | `models.yaml` |
| `Qwen/Qwen3-4B` | bf16 vLLM | — | GPU host :8024 | Candidate baseline | `models.yaml` |
| `Qwen/Qwen3.5-2B` (untuned) | bf16 vLLM | — | GPU host :8022 | Candidate baseline (dual role: also §2/§3 FT base) | `models.yaml` |
| `Qwen/Qwen3.5-0.8B` | bf16 vLLM | — | GPU host :8023 | Candidate baseline; scored **0.0%** in the old `RESULTS.html` — "nearly every answer hits max_tokens while still thinking" | `models.yaml`; `benchmark.md` |
| `qwen3.5:2b-q8_0` | Q8_0 GGUF, Ollama | — | local Ollama :11434 | LoRA-deployment-target baseline (training/RUNBOOK.md) | `models.yaml` |
| `gpt-4.1-mini` | API | — | OpenAI (commented out) | **Planned, never run** — entry left commented out in `models.yaml` | `models.yaml` lines 153–157 |

(The DeepSeek `deepseek-flash-*` entries and `gemma-4-12b-q4-{lora,rft,vision,...}` entries are counted under §3/§5,
since they carry a team-trained adapter or are the sanctioned judge, not baseline-only.)

---

## 7. From-scratch

| Model | Format | Who | Where | What for / result | Source |
|---|---|---|---|---|---|
| **Micro100d2examGPT** (`WMTH-100d2exam/Micro100d2examGPT`) | F32 GGUF (lossless), custom `microgpt` llama.cpp backend | hiderr (installation/validation/serving); underlying checkpoint pre-existing (Karpathy MicroGPT architecture) | Custom Ollama 0.34.4 instance `:11435` (validation) + OpenAI-compatible server `:8025` (benchmark) | 123,076,608 params (12 layers, width 768, 12 heads, 24,576-vocab, 512-token context); base (non-instruction-tuned) text-completion model; benchmarked as `micro100d2examgpt` in `models.yaml` — "answers in the style of the keys, not the substance" | `team-training-pipelines.md`; `docs/micro100d2exam-ollama.md`; `models.yaml` |

---

## 8. Retrieval / embedding (RAG)

| Model | Format | Who | Where | What for / result | Source |
|---|---|---|---|---|---|
| `OPI-PIB/PolDense-1B` (pinned rev `2a5d873…`) | dense text embedding, `[query]: ` prefix, CLS pooling | hiderr (services doc, `91207b7a`); JulianVolodia (`--retrieval on` / `matura-rag` harness, `9ed0effa`) | RAG text service `81.85.1.173:8601`; also a standalone experiment `scripts/dense_history_retrieval.py` on `WMTH-100d2exam/epodreczniki-2201` | Article-level dense retrieval over a Polish-Wikipedia Kiwix snapshot (1.72M articles / 1.78M images); PolQA test: right article in top-5 for 88% of questions | `rag_integration/RAG_USAGE.md`; `docs/rag-dense.md`; `COMMUNICATION.md` |
| `sdadas/polish-reranker-roberta-v3` | cross-encoder reranker | same | RAG text service `:8601` | Reranks top candidates (default 50) after dense+BM25 fusion | `COMMUNICATION.md`; `docs/rag-dense.md` (listed there as the *later-experiment* candidate, not yet swapped in for the dense-only baseline) |
| SSCD copy-detection embedding (unnamed specific checkpoint) | image embedding, cosine similarity | same | RAG image service `81.85.1.173:8600` | Exact image search over 1.78M Wikipedia images; "verified match" correct 99% of the time on the test set | `COMMUNICATION.md`; `RAG_USAGE.md` |
| `sdadas/polish-roberta-base-8k` | pretrained language encoder | — | — | **Explicitly NOT the retrieval model** — `docs/rag-dense.md` flags that PolDense-1B (its own CLS pooling + query prefix) is used, not raw RoBERTa mean-pooling on this encoder; named only to head off the confusion | `docs/rag-dense.md` |

---

## 9. Vision projector

| Model | Format | Who | Where | What for / result | Source |
|---|---|---|---|---|---|
| `mmproj-gemma-4-12b-it-qat-q4_0.gguf` (175 MB) | GGUF vision projector | JulianVolodia (`24beec10`, vision-on-llama.cpp) | llama.cpp, GPU host `:8026`/`:8027`/`:8028` + Mac/L40S verification | Lets the Q4_0 GGUF (base and LoRA variants) see exam images; required `-b/-ub 2048` (default 512 crashes on any image >512 tokens) | `benchmark.md`; `l40s-gemma-lora-part1.md` |
| Qwen3.8-27B vision tower (from the HF checkpoint, "deploy mmproj-BF16") | BF16 | Szymon Hajderek | `training/` H100 pipeline | Frozen; images reach the model via the HF-checkpoint vision tower during LoRA training | `training/README.md` |
| Ministral-3 / Qwen3.5-9B vision towers | frozen, unused in this run | Pawel Cyrta | posttrain H100 | vLLM serves both text-only (`language_model_only`); `data_synthetic_image` flagged as an unused future candidate for these VLMs | `src/posttrain/open_models/README.md` |

---

## 10. Uncertainties

- **HyperCLOVA was never found anywhere in the sources or the repo** — grepped fact sheets and `models.yaml`;
  it does not appear to be part of this team's roster (the task brief's example list may have been generic/hypothetical).
- **The 8 models named in the imported EMNLP paper repo** (`src/lostInHistoricalTime/history-matura-llm-evaluation-39B4/`:
  claude-3.7-sonnet, claude-sonnet-4.6, gemini-2.5-pro-preview, gemini-3.1-pro-preview, gpt-4o, gpt-5.4, grok-4,
  grok-4.20) were **not run by this team** — they are pre-existing outputs from an external paper (arXiv 2608.12343,
  two conflicting titles found for it — see `notes-and-latest-pull.md`) that endote folded into the repo as a
  reference dataset (`d2a9e3b5`, `cfe37663`). Listed here for completeness, not counted as "used" by 100d2exam.
- **Two irreconcilable numbers for the same run**: `gemma-4-12b-q4-rft@nothink` is 62.6% per the commit message
  (`40a7d79a`) vs 64.1% re-derived from the same run's embedded data — never reconciled in the repo (`benchmark.md`).
- **`RESULTS.html`'s 34-column leaderboard used the benchmark harness's own judge/metric**, not the Claude-graded
  val-set % used everywhere else in the LoRA workstream — the two are not directly comparable, and the repo itself
  doesn't cross-walk them.
- **The exact SSCD checkpoint name** (image embedding model behind the `:8600` service) was not pinned down to a
  specific HF repo id in the sources read — only "SSCD copy-detection embedding" is named.
- **Whether `polish-reranker-roberta-v3` is actually live in the current RAG service or still a "candidate for a
  later experiment"** is ambiguous: `COMMUNICATION.md` describes it as part of the service's rerank stage, while
  `docs/rag-dense.md` (a different, dense-only experiment) calls it "the agreed Polish reranker candidate for a
  later experiment" — these may describe two different retrieval setups (the always-on RAG service vs. a one-off
  dense-only ablation on a different corpus).
- **Micro100d2examGPT's original training** (as opposed to its GGUF conversion/Ollama installation, done by hiderr)
  is not documented in the sources read for this task — it may trace to the Day-1 `train-llm-from-scratch` /
  MicroGPT workshop material referenced in the outer workspace `CLAUDE.md`, but that link is not confirmed here.
- **`v6-dpo-vision-text`'s base/lineage** ("`runs/v5-all-r16/step-130`") implies an unnamed `v5-all-r16` LoRA run
  that was not otherwise documented in the fact sheets read — a likely intermediate checkpoint not covered above.
- **Whether the Qwen3.8-27B "abl-r16" ablation run is the same physical training job as the main `training/`
  Qwen3.8-27B LoRA run**, or a separate rank-ablation sweep, is stated only as "a separate 'rank ablation' run,
  trained directly on the IQ2_S deploy quantization, not via the Gemma 4 QLoRA pipeline" (`l40s-gemma-lora-part2.md`)
  — the two may or may not share a training script/session.
- **`open_models/README.md`'s Bielik/Ministral/Qwen numbers are closed-item exact match, judge-free** — full
  DeepSeek-graded scores for these finalists are recorded as **not yet run** (no API key on that box) as of the
  sources read; do not treat the 77.0/75.4/72.6 figures as graded-exam percentages.
- **Whether the user explicitly approved the L40S venv `include-system-site-packages` change before it was made**
  is not stated in the sources (flagged in `l40s-gemma-lora-part1.md` itself as a gap) — not model-related, but
  relevant to the base-model serving environment's provenance.
