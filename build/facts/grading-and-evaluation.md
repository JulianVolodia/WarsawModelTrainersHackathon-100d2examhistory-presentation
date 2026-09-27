# Grading and evaluation

## Summary

This area covers three linked things in the WarsawModelTrainersHackathon repo: (1) deterministic,
source-preserving extraction of the official CKE grading keys (answer/scoring PDFs, 2017–2026) into
machine-readable rubrics; (2) organizer-format evaluation packs (solver-input exams, no answers) for
2017–2026 and, separately, 2005–2016; and (3) the machinery for judging a model's answers — an
LLM judge inside the benchmark harness (DeepSeek `deepseek-flash`, i.e. DeepSeek-V4.1-Flash), an
independent "Astra" (Codex `gpt-6-astra`) grader for saved answers, and Claude subagents used as the
project's calibration reference because the Gemma self-grader was found to be too lenient. All of this
is built with deterministic Python (pdfplumber/pypdf/pymupdf), not model calls, for the extraction and
packaging steps; model calls are used only for the actual grading/judging step, which the team
consistently treats as provisional pending human adjudication. A live example of that caution: a P0
audit on 27.09 found a specific item (May 2026 Q24) receiving full marks from two different graders
despite a semantically wrong image interpretation, which triggered a human-adjudication gate
(`semantics.py`) before any grade counts as a training reward.

## Timeline

- **26.09.2026 14:37 +0200** — commit `6333bb34` (endote): "Complete visual source graph exports and extraction review tooling." Source: `git log` in `WarsawModelTrainersHackathon`.
- **26.09.2026, "Blind grading by Claude subagents"** — 12 Claude subagents blind-grade 499 answers (val set: base/base_think/A/B × 111, plus 55 RFT samples) as CKE examiners, without seeing the variant name or Gemma's score. Finding: Gemma grader is ~11 points too lenient (85% exact agreement, differs higher 67×, lower 9× vs Claude). Source: `l40s-results/EXPERIMENTS.md` lines 75–96; same numbers restated in `WarsawModelTrainersHackathon/lora_experiments.md` lines 27–41 ("The LLM grader must be checked").
- **26.09.2026 16:40 +0200** — commit `53b6d29d` (JulianVolodia, co-authored Claude Opus 5.5): "DeepSeek grader calibration vs Claude on val answers (728 items)" — `grader_calibration/`: DeepSeek (`deepseek-flash`) grades of answers Claude already graded (val, v3, v3t batches); 89.8% exact agreement, full-points precision 0.88 / recall 0.94; v3-rft-think step 63: 43.0% (DeepSeek) vs 44.5% (Claude); cost $0.10. Source: `git show 53b6d29d`; detail also in `l40s-results/EXPERIMENTS.md` lines 147–171 ("DeepSeek as grader: calibration against Claude", ~14:30 UTC).
- **26.09.2026 17:20 +0200** — commit `cfe37663` (endote): "eval 2017-2026 + grading set." Source: `git log -- docs`.
- **26.09.2026 19:30 +0200** — commit `b5b70364` (Szymon Hajderek, co-authored Cursor): "Benchmark: exam packages (history 2023 mock), rubric packaging, eval-2017-2026/mock configs, ssh serve helper." Source: `git show b5b70364`.
- **26.09.2026 22:06 +0200** — commit `610ed6fa` (endote): "gemma4-rft-step51-latest16-v1 40 matura results" (1,771 files, +315,432/−276 lines: adds e.g. `tests/test_matura_retries.py`, first graded 2005-exam JSON under `output/`). Source: `git show 610ed6fa`.
- **26.09.2026 22:19 +0200** — commit `26476983` (endote): "matura-histoty-2005-2016" (1,138 files, +291,594 lines: rendered PNG pages for 2005–2016 grading keys). Source: `git show 26476983`.
- **26.09.2026** — commit `d2a9e3b5` (endote): "paper + codes" (00:21 +0200, listed for completeness though timestamp is technically 26.09 00:21). Source: `git log`.
- **27.09.2026 00:42 +0200** — commit `f3ba345a` (endote): "harness automatic eval and improvement" (15,157 files, +10,964,126/−171 lines: adds `tests/test_history_v2.py`, `test_history_v2_processor.py`, `test_rubric_essays.py`, `test_synthetic_essays.py`). Source: `git show f3ba345a`.
- **27.09.2026 00:49 +0200** — commit `f51268f9` (endote): "evals..." (361 files: essay-generation v7 train sets, `src/posttrain/history_v2/data.py` edits). Source: `git show f51268f9`.
- **27.09.2026 01:18 +0200** — commit `eb3283bc` (endote): "benchmark _+ harness workings" (1,380 files, +84,670/−137 lines: adds `tests/test_grade_saved_exams.py`, `tests/test_history_semantics.py`, `tests/test_task_workflow.py`; this is also the commit `git log` attributes to `docs/essay-grading-fixes-2026-09-27.md` and `src/posttrain/history_v2/semantics.py` / `SEMANTIC_REVIEW.md`). Source: `git show eb3283bc`; `git log --format --oneline -- <paths>`.
- **27.09.2026 03:16 +0200** — commit `87283d60` (endote): "commit eb3283bc fix" (6,110 files, +4,126,474/−88 lines: adds `tests/test_planned_essays.py`, extends `tests/test_history_v2.py`). Source: `git show 87283d60`.
- **27.09.2026, dated docs** — `docs/essay-grading-fixes-2026-09-27.md` and `docs/grading-semantics-p0-2026-09-27.md` both dated 27.09 in filename/content; the P0 audit package is `output/feedback/semantic-audit-2026-09-27-v1/` (38 sampled cases). Source: file paths + `output/feedback/semantic-audit-2026-09-27-v1/summary.json`.
- **27.09.2026 (final pack)** — "final pack C-v4, Qwen3.8-27B IQ2_S: LoRA abl-r16 step-175 vs base" blind grading: Claude 3 subagents (with images) 42/60 (70.0%) vs base 35/60 (58.3%); DeepSeek flash high (text only) 43/60 (71.7%) vs base 42/60 (70.0%). Source: `l40s-results/EXPERIMENTS.md` lines 261–272 (also referenced in `003B-hackaton/CLAUDE.md` "Final pack eval").

## Key numbers

| Label | Value | Source |
|---|---:|---|
| Grading-key exams with full extracted evidence (2017–2026) | 40 exams | `data/grading-2017-2026/README.md`; `output/grading-2017-2026/validation.json` (`exams: 40`) |
| Scored items covered by those grading keys | 1,400 items | `data/grading-2017-2026/README.md`; `output/grading-2017-2026/validation.json` (`items: 1400`) |
| Grading-key PDF pages retained | 967 pages | `docs/evaluation-grading-datasets.md`; `output/grading-2017-2026/validation.json` (`pages: 967`) |
| Native characters retained from grading PDFs | 1,807,335 | `docs/evaluation-grading-datasets.md`; `output/grading-2017-2026/validation.json` |
| Positioned lines retained | 38,409 | `docs/evaluation-grading-datasets.md`; `output/grading-2017-2026/validation.json` |
| Essay topics (grading side) | 164 topic alternatives | `data/grading-2017-2026/README.md`; `output/grading-2017-2026/validation.json` (`essay_topics: 164`) |
| Essays covered (grading side) | 40 essays: 24×12-pt holistic, 12×15-pt analytic, 4×20-pt holistic | `docs/evaluation-grading-datasets.md` |
| Items with conflicting/`requires_review` score evidence | 21 items | `docs/evaluation-grading-datasets.md`; `output/grading-2017-2026/validation.json` (`source_review_items: 21`, `issues: 21`) |
| Independent page re-renders for validation | 80, all byte-identical | `docs/evaluation-grading-datasets.md`; `output/grading-2017-2026/validation.json` (`page_rerenders: 80`) |
| Evaluation packs (solver input), 2017–2026 | 40 exams, 1,412 numbered questions/subparts, 1,400 scored items | `docs/evaluation-datasets.md`; `data/evaluation-2017-2026/README.md` |
| PNG image crops, evaluation packs 2017–2026 | 904 crops | `data/evaluation-2017-2026/README.md` |
| Older-format evaluation packs, 2005–2016 | 27 exams, 655 scored items, 425 PNG crops | `data/evaluation-2005-2016/README.md` (also cited in `003B-hackaton/CLAUDE.md` task brief) |
| Jointly-scored legacy tasks kept grouped | 10 tasks / 22 numbered subparts | `docs/evaluation-datasets.md` |
| Known question-max vs. rubric-max conflicts (specific) | April 2020 trial Q21 (1 vs 2), June 2025 old-formula Q16 (1 vs 2), January 2026 trial Q23 (2 vs 1) | `docs/grading-extraction.md` table; confirmed in `docs/evaluation-grading-datasets.md` |
| Grading-key sample audit (pre-corpus pilot) | 5 PDFs, 148 pages; 147/147 alignment on the 4 extended-level samples (2016/2022/2024/2026), 0/37 on the 2010 basic sample | `output/grading-key-audit/README.md` |
| Essay acceptance floor (dataset selection, not CKE pass mark) | 10/15 inclusive score floor, 300-word length floor | `docs/essay-grading-fixes-2026-09-27.md` |
| Focused essay-grading regression suite | 28 tests pass | `docs/essay-grading-fixes-2026-09-27.md` |
| Essay-gate combinatorial check | 108 legal score combinations checked; 55 combinations totaling ≥10 passed the gate | `docs/essay-grading-fixes-2026-09-27.md` |
| Essay grader/reviewer model | DeepSeek `deepseek-flash-high@think` (author and reviewers share the same base model, different requests) | `docs/essay-grading-fixes-2026-09-27.md` |
| P0 semantic audit sample | 38 cases sampled from a population of 1,630 graded items (baseline/default-harness/RFT archives) | `output/feedback/semantic-audit-2026-09-27-v1/summary.json` |
| Claude-vs-Gemma grading calibration (val v2, 111 tasks/128 pts) | base_think 53.9% Gemma vs 49.2% Claude; base 50.8% vs 39.1%; LoRA A 51.6% vs 37.5%; LoRA B 44.5% vs 35.2% | `l40s-results/EXPERIMENTS.md` lines 79–85; `WarsawModelTrainersHackathon/lora_experiments.md` lines 31–36 |
| Claude/Gemma exact agreement | 85% (Gemma higher 67×, lower 9× when they differ) | `l40s-results/EXPERIMENTS.md`; `lora_experiments.md` |
| DeepSeek/Claude agreement (728 answers) | 89.8% exact points; mean |diff| 0.10 pts; full-points precision 0.88 / recall 0.94; cost $0.10 | `l40s-results/EXPERIMENTS.md` lines 147–171; commit `53b6d29d` |
| First Astra (`gpt-6-astra`/medium) full-mock grade | 26/60 (43.33%): items 1–25.2 = 24/45, essay 26 = 2/15 | `harness/GRADING.md` |
| Compact-prompt token savings (Astra micro-eval baseline) | 9,611 of 21,900 input tokens saved (43.9%); 27/37 questions fit an answer reserve, incl. 7/14 text-only | `harness/GRADING.md` |
| Grading-consistency incident | Same May 2026 essay graded 6/15 and then 12/15 by the same DeepSeek dispatcher on repeat; June 2020 answer differed by 1 point on repeat | `harness/GRADING_CONSISTENCY.md` |
| Grading contract version in use | `criteria-repeat-v3` (harness/grading_contract.py) | `harness/grading_contract.py`; `harness/GRADING_CONSISTENCY.md` |
| Final-pack C-v4 blind grading (27.09) | abl-r16 step-175: Claude 42/60 (70.0%), DeepSeek 43/60 (71.7%); base IQ2_S: Claude 35/60 (58.3%), DeepSeek 42/60 (70.0%) | `l40s-results/EXPERIMENTS.md` lines 261–272 |

## Components

- `WarsawModelTrainersHackathon/scripts/extract_gradings.py` — deterministic extractor of official CKE grading-key PDFs into `gradings.jsonl` + `grading-exams.jsonl`; no model/network calls; validated on the 33-exam/1,172-record benchmark snapshot. (`docs/grading-extraction.md`)
- `WarsawModelTrainersHackathon/scripts/grading_context.py` — resolves a question ID into its authoritative grading text + inherited exam-wide policies + warnings; verifies output hashes; does not grade or resolve point conflicts itself. (`docs/grading-extraction.md`, `scripts/grading_context.py`)
- `WarsawModelTrainersHackathon/scripts/grading-overrides.json` — hash-bound manual mappings/notes for grading-key PDFs with irregular layouts (e.g. June 2018 table continuation, 2019/2020/2025/2026 mis-numbered essays). (file itself)
- `WarsawModelTrainersHackathon/scripts/evaluation-grading-overrides.json` — same idea for the 2017–2026 evaluation/grading collection build (2017 answer-table layout, misnumbered 2017 old-format essay, Nowa Era anchors). (file itself)
- `WarsawModelTrainersHackathon/scripts/evaluation-2005-2016-boundaries.json` — per-exam manually reviewed task-boundary/heading notes for the older 2005–2016 layout family (e.g. clarifying where task instructions start). (file itself)
- `WarsawModelTrainersHackathon/scripts/build_grading_datasets.py` — builds the full grading-evidence packs (`data/grading-2017-2026/`) from PDFs + the solver-pack manifest; refuses to overwrite delivered packs. (`docs/evaluation-grading-datasets.md`)
- `WarsawModelTrainersHackathon/scripts/build_evaluation_datasets.py` — builds organizer-format solver-input packs (`data/evaluation-2017-2026/`) from current local PDFs; no answers, no model calls. (`docs/evaluation-datasets.md`, file docstring)
- `WarsawModelTrainersHackathon/scripts/validate_grading_datasets.py` / `validate_evaluation_datasets.py` — independent re-validation + HTML review-gallery generation for the two dataset families; re-renders pages and compares bytes. (`docs/evaluation-grading-datasets.md`)
- `WarsawModelTrainersHackathon/scripts/grading_archive.py` — writes the immutable, complete per-exam grading archive (`source.pdf`, `pages/*.png`, `full-text.txt`, `source-document.json`), kept separate from heuristic rubric labels. (file docstring)
- `WarsawModelTrainersHackathon/gradings.schema.json` — schema "Source-preserving grading extraction record" (per-question grading record contract).
- `WarsawModelTrainersHackathon/grading-exams.schema.json` — schema "Grading source policies, provenance and structural completeness" (exam-level policy/completeness contract).
- `WarsawModelTrainersHackathon/data/grading-2017-2026/` — 40 exam dirs + `manifest.json` + `README.md`: full grading evidence (`grading.json`, `source.pdf`, `pages/page-NNN.png`, `full-text.txt`, `source-document.json`) per exam, 2017–2026.
- `WarsawModelTrainersHackathon/data/evaluation-2017-2026/` — 40 exam dirs (+ `evaluation-runs/`) + `README.md`: organizer-format solver-input packs (`exam.json`, `answers-template.json`, `README.md`, `images/`), 2017–2026.
- `WarsawModelTrainersHackathon/data/evaluation-2005-2016/` — 27 exam dirs + `README.md`: same solver-input pack format for the older 2005–2016 layout family.
- `WarsawModelTrainersHackathon/output/grading-key-audit/` — `README.md` + `sample-inventory.jsonl`: the pre-corpus design audit of 5 sample grading-key PDFs (148 pages).
- `WarsawModelTrainersHackathon/output/grading-2017-2026/` — per-exam HTML review pages + `validation.json`/`index.html` gallery for the grading collection.
- `WarsawModelTrainersHackathon/output/evaluation-2017-2026/`, `output/evaluation-2005-2016/` — per-exam JSON audit files + `gallery/`, `manifest.json`, `validation.json` for the two evaluation-pack families.
- `WarsawModelTrainersHackathon/benchmark/exams_packages/history-2023-mock-v1/` — the reference/sample organizer-format pack that all packaging is checked against.
- `WarsawModelTrainersHackathon/harness/GRADING.md` + `harness/grading.py` — independent Astra grader (`gpt-6-astra`, `medium` effort) run via the Codex CLI over saved solver answers, using the extracted CKE key + original images; does not rewrite answers or feed the key to the solver.
- `WarsawModelTrainersHackathon/harness/prepare_grading_packet.py` — builds a portable, self-contained, hash-verified packet (`packet.json`, `judge-instructions.md`, images, grading evidence) for handing to an external judge (Astra); makes no model calls itself.
- `WarsawModelTrainersHackathon/harness/GRADING_CONSISTENCY.md` + `harness/grading_consistency.py` — audits repeat-grading disagreement on saved runs without new model calls; defines the `criteria-repeat-v3` contract (in `harness/grading_contract.py`).
- `WarsawModelTrainersHackathon/harness/GRADE_SAVED_EXAMS.md` + `harness/grade_saved_exams.py` — versioned batch Astra grading of archived multi-exam solver runs, one fresh Codex session per exam; every dispatched version is immutable/append-only.
- `WarsawModelTrainersHackathon/harness/failure_categories.py`, `feedback_taxonomy.py`, `categorize_feedback.py` — bilingual PL/EN taxonomy (`history-taxonomy-v3`, `failure-categories-v1`) for labelling *why* an answer failed (wrong-entity, chronology, visual-misreading, etc.) without changing scores.
- `WarsawModelTrainersHackathon/src/posttrain/history_v2/semantics.py` + `SEMANTIC_REVIEW.md` — the P0 human-adjudication gate: proposed grades are treated as proposals only; a named human must accept/adjudicate before a grade becomes a training reward.
- `WarsawModelTrainersHackathon/src/posttrain/history_v2/semantic_audit.py` — samples reproducible full/partial/zero-grade cases stratified across archives and modality for the P0 review.
- `WarsawModelTrainersHackathon/benchmark/bench.py` — the benchmark runner; its LLM-judge path (`judge_exam`/`parse_judgement`) asks the judge model for one strict per-question JSON score, retries with the validation error on malformed output, and enforces `0 ≤ score ≤ max` and `total == sum`.
- `WarsawModelTrainersHackathon/benchmark/models.yaml` — judge default `deepseek-flash` (= DeepSeek-V4.1-Flash); named variants `deepseek-flash-low/-high/-nothink` set effort/thinking.
- `WarsawModelTrainersHackathon/tests/test_matura_grading.py`, `test_grading_extraction.py`, `test_grading_datasets.py`, `test_grading_consistency.py`, `test_grade_saved_exams.py`, `test_answer_review.py`, `test_history_semantics.py`, `test_evaluation_datasets.py` — regression suites for, respectively: Astra grading evidence/safeguards; deterministic key extraction; dataset build/packaging; repeat-grading audit; batch Astra grading; two-call answer-review ablation; the P0 semantic gate (`context_for`, `grade_for`, `require_review`); organizer-pack packaging fidelity.

## Decisions, incidents and lessons

- **Gemma-as-judge self-preference risk, flagged before the calibration work.** `003B-hackaton/HANDOFF_REVIEW_FABLE.md` notes the val-evaluation grader was "the same model family (the Q4_0 base in thinking mode)," creating a self-preference risk, "especially after RFT, where the adapter learns the base's style," and suggests a panel of graders or pairwise comparison as a fix.
- **Gemma confirmed too lenient (26.09).** Blind grading of 499 answers by 12 Claude subagents found the Gemma self-grader ~11 points too lenient on average, with 85% exact agreement and asymmetric disagreement (Gemma higher 67× vs lower 9×); crucially, its *leniency differs by variant*, which flips model rankings (Gemma ranks base > A > base_think; Claude ranks base_think > base > A). Decision: "Claude is the reference grader for model selection." (`l40s-results/EXPERIMENTS.md`, `lora_experiments.md`)
- **Data problems found through grading, not before it.** The Claude/Gemma comparison also surfaced empty rubrics and stray curriculum text in 7 key answers, fixed in `build_sft_data.py` data v2.1 (commit `c0c484e` on main). (`l40s-results/EXPERIMENTS.md` line 96)
- **DeepSeek validated as a cheap proxy grader, with caveats.** 89.8% exact-point agreement with Claude on 728 answers for $0.10 total; "its ranking agrees with Claude's on the big picture… among the LoRAs (a spread of 2–3 points) the order changes, so final comparisons should still go through Claude or both graders." (`l40s-results/EXPERIMENTS.md` lines 147–171; commit `53b6d29d`)
- **Grading is not deterministically reproducible even from the same model.** The 27.09 consistency audit found the *same* May 2026 essay scored 6/15 then 12/15 by the same DeepSeek dispatcher on separate runs, and a June 2020 answer differed by 1 point — "a run-to-run score difference is therefore not necessarily a solver gain." Response: adopt two independent full-exam grading passes per run (frozen inputs, no cross-visibility) plus a `criteria-repeat-v3` evidence contract (candidate/rubric quotations, contradiction checks, explicit word-count fields for length criteria) and withhold any item score on disagreement — "no averaging or best-of-N." (`harness/GRADING_CONSISTENCY.md`)
- **P0 grading-semantics incident, May 2026 Q24 (27.09).** Two different automatic graders (default-harness run and RFT regrading) both gave 3/3 for an answer that misreads the exam's illustration — describing "pouring" from a cap rather than a Soviet figure (Brezhnev) extinguishing a "Czech spirit" candle with a helmet (the official key, symbolising the 1968 Prague Spring intervention) — and the answer omits the Prague Spring context entirely. "Full credit is unsupported by the claimed graphical interpretations… Exact partial credit remains pending a human's application of the official conditional rubric." (`docs/grading-semantics-p0-2026-09-27.md`)
- **Response to the Q24 incident: a hard human-adjudication gate.** `semantics.py` now requires a *named human* reviewer's criterion-level, evidence-bound sign-off before any numeric grade can be used as a training reward; agreement between automatic graders is explicitly not accepted as a substitute ("Known semantic issues such as May 2026 Q24 are not cleared by repeated agreement"). No training or live regrading was launched off unreviewed scores as of 27.09. (`docs/grading-semantics-p0-2026-09-27.md`, `src/posttrain/history_v2/SEMANTIC_REVIEW.md`)
- **Essay-grading pipeline fixes (27.09).** Separated informational `notes` from `blocking_issues` so discarding an irrelevant source isn't itself a rejection reason; removed a redundant "coherence-3/3" acceptance gate (coherence still scores 0–3 inside the 15-pt rubric); confined `needs_review` to genuine historical uncertainty rather than style nitpicks; required a second factual review to run *without* seeing the key/sources/prior score, to reduce anchoring. One reviewer accusation (`wik-po_1945-essay-LVII-037-1`) was itself found wrong and overturned with a cited source (IPN bulletin, Sept. 2016). "No LoRA training or Hugging Face publication has been performed" off this essay data as of the doc's writing. (`docs/essay-grading-fixes-2026-09-27.md`)
- **Known source conflicts are preserved, never silently resolved.** Both the grading-extraction pipeline and the dataset build explicitly refuse to guess which of two conflicting printed point values is correct (e.g. April 2020 Q21, June 2025 Q16, January 2026 Q23) — both readings are retained and flagged `needs_review`/`requires_review` for a human. (`docs/grading-extraction.md`, `docs/evaluation-grading-datasets.md`)
- **Contamination caveat stated up front.** The 2017–2026 (and by extension 2005–2016) evaluation packs are public past exams that may overlap model pretraining data; the docs explicitly say "their schema matches the holdout contract, but they do not establish an uncontaminated holdout." (`docs/evaluation-datasets.md`)

## People

- **endote** — wrote most of the grading/evaluation dataset commits (`cfe37663` eval 2017-2026 + grading set; `26476983` matura-histoty-2005-2016; `610ed6fa` 40 matura results; `f3ba345a` harness automatic eval and improvement; `f51268f9` evals; `eb3283bc` benchmark + harness workings, which includes the semantic-review/essay-grading-fix work; `87283d60` follow-up fix; `d2a9e3b5` paper + codes). Source: `git log`.
- **JulianVolodia** (= Volodia, owner of the `l40s-results`/`003B-hackaton` notes) — ran the DeepSeek-vs-Claude grader calibration (commit `53b6d29d`, co-authored with Claude Opus 5.5), the Claude-subagent blind-grading exercise, the P0 semantic audit and the 27.09 final-pack C-v4 blind evaluation (Claude subagents + DeepSeek). Source: `git show 53b6d29d`; `l40s-results/EXPERIMENTS.md`.
- **Szymon Hajderek** (= szymon-hajderek) — built the benchmark exam-package/rubric-packaging plumbing and eval-2017-2026/mock configs (commit `b5b70364`, co-authored with Cursor). Source: `git show b5b70364`.
- **Claude subagents** — used as the project's *reference* grader (not a person, but treated as the calibration ground truth against Gemma and DeepSeek) for val-set and final-pack blind grading. Source: `l40s-results/EXPERIMENTS.md`.
- No other git author name appears in the grading/evaluation-specific commits or docs read for this fact sheet (Pawel Cyrta, Olaf Serafin/o-serafin and hiderr were not found attributed to grading/evaluation work in the files covered here — see Gaps).

## Open issues / limitations

- 21 grading items across the 40-exam 2017–2026 collection remain `requires_review` for conflicting printed score evidence; three of these conflict with the exam's own item maximum (April 2020 Q21, June 2025 Q16, January 2026 Q23). (`docs/evaluation-grading-datasets.md`)
- `extraction-report.json`/validation "passed: true" explicitly does **not** certify grading accuracy: `full_text_verified` stays null and `grading_accuracy_verified` is false by design. (`docs/grading-extraction.md`)
- The May 2026 Q24 semantic error (P0) is confirmed but unresolved as of 27.09 — "The P0 semantic-accuracy concern remains open until the human adjudications are complete." Four control examples and four older baseline exams with incomplete grading output are also still pending human review. (`docs/grading-semantics-p0-2026-09-27.md`)
- Essay-generation counts are explicitly not frozen in the docs ("this report intentionally does not freeze a live count" — `docs/essay-grading-fixes-2026-09-27.md`); the fact sheet therefore cannot state a current essay-dataset size beyond the earlier `history-500-v6/v7` run names seen in commits.
- The 2005–2016 evaluation packs (27 exams) are a separate, older-format family from the 40-exam 2017–2026 collection; **no equivalent full grading-evidence pack** (`data/grading-2005-2016`) was found for 2005–2016 in this sweep — grading appears to only have full evidentiary packaging for 2017–2026 (see `003B-hackaton/CLAUDE.md`'s note that `extract_questions.py` only handles 2018–2026 for the separate solver-question pipeline).
- Public 2017–2026 (and 2005–2016) papers may overlap model training data; the docs state this is not an uncontaminated holdout. (`docs/evaluation-datasets.md`)
- `harness/grading.py`'s Astra path and `benchmark/bench.py`'s DeepSeek-judge path are explicitly two separate, non-interoperable systems ("This packet has its own versioned format. It is not an input to the older `harness/grading.py judge` command…" — `docs/evaluation-grading-datasets.md`).

## Good quotes or slide-worthy details

- "Gemma is ~11 points too lenient." — and it flips model rankings: Gemma says base > A > base_think; Claude says base_think > base > A. (`l40s-results/EXPERIMENTS.md`)
- "A run-to-run score difference is therefore not necessarily a solver gain" — the *same* essay graded 6/15 and 12/15 by the same grader on repeat. (`harness/GRADING_CONSISTENCY.md`)
- The official May 2026 Q24 answer key: a Soviet-uniformed figure (Brezhnev) extinguishing a candle labelled "Czech spirit" with a military helmet — symbolising the 1968 Prague Spring intervention — while the model's graded-as-perfect answer instead invented a "pouring" action and omitted Prague Spring entirely. (`docs/grading-semantics-p0-2026-09-27.md`)
- "Numeric grader results are proposals" — no automatic grade counts as a training reward without a named human's sign-off. (`docs/grading-semantics-p0-2026-09-27.md`)
- Deterministic-extraction reproducibility is bit-exact: re-running the extractor and doing `cmp` on the two `gradings.jsonl` outputs is offered as a literal reproducibility check. (`docs/grading-extraction.md`)
- 80 independently re-rendered grading-key pages matched their originals byte-for-byte. (`docs/evaluation-grading-datasets.md`, `output/grading-2017-2026/validation.json`)
- A reviewer's own accusation of factual error was itself found wrong and overturned with a cited primary source — grading the graders. (`docs/essay-grading-fixes-2026-09-27.md`)

## Sources consulted

- `WarsawModelTrainersHackathon/docs/grading-extraction.md`
- `WarsawModelTrainersHackathon/docs/evaluation-grading-datasets.md`
- `WarsawModelTrainersHackathon/docs/evaluation-datasets.md`
- `WarsawModelTrainersHackathon/docs/essay-grading-fixes-2026-09-27.md`
- `WarsawModelTrainersHackathon/docs/grading-semantics-p0-2026-09-27.md`
- `WarsawModelTrainersHackathon/gradings.schema.json`, `grading-exams.schema.json` (titles only)
- `WarsawModelTrainersHackathon/scripts/extract_gradings.py`, `grading_archive.py`, `grading_context.py`, `build_grading_datasets.py`, `build_evaluation_datasets.py`, `validate_grading_datasets.py`, `validate_evaluation_datasets.py` (headers/docstrings)
- `WarsawModelTrainersHackathon/scripts/grading-overrides.json`, `evaluation-grading-overrides.json`, `evaluation-2005-2016-boundaries.json`
- `WarsawModelTrainersHackathon/data/grading-2017-2026/README.md`, `data/evaluation-2017-2026/README.md`, `data/evaluation-2005-2016/README.md`, and one `exam.json` (history-2023-maj-matura-rozszerzona-v1)
- `WarsawModelTrainersHackathon/output/grading-key-audit/README.md`, `sample-inventory.jsonl`
- `WarsawModelTrainersHackathon/output/grading-2017-2026/validation.json`
- `WarsawModelTrainersHackathon/output/feedback/semantic-audit-2026-09-27-v1/summary.json`
- `WarsawModelTrainersHackathon/benchmark/exams_packages/history-2023-mock-v1/` (listing)
- `WarsawModelTrainersHackathon/benchmark/bench.py` (judge logic), `benchmark/models.yaml` (judge entries)
- `WarsawModelTrainersHackathon/harness/GRADING.md`, `GRADING_CONSISTENCY.md`, `GRADE_SAVED_EXAMS.md`, `grading.py`, `grading_contract.py`, `prepare_grading_packet.py`, `failure_categories.py`, `feedback_taxonomy.py`, `categorize_feedback.py`, `grading_consistency.py`, `grade_saved_exams.py` (headers/docstrings)
- `WarsawModelTrainersHackathon/src/posttrain/history_v2/SEMANTIC_REVIEW.md`
- `WarsawModelTrainersHackathon/tests/test_matura_grading.py`, `test_grading_extraction.py`, `test_grading_datasets.py`, `test_grading_consistency.py`, `test_grade_saved_exams.py`, `test_answer_review.py`, `test_history_semantics.py`, `test_evaluation_datasets.py` (headers)
- `WarsawModelTrainersHackathon/lora_experiments.md` (section "The LLM grader must be checked")
- `003B-hackaton/l40s-results/EXPERIMENTS.md` (sections "Blind grading by Claude subagents", "DeepSeek as grader: calibration against Claude", "27.09 — final pack C-v4")
- `003B-hackaton/HANDOFF_REVIEW_FABLE.md` (grader self-preference risk note)
- `git log` / `git show` on commits `cfe37663`, `6333bb34`, `53b6d29d`, `d2a9e3b5`, `b5b70364`, `26476983`, `610ed6fa`, `f3ba345a`, `f51268f9`, `eb3283bc`, `87283d60` in `WarsawModelTrainersHackathon`
