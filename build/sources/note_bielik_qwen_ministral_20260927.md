# Post-training for the history matura: Bielik, Qwen, Ministral (and Gemma 4)
*Warsaw Model Trainers Hackathon, 26–27 Sept 2026. One NVIDIA H100 80 GB.*

## Goal
Post-train open models to answer the Polish history **matura** (extended level, CKE) with LoRA and QLoRA SFT and
reinforcement learning (GRPO), using Unsloth/TRL (plus NVIDIA NeMo-RL for Gemma). The teacher and judge is
**gemma-4-31B@think**.

## 1. Infrastructure (day 1)
- **Environment `.venv-unsloth`:** torch 2.13 (CUDA 13), transformers 5.17, TRL 1.13, vLLM 0.30, Unsloth 2026.9.
  - Gemma 4 needs transformers ≥ 5.10, but Unsloth pins ≤ 5.5, so `envs/overrides.txt` lifts the pins.
  - Vendor fixes: a vLLM Pixtral patch for Ministral-3, and `flash-linear-attention` for Qwen3.5's DeltaNet layers.
- **Models in `./models/`:**
  - Gemma 4 12B QAT (student), Q4_0 GGUF (deployment) and Gemma 4 31B QAT w4a16 (teacher/judge on vLLM);
  - Bielik-11B v3.0, Ministral-3-8B (bf16 twin of the FP8 release), Qwen3.5-9B.
- **Tracking:** every data build, distillation, training, eval and push reports to ClearML under `HCKT/*`
  (http://81.85.1.173:18080).

## 2. Data (`data/training_datasets/`)
- **Consolidation:** three sources in the same flat layout:
  - synthetic papers (`full-matura-CNT`);
  - real CKE papers 2005–2026 with reworded instructions (`rephrased/structured`);
  - e-textbooks (`epodreczniki/dataset`).
- **Held-out test set, never trained on:** every May paper 2017–2026, June 2020 and the 2023 mock. It is enforced by
  paper id plus an 80-character shingle leak check against the evaluation packs (boilerplate excluded).
- **Result:** 21.8k RL/SFT prompts, 682 validation items, 20.3k textbook Q&A.
- **Teacher distillation with rejection sampling:**
  - 31B@think answers each exam-style question 4 times, and the 31B judge grades each answer against the key and
    rubric. The best answer scoring at least 0.8 is kept.
  - **1,594 verified thinking traces** from 1,884 prompts; 85% of prompts yield one, mean teacher reward 0.78.
- **Reward (`reward.py`):**
  - closed items: exact match against the key;
  - open items and essays: 31B examiner judge, points / max, with partial credit;
  - a truncated or empty answer scores 0; verdicts are cached on disk.

## 3. Open models: SFT → GRPO (night 26→27 Sept)
Three lanes run by a scheduler on one GPU. All use bf16 LoRA r=32, α=64 on the language-model layers only, and the
same Polish exam system prompt.

| Stage | Data | Settings |
|---|---|---|
| **SFT** | `sft_train` 7.9k: 31B answers (graded ≥ 0.8, thinking stripped, ×3) + e-textbook items | lr 1e-4, 1 epoch, loss on the answer only |
| **GRPO** | `grpo_closed` 4.0k closed items; reward = exact match | TRL, DAPO loss, G=8, β=0, lr 2e-5, vLLM colocated; 90 min from SFT, 40 min from base |

**Validation: closed-item exact match, %** (317 closed items out of 682; judge-free, greedy)

| Model | Base | SFT | SFT → GRPO | GRPO from base |
|---|---|---|---|---|
| **Bielik-11B v3** | 13.3 | **77.0** | 74.8 | 71.3 |
| **Qwen3.5-9B** (no-think) | 61.2 | **75.4** | 73.8 | – |
| **Ministral-3 8B** | 8.8 | **72.6** | 62.2 | 69.4 |

On the most exam-like slice (real June 2026 and Dec 2024 papers, n=44): Ministral GRPO-from-base 50.0,
Qwen base 45.5, Bielik SFT→GRPO 43.2.

**Takeaways**
- **SFT gives the biggest gain.** Bielik goes from 13% to 77% and Ministral from 9% to 73%. Much of that is
  learning the CKE answer format (both base models scored 0% on the rephrased real papers).
- **Closed-question GRPO after SFT didn't add anything**, and it hurt Ministral (72.6 → 62.2). GRPO from the base
  model recovers most of the SFT gain on its own.
- **Qwen3.5-9B is the strongest base model**, and on real exam papers its fine-tunes don't beat it yet.
- **Limitation:** exact match measures only closed questions. Open questions and essays, most of the exam's points,
  need the graded bench.

## 4. Published models (HF `WMTH-100d2exam`, private)
| Repo | Val closed EM |
|---|---|
| `Bielik-11B-v3.0-Instruct-matura-sft-lora-distill-epod` | **77.0** |
| `Qwen3.5-9B-matura-sft-lora-distill-epod` | 75.4 |
| `Bielik-11B-v3.0-Instruct-matura-sft-grpo-lora-closed-em` | 74.8 |
| `Qwen3.5-9B-matura-sft-grpo-lora-closed-em` | 73.8 |
| `Ministral-3-8B-Instruct-2512-matura-sft-lora-distill-epod` | 72.6 |
| `Bielik-11B-v3.0-Instruct-matura-grpo-lora-closed-em` | 71.3 |
| `Ministral-3-8B-Instruct-2512-matura-grpo-lora-closed-em` | 69.4 |
| `Ministral-3-8B-Instruct-2512-matura-sft-grpo-lora-closed-em` | 62.2 |

- Each model card lists the method, data, hyperparameters, system prompt and validation scores.
- **Storage fix:** the first pushes uploaded merged bf16 weights (18–23 GB each) and filled the org's ~100 GB
  private quota. `push_hf.py --adapter_only` now uploads only the LoRA adapter (0.3–0.5 GB) plus the card.

## 5. Gemma 4 12B line (status)
- **Done:**
  - Unsloth QLoRA and LoRA on `gemma4_unified` (4-bit, 7 GB, 131M trainable params), smoke-tested;
  - thinking format `<|channel>thought…<channel|>answer` confirmed;
  - 1,594 teacher traces ready.
- **In the team's parallel runs (HF):** `gemma-4-12B-it-qat-matura-history-sft-lora-r32`, a mixed-format bf16 LoRA
  on all sources, and a vision QLoRA variant.
- **Next:** QLoRA SFT on the 31B thinking traces with thinking on, then GRPO. There is a NeMo-RL LoRA GRPO config
  for Gemma, and a judge-reward GRPO on open questions (`grpo_open`, 1.6k) for Bielik.

## 6. Open items
- **Graded exam scores are still missing.** Exam grading must use deepseek-flash-high@think (team rule), and that
  key wasn't on the training box. The finalists to grade on the held-out papers are Bielik SFT, Bielik SFT→GRPO,
  Ministral GRPO and the Qwen base.
- **Reward for open questions:** GRPO with the 31B judge, calibrated against Claude grades first; a Gemma judge was
  about 11 points too lenient.

## Code map
| Path | What |
|---|---|
| `src/posttrain/build_data.py` | data consolidation, held-out rules, leak check |
| `src/posttrain/distill.py`, `reward.py` | teacher distillation and exact-match/judge reward |
| `src/posttrain/unsloth_sft.py` | Gemma SFT (QLoRA/LoRA, thinking) |
| `src/posttrain/open_models/` | Bielik/Qwen/Ministral: `build_data.py`, `sft.py`, `grpo.py`, `eval.py`, `schedule.py`, `push_hf.py` |
| `src/posttrain/serve_judge.sh` | 31B teacher/judge on vLLM :8030 |
