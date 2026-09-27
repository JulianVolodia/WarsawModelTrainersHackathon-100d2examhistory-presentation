export const meta = {
  name: 'hackathon-facts',
  description: 'Sonnet readers build sourced fact sheets for every area of the hackathon repo, then a coverage critic finds gaps',
  phases: [
    { title: 'Read', detail: '10 Sonnet readers, one per area, write fact sheets' },
    { title: 'Coverage', detail: 'Sonnet critic lists uncovered files/topics' },
    { title: 'Fill gaps', detail: 'Sonnet readers for anything the critic found' },
  ],
}

const HACK = '/mnt/hgfs/sharedWithKali/ai-thingy-september-26/003B-hackaton'
const REPO = HACK + '/WarsawModelTrainersHackathon'
const FACTS = '/tmp/claude-1000/-mnt-hgfs-sharedWithKali-ai-thingy-september-26-003B-hackaton/66c3b519-e096-45dd-be0b-8b6e72e830bb/scratchpad/facts'

const COMMON = `
You are a research subagent (Sonnet). Your job: build a precise, SOURCED fact sheet about one area of the
Warsaw Model Trainers Hackathon work (25–27.09.2026, team "100d2exam", task: train/fine-tune a model that solves the
Polish history matura, extended level). The fact sheet feeds a public web presentation, so every fact must be exact and
attributable.

Locations (absolute paths):
- Team repo (git, branch main): ${REPO}
- Our hackathon folder with notes, handoffs and the L40S results backup: ${HACK} (CLAUDE.md, SETUP.md, HANDOFF_*.md, l40s-results/)
- Write your fact sheet to: ${FACTS}/<area>.md  (create with Bash heredoc or the Write tool)

HARD RULES
- READ-ONLY. Never modify, create or delete anything inside ${REPO} or ${HACK}. No git commands that change state
  (no checkout/pull/stash/commit). git log / git show / git diff / git ls-files / git branch -a are fine.
- No ssh, no network, no API calls, no servers. Only local files.
- The folder is a slow VMware shared mount: do NOT run find/du over the whole tree, do NOT list output/ or data/ recursively
  (output/ alone has ~41k tracked files). Use 'git ls-files <dir> | wc -l', 'ls <dir> | head', 'wc -l file', grep with
  explicit paths. Do not read PDFs, uv.lock, or large JSON/JSONL files whole (use head/wc/jq-less grep).
- Refer to people by their git author name or handle exactly as it appears in the log (JulianVolodia, endote,
  Pawel Cyrta, Szymon Hajderek, Olaf Serafin, hiderr, ...). NEVER write anyone's email address anywhere.
  Note: "JulianVolodia" and "Volodia" are the same person (the owner of these notes); "szymon-hajderek" = "Szymon Hajderek";
  "o-serafin" = "Olaf Serafin".
- Every fact gets a source: file path (with line numbers if useful) or commit hash. Dates absolute (dd.mm.yyyy, with
  time and timezone when the source has one — commit dates are +0200 or +0000, keep what you see).
- Numbers exact as found. If two sources disagree, record both and say which is newer.
- Distinguish what was DONE (finished, verified) from what was PLANNED/IN PROGRESS/FAILED. Do not embellish.
- Write in English (the deck will be in Polish later; Polish quotes from sources may be kept as-is).

FACT SHEET FORMAT (Markdown, sections in this order):
# <area>
## Summary (10-15 lines: what this area is, what was achieved, why it matters)
## Timeline (bullet per event: date/time, what, who, source)
## Key numbers (table: label | value | source)
## Components (files, scripts, services, models, datasets — what each does, one line each, with path)
## Decisions, incidents and lessons (what went wrong, what was found out, what was changed — with sources)
## People (who did what in this area, by git author name)
## Open issues / limitations (as stated in the sources)
## Good quotes or slide-worthy details (short, sourced)
## Sources consulted (list of files/commits)

When done, return the structured output (area, path of the sheet, ≤200-word summary, key_numbers, timeline, hooks
= slide-worthy surprises/decisions, gaps = things you could not determine or did not have time to read).
`

const AREAS = [
  { key: 'git-history-team-context', prompt: `
AREA: git history, team, hackathon context.
Cover: the whole commit history of ${REPO} (135 commits on main, 25.09 21:14 → 27.09 10:46 +0200) — use
'git log --all --date=iso --pretty=format:"%h|%ad|%an|%D|%s"' and 'git shortlog -sn --all' (no emails!).
Build a per-day timeline (25.09, 26.09, 27.09) of what landed, per author; identify the streams of work (data extraction,
benchmark, harness, LoRA training on L40S, synthetic data, image tasks, ClearML tracking, team training pipelines,
submission server, RAG services, bench queue, rollbacks like 2e779446, PR merges #1–#4). List all branches (local and
remote) and what each is for (git log --all --not main; e.g. harness-tuned, qwen-lora, data/synthetic-images-b4,
oldgoodtimes, benchmark, add-history-rozszerzona-2005-2018). Count commits per author and per day. Read README.md top
(first ~60 lines), AGENTS.md, CLAUDE.md in the repo, ${HACK}/CLAUDE.md (our notes: layout, machines, rules), the mock
pack / submission format mentions (warsawmodeltrainers.dev), team name WMTH-100d2exam, the machines used (L40S on AWS,
H100/H200 hosts, the 6000 RAG host, ClearML at 81.85.1.173:18080 — only as they appear in files; do not connect).
Also note what kinds of files dominate the repo ('git ls-files | cut -d/ -f1 | sort | uniq -c | sort -rn').` },

  { key: 'data-exams-extraction', prompt: `
AREA: exam data and deterministic extraction.
Cover: ${REPO}/data (PDF exams + answer keys: how many, which years, sources cke/arkusze; folders evaluation-2005-2016,
evaluation-2017-2026, grading-2017-2026, epodreczniki*, epodreczniki.md), the crawlers (scripts/cke_crawler.py,
arkusze_crawler.py, epodreczniki_crawler.py), scripts/extract_questions.py and extract_legacy_questions.py,
output/questions.jsonl (count lines; exams count; response types), output/extraction-report.json (head),
output/exam-metadata.jsonl, task-groups.jsonl, source-graph.json (size/head only), README.md sections
"Deterministic history-exam question extraction" through "PNG audit and exhaustive source review" (schema 3.2, images,
inherited task sources), the schemas (questions.schema.json, exam-metadata.schema.json, source-graph.schema.json),
docs/evaluation-datasets.md, docs/huggingface-exam-dataset.md, docs/huggingface-exams-2005-2016.md,
scripts/package_huggingface_exams.py / publish_huggingface_exams.py / validate_huggingface_exams.py,
scripts/source_graph.py, png_review.html, review_png_extraction.py, audit_png_extraction.py, tests/test_extraction.py,
the known limitation that the parser only handles 2018–2026 layouts and the 2005–2018 PDFs from PR #1 (see
${HACK}/CLAUDE.md "Known issues"; and check whether later commits like 2413d976 "parser on matura 2005-2026" or
26476983 "matura-histoty-2005-2016" changed that — verify against the code/docs, don't guess).
Relevant commits: 7a6a41bc, d55c39d7, a045a254, f0955092, 0cd12383, 444723b5, 3215a8ca, 2413d976, 7c2355d6, 6333bb34,
cfe37663, 26476983 — use git show --stat.` },

  { key: 'benchmark', prompt: `
AREA: the LLM-as-judge benchmark.
Cover: ${REPO}/benchmark: README.md, RUNNING.md, bench.py (what it does, judge model, harness axis, --no-judge,
--grade, resume, ClearML), models.yaml (which models/entries: API ones like DeepSeek/OpenRouter, self-hosted Bielik/PLLuM,
Gemma 4 12B variants, Qwen ones, micro100d2examgpt; ports; vision entries), conf/*.yaml (what each config runs),
harnesses/ (plain, matura, matura-rag, matura-tuned + README), serve/ (serve scripts, vLLM/llama.cpp), tools/
(exams.py, merge.py, viz.py, vision_check.py), RESULTS.html (how many result columns/models, which exams, the top
scores — grep the HTML for column labels/numbers; note the "name@mode+harness" labels), results/ (list run folders,
count), exams_packages/, exams_claude_extracted/, exams_output/, run.sh, ssh-serve-bench.sh, vllm-logs (names only).
Also ${HACK}/bench-dashboard/ (README.md, server.py: what it shows). Benchmark commits by Szymon Hajderek and
JulianVolodia: 928cf6bd, 727a2164, 42babc2d, 4ef29202, 0b0f6a9e, 087eb55b, 595282ab, 8dedb8b9, 8793c323, 35a115ab,
62f7044a, 40a7d79a, b5b70364, b2f011db, a8153834, 24beec10, a064a894, 43da6220, e4f775ff, 610ed6fa, 77b153b3 — use
git show --stat and the messages. Extract the actual benchmark numbers that are in the repo (RESULTS.html, docs, commit
messages, lora_experiments.md "Findings"): which models scored what, on which exams, judge used. Also the thinking-mode
axis, the vision axis (mmproj, -ub 2048), and the finding about the Gemma grader being too lenient.` },

  { key: 'harness-submission-services', prompt: `
AREA: the submission solver (harness), the submission server, and the shared services (RAG, image search, bench queue).
Cover: ${REPO}/harness/ (README.md, matura.py — what it does: dependency-free solver of the organizers' exam JSON package,
Ollama/OpenAI-compatible transports, text+PNG, resumable runs, validation, --dry-run; grading.py, GRADING.md,
retrieval.py, feedback*.py, FEEDBACK.md, eval_scenarios.py + scenarios/, batch_eval.py, parallel_batch_eval.py,
default_eval.py, DEFAULT_EVAL.md, EXECUTIVE_SUMMARY.md, TASK_WORKFLOW.md, GRADING_CONSISTENCY.md, micro_eval.py,
prepare_grading_packet.py), ${REPO}/prompts/matura (what prompts exist), ${REPO}/submission/ (README.md, server.py,
client.py, serve.sh, test_server.py — the FastAPI :8090 server that turns an exam zip into answers.json),
${REPO}/rag_integration/RAG_USAGE.md, ${REPO}/COMMUNICATION.md (services: Wikipedia QA retrieval :8601, image→article
search :8600, LoRA bench queue :38471 — what they offer, who runs them), docs/rag-dense.md, scripts/dense_history_retrieval.py,
scripts/lora_bench_queue/ (README/docs), benchmark/harnesses/matura-rag and matura-tuned (what they add),
the harness-related commits: 93f48a49 ("pierwsze harneassy za ploty"), f3ba345a, f51268f9, eb3283bc, 87283d60, 6b6dab53
("rag"), 2e779446 (rollback of the rag commit — why? read the message and diff stat), 9ed0effa (Wikipedia retrieval
--retrieval on + matura-rag), 83895478 on branch harness-tuned (CKE scoring rules in the system prompt, essay rubric,
revision call), 314868c9 (submission server), 671fb248/7b2e85af/4647845a/d9748229/203c6d51 (lora_bench_queue),
91207b7a (RAG docs), 7737f119. Also the untracked ${REPO}/wb_tries/ (what is it — list only), and the tests
tests/test_matura_harness.py, test_matura_retries.py, test_retrieval.py, test_bench_harness.py, test_bench_matura_adapter.py
(names + what they cover, from docstrings/heads). Also the organizers' format: mock pack exams/history-2023-mock-v1.zip
(37 items, 60 points) as referenced in submission/README.md and ${HACK}/CLAUDE.md.` },

  { key: 'l40s-gemma-lora-part1', prompt: `
AREA: our Gemma 4 12B QLoRA work on the L40S server — PART 1: setup, data, first runs, evaluation method, publishing.
Cover: ${HACK}/SETUP.md, ${REPO}/SETUP_ON_L40S.md (long; read all sections, note steps 1–9 and the incidents),
${HACK}/l40s-results/README.md, ${HACK}/l40s-results/EXPERIMENTS.md sections up to and including "Incident: the
thinking-mode sampler was killed" (lines 1–108), ${REPO}/lora_experiments.md, ${REPO}/guideline_data_fix.md,
${REPO}/scripts/build_sft_data.py (head/docstring), ${REPO}/scripts/lora_pipeline_simple.py (docstring + argparse
defaults), ${REPO}/scripts/eval_gguf.py (docstring), ${HACK}/l40s-results/lora-run/run/{metrics,run_config}.json,
${HACK}/l40s-results/lora-smoke, sft/, sft-v2/, sft-v2.1/ (report.json / stats), ${HACK}/l40s-results/env/system.txt
and models.txt (hardware, model checksums), ${HACK}/l40s-results/hf-history-lora/README.md (model card),
${HACK}/l40s-results/hf_preview_README.md, ${HACK}/HANDOFF_REVIEW_FABLE.md, ${HACK}/HANDOFF_01.md section 1,
${HACK}/l40s-results/BENCHMARKS_RESEARCH.md. Commits: 25fd3908, fc335048, 4140277b, cbc30dca, c0c484e1, 64ad1a31.
Extract: server specs, the stack (torch/transformers/peft/trl/bitsandbytes/flash-attn versions and why), the base model
choice (QAT Q4_0 unquantized → NF4 QLoRA → merge/export to GGUF adapter), the data versions (v1 611/76, v2 608/111/291,
leakage fix), the first run numbers (r=32, 74 steps, 14.3 min, eval loss 1.257, VRAM), the val evaluation table
(Q4_0 GGUF, 111 tasks, 128 points: base vs LoRA vs thinking), the thinking-mode discovery in llama-server, the grader
leniency finding (Gemma judging Gemma ~11 points too lenient; Claude subagents as reference), the HF publishing
(WMTH-100d2exam/history-lora, private, versions), and the incidents (nohup job dying with ssh, sampler killed by host RAM,
venv system-site-packages problem).` },

  { key: 'l40s-gemma-lora-part2', prompt: `
AREA: our Gemma 4 12B LoRA work — PART 2: RFT, v3, DeepSeek calibration, the hyperparameter tournament, DPO, the final
pack evaluation.
Cover: ${HACK}/l40s-results/EXPERIMENTS.md from "RFT no-thinking → v3-rft" to the end (lines 109–end; read it all),
${HACK}/HANDOFF_03.md (all), ${HACK}/HANDOFF_01.md sections after 1, ${HACK}/l40s-results/lora-v2/ (README/metrics
files, rft/ contents names), lora-v3/, lora-v4/ (tournament configs/results: list files, read json/md summaries),
${HACK}/l40s-results/build_rft_train.py (docstring), ${REPO}/scripts/rft_sample.py (docstring), ${REPO}/scripts/lora_v4/
(what scripts: tournament, DPO), ${HACK}/l40s-results/claude-grading/ (README or eval_batches.py docstring; how Claude
subagents graded; counts of batches), ${HACK}/l40s-results/publish_hf.py (docstring: what it mirrors),
${HACK}/l40s-results/EVAL/2026-09-27_history-synthetic-c-v4_qwen38-27b-iq2s_s175-vs-base/README.md and grades_table.md
(the final-style pack C-v4: 37 items, 60 pts; abl-r16 step-175 42/60 vs base 35/60 by Claude; DeepSeek 43 vs 42; the
H200; the placeholder rubric.json trick), ${HACK}/l40s-results/EVAL/README_BASELINE_IMPROVEMENT_public.md (the public HF
repo WMTH-100d2exam/BASELINE_IMPROVEMENT_QWEN_3.8_Q2_S_100D2EXAMHISTORY and its "Evaluation 2"), ${HACK}/CLAUDE.md
sections "LoRA experiments", "Publishing rules", "Final pack eval". Commits: c8dca45d, f7791ea6, a2f963f4, c3900f33,
53b6d29d (DeepSeek grader calibration vs Claude, 728 items), 83e568d4 (LoRA v4 tournament + DPO), 62f7044a, 40a7d79a,
610ed6fa. Extract exact numbers: RFT sample counts (1212 no-think graded; think batches), selected train sets (v3-rft,
v3-rft-think 359 examples), val scores (v3-rft-think 44.5% vs base_think 49.2% etc. — read the actual table), the
tournament design (how many configs, which won, finalists' val scores), the DeepSeek-vs-Claude calibration numbers,
what was published to HF (versions list), and the final pack result. Clearly mark which numbers are model-graded
(Claude / DeepSeek / Gemma) since there is no official key.` },

  { key: 'synthetic-data', prompt: `
AREA: synthetic and distilled training data.
Cover: ${REPO}/data_synthetic/ (README.md, curriculum, rubric template, pilot 1914–1945 76 tasks, main set 3600 verified
tasks — count files/lines), ${REPO}/data_synthetic_extended/ (README; Wikipedia-grounded variants and new tasks:
5010 essays, 5040 closed, 5063 open; built with DeepSeek deepseek-flash; cost 22.57 USD; waves 1–3),
${REPO}/data_destillated_by_claude/ (README; Claude-graded RFT answers + guidelines, batch counts),
${REPO}/data_synthetic_images/ (Olaf Serafin's image-based CKE-style tasks: 60 → 180 → 478 total; 748 on branch
data/synthetic-images-b4; downscaled to 1024px — read README/any index, count files), Pawel Cyrta's e-podręczniki work:
${REPO}/data/epodreczniki.md, data/epodreczniki*, scripts/epodreczniki_crawler.py, build_epodreczniki_dataset.py,
epodreczniki_questions.py (+_prompt.md), epodreczniki_essays.py (+_prompt.md), rephrase_questions.py,
rephrase_qa_report.py, structure_rephrased.py, validate_rephrased.py, generate_synthetic_essays.py,
generate_planned_essays.py, generate_rubric_essays.py, curate_synthetic_essays.py, validate_synthetic_essays.py,
apply_essay_source_reviews.py, fetch_essay_evidence.py, synthetic_essay_review_findings.json (head),
docs/synthetic-essays-lora-plan.md, output/essay-generation and output/essay-evidence (ls + counts only),
${HACK}/l40s-results/synthetic/ and synthetic_extended/ (READMEs, scripts/ names, what the pipeline does: Wikipedia
dump? API? fact-check step, curriculum inventory), ${HACK}/l40s-results/wiki_ext-rft/ (what), the sync scripts
${HACK}/l40s-results/sync_synthetic.sh, sync_synthetic_extended.sh, sync_claude_data.sh (publishing rule: straight to
main, rebase-only), ${HACK}/l40s-results/claude-grading/ (how Claude grading batches worked).
Commits: 8b0f43be, b0d9c80e, ee6a39ae, cd39ed36, e8a8f601, 91d51b48, 3e558a8f, 51b1f66f, 25dc063c, 3d628baf, acfcebcf,
f0e41039…c7a2fcc1 (the "Sync Claude RFT grades" series — count them), d6c5e81e, 7be0dceb, 4b31cf5a, 097fed1a, 9fd342f1,
69e4113f, 18975717, f387c3d3, 288aa73b, e3b4e536, b2b361aa, fa828aee, 95619385, d2428a8e, 49c161f3 (231 essays, one per
topic), 26476983. Extract exact counts, generation models used (DeepSeek flash vs Claude), costs, verification steps,
and how the data was meant to be used in training.` },

  { key: 'team-training-pipelines', prompt: `
AREA: the team's other training pipelines and models (beyond our L40S Gemma LoRA).
Cover: ${REPO}/training/ (README.md, RUNBOOK.md, REPRODUCE_FOR_CLAUDE.md, launch_qwen38_lora.sh, qwen35_lora/,
serve_vllm_lora.sh, setup_env.sh, fetch.sh, relabel_synimg.py, requirements-train.lock.txt — the Qwen3.8-27B LoRA
pipeline on the IQ2_S deploy quantization; the Qwen3.5-2B overfit LoRA experiments), ${REPO}/AGENTS.md (sections
"Current history LoRA training policy (2026-09-27)", "depreciated (DO NOT USE)", tracking rule), ${REPO}/src/posttrain
(Pawel Cyrta: unsloth, nemo-rl, bielik, ministral post-training code — what is there), ${REPO}/src/lostInHistoricalTime
(what is it), ${REPO}/src/warsawmodeltrainershackathon, ${REPO}/docs/history-v2-full-run-2026-09-27.md,
history-v2-h100-smoke-2026-09-27.md, history-v2-pipeline-audit-2026-09-27.md, ${REPO}/output/history-v2-* and
output/nebius-setup and output/v6-dpo-vision-text-mock-h100-v1 (ls + any README/summary json only), the
from-scratch model: scripts/micro100d2exam.py, convert_micro100d2exam.py, validate_micro100d2exam.py,
prepare_microgpt_backend.py, validate_microgpt_backend.py, validate_microgpt_ollama.py, micro100d2exam-ollama.sh,
docs/micro100d2exam-ollama.md (Micro100d2examGPT 123M from scratch, benchmarked on :8025 — commit a064a894),
${REPO}/infra/norbert (what), ${REPO}/CLEARML.md + track.py (shared ClearML tracking: server, project HCKT, rules;
commits da2195e7, 70bfb52b, 826894c2, 62521b7d, 33a07917), tests/test_nebius_rft.py, test_posttrain_merge.py,
test_history_v2*.py (what they test), branch origin/qwen-lora (cf6d27f5), commits ed8e4fd4, eb8abedc, 05e11d36,
0ac9f463, baa2a078, 6cb40608, 7737f119, 43da6220, e4f775ff, d2a9e3b5 ("paper + codes" by endote — what paper?),
b99807e1. Also the machines mentioned in these docs (H100 hosts, H200, Nebius) — from files only.
Extract: which models were trained by whom, on what data, with what results (numbers from docs/commit messages), and
the final training policy the team converged on.` },

  { key: 'grading-and-evaluation', prompt: `
AREA: grading, answer keys, evaluation packs and how answers are judged.
Cover: ${REPO}/docs/grading-extraction.md, evaluation-grading-datasets.md, evaluation-datasets.md,
essay-grading-fixes-2026-09-27.md, grading-semantics-p0-2026-09-27.md, ${REPO}/gradings.schema.json and
grading-exams.schema.json (top-level description only), scripts/extract_gradings.py, build_grading_datasets.py,
build_evaluation_datasets.py, validate_grading_datasets.py, validate_evaluation_datasets.py, grading_archive.py,
grading_context.py, grading-overrides.json, evaluation-grading-overrides.json, evaluation-2005-2016-boundaries.json
(heads), data/grading-2017-2026 and data/evaluation-2017-2026 (ls | head, count of packs; one exam.json head),
data/evaluation-2005-2016 (count), output/grading-key-audit, output/grading-2017-2026, output/evaluation-* (ls only),
benchmark/exams_packages (mock pack), harness/GRADING.md, grading.py, GRADING_CONSISTENCY.md, grading_consistency.py,
GRADE_SAVED_EXAMS.md, grade_saved_exams.py, grading_contract.py, prepare_grading_packet.py, failure_categories.py,
feedback_taxonomy.py, categorize_feedback.py (what taxonomy of failures), tests/test_matura_grading.py,
test_grading_*.py, test_answer_review.py, test_history_semantics.py (what they check).
Also the three graders used across the project and their calibration: DeepSeek deepseek-flash as bench judge,
Gemma as (too lenient) grader, Claude subagents as reference grader, Codex/Astra grader in harness/grading.py
(see ${HACK}/l40s-results/EXPERIMENTS.md sections "Blind grading by Claude subagents" and "DeepSeek as grader:
calibration against Claude", and lora_experiments.md "The LLM grader must be checked"). Commits: cfe37663, 6333bb34,
53b6d29d, d2a9e3b5, b5b70364 and any commit touching docs/grading* (git log --oneline -- docs).
Extract: what the official grading looks like (points per item, essay rubrics), how many packs have full grading
evidence (40 packs 2017–2026, 27 papers 2005–2016 / 655 questions / 425 PNG crops), the P0 grading-semantics fixes of
27.09, and the numbers of the grader calibrations.` },

  { key: 'agentic-workflow', prompt: `
AREA: how the team worked with AI coding agents (Claude Code, Codex, subagents) during the hackathon — process, rules,
handoffs.
Cover: ${REPO}/AGENTS.md (all), ${REPO}/CLAUDE.md, ${REPO}/.claude/ (ls; any settings/commands), ${REPO}/COMMUNICATION.md
section 3.6 "Etiquette for agents", ${REPO}/training/REPRODUCE_FOR_CLAUDE.md (what it asks an agent to do),
${REPO}/harness/TASK_WORKFLOW.md, ${REPO}/notes.md, ${HACK}/CLAUDE.md (all: the rules — no env edits without asking,
rebase-only publishing, no push without ask, sync via git on the machine, ClearML tracking, DeepSeek for bulk generation,
Claude subagents as reference graders; the "grade-rft-batches"/"grade-eval-batches" workflows), ${HACK}/HANDOFF_01.md,
HANDOFF_02.md, HANDOFF_03.md, HANDOFF_REVIEW_FABLE.md (what each handoff is, which model wrote it, what a code review
handoff contained), ${REPO}/SETUP_ON_L40S.md section about "how Claude Code works with the server" (grep for Claude),
${HACK}/l40s-results/claude-grading/ (eval_batches.py docstring: prep|merge and workflow usage; count grade files),
${HACK}/.claude/ (ls), the memory index ${HACK}/../../../../../home/kali/.claude/projects/-mnt-hgfs-sharedWithKali-ai-thingy-september-26-003B-hackaton/memory/MEMORY.md
(use the absolute path /home/kali/.claude/projects/-mnt-hgfs-sharedWithKali-ai-thingy-september-26-003B-hackaton/memory/ — read MEMORY.md and each memory file; they are rules the user gave the agent).
Also grep the git log messages for "Claude", "Codex", "agent", "REPRODUCE", "for an agent" to find commits that
document agent workflows (e.g. 7737f119, 826894c2, f75ee9ae, da4611f1, c0c484e1 "add eval/RFT scripts").
Extract: the rules that emerged (and why), the division of labour between humans and agents, which models were used for
what (Claude Opus/Fable for orchestration and grading, Sonnet subagents, DeepSeek for bulk, Codex/Astra for grading),
incidents caused by agents (if any: e.g. the "rag" commit rollback, pushed secrets like ClearML keys hardcoded in
track.py — check 62521b7d and 70bfb52b messages), and the handoff practice.` },
]

const READER_SCHEMA = {
  type: 'object',
  properties: {
    area: { type: 'string' },
    path: { type: 'string' },
    summary: { type: 'string' },
    key_numbers: { type: 'array', items: { type: 'object', properties: { label: { type: 'string' }, value: { type: 'string' }, source: { type: 'string' } }, required: ['label', 'value', 'source'] } },
    timeline: { type: 'array', items: { type: 'object', properties: { when: { type: 'string' }, what: { type: 'string' }, who: { type: 'string' }, source: { type: 'string' } }, required: ['when', 'what', 'source'] } },
    hooks: { type: 'array', items: { type: 'string' } },
    gaps: { type: 'array', items: { type: 'string' } },
  },
  required: ['area', 'path', 'summary', 'key_numbers', 'timeline', 'hooks', 'gaps'],
}

phase('Read')
const sheets = (await parallel(AREAS.map(a => () =>
  agent(COMMON + `\nAREA KEY (use as file name): ${a.key}\n` + a.prompt, { label: `read:${a.key}`, phase: 'Read', model: 'sonnet', schema: READER_SCHEMA })
))).filter(Boolean)
log(`${sheets.length}/${AREAS.length} fact sheets written`)

phase('Coverage')
const COVERAGE_SCHEMA = {
  type: 'object',
  properties: {
    uncovered: { type: 'array', items: { type: 'object', properties: { what: { type: 'string' }, where: { type: 'string' }, why_it_matters: { type: 'string' } }, required: ['what', 'where', 'why_it_matters'] } },
    contradictions: { type: 'array', items: { type: 'string' } },
    verdict: { type: 'string' },
  },
  required: ['uncovered', 'contradictions', 'verdict'],
}
const coverage = await agent(`
You are a completeness critic (Sonnet). Fact sheets about the hackathon repo were written to ${FACTS}/*.md (one per area:
${AREAS.map(a => a.key).join(', ')}). Read ALL of them. Then check coverage against the repo itself, READ-ONLY (same
rules: no state-changing git commands, no ssh/network, no recursive listing of output/ or data/; the folder is a slow
shared mount): 'git -C ${REPO} log --all --oneline' (every commit should be attributable to some area — list commits
whose subject matter no sheet mentions), the top-level entries of ${REPO} and ${REPO}/docs, ${REPO}/scripts, ${REPO}/src,
${REPO}/tests, and ${HACK} (files + l40s-results/ entries). For each thing NOT covered by any sheet, say what it is, where,
and why a presentation about "everything that happened in the repo" would want it. Also list contradictions between
sheets (same fact, different numbers/dates) with both values and their sources. Do not write files. Return the
structured output; verdict = one paragraph on overall coverage quality.
`, { label: 'coverage-critic', phase: 'Coverage', model: 'sonnet', schema: COVERAGE_SCHEMA })
log(`coverage: ${coverage ? coverage.uncovered.length : '?'} uncovered items, ${coverage ? coverage.contradictions.length : '?'} contradictions`)

phase('Fill gaps')
let gapSheets = []
if (coverage && coverage.uncovered.length) {
  // group uncovered items into at most 4 gap readers
  const n = Math.min(4, coverage.uncovered.length)
  const groups = Array.from({ length: n }, () => [])
  coverage.uncovered.forEach((u, i) => groups[i % n].push(u))
  gapSheets = (await parallel(groups.map((g, i) => () =>
    agent(COMMON + `\nAREA KEY (use as file name): gaps-${i + 1}\nAREA: gap-filling. A coverage critic found these items
that no fact sheet covered. Research each one (read-only) and write ONE fact sheet ${FACTS}/gaps-${i + 1}.md with a
section per item:\n` + g.map(u => `- ${u.what} — where: ${u.where} — why: ${u.why_it_matters}`).join('\n') +
      `\nAlso resolve these contradictions if they touch your items (say which source is right and why):\n` +
      coverage.contradictions.map(c => `- ${c}`).join('\n'),
      { label: `gaps-${i + 1}`, phase: 'Fill gaps', model: 'sonnet', schema: READER_SCHEMA })
  ))).filter(Boolean)
}
log(`${gapSheets.length} gap sheets written`)

return { sheets: sheets.concat(gapSheets), coverage }