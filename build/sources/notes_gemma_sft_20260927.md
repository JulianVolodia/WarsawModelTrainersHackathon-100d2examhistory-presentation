# Post-training Gemma for the history matura (2026-09-27)

**Goal:** make Gemma 4 12B (QAT, deployed as Q4_0 GGUF) pass the Polish history matura (extended level) using
LoRA/QLoRA SFT and GRPO.

## Pipeline (`src/posttrain/`)
- One package: data build → teacher distillation → SFT → GRPO → export (GGUF) → eval → HF publish
- Unsloth + TRL for SFT/GRPO; NVIDIA NeMo-RL set up and tested for Gemma 4 LoRA GRPO
- Every run tracked in ClearML (`HCKT/*`), every model in `./models/`

## Data (~22k SFT rows, strict held-out)
- Real CKE exams 2005–2026, including 624 answer keys for 2005–2016 extracted from PDFs by the 31B model
- Rephrased real papers, synthetic full papers, synthetic image tasks, 20k textbook questions
- Held out: every May paper 2017–2026, June 2020 and the 2023 mock, plus an 80-character leak check

## Teacher distillation
- gemma-4-31b in thinking mode answered each question 4 times; a 31B judge kept the best
- 1,589 verified reasoning traces (84% keep rate), plus full essays

## Training (one H100, three parallel runs overnight)
- Gemma 4 12B SFT (bf16 LoRA r=32), with thinking-mode traces
- Gemma 4 vision SFT (QLoRA, real exam images)
- Gemma 3 12B SFT, then GRPO on closed questions (reward = 0.2·format + 0.8·exact match)
- Gemma 4 SFT → GRPO on closed questions (in progress)

## Results: closed-question exact match on validation (321 items)

| Model | Score |
|---|---|
| **Gemma 4 SFT @think** | **70.4** |
| Gemma 3 SFT → GRPO (step 25) | 68.2 |
| Gemma 3 SFT | 66.4 |
| Gemma 4 base @think | 57.0 |
| Gemma 3 base | 45.5 |

- SFT adds about 20 points over each base model; thinking helps most on real exam items

## Published on Hugging Face (`WMTH-100d2exam`, private)
- `gemma-4-12B-it-qat-matura-history-sft-lora-r32` (top model, includes a llama.cpp GGUF)
- the vision SFT, Gemma 3 SFT, and Gemma 3 SFT→GRPO adapters

## Lessons learned
- Gemma 4 is new, so library support is thin: Unsloth + vLLM, FlashAttention (head dim 512) and NeMo-RL each needed fixes
- Validation loss rose while exact match held steady, so loss on key wording isn't the exam score
- Parallel agents editing the same repo caused merge conflicts, which cost ~5 GPU-hours overnight

## Still open
- Full exam grading with DeepSeek (needs the API key)
- Gemma 4 SFT→GRPO results
- Retraining without the newly deprecated synthetic data sources
