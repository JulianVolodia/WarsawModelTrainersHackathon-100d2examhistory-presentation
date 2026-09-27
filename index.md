---
layout: reveal
title: "Warsaw Model Trainers Hackathon 2026 — zespół 100d2exam: historia rozszerzona"
description: "Co działo się w repo zespołu 100d2exam podczas Warsaw Model Trainers Hackathon (25–27.09.2026): dane, benchmark, harness, trening LoRA, dane syntetyczne, zgłoszenie."
lang: pl
---

<!-- .slide: class="title" -->

# Matura z historii dla modelu językowego

## Zespół 100d2exam · Warsaw Model Trainers Hackathon · 25–27.09.2026

<p class="footnote">wersja robocza — w trakcie weryfikacji faktów</p>

<aside class="notes">Trzy dni, jeden cel: model, który zda maturę rozszerzoną z historii. Oto co się działo w repo.</aside>

---

## Zadanie i zespół

<div class="kpis" markdown="1">
<div markdown="1">
<div class="big-number">6</div>
<p>autorów w git</p>
</div>
<div markdown="1">
<div class="big-number">142</div>
<p>commitów na main</p>
</div>
<div markdown="1">
<div class="big-number">~39 h</div>
<p>od pierwszego do ostatniego commita</p>
</div>
</div>

- Cel: matura rozszerzona z historii (CKE) rozwiązana przez model, odpowiedzi w formacie organizatorów
- Równolegle: dane, benchmark, harness, trening, dane syntetyczne, zgłoszenie
<!-- src: git shortlog -sn main @6d8d52d7: 9 identities = 6 people (JulianVolodia=Volodia, Szymon Hajderek=szymon-hajderek, Olaf Serafin=o-serafin, Pawel Cyrta, endote, hiderr); git rev-list --count main = 142; first commit a0c34b89 25.09 21:14 +0200 → last 6d8d52d7 27.09 10:01 UTC = 38.8 h -->

<aside class="notes">Sześć osób, sto czterdzieści dwa commity w niecałe czterdzieści godzin. Praca szła równolegle w kilku strumieniach.</aside>

---

## Dane: arkusze CKE 2005–2026

- PDF-y arkuszy i kluczy odpowiedzi 2005–2026, deterministyczna ekstrakcja pytań (bez OCR i LLM)
- 40 pakietów ewaluacyjnych 2017–2026 w formacie organizatorów; osobno 27 arkuszy 2005–2016 (655 pytań, 425 wycinków PNG)
- 478 zadań z obrazkami w stylu CKE (Olaf Serafin), pytania i eseje z e-podręczników (Pawel Cyrta)
<!-- src: WarsawModelTrainersHackathon/README.md (docs links: 40 packs 2017–2026; 27 papers 2005–2016, 655 questions, 425 PNG crops); commit 097fed1a (478 image tasks) -->

<aside class="notes">Fundament to prawdziwe arkusze CKE z dwudziestu lat, wyciągnięte deterministycznie, plus zadania obrazkowe i materiał z e-podręczników.</aside>

---

## Benchmark: LLM jako egzaminator

- `bench.py`: egzaminy → modele (API i self-hosted) → sędzia DeepSeek, wynik w punktach CKE
- Osie: harness (`plain` / `matura`), tryb myślenia, obrazki (llama.cpp + projektor)
- Dziesiątki modeli w `RESULTS.html`; wszystko raportowane do ClearML
- Lekcja: Gemma oceniająca Gemmę jest ok. 11 pkt za łagodna — punkt odniesienia to oceny Claude
<!-- src: build/facts/benchmark.md "Summary"; lora_experiments.md "The LLM grader must be checked"; commit 40a7d79a (34 columns) -->

<aside class="notes">Benchmark porównuje modele na prawdziwym formacie egzaminu. Ważne odkrycie: sędzia z tego samego modelu jest za łagodny, więc oceny trzeba było kalibrować.</aside>

---

## Trening 1: Gemma 4 12B na L40S (QLoRA → GGUF)

- Baza QAT Q4_0 → QLoRA NF4 → adapter do llama.cpp; dane SFT z arkuszy i kluczy
- RFT (rejection sampling) z ocenami Claude, tryb myślenia, turniej hiperparametrów
- Wynik na walidacji (ocena Claude): v3-rft-think 44,5 % vs baza z myśleniem 49,2 %; po turnieju r4/r8 50,8 %
- Adaptery na HF: `WMTH-100d2exam/history-lora`
<!-- src: build/facts/l40s-gemma-lora-part2.md "Summary"; 003B-hackaton/CLAUDE.md "LoRA experiments (26.09)"; l40s-results/EXPERIMENTS.md -->

<aside class="notes">Pierwsza linia treningu: Gemma 4 12B na jednym L40S. Hiperparametry okazały się ważniejsze niż same dane RFT, dopiero turniej dał wynik na poziomie bazy.</aside>

---

## Trening 2: noc na H100 — SFT → GRPO

| Model | Baza | SFT | SFT → GRPO |
|---|---|---|---|
| Bielik-11B v3 | 13,3 | **77,0** | 74,8 |
| Qwen3.5-9B | 61,2 | **75,4** | 73,8 |
| Ministral-3 8B | 8,8 | **72,6** | 62,2 |
| Gemma 4 12B (@think) | 57,0 | **70,4** | w toku |

<p class="footnote">exact match na pytaniach zamkniętych z walidacji, %; 8 adapterów opublikowanych na HF (Pawel Cyrta)</p>
<!-- src: build/sources/note_bielik_qwen_ministral_20260927.md (317 closed items); build/sources/notes_gemma_sft_20260927.md (321 items) -->

<aside class="notes">Druga linia: jedna noc na H100. SFT daje największy skok, Bielik z trzynastu do siedemdziesięciu siedmiu procent. GRPO na pytaniach zamkniętych po SFT już nic nie dodaje.</aside>

---

## Pakiet finałowy: Qwen3.8-27B z LoRA

<div class="kpis" markdown="1">
<div markdown="1">
<div class="big-number">42 / 60</div>
<p>LoRA abl-r16 (krok 175)</p>
</div>
<div markdown="1">
<div class="big-number">35 / 60</div>
<p>baza bez LoRA</p>
</div>
</div>

- Pakiet `history-synthetic-c-v4` (37 zadań, 60 pkt), bez klucza — ocena ślepa przez Claude; DeepSeek: 43 vs 42
- Model w kwantyzacji IQ2_S, bez myślenia, bez dostępu do źródeł
<!-- src: 003B-hackaton/CLAUDE.md "Final pack eval + EVAL/ on HF (27.09)"; l40s-results/EVAL/…/README.md -->

<aside class="notes">Na pakiecie w stylu finałowym LoRA daje siedem punktów więcej niż baza w ocenie Claude. To ocena modelu, nie oficjalny klucz.</aside>

---

## Dane syntetyczne i zgłoszenie

<div class="cols" markdown="1">
<div markdown="1">

**Dane syntetyczne**
- 3600 zweryfikowanych zadań wg podstawy programowej
- Wikipedia + DeepSeek: 5010 esejów, 5040 zamkniętych, 5063 otwartych za 22,57 USD

</div>
<div markdown="1">

**Zgłoszenie**
- `harness/matura.py`: pakiet egzaminu → `answers.json`, tekst i obrazki
- Serwer `submission/` (FastAPI): jeden port, jeden zip, jedna odpowiedź
- Usługi: wyszukiwanie w Wikipedii i po obrazku, kolejka benchmarków LoRA

</div>
</div>
<!-- src: 003B-hackaton/CLAUDE.md "Publishing rules", "data_synthetic_extended", "Submission server (27.09)"; COMMUNICATION.md -->

<aside class="notes">Do tego tysiące zadań syntetycznych za dwadzieścia dolarów i serwer, który z pakietu egzaminu robi gotowe zgłoszenie.</aside>

---

## Czego się nauczyliśmy

- SFT daje największy zysk; GRPO na zamkniętych po SFT nic nie dodaje (Ministralowi wręcz szkodzi)
- Hiperparametry LoRA ważyły więcej niż dane RFT
- Każdego sędziego-LLM trzeba skalibrować, zanim się mu uwierzy
- Równoległe agenty w jednym repo = konflikty merge (~5 GPU-godzin w plecy); scalone wagi bf16 zapchały 100 GB na HF
<!-- src: build/sources/notes_gemma_sft_20260927.md "Lessons learned"; note_bielik_qwen_ministral_20260927.md "Takeaways", "Storage fix"; build/facts/l40s-gemma-lora-part2.md -->

<aside class="notes">Lekcje: format i SFT przede wszystkim, sędziów kalibrować, a agentom nie dawać tego samego repo naraz.</aside>

---

## Bonus: model 2B o historii

> „[Konrad] von der Leyen [Alfred Józef] Jagiellon”

> „Przymierze między Polską a Niemcami w 1939 roku, które zostało podpisane przez biskupa Jana Pawła II.”

> „USA rozpadły się na dwa państwa – Konfederację Stanów Zjednoczonych i Królestwo Anglii.”

<p class="footnote">źródło: notes_hiderr.md</p>

<aside class="notes">A na koniec: małe modele też się starały. Dziękuję.</aside>

---

<!-- .slide: class="section-title" -->

## Aneks (poza 2 minutami)

---

## Jak powstała ta prezentacja

- Stan repo zespołu z 27.09.2026 (commit `6d8d52d7`) + notatki zespołu
- 11 subagentów Sonnet napisało arkusze faktów ze źródłami (po jednym na obszar), krytyk sprawdził pokrycie
- Opus pisze slajdy; Sonnet weryfikuje każdą liczbę; Opus poprawia
- Wszystko w repo: `build/README.md`, `build/facts/`, `build/workflows/`

<aside class="notes">Metoda i wszystkie pliki pośrednie są w katalogu build.</aside>

---

## Źródła

- Repo zespołu: `Endote/WarsawModelTrainersHackathon`
- Modele i dane: Hugging Face `WMTH-100d2exam`
- Prior work: „Lost in Historical Time? A Polish History Matura Benchmark for Large Language Models”, arXiv 2608.12343
- Ta prezentacja i jej kuchnia: `JulianVolodia/WarsawModelTrainersHackathon-100d2examhistory-presentation`
