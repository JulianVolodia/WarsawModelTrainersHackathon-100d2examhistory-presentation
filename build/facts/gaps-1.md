# gaps-1 (coverage gap-filling)

Three items flagged by a coverage critic as missing or inconsistent across the other fact sheets. Repo for all
git facts below: `WarsawModelTrainersHackathon` (team repo, branch `main` checked out). All checks below were
re-run directly against the live repo in read-only mode (`git log`/`show`/`branch`/`shortlog`/`merge-base`, no
state-changing git commands).

## Summary

**Item 1 — `oldgoodtimes` branch.** An entire unmerged branch, `remotes/origin/oldgoodtimes`, has a tip commit
`89a488ad` (Szymon Hajderek + Claude Opus 5.5, 27.09.2026 11:01 +0200) that adds a fourth benchmark harness
variant, `matura-imagerag`: it wraps the existing `matura` harness and, for every exam image, calls an
image→Wikipedia-article lookup service, injecting a short "related articles" text next to the image — no extra
model call, and it fails silently back to plain `matura` behaviour if the lookup fails. The same commit also
flips the bench default from `matura` to `matura-imagerag`, adds 5 new bench configs (Gemma SFT vision r32,
three Qwen3.8-27B configs) and a new 117-line serving script for Qwen3.8-27B GGUFs. None of it is on `main`;
`benchmark/harnesses/matura-imagerag/` does not exist in the current worktree. This is directly adjacent to the
"RAG added → rolled back → re-added" story several other sheets already tell as a headline beat, so it belongs
in the same narrative even though it never shipped.

**Item 2 — history_v2 H100 smoke date.** Resolved: the event is dated **27.09.2026**, not 26.09. The commit that
lands both the `docs/` writeup and the `output/…/summary.json` (`87283d60`) is dated 27.09.2026 03:16 +0200, and
both file paths literally contain `2026-09-27`. `team-training-pipelines.md`'s Key Numbers table label "(26.09)"
is a slip; its own Timeline (and `git-history-team-context.md`'s "(history-v2, 27.09)" label) already had it right.

**Item 3 — contributor commit-count totals.** Re-running `git shortlog -sn --all` now gives the same numbers as
`agentic-workflow.md` (146 commits `--all`), not `git-history-team-context.md`'s earlier snapshot (135 commits
on `main`, HEAD `9ed0effa`). The deltas are fully accounted for: Pawel Cyrta's +7 is seven "postrain machine"
commits landed 26.09 evening through 27.09 morning; Szymon Hajderek's +1 is exactly the `oldgoodtimes` tip
`89a488ad` from Item 1. Additionally, `git-history-team-context.md`'s own "branches with commits not yet in
main" table (3 branches, no `oldgoodtimes`) was **not** an error at the time it was written — at its snapshot
(HEAD `9ed0effa`, 10:46 +0200) `oldgoodtimes`'s tip was still `da90d0d4`, already an ancestor of `main`, so it
had zero unique commits to list; `89a488ad` landed only ~15 minutes later, after that sheet's snapshot.

## Timeline

- **27.09.2026 03:16 +0200** — endote, commit `87283d60` "commit eb3283bc fix": adds `docs/history-v2-h100-smoke-2026-09-27.md` (68 lines) **and** `output/history-v2-h100-smoke-2026-09-27/summary.json` (36 lines) in the same commit. (Item 2; source: `git show -s --format='%ad' 87283d60`, `git show --stat 87283d60`.)
- **27.09.2026 03:18 +0200** — endote, commit `da90d0d4` "Merge origin/main benchmark configurations": this is `oldgoodtimes`'s branch-off point from `main` (`git merge-base origin/main origin/oldgoodtimes`); it is already an ancestor of current `main` HEAD.
- **27.09.2026 06:18 +0000** (≈08:18 +0200) — hiderr, commit `91207b7a` "Add Wikipedia RAG + image search service docs for harness integration": adds `COMMUNICATION.md` documenting the two RAG services (`:8600` image→article, `:8601` Wikipedia QA) that `matura-imagerag` later calls. On `main`/`harness-new-wb`/`harness-tuned`, but **not** an ancestor of `89a488ad` (`git merge-base --is-ancestor 91207b7a 89a488ad` → no) — `oldgoodtimes` branched off before this commit existed on its line, so the harness hardcodes the same URLs via env-var defaults instead of referencing the doc.
- **27.09.2026 10:46 +0200** — JulianVolodia, commit `9ed0effa` "harness: Wikipedia retrieval (--retrieval on) + matura-rag bench harness": this is the HEAD `git-history-team-context.md` was snapshotted at (135 commits on `main`). Confirmed **not** an ancestor of `89a488ad`.
- **27.09.2026 11:01:04 +0200** — Szymon Hajderek (co-authored Claude Opus 5.5), commit `89a488ad` "bench: matura-imagerag default harness, gemma SFT vision r32 and Qwen3.8 configs", on `remotes/origin/oldgoodtimes` only. ~15 minutes after `9ed0effa`. Never merged into `main`. (Item 1.)
- **26.09.2026 21:10–22:24 and 27.09.2026 09:42–09:58** — Pawel Cyrta, 7 commits titled "postrain …" (`eb8abedc`, `05e11d36`, `0ac9f463`, `baa2a078`, `16af30c9`, `7b501fdd`, `606ee08a`): the +7 behind the shortlog discrepancy in Item 3, all landed after `git-history-team-context.md`'s `9ed0effa` snapshot.
- **27.09.2026 10:01 +0000** (≈12:01 +0200) — Pawel Cyrta, commit `6d8d52d7` "Merge branch 'main' of https://github.com/Endote/WarsawModelTrainersHackathon": current `main` HEAD at research time (142 commits reachable from `main`; 146 across `--all`).

## Key numbers

| Label | Value | Source |
|---|---|---|
| `oldgoodtimes` tip commit | `89a488ad`, Szymon Hajderek, 27.09.2026 11:01:04 +0200 | `git show -s 89a488ad` |
| `oldgoodtimes` vs current `main` unique commits | 1 (`89a488ad` only) | `git log origin/main..origin/oldgoodtimes` |
| Is `89a488ad` an ancestor of `main` HEAD? | No | `git merge-base --is-ancestor 89a488ad HEAD` |
| Branches containing `89a488ad` | 1: `remotes/origin/oldgoodtimes` only | `git branch -a --contains 89a488ad` |
| `matura-imagerag/harness.py` size | 103 lines | `git show 89a488ad:benchmark/harnesses/matura-imagerag/harness.py \| wc -l` |
| Commit `89a488ad` diffstat | 13 files changed, 322 insertions(+), 6 deletions(-) | `git show --stat 89a488ad` |
| New bench configs in `89a488ad` | 5 (`gemma-4-12b-sft-r32-2021-2023.yaml`, `gemma-4-12b-sft-vision-r32-2021-2026.yaml`, `gemma-4-12b-sft-vision-r32-2026cz.yaml`, `qwen3.8-27b-gsq-iq2xs.yaml`, `qwen3.8-27b-ud-iq2s.yaml`, `qwen38-lora-all21-step376.yaml` — actually 6, see note below) | `git show --stat 89a488ad` |
| `serve_qwen38_gguf.sh` size | 117 lines (new file) | diffstat + file header |
| History_v2 H100 smoke — correct date | **27.09.2026** (not 26.09) | commit `87283d60`; filenames `*-2026-09-27` |
| History_v2 H100 smoke — training loss | 2.5651969373226167 (≈2.5652) | `output/history-v2-h100-smoke-2026-09-27/summary.json` |
| History_v2 H100 smoke — peak VRAM | 32.0800142288208 GiB (≈32.08) | same `summary.json` |
| History_v2 H100 smoke — trainable params | 65,568,768 (decoder projections only) | `docs/history-v2-h100-smoke-2026-09-27.md` line 15 and same `summary.json` field |
| Current `main` HEAD commit count | 142 | `git rev-list --count HEAD` |
| `git shortlog -sn --all` total commits | 146 | `git shortlog -sn --all` |
| Contributor totals, re-run now | JulianVolodia 43, Pawel Cyrta 30, endote 26, Szymon Hajderek 22, hiderr 8, szymon-hajderek 7, Olaf Serafin 6, Volodia 2, o-serafin 2 | `git shortlog -sn --all` (matches `agentic-workflow.md`, not `git-history-team-context.md`'s snapshot) |
| Pawel Cyrta at `git-history-team-context.md`'s snapshot (HEAD `9ed0effa`) | 23 | that sheet, cross-checked here |
| Szymon Hajderek at that snapshot | 21 | that sheet, cross-checked here |

Note on the config count: the commit's diffstat lists 6 new `conf/*.yaml` files (`gemma-4-12b-sft-r32-2021-2023.yaml`,
`gemma-4-12b-sft-vision-r32-2021-2026.yaml`, `gemma-4-12b-sft-vision-r32-2026cz.yaml`, `qwen3.8-27b-gsq-iq2xs.yaml`,
`qwen3.8-27b-ud-iq2s.yaml`, `qwen38-lora-all21-step376.yaml`); the gap-analysis brief that generated this research
task said "five", but direct inspection of the diffstat and each file's content (all six shown below) counts six.
Recorded here as found — flag rather than silently match the brief's number.

## Components

- `benchmark/harnesses/matura-imagerag/harness.py` (103 lines, commit `89a488ad`, unmerged) — wraps `../matura/harness.py` (imported unchanged via `importlib`); for each exam image, POSTs a multipart request to `IMAGERAG_URL` (default `http://81.85.1.173:8600`) `/search?k=3`; on a `verified match`/`unverified match` with articles, fetches leads from `WIKIRAG_URL` (default `:8601`) `/sources` (≤400 chars each) and builds a Polish "Powiązane pliki (polska Wikipedia; …)" block listing article titles + optional caption + lead excerpt, inserted as a text part right after the matching image (or appended to the prompt text if the model has no vision). Delegates `check_exam` to the `matura` harness unchanged. `VISION = "optional"`. Raises `ValueError` for `backend: ollama` (openai-compatible transport only). Own `VERSION` = base's version + a hash of its own file bytes.
- `benchmark/harnesses/__init__.py` (same commit) — `DEFAULT` changed from `"matura"` to `"matura-imagerag"`. Since the commit never merged, the actual `main` default remains `matura`.
- `benchmark/harnesses/README.md`, `benchmark/README.md`, `benchmark/RUNNING.md` (same commit) — doc updates: new comparison-table row for `matura-imagerag` ("default" for new runs, service URLs, "no extra model calls", up to 3 articles/image), tree diagram entry, and an example run line for the vision-SFT config.
- `benchmark/conf/gemma-4-12b-sft-r32-2021-2023.yaml` — Gemma 4 12B Q4 (llama.cpp) + text-SFT LoRA r32 (`WMTH-100d2exam/gemma-4-12B-it-qat-matura-history-sft-lora-r32`) vs base, `matura` harness, May 2021 + May 2023 extended papers (both in the LoRA's training holdout).
- `benchmark/conf/gemma-4-12b-sft-vision-r32-2021-2026.yaml` — Gemma 4 12B Q4 + vision-SFT QLoRA r32, `matura` harness, all 25 packs from 2021–2026; comment flags that only May papers/June 2020/the 2023 mock are held out, so the rest are "likely contaminated". Server: `89.169.123.44:8028`.
- `benchmark/conf/gemma-4-12b-sft-vision-r32-2026cz.yaml` — same vision LoRA (step 455) on the June 2026 extended paper only; explicitly NOT in the holdout, "score is likely contaminated".
- `benchmark/conf/qwen3.8-27b-gsq-iq2xs.yaml` — Qwen3.8-27B GSQ-RCO IQ2_XS GGUF (ISTA-DASLab), images, thinking on, last 5 years (2022–2026, 22 packs).
- `benchmark/conf/qwen3.8-27b-ud-iq2s.yaml` — comment literally reads "THE FINAL-SUBMISSION MODEL": Qwen3.8-27B unsloth `UD-IQ2_S` GGUF + mmproj, images, thinking on, through the submission solver's own pipeline (temperature 1.0, max 16384 tokens, retries), last 5 years (22 packs, 791 questions).
- `benchmark/conf/qwen38-lora-all21-step376.yaml` — Qwen3.8-27B LoRA "all21" step-376 (ClearML `HCKT/qwen38-lora`, run `~/runs/qwen38-lora/v1`, r=32 α=64 lr=1e-4, holds out 2021+2023) vs the base on the same GGUF server, May 2021 + May 2023 extended.
- `benchmark/serve/serve_qwen38_gguf.sh` (117 lines, new) — llama-server launcher for Qwen3.8-27B GGUFs with vision projector; `gsq` variant (ISTA-DASLab GSQ-RCO IQ2_XS, 2.50 bpw, 8.4 GB, port 8029, 8 slots) and `ud-iq2s` variant (unsloth UD-IQ2_S + mmproj-F16, sha256-checked, port 8031, described as "exactly the model and server of the submission validation run"). `LORA=` env var loads a PEFT LoRA converted to GGUF, served on its own port 8032 (`qwen38-iq2s-lora` on / `qwen38-iq2s-lora-off` base, for on-GPU A/B).
- `benchmark/models.yaml` (same commit) — adds `gemma-4-12b-q4-sft-vision-r32` model entry, `base_url: http://89.169.123.44:8028/v1`, `vision: true`.
- `docs/history-v2-h100-smoke-2026-09-27.md` + `output/history-v2-h100-smoke-2026-09-27/summary.json` (commit `87283d60`, endote, 27.09.2026 03:16 +0200) — H100 LoRA technical-smoke test report + machine-readable results for the `history_v2` post-training pipeline (see Item 2).
- `COMMUNICATION.md` (commit `91207b7a`, hiderr, 27.09.2026 06:18 +0000) — documents the two RAG services `matura-imagerag` depends on (`:8600` image→article search, `:8601` Wikipedia QA retrieval, both on `81.85.1.173`) and the separate LoRA bench queue on `89.169.123.44:38471`. Not in `oldgoodtimes`'s own commit history.

## Decisions, incidents and lessons

- **The `matura-imagerag` harness never merged and isn't the repo's actual default.** `main`'s `benchmark/harnesses/__init__.py` still has `DEFAULT = "matura"`; the flip to `"matura-imagerag"` exists only on `remotes/origin/oldgoodtimes`. Anyone reading `benchmark/RUNNING.md`/`README.md` on that branch would be told the wrong default for the checked-out repo — a live inconsistency, not just a historical one, since the branch is still sitting there unmerged as of this research (27.09.2026, task time).
- **Design choice for graceful degradation.** The harness is written so a down or slow RAG service degrades to exactly `matura`'s behaviour (empty `related` dict ⇒ `build()` returns `base.build()`'s messages unchanged) rather than erroring the whole exam attempt — the same fail-open pattern used elsewhere in the project for the vision pipeline (per `RUNNING.md`'s "Images on llama.cpp" section referenced in `003B-hackaton/CLAUDE.md`).
- **`git-history-team-context.md`'s 3-branch "not yet in main" table was correct at its own snapshot, not stale/wrong.** At HEAD `9ed0effa` (27.09.2026 10:46 +0200), `oldgoodtimes`'s only commit (`da90d0d4`) was already an ancestor of `main`, so it had 0 unique commits and correctly did not appear in that table. `89a488ad` landed ~15 minutes later. Lesson for the deck: git-derived "as of now" tables in a fast-moving hackathon repo go stale within minutes; cite the snapshot HEAD hash next to any such table, as `git-history-team-context.md` did (it names `9ed0effa`), so later readers can tell what changed since.
- **Contributor-count leaderboards must cite a HEAD.** The same mechanism explains Item 3: two sheets built from `git shortlog -sn --all` at two different moments give two different, both-correct-for-their-moment leaderboards. `003B-hackaton/CLAUDE.md` itself gives no shortlog at all, so a presentation slide sourced from there alone would have no numbers to be wrong — the risk is specifically in picking the older sheet's numbers over the newer one's.
- **A fourth, real harness variant that speaks to the RAG arc.** `oldgoodtimes` shows the Wikipedia-image-RAG idea was still being actively extended into the benchmark harness itself (not just the training-data or serving side) right up to close to the end of the event (11:01 +0200 on 27.09, the last day), on a branch that ultimately wasn't brought in.

## People

- **Szymon Hajderek** (co-authored with Claude Opus 5.5) — sole author of `oldgoodtimes`'s tip `89a488ad`: the `matura-imagerag` harness, the default-harness flip, the 6 new bench configs, and `serve_qwen38_gguf.sh`. 22 total commits reachable from any ref as of this research (was 21 at `git-history-team-context.md`'s earlier snapshot); also appears separately as `szymon-hajderek` (7 commits, same person per `003B-hackaton/CLAUDE.md`'s naming note).
- **hiderr** — authored `COMMUNICATION.md` (commit `91207b7a`), documenting the two RAG services that `matura-imagerag` calls, on a different branch lineage than `oldgoodtimes`.
- **endote** — authored `87283d60`, which lands both the `history_v2` H100 smoke doc and its `summary.json` together on 27.09.2026 03:16 +0200 (resolves Item 2's date).
- **JulianVolodia** — authored `9ed0effa` (27.09.2026 10:46 +0200), the HEAD `git-history-team-context.md` was snapshotted at; 43 total commits currently (unchanged across both snapshots, i.e. not implicated in the Item 3 discrepancy).
- **Pawel Cyrta** — authored the 7 "postrain machine …" commits (26.09 evening through 27.09 morning) that account for the +7 in Item 3's contributor-count discrepancy; 30 total commits currently (was 23 at the earlier snapshot).

## Open issues / limitations

- No evidence was found (in git history, docs, or `l40s-results/`) of any bench run actually being executed with the `matura-imagerag` harness — the branch adds the code and configs but this research found no run output, ClearML task, or results file referencing it. Could not confirm whether it was ever exercised even once.
- Could not determine from the repo alone why `89a488ad` was pushed to a side branch (`oldgoodtimes`) rather than opened as a PR against `main`, or whether one was intended; no GitHub PR/issue access was available under this task's read-only, no-network constraints.
- The "0.5453%" trainable-parameter-percentage figure that other sheets attribute to the `history_v2` H100 smoke test does not appear verbatim in either `docs/history-v2-h100-smoke-2026-09-27.md` or `output/history-v2-h100-smoke-2026-09-27/summary.json` — only the raw count (65,568,768) does. It was not independently re-derived here (would require the base model's total parameter count, out of scope for this gap item).
- The gap-analysis brief for Item 1 said the commit adds "five new bench configs"; direct inspection counts six `conf/*.yaml` files in the diffstat (listed under Components). Recorded as found rather than silently reconciled.

## Good quotes or slide-worthy details

- Harness docstring, on the fail-open design: *"A failed lookup (timeout, service down) means no related articles for that image, never an error answer."* (`benchmark/harnesses/matura-imagerag/harness.py`, commit `89a488ad`)
- The updated harness comparison table's one-line summary of the idea: *"only `verified match` / `unverified match` hits, up to 3 articles per image; a failed lookup injects nothing. No extra model calls."* (`benchmark/harnesses/README.md` diff, same commit)
- A config comment inside this same never-merged branch flatly calls one entry *"THE FINAL-SUBMISSION MODEL"* (`benchmark/conf/qwen3.8-27b-ud-iq2s.yaml`) — worth a fact-check against whatever the team's actual final submission turned out to be before using this line on a slide, precisely because the branch it lives on never merged.
- `git-history-team-context.md` itself already commits to a snapshot HEAD (`9ed0effa`) in its analysis — the reason its branch table and shortlog read differently from later sheets is fully explained by that stamped moment, not by a mistake.

## Sources consulted

- `git show -s --format='%h %an %ad %s' --date=format:'%d.%m.%Y %H:%M %z' 89a488ad` / `da90d0d4` / `91207b7a` / `9ed0effa` / `87283d60` / `HEAD`
- `git show --stat 89a488ad`; `git show 89a488ad:benchmark/harnesses/matura-imagerag/harness.py` (full file, 103 lines); `git show 89a488ad -- benchmark/harnesses/README.md benchmark/harnesses/__init__.py benchmark/README.md benchmark/RUNNING.md benchmark/models.yaml` (diffs); `git show 89a488ad:<each new conf/*.yaml>`; `git show 89a488ad:benchmark/serve/serve_qwen38_gguf.sh` (head)
- `git merge-base --is-ancestor 89a488ad HEAD`; `git merge-base --is-ancestor 91207b7a 89a488ad`; `git merge-base --is-ancestor 9ed0effa 89a488ad`; `git merge-base --is-ancestor da90d0d4 HEAD`; `git merge-base origin/main origin/oldgoodtimes`
- `git branch -a --contains 89a488ad`; `git branch -a`
- `git log --oneline origin/main..origin/oldgoodtimes`; `git log --all --oneline -- '*matura-imagerag*'`; `git log --all --author="Pawel Cyrta" --oneline` (grep "postrain")
- `git rev-list --count HEAD`; `git rev-list --count origin/oldgoodtimes`; `git shortlog -sn --all`
- `output/history-v2-h100-smoke-2026-09-27/summary.json`; `docs/history-v2-h100-smoke-2026-09-27.md`
- `COMMUNICATION.md` (lines 1–20)
- Cross-checked against this project's own earlier fact sheets: `WarsawModelTrainersHackathon-100d2examhistory-presentation/build/facts/git-history-team-context.md` (lines 114, 142, 158, 171–172, 287, 302, 310–312) — read for cross-reference only, not modified.
