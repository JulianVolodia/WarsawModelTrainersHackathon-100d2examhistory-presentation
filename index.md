---
layout: reveal
title: "Zespół 100d2exam — modele i dane"
description: "Warsaw Model Trainers Hackathon 2026, historia rozszerzona: jakie modele użyliśmy i ile mieliśmy danych."
lang: pl
---

<!-- .slide: class="title" -->

# Zespół 100d2exam

## Matura rozszerzona z historii · modele i dane · 25–27.09.2026

---

## Modele, które trenowaliśmy

| Model | Metoda | Wynik (ocena modelu) |
|---|---|---|
| Gemma 4 12B QAT | QLoRA, RFT, SFT, GRPO | SFT@think 70,4 % vs baza 57,0 % |
| Bielik-11B v3.0 | SFT, GRPO | 13,3 → 77,0 % |
| Qwen3.5-9B | SFT, GRPO | 61,2 → 75,4 % |
| Ministral-3 8B | SFT, GRPO | 8,8 → 72,6 % |
| Gemma 3 12B | SFT → GRPO | 45,5 → 68,2 % |
| Qwen3.8-27B IQ2_S | LoRA r16 | 42/60 vs baza 35/60 |

<p class="footnote">exact match na pytaniach zamkniętych z walidacji; Qwen3.8: pakiet finałowy, ocena Claude. Też: Qwen3.5-2B (LoRA), Micro100d2examGPT 123M od zera.</p>
<!-- src: build/sources/note_bielik_qwen_ministral_20260927.md; build/sources/notes_gemma_sft_20260927.md; 003B-hackaton/CLAUDE.md "Final pack eval" -->

---

## Modele pomocnicze i benchmark

- **Nauczyciel i sędzia:** Gemma 4 31B (destylacja), DeepSeek V4.1 Flash (sędzia, dane syntetyczne), Claude Opus 5.5 (ocena referencyjna)
- **RAG:** PolDense-1B + polski reranker (Wikipedia), SSCD (obrazy)
- **Benchmark:** Bielik 1.5B–11B, PLLuM 4B–12B, Qwen3 / 3.5 / 3.8 (0.8B–35B), Gemma 3 i 4 (E4B–31B), Ministral 8B/14B, GPT-4.1 mini, Hy-MT2 1.8B
<!-- src: benchmark/models.yaml -->

---

## Ile mieliśmy danych

| Zbiór | Ilość |
|---|---|
| Arkusze CKE 2005–2026 | 67 arkuszy, 2 098 pytań |
| Pakiety ewaluacyjne | 40 (2017–2026) + 27 arkuszy 2005–2016 |
| Zadania z obrazkami | 478 |
| E-podręczniki | 20,3 tys. pytań i odpowiedzi |
| Syntetyczne (podstawa programowa) | 3 600 |
| Syntetyczne z Wikipedii | 15 113 (eseje, zamknięte, otwarte) |
| Zbiór treningowy H100 | 21,8 tys. promptów, 1 594 ślady nauczyciela |

<!-- src: WarsawModelTrainersHackathon/README.md; commit 097fed1a; note_bielik_qwen_ministral_20260927.md; 003B-hackaton/CLAUDE.md data_synthetic_extended (5010+5040+5063) -->
